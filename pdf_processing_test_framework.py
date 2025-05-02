"""
PDF Processing Test Framework

This script provides a framework for testing PDF processing functionality with multiple PDF files.
It can run hundreds of tests and analyze the results to improve accuracy.
"""

import os
import sys
import json
import time
import logging
import argparse
import requests
import pandas as pd
from typing import Dict, Any, List, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("pdf_processing_tests.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

class PDFProcessingTester:
    """
    PDF Processing Tester class for testing PDF processing functionality.
    """
    
    def __init__(self, pdf_dir: str, expected_data_dir: str, output_dir: str):
        """
        Initialize the PDF Processing Tester.
        
        Args:
            pdf_dir: Directory containing PDF files
            expected_data_dir: Directory containing expected data files
            output_dir: Directory for output files
        """
        self.pdf_dir = pdf_dir
        self.expected_data_dir = expected_data_dir
        self.output_dir = output_dir
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Get list of PDF files
        self.pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith('.pdf')]
        logger.info(f"Found {len(self.pdf_files)} PDF files for testing")
        
        # Results
        self.results = []
    
    def test_pdf_processing(self, pdf_file: str) -> Dict[str, Any]:
        """
        Test PDF processing for a single file.
        
        Args:
            pdf_file: PDF file name
            
        Returns:
            Dictionary with test results
        """
        pdf_path = os.path.join(self.pdf_dir, pdf_file)
        logger.info(f"Testing PDF processing for {pdf_file}")
        
        start_time = time.time()
        
        try:
            # Step 1: Upload the document
            with open(pdf_path, 'rb') as file:
                files = {'file': file}
                
                upload_response = requests.post(
                    f"{API_URL}/test/process-pdf",
                    files=files
                )
            
            if upload_response.status_code != 201:
                logger.error(f"Upload failed with status code {upload_response.status_code}: {upload_response.text}")
                return {
                    'success': False,
                    'error': f"Upload failed with status code {upload_response.status_code}",
                    'pdf_file': pdf_file,
                    'processing_time': time.time() - start_time
                }
            
            upload_data = upload_response.json()
            
            if not upload_data.get('success'):
                logger.error(f"Upload failed: {upload_data.get('error')}")
                return {
                    'success': False,
                    'error': upload_data.get('error'),
                    'pdf_file': pdf_file,
                    'processing_time': time.time() - start_time
                }
            
            document_id = upload_data.get('data', {}).get('id')
            logger.info(f"Document uploaded successfully with ID: {document_id}")
            
            # Step 2: Process the document
            process_response = requests.post(
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
            
            if process_response.status_code != 200:
                logger.error(f"Processing failed with status code {process_response.status_code}: {process_response.text}")
                return {
                    'success': False,
                    'error': f"Processing failed with status code {process_response.status_code}",
                    'pdf_file': pdf_file,
                    'document_id': document_id,
                    'processing_time': time.time() - start_time
                }
            
            process_data = process_response.json()
            
            if not process_data.get('success'):
                logger.error(f"Processing failed: {process_data.get('error')}")
                return {
                    'success': False,
                    'error': process_data.get('error'),
                    'pdf_file': pdf_file,
                    'document_id': document_id,
                    'processing_time': time.time() - start_time
                }
            
            logger.info(f"Document processing initiated successfully for {pdf_file}")
            
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
                status_response = requests.get(f"{API_URL}/test/document/{document_id}")
                
                if status_response.status_code != 200:
                    logger.warning(f"Failed to get status: {status_response.status_code} - {status_response.text}")
                    continue
                
                status_data = status_response.json()
                
                if not status_data.get('success'):
                    logger.warning(f"Failed to get status: {status_data.get('error')}")
                    continue
                
                status = status_data.get('data', {}).get('status')
                document_data = status_data.get('data')
                
                logger.info(f"Current status for {pdf_file}: {status} (poll {poll_count}/{max_polls})")
                
                if status == 'error':
                    logger.error(f"Processing failed with error for {pdf_file}")
                    return {
                        'success': False,
                        'error': "Processing failed with error",
                        'pdf_file': pdf_file,
                        'document_id': document_id,
                        'processing_time': time.time() - start_time
                    }
            
            if poll_count >= max_polls and status == 'processing':
                logger.error(f"Processing timed out for {pdf_file}")
                return {
                    'success': False,
                    'error': "Processing timed out",
                    'pdf_file': pdf_file,
                    'document_id': document_id,
                    'processing_time': time.time() - start_time
                }
            
            # Step 4: Calculate accuracy metrics
            processing_time = time.time() - start_time
            logger.info(f"Document processing completed in {processing_time:.2f} seconds for {pdf_file}")
            
            # Get expected data if available
            expected_data_path = os.path.join(self.expected_data_dir, os.path.splitext(pdf_file)[0] + '.json')
            accuracy_metrics = {}
            
            if os.path.exists(expected_data_path):
                with open(expected_data_path, 'r') as f:
                    expected_data = json.load(f)
                
                # Calculate accuracy metrics
                accuracy_metrics = self._calculate_accuracy_metrics(document_data, expected_data)
                logger.info(f"Accuracy metrics for {pdf_file}: {json.dumps(accuracy_metrics, indent=2)}")
            
            # Save document data
            output_path = os.path.join(self.output_dir, os.path.splitext(pdf_file)[0] + '_result.json')
            with open(output_path, 'w') as f:
                json.dump(document_data, f, indent=2)
            
            return {
                'success': True,
                'pdf_file': pdf_file,
                'document_id': document_id,
                'processing_time': processing_time,
                'document_data': document_data,
                'accuracy_metrics': accuracy_metrics
            }
        except Exception as e:
            logger.error(f"Error testing PDF processing for {pdf_file}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'pdf_file': pdf_file,
                'processing_time': time.time() - start_time
            }
    
    def _calculate_accuracy_metrics(self, document_data: Dict[str, Any], expected_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate accuracy metrics by comparing document data with expected data.
        
        Args:
            document_data: Document data from processing
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
        
        # Get metadata from document data
        metadata = document_data.get('metadata', {})
        
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
    
    def run_tests(self, max_workers: int = 4) -> List[Dict[str, Any]]:
        """
        Run tests for all PDF files.
        
        Args:
            max_workers: Maximum number of worker threads
            
        Returns:
            List of test results
        """
        logger.info(f"Running tests for {len(self.pdf_files)} PDF files with {max_workers} workers")
        
        results = []
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit tasks
            future_to_pdf = {executor.submit(self.test_pdf_processing, pdf_file): pdf_file for pdf_file in self.pdf_files}
            
            # Process results as they complete
            for future in as_completed(future_to_pdf):
                pdf_file = future_to_pdf[future]
                
                try:
                    result = future.result()
                    results.append(result)
                    
                    if result.get('success'):
                        logger.info(f"Test completed successfully for {pdf_file}")
                    else:
                        logger.error(f"Test failed for {pdf_file}: {result.get('error')}")
                except Exception as e:
                    logger.error(f"Exception processing {pdf_file}: {str(e)}")
                    results.append({
                        'success': False,
                        'error': str(e),
                        'pdf_file': pdf_file
                    })
        
        # Save results
        self._save_results(results)
        
        return results
    
    def _save_results(self, results: List[Dict[str, Any]]):
        """
        Save test results to files.
        
        Args:
            results: List of test results
        """
        # Save JSON results
        json_path = os.path.join(self.output_dir, 'test_results.json')
        with open(json_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"Test results saved to {json_path}")
        
        # Save CSV summary
        csv_path = os.path.join(self.output_dir, 'test_results_summary.csv')
        
        summary_data = []
        for result in results:
            if result.get('success'):
                summary_data.append({
                    'pdf_file': result.get('pdf_file'),
                    'processing_time': result.get('processing_time'),
                    'document_type': result.get('document_data', {}).get('metadata', {}).get('document_type'),
                    'securities_count': len(result.get('document_data', {}).get('metadata', {}).get('securities', [])),
                    'isins_detected': len([s for s in result.get('document_data', {}).get('metadata', {}).get('securities', []) if s.get('isin')]),
                    'document_type_accuracy': result.get('accuracy_metrics', {}).get('document_type_accuracy', 0.0),
                    'securities_count_accuracy': result.get('accuracy_metrics', {}).get('securities_count_accuracy', 0.0),
                    'isin_detection_accuracy': result.get('accuracy_metrics', {}).get('isin_detection_accuracy', 0.0),
                    'portfolio_summary_accuracy': result.get('accuracy_metrics', {}).get('portfolio_summary_accuracy', 0.0),
                    'asset_allocation_accuracy': result.get('accuracy_metrics', {}).get('asset_allocation_accuracy', 0.0),
                    'overall_accuracy': result.get('accuracy_metrics', {}).get('overall_accuracy', 0.0)
                })
        
        if summary_data:
            df = pd.DataFrame(summary_data)
            df.to_csv(csv_path, index=False)
            logger.info(f"Summary CSV saved to {csv_path}")
    
    def analyze_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze test results.
        
        Args:
            results: List of test results
            
        Returns:
            Dictionary with analysis results
        """
        logger.info("Analyzing test results")
        
        # Count successful and failed tests
        successful_tests = [r for r in results if r.get('success')]
        failed_tests = [r for r in results if not r.get('success')]
        
        # Calculate average processing time
        avg_processing_time = sum(r.get('processing_time', 0) for r in successful_tests) / len(successful_tests) if successful_tests else 0
        
        # Calculate average accuracy metrics
        accuracy_metrics = {}
        for metric in ['document_type_accuracy', 'securities_count_accuracy', 'isin_detection_accuracy', 'portfolio_summary_accuracy', 'asset_allocation_accuracy', 'overall_accuracy']:
            values = [r.get('accuracy_metrics', {}).get(metric, 0) for r in successful_tests if metric in r.get('accuracy_metrics', {})]
            accuracy_metrics[metric] = sum(values) / len(values) if values else 0
        
        # Identify common errors
        error_counts = {}
        for result in failed_tests:
            error = result.get('error', 'Unknown error')
            error_counts[error] = error_counts.get(error, 0) + 1
        
        # Sort errors by count
        sorted_errors = sorted(error_counts.items(), key=lambda x: x[1], reverse=True)
        
        # Identify PDFs with lowest accuracy
        lowest_accuracy_pdfs = sorted(
            [r for r in successful_tests if 'accuracy_metrics' in r and 'overall_accuracy' in r.get('accuracy_metrics', {})],
            key=lambda x: x.get('accuracy_metrics', {}).get('overall_accuracy', 0)
        )[:5]
        
        # Identify PDFs with highest accuracy
        highest_accuracy_pdfs = sorted(
            [r for r in successful_tests if 'accuracy_metrics' in r and 'overall_accuracy' in r.get('accuracy_metrics', {})],
            key=lambda x: x.get('accuracy_metrics', {}).get('overall_accuracy', 0),
            reverse=True
        )[:5]
        
        analysis = {
            'total_tests': len(results),
            'successful_tests': len(successful_tests),
            'failed_tests': len(failed_tests),
            'success_rate': len(successful_tests) / len(results) if results else 0,
            'avg_processing_time': avg_processing_time,
            'accuracy_metrics': accuracy_metrics,
            'common_errors': sorted_errors,
            'lowest_accuracy_pdfs': [
                {
                    'pdf_file': r.get('pdf_file'),
                    'overall_accuracy': r.get('accuracy_metrics', {}).get('overall_accuracy', 0)
                }
                for r in lowest_accuracy_pdfs
            ],
            'highest_accuracy_pdfs': [
                {
                    'pdf_file': r.get('pdf_file'),
                    'overall_accuracy': r.get('accuracy_metrics', {}).get('overall_accuracy', 0)
                }
                for r in highest_accuracy_pdfs
            ]
        }
        
        # Save analysis
        analysis_path = os.path.join(self.output_dir, 'analysis.json')
        with open(analysis_path, 'w') as f:
            json.dump(analysis, f, indent=2)
        
        logger.info(f"Analysis saved to {analysis_path}")
        
        return analysis

def main():
    """
    Main function.
    """
    parser = argparse.ArgumentParser(description='PDF Processing Test Framework')
    parser.add_argument('--pdf_dir', type=str, default='test_pdfs', help='Directory containing PDF files')
    parser.add_argument('--expected_data_dir', type=str, default='expected_data', help='Directory containing expected data files')
    parser.add_argument('--output_dir', type=str, default='test_results', help='Directory for output files')
    parser.add_argument('--max_workers', type=int, default=4, help='Maximum number of worker threads')
    
    args = parser.parse_args()
    
    # Create tester
    tester = PDFProcessingTester(args.pdf_dir, args.expected_data_dir, args.output_dir)
    
    # Run tests
    results = tester.run_tests(args.max_workers)
    
    # Analyze results
    analysis = tester.analyze_results(results)
    
    # Print summary
    logger.info("\n=== Test Summary ===")
    logger.info(f"Total tests: {analysis['total_tests']}")
    logger.info(f"Successful tests: {analysis['successful_tests']}")
    logger.info(f"Failed tests: {analysis['failed_tests']}")
    logger.info(f"Success rate: {analysis['success_rate']:.2%}")
    logger.info(f"Average processing time: {analysis['avg_processing_time']:.2f} seconds")
    
    logger.info("\n=== Accuracy Metrics ===")
    for metric, value in analysis['accuracy_metrics'].items():
        logger.info(f"{metric}: {value:.2%}")
    
    logger.info("\n=== Common Errors ===")
    for error, count in analysis['common_errors']:
        logger.info(f"{error}: {count}")
    
    logger.info("\n=== Lowest Accuracy PDFs ===")
    for pdf in analysis['lowest_accuracy_pdfs']:
        logger.info(f"{pdf['pdf_file']}: {pdf['overall_accuracy']:.2%}")
    
    logger.info("\n=== Highest Accuracy PDFs ===")
    for pdf in analysis['highest_accuracy_pdfs']:
        logger.info(f"{pdf['pdf_file']}: {pdf['overall_accuracy']:.2%}")

if __name__ == "__main__":
    main()
