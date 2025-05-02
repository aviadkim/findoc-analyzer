"""
Test PDF Processing on Web App

This script tests the PDF processing functionality on the deployed web application.
"""

import os
import sys
import json
import time
import logging
import argparse
import requests
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("pdf_processing_web_test.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

# Authentication token
AUTH_TOKEN = None

def login(email: str, password: str) -> bool:
    """
    Login to the API and get an authentication token.
    
    Args:
        email: User email
        password: User password
        
    Returns:
        True if login successful, False otherwise
    """
    global AUTH_TOKEN
    
    logger.info(f"Logging in with email: {email}")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={
                'email': email,
                'password': password
            }
        )
        
        if response.status_code != 200:
            logger.error(f"Login failed with status code {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        
        if not data.get('success'):
            logger.error(f"Login failed: {data.get('error')}")
            return False
        
        AUTH_TOKEN = data.get('data', {}).get('token')
        logger.info("Login successful")
        return True
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return False

def create_test_user() -> Dict[str, Any]:
    """
    Create a test user for testing.
    
    Returns:
        Dictionary with test user credentials
    """
    logger.info("Creating test user")
    
    try:
        response = requests.post(f"{API_URL}/auth/test-user")
        
        if response.status_code != 200 and response.status_code != 201:
            logger.error(f"Failed to create test user: {response.status_code} - {response.text}")
            return {}
        
        data = response.json()
        
        if not data.get('success'):
            logger.error(f"Failed to create test user: {data.get('error')}")
            return {}
        
        logger.info("Test user created successfully")
        return data.get('data', {})
    except Exception as e:
        logger.error(f"Error creating test user: {str(e)}")
        return {}

def upload_document(pdf_path: str) -> Dict[str, Any]:
    """
    Upload a document to the API.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Dictionary with upload result
    """
    logger.info(f"Uploading document: {pdf_path}")
    
    try:
        with open(pdf_path, 'rb') as file:
            files = {'file': file}
            headers = {}
            
            # Add authentication token if available
            if AUTH_TOKEN:
                headers['Authorization'] = f"Bearer {AUTH_TOKEN}"
            
            response = requests.post(
                f"{API_URL}/documents", 
                files=files,
                headers=headers
            )
        
        if response.status_code != 200:
            logger.error(f"Upload failed with status code {response.status_code}: {response.text}")
            return {
                'success': False,
                'error': f"Upload failed with status code {response.status_code}: {response.text}"
            }
        
        data = response.json()
        
        if not data.get('success'):
            logger.error(f"Upload failed: {data.get('error')}")
            return {
                'success': False,
                'error': data.get('error')
            }
        
        logger.info(f"Document uploaded successfully with ID: {data.get('data', {}).get('id')}")
        return data
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return {
            'success': False,
            'error': f"Upload error: {str(e)}"
        }

def process_document(document_id: str, options: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process a document with the API.
    
    Args:
        document_id: Document ID
        options: Processing options
        
    Returns:
        Dictionary with processing result
    """
    logger.info(f"Processing document with ID: {document_id}")
    
    try:
        headers = {
            'Content-Type': 'application/json'
        }
        
        # Add authentication token if available
        if AUTH_TOKEN:
            headers['Authorization'] = f"Bearer {AUTH_TOKEN}"
        
        response = requests.post(
            f"{API_URL}/documents/{document_id}/scan1",
            json=options,
            headers=headers
        )
        
        if response.status_code != 200:
            logger.error(f"Processing failed with status code {response.status_code}: {response.text}")
            return {
                'success': False,
                'error': f"Processing failed with status code {response.status_code}: {response.text}"
            }
        
        data = response.json()
        
        if not data.get('success'):
            logger.error(f"Processing failed: {data.get('error')}")
            return {
                'success': False,
                'error': data.get('error')
            }
        
        logger.info("Document processing initiated successfully")
        return data
    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        return {
            'success': False,
            'error': f"Processing error: {str(e)}"
        }

def poll_processing_status(document_id: str, max_polls: int = 30, poll_interval: int = 5) -> Dict[str, Any]:
    """
    Poll for document processing status.
    
    Args:
        document_id: Document ID
        max_polls: Maximum number of polling attempts
        poll_interval: Polling interval in seconds
        
    Returns:
        Dictionary with polling result
    """
    logger.info(f"Polling for processing status of document with ID: {document_id}")
    
    for i in range(max_polls):
        logger.info(f"Polling attempt {i+1}/{max_polls}")
        
        try:
            headers = {}
            
            # Add authentication token if available
            if AUTH_TOKEN:
                headers['Authorization'] = f"Bearer {AUTH_TOKEN}"
            
            response = requests.get(
                f"{API_URL}/documents/{document_id}",
                headers=headers
            )
            
            if response.status_code != 200:
                logger.warning(f"Failed to get status: {response.status_code} - {response.text}")
                time.sleep(poll_interval)
                continue
            
            data = response.json()
            
            if not data.get('success'):
                logger.warning(f"Failed to get status: {data.get('error')}")
                time.sleep(poll_interval)
                continue
            
            status = data.get('data', {}).get('status')
            logger.info(f"Current status: {status}")
            
            if status == 'processed':
                logger.info("Document processing completed successfully!")
                return data
            elif status == 'error':
                logger.error("Document processing failed with error")
                return {
                    'success': False,
                    'error': "Processing failed with error",
                    'data': data.get('data')
                }
            
            time.sleep(poll_interval)
        except Exception as e:
            logger.error(f"Error polling for status: {str(e)}")
            time.sleep(poll_interval)
    
    logger.error("Polling timed out")
    return {
        'success': False,
        'error': "Polling timed out"
    }

def ask_question(document_id: str, question: str) -> Dict[str, Any]:
    """
    Ask a question about the document.
    
    Args:
        document_id: Document ID
        question: Question to ask
        
    Returns:
        Dictionary with answer result
    """
    logger.info(f"Asking question about document with ID: {document_id}")
    logger.info(f"Question: {question}")
    
    try:
        headers = {
            'Content-Type': 'application/json'
        }
        
        # Add authentication token if available
        if AUTH_TOKEN:
            headers['Authorization'] = f"Bearer {AUTH_TOKEN}"
        
        response = requests.post(
            f"{API_URL}/documents/{document_id}/ask",
            json={
                'question': question
            },
            headers=headers
        )
        
        if response.status_code != 200:
            logger.error(f"Failed to ask question: {response.status_code} - {response.text}")
            return {
                'success': False,
                'error': f"Failed to ask question: {response.status_code} - {response.text}"
            }
        
        data = response.json()
        
        if not data.get('success'):
            logger.error(f"Failed to ask question: {data.get('error')}")
            return {
                'success': False,
                'error': data.get('error')
            }
        
        logger.info("Question answered successfully")
        logger.info(f"Answer: {data.get('data', {}).get('answer')}")
        return data
    except Exception as e:
        logger.error(f"Error asking question: {str(e)}")
        return {
            'success': False,
            'error': f"Error asking question: {str(e)}"
        }

def test_pdf_processing(pdf_path: str, options: Dict[str, Any]) -> Dict[str, Any]:
    """
    Test PDF processing with the web app.
    
    Args:
        pdf_path: Path to the PDF file
        options: Processing options
        
    Returns:
        Dictionary with test results
    """
    logger.info(f"Testing PDF processing with {pdf_path}")
    
    start_time = time.time()
    
    # Step 1: Upload the document
    upload_result = upload_document(pdf_path)
    
    if not upload_result.get('success'):
        logger.error(f"Failed to upload document: {upload_result.get('error')}")
        return {
            'success': False,
            'error': upload_result.get('error'),
            'pdf_path': pdf_path,
            'processing_time': time.time() - start_time
        }
    
    document_id = upload_result.get('data', {}).get('id')
    logger.info(f"Document uploaded successfully with ID: {document_id}")
    
    # Step 2: Process the document
    process_result = process_document(document_id, options)
    
    if not process_result.get('success'):
        logger.error(f"Failed to process document: {process_result.get('error')}")
        return {
            'success': False,
            'error': process_result.get('error'),
            'pdf_path': pdf_path,
            'document_id': document_id,
            'processing_time': time.time() - start_time
        }
    
    logger.info(f"Document processing initiated successfully")
    
    # Step 3: Poll for processing status
    poll_result = poll_processing_status(document_id)
    
    if not poll_result.get('success'):
        logger.error(f"Document processing failed: {poll_result.get('error')}")
        return {
            'success': False,
            'error': poll_result.get('error'),
            'pdf_path': pdf_path,
            'document_id': document_id,
            'processing_time': time.time() - start_time
        }
    
    # Step 4: Ask questions about the document
    questions = [
        "What is the total value of the portfolio?",
        "How many securities are in the portfolio?",
        "What is the ISIN of Apple Inc?",
        "What is the weight of Microsoft Corp in the portfolio?",
        "What is the asset allocation of the portfolio?"
    ]
    
    answers = []
    for question in questions:
        answer_result = ask_question(document_id, question)
        if answer_result.get('success'):
            answers.append({
                'question': question,
                'answer': answer_result.get('data', {}).get('answer')
            })
    
    # Step 5: Analyze results
    processing_time = time.time() - start_time
    logger.info(f"Document processing and Q&A completed in {processing_time:.2f} seconds")
    
    document_data = poll_result.get('data', {})
    
    return {
        'success': True,
        'pdf_path': pdf_path,
        'document_id': document_id,
        'processing_time': processing_time,
        'document_data': document_data,
        'answers': answers
    }

def main():
    """
    Main function.
    """
    parser = argparse.ArgumentParser(description='Test PDF processing on the web app')
    parser.add_argument('--pdf_path', type=str, required=True, help='Path to the PDF file')
    parser.add_argument('--email', type=str, help='Email for authentication')
    parser.add_argument('--password', type=str, help='Password for authentication')
    parser.add_argument('--create_test_user', action='store_true', help='Create a test user for testing')
    parser.add_argument('--agents', type=str, default='all', help='Comma-separated list of agents to use (all, document_analyzer, table_understanding, securities_extractor, financial_reasoner)')
    parser.add_argument('--table_extraction', action='store_true', help='Enable table extraction')
    parser.add_argument('--isin_detection', action='store_true', help='Enable ISIN detection')
    parser.add_argument('--security_info', action='store_true', help='Enable security info extraction')
    parser.add_argument('--portfolio_analysis', action='store_true', help='Enable portfolio analysis')
    parser.add_argument('--ocr_scanned', action='store_true', help='Enable OCR for scanned documents')
    parser.add_argument('--output_format', type=str, default='json', choices=['json', 'csv', 'excel'], help='Output format')
    
    args = parser.parse_args()
    
    # Check if PDF file exists
    if not os.path.exists(args.pdf_path):
        logger.error(f"PDF file not found: {args.pdf_path}")
        return
    
    # Create a test user if requested
    if args.create_test_user:
        test_user = create_test_user()
        if test_user:
            args.email = test_user.get('email')
            args.password = test_user.get('password')
    
    # Login if credentials are provided
    if args.email and args.password:
        if not login(args.email, args.password):
            logger.error("Login failed, cannot proceed with testing")
            return
    else:
        logger.warning("No login credentials provided, authentication will not be used")
    
    # Parse agents
    if args.agents.lower() == 'all':
        agents = ["Document Analyzer", "Table Understanding", "Securities Extractor", "Financial Reasoner"]
    else:
        agent_map = {
            'document_analyzer': 'Document Analyzer',
            'table_understanding': 'Table Understanding',
            'securities_extractor': 'Securities Extractor',
            'financial_reasoner': 'Financial Reasoner'
        }
        agents = [agent_map.get(a.strip().lower(), a.strip()) for a in args.agents.split(',')]
    
    # Create processing options
    options = {
        'agents': agents,
        'tableExtraction': args.table_extraction,
        'isinDetection': args.isin_detection,
        'securityInfo': args.security_info,
        'portfolioAnalysis': args.portfolio_analysis,
        'ocrScanned': args.ocr_scanned,
        'outputFormat': args.output_format
    }
    
    logger.info(f"Processing options: {options}")
    
    # Test PDF processing
    result = test_pdf_processing(args.pdf_path, options)
    
    # Save test results
    with open('pdf_processing_web_test_result.json', 'w') as f:
        json.dump(result, f, indent=2)
    
    logger.info(f"Test results saved to pdf_processing_web_test_result.json")
    
    # Print summary
    if result.get('success'):
        logger.info("Test completed successfully!")
        logger.info(f"Processing time: {result.get('processing_time'):.2f} seconds")
        logger.info(f"Document ID: {result.get('document_id')}")
        
        # Print answers
        logger.info("\nQuestion & Answer Summary:")
        for qa in result.get('answers', []):
            logger.info(f"Q: {qa.get('question')}")
            logger.info(f"A: {qa.get('answer')}")
            logger.info("")
    else:
        logger.error(f"Test failed: {result.get('error')}")

if __name__ == "__main__":
    main()
