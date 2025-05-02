"""
Test script for Phase 1 improvements.

This script tests the enhanced table extraction and document type detection.
"""

import os
import sys
import json
import logging
import argparse
from typing import List, Dict, Any
import pandas as pd

# Import our modules
from enhanced_table_extractor import EnhancedTableExtractor
from document_type_detector import DocumentTypeDetector
from grid_analyzer import GridAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_document_type_detection(pdf_path: str, output_dir: str):
    """
    Test document type detection.

    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save the output
    """
    logger.info("Testing document type detection...")
    
    # Create detector
    detector = DocumentTypeDetector(debug=True)
    
    # Detect document type
    result = detector.detect_document_type(pdf_path)
    
    # Save result
    output_path = os.path.join(output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_document_type.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Document type: {result['document_type']} (confidence: {result['confidence']:.2f})")
    logger.info(f"Document type detection result saved to {output_path}")
    
    return result

def test_enhanced_table_extraction(pdf_path: str, output_dir: str):
    """
    Test enhanced table extraction.

    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save the output
    """
    logger.info("Testing enhanced table extraction...")
    
    # Create extractor
    extractor = EnhancedTableExtractor(debug=True)
    
    # Extract tables
    tables = extractor.extract_tables(pdf_path)
    
    # Remove DataFrames before serializing to JSON
    for table in tables["tables"]:
        if "dataframe" in table:
            del table["dataframe"]
    
    # Save result
    output_path = os.path.join(output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_enhanced_tables.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(tables, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Extracted {len(tables['tables'])} tables using methods: {', '.join(tables['metadata']['extraction_methods'])}")
    logger.info(f"Enhanced table extraction result saved to {output_path}")
    
    return tables

def test_grid_analysis(pdf_path: str, output_dir: str):
    """
    Test grid analysis with enhanced column detection.

    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save the output
    """
    logger.info("Testing grid analysis with enhanced column detection...")
    
    # Create analyzer
    analyzer = GridAnalyzer(debug=True)
    
    # Analyze PDF
    grid_analysis = analyzer.analyze_pdf(pdf_path)
    
    # Extract securities
    securities = analyzer.extract_securities(pdf_path)
    
    # Remove DataFrames before serializing to JSON
    for table in grid_analysis["tables"]:
        if "dataframe" in table:
            del table["dataframe"]
    
    # Save grid analysis
    grid_output_path = os.path.join(output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_grid_analysis.json")
    with open(grid_output_path, 'w', encoding='utf-8') as f:
        json.dump(grid_analysis, f, indent=2, ensure_ascii=False)
    
    # Save securities
    securities_output_path = os.path.join(output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_securities.json")
    with open(securities_output_path, 'w', encoding='utf-8') as f:
        json.dump(securities, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Found {len(grid_analysis['tables'])} tables")
    logger.info(f"Extracted {len(securities)} securities")
    logger.info(f"Grid analysis result saved to {grid_output_path}")
    logger.info(f"Securities result saved to {securities_output_path}")
    
    return grid_analysis, securities

def main():
    """
    Main function.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test Phase 1 improvements.')
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('--output-dir', default='src/reports', help='Directory to save the output')
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Test document type detection
    document_type_result = test_document_type_detection(args.pdf_path, args.output_dir)
    
    # Test enhanced table extraction
    tables_result = test_enhanced_table_extraction(args.pdf_path, args.output_dir)
    
    # Test grid analysis
    grid_analysis, securities = test_grid_analysis(args.pdf_path, args.output_dir)
    
    # Print summary
    print("\nPhase 1 Testing Summary:")
    print(f"Document Type: {document_type_result['document_type']} (confidence: {document_type_result['confidence']:.2f})")
    print(f"Tables Extracted: {len(tables_result['tables'])} using methods: {', '.join(tables_result['metadata']['extraction_methods'])}")
    print(f"Securities Extracted: {len(securities)}")
    
    # Print securities details
    print("\nExtracted Securities:")
    for i, security in enumerate(securities[:5]):  # Show first 5 securities
        print(f"\nSecurity {i+1}:")
        print(f"  ISIN: {security.get('isin', 'Unknown')}")
        print(f"  Description: {security.get('description', 'Unknown')}")
        print(f"  Nominal Value: {security.get('nominal_value', 'Unknown')}")
        print(f"  Price: {security.get('price', 'Unknown')}")
        print(f"  Acquisition Price: {security.get('acquisition_price', 'Unknown')}")
        print(f"  Actual Value: {security.get('actual_value', 'Unknown')}")
        print(f"  Currency: {security.get('currency', 'Unknown')}")
        print(f"  Weight: {security.get('weight', 'Unknown')}%")
    
    if len(securities) > 5:
        print(f"\n... and {len(securities) - 5} more securities")

if __name__ == "__main__":
    main()
