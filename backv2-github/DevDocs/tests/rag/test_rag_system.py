"""
Test script for the RAG system.
"""
import os
import sys
import argparse
import json
import requests
from pathlib import Path

# Add the parent directory to the path so we can import the backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

try:
    from DevDocs.backend.enhanced_processing.agents.rag_agent import RAGAgent
    from DevDocs.backend.agents.isin_extractor_agent import ISINExtractorAgent
    rag_available = True
except ImportError:
    print("Warning: RAG components not available. Tests will be skipped.")
    rag_available = False

def test_rag_system(pdf_file=None, api_url="http://localhost:24125"):
    """Test the RAG system."""
    if not rag_available:
        print("RAG components not available. Tests will be skipped.")
        return False
    
    print("\n=== Testing RAG System ===")
    
    # Check if PDF file exists
    if pdf_file and not os.path.exists(pdf_file):
        print(f"Error: PDF file '{pdf_file}' not found.")
        return False
    
    # If no PDF file provided, use a sample file
    if not pdf_file:
        # Look for sample files in the test directory
        test_dir = os.path.dirname(os.path.abspath(__file__))
        sample_files = list(Path(test_dir).glob("*.pdf"))
        
        if not sample_files:
            print("No sample PDF files found in the test directory.")
            return False
        
        pdf_file = str(sample_files[0])
        print(f"Using sample PDF file: {pdf_file}")
    
    # Test local RAG agent
    print("\nTesting local RAG agent...")
    
    # Create RAG agent
    rag_agent = RAGAgent()
    isin_extractor_agent = ISINExtractorAgent()
    
    # Test ISIN extraction
    print("\nTesting ISIN extraction...")
    with open(pdf_file, 'rb') as f:
        pdf_content = f.read()
    
    # Extract text from PDF (simplified for testing)
    text = "This is a sample text with ISINs: US0378331005, US5949181045, US88160R1014"
    
    # Extract ISINs
    isin_task = {
        "text": text,
        "validate": True,
        "include_metadata": True
    }
    isin_results = isin_extractor_agent.process(isin_task)
    
    if isin_results.get("status") == "success":
        print(f"Extracted {isin_results.get('count', 0)} ISINs:")
        for isin in isin_results.get("isins", []):
            print(f"- {isin.get('isin')}: {isin.get('is_valid')}")
    else:
        print("ISIN extraction failed.")
    
    # Test API endpoints
    print("\nTesting API endpoints...")
    
    # Test health endpoint
    try:
        response = requests.get(f"{api_url}/api/health")
        if response.status_code == 200:
            print("Health endpoint: OK")
        else:
            print(f"Health endpoint error: {response.status_code}")
    except Exception as e:
        print(f"Error connecting to API: {e}")
        return False
    
    # Test RAG process endpoint
    print("\nTesting RAG process endpoint...")
    try:
        with open(pdf_file, 'rb') as f:
            files = {'file': (os.path.basename(pdf_file), f, 'application/pdf')}
            response = requests.post(f"{api_url}/api/rag/process", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("RAG process endpoint: OK")
            print(f"Document ID: {result.get('document_id')}")
            print(f"Document Type: {result.get('results', {}).get('document_type')}")
            
            # Test query endpoint
            document_id = result.get('document_id')
            if document_id:
                print("\nTesting RAG query endpoint...")
                query_data = {
                    "document_id": document_id,
                    "query": "What is the total value of the portfolio?"
                }
                
                query_response = requests.post(f"{api_url}/api/rag/query", json=query_data)
                
                if query_response.status_code == 200:
                    query_result = query_response.json()
                    print("RAG query endpoint: OK")
                    print(f"Query: {query_data['query']}")
                    print(f"Answer: {query_result.get('answer')[:100]}...")
                else:
                    print(f"RAG query endpoint error: {query_response.status_code}")
                    print(query_response.text)
        else:
            print(f"RAG process endpoint error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error testing RAG endpoints: {e}")
    
    print("\nRAG system tests completed.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the RAG system")
    parser.add_argument("--pdf", help="Path to a PDF file to test")
    parser.add_argument("--api", help="API URL", default="http://localhost:24125")
    args = parser.parse_args()
    
    test_rag_system(args.pdf, args.api)
