
import sys
import os
import json
from docling.document_converter import DocumentConverter
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.datamodel.base_models import InputFormat

def process_pdf(pdf_path, output_path):
    """
    Process a PDF file using Docling and extract information.
    
    Args:
        pdf_path: Path to the PDF file
        output_path: Path to save the output JSON
        
    Returns:
        Dictionary containing extracted information
    """
    print(f"Processing {pdf_path} with Docling...")
    
    # Configure Docling pipeline options
    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_code_enrichment = True
    pipeline_options.do_formula_enrichment = True
    pipeline_options.do_picture_classification = True
    pipeline_options.do_picture_description = True
    pipeline_options.generate_picture_images = True
    
    # Create converter with options
    converter = DocumentConverter(format_options={
        InputFormat.PDF: {
            "pipeline_options": pipeline_options
        }
    })
    
    # Convert the document
    result = converter.convert(pdf_path)
    document = result.document
    
    # Extract tables
    tables = []
    for item in document.items:
        if item.type == "TABLE":
            table_data = {
                "id": item.id,
                "page": item.page,
                "rows": len(item.rows) if hasattr(item, "rows") else 0,
                "columns": len(item.columns) if hasattr(item, "columns") else 0,
                "data": item.data if hasattr(item, "data") else []
            }
            tables.append(table_data)
    
    # Extract images
    images = []
    for item in document.items:
        if item.type == "PICTURE":
            image_data = {
                "id": item.id,
                "page": item.page,
                "classification": item.classification if hasattr(item, "classification") else None,
                "description": item.description if hasattr(item, "description") else None
            }
            images.append(image_data)
    
    # Extract text content
    text_content = document.export_to_text()
    
    # Extract securities information (ISIN codes, etc.)
    securities = []
    isin_pattern = r'[A-Z]{2}[A-Z0-9]{9}[0-9]'
    import re
    isin_matches = re.findall(isin_pattern, text_content)
    
    for isin in isin_matches:
        # Find context around the ISIN
        isin_index = text_content.find(isin)
        start_index = max(0, isin_index - 100)
        end_index = min(len(text_content), isin_index + 100)
        context = text_content[start_index:end_index]
        
        securities.append({
            "isin": isin,
            "context": context
        })
    
    # Create result object
    result = {
        "document_id": os.path.basename(pdf_path),
        "total_pages": document.page_count,
        "tables": tables,
        "images": images,
        "securities": securities,
        "markdown_content": document.export_to_markdown(),
        "text_content": text_content
    }
    
    # Save results to output file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"Saved results to {output_path}")
    return result

# Main function
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python docling_processor.py <pdf_path> <output_path>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_path = sys.argv[2]
    
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        sys.exit(1)
    
    # Process the PDF
    process_pdf(pdf_path, output_path)
