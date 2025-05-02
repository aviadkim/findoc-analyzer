from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# Create a PDF document
doc = SimpleDocTemplate("investment_statement.pdf", pagesize=letter)
styles = getSampleStyleSheet()
elements = []

# Add a title
title_style = styles["Title"]
elements.append(Paragraph("Investment Portfolio Statement", title_style))
elements.append(Spacer(1, 12))

# Add account information
account_info = [
    ["Account Number:", "INV-987654321"],
    ["Account Holder:", "Jane Smith"],
    ["Statement Period:", "Q1 2023 (January 1 - March 31, 2023)"],
    ["Portfolio Value:", "$250,432.78"],
    ["YTD Return:", "+5.2%"]
]

account_table = Table(account_info, colWidths=[150, 300])
account_table.setStyle(TableStyle([
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
    ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
    ('ALIGN', (1, 0), (1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
]))

elements.append(account_table)
elements.append(Spacer(1, 24))

# Add asset allocation
elements.append(Paragraph("Asset Allocation", styles["Heading2"]))
elements.append(Spacer(1, 12))

allocation_data = [
    ["Asset Class", "Allocation", "Value"],
    ["Equities", "60%", "$150,259.67"],
    ["Fixed Income", "25%", "$62,608.20"],
    ["Cash", "10%", "$25,043.28"],
    ["Alternative Investments", "5%", "$12,521.64"],
    ["Total", "100%", "$250,432.78"]
]

allocation_table = Table(allocation_data, colWidths=[200, 100, 150])
allocation_table.setStyle(TableStyle([
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
    ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
    ('ALIGN', (1, 1), (1, -1), 'CENTER'),
    ('ALIGN', (2, 1), (2, -1), 'RIGHT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
]))

elements.append(allocation_table)
elements.append(Spacer(1, 24))

# Add holdings
elements.append(Paragraph("Investment Holdings", styles["Heading2"]))
elements.append(Spacer(1, 12))

holdings_data = [
    ["Security", "ISIN", "Quantity", "Price", "Value", "Weight"],
    ["Apple Inc.", "US0378331005", "150", "$175.25", "$26,287.50", "10.5%"],
    ["Microsoft Corp.", "US5949181045", "100", "$280.50", "$28,050.00", "11.2%"],
    ["Amazon.com Inc.", "US0231351067", "50", "$130.75", "$6,537.50", "2.6%"],
    ["US Treasury Bond 2.5% 2030", "US912810TL45", "$50,000", "98.75%", "$49,375.00", "19.7%"],
    ["Vanguard Total Stock Market ETF", "US9229087690", "200", "$220.30", "$44,060.00", "17.6%"],
    ["iShares Core U.S. Aggregate Bond", "US4642872265", "300", "$98.45", "$29,535.00", "11.8%"],
    ["JPMorgan Ultra-Short Income ETF", "US46641Q8840", "500", "$50.10", "$25,050.00", "10.0%"],
    ["Berkshire Hathaway Inc. Class B", "US0846707026", "75", "$350.15", "$26,261.25", "10.5%"],
    ["SPDR Gold Shares", "US78463V1070", "100", "$180.25", "$18,025.00", "7.2%"],
    ["Cash", "", "", "", "$25,043.28", "10.0%"],
]

holdings_table = Table(holdings_data, colWidths=[120, 100, 60, 70, 90, 60])
holdings_table.setStyle(TableStyle([
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
    ('ALIGN', (2, 1), (5, -1), 'RIGHT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
]))

elements.append(holdings_table)

# Build the PDF
doc.build(elements)

print("Investment PDF created successfully!")
