"""
Simple script to run the RAG system on a PDF file.
"""
import os
import sys
import argparse
import requests
import json
from pathlib import Path

def run_rag_system(pdf_file, api_url="http://localhost:24125"):
    """Run the RAG system on a PDF file."""
    print(f"\n=== Processing {pdf_file} with RAG System ===")
    
    # Check if PDF file exists
    if not os.path.exists(pdf_file):
        print(f"Error: PDF file '{pdf_file}' not found.")
        return False
    
    # Test health endpoint
    try:
        response = requests.get(f"{api_url}/api/health")
        if response.status_code == 200:
            print("API connection: OK")
        else:
            print(f"API connection error: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error connecting to API: {e}")
        return False
    
    # Process the document with RAG
    print("\nProcessing document with RAG...")
    try:
        with open(pdf_file, 'rb') as f:
            files = {'file': (os.path.basename(pdf_file), f, 'application/pdf')}
            response = requests.post(f"{api_url}/api/rag/process", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("\n=== RAG Processing Results ===")
            print(f"Document ID: {result.get('document_id')}")
            print(f"Document Type: {result.get('results', {}).get('document_type')}")
            print(f"Total Value: {result.get('results', {}).get('total_value')} {result.get('results', {}).get('currency')}")
            print(f"Securities Count: {result.get('results', {}).get('securities_count')}")
            
            # Print asset allocation
            print("\nAsset Allocation:")
            for asset, value in result.get('results', {}).get('asset_allocation', {}).items():
                print(f"- {asset}: {value}")
            
            # Get document details
            document_id = result.get('document_id')
            if document_id:
                print("\nGetting document details...")
                doc_response = requests.get(f"{api_url}/api/rag/document/{document_id}")
                
                if doc_response.status_code == 200:
                    doc_result = doc_response.json()
                    
                    # Save results to file
                    output_file = f"{os.path.splitext(pdf_file)[0]}_rag_results.json"
                    with open(output_file, "w", encoding="utf-8") as f:
                        json.dump(doc_result["data"], f, indent=2, ensure_ascii=False)
                    
                    print(f"\nDetailed results saved to: {output_file}")
                else:
                    print(f"Error getting document details: {doc_response.status_code}")
                    print(doc_response.text)
        else:
            print(f"Error processing document: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Error processing document: {e}")
        return False
    
    print("\nRAG processing completed successfully.")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the RAG system on a PDF file")
    parser.add_argument("pdf_file", help="Path to the PDF file to process")
    parser.add_argument("--api", help="API URL", default="http://localhost:24125")
    args = parser.parse_args()
    
    run_rag_system(args.pdf_file, args.api)
