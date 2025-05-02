"""
Test script for extracting tables from the messos PDF using camelot-py.
"""

import os
import json
import camelot
import pandas as pd

def extract_tables_with_camelot(pdf_path):
    """
    Extract tables from a PDF using camelot-py.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        List of extracted tables
    """
    print(f"Processing {pdf_path} with camelot-py...")
    
    # Extract tables with lattice method (for bordered tables)
    tables_lattice = camelot.read_pdf(
        pdf_path,
        pages='all',
        flavor='lattice',
        suppress_stdout=True
    )
    
    print(f"Found {len(tables_lattice)} tables with lattice method")
    
    # Extract tables with stream method (for non-bordered tables)
    tables_stream = camelot.read_pdf(
        pdf_path,
        pages='all',
        flavor='stream',
        suppress_stdout=True,
        edge_tol=50,
        row_tol=10
    )
    
    print(f"Found {len(tables_stream)} tables with stream method")
    
    # Process tables
    processed_tables = []
    
    # Process lattice tables
    for i, table in enumerate(tables_lattice):
        # Convert to pandas DataFrame
        df = table.df
        
        # Add to processed tables
        processed_tables.append({
            'id': f'lattice_table_{i+1}',
            'page': int(table.page),
            'accuracy': table.accuracy,
            'method': 'lattice',
            'data': df.to_dict(orient='records'),
            'headers': df.columns.tolist(),
            'rows': df.values.tolist()
        })
    
    # Process stream tables
    for i, table in enumerate(tables_stream):
        # Convert to pandas DataFrame
        df = table.df
        
        # Add to processed tables
        processed_tables.append({
            'id': f'stream_table_{i+1}',
            'page': int(table.page),
            'accuracy': table.accuracy,
            'method': 'stream',
            'data': df.to_dict(orient='records'),
            'headers': df.columns.tolist(),
            'rows': df.values.tolist()
        })
    
    return processed_tables

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
    
    # Extract tables
    tables = extract_tables_with_camelot(pdf_path)
    
    # Save results
    output_path = 'messos_tables_camelot.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(tables, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(tables)} tables to {output_path}")
    
    # Print first table as example
    if tables:
        print("\nExample table content:")
        print(f"Table ID: {tables[0]['id']}")
        print(f"Page: {tables[0]['page']}")
        print(f"Accuracy: {tables[0]['accuracy']}")
        print(f"Method: {tables[0]['method']}")
        print(f"Headers: {tables[0]['headers']}")
        print(f"First row: {tables[0]['rows'][0] if tables[0]['rows'] else 'No rows'}")

if __name__ == "__main__":
    main()
