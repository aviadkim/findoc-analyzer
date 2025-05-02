"""
Simple test script for the RAG system.
"""
import os
import sys
import argparse
import requests
from pathlib import Path

# Add the parent directory to the path so we can import the backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

def test_rag_api(pdf_file=None, api_url="http://localhost:24125"):
    """Test the RAG API."""
    print("\n=== Testing RAG API ===")
    
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
    
    # Test health endpoint
    try:
        response = requests.get(f"{api_url}/api/health")
        if response.status_code == 200:
            print("Health endpoint: OK")
        else:
            print(f"Health endpoint error: {response.status_code}")
            return False
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
            print(f"Total Value: {result.get('results', {}).get('total_value')} {result.get('results', {}).get('currency')}")
            print(f"Securities Count: {result.get('results', {}).get('securities_count')}")
            
            # Test document endpoint
            document_id = result.get('document_id')
            if document_id:
                print("\nTesting RAG document endpoint...")
                doc_response = requests.get(f"{api_url}/api/rag/document/{document_id}")
                
                if doc_response.status_code == 200:
                    doc_result = doc_response.json()
                    print("RAG document endpoint: OK")
                    print(f"Document data retrieved successfully")
                else:
                    print(f"RAG document endpoint error: {doc_response.status_code}")
                    print(doc_response.text)
        else:
            print(f"RAG process endpoint error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error testing RAG endpoints: {e}")
    
    print("\nRAG API tests completed.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the RAG API")
    parser.add_argument("--pdf", help="Path to a PDF file to test")
    parser.add_argument("--api", help="API URL", default="http://localhost:24125")
    args = parser.parse_args()
    
    test_rag_api(args.pdf, args.api)
