"""
Script to extract securities information from the messos PDF.
"""

import os
import json
import camelot
import pandas as pd
import re

def extract_securities_from_messos_pdf(pdf_path):
    """
    Extract securities information from the messos PDF.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        List of securities with their details
    """
    print(f"Processing {pdf_path} to extract securities information...")
    
    # Extract tables with stream method (better for this document)
    tables = camelot.read_pdf(
        pdf_path,
        pages='6-12',  # Focus on pages with securities
        flavor='stream',
        suppress_stdout=True,
        edge_tol=50,
        row_tol=10
    )
    
    print(f"Found {len(tables)} tables on pages 6-12")
    
    # Process tables to find securities
    securities = []
    
    for i, table in enumerate(tables):
        # Convert to pandas DataFrame
        df = table.df
        
        # Check if this is a securities table by looking for ISIN
        table_text = ' '.join([' '.join(row) for row in df.values.tolist()])
        if 'ISIN:' in table_text:
            print(f"Found securities table: table_{i+1} on page {table.page}")
            
            # Extract securities from this table
            securities.extend(extract_securities_from_table(df, table.page))
    
    return securities

def extract_securities_from_table(df, page_number):
    """
    Extract securities from a table.
    
    Args:
        df: Pandas DataFrame containing the table
        page_number: Page number of the table
        
    Returns:
        List of securities with their details
    """
    securities = []
    
    # Convert DataFrame to list of rows
    rows = df.values.tolist()
    
    # Process rows to extract securities
    current_security = None
    
    for row in rows:
        row_text = ' '.join(row)
        
        # Check if this row contains an ISIN
        isin_match = re.search(r'ISIN:\s*([A-Z]{2}[A-Z0-9]{9}[0-9])', row_text)
        
        if isin_match:
            # If we were processing a security, add it to the list
            if current_security:
                securities.append(current_security)
            
            # Start a new security
            isin = isin_match.group(1)
            
            # Extract name from the row
            name = None
            for cell in row:
                if len(cell) > 10 and 'ISIN:' not in cell:
                    name = cell.strip()
                    break
            
            # Extract nominal/quantity
            nominal = None
            for cell in row:
                if re.search(r'\d+\'?\d*', cell) and len(cell) < 15:
                    nominal = cell.strip()
                    break
            
            # Extract value
            value = None
            for i, cell in enumerate(row):
                if 'Valuation' in cell or 'Countervalue' in cell:
                    if i+1 < len(row) and re.search(r'\d+\'?\d*', row[i+1]):
                        value = row[i+1].strip()
                        break
            
            # Create new security
            current_security = {
                'isin': isin,
                'name': name,
                'nominal': nominal,
                'page': page_number,
                'value': value,
                'details': []
            }
        
        # If we're processing a security, add details
        elif current_security:
            # Skip empty rows
            if not row_text.strip():
                continue
                
            # Add row as details
            current_security['details'].append(row_text)
            
            # Check for maturity date
            maturity_match = re.search(r'Maturity:\s*(\d{2}\.\d{2}\.\d{4})', row_text)
            if maturity_match:
                current_security['maturity'] = maturity_match.group(1)
            
            # Check for coupon
            coupon_match = re.search(r'Coupon:.*?(\d+\.?\d*)\s*%', row_text)
            if coupon_match:
                current_security['coupon'] = coupon_match.group(1) + '%'
    
    # Add the last security if we were processing one
    if current_security:
        securities.append(current_security)
    
    return securities

def main():
    # Find the messos PDF file
    pdf_path = None
    for root, dirs, files in os.walk('.'):
        for file in files:
            if 'messos' in file.lower() and file.lower().endswith('.pdf'):
                pdf_path = os.path.join(root, file)
                break
        if pdf_path:
            break
    
    if not pdf_path:
        print("Could not find the messos PDF file. Please provide the path:")
        pdf_path = input("> ")
    
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return
    
    # Extract securities
    securities = extract_securities_from_messos_pdf(pdf_path)
    
    # Save results
    output_path = 'messos_securities.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(securities, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(securities)} securities to {output_path}")
    
    # Print summary
    print("\nExtracted Securities:")
    for i, security in enumerate(securities):
        print(f"{i+1}. {security.get('name', 'Unknown')} (ISIN: {security.get('isin', 'Unknown')})")
        print(f"   Nominal: {security.get('nominal', 'Unknown')}")
        print(f"   Value: {security.get('value', 'Unknown')}")
        print(f"   Maturity: {security.get('maturity', 'Unknown')}")
        print(f"   Coupon: {security.get('coupon', 'Unknown')}")
        print()

if __name__ == "__main__":
    main()
