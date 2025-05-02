"""
Script to extract information about a specific security from a PDF file.
"""
import os
import sys
import re
import json
import fitz  # PyMuPDF

def extract_security_info(pdf_path, isin):
    """Extract information about a specific security from a PDF file."""
    print(f"\n=== Extracting information for security {isin} from {pdf_path} ===")
    
    # Check if PDF file exists
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file '{pdf_path}' not found.")
        return False
    
    # Extract text from PDF
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return False
    
    # Check if ISIN exists in text
    if isin not in text:
        print(f"Warning: ISIN {isin} not found in text.")
        return False
    
    # Extract lines containing the ISIN
    lines = text.split('\n')
    isin_lines = []
    for i, line in enumerate(lines):
        if isin in line:
            # Get context (5 lines before and after)
            start = max(0, i - 5)
            end = min(len(lines), i + 6)
            context = lines[start:end]
            isin_lines.append({
                "line_number": i + 1,
                "line": line,
                "context": context
            })
    
    print(f"\nFound {len(isin_lines)} occurrences of ISIN {isin}:")
    for i, occurrence in enumerate(isin_lines):
        print(f"\nOccurrence {i+1} (Line {occurrence['line_number']}):")
        print(f"Line: {occurrence['line']}")
        print("Context:")
        for j, context_line in enumerate(occurrence['context']):
            line_num = occurrence['line_number'] - 5 + j
            if line_num == occurrence['line_number']:
                print(f"  > {line_num}: {context_line}")
            else:
                print(f"    {line_num}: {context_line}")
    
    # Extract tables containing the ISIN
    print("\nExtracting tables...")
    tables = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        page_text = page.get_text()
        
        if isin in page_text:
            print(f"ISIN found on page {page_num + 1}")
            
            # Extract tables using a simple heuristic
            # Look for lines with multiple tab or space separations
            page_lines = page_text.split('\n')
            table_start = -1
            table_end = -1
            in_table = False
            
            for i, line in enumerate(page_lines):
                if isin in line:
                    # Found the ISIN, now look for table structure
                    # Check if this line has multiple tab or space separations
                    if len(re.findall(r'\s{2,}', line)) >= 3 or '\t' in line:
                        # This might be a table row
                        if not in_table:
                            table_start = max(0, i - 5)  # Start a few lines before
                            in_table = True
                    
                    # If we're already in a table, continue until we find a line that doesn't look like a table row
                    if in_table and i > table_start + 2:  # Ensure we have at least 3 lines
                        if len(re.findall(r'\s{2,}', line)) < 3 and '\t' not in line:
                            table_end = i
                            
                            # Extract the table
                            table_lines = page_lines[table_start:table_end]
                            tables.append({
                                "page": page_num + 1,
                                "table": table_lines
                            })
                            
                            in_table = False
            
            # If we're still in a table at the end of the page
            if in_table:
                table_end = len(page_lines)
                table_lines = page_lines[table_start:table_end]
                tables.append({
                    "page": page_num + 1,
                    "table": table_lines
                })
    
    print(f"\nFound {len(tables)} tables containing ISIN {isin}:")
    for i, table in enumerate(tables):
        print(f"\nTable {i+1} (Page {table['page']}):")
        for line in table['table']:
            print(f"  {line}")
    
    # Try to extract specific information about the security
    print("\nExtracting security information...")
    security_info = {
        "isin": isin,
        "name": "",
        "price": "",
        "price_date": "",
        "quantity": "",
        "value": "",
        "currency": ""
    }
    
    # Look for security name
    for occurrence in isin_lines:
        line = occurrence['line']
        if isin in line:
            # The security name is often before the ISIN
            parts = line.split(isin)
            if parts[0].strip():
                security_info["name"] = parts[0].strip()
                break
    
    # Look for price, quantity, and value in tables
    for table in tables:
        for line in table['table']:
            if isin in line:
                # Look for numbers in the line
                numbers = re.findall(r'[\d,]+\.\d+', line)
                if len(numbers) >= 3:
                    # Assume the numbers are quantity, price, and value
                    security_info["quantity"] = numbers[0]
                    security_info["price"] = numbers[1]
                    security_info["value"] = numbers[2]
                
                # Look for currency
                currencies = re.findall(r'[A-Z]{3}', line)
                for currency in currencies:
                    if currency in ['USD', 'EUR', 'GBP', 'CHF']:
                        security_info["currency"] = currency
                        break
    
    # Look for price date
    date_pattern = r'\d{2}\.\d{2}\.\d{4}'
    for table in tables:
        for line in table['table']:
            dates = re.findall(date_pattern, line)
            if dates:
                security_info["price_date"] = dates[0]
                break
    
    print("\nExtracted security information:")
    for key, value in security_info.items():
        print(f"  {key}: {value}")
    
    return True

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Extract information about a specific security from a PDF file")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("--isin", help="ISIN of the security to extract information for", default="XS2530201644")
    args = parser.parse_args()
    
    extract_security_info(args.pdf_path, args.isin)
