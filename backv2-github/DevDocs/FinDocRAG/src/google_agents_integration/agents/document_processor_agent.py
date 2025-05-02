"""
Document Processing Agent using Google's Agent Development Kit (ADK).

This agent is responsible for extracting text, tables, and financial data from documents.
"""
import os
import logging
import base64
from typing import Dict, List, Any, Optional
import fitz  # PyMuPDF
import pandas as pd
import re
from PIL import Image

from google.adk.agents import Agent
from google.adk.tools import Tool

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define tool functions
def extract_pdf_content(pdf_path: str) -> Dict[str, Any]:
    """
    Extract text and tables from a PDF document.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Dictionary containing extracted text and tables
    """
    logger.info(f"Extracting content from PDF: {pdf_path}")
    
    try:
        # Open the PDF
        doc = fitz.open(pdf_path)
        
        # Extract metadata
        metadata = {
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
            "subject": doc.metadata.get("subject", ""),
            "keywords": doc.metadata.get("keywords", ""),
            "creator": doc.metadata.get("creator", ""),
            "producer": doc.metadata.get("producer", ""),
            "page_count": len(doc),
        }
        
        # Extract text from each page
        pages = []
        full_text = ""
        
        for page_num, page in enumerate(doc):
            page_text = page.get_text()
            full_text += page_text
            
            # Extract images if needed
            images = []
            image_list = page.get_images(full=True)
            
            for img_index, img_info in enumerate(image_list):
                xref = img_info[0]
                base_image = doc.extract_image(xref)
                
                if base_image:
                    image_data = {
                        "index": img_index,
                        "width": base_image["width"],
                        "height": base_image["height"],
                        "format": base_image["ext"],
                    }
                    images.append(image_data)
            
            pages.append({
                "page_num": page_num + 1,
                "text": page_text,
                "images": images
            })
        
        # Extract tables using tabula-py
        try:
            import tabula
            tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)
            
            # Convert tables to dictionaries
            table_data = []
            for i, df in enumerate(tables):
                if not df.empty:
                    table_data.append({
                        "table_id": f"table_{i+1}",
                        "page": i + 1,  # Approximate page number
                        "headers": df.columns.tolist(),
                        "data": df.to_dict(orient='records')
                    })
        except Exception as e:
            logger.warning(f"Error extracting tables: {str(e)}")
            table_data = []
        
        return {
            "metadata": metadata,
            "pages": pages,
            "full_text": full_text,
            "tables": table_data
        }
    
    except Exception as e:
        logger.error(f"Error extracting PDF content: {str(e)}")
        return {
            "error": str(e),
            "metadata": {},
            "pages": [],
            "full_text": "",
            "tables": []
        }

def extract_isins(text: str) -> List[str]:
    """
    Extract ISINs from text.
    
    Args:
        text: Text to extract ISINs from
        
    Returns:
        List of extracted ISINs
    """
    logger.info("Extracting ISINs from text")
    
    # ISIN pattern: 2 letters followed by 10 alphanumeric characters
    isin_pattern = r'[A-Z]{2}[A-Z0-9]{10}'
    
    # Find all matches
    isins = re.findall(isin_pattern, text)
    
    # Remove duplicates
    unique_isins = list(set(isins))
    
    # Validate ISINs
    valid_isins = [isin for isin in unique_isins if validate_isin(isin)]
    
    logger.info(f"Found {len(valid_isins)} valid ISINs")
    
    return valid_isins

def validate_isin(isin: str) -> bool:
    """
    Validate an ISIN using the Luhn algorithm.
    
    Args:
        isin: ISIN to validate
        
    Returns:
        True if valid, False otherwise
    """
    # Basic validation: 2 letters followed by 10 alphanumeric characters
    if not re.match(r'^[A-Z]{2}[A-Z0-9]{10}$', isin):
        return False
    
    # Check digit validation (Luhn algorithm)
    try:
        # Convert letters to numbers (A=10, B=11, ..., Z=35)
        digits = []
        for char in isin:
            if char.isalpha():
                digits.append(ord(char) - ord('A') + 10)
            else:
                digits.append(int(char))
        
        # Reverse the digits
        digits = digits[::-1]
        
        # Apply Luhn algorithm
        total = 0
        for i, digit in enumerate(digits):
            if i % 2 == 0:
                total += digit
            else:
                total += sum(int(d) for d in str(digit * 2))
        
        return total % 10 == 0
    except Exception:
        return False

def extract_financial_data(document_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract financial data from document data.
    
    Args:
        document_data: Document data containing text and tables
        
    Returns:
        Dictionary containing extracted financial data
    """
    logger.info("Extracting financial data from document")
    
    # Get full text and tables
    full_text = document_data.get("full_text", "")
    tables = document_data.get("tables", [])
    
    # Extract ISINs
    isins = extract_isins(full_text)
    
    # Extract securities
    securities = []
    for isin in isins:
        # Find context around ISIN
        isin_index = full_text.find(isin)
        if isin_index >= 0:
            # Get context (100 characters before and after)
            start = max(0, isin_index - 100)
            end = min(len(full_text), isin_index + 100)
            context = full_text[start:end]
            
            # Extract security data
            security = {
                "name": "",
                "identifier": isin,
                "quantity": None,
                "value": None
            }
            
            # Extract name
            name_patterns = [
                r'([^0-9\n]{3,50})\s+' + re.escape(isin),  # Name before ISIN
                re.escape(isin) + r'\s+([^0-9\n]{3,50})'   # Name after ISIN
            ]
            
            for pattern in name_patterns:
                match = re.search(pattern, context)
                if match:
                    security["name"] = match.group(1).strip()
                    break
            
            # Extract quantity and value
            number_pattern = r'[\d,\.\']+\s*(?:[A-Z]{3})?'
            numbers = re.findall(number_pattern, context)
            
            if len(numbers) >= 2:
                # Assume first number is quantity, last is value
                try:
                    security["quantity"] = clean_numeric(numbers[0])
                    security["value"] = clean_numeric(numbers[-1])
                except ValueError:
                    pass
            
            securities.append(security)
    
    # Extract total value
    total_value = 0.0
    total_patterns = [
        r'total\s+value\s*[:\-]?\s*([\d,\.\']+)',
        r'total\s*[:\-]?\s*([\d,\.\']+)',
        r'portfolio\s+value\s*[:\-]?\s*([\d,\.\']+)'
    ]
    
    for pattern in total_patterns:
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            try:
                total_value = float(clean_numeric(match.group(1)))
                break
            except ValueError:
                pass
    
    # Extract currency
    currency = "USD"  # Default
    currencies = ["USD", "EUR", "GBP", "CHF", "JPY", "CAD", "AUD"]
    
    for curr in currencies:
        if curr in full_text:
            currency = curr
            break
    
    # Extract asset allocation
    asset_allocation = {}
    asset_classes = [
        "Equities", "Bonds", "Cash", "Commodities", "Real Estate",
        "Alternatives", "Fixed Income", "Stocks", "Funds", "ETFs"
    ]
    
    for asset_class in asset_classes:
        pattern = r'{}[^%]*?(\d+\.?\d*)%'.format(asset_class)
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            try:
                percentage = float(match.group(1))
                asset_allocation[asset_class] = percentage
            except ValueError:
                pass
    
    # Compile financial data
    financial_data = {
        "securities": securities,
        "total_value": total_value,
        "currency": currency,
        "asset_allocation": asset_allocation,
        "isins": isins
    }
    
    return financial_data

def clean_numeric(value: Any) -> float:
    """
    Clean a numeric value.
    
    Args:
        value: Value to clean
        
    Returns:
        Cleaned numeric value
    """
    if value is None:
        return 0.0
    
    # Convert to string
    value_str = str(value)
    
    # Remove common formatting
    value_str = value_str.replace(",", "").replace("'", "").replace(" ", "")
    
    # Remove currency symbols
    currency_symbols = ["$", "€", "£", "¥", "Fr."]
    for symbol in currency_symbols:
        value_str = value_str.replace(symbol, "")
    
    # Remove percentage sign
    value_str = value_str.replace("%", "")
    
    # Convert to float
    return float(value_str)

# Define tools
pdf_extractor_tool = Tool(
    name="pdf_extractor",
    description="Extract text and tables from PDF documents",
    function=extract_pdf_content
)

isin_extractor_tool = Tool(
    name="isin_extractor",
    description="Extract ISINs from financial documents",
    function=extract_isins
)

financial_data_extractor_tool = Tool(
    name="financial_data_extractor",
    description="Extract financial data from document data",
    function=extract_financial_data
)

# Create the document processing agent
document_processor_agent = Agent(
    name="document_processor",
    model="gemini-2.0-pro-vision",
    instruction="""
    You are a financial document processing expert. Your job is to extract structured data from financial documents.
    
    For each document:
    1. Extract text and tables using the pdf_extractor tool
    2. Extract ISINs using the isin_extractor tool
    3. Extract financial data using the financial_data_extractor tool
    
    Be thorough and precise in your extraction. Pay special attention to:
    - Security identifiers (ISINs)
    - Security names, quantities, and values
    - Total portfolio value and currency
    - Asset allocation percentages
    
    Always validate the data you extract and ensure it is consistent.
    """,
    description="Processes financial documents to extract text, tables, and financial data.",
    tools=[pdf_extractor_tool, isin_extractor_tool, financial_data_extractor_tool]
)

if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python document_processor_agent.py <pdf_path>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    # Process the document
    document_data = extract_pdf_content(pdf_path)
    
    # Extract financial data
    financial_data = extract_financial_data(document_data)
    
    # Print results
    print("\n=== Document Processing Results ===")
    print(f"Document: {pdf_path}")
    print(f"Pages: {document_data['metadata']['page_count']}")
    print(f"ISINs found: {len(financial_data['isins'])}")
    print(f"Securities found: {len(financial_data['securities'])}")
    print(f"Total value: {financial_data['total_value']} {financial_data['currency']}")
    print(f"Asset allocation: {financial_data['asset_allocation']}")
