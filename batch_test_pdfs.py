"""
Batch Test PDFs

This script tests PDF processing with multiple PDF files.
"""

import os
import sys
import json
import time
import logging
import requests
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("batch_test_pdfs.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

def process_pdf(pdf_path, output_dir):
    """
    Process a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
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
                'X-Bypass-Auth': 'true',
                'X-Test-Mode': 'true'
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
                'X-Bypass-Auth': 'true',
                'X-Test-Mode': 'true'
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
                    'X-Bypass-Auth': 'true',
                    'X-Test-Mode': 'true'
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
                    'X-Bypass-Auth': 'true',
                    'X-Test-Mode': 'true'
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
    parser = argparse.ArgumentParser(description='Batch Test PDFs')
    parser.add_argument('--pdf_dir', type=str, default='test_pdfs', help='Directory containing PDF files')
    parser.add_argument('--output_dir', type=str, default='test_results', help='Directory for output files')
    parser.add_argument('--max_workers', type=int, default=2, help='Maximum number of worker threads')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Get list of PDF files
    pdf_files = [os.path.join(args.pdf_dir, f) for f in os.listdir(args.pdf_dir) if f.lower().endswith('.pdf')]
    
    if not pdf_files:
        logger.error(f"No PDF files found in {args.pdf_dir}")
        return
    
    logger.info(f"Found {len(pdf_files)} PDF files")
    
    # Process PDF files
    results = []
    
    with ThreadPoolExecutor(max_workers=args.max_workers) as executor:
        # Submit tasks
        future_to_pdf = {executor.submit(process_pdf, pdf_file, args.output_dir): pdf_file for pdf_file in pdf_files}
        
        # Process results as they complete
        for future in as_completed(future_to_pdf):
            pdf_file = future_to_pdf[future]
            
            try:
                result = future.result()
                results.append(result)
                
                if result.get('success'):
                    logger.info(f"Processing completed successfully for {os.path.basename(pdf_file)}")
                else:
                    logger.error(f"Processing failed for {os.path.basename(pdf_file)}: {result.get('error')}")
            except Exception as e:
                logger.error(f"Exception processing {os.path.basename(pdf_file)}: {str(e)}")
                results.append({
                    'success': False,
                    'error': str(e),
                    'pdf_name': os.path.basename(pdf_file)
                })
    
    # Save results
    results_path = os.path.join(args.output_dir, 'batch_results.json')
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Results saved to {results_path}")
    
    # Print summary
    successful = [r for r in results if r.get('success')]
    failed = [r for r in results if not r.get('success')]
    
    logger.info(f"Processing completed for {len(pdf_files)} PDF files")
    logger.info(f"Successful: {len(successful)}")
    logger.info(f"Failed: {len(failed)}")
    
    if failed:
        logger.info("Failed PDFs:")
        for result in failed:
            logger.info(f"- {result.get('pdf_name')}: {result.get('error')}")

if __name__ == "__main__":
    main()
