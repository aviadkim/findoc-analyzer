#!/usr/bin/env python
"""
Test script for document type detection
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
    """Main function to test document type detection"""
    # Get the path to the messos PDF
    pdf_path = "../../frontend/public/messos.pdf"
    
    # Check if the file exists
    if not os.path.exists(pdf_path):
        logger.error(f"File not found: {pdf_path}")
        return
    
    logger.info(f"Testing document type detection with file: {pdf_path}")
    
    # Create a PDF processor
    processor = PDFProcessor()
    
    try:
        # Extract text from the PDF
        text = processor.extract_text(pdf_path)
        
        # Detect document type
        doc_type = processor.detect_document_type(text)
        
        # Print the detected document type
        logger.info(f"Detected document type: {doc_type}")
        
        # Test with different document types
        test_texts = {
            "account_statement": """
            Account Statement
            Transaction History
            Balance: $10,000
            Date: 2023-01-01
            """,
            "fund_fact_sheet": """
            Fund Fact Sheet
            Performance: 10%
            Expense Ratio: 0.5%
            Fund Objective: Growth
            """,
            "financial_report": """
            Annual Report
            Income Statement
            Balance Sheet
            Cash Flow Statement
            """
        }
        
        # Test each document type
        for test_type, test_text in test_texts.items():
            detected_type = processor.detect_document_type(test_text)
            logger.info(f"Test text for {test_type}: Detected as {detected_type}")
        
    except Exception as e:
        logger.error(f"Error testing document type detection: {e}", exc_info=True)

if __name__ == "__main__":
    main()
