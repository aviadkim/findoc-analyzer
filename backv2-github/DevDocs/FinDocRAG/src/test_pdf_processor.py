#!/usr/bin/env python
"""
Test script for the PDF processor
"""
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import the PDF processor
from pdf_processor import PDFProcessor

def main():
    """Main function to test the PDF processor"""
    # Get the path to the messos PDF
    pdf_path = "../../frontend/public/messos.pdf"
    
    # Check if the file exists
    if not os.path.exists(pdf_path):
        logger.error(f"File not found: {pdf_path}")
        return
    
    logger.info(f"Testing PDF processor with file: {pdf_path}")
    
    # Create a PDF processor
    processor = PDFProcessor()
    
    try:
        # Process the PDF
        results = processor.process_pdf(pdf_path)
        
        # Print the results
        logger.info(f"Document type: {results.get('document_type', 'Unknown')}")
        logger.info(f"Found {len(results['isins'])} ISINs")
        logger.info(f"Found {len(results['tables'])} tables")
        logger.info(f"Extracted {len(results['securities'])} securities")
        
        # Print portfolio analysis
        portfolio = results['portfolio_analysis']
        logger.info(f"Total value: {portfolio['total_value']} {portfolio['currency']}")
        logger.info(f"Asset allocation: {portfolio['asset_allocation']}")
        
        # Save the results
        output_path = processor.save_results(results, "test_results")
        logger.info(f"Results saved to: {output_path}")
        
    except Exception as e:
        logger.error(f"Error processing PDF: {e}", exc_info=True)

if __name__ == "__main__":
    main()
