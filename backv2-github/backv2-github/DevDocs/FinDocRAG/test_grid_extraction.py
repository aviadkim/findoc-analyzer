"""
Test script for the grid-based securities extraction.

This script tests the grid-based approach for securities extraction using
the GridAnalyzer and SecurityExtractor.
"""

import os
import sys
import logging
import json
import argparse
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Import the extractors
try:
    from extractors.grid_analyzer import GridAnalyzer
    from extractors.enhanced_securities_extractor import SecurityExtractor
    GRID_AVAILABLE = True
except ImportError:
    logger.warning("Grid analyzer not available")
    GRID_AVAILABLE = False

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

def test_grid_analyzer(pdf_path: str, output_path: Optional[str] = None):
    """
    Test the grid analyzer.
    
    Args:
        pdf_path: Path to the PDF file
        output_path: Path to save the output JSON
    """
    if not GRID_AVAILABLE:
        logger.error("Grid analyzer not available")
        print("Grid analyzer not available")
        return None
    
    logger.info(f"Testing grid analyzer on {pdf_path}")
    
    # Create grid analyzer
    analyzer = GridAnalyzer(debug=True)
    
    # Analyze PDF
    grid_analysis = analyzer.analyze_pdf(pdf_path)
    
    # Extract securities
    securities = analyzer.extract_securities(pdf_path)
    
    # Print summary
    print(f"Found {len(grid_analysis['tables'])} tables")
    print(f"Extracted {len(securities)} securities")
    
    # Print securities
    for i, security in enumerate(securities):
        print(f"\nSecurity {i+1}:")
        print(f"  ISIN: {security.get('isin', 'Unknown')}")
        print(f"  Description: {security.get('description', 'Unknown')}")
        print(f"  Nominal Value: {security.get('nominal_value', 'Unknown')}")
        print(f"  Price: {security.get('price', 'Unknown')}")
        print(f"  Actual Value: {security.get('actual_value', 'Unknown')}")
        print(f"  Currency: {security.get('currency', 'Unknown')}")
        print(f"  Maturity: {security.get('maturity', 'Unknown')}")
        print(f"  Coupon: {security.get('coupon', 'Unknown')}")
        print(f"  Source: Table {security.get('source_table', 'Unknown')} on page {security.get('source_page', 'Unknown')}")
    
    # Save output
    if output_path:
        output = {
            "grid_analysis": {
                "tables_count": len(grid_analysis["tables"]),
                "table_structures": grid_analysis["table_structures"],
                "table_relationships": grid_analysis["table_relationships"]
            },
            "securities": securities
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        print(f"\nSaved grid analysis to {output_path}")
    
    return securities

def test_security_extractor(pdf_path: str, output_path: Optional[str] = None):
    """
    Test the security extractor.
    
    Args:
        pdf_path: Path to the PDF file
        output_path: Path to save the output JSON
    """
    if not GRID_AVAILABLE:
        logger.error("Security extractor not available")
        print("Security extractor not available")
        return None
    
    logger.info(f"Testing security extractor on {pdf_path}")
    
    # Create security extractor
    extractor = SecurityExtractor(debug=True)
    
    # Extract securities
    result = extractor.extract_from_pdf(pdf_path)
    
    # Print summary
    print(f"\nDocument Type: {result['document_type']}")
    
    if "portfolio_summary" in result:
        print("\nPortfolio Summary:")
        for key, value in result["portfolio_summary"].items():
            print(f"  {key}: {value}")
    
    if "asset_allocation" in result:
        print("\nAsset Allocation:")
        for key, value in result["asset_allocation"].items():
            if isinstance(value, dict):
                print(f"  {key}: {value.get('percentage', 'N/A')}%")
            else:
                print(f"  {key}: {value}")
    
    print(f"\nExtracted {len(result['securities'])} securities")
    
    # Print securities
    for i, security in enumerate(result['securities']):
        print(f"\nSecurity {i+1}:")
        print(f"  ISIN: {security.get('isin', 'Unknown')}")
        print(f"  Description: {security.get('description', 'Unknown')}")
        print(f"  Nominal Value: {security.get('nominal_value', security.get('nominal', 'Unknown'))}")
        print(f"  Price: {security.get('price', 'Unknown')}")
        print(f"  Actual Value: {security.get('actual_value', security.get('value', 'Unknown'))}")
        print(f"  Currency: {security.get('currency', 'Unknown')}")
        print(f"  Maturity: {security.get('maturity', 'Unknown')}")
        print(f"  Coupon: {security.get('coupon', 'Unknown')}")
    
    # Save output
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\nSaved security extraction to {output_path}")
    
    return result

def main():
    """
    Main function.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test grid-based securities extraction.')
    parser.add_argument('--pdf', type=str, help='Path to the PDF file')
    parser.add_argument('--grid-output', type=str, help='Path to save the grid analysis output')
    parser.add_argument('--extractor-output', type=str, help='Path to save the security extractor output')
    parser.add_argument('--grid-only', action='store_true', help='Only test the grid analyzer')
    parser.add_argument('--extractor-only', action='store_true', help='Only test the security extractor')
    
    args = parser.parse_args()
    
    # Get the PDF path
    pdf_path = args.pdf
    
    if not pdf_path:
        # Try to find the messos PDF
        pdf_path = find_messos_pdf()
        
        if not pdf_path:
            logger.error("No PDF file specified and could not find messos PDF")
            print("No PDF file specified and could not find messos PDF")
            return
    
    # Set output paths
    grid_output = args.grid_output or f"{os.path.splitext(pdf_path)[0]}_grid_analysis.json"
    extractor_output = args.extractor_output or f"{os.path.splitext(pdf_path)[0]}_enhanced_extraction.json"
    
    # Test grid analyzer
    if not args.extractor_only:
        print("\n=================================================")
        print("  Testing Grid Analyzer")
        print("=================================================")
        
        grid_securities = test_grid_analyzer(pdf_path, grid_output)
        
        if grid_securities:
            print(f"\nGrid Analyzer extracted {len(grid_securities)} securities")
    
    # Test security extractor
    if not args.grid_only:
        print("\n=================================================")
        print("  Testing Security Extractor")
        print("=================================================")
        
        extractor_result = test_security_extractor(pdf_path, extractor_output)
        
        if extractor_result:
            print(f"\nSecurity Extractor extracted {len(extractor_result['securities'])} securities")
    
    print("\n=================================================")
    print("  Testing Complete")
    print("=================================================")

if __name__ == "__main__":
    main()
