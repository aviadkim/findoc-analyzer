"""
Run Enhanced Financial Document Processing.

This script demonstrates the enhanced financial document processing capabilities
by processing a sample document and displaying the results.
"""

import os
import sys
import argparse
import json
from typing import Dict, Any
import pandas as pd
from tabulate import tabulate

# Add the parent directory to the path to import the enhanced_processing package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the enhanced processing module
from enhanced_processing.financial_document_processor import FinancialDocumentProcessor

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Run enhanced financial document processing')
    
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

def display_securities(securities):
    """Display extracted securities in a table format."""
    if not securities:
        print("No securities extracted.")
        return
    
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
        print("\nExtracted Securities:")
        print(tabulate(
            df[existing_columns].fillna('None'), 
            headers='keys', 
            tablefmt='grid',
            showindex=False
        ))
    else:
        print("No relevant security information extracted.")

def display_portfolio_summary(portfolio_summary):
    """Display portfolio summary."""
    if not portfolio_summary:
        print("No portfolio summary extracted.")
        return
    
    print("\nPortfolio Summary:")
    print(f"Total Value: {portfolio_summary.get('total_value')}")
    print(f"Currency: {portfolio_summary.get('currency')}")
    print(f"Valuation Date: {portfolio_summary.get('valuation_date')}")
    
    if portfolio_summary.get('asset_classes'):
        print("\nAsset Classes:")
        for asset_class, percentage in portfolio_summary.get('asset_classes', {}).items():
            print(f"  {asset_class.capitalize()}: {percentage}%")

def display_portfolio_analysis(portfolio_analysis):
    """Display portfolio analysis."""
    if not portfolio_analysis:
        print("No portfolio analysis available.")
        return
    
    print("\nPortfolio Analysis:")
    print(f"Security Count: {portfolio_analysis.get('security_count')}")
    print(f"Total Value: {portfolio_analysis.get('total_value')}")
    print(f"ISIN Coverage: {portfolio_analysis.get('isin_coverage', 0):.2f}%")
    print(f"Complete Securities: {portfolio_analysis.get('complete_securities')} ({portfolio_analysis.get('completeness_percentage', 0):.2f}%)")
    print(f"Incomplete Securities: {portfolio_analysis.get('incomplete_securities')}")
    
    if portfolio_analysis.get('currency_breakdown'):
        print("\nCurrency Breakdown:")
        for currency, percentage in portfolio_analysis.get('currency_breakdown', {}).items():
            print(f"  {currency}: {percentage:.2f}%")

def main():
    """Main function."""
    # Parse arguments
    args = parse_arguments()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Parse languages
    languages = args.languages.split(',')
    
    print(f"Processing document: {args.document_path}")
    print(f"Output directory: {args.output_dir}")
    print(f"Languages: {languages}")
    print(f"Debug mode: {'enabled' if args.debug else 'disabled'}")
    
    # Initialize processor
    processor = FinancialDocumentProcessor(
        languages=languages,
        debug=args.debug,
        output_dir=args.output_dir
    )
    
    # Process document
    try:
        result = processor.process_document(args.document_path)
        
        # Display results
        print("\nDocument Processing Complete")
        print(f"Document Type: {result.get('document_type')}")
        print(f"Securities Count: {result.get('securities_count')}")
        
        # Display securities
        display_securities(result.get('securities'))
        
        # Display portfolio summary
        display_portfolio_summary(result.get('portfolio_summary'))
        
        # Display portfolio analysis
        display_portfolio_analysis(result.get('portfolio_analysis'))
        
        print(f"\nDetailed results saved to: {result.get('results_path')}")
        
    except Exception as e:
        print(f"Error processing document: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
