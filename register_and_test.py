"""
Register and Test

This script registers a new user and tests PDF processing.
"""

import os
import sys
import json
import time
import logging
import requests
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

def register_user():
    """
    Register a new user.
    
    Returns:
        Dictionary with user credentials or None if registration failed
    """
    # Generate a unique email
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "Password123!"
    name = f"Test User {uuid.uuid4().hex[:4]}"
    
    logger.info(f"Registering new user: {email}")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/register",
            json={
                'email': email,
                'password': password,
                'name': name,
                'organization': 'Test Organization'
            },
            headers={
                'Content-Type': 'application/json'
            }
        )
        
        logger.info(f"Registration status code: {response.status_code}")
        
        try:
            data = response.json()
            logger.info(f"Registration response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                logger.info("Registration successful!")
                return {
                    'email': email,
                    'password': password,
                    'name': name
                }
            else:
                logger.error(f"Registration failed: {data.get('error')}")
                return None
        except:
            logger.error(f"Registration response (not JSON): {response.text[:200]}...")
            return None
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return None

def login_user(email, password):
    """
    Login a user.
    
    Args:
        email: User email
        password: User password
        
    Returns:
        Authentication token or None if login failed
    """
    logger.info(f"Logging in with email: {email}")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={
                'email': email,
                'password': password
            },
            headers={
                'Content-Type': 'application/json'
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

def upload_and_process_pdf(pdf_path, token):
    """
    Upload and process a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        token: Authentication token
        
    Returns:
        Processing result or None if processing failed
    """
    logger.info(f"Uploading and processing PDF: {pdf_path}")
    
    try:
        # Step 1: Upload the document
        with open(pdf_path, 'rb') as file:
            files = {'file': file}
            headers = {
                'Authorization': f"Bearer {token}"
            }
            
            upload_response = requests.post(
                f"{API_URL}/documents",
                files=files,
                headers=headers
            )
        
        logger.info(f"Upload status code: {upload_response.status_code}")
        
        try:
            upload_data = upload_response.json()
            logger.info(f"Upload response: {json.dumps(upload_data, indent=2)}")
            
            if not upload_data.get('success'):
                logger.error(f"Upload failed: {upload_data.get('error')}")
                return None
            
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
                    'Authorization': f"Bearer {token}"
                }
            )
            
            logger.info(f"Process status code: {process_response.status_code}")
            
            try:
                process_data = process_response.json()
                logger.info(f"Process response: {json.dumps(process_data, indent=2)}")
                
                if not process_data.get('success'):
                    logger.error(f"Processing failed: {process_data.get('error')}")
                    return None
                
                logger.info("Document processing initiated successfully")
                
                # Step 3: Poll for processing status
                status = 'processing'
                document_data = None
                poll_count = 0
                max_polls = 60  # 5 minutes (5 seconds per poll)
                
                while status == 'processing' and poll_count < max_polls:
                    # Wait for 5 seconds
                    logger.info("Waiting for processing to complete...")
                    time.sleep(5)
                    poll_count += 1
                    
                    # Check status
                    status_response = requests.get(
                        f"{API_URL}/documents/{document_id}",
                        headers={
                            'Authorization': f"Bearer {token}"
                        }
                    )
                    
                    logger.info(f"Status check status code: {status_response.status_code}")
                    
                    try:
                        status_data = status_response.json()
                        
                        if not status_data.get('success'):
                            logger.error(f"Failed to get status: {status_data.get('error')}")
                            continue
                        
                        status = status_data.get('data', {}).get('status')
                        document_data = status_data.get('data')
                        
                        logger.info(f"Current status: {status}")
                        
                        if status == 'error':
                            logger.error("Processing failed with error")
                            return None
                        
                        if status == 'processed':
                            logger.info("Processing completed successfully!")
                            break
                    except:
                        logger.error(f"Status check response (not JSON): {status_response.text[:200]}...")
                        continue
                
                if poll_count >= max_polls and status == 'processing':
                    logger.error("Processing timed out")
                    return None
                
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
                    logger.info(f"Asking question: {question}")
                    
                    answer_response = requests.post(
                        f"{API_URL}/documents/{document_id}/ask",
                        json={
                            'question': question
                        },
                        headers={
                            'Content-Type': 'application/json',
                            'Authorization': f"Bearer {token}"
                        }
                    )
                    
                    logger.info(f"Answer status code: {answer_response.status_code}")
                    
                    try:
                        answer_data = answer_response.json()
                        
                        if answer_data.get('success'):
                            answer = answer_data.get('data', {}).get('answer')
                            logger.info(f"Answer: {answer}")
                            answers.append({
                                'question': question,
                                'answer': answer
                            })
                        else:
                            logger.error(f"Failed to get answer: {answer_data.get('error')}")
                    except:
                        logger.error(f"Answer response (not JSON): {answer_response.text[:200]}...")
                
                # Add answers to document data
                document_data['answers'] = answers
                
                return document_data
            except:
                logger.error(f"Process response (not JSON): {process_response.text[:200]}...")
                return None
        except:
            logger.error(f"Upload response (not JSON): {upload_response.text[:200]}...")
            return None
    except Exception as e:
        logger.error(f"Upload and process error: {str(e)}")
        return None

def main():
    """
    Main function.
    """
    # Check if PDF file is provided
    if len(sys.argv) < 2:
        logger.error("Please provide a PDF file path")
        print("Usage: python register_and_test.py <pdf_path>")
        return
    
    pdf_path = sys.argv[1]
    
    # Check if PDF file exists
    if not os.path.exists(pdf_path):
        logger.error(f"PDF file not found: {pdf_path}")
        return
    
    # Register a new user
    user = register_user()
    
    if not user:
        logger.error("Registration failed, cannot proceed with testing")
        return
    
    # Login with the new user
    token = login_user(user['email'], user['password'])
    
    if not token:
        logger.error("Login failed, cannot proceed with testing")
        return
    
    # Upload and process PDF
    result = upload_and_process_pdf(pdf_path, token)
    
    if not result:
        logger.error("PDF processing failed")
        return
    
    # Save result to file
    with open('pdf_processing_result.json', 'w') as f:
        json.dump(result, f, indent=2)
    
    logger.info("PDF processing completed successfully!")
    logger.info(f"Result saved to pdf_processing_result.json")
    
    # Print answers
    if 'answers' in result:
        logger.info("\nQuestions & Answers:")
        for qa in result['answers']:
            logger.info(f"Q: {qa['question']}")
            logger.info(f"A: {qa['answer']}")
            logger.info("")

if __name__ == "__main__":
    main()
