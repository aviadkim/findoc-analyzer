"""
Test Endpoint

This script tests the test endpoint for PDF processing.
"""

import os
import sys
import json
import requests
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

def test_health_endpoint():
    """
    Test the health endpoint.
    """
    logger.info("Testing health endpoint")
    
    try:
        response = requests.get(f"{API_URL}/health")
        
        logger.info(f"Status code: {response.status_code}")
        
        try:
            data = response.json()
            logger.info(f"Response: {json.dumps(data, indent=2)}")
            return data.get('success', False)
        except:
            logger.error(f"Response (not JSON): {response.text[:200]}...")
            return False
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return False

def test_upload_pdf(pdf_path):
    """
    Test uploading a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Document ID or None if upload failed
    """
    logger.info(f"Testing PDF upload with {pdf_path}")
    
    try:
        with open(pdf_path, 'rb') as file:
            files = {'file': file}
            
            response = requests.post(
                f"{API_URL}/test/process-pdf",
                files=files
            )
        
        logger.info(f"Status code: {response.status_code}")
        
        try:
            data = response.json()
            logger.info(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                document_id = data.get('data', {}).get('id')
                logger.info(f"Document uploaded successfully with ID: {document_id}")
                return document_id
            else:
                logger.error(f"Upload failed: {data.get('error')}")
                return None
        except:
            logger.error(f"Response (not JSON): {response.text[:200]}...")
            return None
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return None

def test_process_document(document_id):
    """
    Test processing a document.
    
    Args:
        document_id: Document ID
        
    Returns:
        True if processing initiated successfully, False otherwise
    """
    logger.info(f"Testing document processing with ID: {document_id}")
    
    try:
        response = requests.post(
            f"{API_URL}/test/process-document/{document_id}",
            json={
                'agents': ["Document Analyzer", "Table Understanding", "Securities Extractor", "Financial Reasoner"],
                'tableExtraction': True,
                'isinDetection': True,
                'securityInfo': True,
                'portfolioAnalysis': True,
                'ocrScanned': False,
                'outputFormat': 'json'
            }
        )
        
        logger.info(f"Status code: {response.status_code}")
        
        try:
            data = response.json()
            logger.info(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                logger.info("Document processing initiated successfully")
                return True
            else:
                logger.error(f"Processing failed: {data.get('error')}")
                return False
        except:
            logger.error(f"Response (not JSON): {response.text[:200]}...")
            return False
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return False

def test_get_document(document_id):
    """
    Test getting a document.
    
    Args:
        document_id: Document ID
        
    Returns:
        Document data or None if get failed
    """
    logger.info(f"Testing get document with ID: {document_id}")
    
    try:
        response = requests.get(f"{API_URL}/test/document/{document_id}")
        
        logger.info(f"Status code: {response.status_code}")
        
        try:
            data = response.json()
            logger.info(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                logger.info("Document retrieved successfully")
                return data.get('data')
            else:
                logger.error(f"Get failed: {data.get('error')}")
                return None
        except:
            logger.error(f"Response (not JSON): {response.text[:200]}...")
            return None
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return None

def main():
    """
    Main function.
    """
    # Check if PDF file is provided
    if len(sys.argv) < 2:
        logger.error("Please provide a PDF file path")
        print("Usage: python test_endpoint.py <pdf_path>")
        return
    
    pdf_path = sys.argv[1]
    
    # Check if PDF file exists
    if not os.path.exists(pdf_path):
        logger.error(f"PDF file not found: {pdf_path}")
        return
    
    # Test health endpoint
    if not test_health_endpoint():
        logger.error("Health endpoint test failed")
        return
    
    # Test upload PDF
    document_id = test_upload_pdf(pdf_path)
    
    if not document_id:
        logger.error("PDF upload test failed")
        return
    
    # Test process document
    if not test_process_document(document_id):
        logger.error("Document processing test failed")
        return
    
    # Test get document
    document_data = test_get_document(document_id)
    
    if not document_data:
        logger.error("Get document test failed")
        return
    
    # Save document data
    output_path = os.path.join(os.path.dirname(pdf_path), f"{os.path.splitext(os.path.basename(pdf_path))[0]}_result.json")
    with open(output_path, 'w') as f:
        json.dump(document_data, f, indent=2)
    
    logger.info(f"Document data saved to {output_path}")
    logger.info("All tests passed successfully!")

if __name__ == "__main__":
    main()
