"""
PDF Processor Testing Script

This script tests the PDF processing functionality with real financial documents.
"""

import os
import sys
import json
import time
import logging
import argparse
from typing import Dict, Any, List, Optional
import requests
import pandas as pd

# Global variables
AUTH_TOKEN = None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("pdf_processor_test.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# API configuration
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

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

        AUTH_TOKEN = data.get('token')
        logger.info("Login successful")
        return True
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return False

def test_document_processing(pdf_path: str, options: Dict[str, Any]) -> Dict[str, Any]:
    """
    Test document processing with a real PDF.

    Args:
        pdf_path: Path to the PDF file
        options: Processing options

    Returns:
        Dictionary with test results
    """
    logger.info(f"Testing document processing with {pdf_path}")

    start_time = time.time()

    # Skip authentication check for now
    # if not AUTH_TOKEN:
    #     logger.error("Not authenticated, please login first")
    #     return {
    #         'success': False,
    #         'error': "Not authenticated",
    #         'pdf_path': pdf_path,
    #         'processing_time': time.time() - start_time
    #     }

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

    # Step 4: Analyze results
    processing_time = time.time() - start_time
    logger.info(f"Document processing completed in {processing_time:.2f} seconds")

    result = poll_result.get('data', {})

    # Extract metadata
    metadata = result.get('metadata', {})

    # Calculate accuracy metrics
    accuracy_metrics = calculate_accuracy_metrics(metadata, pdf_path)

    return {
        'success': True,
        'pdf_path': pdf_path,
        'document_id': document_id,
        'processing_time': processing_time,
        'metadata': metadata,
        'accuracy_metrics': accuracy_metrics
    }

def upload_document(pdf_path: str) -> Dict[str, Any]:
    """
    Upload a document to the API.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Dictionary with upload result
    """
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
            return {
                'success': False,
                'error': f"Upload failed with status code {response.status_code}: {response.text}"
            }

        return response.json()
    except Exception as e:
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
            return {
                'success': False,
                'error': f"Processing failed with status code {response.status_code}: {response.text}"
            }

        return response.json()
    except Exception as e:
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
    for i in range(max_polls):
        logger.info(f"Polling for status (attempt {i+1}/{max_polls})...")

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
                logger.info("Processing completed successfully!")
                return data
            elif status == 'error':
                return {
                    'success': False,
                    'error': "Processing failed with error",
                    'data': data.get('data')
                }

            time.sleep(poll_interval)
        except Exception as e:
            logger.error(f"Error polling for status: {str(e)}")
            time.sleep(poll_interval)

    return {
        'success': False,
        'error': "Polling timed out"
    }

def calculate_accuracy_metrics(metadata: Dict[str, Any], pdf_path: str) -> Dict[str, Any]:
    """
    Calculate accuracy metrics for the processing result.

    Args:
        metadata: Processing metadata
        pdf_path: Path to the PDF file

    Returns:
        Dictionary with accuracy metrics
    """
    # Extract filename without extension
    filename = os.path.basename(pdf_path)
    filename_without_ext = os.path.splitext(filename)[0]

    # Check if we have expected data for this file
    expected_data_path = f"expected_data/{filename_without_ext}.json"

    if os.path.exists(expected_data_path):
        # Load expected data
        with open(expected_data_path, 'r') as f:
            expected_data = json.load(f)

        # Calculate metrics based on expected data
        return calculate_metrics_with_expected_data(metadata, expected_data)
    else:
        # Calculate basic metrics without expected data
        return calculate_basic_metrics(metadata)

def calculate_metrics_with_expected_data(metadata: Dict[str, Any], expected_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate accuracy metrics using expected data.

    Args:
        metadata: Processing metadata
        expected_data: Expected data

    Returns:
        Dictionary with accuracy metrics
    """
    metrics = {
        'document_type_accuracy': 0.0,
        'securities_count_accuracy': 0.0,
        'isin_detection_accuracy': 0.0,
        'portfolio_summary_accuracy': 0.0,
        'asset_allocation_accuracy': 0.0,
        'overall_accuracy': 0.0
    }

    # Document type accuracy
    if metadata.get('document_type') == expected_data.get('document_type'):
        metrics['document_type_accuracy'] = 1.0

    # Securities count accuracy
    expected_securities = expected_data.get('securities', [])
    actual_securities = metadata.get('securities', [])

    if expected_securities and actual_securities:
        count_ratio = min(len(actual_securities) / len(expected_securities), 1.0)
        metrics['securities_count_accuracy'] = count_ratio

    # ISIN detection accuracy
    expected_isins = [s.get('isin') for s in expected_securities if s.get('isin')]
    actual_isins = [s.get('isin') for s in actual_securities if s.get('isin')]

    if expected_isins and actual_isins:
        # Count correctly detected ISINs
        correct_isins = set(expected_isins).intersection(set(actual_isins))
        isin_accuracy = len(correct_isins) / len(expected_isins)
        metrics['isin_detection_accuracy'] = isin_accuracy

    # Portfolio summary accuracy
    expected_summary = expected_data.get('portfolio_summary', {})
    actual_summary = metadata.get('portfolio_summary', {})

    if expected_summary and actual_summary:
        # Check total value
        total_value_accuracy = 0.0
        if expected_summary.get('total_value') and actual_summary.get('total_value'):
            expected_value = float(expected_summary.get('total_value', 0))
            actual_value = float(actual_summary.get('total_value', 0))

            if expected_value > 0:
                value_ratio = min(actual_value / expected_value, 2.0)
                if value_ratio > 1.0:
                    value_ratio = 2 - value_ratio  # Penalize overestimation
                total_value_accuracy = value_ratio

        # Check currency
        currency_accuracy = 0.0
        if expected_summary.get('currency') == actual_summary.get('currency'):
            currency_accuracy = 1.0

        # Check date
        date_accuracy = 0.0
        if expected_summary.get('valuation_date') == actual_summary.get('valuation_date'):
            date_accuracy = 1.0

        # Combine portfolio summary metrics
        metrics['portfolio_summary_accuracy'] = (total_value_accuracy + currency_accuracy + date_accuracy) / 3

    # Asset allocation accuracy
    expected_allocation = expected_data.get('asset_allocation', {})
    actual_allocation = metadata.get('asset_allocation', {})

    if expected_allocation and actual_allocation:
        allocation_accuracy_sum = 0.0
        allocation_count = 0

        for asset_class, expected_data in expected_allocation.items():
            if asset_class in actual_allocation:
                expected_percentage = float(expected_data.get('percentage', 0))
                actual_percentage = float(actual_allocation.get(asset_class, {}).get('percentage', 0))

                if expected_percentage > 0:
                    percentage_ratio = min(actual_percentage / expected_percentage, 2.0)
                    if percentage_ratio > 1.0:
                        percentage_ratio = 2 - percentage_ratio  # Penalize overestimation
                    allocation_accuracy_sum += percentage_ratio
                    allocation_count += 1

        if allocation_count > 0:
            metrics['asset_allocation_accuracy'] = allocation_accuracy_sum / allocation_count

    # Calculate overall accuracy
    metrics['overall_accuracy'] = sum([
        metrics['document_type_accuracy'] * 0.1,
        metrics['securities_count_accuracy'] * 0.3,
        metrics['isin_detection_accuracy'] * 0.3,
        metrics['portfolio_summary_accuracy'] * 0.2,
        metrics['asset_allocation_accuracy'] * 0.1
    ])

    return metrics

def calculate_basic_metrics(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate basic accuracy metrics without expected data.

    Args:
        metadata: Processing metadata

    Returns:
        Dictionary with basic accuracy metrics
    """
    metrics = {
        'document_type_detected': metadata.get('document_type') != 'unknown',
        'securities_count': len(metadata.get('securities', [])),
        'isins_detected': len([s for s in metadata.get('securities', []) if s.get('isin')]),
        'portfolio_summary_detected': bool(metadata.get('portfolio_summary')),
        'asset_allocation_detected': bool(metadata.get('asset_allocation')),
        'processing_method': metadata.get('processing_method', 'unknown')
    }

    return metrics

def save_test_results(results: List[Dict[str, Any]], output_path: str):
    """
    Save test results to a file.

    Args:
        results: List of test results
        output_path: Path to save the results
    """
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)

    logger.info(f"Test results saved to {output_path}")

    # Also save a CSV summary
    csv_path = os.path.splitext(output_path)[0] + '.csv'

    summary_data = []
    for result in results:
        if result.get('success'):
            summary_data.append({
                'pdf_path': result.get('pdf_path'),
                'processing_time': result.get('processing_time'),
                'document_type': result.get('metadata', {}).get('document_type'),
                'securities_count': len(result.get('metadata', {}).get('securities', [])),
                'isins_detected': len([s for s in result.get('metadata', {}).get('securities', []) if s.get('isin')]),
                'overall_accuracy': result.get('accuracy_metrics', {}).get('overall_accuracy', 0.0),
                'processing_method': result.get('metadata', {}).get('processing_method')
            })

    if summary_data:
        df = pd.DataFrame(summary_data)
        df.to_csv(csv_path, index=False)
        logger.info(f"Summary CSV saved to {csv_path}")

def main():
    """
    Main function.
    """
    parser = argparse.ArgumentParser(description='Test PDF processing with real documents')
    parser.add_argument('--pdf_dir', type=str, default='test_pdfs', help='Directory containing test PDFs')
    parser.add_argument('--output', type=str, default='test_results.json', help='Output file for test results')
    parser.add_argument('--agents', type=str, default='all', help='Comma-separated list of agents to use (all, document_analyzer, table_understanding, securities_extractor, financial_reasoner)')
    parser.add_argument('--table_extraction', action='store_true', help='Enable table extraction')
    parser.add_argument('--isin_detection', action='store_true', help='Enable ISIN detection')
    parser.add_argument('--security_info', action='store_true', help='Enable security info extraction')
    parser.add_argument('--portfolio_analysis', action='store_true', help='Enable portfolio analysis')
    parser.add_argument('--ocr_scanned', action='store_true', help='Enable OCR for scanned documents')
    parser.add_argument('--output_format', type=str, default='json', choices=['json', 'csv', 'excel'], help='Output format')
    parser.add_argument('--email', type=str, help='Email for authentication')
    parser.add_argument('--password', type=str, help='Password for authentication')

    args = parser.parse_args()

    # Check if PDF directory exists
    if not os.path.exists(args.pdf_dir):
        logger.error(f"PDF directory not found: {args.pdf_dir}")
        return

    # Get list of PDF files
    pdf_files = [os.path.join(args.pdf_dir, f) for f in os.listdir(args.pdf_dir) if f.lower().endswith('.pdf')]

    if not pdf_files:
        logger.error(f"No PDF files found in {args.pdf_dir}")
        return

    logger.info(f"Found {len(pdf_files)} PDF files for testing")

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

    # Create directory for expected data if it doesn't exist
    os.makedirs('expected_data', exist_ok=True)

    # Test each PDF
    results = []
    for pdf_file in pdf_files:
        logger.info(f"Testing {pdf_file}...")
        result = test_document_processing(pdf_file, options)
        results.append(result)

    # Save test results
    save_test_results(results, args.output)

    # Print summary
    successful_tests = sum(1 for r in results if r.get('success'))
    logger.info(f"Testing completed: {successful_tests}/{len(results)} successful")

    if successful_tests > 0:
        avg_processing_time = sum(r.get('processing_time', 0) for r in results if r.get('success')) / successful_tests
        logger.info(f"Average processing time: {avg_processing_time:.2f} seconds")

        # Calculate average accuracy if available
        accuracy_results = [r.get('accuracy_metrics', {}).get('overall_accuracy', 0) for r in results if r.get('success') and 'accuracy_metrics' in r and 'overall_accuracy' in r.get('accuracy_metrics', {})]
        if accuracy_results:
            avg_accuracy = sum(accuracy_results) / len(accuracy_results)
            logger.info(f"Average overall accuracy: {avg_accuracy:.2%}")

if __name__ == "__main__":
    main()
