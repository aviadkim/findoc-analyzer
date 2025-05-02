"""
Script to integrate the enhanced securities extractor with the existing PDF processor.
"""
import os
import sys
import logging
import json
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the extractors directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'extractors'))

# Import the enhanced securities extractor
from enhanced_securities_extractor import SecurityExtractor

# Import the existing PDF processor
from pdf_processor import PDFProcessor

class EnhancedPDFProcessor(PDFProcessor):
    """
    Enhanced PDF processor that uses the enhanced securities extractor.
    """
    
    def __init__(self, debug=False):
        """
        Initialize the enhanced PDF processor.
        
        Args:
            debug: Whether to print debug information
        """
        super().__init__()
        self.security_extractor = SecurityExtractor(debug=debug)
        self.debug = debug
    
    def extract_security_details(self, text, isins):
        """
        Extract security details using the enhanced securities extractor.
        
        Args:
            text: Text to extract securities from
            isins: List of ISINs
            
        Returns:
            List of extracted securities
        """
        # Detect document type
        doc_type = self.detect_document_type(text)
        
        if self.debug:
            logger.info(f"Extracting securities from {doc_type} document")
        
        # Get the PDF path from the current document being processed
        pdf_path = getattr(self, 'current_pdf_path', None)
        
        if not pdf_path:
            logger.warning("No PDF path available, falling back to standard extractor")
            return super().extract_security_details(text, isins)
        
        try:
            # Extract securities using the enhanced extractor
            result = self.security_extractor.extract_from_pdf(pdf_path)
            
            if 'securities' in result and result['securities']:
                if self.debug:
                    logger.info(f"Enhanced extractor found {len(result['securities'])} securities")
                return result['securities']
            else:
                logger.warning("Enhanced extractor found no securities, falling back to standard extractor")
                return super().extract_security_details(text, isins)
        except Exception as e:
            logger.error(f"Error using enhanced extractor: {str(e)}")
            logger.info("Falling back to standard extractor")
            return super().extract_security_details(text, isins)
    
    def process_pdf(self, pdf_path):
        """
        Process a PDF file and extract financial data.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary containing extracted financial data
        """
        # Store the PDF path for use by the enhanced extractor
        self.current_pdf_path = pdf_path
        
        # Use the standard processor
        return super().process_pdf(pdf_path)

def main():
    """
    Main function to test the enhanced PDF processor.
    """
    # Check command line arguments
    if len(sys.argv) < 2:
        print("Usage: python integrate_enhanced_extractor.py <pdf_path>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    # Check if the PDF file exists
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file '{pdf_path}' not found.")
        sys.exit(1)
    
    # Create the enhanced PDF processor
    processor = EnhancedPDFProcessor(debug=True)
    
    # Process the PDF
    results = processor.process_pdf(pdf_path)
    
    # Save the results
    output_path = f"{os.path.splitext(pdf_path)[0]}_enhanced_results.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"Results saved to {output_path}")
    
    # Print summary
    print(f"\nDocument Type: {results['document_type']}")
    print(f"Found {len(results['isins'])} ISINs")
    print(f"Extracted {len(results['securities'])} securities")
    
    # Print first 3 securities as example
    print("\nExample Securities:")
    for i, security in enumerate(results['securities'][:3]):
        print(f"\nSecurity {i+1}:")
        print(f"  ISIN: {security.get('isin', 'Unknown')}")
        print(f"  Description: {security.get('description', 'Unknown')}")
        print(f"  Type: {security.get('type', 'Unknown')}")
        print(f"  Nominal: {security.get('nominal', 'Unknown')}")
        print(f"  Value: {security.get('value', 'Unknown')}")
        print(f"  Currency: {security.get('currency', 'Unknown')}")
        print(f"  Maturity: {security.get('maturity', 'Unknown')}")
        print(f"  Coupon: {security.get('coupon', 'Unknown')}")

if __name__ == "__main__":
    main()
