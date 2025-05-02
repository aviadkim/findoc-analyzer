"""
Test script for extracting tables from the messos PDF using unstructured.
"""

import os
import json
from unstructured.partition.pdf import partition_pdf
from unstructured.documents.elements import Table

def extract_tables_with_unstructured(pdf_path):
    """
    Extract tables from a PDF using unstructured.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        List of extracted tables
    """
    print(f"Processing {pdf_path} with unstructured...")
    
    # Extract elements with spatial information
    elements = partition_pdf(
        pdf_path,
        include_metadata=True,
        include_page_breaks=True,
        include_image_data=False,
        extract_images_in_pdf=False,
        infer_table_structure=True,
        strategy="hi_res"
    )
    
    print(f"Extracted {len(elements)} elements from the document")
    
    # Extract tables
    tables = []
    for element in elements:
        if isinstance(element, Table):
            tables.append(element)
    
    print(f"Found {len(tables)} tables")
    
    # Process tables
    processed_tables = []
    for i, table in enumerate(tables):
        # Get table metadata
        metadata = getattr(table, 'metadata', {})
        page_number = metadata.get('page_number', 0)
        
        # Get table content
        table_data = str(table)
        
        # Add to processed tables
        processed_tables.append({
            'id': f'table_{i+1}',
            'page': page_number,
            'content': table_data
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
    tables = extract_tables_with_unstructured(pdf_path)
    
    # Save results
    output_path = 'messos_tables_unstructured.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(tables, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(tables)} tables to {output_path}")
    
    # Print first table as example
    if tables:
        print("\nExample table content:")
        print(tables[0]['content'])

if __name__ == "__main__":
    main()
