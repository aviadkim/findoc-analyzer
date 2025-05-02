"""
Create Test PDF

This script creates a test PDF with financial data for testing.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib import colors

def create_test_pdf(output_path):
    """
    Create a test PDF with financial data.
    
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
    
    subheading_style = ParagraphStyle(
        'Subheading',
        parent=styles['Heading3'],
        fontSize=12,
        alignment=TA_LEFT,
        spaceAfter=6
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
    content.append(Spacer(1, 12))
    
    # Sector allocation
    content.append(Paragraph("SECTOR ALLOCATION", heading_style))
    
    sector_allocation_data = [
        ["Sector", "Percentage"],
        ["Technology", "22.56%"],
        ["Consumer", "7.6%"],
        ["Government", "15.84%"],
        ["Financial", "11.76%"],
        ["Other", "42.24%"]
    ]
    
    sector_allocation_table = Table(sector_allocation_data, colWidths=[200, 100])
    sector_allocation_table.setStyle(TableStyle([
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
    
    content.append(sector_allocation_table)
    content.append(Spacer(1, 12))
    
    # Notes
    content.append(Paragraph("NOTES", heading_style))
    content.append(Paragraph("This portfolio statement is for informational purposes only and does not constitute investment advice. Past performance is not indicative of future results. Please consult with your financial advisor before making any investment decisions.", normal_style))
    
    # Build PDF
    doc.build(content)
    
    print(f"Test PDF created at {output_path}")

if __name__ == "__main__":
    output_dir = "test_pdfs"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "test_portfolio_statement.pdf")
    create_test_pdf(output_path)
