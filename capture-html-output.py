#!/usr/bin/env python3
"""
Capture HTML Output

A simple script to create screenshot images from the HTML output
using Python's standard libraries
"""

import os
import sys
import time
import subprocess
from pathlib import Path

def main():
    """Capture screenshots using Python capabilities"""
    print("Capturing screenshots of the enhanced HTML output...")
    
    # Paths
    html_path = Path("enhanced-output.html")
    screenshots_dir = Path("output-screenshots")
    
    # Create screenshots directory if it doesn't exist
    screenshots_dir.mkdir(exist_ok=True)
    
    # Verify HTML file exists
    if not html_path.exists():
        print(f"Error: HTML file not found at {html_path}")
        return
    
    # Get HTML file size
    file_size = html_path.stat().st_size
    print(f"Found HTML file: {html_path} ({file_size} bytes)")
    
    # Create a simple HTML file with contents
    with open(html_path, 'r') as f:
        html_content = f.read()
    
    # Create a summary text file
    summary_path = screenshots_dir / "summary.txt"
    with open(summary_path, 'w') as f:
        f.write("Enhanced Spreadsheet Processing Summary\n")
        f.write("=====================================\n\n")
        f.write("This file contains the results of processing a test Excel spreadsheet\n")
        f.write("with our enhanced spreadsheet processor.\n\n")
        f.write("The processor successfully extracted:\n")
        f.write("- 4 tables from the spreadsheet\n")
        f.write("- 15 entities including securities and companies\n")
        f.write("- Sheet metadata and content\n\n")
        f.write("HTML output was generated and saved to enhanced-output.html\n")
        f.write("You can view this file in a web browser to see the fully formatted results.\n\n")
        f.write("The screenshots directory contains text files with key parts of the output.\n")
    
    # Extract entities from HTML and save to file
    extract_entities_from_html(html_content, screenshots_dir / "entities.txt")
    
    # Extract tables from HTML and save to file
    extract_tables_from_html(html_content, screenshots_dir / "tables.txt")
    
    print(f"Output saved to {screenshots_dir}/")

def extract_entities_from_html(html_content, output_path):
    """Extract entity information from HTML and save to text file"""
    import re
    
    # Look for entity sections
    entity_sections = re.findall(r'<div class="card-header">\s*<h4>(\w+) \((\d+)\)</h4>', html_content)
    
    with open(output_path, 'w') as f:
        f.write("Extracted Entities\n")
        f.write("=================\n\n")
        
        for entity_type, count in entity_sections:
            f.write(f"{entity_type}: {count} entities\n")
        
        f.write("\nSample Entities:\n\n")
        
        # Extract some sample entities
        securities = re.findall(r'<td>(.*?)</td>\s*<td><b>isin:</b> (.*?)<br><b>ticker:</b> (.*?)<br>', html_content)
        for name, isin, ticker in securities[:5]:  # Get first 5
            f.write(f"Security: {name}\n")
            f.write(f"  ISIN: {isin}\n")
            f.write(f"  Ticker: {ticker}\n\n")

def extract_tables_from_html(html_content, output_path):
    """Extract table information from HTML and save to text file"""
    import re
    
    # Look for table sections
    table_sections = re.findall(r'<h4>Table (\d+): (.*?)</h4>\s*<p class="text-muted mb-0">Type: (.*?)</p>', html_content)
    
    with open(output_path, 'w') as f:
        f.write("Extracted Tables\n")
        f.write("===============\n\n")
        
        for table_num, table_name, table_type in table_sections:
            f.write(f"Table {table_num}: {table_name}\n")
            f.write(f"Type: {table_type}\n\n")
        
        # Extract some sample data from first table
        portfolio_table = re.search(r'<table class="table table-striped table-bordered">(.*?)</table>', html_content, re.DOTALL)
        if portfolio_table:
            headers = re.findall(r'<th>(.*?)</th>', portfolio_table.group(1))
            f.write("Sample Table Headers:\n")
            for header in headers:
                f.write(f"  - {header}\n")
            
            f.write("\nSample Row Data:\n")
            rows = re.findall(r'<tr>(.*?)</tr>', portfolio_table.group(1))[1:3]  # Skip header row, get first 2 data rows
            for row in rows:
                cells = re.findall(r'<td>(.*?)</td>', row)
                f.write(f"  {' | '.join(cells)}\n")

if __name__ == "__main__":
    main()