
import sys
import os
import json
import re
import pandas as pd
import fitz  # PyMuPDF

def extract_securities_from_pdf(pdf_path):
    """
    Extract securities information from a PDF file.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Dictionary containing extracted information
    """
    print(f"Processing {pdf_path} to extract securities information...")

    # Extract text from PDF
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()

    # Detect document type
    doc_type = detect_document_type(text)

    # Extract tables from all pages
    tables = extract_tables_from_pdf(pdf_path)

    # Extract securities
    securities = []

    # Process tables to find securities
    for table in tables:
        # Check if this is a securities table by looking for ISIN
        table_text = ' '.join([' '.join(row) for row in table['rows']])
        if 'ISIN' in table_text:
            # Extract securities from this table
            securities.extend(extract_securities_from_table(table))

    # Extract portfolio summary
    portfolio_summary = extract_portfolio_summary(text, doc_type)

    # Extract asset allocation
    asset_allocation = extract_asset_allocation(text, doc_type)

    return {
        "document_type": doc_type,
        "securities": securities,
        "portfolio_summary": portfolio_summary,
        "asset_allocation": asset_allocation,
        "tables": tables
    }

def detect_document_type(text):
    """
    Detect the type of financial document.

    Args:
        text: Document text

    Returns:
        Document type as a string
    """
    # Check for portfolio statement
    if any(x in text.lower() for x in ["portfolio statement", "portfolio valuation", "asset statement"]):
        return "portfolio_statement"

    # Check for account statement
    if any(x in text.lower() for x in ["account statement", "bank statement", "transaction statement"]):
        return "account_statement"

    # Check for fund fact sheet
    if any(x in text.lower() for x in ["fund fact sheet", "kiid", "key investor information"]):
        return "fund_fact_sheet"

    return "generic"

def extract_tables_from_pdf(pdf_path):
    """
    Extract tables from a PDF file.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        List of tables
    """
    tables = []

    # Open the PDF
    doc = fitz.open(pdf_path)

    # Process each page
    for page_num, page in enumerate(doc):
        # Get page text with blocks
        blocks = page.get_text("dict")["blocks"]

        # Find table-like structures
        for block in blocks:
            if block["type"] == 0:  # Text block
                lines = block.get("lines", [])

                # Skip blocks with too few lines
                if len(lines) < 3:
                    continue

                # Check if this block looks like a table
                if is_table_block(lines):
                    table = extract_table_from_block(lines, page_num + 1)
                    if table and len(table['rows']) > 0:
                        tables.append(table)

    doc.close()

    return tables

def is_table_block(lines):
    """
    Check if a block of lines looks like a table.

    Args:
        lines: List of lines

    Returns:
        True if the block looks like a table, False otherwise
    """
    # Check if all lines have a similar number of spans
    span_counts = [len(line.get("spans", [])) for line in lines]

    if not span_counts:
        return False

    # Calculate the most common span count
    most_common_count = max(set(span_counts), key=span_counts.count)

    # Check if most lines have the same number of spans
    matching_lines = sum(1 for count in span_counts if count == most_common_count)

    return matching_lines / len(span_counts) >= 0.7 and most_common_count >= 3

def extract_table_from_block(lines, page_number):
    """
    Extract a table from a block of lines.

    Args:
        lines: List of lines
        page_number: Page number

    Returns:
        Table as a dictionary
    """
    rows = []
    headers = []

    # Extract text from each line
    for i, line in enumerate(lines):
        spans = line.get("spans", [])
        row = [span.get("text", "").strip() for span in spans]

        # Skip empty rows
        if not any(cell.strip() for cell in row):
            continue

        # First non-empty row is treated as headers
        if i == 0 and not headers:
            headers = row
        else:
            rows.append(row)

    # Ensure all rows have the same number of columns
    max_cols = max([len(headers)] + [len(row) for row in rows])

    # Pad headers if needed
    headers = headers + [''] * (max_cols - len(headers))

    # Pad rows if needed
    rows = [row + [''] * (max_cols - len(row)) for row in rows]

    return {
        'title': 'Table from page ' + str(page_number),
        'headers': headers,
        'rows': rows,
        'page': page_number
    }

def extract_securities_from_table(table):
    """
    Extract securities from a table.

    Args:
        table: Table as a dictionary

    Returns:
        List of securities
    """
    securities = []

    # Find ISIN column
    isin_col = -1
    for i, header in enumerate(table['headers']):
        if 'ISIN' in header:
            isin_col = i
            break

    # If no ISIN column found, try to find it in the rows
    if isin_col == -1:
        for row in table['rows']:
            for i, cell in enumerate(row):
                if re.search(r'[A-Z]{2}[A-Z0-9]{9}[0-9]', cell):
                    isin_col = i
                    break
            if isin_col != -1:
                break

    # If still no ISIN column found, return empty list
    if isin_col == -1:
        return securities

    # Process rows to extract securities
    for row in table['rows']:
        # Skip empty rows
        if not any(cell.strip() for cell in row):
            continue

        # Try to find ISIN in the row
        isin = None

        if isin_col < len(row):
            # Try to extract ISIN from the ISIN column
            isin_match = re.search(r'([A-Z]{2}[A-Z0-9]{9}[0-9])', row[isin_col])
            if isin_match:
                isin = isin_match.group(1)

        if not isin:
            # Try to find ISIN in any cell
            for cell in row:
                isin_match = re.search(r'([A-Z]{2}[A-Z0-9]{9}[0-9])', cell)
                if isin_match:
                    isin = isin_match.group(1)
                    break

        if isin:
            # Create security
            security = {
                'isin': isin,
                'page': table.get('page', 1)
            }

            # Try to extract other information
            for i, cell in enumerate(row):
                if i == isin_col:
                    continue

                # Try to identify what this cell contains
                if len(cell) > 10 and not re.search(r'[A-Z]{2}[A-Z0-9]{9}[0-9]', cell):
                    security['name'] = cell.strip()
                elif re.search(r'\d+\.?\d*\s*%', cell):
                    security['weight'] = float(re.search(r'(\d+\.?\d*)\s*%', cell).group(1))
                elif re.search(r'\d+\'?\d*\'?\d*', cell) and len(cell) < 15:
                    try:
                        value = float(cell.strip().replace("'", "").replace(",", ""))
                        if 'quantity' not in security:
                            security['quantity'] = value
                        elif 'price' not in security:
                            security['price'] = value
                        elif 'value' not in security:
                            security['value'] = value
                    except:
                        pass

            securities.append(security)

    return securities

def extract_portfolio_summary(text, doc_type):
    """
    Extract portfolio summary from document text.

    Args:
        text: Document text
        doc_type: Document type

    Returns:
        Portfolio summary as a dictionary
    """
    summary = {}

    # Extract total value
    total_value_patterns = [
        r'Total\s+Value\s*:?\s*[$€£¥]?([0-9,.]+)',
        r'Portfolio\s+Value\s*:?\s*[$€£¥]?([0-9,.]+)',
        r'Total\s+Assets\s*:?\s*[$€£¥]?([0-9,.]+)'
    ]

    for pattern in total_value_patterns:
        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            summary["total_value"] = match.group(1)
            break

    # Extract currency
    currency_patterns = [
        r'(USD|EUR|GBP|CHF|JPY)',
        r'Currency\s*:?\s*(USD|EUR|GBP|CHF|JPY)',
        r'Valuation\s+Currency\s*:?\s*(USD|EUR|GBP|CHF|JPY)'
    ]

    for pattern in currency_patterns:
        match = re.search(pattern, text)

        if match:
            summary["currency"] = match.group(1)
            break

    # Extract valuation date
    date_patterns = [
        r'Valuation\s+Date\s*:?\s*(\d{2}\.\d{2}\.\d{4})',
        r'Date\s*:?\s*(\d{2}\.\d{2}\.\d{4})',
        r'As\s+of\s*:?\s*(\d{2}\.\d{2}\.\d{4})'
    ]

    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            summary["valuation_date"] = match.group(1)
            break

    return summary

def extract_asset_allocation(text, doc_type):
    """
    Extract asset allocation from document text.

    Args:
        text: Document text
        doc_type: Document type

    Returns:
        Asset allocation as a dictionary
    """
    allocation = {}

    # Look for asset allocation section
    allocation_section_patterns = [
        r'Asset\s+Allocation.*?(?=\n\n|\n[A-Z]|$)',
        r'Portfolio\s+Allocation.*?(?=\n\n|\n[A-Z]|$)',
        r'Asset\s+Class.*?(?=\n\n|\n[A-Z]|$)'
    ]

    allocation_section = ""

    for pattern in allocation_section_patterns:
        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            allocation_section = match.group(0)
            break

    if allocation_section:
        # Extract asset classes and percentages
        asset_class_matches = re.findall(r'([A-Za-z ]+)\s*:?\s*(\d+\.?\d*)\s*%', allocation_section)

        for match in asset_class_matches:
            asset_class = match[0].strip()
            percentage = float(match[1])

            allocation[asset_class] = percentage

    return allocation

# Main function
def main():
    if len(sys.argv) < 2:
        print("Usage: python script.py <pdf_path>")
        return

    pdf_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else 'output.json'

    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return

    # Extract securities
    result = extract_securities_from_pdf(pdf_path)

    # Save results
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Saved results to {output_path}")

if __name__ == "__main__":
    main()
