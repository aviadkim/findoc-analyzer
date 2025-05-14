#!/usr/bin/env python3
"""
Batch processor for financial PDFs using the enhanced securities extractor.

This script processes multiple PDF files and extracts securities information,
saving the results to JSON files. It can be used for batch processing in 
production environments.
"""

import os
import sys
import json
import argparse
import glob
import time
import logging
from concurrent.futures import ProcessPoolExecutor
from enhanced_securities_extractor import SecurityExtractor, configure_file_logging

def setup_logging(log_file, verbose):
    """Set up logging configuration."""
    # Configure logging
    log_level = logging.DEBUG if verbose else logging.INFO
    
    # Create file handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(log_level)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    
    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    return root_logger

def process_pdf(pdf_path, output_dir, debug=False):
    """Process a single PDF file and save the results."""
    start_time = time.time()
    
    try:
        # Create an extractor instance
        extractor = SecurityExtractor(debug=debug)
        
        # Extract securities from the PDF
        result = extractor.extract_from_pdf(pdf_path)
        
        # Create output filename
        basename = os.path.basename(pdf_path)
        output_filename = os.path.splitext(basename)[0] + '_extracted.json'
        output_path = os.path.join(output_dir, output_filename)
        
        # Save the result to a JSON file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Return success result
        return {
            'pdf_path': pdf_path,
            'output_path': output_path,
            'processing_time': processing_time,
            'securities_count': len(result.get('securities', [])),
            'document_type': result.get('document_type', 'unknown'),
            'error': result.get('error'),
            'success': result.get('error') is None
        }
    except Exception as e:
        # Calculate processing time even for failures
        processing_time = time.time() - start_time
        
        # Return error result
        return {
            'pdf_path': pdf_path,
            'processing_time': processing_time,
            'error': str(e),
            'success': False
        }

def main():
    """Main function to parse arguments and process PDFs."""
    parser = argparse.ArgumentParser(description='Batch process financial PDFs to extract securities.')
    parser.add_argument('pdf_paths', nargs='+', help='PDF files or glob patterns (e.g., "*.pdf" or "folder/*.pdf")')
    parser.add_argument('-o', '--output-dir', default='output', help='Output directory for JSON files')
    parser.add_argument('-p', '--parallel', type=int, default=1, help='Number of parallel processes')
    parser.add_argument('-v', '--verbose', action='store_true', help='Enable verbose logging')
    parser.add_argument('-d', '--debug', action='store_true', help='Enable debug mode')
    parser.add_argument('-l', '--log-file', default='batch_processing.log', help='Log file path')
    parser.add_argument('-s', '--summary', default='processing_summary.json', help='Summary output file')
    
    args = parser.parse_args()
    
    # Set up logging
    logger = setup_logging(args.log_file, args.verbose)
    logger.info(f"Starting batch processing with parallel={args.parallel}")
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Expand glob patterns to get list of PDF files
    pdf_files = []
    for path in args.pdf_paths:
        if '*' in path or '?' in path:
            # It's a glob pattern
            matching_files = glob.glob(path, recursive=True)
            pdf_files.extend(matching_files)
        elif os.path.isdir(path):
            # It's a directory - include all PDFs in it
            matching_files = glob.glob(os.path.join(path, '**', '*.pdf'), recursive=True)
            pdf_files.extend(matching_files)
        elif os.path.exists(path) and path.lower().endswith('.pdf'):
            # It's a single PDF file
            pdf_files.append(path)
    
    # Remove duplicates and sort
    pdf_files = sorted(set(pdf_files))
    
    if not pdf_files:
        logger.error("No PDF files found matching the provided patterns")
        sys.exit(1)
    
    logger.info(f"Found {len(pdf_files)} PDF files to process")
    
    # Track processing stats
    stats = {
        'total_files': len(pdf_files),
        'success_count': 0,
        'error_count': 0,
        'start_time': time.time(),
        'results': []
    }
    
    # Process PDFs
    with ProcessPoolExecutor(max_workers=args.parallel) as executor:
        # Create tasks for parallel execution
        futures = [executor.submit(process_pdf, pdf_path, args.output_dir, args.debug) 
                  for pdf_path in pdf_files]
        
        # Process results as they complete
        for i, future in enumerate(futures):
            try:
                result = future.result()
                stats['results'].append(result)
                
                if result['success']:
                    stats['success_count'] += 1
                    logger.info(f"[{i+1}/{len(pdf_files)}] Successfully processed: {result['pdf_path']} "
                               f"(time: {result['processing_time']:.2f}s, securities: {result.get('securities_count', 0)})")
                else:
                    stats['error_count'] += 1
                    logger.error(f"[{i+1}/{len(pdf_files)}] Failed to process: {result['pdf_path']} "
                                f"(time: {result['processing_time']:.2f}s, error: {result['error']})")
            except Exception as e:
                logger.exception(f"Error retrieving result for task {i+1}")
                stats['error_count'] += 1
    
    # Calculate total processing time
    stats['end_time'] = time.time()
    stats['total_processing_time'] = stats['end_time'] - stats['start_time']
    stats['average_processing_time'] = stats['total_processing_time'] / len(pdf_files) if pdf_files else 0
    
    # Generate summary report
    logger.info(f"Processing complete. "
               f"Processed {stats['total_files']} files in {stats['total_processing_time']:.2f} seconds "
               f"({stats['success_count']} succeeded, {stats['error_count']} failed)")
    
    # Save summary report
    with open(args.summary, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    return 0 if stats['error_count'] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())