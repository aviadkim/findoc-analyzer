"""
Utility script to run the RAG system on a PDF file.
"""
import os
import sys
import argparse
import json
from pathlib import Path

# Add the parent directory to the path so we can import the backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from DevDocs.backend.enhanced_processing.agents.rag_agent import RAGAgent
    from DevDocs.backend.agents.isin_extractor_agent import ISINExtractorAgent
    from DevDocs.backend.document_processor import DocumentProcessor
    rag_available = True
except ImportError:
    print("Warning: RAG components not available. Script will exit.")
    rag_available = False

def run_rag_system(pdf_file, output_dir=None, openai_api_key=None, google_api_key=None):
    """Run the RAG system on a PDF file."""
    if not rag_available:
        print("RAG components not available. Script will exit.")
        return False
    
    print(f"\n=== Processing {pdf_file} with RAG System ===")
    
    # Check if PDF file exists
    if not os.path.exists(pdf_file):
        print(f"Error: PDF file '{pdf_file}' not found.")
        return False
    
    # Create output directory
    if not output_dir:
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rag_output')
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Initialize components
    document_processor = DocumentProcessor(upload_dir=output_dir)
    isin_extractor_agent = ISINExtractorAgent()
    
    # Initialize RAG agent
    rag_config = {
        "model": "gpt-4-vision-preview" if openai_api_key else "gemini-1.5-pro-vision",
        "max_tokens": 4096,
        "temperature": 0.2
    }
    rag_agent = RAGAgent(openai_api_key=openai_api_key, google_api_key=google_api_key, rag_config=rag_config)
    
    # Process the document with OCR
    print("\nExtracting text from PDF...")
    ocr_results = document_processor.process_document(pdf_file, "PDF", {"extract_text": True})
    
    # Extract ISINs
    print("\nExtracting ISINs...")
    financial_results = {
        "financial_data": {
            "securities": [],
            "total_value": 0,
            "currency": "USD",
            "asset_allocation": {},
            "metrics": {}
        }
    }
    
    if ocr_results.get("text"):
        isin_task = {
            "text": ocr_results["text"],
            "validate": True,
            "include_metadata": True
        }
        isin_results = isin_extractor_agent.process(isin_task)
        
        if isin_results.get("status") == "success" and isin_results.get("isins"):
            print(f"Found {len(isin_results['isins'])} ISINs:")
            for isin in isin_results["isins"]:
                print(f"- {isin['isin']}")
            
            # Add ISINs to financial results
            financial_results["financial_data"]["securities"] = [
                {
                    "name": f"Security {isin['isin']}",
                    "identifier": isin['isin'],
                    "quantity": 0,
                    "value": 0
                } for isin in isin_results["isins"]
            ]
    
    # Process with RAG
    print("\nProcessing with RAG...")
    rag_results = rag_agent.process(ocr_results, financial_results, pdf_file, output_dir)
    
    # Print results
    print("\n=== RAG Processing Results ===")
    print(f"Document Type: {rag_results['validated_data'].get('document_type', 'unknown')}")
    print(f"Total Value: {rag_results['validated_data'].get('total_value', 0)} {rag_results['validated_data'].get('currency', 'USD')}")
    print(f"Securities Count: {len(rag_results['validated_data'].get('securities', []))}")
    print(f"Asset Allocation: {json.dumps(rag_results['validated_data'].get('asset_allocation', {}), indent=2)}")
    print(f"Has Financial Statements: {len(rag_results['validated_data'].get('financial_statements', [])) > 0}")
    
    # Save results to file
    results_file = os.path.join(output_dir, "rag_results.json")
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(rag_results["validated_data"], f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to: {results_file}")
    
    # Interactive query mode
    print("\n=== Interactive Query Mode ===")
    print("Enter your questions about the document (or 'exit' to quit):")
    
    while True:
        query = input("\nQuestion: ")
        if query.lower() in ["exit", "quit", "q"]:
            break
        
        # Get image paths
        rag_dir = os.path.join(output_dir, "rag")
        image_paths = [os.path.join(rag_dir, f) for f in os.listdir(rag_dir) if f.endswith(".jpg")]
        
        # Prepare prompt
        prompt = f"""
        You are a financial document analysis expert. I need you to answer a question about a financial document.
        
        The document has been analyzed and the following information has been extracted:
        - Document type: {rag_results['validated_data'].get('document_type', 'unknown')}
        - Total value: {rag_results['validated_data'].get('total_value', 0)} {rag_results['validated_data'].get('currency', 'USD')}
        - Number of securities: {len(rag_results['validated_data'].get('securities', []))}
        - Asset allocation: {json.dumps(rag_results['validated_data'].get('asset_allocation', {}))}
        
        The user's question is: {query}
        
        Please analyze the document and answer the question as accurately as possible.
        If you cannot find the answer in the document, please say so.
        """
        
        try:
            # Call RAG API
            print("\nProcessing query...")
            response = rag_agent._call_vision_api(prompt, image_paths)
            print("\nAnswer:")
            print(response)
        except Exception as e:
            print(f"\nError processing query: {e}")
    
    print("\nRAG system processing completed.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the RAG system on a PDF file")
    parser.add_argument("pdf_file", help="Path to the PDF file to process")
    parser.add_argument("--output", help="Output directory for results")
    parser.add_argument("--openai-key", help="OpenAI API key")
    parser.add_argument("--google-key", help="Google API key")
    args = parser.parse_args()
    
    # Get API keys from environment variables if not provided
    openai_api_key = args.openai_key or os.environ.get("OPENAI_API_KEY")
    google_api_key = args.google_key or os.environ.get("GOOGLE_API_KEY")
    
    if not openai_api_key and not google_api_key:
        print("Warning: Neither OpenAI nor Google API key provided. RAG features will be limited.")
    
    run_rag_system(args.pdf_file, args.output, openai_api_key, google_api_key)
