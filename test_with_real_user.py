"""
Test with Real User

This script tests PDF processing with a real user account.
"""

import os
import sys
import json
import time
import logging
import requests
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("test_with_real_user.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

def register_user(email, password, name):
    """
    Register a new user.
    
    Args:
        email: User email
        password: User password
        name: User name
        
    Returns:
        True if registration successful, False otherwise
    """
    logger.info(f"Registering user: {email}")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/register",
            json={
                'email': email,
                'password': password,
                'name': name,
                'organization': 'Test Organization'
            }
        )
        
        logger.info(f"Registration status code: {response.status_code}")
        
        try:
            data = response.json()
            logger.info(f"Registration response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                logger.info("Registration successful!")
                return True
            else:
                logger.error(f"Registration failed: {data.get('error')}")
                return False
        except:
            logger.error(f"Registration response (not JSON): {response.text[:200]}...")
            return False
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return False

def login_user(email, password):
    """
    Login a user.
    
    Args:
        email: User email
        password: User password
        
    Returns:
        Authentication token or None if login failed
    """
    logger.info(f"Logging in user: {email}")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={
                'email': email,
                'password': password
            }
        )
        
        logger.info(f"Login status code: {response.status_code}")
        
        try:
            data = response.json()
            logger.info(f"Login response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                logger.info("Login successful!")
                return data.get('data', {}).get('token')
            else:
                logger.error(f"Login failed: {data.get('error')}")
                return None
        except:
            logger.error(f"Login response (not JSON): {response.text[:200]}...")
            return None
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return None

def process_pdf(pdf_path, token, output_dir):
    """
    Process a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        token: Authentication token
        output_dir: Directory to save output files
        
    Returns:
        Dictionary with processing results
    """
    pdf_name = os.path.basename(pdf_path)
    logger.info(f"Processing {pdf_name}")
    
    start_time = time.time()
    
    try:
        # Step 1: Upload the document
        with open(pdf_path, 'rb') as file:
            files = {'file': file}
            headers = {
                'Authorization': f'Bearer {token}'
            }
            
            upload_response = requests.post(
                f"{API_URL}/documents",
                files=files,
                headers=headers
            )
        
        if upload_response.status_code != 201:
            logger.error(f"Upload failed with status code {upload_response.status_code}: {upload_response.text}")
            return {
                'success': False,
                'error': f"Upload failed with status code {upload_response.status_code}",
                'pdf_name': pdf_name,
                'processing_time': time.time() - start_time
            }
        
        upload_data = upload_response.json()
        
        if not upload_data.get('success'):
            logger.error(f"Upload failed: {upload_data.get('error')}")
            return {
                'success': False,
                'error': upload_data.get('error'),
                'pdf_name': pdf_name,
                'processing_time': time.time() - start_time
            }
        
        document_id = upload_data.get('data', {}).get('id')
        logger.info(f"Document uploaded successfully with ID: {document_id}")
        
        # Step 2: Process the document
        process_response = requests.post(
            f"{API_URL}/documents/{document_id}/scan1",
            json={
                'agents': ["Document Analyzer", "Table Understanding", "Securities Extractor", "Financial Reasoner"],
                'tableExtraction': True,
                'isinDetection': True,
                'securityInfo': True,
                'portfolioAnalysis': True,
                'ocrScanned': True,
                'outputFormat': 'json'
            },
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}'
            }
        )
        
        if process_response.status_code != 200:
            logger.error(f"Processing failed with status code {process_response.status_code}: {process_response.text}")
            return {
                'success': False,
                'error': f"Processing failed with status code {process_response.status_code}",
                'pdf_name': pdf_name,
                'document_id': document_id,
                'processing_time': time.time() - start_time
            }
        
        process_data = process_response.json()
        
        if not process_data.get('success'):
            logger.error(f"Processing failed: {process_data.get('error')}")
            return {
                'success': False,
                'error': process_data.get('error'),
                'pdf_name': pdf_name,
                'document_id': document_id,
                'processing_time': time.time() - start_time
            }
        
        logger.info(f"Document processing initiated successfully for {pdf_name}")
        
        # Step 3: Poll for processing status
        status = 'processing'
        document_data = None
        poll_count = 0
        max_polls = 60  # 5 minutes (5 seconds per poll)
        
        while status == 'processing' and poll_count < max_polls:
            # Wait for 5 seconds
            time.sleep(5)
            poll_count += 1
            
            # Check status
            status_response = requests.get(
                f"{API_URL}/documents/{document_id}",
                headers={
                    'Authorization': f'Bearer {token}'
                }
            )
            
            if status_response.status_code != 200:
                logger.warning(f"Failed to get status: {status_response.status_code} - {status_response.text}")
                continue
            
            status_data = status_response.json()
            
            if not status_data.get('success'):
                logger.warning(f"Failed to get status: {status_data.get('error')}")
                continue
            
            status = status_data.get('data', {}).get('status')
            document_data = status_data.get('data')
            
            logger.info(f"Current status for {pdf_name}: {status} (poll {poll_count}/{max_polls})")
            
            if status == 'error':
                logger.error(f"Processing failed with error for {pdf_name}")
                return {
                    'success': False,
                    'error': "Processing failed with error",
                    'pdf_name': pdf_name,
                    'document_id': document_id,
                    'processing_time': time.time() - start_time
                }
            
            if status == 'processed':
                break
        
        if poll_count >= max_polls and status == 'processing':
            logger.error(f"Processing timed out for {pdf_name}")
            return {
                'success': False,
                'error': "Processing timed out",
                'pdf_name': pdf_name,
                'document_id': document_id,
                'processing_time': time.time() - start_time
            }
        
        # Step 4: Save document data
        output_path = os.path.join(output_dir, f"{os.path.splitext(pdf_name)[0]}_result.json")
        with open(output_path, 'w') as f:
            json.dump(document_data, f, indent=2)
        
        logger.info(f"Document data saved to {output_path}")
        
        # Step 5: Ask questions about the document
        questions = [
            "What is the total value of the portfolio?",
            "How many securities are in the portfolio?",
            "What ISINs are mentioned in the document?",
            "What is the asset allocation of the portfolio?",
            "Summarize the key information in this document."
        ]
        
        answers = []
        
        for question in questions:
            logger.info(f"Asking question about {pdf_name}: {question}")
            
            answer_response = requests.post(
                f"{API_URL}/documents/{document_id}/ask",
                json={
                    'question': question
                },
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {token}'
                }
            )
            
            if answer_response.status_code != 200:
                logger.warning(f"Failed to get answer: {answer_response.status_code} - {answer_response.text}")
                continue
            
            answer_data = answer_response.json()
            
            if not answer_data.get('success'):
                logger.warning(f"Failed to get answer: {answer_data.get('error')}")
                continue
            
            answer = answer_data.get('data', {}).get('answer')
            logger.info(f"Answer: {answer}")
            
            answers.append({
                'question': question,
                'answer': answer
            })
        
        # Save answers
        answers_path = os.path.join(output_dir, f"{os.path.splitext(pdf_name)[0]}_answers.json")
        with open(answers_path, 'w') as f:
            json.dump(answers, f, indent=2)
        
        logger.info(f"Answers saved to {answers_path}")
        
        processing_time = time.time() - start_time
        logger.info(f"Processing completed for {pdf_name} in {processing_time:.2f} seconds")
        
        return {
            'success': True,
            'pdf_name': pdf_name,
            'document_id': document_id,
            'processing_time': processing_time,
            'status': status,
            'document_data': document_data,
            'answers': answers
        }
    except Exception as e:
        logger.error(f"Error processing {pdf_name}: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'pdf_name': pdf_name,
            'processing_time': time.time() - start_time
        }

def main():
    """
    Main function.
    """
    parser = argparse.ArgumentParser(description='Test with Real User')
    parser.add_argument('--pdf_path', type=str, required=True, help='Path to PDF file')
    parser.add_argument('--output_dir', type=str, default='test_results', help='Directory for output files')
    parser.add_argument('--email', type=str, default='test@example.com', help='User email')
    parser.add_argument('--password', type=str, default='password123', help='User password')
    parser.add_argument('--name', type=str, default='Test User', help='User name')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Check if PDF file exists
    if not os.path.exists(args.pdf_path):
        logger.error(f"PDF file not found: {args.pdf_path}")
        return
    
    # Register user
    register_user(args.email, args.password, args.name)
    
    # Login user
    token = login_user(args.email, args.password)
    
    if not token:
        logger.error("Login failed, cannot proceed with testing")
        return
    
    # Process PDF
    result = process_pdf(args.pdf_path, token, args.output_dir)
    
    if result.get('success'):
        logger.info(f"Processing completed successfully for {os.path.basename(args.pdf_path)}")
    else:
        logger.error(f"Processing failed for {os.path.basename(args.pdf_path)}: {result.get('error')}")
    
    # Save result
    result_path = os.path.join(args.output_dir, 'test_result.json')
    with open(result_path, 'w') as f:
        json.dump(result, f, indent=2)
    
    logger.info(f"Result saved to {result_path}")

if __name__ == "__main__":
    main()
