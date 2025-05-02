"""
Test the improved securities extraction on the Messos PDF.

This script tests the enhanced financial document processing capabilities
by processing the Messos PDF and displaying the results.
"""

import os
import sys
import argparse
import json
from typing import Dict, Any
import pandas as pd
from tabulate import tabulate

# Add the parent directory to the path to import the enhanced_processing package
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the enhanced processing module
from backend.enhanced_processing.improved_securities_extractor import ImprovedSecuritiesExtractor

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Test Messos PDF extraction')

    parser.add_argument(
        '--output-dir',
        help='Directory to save output files',
        default='test_output'
    )

    parser.add_argument(
        '--debug',
        help='Enable debug mode',
        action='store_true'
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

def create_messos_pdf(output_path):
    """
    Create a simplified version of the Messos portfolio statement.

    Args:
        output_path: Path to save the PDF
    """
    try:
        from fpdf import FPDF

        # Create a PDF object
        pdf = FPDF()
        pdf.add_page()

        # Set font
        pdf.set_font("Arial", "B", 16)

        # Add title and header
        pdf.cell(0, 10, "MESSOS ENTERPRISES LTD.", ln=True, align="C")
        pdf.set_font("Arial", "", 12)
        pdf.cell(0, 10, "Valuation as of 28.02.2025", ln=True, align="C")
        pdf.cell(0, 10, "Client Number: 366223", ln=True, align="C")
        pdf.ln(10)

        # Add section title
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Bonds", ln=True)
        pdf.ln(5)

        # Create table headers
        pdf.set_font("Arial", "B", 10)
        pdf.cell(20, 10, "Currency", border=1)
        pdf.cell(30, 10, "Nominal Quantity", border=1)
        pdf.cell(50, 10, "Description", border=1)
        pdf.cell(30, 10, "Avg Acq Price", border=1)
        pdf.cell(20, 10, "Actual Price", border=1)
        pdf.cell(20, 10, "Perf YTD", border=1)
        pdf.cell(20, 10, "Perf Total", border=1)
        pdf.cell(30, 10, "Valuation", border=1)
        pdf.cell(20, 10, "% Assets", border=1)
        pdf.ln()

        # Add table data
        pdf.set_font("Arial", "", 10)

        # Sample data from the image
        data = [
            ["USD", "200'000", "TORONTO DOMINION BANK NOTES 23-23.02.27 REG-S VRN\nISIN: XS2530507273", "100.2000", "99.3080", "0.36%", "-0.89%", "198'745", "1.02%"],
            ["USD", "200'000", "CANADIAN IMPERIAL BANK OF COMMERCE NOTES 23-22.08.28 VRN\nISIN: XS2568105036", "100.2000", "99.5002", "0.34%", "-0.70%", "199'172", "1.02%"],
            ["USD", "1'500'000", "HARP ISSUER (4% MIN/5,5% MAX) NOTES 2023-18.09.2028\nISIN: XS2565592833", "99.0990", "98.3900", "1.51%", "-0.72%", "1'502'850", "7.70%"],
            ["USD", "690'000", "GOLDMAN SACHS 0% NOTES 23-07.11.29 SERIES P\nISIN: XS2692298537", "100.1000", "106.5700", "1.92%", "6.46%", "735'333", "3.77%"],
            ["USD", "100'000", "LUMINIS (4.2 % MIN/5,5 % MAX) NOTES 2024-17.01.30\nISIN: XS2754416961", "100.2000", "97.6600", "1.70%", "-2.53%", "98'271", "0.50%"]
        ]

        for row in data:
            pdf.cell(20, 10, row[0], border=1)
            pdf.cell(30, 10, row[1], border=1)

            # Handle multi-line description
            description_lines = row[2].split("\n")
            pdf.multi_cell(50, 5, row[2], border=1)

            # Reset position for next cells
            pdf.set_xy(pdf.get_x() + 100, pdf.get_y() - 10)

            pdf.cell(30, 10, row[3], border=1)
            pdf.cell(20, 10, row[4], border=1)
            pdf.cell(20, 10, row[5], border=1)
            pdf.cell(20, 10, row[6], border=1)
            pdf.cell(30, 10, row[7], border=1)
            pdf.cell(20, 10, row[8], border=1)
            pdf.ln()

        # Save the PDF
        pdf.output(output_path)

        print(f"Messos PDF created: {output_path}")
        return True
    except Exception as e:
        print(f"Error creating Messos PDF: {str(e)}")
        return False

def main():
    """Main function."""
    # Parse arguments
    args = parse_arguments()

    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)

    # Create sample documents directory if it doesn't exist
    sample_dir = os.path.join(args.output_dir, "sample_documents")
    os.makedirs(sample_dir, exist_ok=True)

    # Create Messos PDF
    messos_pdf_path = os.path.join(sample_dir, "messos_portfolio.pdf")
    if not os.path.exists(messos_pdf_path):
        if not create_messos_pdf(messos_pdf_path):
            print("Failed to create Messos PDF. Exiting.")
            sys.exit(1)

    print(f"Testing extraction on: {messos_pdf_path}")
    print(f"Output directory: {args.output_dir}")
    print(f"Debug mode: {'enabled' if args.debug else 'disabled'}")

    # Initialize extractor
    extractor = ImprovedSecuritiesExtractor(
        debug=args.debug,
        output_dir=args.output_dir
    )

    # Extract securities
    try:
        result = extractor.extract_securities(messos_pdf_path)

        # Display results
        print("\nExtraction Complete")
        print(f"Securities Count: {result.get('securities_count')}")

        # Display securities
        display_securities(result.get('securities'))

        # Save results to file
        results_path = os.path.join(args.output_dir, "messos_extraction_results.json")
        with open(results_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        print(f"\nDetailed results saved to: {results_path}")

    except Exception as e:
        print(f"Error extracting securities: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
