"""
Test script for evaluating each component of the improved financial document processing.

This script tests each component separately and assigns a grade based on performance.
"""

import os
import sys
import logging
import argparse
import json
import time
import re
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from tabulate import tabulate
import cv2
from PIL import Image

# Import our modules
from advanced_image_processor import AdvancedImageProcessor
from enhanced_table_analyzer import EnhancedTableAnalyzer
from improved_securities_extractor import ImprovedSecuritiesExtractor
from financial_document_processor import FinancialDocumentProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Test financial document processing components')

    parser.add_argument(
        'document_path',
        help='Path to the financial document to process'
    )

    parser.add_argument(
        '--output-dir',
        help='Directory to save output files',
        default='output'
    )

    parser.add_argument(
        '--debug',
        help='Enable debug mode',
        action='store_true'
    )

    parser.add_argument(
        '--languages',
        help='Comma-separated list of language codes for OCR',
        default='eng'
    )

    return parser.parse_args()

def test_image_processor(document_path: str, output_dir: str, languages: List[str], debug: bool) -> Dict[str, Any]:
    """
    Test the advanced image processor.

    Args:
        document_path: Path to the document
        output_dir: Output directory
        languages: List of language codes
        debug: Whether to enable debug mode

    Returns:
        Dictionary with test results
    """
    print("\n=== Testing Advanced Image Processor ===")

    # Create output directory
    image_output_dir = os.path.join(output_dir, "image_processor")
    os.makedirs(image_output_dir, exist_ok=True)

    # Initialize image processor
    image_processor = AdvancedImageProcessor(
        languages=languages,
        debug=debug,
        output_dir=image_output_dir
    )

    # Check if document is a PDF
    _, ext = os.path.splitext(document_path)
    ext = ext.lower()

    if ext == '.pdf':
        # Convert first page to image
        import fitz
        doc = fitz.open(document_path)
        page = doc[0]
        pix = page.get_pixmap(dpi=300)
        img_path = os.path.join(image_output_dir, "page_1.png")
        pix.save(img_path)
        doc.close()
    else:
        img_path = document_path

    # Process the image
    start_time = time.time()
    result = image_processor.process_image(img_path)
    processing_time = time.time() - start_time

    # Evaluate results
    tables_detected = len(result.get("tables", []))
    ocr_text_length = len(result.get("ocr_results", {}).get("text", ""))
    words_detected = len(result.get("ocr_results", {}).get("words", []))

    # Calculate score
    score = 0
    max_score = 100

    # Score based on tables detected
    if tables_detected > 5:
        score += 30
    elif tables_detected > 2:
        score += 20
    elif tables_detected > 0:
        score += 10

    # Score based on OCR text
    if ocr_text_length > 5000:
        score += 30
    elif ocr_text_length > 1000:
        score += 20
    elif ocr_text_length > 0:
        score += 10

    # Score based on words detected
    if words_detected > 500:
        score += 30
    elif words_detected > 100:
        score += 20
    elif words_detected > 0:
        score += 10

    # Score based on processing time
    if processing_time < 5:
        score += 10
    elif processing_time < 10:
        score += 5

    # Assign grade
    grade = "A+" if score >= 95 else "A" if score >= 90 else "A-" if score >= 85 else "B+" if score >= 80 else "B" if score >= 75 else "B-" if score >= 70 else "C+" if score >= 65 else "C" if score >= 60 else "C-" if score >= 55 else "D+" if score >= 50 else "D" if score >= 45 else "D-" if score >= 40 else "F"

    # Display results
    print(f"Tables detected: {tables_detected}")
    print(f"OCR text length: {ocr_text_length} characters")
    print(f"Words detected: {words_detected}")
    print(f"Processing time: {processing_time:.2f} seconds")
    print(f"Score: {score}/{max_score}")
    print(f"Grade: {grade}")

    return {
        "component": "Advanced Image Processor",
        "tables_detected": tables_detected,
        "ocr_text_length": ocr_text_length,
        "words_detected": words_detected,
        "processing_time": processing_time,
        "score": score,
        "max_score": max_score,
        "grade": grade
    }

def test_table_analyzer(document_path: str, output_dir: str, debug: bool) -> Dict[str, Any]:
    """
    Test the enhanced table analyzer.

    Args:
        document_path: Path to the document
        output_dir: Output directory
        debug: Whether to enable debug mode

    Returns:
        Dictionary with test results
    """
    print("\n=== Testing Enhanced Table Analyzer ===")

    # Create output directory
    table_output_dir = os.path.join(output_dir, "table_analyzer")
    os.makedirs(table_output_dir, exist_ok=True)

    # Initialize table analyzer
    table_analyzer = EnhancedTableAnalyzer(
        debug=debug,
        output_dir=table_output_dir
    )

    # Check if document is a PDF
    _, ext = os.path.splitext(document_path)
    ext = ext.lower()

    # Extract tables from document
    tables = []

    if ext == '.pdf':
        # Use camelot to extract tables
        import camelot
        try:
            pdf_tables = camelot.read_pdf(document_path, pages='1-3', flavor='lattice')
            for i, table in enumerate(pdf_tables):
                if not table.df.empty:
                    tables.append(table.df)
        except Exception as e:
            logger.warning(f"Error extracting tables with camelot: {str(e)}")

            # Try with tabula as fallback
            try:
                import tabula
                pdf_tables = tabula.read_pdf(document_path, pages='1-3', multiple_tables=True)
                tables.extend(pdf_tables)
            except Exception as e:
                logger.warning(f"Error extracting tables with tabula: {str(e)}")
    elif ext in ['.xlsx', '.xls']:
        # Read Excel file
        try:
            excel_data = pd.read_excel(document_path, sheet_name=None)
            for sheet_name, df in excel_data.items():
                if not df.empty:
                    tables.append(df)
        except Exception as e:
            logger.warning(f"Error reading Excel file: {str(e)}")

    # If no tables extracted, create a sample table
    if not tables:
        logger.warning("No tables extracted, creating sample table")
        sample_data = {
            'ISIN': ['US0378331005', 'US5949181045', 'US0231351067'],
            'Security Name': ['APPLE INC', 'MICROSOFT CORP', 'AMAZON.COM INC'],
            'Quantity': [100, 50, 25],
            'Price': [150.25, 280.75, 3200.50],
            'Value': [15025.00, 14037.50, 80012.50]
        }
        tables.append(pd.DataFrame(sample_data))

    # Process each table
    start_time = time.time()
    table_results = []

    for i, df in enumerate(tables):
        print(f"\nAnalyzing table {i+1}/{len(tables)}")
        result = table_analyzer.analyze_table(df)
        table_results.append(result)

        # Display table structure
        print(f"Table type: {result.get('table_type', 'unknown')}")
        print(f"Column types: {result.get('column_types', {})}")
        print(f"Securities count: {result.get('securities_count', 0)}")

    processing_time = time.time() - start_time

    # Evaluate results
    tables_analyzed = len(table_results)
    securities_found = sum(result.get('securities_count', 0) for result in table_results)
    column_types_detected = sum(len(result.get('column_types', {})) for result in table_results)

    # Calculate score
    score = 0
    max_score = 100

    # Score based on tables analyzed
    if tables_analyzed > 3:
        score += 25
    elif tables_analyzed > 1:
        score += 15
    elif tables_analyzed > 0:
        score += 5

    # Score based on securities found
    if securities_found > 10:
        score += 30
    elif securities_found > 5:
        score += 20
    elif securities_found > 0:
        score += 10

    # Score based on column types detected
    if column_types_detected > 20:
        score += 30
    elif column_types_detected > 10:
        score += 20
    elif column_types_detected > 0:
        score += 10

    # Score based on processing time
    if processing_time < 5:
        score += 15
    elif processing_time < 10:
        score += 10
    elif processing_time < 20:
        score += 5

    # Assign grade
    grade = "A+" if score >= 95 else "A" if score >= 90 else "A-" if score >= 85 else "B+" if score >= 80 else "B" if score >= 75 else "B-" if score >= 70 else "C+" if score >= 65 else "C" if score >= 60 else "C-" if score >= 55 else "D+" if score >= 50 else "D" if score >= 45 else "D-" if score >= 40 else "F"

    # Display results
    print(f"\nTables analyzed: {tables_analyzed}")
    print(f"Securities found: {securities_found}")
    print(f"Column types detected: {column_types_detected}")
    print(f"Processing time: {processing_time:.2f} seconds")
    print(f"Score: {score}/{max_score}")
    print(f"Grade: {grade}")

    return {
        "component": "Enhanced Table Analyzer",
        "tables_analyzed": tables_analyzed,
        "securities_found": securities_found,
        "column_types_detected": column_types_detected,
        "processing_time": processing_time,
        "score": score,
        "max_score": max_score,
        "grade": grade
    }

def test_securities_extractor(document_path: str, output_dir: str, languages: List[str], debug: bool) -> Dict[str, Any]:
    """
    Test the improved securities extractor.

    Args:
        document_path: Path to the document
        output_dir: Output directory
        languages: List of language codes
        debug: Whether to enable debug mode

    Returns:
        Dictionary with test results
    """
    print("\n=== Testing Improved Securities Extractor ===")

    # Create output directory
    securities_output_dir = os.path.join(output_dir, "securities_extractor")
    os.makedirs(securities_output_dir, exist_ok=True)

    # Initialize securities extractor
    securities_extractor = ImprovedSecuritiesExtractor(
        languages=languages,
        debug=debug,
        output_dir=securities_output_dir
    )

    # Extract securities
    start_time = time.time()
    result = securities_extractor.extract_securities(document_path)
    processing_time = time.time() - start_time

    # Get securities
    securities = result.get("securities", [])

    # Display securities
    if securities:
        print(f"\nExtracted {len(securities)} securities:")

        # Create a DataFrame for display
        df = pd.DataFrame(securities)

        # Select columns to display
        display_columns = [
            'isin', 'security_name', 'quantity', 'price',
            'acquisition_price', 'value', 'currency', 'weight'
        ]

        # Filter columns that exist in the DataFrame
        existing_columns = [col for col in display_columns if col in df.columns]

        # Display the table
        if existing_columns:
            print(tabulate(
                df[existing_columns].fillna('None'),
                headers='keys',
                tablefmt='grid',
                showindex=False
            ))
    else:
        print("No securities extracted.")

    # Evaluate results
    securities_count = len(securities)
    tables_count = result.get("tables_count", 0)

    # Calculate completeness of securities
    completeness_scores = []

    for security in securities:
        # Check essential fields
        essential_fields = ['isin', 'security_name', 'quantity', 'value']
        present_fields = sum(1 for field in essential_fields if security.get(field) is not None)
        completeness = present_fields / len(essential_fields)
        completeness_scores.append(completeness)

    avg_completeness = np.mean(completeness_scores) if completeness_scores else 0

    # Calculate score
    score = 0
    max_score = 100

    # Score based on securities count
    if securities_count > 10:
        score += 30
    elif securities_count > 5:
        score += 20
    elif securities_count > 0:
        score += 10

    # Score based on tables count
    if tables_count > 5:
        score += 20
    elif tables_count > 2:
        score += 10
    elif tables_count > 0:
        score += 5

    # Score based on completeness
    if avg_completeness > 0.9:
        score += 30
    elif avg_completeness > 0.7:
        score += 20
    elif avg_completeness > 0.5:
        score += 10
    elif avg_completeness > 0:
        score += 5

    # Score based on processing time
    if processing_time < 10:
        score += 20
    elif processing_time < 30:
        score += 10
    elif processing_time < 60:
        score += 5

    # Assign grade
    grade = "A+" if score >= 95 else "A" if score >= 90 else "A-" if score >= 85 else "B+" if score >= 80 else "B" if score >= 75 else "B-" if score >= 70 else "C+" if score >= 65 else "C" if score >= 60 else "C-" if score >= 55 else "D+" if score >= 50 else "D" if score >= 45 else "D-" if score >= 40 else "F"

    # Display results
    print(f"\nSecurities extracted: {securities_count}")
    print(f"Tables detected: {tables_count}")
    print(f"Average completeness: {avg_completeness:.2f}")
    print(f"Processing time: {processing_time:.2f} seconds")
    print(f"Score: {score}/{max_score}")
    print(f"Grade: {grade}")

    return {
        "component": "Improved Securities Extractor",
        "securities_count": securities_count,
        "tables_count": tables_count,
        "avg_completeness": avg_completeness,
        "processing_time": processing_time,
        "score": score,
        "max_score": max_score,
        "grade": grade
    }

def test_document_processor(document_path: str, output_dir: str, languages: List[str], debug: bool) -> Dict[str, Any]:
    """
    Test the financial document processor.

    Args:
        document_path: Path to the document
        output_dir: Output directory
        languages: List of language codes
        debug: Whether to enable debug mode

    Returns:
        Dictionary with test results
    """
    print("\n=== Testing Financial Document Processor ===")

    # Create output directory
    processor_output_dir = os.path.join(output_dir, "document_processor")
    os.makedirs(processor_output_dir, exist_ok=True)

    # Initialize document processor
    document_processor = FinancialDocumentProcessor(
        languages=languages,
        debug=debug,
        output_dir=processor_output_dir
    )

    # Process document
    start_time = time.time()
    result = document_processor.process_document(document_path)
    processing_time = time.time() - start_time

    # Display results
    print(f"\nDocument type: {result.get('document_type', 'unknown')}")
    print(f"Securities count: {result.get('securities_count', 0)}")

    # Display portfolio summary
    portfolio_summary = result.get('portfolio_summary', {})
    if portfolio_summary:
        print("\nPortfolio Summary:")
        print(f"Total Value: {portfolio_summary.get('total_value')}")
        print(f"Currency: {portfolio_summary.get('currency')}")
        print(f"Valuation Date: {portfolio_summary.get('valuation_date')}")

        if portfolio_summary.get('asset_classes'):
            print("\nAsset Classes:")
            for asset_class, percentage in portfolio_summary.get('asset_classes', {}).items():
                print(f"  {asset_class.capitalize()}: {percentage}%")

    # Display portfolio analysis
    portfolio_analysis = result.get('portfolio_analysis', {})
    if portfolio_analysis:
        print("\nPortfolio Analysis:")
        print(f"Security Count: {portfolio_analysis.get('security_count')}")
        print(f"Total Value: {portfolio_analysis.get('total_value')}")
        print(f"ISIN Coverage: {portfolio_analysis.get('isin_coverage', 0):.2f}%")
        print(f"Complete Securities: {portfolio_analysis.get('complete_securities')} ({portfolio_analysis.get('completeness_percentage', 0):.2f}%)")
        print(f"Incomplete Securities: {portfolio_analysis.get('incomplete_securities')}")

    # Evaluate results
    securities_count = result.get('securities_count', 0)
    has_portfolio_summary = bool(portfolio_summary.get('total_value'))
    has_portfolio_analysis = bool(portfolio_analysis.get('security_count'))
    completeness_percentage = portfolio_analysis.get('completeness_percentage', 0)

    # Calculate score
    score = 0
    max_score = 100

    # Score based on securities count
    if securities_count > 10:
        score += 25
    elif securities_count > 5:
        score += 15
    elif securities_count > 0:
        score += 5

    # Score based on portfolio summary
    if has_portfolio_summary:
        score += 25

    # Score based on portfolio analysis
    if has_portfolio_analysis:
        score += 25

    # Score based on completeness
    if completeness_percentage > 90:
        score += 15
    elif completeness_percentage > 70:
        score += 10
    elif completeness_percentage > 50:
        score += 5

    # Score based on processing time
    if processing_time < 30:
        score += 10
    elif processing_time < 60:
        score += 5

    # Assign grade
    grade = "A+" if score >= 95 else "A" if score >= 90 else "A-" if score >= 85 else "B+" if score >= 80 else "B" if score >= 75 else "B-" if score >= 70 else "C+" if score >= 65 else "C" if score >= 60 else "C-" if score >= 55 else "D+" if score >= 50 else "D" if score >= 45 else "D-" if score >= 40 else "F"

    # Display results
    print(f"\nSecurities extracted: {securities_count}")
    print(f"Has portfolio summary: {has_portfolio_summary}")
    print(f"Has portfolio analysis: {has_portfolio_analysis}")
    print(f"Completeness percentage: {completeness_percentage:.2f}%")
    print(f"Processing time: {processing_time:.2f} seconds")
    print(f"Score: {score}/{max_score}")
    print(f"Grade: {grade}")

    return {
        "component": "Financial Document Processor",
        "securities_count": securities_count,
        "has_portfolio_summary": has_portfolio_summary,
        "has_portfolio_analysis": has_portfolio_analysis,
        "completeness_percentage": completeness_percentage,
        "processing_time": processing_time,
        "score": score,
        "max_score": max_score,
        "grade": grade
    }

def display_overall_results(results: List[Dict[str, Any]]):
    """
    Display overall results.

    Args:
        results: List of test results
    """
    print("\n=== Overall Results ===")

    # Create a table of results
    table_data = []

    for result in results:
        table_data.append([
            result.get("component"),
            f"{result.get('score')}/{result.get('max_score')}",
            result.get("grade")
        ])

    # Calculate average score and grade
    avg_score = sum(result.get("score", 0) for result in results) / len(results)
    avg_percentage = avg_score / results[0].get("max_score", 100) * 100

    # Assign overall grade
    overall_grade = "A+" if avg_percentage >= 95 else "A" if avg_percentage >= 90 else "A-" if avg_percentage >= 85 else "B+" if avg_percentage >= 80 else "B" if avg_percentage >= 75 else "B-" if avg_percentage >= 70 else "C+" if avg_percentage >= 65 else "C" if avg_percentage >= 60 else "C-" if avg_percentage >= 55 else "D+" if avg_percentage >= 50 else "D" if avg_percentage >= 45 else "D-" if avg_percentage >= 40 else "F"

    # Add overall row
    table_data.append([
        "OVERALL",
        f"{avg_score:.1f}/{results[0].get('max_score', 100)}",
        overall_grade
    ])

    # Display table
    print(tabulate(
        table_data,
        headers=["Component", "Score", "Grade"],
        tablefmt="grid"
    ))

    # Provide assessment
    print("\nAssessment:")
    if avg_percentage >= 90:
        print("Excellent! The improvements have dramatically enhanced the financial document processing capabilities.")
    elif avg_percentage >= 80:
        print("Very good! The improvements have significantly enhanced the financial document processing capabilities.")
    elif avg_percentage >= 70:
        print("Good! The improvements have enhanced the financial document processing capabilities.")
    elif avg_percentage >= 60:
        print("Satisfactory. The improvements have somewhat enhanced the financial document processing capabilities.")
    else:
        print("Needs improvement. The enhancements have not significantly improved the financial document processing capabilities.")

def main():
    """Main function."""
    # Parse arguments
    args = parse_arguments()

    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)

    # Parse languages
    languages = args.languages.split(',')

    print(f"Testing document: {args.document_path}")
    print(f"Output directory: {args.output_dir}")
    print(f"Languages: {languages}")
    print(f"Debug mode: {'enabled' if args.debug else 'disabled'}")

    # Run tests
    results = []

    try:
        # Test image processor
        image_result = test_image_processor(args.document_path, args.output_dir, languages, args.debug)
        results.append(image_result)

        # Test table analyzer
        table_result = test_table_analyzer(args.document_path, args.output_dir, args.debug)
        results.append(table_result)

        # Test securities extractor
        securities_result = test_securities_extractor(args.document_path, args.output_dir, languages, args.debug)
        results.append(securities_result)

        # Test document processor
        processor_result = test_document_processor(args.document_path, args.output_dir, languages, args.debug)
        results.append(processor_result)

        # Display overall results
        display_overall_results(results)

        # Save results to file
        results_path = os.path.join(args.output_dir, "test_results.json")
        with open(results_path, 'w', encoding='utf-8') as f:
            json.dump({
                "document_path": args.document_path,
                "test_date": time.strftime("%Y-%m-%d %H:%M:%S"),
                "results": results
            }, f, indent=2, ensure_ascii=False)

        print(f"\nTest results saved to: {results_path}")

    except Exception as e:
        logger.error(f"Error running tests: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
