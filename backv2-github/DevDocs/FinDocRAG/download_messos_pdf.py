"""
Download the Messos PDF file for testing.

This script creates a simplified version of the Messos portfolio statement
based on the image provided in the conversation.
"""

import os
from fpdf import FPDF

def create_messos_pdf(output_path):
    """
    Create a simplified version of the Messos portfolio statement.
    
    Args:
        output_path: Path to save the PDF
    """
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
        ["USD", "150'000", "HARP ISSUER (4% MIN/5,5% MAX) NOTES 2023-18.09.2028\nISIN: XS2565592833", "99.0990", "98.3900", "1.51%", "-0.72%", "150'2850", "7.70%"],
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

if __name__ == "__main__":
    # Create sample documents directory if it doesn't exist
    os.makedirs("sample_documents", exist_ok=True)
    
    # Create Messos PDF
    create_messos_pdf("sample_documents/messos_portfolio.pdf")
