"""
Test script to directly use the SimpleRAGAgent.
"""
import os
import sys
import json
from PIL import Image

# Add the parent directory to the path so we can import the backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the SimpleRAGAgent
from backend.simple_rag_agent import SimpleRAGAgent

def test_rag_direct(pdf_path, output_dir=None, openai_api_key=None, google_api_key=None):
    """Test the SimpleRAGAgent directly."""
    print(f"\n=== Processing {pdf_path} with SimpleRAGAgent ===")

    # Check if PDF file exists
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file '{pdf_path}' not found.")
        return False

    # Create output directory
    if not output_dir:
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rag_output')

    os.makedirs(output_dir, exist_ok=True)

    # Initialize RAG agent
    rag_config = {
        "model": "gpt-4-vision-preview" if openai_api_key else "gemini-1.5-pro-vision",
        "max_tokens": 4096,
        "temperature": 0.2
    }
    rag_agent = SimpleRAGAgent(openai_api_key=openai_api_key, google_api_key=google_api_key, rag_config=rag_config)

    # Convert PDF to images
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(pdf_path, dpi=150)
    except Exception as e:
        print(f"Error converting PDF to images: {e}")
        try:
            import fitz
            doc = fitz.open(pdf_path)
            images = []
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                images.append(img)
        except Exception as e2:
            print(f"Error converting PDF to images with PyMuPDF: {e2}")
            return False

    # Save images
    image_paths = []
    for i, image in enumerate(images):
        image_path = os.path.join(output_dir, f"page_{i+1}.jpg")
        image.save(image_path, "JPEG")
        image_paths.append(image_path)

    # Extract text from PDF
    try:
        import fitz
        doc = fitz.open(pdf_path)
        text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        text = ""

    # Create OCR results
    ocr_results = {
        "text": text,
        "pages": len(images)
    }

    # Create financial results
    financial_results = {
        "financial_data": {
            "securities": [],
            "total_value": 0,
            "currency": "USD",
            "asset_allocation": {},
            "metrics": {}
        }
    }

    # Process with RAG
    print("\nProcessing with RAG...")
    rag_results = rag_agent.process(ocr_results, financial_results, pdf_path, output_dir)

    # Print results
    print("\n=== RAG Processing Results ===")
    print(f"Document Type: {rag_results['validated_data'].get('document_type', 'unknown')}")
    print(f"Total Value: {rag_results['validated_data'].get('total_value', 0)} {rag_results['validated_data'].get('currency', 'USD')}")
    print(f"Securities Count: {len(rag_results['validated_data'].get('securities', []))}")
    print(f"Asset Allocation: {json.dumps(rag_results['validated_data'].get('asset_allocation', {}), indent=2)}")

    # Print ISINs
    isins = rag_results['validated_data'].get('isins', [])
    print(f"\nISINs Found: {len(isins)}")
    if isins:
        print("ISINs:")
        for i, isin in enumerate(isins):
            print(f"  {i+1}. {isin}")
    else:
        print("No ISINs found.")


    # Save results to file
    results_file = os.path.join(output_dir, "rag_results.json")
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(rag_results["validated_data"], f, indent=2, ensure_ascii=False)

    print(f"\nResults saved to: {results_file}")

    return True

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Test the SimpleRAGAgent directly")
    parser.add_argument("pdf_path", help="Path to the PDF file to process")
    parser.add_argument("--output", help="Output directory for results")
    parser.add_argument("--openai-key", help="OpenAI API key")
    parser.add_argument("--google-key", help="Google API key")
    args = parser.parse_args()

    # Get API keys from environment variables if not provided
    openai_api_key = args.openai_key or os.environ.get("OPENAI_API_KEY")
    google_api_key = args.google_key or os.environ.get("GOOGLE_API_KEY")

    if not openai_api_key and not google_api_key:
        print("Warning: Neither OpenAI nor Google API key provided. RAG features will be limited.")

    test_rag_direct(args.pdf_path, args.output, openai_api_key, google_api_key)
