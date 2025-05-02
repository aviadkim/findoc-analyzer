"""
Convert Text to PDF

This script converts text files to PDF format for testing.
"""

import os
import sys
import argparse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib import colors

def convert_text_to_pdf(text_file, output_file=None):
    """
    Convert a text file to PDF.
    
    Args:
        text_file: Path to the text file
        output_file: Path to the output PDF file (default: same as text_file with .pdf extension)
    """
    # If output file is not specified, use the same name as the text file with .pdf extension
    if output_file is None:
        output_file = os.path.splitext(text_file)[0] + '.pdf'
    
    # Read the text file
    with open(text_file, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Create a PDF document
    doc = SimpleDocTemplate(output_file, pagesize=letter)
    
    # Create styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Title'],
        fontSize=14,
        alignment=TA_CENTER,
        spaceAfter=12
    )
    
    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        fontSize=12,
        alignment=TA_LEFT,
        spaceAfter=6,
        spaceBefore=12
    )
    
    normal_style = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_LEFT,
        spaceAfter=6
    )
    
    # Process the text
    lines = text.split('\n')
    
    # Create a list of flowables
    flowables = []
    
    # Process each line
    current_style = normal_style
    
    for i, line in enumerate(lines):
        # Skip empty lines
        if not line.strip():
            flowables.append(Spacer(1, 6))
            continue
        
        # Check if this is a title (first line)
        if i == 0:
            flowables.append(Paragraph(line, title_style))
            continue
        
        # Check if this is a heading (all uppercase)
        if line.isupper() and len(line) > 3:
            flowables.append(Paragraph(line, heading_style))
            continue
        
        # Check if this is a subheading (ends with colon)
        if line.strip().endswith(':'):
            flowables.append(Paragraph(line, heading_style))
            continue
        
        # Check if this is a security entry (starts with a number and period)
        if line.strip().startswith(tuple(f"{n}." for n in range(1, 10))):
            flowables.append(Paragraph(line, heading_style))
            continue
        
        # Regular line
        flowables.append(Paragraph(line, normal_style))
    
    # Build the PDF
    doc.build(flowables)
    
    print(f"PDF created: {output_file}")
    return output_file

def main():
    """
    Main function.
    """
    parser = argparse.ArgumentParser(description='Convert text files to PDF')
    parser.add_argument('--input', type=str, required=True, help='Input text file or directory')
    parser.add_argument('--output', type=str, help='Output PDF file or directory')
    
    args = parser.parse_args()
    
    # Check if input is a file or directory
    if os.path.isfile(args.input):
        # Convert a single file
        convert_text_to_pdf(args.input, args.output)
    elif os.path.isdir(args.input):
        # Convert all text files in the directory
        output_dir = args.output if args.output else args.input
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        for filename in os.listdir(args.input):
            if filename.endswith('.txt'):
                input_file = os.path.join(args.input, filename)
                output_file = os.path.join(output_dir, os.path.splitext(filename)[0] + '.pdf')
                convert_text_to_pdf(input_file, output_file)
    else:
        print(f"Input not found: {args.input}")

if __name__ == "__main__":
    main()
