"""
Create a sample PDF with a financial table for testing.
"""

import os
import pandas as pd
from fpdf import FPDF

def create_sample_pdf(output_path):
    """
    Create a sample PDF with a financial table.
    
    Args:
        output_path: Path to save the PDF
    """
    # Create a PDF object
    pdf = FPDF()
    pdf.add_page()
    
    # Set font
    pdf.set_font("Arial", "B", 16)
    
    # Add title
    pdf.cell(0, 10, "Portfolio Statement", ln=True, align="C")
    pdf.ln(10)
    
    # Add date
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 10, "Valuation Date: 28.02.2025", ln=True)
    pdf.ln(5)
    
    # Add client info
    pdf.cell(0, 10, "Client: MESSOS ENTERPRISES LTD.", ln=True)
    pdf.cell(0, 10, "Client Number: 366223", ln=True)
    pdf.ln(10)
    
    # Add section title
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Bonds", ln=True)
    pdf.ln(5)
    
    # Create table headers
    pdf.set_font("Arial", "B", 10)
    pdf.cell(30, 10, "ISIN", border=1)
    pdf.cell(50, 10, "Security Name", border=1)
    pdf.cell(20, 10, "Quantity", border=1)
    pdf.cell(20, 10, "Price", border=1)
    pdf.cell(30, 10, "Acq. Price", border=1)
    pdf.cell(30, 10, "Value", border=1)
    pdf.cell(20, 10, "Currency", border=1)
    pdf.cell(20, 10, "Weight", border=1)
    pdf.ln()
    
    # Add table data
    pdf.set_font("Arial", "", 10)
    
    # Sample data
    data = [
        ["US0378331005", "APPLE INC", "100", "150.25", "120.50", "15025.00", "USD", "5.25%"],
        ["US5949181045", "MICROSOFT CORP", "50", "280.75", "220.30", "14037.50", "USD", "4.90%"],
        ["US0231351067", "AMAZON.COM INC", "25", "3200.50", "2800.75", "80012.50", "USD", "27.95%"],
        ["US88160R1014", "TESLA INC", "75", "800.25", "750.00", "60018.75", "USD", "20.97%"],
        ["XS2692298537", "GOLDMAN SACHS 0% NOTES", "690000", "106.57", "100.10", "735333.00", "USD", "3.77%"]
    ]
    
    for row in data:
        pdf.cell(30, 10, row[0], border=1)
        pdf.cell(50, 10, row[1], border=1)
        pdf.cell(20, 10, row[2], border=1)
        pdf.cell(20, 10, row[3], border=1)
        pdf.cell(30, 10, row[4], border=1)
        pdf.cell(30, 10, row[5], border=1)
        pdf.cell(20, 10, row[6], border=1)
        pdf.cell(20, 10, row[7], border=1)
        pdf.ln()
    
    # Add portfolio summary
    pdf.ln(10)
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Portfolio Summary", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 10, "Total Value: 904,427.75 USD", ln=True)
    pdf.cell(0, 10, "Currency: USD", ln=True)
    pdf.ln(5)
    
    # Add asset allocation
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Asset Allocation", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 10, "Equities: 59.07%", ln=True)
    pdf.cell(0, 10, "Bonds: 40.93%", ln=True)
    pdf.cell(0, 10, "Cash: 0.00%", ln=True)
    
    # Save the PDF
    pdf.output(output_path)
    
    print(f"Sample PDF created: {output_path}")

if __name__ == "__main__":
    # Create sample documents directory if it doesn't exist
    os.makedirs("sample_documents", exist_ok=True)
    
    # Create sample PDF
    create_sample_pdf("sample_documents/sample_portfolio.pdf")
