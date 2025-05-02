"""
Test script for the grid analyzer.
"""

import os
import sys
import json
import logging
import argparse
from grid_analyzer import GridAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_grid_analyzer(pdf_path: str, output_dir: str, debug: bool = False, use_ocr: bool = False):
    """
    Test the grid analyzer on a PDF file.

    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save output files
        debug: Whether to print debug information
        use_ocr: Whether to use OCR for text extraction
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Get PDF filename without extension
    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]

    # Create grid analyzer
    analyzer = GridAnalyzer(debug=debug, use_ocr=use_ocr)

    # Analyze PDF
    logger.info(f"Analyzing grid structures in {pdf_path}")
    grid_analysis = analyzer.analyze_pdf(pdf_path)

    # Save grid analysis
    grid_analysis_path = os.path.join(output_dir, f"{pdf_name}_grid_analysis.json")
    
    # Remove dataframes from grid analysis (not JSON serializable)
    for table in grid_analysis["tables"]:
        if "dataframe" in table:
            del table["dataframe"]

    with open(grid_analysis_path, 'w', encoding='utf-8') as f:
        json.dump(grid_analysis, f, indent=2, ensure_ascii=False)

    logger.info(f"Saved grid analysis to {grid_analysis_path}")

    # Extract securities
    logger.info(f"Extracting securities from {pdf_path}")
    securities = analyzer.extract_securities(pdf_path)

    # Save securities
    securities_path = os.path.join(output_dir, f"{pdf_name}_securities.json")
    with open(securities_path, 'w', encoding='utf-8') as f:
        json.dump(securities, f, indent=2, ensure_ascii=False)

    logger.info(f"Saved securities to {securities_path}")

    # Print summary
    logger.info(f"Found {len(grid_analysis['tables'])} tables")
    logger.info(f"Extracted {len(securities)} securities")

    # Print securities
    for i, security in enumerate(securities):
        logger.info(f"\nSecurity {i+1}:")
        logger.info(f"  ISIN: {security.get('isin', 'Unknown')}")
        logger.info(f"  Description: {security.get('description', 'Unknown')}")
        logger.info(f"  Nominal Value: {security.get('nominal_value', 'Unknown')}")
        logger.info(f"  Price: {security.get('price', 'Unknown')}")
        logger.info(f"  Actual Value: {security.get('actual_value', 'Unknown')}")
        logger.info(f"  Currency: {security.get('currency', 'Unknown')}")
        logger.info(f"  Maturity: {security.get('maturity', 'Unknown')}")
        logger.info(f"  Coupon: {security.get('coupon', 'Unknown')}")
        logger.info(f"  Source: Table {security.get('source_table', 'Unknown')} on page {security.get('source_page', 'Unknown')}")
        logger.info(f"  Valid ISIN: {security.get('is_valid_isin', False)}")

def main():
    """
    Main function.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test the grid analyzer on a PDF file.')
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('--output-dir', default='src/uploads', help='Directory to save output files')
    parser.add_argument('--debug', action='store_true', help='Print debug information')
    parser.add_argument('--use-ocr', action='store_true', help='Use OCR for text extraction')

    args = parser.parse_args()

    # Test grid analyzer
    test_grid_analyzer(args.pdf_path, args.output_dir, args.debug, args.use_ocr)

if __name__ == "__main__":
    main()
