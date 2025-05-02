"""
Direct API Test

This script directly tests the API endpoints for PDF processing.
"""

import os
import sys
import json
import time
import logging
import requests
import random
import string

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

def create_test_user():
    """
    Create a test user for authentication.

    Returns:
        Tuple of (email, password, token) or None if creation failed
    """
    # Generate random email and password
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"test_{random_suffix}@example.com"
    password = "Password123!"

    logger.info(f"Creating test user with email: {email}")

    try:
        # Register user
        register_response = requests.post(
            f"{API_URL}/auth/register",
            json={
                'email': email,
                'password': password,
                'name': 'Test User',
                'organization': 'Test Organization'
            },
            headers={
                'Content-Type': 'application/json'
            }
        )

        logger.info(f"Register status code: {register_response.status_code}")

        try:
            register_data = register_response.json()
            logger.info(f"Register response: {json.dumps(register_data, indent=2)}")

            if not register_data.get('success'):
                logger.error(f"Registration failed: {register_data.get('error')}")
                return None

            logger.info("User registered successfully")

            # Login user
            login_response = requests.post(
                f"{API_URL}/auth/login",
                json={
                    'email': email,
                    'password': password
                },
                headers={
                    'Content-Type': 'application/json'
                }
            )

            logger.info(f"Login status code: {login_response.status_code}")

            try:
                login_data = login_response.json()
                logger.info(f"Login response: {json.dumps(login_data, indent=2)}")

                if not login_data.get('success'):
                    logger.error(f"Login failed: {login_data.get('error')}")
                    return None

                token = login_data.get('data', {}).get('token')
                logger.info("User logged in successfully")

                return (email, password, token)
            except:
                logger.error(f"Login response (not JSON): {login_response.text[:200]}...")
                return None
        except:
            logger.error(f"Register response (not JSON): {register_response.text[:200]}...")
            return None
    except Exception as e:
        logger.error(f"Create test user error: {str(e)}")
        return None

def upload_and_process_pdf(pdf_path, auth_token=None):
    """
    Upload and process a PDF file.

    Args:
        pdf_path: Path to the PDF file
        auth_token: Authentication token (optional)

    Returns:
        Processing result or None if processing failed
    """
    logger.info(f"Uploading and processing PDF: {pdf_path}")

    try:
        # Step 1: Upload the document
        with open(pdf_path, 'rb') as file:
            files = {'file': file}
            data = {
                'name': os.path.basename(pdf_path),
                'type': 'financial_statement'
            }

            headers = {}
            if auth_token:
                headers['Authorization'] = f"Bearer {auth_token}"

            upload_response = requests.post(
                f"{API_URL}/documents",
                files=files,
                data=data,
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
            process_headers = {
                'Content-Type': 'application/json'
            }

            if auth_token:
                process_headers['Authorization'] = f"Bearer {auth_token}"

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
                headers=process_headers
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

                status_headers = {}
                if auth_token:
                    status_headers['Authorization'] = f"Bearer {auth_token}"

                while status == 'processing' and poll_count < max_polls:
                    # Wait for 5 seconds
                    logger.info("Waiting for processing to complete...")
                    time.sleep(5)
                    poll_count += 1

                    # Check status
                    status_response = requests.get(
                        f"{API_URL}/documents/{document_id}",
                        headers=status_headers
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

                ask_headers = {
                    'Content-Type': 'application/json'
                }

                if auth_token:
                    ask_headers['Authorization'] = f"Bearer {auth_token}"

                for question in questions:
                    logger.info(f"Asking question: {question}")

                    answer_response = requests.post(
                        f"{API_URL}/documents/{document_id}/ask",
                        json={
                            'question': question
                        },
                        headers=ask_headers
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
        print("Usage: python direct_api_test.py <pdf_path>")
        return

    pdf_path = sys.argv[1]

    # Check if PDF file exists
    if not os.path.exists(pdf_path):
        logger.error(f"PDF file not found: {pdf_path}")
        return

    # Create test user
    user_info = create_test_user()

    if user_info:
        email, password, token = user_info
        logger.info(f"Using authentication with email: {email}")

        # Upload and process PDF with authentication
        result = upload_and_process_pdf(pdf_path, token)
    else:
        logger.warning("Failed to create test user, trying without authentication")

        # Upload and process PDF without authentication
        result = upload_and_process_pdf(pdf_path)

    if not result:
        logger.error("PDF processing failed")
        return

    # Save result to file
    output_path = os.path.splitext(pdf_path)[0] + "_result.json"
    with open(output_path, 'w') as f:
        json.dump(result, f, indent=2)

    logger.info("PDF processing completed successfully!")
    logger.info(f"Result saved to {output_path}")

    # Print answers
    if 'answers' in result:
        logger.info("\nQuestions & Answers:")
        for qa in result['answers']:
            logger.info(f"Q: {qa['question']}")
            logger.info(f"A: {qa['answer']}")
            logger.info("")

if __name__ == "__main__":
    main()
