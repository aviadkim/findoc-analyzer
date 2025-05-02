"""
Script to test the enhanced securities extractor with the messos PDF.
"""
import os
import sys
import logging
import json
import argparse
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Add the extractors directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'extractors'))

# Import the enhanced securities extractor
from enhanced_securities_extractor import SecurityExtractor

def find_messos_pdf():
    """
    Find the messos PDF file.
    
    Returns:
        Path to the messos PDF file or None if not found
    """
    # Look for the messos PDF in the uploads directory
    uploads_dir = os.path.join(os.path.dirname(__file__), 'src', 'uploads')
    
    if os.path.exists(uploads_dir):
        for file in os.listdir(uploads_dir):
            if 'messos' in file.lower() and file.lower().endswith('.pdf'):
                return os.path.join(uploads_dir, file)
    
    # Look for the messos PDF in the current directory
    for file in os.listdir('.'):
        if 'messos' in file.lower() and file.lower().endswith('.pdf'):
            return os.path.join('.', file)
    
    # Look for the messos PDF in the parent directory
    for file in os.listdir('..'):
        if 'messos' in file.lower() and file.lower().endswith('.pdf'):
            return os.path.join('..', file)
    
    return None

def test_enhanced_extractor(pdf_path, output_path=None):
    """
    Test the enhanced securities extractor with a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        output_path: Path to save the results to
    """
    # Check if the PDF file exists
    if not os.path.exists(pdf_path):
        logger.error(f"PDF file not found: {pdf_path}")
        return
    
    # Create the enhanced securities extractor
    extractor = SecurityExtractor(debug=True)
    
    # Extract securities
    logger.info(f"Extracting securities from {pdf_path}")
    result = extractor.extract_from_pdf(pdf_path)
    
    # Save the results
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Results saved to {output_path}")
    
    # Print summary
    print(f"\nDocument Type: {result['document_type']}")
    
    if "portfolio_summary" in result:
        print("\nPortfolio Summary:")
        for key, value in result["portfolio_summary"].items():
            print(f"  {key}: {value}")
    
    if "asset_allocation" in result:
        print("\nAsset Allocation:")
        for key, value in result["asset_allocation"].items():
            if value:
                print(f"  {key}: {value.get('value', 'N/A')} ({value.get('percentage', 'N/A')})")
    
    print(f"\nFound {len(result['securities'])} securities")
    
    # Print first 3 securities as example
    for i, security in enumerate(result["securities"][:3]):
        print(f"\nSecurity {i+1}:")
        print(f"  ISIN: {security.get('isin', 'Unknown')}")
        print(f"  Description: {security.get('description', 'Unknown')}")
        print(f"  Type: {security.get('type', 'Unknown')}")
        print(f"  Nominal: {security.get('nominal', 'Unknown')}")
        print(f"  Value: {security.get('value', 'Unknown')}")
        print(f"  Currency: {security.get('currency', 'Unknown')}")
        print(f"  Maturity: {security.get('maturity', 'Unknown')}")
        print(f"  Coupon: {security.get('coupon', 'Unknown')}")

def main():
    """
    Main function.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test the enhanced securities extractor with a PDF file.')
    parser.add_argument('--pdf', type=str, help='Path to the PDF file')
    parser.add_argument('--output', type=str, help='Path to save the results to')
    
    args = parser.parse_args()
    
    # Get the PDF path
    pdf_path = args.pdf
    
    if not pdf_path:
        # Try to find the messos PDF
        pdf_path = find_messos_pdf()
        
        if not pdf_path:
            logger.error("No PDF file specified and could not find messos PDF")
            return
    
    # Get the output path
    output_path = args.output
    
    if not output_path:
        output_path = f"{os.path.splitext(pdf_path)[0]}_enhanced.json"
    
    # Test the enhanced extractor
    test_enhanced_extractor(pdf_path, output_path)

if __name__ == "__main__":
    main()
