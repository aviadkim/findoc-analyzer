"""
Generate Test PDF

This script generates a simple test PDF with financial data.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib import colors

def create_financial_statement(output_path):
    """
    Create a financial statement PDF.
    
    Args:
        output_path: Output file path
    """
    # Create PDF
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Title'],
        fontSize=16,
        alignment=TA_CENTER,
        spaceAfter=12
    )
    
    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        fontSize=14,
        alignment=TA_LEFT,
        spaceAfter=6,
        spaceBefore=12
    )
    
    normal_style = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_LEFT,
        spaceAfter=6
    )
    
    # Create content
    content = []
    
    # Title
    content.append(Paragraph("INVESTMENT PORTFOLIO STATEMENT", title_style))
    content.append(Spacer(1, 12))
    
    # Header information
    content.append(Paragraph("Date: 28.02.2025", normal_style))
    content.append(Paragraph("Account Number: 12345678", normal_style))
    content.append(Paragraph("Client: John Doe", normal_style))
    content.append(Spacer(1, 12))
    
    # Portfolio summary
    content.append(Paragraph("PORTFOLIO SUMMARY", heading_style))
    content.append(Paragraph("Total Value: USD 1,250,000.00", normal_style))
    content.append(Paragraph("Currency: USD", normal_style))
    content.append(Paragraph("Valuation Date: 28.02.2025", normal_style))
    content.append(Spacer(1, 12))
    
    # Asset allocation
    content.append(Paragraph("ASSET ALLOCATION", heading_style))
    
    asset_allocation_data = [
        ["Asset Class", "Percentage"],
        ["Equity", "45%"],
        ["Fixed Income", "30%"],
        ["Cash", "15%"],
        ["Alternative", "10%"]
    ]
    
    asset_allocation_table = Table(asset_allocation_data, colWidths=[200, 100])
    asset_allocation_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    content.append(asset_allocation_table)
    content.append(Spacer(1, 12))
    
    # Securities holdings
    content.append(Paragraph("SECURITIES HOLDINGS", heading_style))
    
    securities_data = [
        ["Security", "ISIN", "Type", "Quantity", "Price", "Value", "Weight"],
        ["APPLE INC", "US0378331005", "Equity", "500", "USD 170.00", "USD 85,000.00", "6.8%"],
        ["MICROSOFT CORP", "US5949181045", "Equity", "300", "USD 340.00", "USD 102,000.00", "8.16%"],
        ["AMAZON.COM INC", "US0231351067", "Equity", "100", "USD 950.00", "USD 95,000.00", "7.6%"],
        ["US TREASURY 2.5% 15/02/2045", "US912810RK35", "Bond", "200,000", "USD 0.99", "USD 198,000.00", "15.84%"],
        ["GOLDMAN SACHS 0% NOTES 23-07.11.29", "XS2692298537", "Bond", "150,000", "USD 0.98", "USD 147,000.00", "11.76%"]
    ]
    
    securities_table = Table(securities_data, colWidths=[120, 100, 60, 60, 80, 100, 60])
    securities_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (2, -1), 'LEFT'),
        ('ALIGN', (3, 1), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    content.append(securities_table)
    
    # Build PDF
    doc.build(content)
    
    print(f"Financial statement PDF created at {output_path}")

def create_text_only_pdf(output_path):
    """
    Create a text-only PDF.
    
    Args:
        output_path: Output file path
    """
    # Create PDF
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Create content
    content = []
    
    # Title
    content.append(Paragraph("TEXT-ONLY DOCUMENT", styles['Title']))
    content.append(Spacer(1, 12))
    
    # Text content
    for i in range(1, 11):
        content.append(Paragraph(f"This is paragraph {i} of the text-only document. This document contains no tables or images, only text content for testing text extraction functionality.", styles['Normal']))
        content.append(Spacer(1, 6))
    
    # Build PDF
    doc.build(content)
    
    print(f"Text-only PDF created at {output_path}")

def create_tables_only_pdf(output_path):
    """
    Create a tables-only PDF.
    
    Args:
        output_path: Output file path
    """
    # Create PDF
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Create content
    content = []
    
    # Title
    content.append(Paragraph("TABLES-ONLY DOCUMENT", styles['Title']))
    content.append(Spacer(1, 12))
    
    # Table 1
    table1_data = [
        ["Header 1", "Header 2", "Header 3", "Header 4"],
        ["Row 1, Col 1", "Row 1, Col 2", "Row 1, Col 3", "Row 1, Col 4"],
        ["Row 2, Col 1", "Row 2, Col 2", "Row 2, Col 3", "Row 2, Col 4"],
        ["Row 3, Col 1", "Row 3, Col 2", "Row 3, Col 3", "Row 3, Col 4"]
    ]
    
    table1 = Table(table1_data, colWidths=[100, 100, 100, 100])
    table1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    content.append(table1)
    content.append(Spacer(1, 24))
    
    # Table 2
    table2_data = [
        ["Product", "Price", "Quantity", "Total"],
        ["Product A", "$10.00", "5", "$50.00"],
        ["Product B", "$15.00", "3", "$45.00"],
        ["Product C", "$20.00", "2", "$40.00"],
        ["Product D", "$25.00", "1", "$25.00"],
        ["", "", "Total", "$160.00"]
    ]
    
    table2 = Table(table2_data, colWidths=[100, 100, 100, 100])
    table2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (2, -1), (-1, -1), colors.lightgrey),
        ('FONTNAME', (2, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    
    content.append(table2)
    
    # Build PDF
    doc.build(content)
    
    print(f"Tables-only PDF created at {output_path}")

def create_small_pdf(output_path):
    """
    Create a small PDF file.
    
    Args:
        output_path: Output file path
    """
    # Create PDF
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Create content
    content = []
    
    # Title
    content.append(Paragraph("SMALL TEST DOCUMENT", styles['Title']))
    content.append(Spacer(1, 12))
    
    # Text content
    content.append(Paragraph("This is a small test document for testing small file processing.", styles['Normal']))
    
    # Build PDF
    doc.build(content)
    
    print(f"Small PDF created at {output_path}")

def main():
    """
    Main function.
    """
    # Create output directory
    output_dir = "test_pdfs"
    os.makedirs(output_dir, exist_ok=True)
    
    # Create financial statement PDF
    create_financial_statement(os.path.join(output_dir, "financial_statement.pdf"))
    
    # Create text-only PDF
    create_text_only_pdf(os.path.join(output_dir, "text_only.pdf"))
    
    # Create tables-only PDF
    create_tables_only_pdf(os.path.join(output_dir, "tables_only.pdf"))
    
    # Create small PDF
    create_small_pdf(os.path.join(output_dir, "small_file.pdf"))
    
    print("All test PDFs created successfully!")

if __name__ == "__main__":
    main()
