"""
Script to analyze a portfolio PDF and extract detailed information about all securities.
"""
import os
import sys
import re
import json
import fitz  # PyMuPDF
from collections import defaultdict

def extract_isin_pattern(text):
    """Extract ISINs using regex pattern."""
    isin_pattern = r'[A-Z]{2}[A-Z0-9]{10}'
    return re.findall(isin_pattern, text)

def extract_tables(page_text):
    """Extract tables from page text using heuristics."""
    lines = page_text.split('\n')
    tables = []
    table_start = -1
    in_table = False
    
    for i, line in enumerate(lines):
        # Check if this line has multiple tab or space separations
        if len(re.findall(r'\s{2,}', line)) >= 3 or '\t' in line:
            # This might be a table row
            if not in_table:
                table_start = max(0, i - 2)  # Start a few lines before
                in_table = True
        else:
            # If we're in a table and find a non-table line
            if in_table and i > table_start + 2:  # Ensure we have at least 3 lines
                table_end = i
                
                # Extract the table
                table_lines = lines[table_start:table_end]
                tables.append(table_lines)
                
                in_table = False
    
    # If we're still in a table at the end of the page
    if in_table:
        table_end = len(lines)
        table_lines = lines[table_start:table_end]
        tables.append(table_lines)
    
    return tables

def extract_security_details(tables, isin):
    """Extract security details from tables."""
    security_info = {
        "isin": isin,
        "name": "",
        "price": "",
        "price_date": "",
        "quantity": "",
        "value": "",
        "currency": "",
        "maturity": "",
        "coupon": ""
    }
    
    for table in tables:
        for i, line in enumerate(table):
            if isin in line:
                # Get the current line and a few lines before and after
                start = max(0, i - 2)
                end = min(len(table), i + 3)
                context = table[start:end]
                
                # Look for security name
                for ctx_line in context:
                    if "Ordinary Bonds" in ctx_line or "Structured products" in ctx_line:
                        parts = ctx_line.split("//")
                        if parts[0].strip():
                            security_info["name"] = parts[0].strip()
                    
                    # Look for maturity
                    if "Maturity:" in ctx_line:
                        maturity_match = re.search(r'Maturity:\s*(\d{2}\.\d{2}\.\d{4})', ctx_line)
                        if maturity_match:
                            security_info["maturity"] = maturity_match.group(1)
                    
                    # Look for coupon
                    if "Coupon:" in ctx_line:
                        coupon_match = re.search(r'Coupon:\s*([\d\.]+)', ctx_line)
                        if coupon_match:
                            security_info["coupon"] = coupon_match.group(1)
                    
                    # Look for price
                    price_match = re.search(r'(\d+\.\d+)', ctx_line)
                    if price_match and not security_info["price"]:
                        security_info["price"] = price_match.group(1)
                
                # Look for quantity and value
                for ctx_line in context:
                    # Look for numbers in the line
                    numbers = re.findall(r'[\d,\']+\.?\d*', ctx_line)
                    if len(numbers) >= 2 and not security_info["quantity"]:
                        # Assume the numbers are quantity and value
                        security_info["quantity"] = numbers[0].replace("'", "").replace(",", "")
                        if len(numbers) > 1:
                            security_info["value"] = numbers[1].replace("'", "").replace(",", "")
                
                # Look for currency
                for ctx_line in context:
                    currencies = re.findall(r'[A-Z]{3}', ctx_line)
                    for currency in currencies:
                        if currency in ['USD', 'EUR', 'GBP', 'CHF']:
                            security_info["currency"] = currency
                            break
                    if security_info["currency"]:
                        break
    
    return security_info

def analyze_portfolio(pdf_path, output_dir=None):
    """Analyze a portfolio PDF and extract detailed information."""
    print(f"\n=== Analyzing portfolio from {pdf_path} ===")
    
    # Check if PDF file exists
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file '{pdf_path}' not found.")
        return False
    
    # Create output directory
    if not output_dir:
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'portfolio_analysis')
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract text from PDF
    try:
        doc = fitz.open(pdf_path)
        full_text = ""
        page_texts = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text()
            full_text += page_text
            page_texts.append(page_text)
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return False
    
    # Extract ISINs
    isins = extract_isin_pattern(full_text)
    unique_isins = list(set(isins))
    
    print(f"\nFound {len(unique_isins)} unique ISINs:")
    for i, isin in enumerate(unique_isins):
        print(f"  {i+1}. {isin}")
    
    # Extract tables from each page
    all_tables = []
    for page_num, page_text in enumerate(page_texts):
        tables = extract_tables(page_text)
        if tables:
            print(f"\nFound {len(tables)} tables on page {page_num + 1}")
            all_tables.extend(tables)
    
    print(f"\nFound {len(all_tables)} tables in total")
    
    # Extract security details for each ISIN
    securities = []
    for isin in unique_isins:
        security_info = extract_security_details(all_tables, isin)
        securities.append(security_info)
    
    # Extract portfolio total value
    total_value = ""
    currency = ""
    
    # Look for total value in the text
    total_pattern = r'Total\s+[\d,\']+\.?\d*\s+[A-Z]{3}'
    total_matches = re.findall(total_pattern, full_text)
    if total_matches:
        total_line = total_matches[0]
        value_match = re.search(r'[\d,\']+\.?\d*', total_line)
        if value_match:
            total_value = value_match.group(0).replace("'", "").replace(",", "")
        
        currency_match = re.search(r'[A-Z]{3}', total_line)
        if currency_match:
            currency = currency_match.group(0)
    
    # Create portfolio summary
    portfolio_summary = {
        "total_value": total_value,
        "currency": currency,
        "securities_count": len(securities),
        "securities": securities
    }
    
    # Calculate sum of security values
    sum_values = 0
    for security in securities:
        if security["value"]:
            try:
                sum_values += float(security["value"])
            except ValueError:
                pass
    
    portfolio_summary["sum_security_values"] = sum_values
    
    # Check if sum matches total
    if total_value:
        try:
            total_float = float(total_value)
            portfolio_summary["values_match"] = abs(total_float - sum_values) < 0.01
        except ValueError:
            portfolio_summary["values_match"] = False
    
    # Print portfolio summary
    print("\nPortfolio Summary:")
    print(f"  Total Value: {portfolio_summary['total_value']} {portfolio_summary['currency']}")
    print(f"  Securities Count: {portfolio_summary['securities_count']}")
    print(f"  Sum of Security Values: {portfolio_summary['sum_security_values']}")
    if "values_match" in portfolio_summary:
        print(f"  Values Match: {portfolio_summary['values_match']}")
    
    # Print security details
    print("\nSecurity Details:")
    for i, security in enumerate(securities):
        print(f"\n  Security {i+1}:")
        print(f"    ISIN: {security['isin']}")
        print(f"    Name: {security['name']}")
        print(f"    Price: {security['price']}")
        print(f"    Quantity: {security['quantity']}")
        print(f"    Value: {security['value']}")
        print(f"    Currency: {security['currency']}")
        print(f"    Maturity: {security['maturity']}")
        print(f"    Coupon: {security['coupon']}")
    
    # Save results to file
    results_file = os.path.join(output_dir, "portfolio_analysis.json")
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(portfolio_summary, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to: {results_file}")
    
    return True

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Analyze a portfolio PDF and extract detailed information")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("--output", help="Output directory for results")
    args = parser.parse_args()
    
    analyze_portfolio(args.pdf_path, args.output)
