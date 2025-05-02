"""
Securities Extraction Agent using Google's Agent Development Kit (ADK).

This agent is responsible for extracting securities information from financial documents.
"""
import os
import logging
import json
from typing import Dict, List, Any, Optional

from google.adk.agents import Agent
from google.adk.tools import Tool

# Import the enhanced securities extractor
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'extractors'))
from enhanced_securities_extractor import SecurityExtractor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define tool functions
def extract_securities_from_pdf(pdf_path: str) -> Dict[str, Any]:
    """
    Extract securities information from a PDF document.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Dictionary containing extracted securities information
    """
    logger.info(f"Extracting securities from PDF: {pdf_path}")
    
    try:
        # Create a security extractor
        extractor = SecurityExtractor(debug=True)
        
        # Extract securities
        result = extractor.extract_from_pdf(pdf_path)
        
        return result
    except Exception as e:
        logger.error(f"Error extracting securities: {str(e)}")
        return {
            "error": str(e),
            "document_type": "unknown",
            "securities": []
        }

def extract_isins_from_text(text: str) -> List[str]:
    """
    Extract ISIN numbers from text.
    
    Args:
        text: Text to extract ISINs from
        
    Returns:
        List of extracted ISINs
    """
    logger.info("Extracting ISINs from text")
    
    try:
        # ISIN pattern: 2 letters followed by 9 alphanumeric characters and a check digit
        import re
        isin_pattern = r'[A-Z]{2}[A-Z0-9]{9}[0-9]'
        
        # Find all ISINs
        isins = re.findall(isin_pattern, text)
        
        # Remove duplicates while preserving order
        unique_isins = []
        for isin in isins:
            if isin not in unique_isins:
                unique_isins.append(isin)
        
        return unique_isins
    except Exception as e:
        logger.error(f"Error extracting ISINs: {str(e)}")
        return []

def validate_securities(securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Validate and enhance securities information.
    
    Args:
        securities: List of securities to validate
        
    Returns:
        Validated and enhanced securities
    """
    logger.info(f"Validating {len(securities)} securities")
    
    try:
        validated_securities = []
        
        for security in securities:
            # Ensure required fields
            if 'isin' not in security:
                logger.warning(f"Security missing ISIN: {security}")
                continue
            
            # Validate ISIN
            isin = security['isin']
            if not is_valid_isin(isin):
                logger.warning(f"Invalid ISIN: {isin}")
                continue
            
            # Add to validated securities
            validated_securities.append(security)
        
        return validated_securities
    except Exception as e:
        logger.error(f"Error validating securities: {str(e)}")
        return securities

def is_valid_isin(isin: str) -> bool:
    """
    Validate an ISIN number.
    
    Args:
        isin: ISIN to validate
        
    Returns:
        True if valid, False otherwise
    """
    # Check length
    if len(isin) != 12:
        return False
    
    # Check format: 2 letters followed by 9 alphanumeric characters and a check digit
    import re
    if not re.match(r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$', isin):
        return False
    
    # Check digit validation
    try:
        # Convert letters to numbers (A=10, B=11, ..., Z=35)
        values = []
        for char in isin[:-1]:  # Exclude check digit
            if char.isdigit():
                values.append(int(char))
            else:
                values.append(ord(char) - ord('A') + 10)
        
        # Double every second digit from right to left
        for i in range(len(values)-1, -1, -2):
            values[i] *= 2
            if values[i] > 9:
                values[i] = values[i] % 10 + values[i] // 10
        
        # Sum all digits
        total = sum(values)
        
        # Check digit is the amount needed to reach the next multiple of 10
        check_digit = (10 - (total % 10)) % 10
        
        return check_digit == int(isin[-1])
    except Exception:
        return False

# Create the securities extraction agent
securities_extraction_agent = Agent(
    name="securities_extractor",
    model="gemini-2.0-pro",
    instruction="""
    You are a financial securities extraction expert. Your job is to extract structured data about securities from financial documents.
    
    For each document:
    1. Extract securities information using the extract_securities_from_pdf tool
    2. Extract ISINs using the extract_isins_from_text tool
    3. Validate securities using the validate_securities tool
    
    Be thorough and precise in your extraction. Pay special attention to:
    - Security identifiers (ISINs)
    - Security names, quantities, and values
    - Maturity dates and coupon rates
    - Security types (bonds, equities, etc.)
    
    Always provide accurate information based on the document content.
    """,
    description="Extracts securities information from financial documents.",
    tools=[
        Tool(
            name="extract_securities_from_pdf",
            description="Extract securities information from a PDF document",
            function=extract_securities_from_pdf
        ),
        Tool(
            name="extract_isins_from_text",
            description="Extract ISIN numbers from text",
            function=extract_isins_from_text
        ),
        Tool(
            name="validate_securities",
            description="Validate and enhance securities information",
            function=validate_securities
        )
    ]
)

def extract_securities(document_path: str) -> Dict[str, Any]:
    """
    Extract securities from a document.
    
    Args:
        document_path: Path to the document
        
    Returns:
        Dictionary containing extracted securities information
    """
    logger.info(f"Extracting securities from document: {document_path}")
    
    # Use the securities extraction agent to extract securities
    result = securities_extraction_agent.tools[0].function(document_path)
    
    # Validate securities
    if "securities" in result:
        result["securities"] = securities_extraction_agent.tools[2].function(result["securities"])
    
    return result

if __name__ == "__main__":
    # Test the agent
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python securities_extraction_agent.py <pdf_path>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    # Extract securities
    result = extract_securities(pdf_path)
    
    # Print results
    print(json.dumps(result, indent=2))
