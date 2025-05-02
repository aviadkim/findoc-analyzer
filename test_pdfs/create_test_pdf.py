from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# Create a PDF document
doc = SimpleDocTemplate("simple_account_statement.pdf", pagesize=letter)
styles = getSampleStyleSheet()
elements = []

# Add a title
title_style = styles["Title"]
elements.append(Paragraph("Bank Account Statement", title_style))
elements.append(Spacer(1, 12))

# Add account information
account_info = [
    ["Account Number:", "123456789"],
    ["Account Holder:", "John Doe"],
    ["Statement Period:", "January 1, 2023 - January 31, 2023"],
    ["Opening Balance:", "$5,000.00"],
    ["Closing Balance:", "$5,432.15"]
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

# Add transactions
transactions_data = [
    ["Date", "Description", "Amount", "Balance"],
    ["01/01/2023", "Opening Balance", "", "$5,000.00"],
    ["01/05/2023", "Salary Deposit", "+$2,500.00", "$7,500.00"],
    ["01/10/2023", "Rent Payment", "-$1,200.00", "$6,300.00"],
    ["01/15/2023", "Grocery Store", "-$150.25", "$6,149.75"],
    ["01/20/2023", "Electric Bill", "-$85.60", "$6,064.15"],
    ["01/25/2023", "Gas Station", "-$45.00", "$6,019.15"],
    ["01/28/2023", "Restaurant", "-$87.00", "$5,932.15"],
    ["01/30/2023", "Interest Credit", "+$5.00", "$5,937.15"],
    ["01/31/2023", "ATM Withdrawal", "-$500.00", "$5,437.15"],
    ["01/31/2023", "Bank Fee", "-$5.00", "$5,432.15"]
]

transactions_table = Table(transactions_data, colWidths=[80, 200, 100, 100])
transactions_table.setStyle(TableStyle([
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
    ('ALIGN', (0, 1), (0, -1), 'CENTER'),
    ('ALIGN', (2, 1), (3, -1), 'RIGHT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('TEXTCOLOR', (2, 1), (2, -1), colors.black),
]))

elements.append(Paragraph("Transaction History", styles["Heading2"]))
elements.append(Spacer(1, 12))
elements.append(transactions_table)

# Build the PDF
doc.build(elements)

print("PDF created successfully!")
