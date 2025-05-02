"""
Generate Test PDFs

This script generates multiple test PDF files with different financial data.
"""

import os
import sys
import json
import random
import argparse
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib import colors

# List of banks and financial institutions
INSTITUTIONS = [
    "UBS", "Credit Suisse", "JP Morgan", "Goldman Sachs", "Morgan Stanley",
    "Bank of America", "Deutsche Bank", "Barclays", "HSBC", "BNP Paribas",
    "Citibank", "Wells Fargo"
]

# List of document types
DOCUMENT_TYPES = [
    "portfolio_statement", "account_statement", "fund_fact_sheet",
    "prospectus", "annual_report", "trade_confirmation"
]

# List of currencies
CURRENCIES = ["USD", "EUR", "GBP", "CHF", "JPY"]

# List of asset classes
ASSET_CLASSES = {
    "Equity": ["Technology", "Healthcare", "Financial", "Consumer", "Industrial", "Energy"],
    "Fixed Income": ["Government", "Corporate", "High Yield", "Municipal", "Emerging Markets"],
    "Funds": ["Equity", "Bond", "Mixed", "Index", "ETF"],
    "Cash": ["Cash", "Money Market"],
    "Alternative": ["Real Estate", "Commodities", "Hedge Funds", "Private Equity"]
}

# List of regions
REGIONS = ["North America", "Europe", "Asia", "Emerging Markets", "Global"]

# List of securities
SECURITIES = [
    {"name": "APPLE INC", "isin": "US0378331005", "type": "Equity", "sector": "Technology", "region": "North America"},
    {"name": "MICROSOFT CORP", "isin": "US5949181045", "type": "Equity", "sector": "Technology", "region": "North America"},
    {"name": "AMAZON.COM INC", "isin": "US0231351067", "type": "Equity", "sector": "Consumer", "region": "North America"},
    {"name": "ALPHABET INC-CL A", "isin": "US02079K3059", "type": "Equity", "sector": "Technology", "region": "North America"},
    {"name": "FACEBOOK INC-CLASS A", "isin": "US30303M1027", "type": "Equity", "sector": "Technology", "region": "North America"},
    {"name": "TESLA INC", "isin": "US88160R1014", "type": "Equity", "sector": "Consumer", "region": "North America"},
    {"name": "NVIDIA CORP", "isin": "US67066G1040", "type": "Equity", "sector": "Technology", "region": "North America"},
    {"name": "JPMORGAN CHASE & CO", "isin": "US46625H1005", "type": "Equity", "sector": "Financial", "region": "North America"},
    {"name": "JOHNSON & JOHNSON", "isin": "US4781601046", "type": "Equity", "sector": "Healthcare", "region": "North America"},
    {"name": "VISA INC-CLASS A", "isin": "US92826C8394", "type": "Equity", "sector": "Financial", "region": "North America"},
    {"name": "NESTLE SA-REG", "isin": "CH0038863350", "type": "Equity", "sector": "Consumer", "region": "Europe"},
    {"name": "ASML HOLDING NV", "isin": "NL0010273215", "type": "Equity", "sector": "Technology", "region": "Europe"},
    {"name": "ROCHE HOLDING AG-GENUSSCHEIN", "isin": "CH0012032048", "type": "Equity", "sector": "Healthcare", "region": "Europe"},
    {"name": "LVMH MOET HENNESSY LOUIS VUI", "isin": "FR0000121014", "type": "Equity", "sector": "Consumer", "region": "Europe"},
    {"name": "NOVARTIS AG-REG", "isin": "CH0012005267", "type": "Equity", "sector": "Healthcare", "region": "Europe"},
    {"name": "US TREASURY 2.5% 15/02/2045", "isin": "US912810RK35", "type": "Bond", "sector": "Government", "region": "North America"},
    {"name": "US TREASURY 1.875% 15/02/2051", "isin": "US912810SL35", "type": "Bond", "sector": "Government", "region": "North America"},
    {"name": "GERMANY 0% 15/08/2050", "isin": "DE0001102481", "type": "Bond", "sector": "Government", "region": "Europe"},
    {"name": "FRANCE 0.5% 25/05/2040", "isin": "FR0013515806", "type": "Bond", "sector": "Government", "region": "Europe"},
    {"name": "APPLE INC 2.4% 03/05/2023", "isin": "US037833AK68", "type": "Bond", "sector": "Corporate", "region": "North America"},
    {"name": "MICROSOFT CORP 2.921% 17/03/2052", "isin": "US594918BX01", "type": "Bond", "sector": "Corporate", "region": "North America"},
    {"name": "AMAZON.COM INC 2.5% 29/11/2022", "isin": "US023135AJ58", "type": "Bond", "sector": "Corporate", "region": "North America"},
    {"name": "VANGUARD TOTAL STOCK MARKET ETF", "isin": "US9229087690", "type": "Fund", "sector": "Equity", "region": "North America"},
    {"name": "ISHARES CORE S&P 500 ETF", "isin": "US4642872000", "type": "Fund", "sector": "Equity", "region": "North America"},
    {"name": "VANGUARD TOTAL BOND MARKET ETF", "isin": "US9219378356", "type": "Fund", "sector": "Bond", "region": "North America"},
    {"name": "ISHARES CORE EURO STOXX 50 ETF", "isin": "IE0008471009", "type": "Fund", "sector": "Equity", "region": "Europe"},
    {"name": "ISHARES CORE MSCI EMERGING MARKETS ETF", "isin": "US46434G1031", "type": "Fund", "sector": "Equity", "region": "Emerging Markets"},
    {"name": "GOLDMAN SACHS 0% NOTES 23-07.11.29 SERIES P", "isin": "XS2692298537", "type": "Bond", "sector": "Corporate", "region": "North America"},
    {"name": "TORONTO DOMINION BANK NOTES 23-23.02.27 REG-S VRN", "isin": "XS2530507273", "type": "Bond", "sector": "Corporate", "region": "North America"}
]

def generate_random_date(start_date=None, end_date=None):
    """
    Generate a random date between start_date and end_date.
    
    Args:
        start_date: Start date (default: 1 year ago)
        end_date: End date (default: today)
        
    Returns:
        Random date as string in format DD.MM.YYYY
    """
    if start_date is None:
        start_date = datetime.now() - timedelta(days=365)
    
    if end_date is None:
        end_date = datetime.now()
    
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + timedelta(days=random_number_of_days)
    
    return random_date.strftime("%d.%m.%Y")

def generate_random_portfolio(num_securities=10, total_value=1000000):
    """
    Generate a random portfolio of securities.
    
    Args:
        num_securities: Number of securities in the portfolio
        total_value: Total portfolio value
        
    Returns:
        Dictionary with portfolio data
    """
    # Select random securities
    selected_securities = random.sample(SECURITIES, min(num_securities, len(SECURITIES)))
    
    # Assign random weights
    weights = [random.uniform(0.5, 10) for _ in range(len(selected_securities))]
    total_weight = sum(weights)
    normalized_weights = [w / total_weight * 100 for w in weights]
    
    # Calculate values based on weights
    values = [total_value * w / 100 for w in normalized_weights]
    
    # Generate portfolio
    portfolio = []
    
    for i, security in enumerate(selected_securities):
        weight = normalized_weights[i]
        value = values[i]
        
        # Generate random price and quantity
        if security['type'] == 'Bond':
            price = random.uniform(90, 110)
            quantity = round(value / price * 100) / 100  # Bond quantities are often in 100s
        else:
            price = random.uniform(10, 1000)
            quantity = round(value / price)
        
        # Adjust value based on quantity and price
        value = quantity * price
        
        # Add security to portfolio
        portfolio.append({
            'name': security['name'],
            'isin': security['isin'],
            'type': security['type'],
            'sector': security['sector'],
            'region': security['region'],
            'quantity': quantity,
            'price': price,
            'value': value,
            'weight': weight,
            'currency': random.choice(CURRENCIES)
        })
    
    return portfolio

def generate_asset_allocation(portfolio):
    """
    Generate asset allocation based on portfolio.
    
    Args:
        portfolio: Portfolio data
        
    Returns:
        Dictionary with asset allocation data
    """
    # Group securities by asset class
    asset_classes = {}
    
    for security in portfolio:
        asset_class = security['type']
        if asset_class == 'Equity' or asset_class == 'Bond':
            asset_class = 'Fixed Income' if asset_class == 'Bond' else asset_class
        elif asset_class not in ['Equity', 'Fixed Income', 'Fund', 'Cash', 'Alternative']:
            asset_class = 'Alternative'
        
        if asset_class not in asset_classes:
            asset_classes[asset_class] = 0
        
        asset_classes[asset_class] += security['weight']
    
    # Normalize weights
    total_weight = sum(asset_classes.values())
    for asset_class in asset_classes:
        asset_classes[asset_class] = round(asset_classes[asset_class] / total_weight * 100, 2)
    
    # Format asset allocation
    allocation = {}
    for asset_class, percentage in asset_classes.items():
        allocation[asset_class] = {
            'percentage': percentage
        }
    
    return allocation

def generate_portfolio_summary(portfolio, date=None):
    """
    Generate portfolio summary.
    
    Args:
        portfolio: Portfolio data
        date: Valuation date (default: random date)
        
    Returns:
        Dictionary with portfolio summary data
    """
    # Calculate total value
    total_value = sum(security['value'] for security in portfolio)
    
    # Get currency (use most common currency in portfolio)
    currencies = [security['currency'] for security in portfolio]
    currency = max(set(currencies), key=currencies.count)
    
    # Generate valuation date
    if date is None:
        date = generate_random_date()
    
    return {
        'total_value': total_value,
        'currency': currency,
        'valuation_date': date
    }

def generate_portfolio_statement(output_path, num_securities=10, total_value=1000000):
    """
    Generate a portfolio statement PDF.
    
    Args:
        output_path: Output file path
        num_securities: Number of securities in the portfolio
        total_value: Total portfolio value
        
    Returns:
        Dictionary with expected data
    """
    # Generate random data
    institution = random.choice(INSTITUTIONS)
    date = generate_random_date()
    account_number = ''.join(random.choices('0123456789', k=8))
    client_name = "John Doe"
    
    # Generate portfolio
    portfolio = generate_random_portfolio(num_securities, total_value)
    
    # Generate asset allocation
    asset_allocation = generate_asset_allocation(portfolio)
    
    # Generate portfolio summary
    portfolio_summary = generate_portfolio_summary(portfolio, date)
    
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
    content.append(Paragraph(f"{institution} INVESTMENT PORTFOLIO STATEMENT", title_style))
    content.append(Spacer(1, 12))
    
    # Header information
    content.append(Paragraph(f"Date: {date}", normal_style))
    content.append(Paragraph(f"Account Number: {account_number}", normal_style))
    content.append(Paragraph(f"Client: {client_name}", normal_style))
    content.append(Spacer(1, 12))
    
    # Portfolio summary
    content.append(Paragraph("PORTFOLIO SUMMARY", heading_style))
    content.append(Paragraph(f"Total Value: {portfolio_summary['currency']} {portfolio_summary['total_value']:,.2f}", normal_style))
    content.append(Paragraph(f"Currency: {portfolio_summary['currency']}", normal_style))
    content.append(Paragraph(f"Valuation Date: {portfolio_summary['valuation_date']}", normal_style))
    content.append(Spacer(1, 12))
    
    # Asset allocation
    content.append(Paragraph("ASSET ALLOCATION", heading_style))
    for asset_class, data in asset_allocation.items():
        content.append(Paragraph(f"{asset_class}: {data['percentage']}%", normal_style))
    content.append(Spacer(1, 12))
    
    # Securities holdings
    content.append(Paragraph("SECURITIES HOLDINGS", heading_style))
    
    # Create table for securities
    table_data = [
        ["Security", "ISIN", "Type", "Quantity", "Price", "Value", "Weight"]
    ]
    
    for i, security in enumerate(portfolio):
        table_data.append([
            security['name'],
            security['isin'],
            security['type'],
            f"{security['quantity']:,.2f}",
            f"{security['currency']} {security['price']:,.2f}",
            f"{security['currency']} {security['value']:,.2f}",
            f"{security['weight']:,.2f}%"
        ])
    
    # Create table
    table = Table(table_data, repeatRows=1)
    
    # Add table style
    table.setStyle(TableStyle([
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
    
    content.append(table)
    content.append(Spacer(1, 12))
    
    # Notes
    content.append(Paragraph("NOTES", heading_style))
    content.append(Paragraph("This portfolio statement is for informational purposes only and does not constitute investment advice. Past performance is not indicative of future results. Please consult with your financial advisor before making any investment decisions.", normal_style))
    
    # Build PDF
    doc.build(content)
    
    # Create expected data
    expected_data = {
        'document_type': 'portfolio_statement',
        'securities': portfolio,
        'portfolio_summary': portfolio_summary,
        'asset_allocation': asset_allocation
    }
    
    return expected_data

def main():
    """
    Main function.
    """
    parser = argparse.ArgumentParser(description='Generate Test PDFs')
    parser.add_argument('--output_dir', type=str, default='test_pdfs', help='Output directory for PDF files')
    parser.add_argument('--expected_data_dir', type=str, default='expected_data', help='Output directory for expected data files')
    parser.add_argument('--num_pdfs', type=int, default=10, help='Number of PDF files to generate')
    parser.add_argument('--min_securities', type=int, default=5, help='Minimum number of securities per portfolio')
    parser.add_argument('--max_securities', type=int, default=20, help='Maximum number of securities per portfolio')
    parser.add_argument('--min_value', type=int, default=100000, help='Minimum portfolio value')
    parser.add_argument('--max_value', type=int, default=10000000, help='Maximum portfolio value')
    
    args = parser.parse_args()
    
    # Create output directories
    os.makedirs(args.output_dir, exist_ok=True)
    os.makedirs(args.expected_data_dir, exist_ok=True)
    
    # Generate PDFs
    for i in range(args.num_pdfs):
        # Generate random parameters
        num_securities = random.randint(args.min_securities, args.max_securities)
        total_value = random.randint(args.min_value, args.max_value)
        
        # Generate file names
        pdf_file = os.path.join(args.output_dir, f"portfolio_statement_{i+1}.pdf")
        json_file = os.path.join(args.expected_data_dir, f"portfolio_statement_{i+1}.json")
        
        # Generate portfolio statement
        expected_data = generate_portfolio_statement(pdf_file, num_securities, total_value)
        
        # Save expected data
        with open(json_file, 'w') as f:
            json.dump(expected_data, f, indent=2)
        
        print(f"Generated {pdf_file} and {json_file}")
    
    print(f"Generated {args.num_pdfs} PDF files")

if __name__ == "__main__":
    main()
