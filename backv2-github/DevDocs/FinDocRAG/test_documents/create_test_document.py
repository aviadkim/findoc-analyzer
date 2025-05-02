"""
Create a test financial document for testing the enhanced processing system.
"""

import os
import sys
import argparse
from fpdf import FPDF

def create_messos_portfolio_statement(output_path):
    """
    Create a simplified version of the Messos portfolio statement.
    
    Args:
        output_path: Path to save the PDF
    """
    try:
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
        
        # Add portfolio summary
        pdf.ln(10)
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Portfolio Summary", ln=True)
        pdf.ln(5)
        
        # Create summary table
        pdf.set_font("Arial", "B", 10)
        pdf.cell(50, 10, "Asset Class", border=1)
        pdf.cell(30, 10, "Value", border=1)
        pdf.cell(30, 10, "% of Assets", border=1)
        pdf.ln()
        
        # Add summary data
        pdf.set_font("Arial", "", 10)
        pdf.cell(50, 10, "Bonds", border=1)
        pdf.cell(30, 10, "2'734'371", border=1)
        pdf.cell(30, 10, "14.01%", border=1)
        pdf.ln()
        
        pdf.cell(50, 10, "Equities", border=1)
        pdf.cell(30, 10, "8'456'789", border=1)
        pdf.cell(30, 10, "43.32%", border=1)
        pdf.ln()
        
        pdf.cell(50, 10, "Alternative Investments", border=1)
        pdf.cell(30, 10, "5'678'901", border=1)
        pdf.cell(30, 10, "29.09%", border=1)
        pdf.ln()
        
        pdf.cell(50, 10, "Cash", border=1)
        pdf.cell(30, 10, "2'654'321", border=1)
        pdf.cell(30, 10, "13.58%", border=1)
        pdf.ln()
        
        pdf.set_font("Arial", "B", 10)
        pdf.cell(50, 10, "Total", border=1)
        pdf.cell(30, 10, "19'524'382", border=1)
        pdf.cell(30, 10, "100.00%", border=1)
        pdf.ln()
        
        # Save the PDF
        pdf.output(output_path)
        
        print(f"Messos portfolio statement created: {output_path}")
        return True
    except Exception as e:
        print(f"Error creating Messos portfolio statement: {str(e)}")
        return False

def create_goldman_sachs_portfolio_statement(output_path):
    """
    Create a simplified version of a Goldman Sachs portfolio statement.
    
    Args:
        output_path: Path to save the PDF
    """
    try:
        # Create a PDF object
        pdf = FPDF()
        pdf.add_page()
        
        # Set font
        pdf.set_font("Arial", "B", 16)
        
        # Add title and header
        pdf.cell(0, 10, "GOLDMAN SACHS", ln=True, align="C")
        pdf.set_font("Arial", "", 12)
        pdf.cell(0, 10, "Portfolio Statement", ln=True, align="C")
        pdf.cell(0, 10, "As of: March 31, 2025", ln=True, align="C")
        pdf.cell(0, 10, "Account Number: GS-7654321", ln=True, align="C")
        pdf.ln(10)
        
        # Add section title
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Holdings Summary", ln=True)
        pdf.ln(5)
        
        # Create table headers
        pdf.set_font("Arial", "B", 10)
        pdf.cell(50, 10, "Security", border=1)
        pdf.cell(30, 10, "ISIN", border=1)
        pdf.cell(20, 10, "Quantity", border=1)
        pdf.cell(20, 10, "Price", border=1)
        pdf.cell(30, 10, "Market Value", border=1)
        pdf.cell(20, 10, "Weight", border=1)
        pdf.ln()
        
        # Add table data
        pdf.set_font("Arial", "", 10)
        
        # Sample data
        data = [
            ["Apple Inc.", "US0378331005", "500", "175.34", "87,670.00", "8.77%"],
            ["Microsoft Corp.", "US5949181045", "300", "325.78", "97,734.00", "9.77%"],
            ["Amazon.com Inc.", "US0231351067", "200", "178.35", "35,670.00", "3.57%"],
            ["Alphabet Inc. Class A", "US02079K3059", "150", "145.87", "21,880.50", "2.19%"],
            ["NVIDIA Corp.", "US67066G1040", "100", "880.35", "88,035.00", "8.80%"],
            ["Tesla Inc.", "US88160R1014", "200", "175.34", "35,068.00", "3.51%"],
            ["Meta Platforms Inc.", "US30303M1027", "150", "485.58", "72,837.00", "7.28%"],
            ["Berkshire Hathaway Inc. Class B", "US0846707026", "100", "412.56", "41,256.00", "4.13%"],
            ["JPMorgan Chase & Co.", "US46625H1005", "200", "198.56", "39,712.00", "3.97%"],
            ["Johnson & Johnson", "US4781601046", "150", "152.34", "22,851.00", "2.29%"]
        ]
        
        for row in data:
            pdf.cell(50, 10, row[0], border=1)
            pdf.cell(30, 10, row[1], border=1)
            pdf.cell(20, 10, row[2], border=1)
            pdf.cell(20, 10, row[3], border=1)
            pdf.cell(30, 10, row[4], border=1)
            pdf.cell(20, 10, row[5], border=1)
            pdf.ln()
        
        # Add portfolio summary
        pdf.ln(10)
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Asset Allocation", ln=True)
        pdf.ln(5)
        
        # Create summary table
        pdf.set_font("Arial", "B", 10)
        pdf.cell(50, 10, "Asset Class", border=1)
        pdf.cell(30, 10, "Value", border=1)
        pdf.cell(30, 10, "% of Assets", border=1)
        pdf.ln()
        
        # Add summary data
        pdf.set_font("Arial", "", 10)
        pdf.cell(50, 10, "US Equities", border=1)
        pdf.cell(30, 10, "542,713.50", border=1)
        pdf.cell(30, 10, "54.27%", border=1)
        pdf.ln()
        
        pdf.cell(50, 10, "International Equities", border=1)
        pdf.cell(30, 10, "245,678.00", border=1)
        pdf.cell(30, 10, "24.57%", border=1)
        pdf.ln()
        
        pdf.cell(50, 10, "Fixed Income", border=1)
        pdf.cell(30, 10, "156,789.00", border=1)
        pdf.cell(30, 10, "15.68%", border=1)
        pdf.ln()
        
        pdf.cell(50, 10, "Cash", border=1)
        pdf.cell(30, 10, "54,819.50", border=1)
        pdf.cell(30, 10, "5.48%", border=1)
        pdf.ln()
        
        pdf.set_font("Arial", "B", 10)
        pdf.cell(50, 10, "Total", border=1)
        pdf.cell(30, 10, "1,000,000.00", border=1)
        pdf.cell(30, 10, "100.00%", border=1)
        pdf.ln()
        
        # Save the PDF
        pdf.output(output_path)
        
        print(f"Goldman Sachs portfolio statement created: {output_path}")
        return True
    except Exception as e:
        print(f"Error creating Goldman Sachs portfolio statement: {str(e)}")
        return False

def main():
    """
    Main function.
    """
    # Parse arguments
    parser = argparse.ArgumentParser(description='Create test financial documents')
    parser.add_argument('--output-dir', help='Output directory', default='.')
    parser.add_argument('--document-type', help='Document type to create', choices=['messos', 'goldman', 'all'], default='all')
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)
    
    # Create documents
    if args.document_type in ['messos', 'all']:
        messos_path = os.path.join(args.output_dir, 'messos_portfolio.pdf')
        create_messos_portfolio_statement(messos_path)
    
    if args.document_type in ['goldman', 'all']:
        goldman_path = os.path.join(args.output_dir, 'goldman_portfolio.pdf')
        create_goldman_sachs_portfolio_statement(goldman_path)

if __name__ == '__main__':
    main()
