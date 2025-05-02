"""
Generate a sample portfolio PDF for testing the FinDocRAG system.
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

def generate_sample_portfolio():
    """Generate a sample portfolio PDF with securities and ISINs."""
    output_path = "sample_portfolio.pdf"
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=12
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=10
    )
    
    normal_style = styles['Normal']
    
    # Content elements
    elements = []
    
    # Title
    elements.append(Paragraph("Investment Portfolio Summary", title_style))
    elements.append(Spacer(1, 12))
    
    # Client Information
    elements.append(Paragraph("Client Information", subtitle_style))
    client_data = [
        ["Client Name:", "John Smith"],
        ["Account Number:", "AC123456789"],
        ["Report Date:", "June 15, 2023"],
        ["Portfolio Manager:", "Sarah Johnson"]
    ]
    
    client_table = Table(client_data, colWidths=[120, 300])
    client_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(client_table)
    elements.append(Spacer(1, 20))
    
    # Portfolio Summary
    elements.append(Paragraph("Portfolio Summary", subtitle_style))
    summary_data = [
        ["Total Value:", "$845,750.00"],
        ["Currency:", "USD"],
        ["Risk Profile:", "Moderate"],
        ["Diversification Score:", "72.5/100"]
    ]
    
    summary_table = Table(summary_data, colWidths=[120, 300])
    summary_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(summary_table)
    elements.append(Spacer(1, 20))
    
    # Asset Allocation
    elements.append(Paragraph("Asset Allocation", subtitle_style))
    allocation_data = [
        ["Asset Class", "Percentage", "Value"],
        ["Stocks", "45.2%", "$382,279.00"],
        ["Fixed Income", "30.5%", "$257,953.75"],
        ["Funds", "20.3%", "$171,687.25"],
        ["Cash", "4.0%", "$33,830.00"]
    ]
    
    allocation_table = Table(allocation_data, colWidths=[140, 100, 180])
    allocation_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (1, 0), (2, -1), 'RIGHT'),
    ]))
    
    elements.append(allocation_table)
    elements.append(Spacer(1, 20))
    
    # Securities
    elements.append(Paragraph("Securities", subtitle_style))
    securities_data = [
        ["Name", "ISIN", "Type", "Quantity", "Value", "Risk"],
        ["Apple Inc.", "US0378331005", "Equity", "500", "$92,500.00", "Medium"],
        ["Microsoft Corp.", "US5949181045", "Equity", "300", "$102,000.00", "Low"],
        ["Amazon.com Inc.", "US0231351067", "Equity", "150", "$187,500.00", "Medium"],
        ["US Treasury 2.5% 2030", "US912810TL45", "Bond", "200,000", "$198,000.00", "Low"],
        ["Corporate Bond 3.2% 2025", "US38141GXL26", "Bond", "50,000", "$49,750.00", "Medium"],
        ["Vanguard S&P 500 ETF", "US9229083632", "ETF", "400", "$160,000.00", "Medium"],
        ["iShares MSCI EAFE ETF", "US4642874707", "ETF", "300", "$22,500.00", "High"],
        ["Cash", "N/A", "Cash", "N/A", "$33,500.00", "Low"]
    ]
    
    securities_table = Table(securities_data, colWidths=[120, 100, 60, 60, 80, 60])
    securities_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (3, 1), (4, -1), 'RIGHT'),
    ]))
    
    elements.append(securities_table)
    elements.append(Spacer(1, 20))
    
    # Recommendations
    elements.append(Paragraph("Recommendations", subtitle_style))
    recommendations = [
        "1. Consider increasing fixed income allocation for better diversification.",
        "2. The portfolio has a moderate risk profile suitable for long-term growth.",
        "3. Consider reducing exposure to high-risk securities like iShares MSCI EAFE ETF.",
        "4. Rebalance the portfolio quarterly to maintain target asset allocation."
    ]
    
    for rec in recommendations:
        elements.append(Paragraph(rec, normal_style))
        elements.append(Spacer(1, 6))
    
    # Build the PDF
    doc.build(elements)
    print(f"Sample portfolio PDF created at: {os.path.abspath(output_path)}")
    return os.path.abspath(output_path)

if __name__ == "__main__":
    generate_sample_portfolio()
