"""
Standalone test script for the Financial Document Processor.

This script tests the Financial Document Processor with the Messos PDF
without relying on the web interface or API.
"""

import os
import sys
import json
import time
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def find_messos_pdf():
    """Find the Messos PDF file."""
    possible_paths = [
        "messos.pdf",
        "test-pdfs/messos.pdf",
        "sample-pdfs/messos.pdf",
        "DevDocs/frontend/public/messos.pdf",
        "DevDocs/public/messos.pdf",
        "backv2-github/DevDocs/frontend/public/messos.pdf",
        "backv2-github/DevDocs/public/messos.pdf",
        "findoc-analyzer/messos.pdf",
        "findoc-analyzer/sample-pdfs/messos.pdf",
        "ocr-docker/uploads/messos.pdf",
        "ocr-test/messos.pdf"
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            logger.info(f"Found Messos PDF at: {path}")
            return path
    
    logger.error("Could not find Messos PDF. Please provide the path to the file.")
    return None

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file using pdfminer.six.
    
    Args:
        pdf_path: Path to the PDF file
    
    Returns:
        Extracted text
    """
    try:
        # Import pdfminer.six
        from pdfminer.high_level import extract_text
        
        # Extract text
        text = extract_text(pdf_path)
        
        return text
    except ImportError:
        logger.error("pdfminer.six not installed. Please install it with 'pip install pdfminer.six'.")
        return None
    except Exception as e:
        logger.error(f"Error extracting text: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None

def extract_securities(text):
    """
    Extract securities (ISINs) from text.
    
    Args:
        text: Input text
    
    Returns:
        List of securities
    """
    import re
    
    securities = []
    
    # ISIN pattern: 2 letters followed by 9 alphanumeric characters and a check digit
    isin_pattern = r'\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b'
    
    # Find all ISINs
    isins = re.findall(isin_pattern, text)
    
    for isin in isins:
        # Extract context (text around the ISIN)
        isin_index = text.find(isin)
        start_index = max(0, isin_index - 50)
        end_index = min(len(text), isin_index + len(isin) + 50)
        context = text[start_index:end_index]
        
        securities.append({
            "isin": isin,
            "context": context,
            "source": "text"
        })
    
    return securities

def calculate_metrics(text, securities):
    """
    Calculate metrics for the extracted text and securities.
    
    Args:
        text: Extracted text
        securities: Extracted securities
    
    Returns:
        Dictionary with metrics
    """
    # Count words
    words = text.split()
    word_count = len(words)
    
    # Count financial terms
    financial_terms = [
        'portfolio', 'value', 'shares', 'stock', 'bond', 'fund', 'isin', 'price',
        'quantity', 'allocation', 'asset', 'security', 'investment', 'dividend',
        'yield', 'return', 'equity', 'income', 'balance', 'statement'
    ]
    
    term_count = 0
    for term in financial_terms:
        term_count += sum(1 for word in words if word.lower() == term.lower())
    
    # Calculate term density
    term_density = term_count / word_count if word_count > 0 else 0
    
    # Securities count
    securities_count = len(securities)
    
    # Calculate quality scores
    text_quality = min(100, (word_count / 1000) * 70 + term_density * 100)
    securities_quality = min(100, securities_count * 10)
    
    # Calculate overall score
    overall_score = (text_quality * 0.7) + (securities_quality * 0.3)
    
    # Determine grade
    grade = 'F'
    if overall_score >= 90:
        grade = 'A'
    elif overall_score >= 80:
        grade = 'B'
    elif overall_score >= 70:
        grade = 'C'
    elif overall_score >= 60:
        grade = 'D'
    
    return {
        'word_count': word_count,
        'financial_terms': term_count,
        'term_density': term_density,
        'securities_count': securities_count,
        'text_quality': text_quality,
        'securities_quality': securities_quality,
        'overall_score': overall_score,
        'grade': grade
    }

def process_financial_document(pdf_path, output_dir=None):
    """
    Process a financial document.
    
    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save the results
    
    Returns:
        Dictionary with processing results
    """
    try:
        # Create output directory if it doesn't exist
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        logger.info(f"Processing financial document: {pdf_path}")
        
        # Start timer
        start_time = time.time()
        
        # Extract text
        text = extract_text_from_pdf(pdf_path)
        
        if not text:
            logger.error("Failed to extract text from PDF")
            return None
        
        # Extract securities
        securities = extract_securities(text)
        
        # Calculate metrics
        metrics = calculate_metrics(text, securities)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Create results object
        results = {
            'pdf_path': pdf_path,
            'processing_time': processing_time,
            'text': text,
            'text_length': len(text),
            'word_count': metrics['word_count'],
            'securities': securities,
            'security_count': len(securities),
            'metrics': metrics
        }
        
        # Save results to output directory if provided
        if output_dir:
            # Save text
            text_path = os.path.join(output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_text.txt")
            with open(text_path, 'w', encoding='utf-8') as f:
                f.write(text)
            
            # Save securities
            securities_path = os.path.join(output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_securities.json")
            with open(securities_path, 'w', encoding='utf-8') as f:
                json.dump(securities, f, indent=2)
            
            # Save metrics
            metrics_path = os.path.join(output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_metrics.json")
            with open(metrics_path, 'w', encoding='utf-8') as f:
                json.dump(metrics, f, indent=2)
            
            # Save results
            results_path = os.path.join(output_dir, f"{os.path.basename(pdf_path).split('.')[0]}_results.json")
            with open(results_path, 'w', encoding='utf-8') as f:
                # Create a copy of results without the text content to reduce file size
                results_copy = results.copy()
                results_copy['text'] = f"Saved to {os.path.basename(text_path)}"
                
                json.dump(results_copy, f, indent=2)
        
        # Print summary
        print("\nProcessing Results Summary:")
        print(f"PDF: {pdf_path}")
        print(f"Processing Time: {processing_time:.2f} seconds")
        print(f"Text Length: {len(text)} characters")
        print(f"Word Count: {metrics['word_count']} words")
        print(f"Securities Found: {len(securities)}")
        
        if securities:
            print("\nExtracted Securities:")
            for i, security in enumerate(securities[:5]):
                print(f"  {i+1}. ISIN: {security['isin']}")
            if len(securities) > 5:
                print(f"  ... and {len(securities) - 5} more")
        
        print("\nAccuracy Metrics:")
        print(f"Word Count: {metrics['word_count']}")
        print(f"Financial Terms: {metrics['financial_terms']}")
        print(f"Term Density: {metrics['term_density']:.4f}")
        print(f"Securities Count: {metrics['securities_count']}")
        print(f"Text Quality Score: {metrics['text_quality']:.2f}/100")
        print(f"Securities Quality Score: {metrics['securities_quality']:.2f}/100")
        print(f"Overall Score: {metrics['overall_score']:.2f}/100")
        print(f"Grade: {metrics['grade']}")
        
        if output_dir:
            print(f"\nResults saved to {output_dir}")
        
        return results
    
    except Exception as e:
        logger.error(f"Error processing financial document: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None

def main():
    # Find the Messos PDF
    pdf_path = find_messos_pdf()
    if not pdf_path:
        return
    
    # Create output directory
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'financial_document_processor_results')
    
    # Process the document
    process_financial_document(pdf_path, output_dir)

if __name__ == '__main__':
    main()
