"""
Create a test financial document for testing the enhanced processing system.
"""

import os
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

        # Add section title
        pdf.ln(10)
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Asset Allocation", ln=True)
        pdf.ln(5)

        # Create asset allocation table
        pdf.set_font("Arial", "B", 10)
        pdf.cell(50, 10, "Asset Class", border=1)
        pdf.cell(30, 10, "Value", border=1)
        pdf.cell(30, 10, "Percentage", border=1)
        pdf.ln()

        # Add asset allocation data
        pdf.set_font("Arial", "", 10)

        pdf.cell(50, 10, "Bonds", border=1)
        pdf.cell(30, 10, "2'734'371", border=1)
        pdf.cell(30, 10, "14.00%", border=1)
        pdf.ln()

        pdf.cell(50, 10, "Structured Products", border=1)
        pdf.cell(30, 10, "8'654'321", border=1)
        pdf.cell(30, 10, "44.33%", border=1)
        pdf.ln()

        pdf.cell(50, 10, "Equities", border=1)
        pdf.cell(30, 10, "5'481'369", border=1)
        pdf.cell(30, 10, "28.08%", border=1)
        pdf.ln()

        pdf.cell(50, 10, "Cash", border=1)
        pdf.cell(30, 10, "2'654'321", border=1)
        pdf.cell(30, 10, "13.59%", border=1)
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

def create_simple_test_document(output_path):
    """
    Create a simple test document with financial data.

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
        pdf.cell(0, 10, "Test Financial Document", ln=True, align="C")
        pdf.set_font("Arial", "", 12)
        pdf.cell(0, 10, "As of: April 26, 2025", ln=True, align="C")
        pdf.ln(10)

        # Add securities information
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Securities", ln=True)
        pdf.ln(5)

        # Create table headers
        pdf.set_font("Arial", "B", 10)
        pdf.cell(50, 10, "Security", border=1)
        pdf.cell(30, 10, "ISIN", border=1)
        pdf.cell(30, 10, "Quantity", border=1)
        pdf.cell(30, 10, "Price", border=1)
        pdf.cell(30, 10, "Value", border=1)
        pdf.ln()

        # Add table data
        pdf.set_font("Arial", "", 10)

        # Sample data
        data = [
            ["Apple Inc.", "US0378331005", "100", "150.00", "15,000.00"],
            ["Microsoft Corporation", "US5949181045", "50", "300.00", "15,000.00"],
            ["Amazon.com Inc.", "US0231351067", "25", "400.00", "10,000.00"],
            ["Alphabet Inc.", "US02079K1079", "20", "250.00", "5,000.00"],
            ["Tesla Inc.", "US88160R1014", "30", "200.00", "6,000.00"]
        ]

        for row in data:
            pdf.cell(50, 10, row[0], border=1)
            pdf.cell(30, 10, row[1], border=1)
            pdf.cell(30, 10, row[2], border=1)
            pdf.cell(30, 10, row[3], border=1)
            pdf.cell(30, 10, row[4], border=1)
            pdf.ln()

        # Add total
        pdf.set_font("Arial", "B", 10)
        pdf.cell(140, 10, "Total", border=1, align="R")
        pdf.cell(30, 10, "51,000.00", border=1)
        pdf.ln()

        # Save the PDF
        pdf.output(output_path)

        print(f"Simple test document created: {output_path}")
        return True
    except Exception as e:
        print(f"Error creating simple test document: {str(e)}")
        return False

# Create output directory if it doesn't exist
output_dir = "test_documents"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Create test documents
messos_path = os.path.join(output_dir, "messos_portfolio.pdf")
create_messos_portfolio_statement(messos_path)

simple_path = os.path.join(output_dir, "simple_test.pdf")
create_simple_test_document(simple_path)

print("Test documents created successfully!")
