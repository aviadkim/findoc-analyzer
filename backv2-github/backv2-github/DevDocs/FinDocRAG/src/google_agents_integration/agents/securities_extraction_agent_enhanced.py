"""
Enhanced Securities Extraction Agent using Google's Agent Development Kit (ADK) and Gemini Pro.

This agent is responsible for extracting securities information from financial documents
with high accuracy using sequential thinking and advanced AI capabilities.
"""
import os
import logging
import json
import re
from typing import Dict, List, Any, Optional
import google.generativeai as genai

# Import the sequential thinking framework
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'framework'))
from sequential_thinking import SequentialThinkingFramework

# Import the financial knowledge base
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'knowledge'))
from financial_knowledge import FinancialDocumentKnowledge

# Import the table understanding agent
from table_understanding_agent import TableUnderstandingAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedSecuritiesExtractionAgent:
    """
    Enhanced agent for extracting securities information from financial documents.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the enhanced securities extraction agent.
        
        Args:
            api_key: Gemini API key
        """
        self.api_key = api_key or os.environ.get('GEMINI_API_KEY')
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Initialized Gemini Pro model for securities extraction")
        else:
            logger.warning("No API key provided, Gemini Pro model not initialized")
            self.model = None
        
        # Initialize the sequential thinking framework
        self.framework = SequentialThinkingFramework(api_key=self.api_key)
        
        # Initialize the financial knowledge base
        self.knowledge = FinancialDocumentKnowledge()
        
        # Initialize the table understanding agent
        self.table_agent = TableUnderstandingAgent(api_key=self.api_key)
    
    def extract_securities_from_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract securities from document text.
        
        Args:
            text: Document text
            
        Returns:
            List of extracted securities
        """
        if not self.model:
            logger.error("Gemini Pro model not initialized")
            return [{"error": "Model not initialized"}]
        
        # Analyze document structure
        document_analysis = self.framework.analyze_document_structure(text)
        if 'error' in document_analysis:
            logger.error(f"Error analyzing document structure: {document_analysis['error']}")
            return [{"error": "Failed to analyze document structure"}]
        
        # Identify tables
        tables = self.table_agent.identify_tables(text)
        if not tables or 'error' in tables[0]:
            logger.error("Failed to identify tables")
            return [{"error": "Failed to identify tables"}]
        
        # Process each table that might contain securities
        securities = []
        for table_info in tables:
            table_type = table_info.get('type', '').lower()
            
            # Skip tables that don't contain securities
            if not any(keyword in table_type for keyword in ['securities', 'holdings', 'positions']):
                continue
            
            # Extract table text
            table_text = self.table_agent.extract_table_text(text, table_info)
            if not table_text:
                continue
            
            # Understand table structure
            table_structure = self.table_agent.understand_table(table_text, table_type)
            if 'error' in table_structure:
                continue
            
            # Extract securities from the table
            table_securities = self.extract_securities_from_table(table_text, table_structure)
            securities.extend(table_securities)
        
        # If no securities found through table processing, try direct extraction
        if not securities:
            securities = self.extract_securities_direct(text)
        
        # Validate and enhance securities
        securities = self.validate_and_enhance_securities(securities)
        
        return securities
    
    def extract_securities_from_table(self, table_text: str, table_structure: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract securities from a table.
        
        Args:
            table_text: Table text
            table_structure: Table structure analysis
            
        Returns:
            List of extracted securities
        """
        # Use the sequential thinking framework to extract securities
        return self.framework.extract_securities(table_text, table_structure)
    
    def extract_securities_direct(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract securities directly from text without table structure.
        
        Args:
            text: Document text
            
        Returns:
            List of extracted securities
        """
        if not self.model:
            logger.error("Gemini Pro model not initialized")
            return [{"error": "Model not initialized"}]
        
        prompt = """
        I'm going to extract securities from a financial document using sequential thinking.
        
        STEP 1: Identify securities in the document
        - Look for ISINs (2 letters followed by 9 alphanumeric characters and a check digit)
        - Identify security descriptions, amounts, prices, and values
        
        STEP 2: Extract security details
        - For each security, extract all available information
        - Map each piece of information to the appropriate attribute
        
        STEP 3: Validate the extracted data
        - Check if values make sense
        - Verify that ISINs follow the correct format
        - Ensure all required fields are present
        
        Here's the document:
        {text}
        
        Please extract all securities with their ISIN, description, nominal amount, price, value, currency, maturity date, and coupon rate.
        Format the output as a JSON array of objects, with each object representing a security.
        
        For each security, include the following fields if available:
        - isin: The ISIN of the security
        - description: The description or name of the security
        - nominal_value: The nominal amount or quantity
        - price: The price or rate
        - actual_value: The market value or valuation
        - currency: The currency
        - maturity: The maturity date
        - coupon: The coupon rate or interest rate
        - type: The type of security (bond, equity, fund, etc.)
        
        Be precise and accurate in your extraction.
        """
        
        try:
            response = self.model.generate_content(prompt.format(text=text[:10000]))  # Limit text length
            
            # Parse the response
            try:
                securities = json.loads(response.text)
                return securities
            except json.JSONDecodeError:
                # If not valid JSON, extract JSON-like content
                json_match = re.search(r'```json\n(.*?)\n```', response.text, re.DOTALL)
                if json_match:
                    try:
                        securities = json.loads(json_match.group(1))
                        return securities
                    except json.JSONDecodeError:
                        pass
                
                # Return text as fallback
                return [{"error": "Failed to parse JSON", "response": response.text}]
        
        except Exception as e:
            logger.error(f"Error extracting securities directly: {str(e)}")
            return [{"error": str(e)}]
    
    def validate_and_enhance_securities(self, securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Validate and enhance extracted securities.
        
        Args:
            securities: List of extracted securities
            
        Returns:
            List of validated and enhanced securities
        """
        validated_securities = []
        
        for security in securities:
            # Skip securities with errors
            if 'error' in security:
                continue
            
            # Validate ISIN
            if 'isin' in security:
                isin = security['isin']
                if not self.knowledge.is_valid_isin(isin):
                    logger.warning(f"Invalid ISIN: {isin}")
                    security['validation'] = {"isin_valid": False}
                else:
                    security['validation'] = {"isin_valid": True}
            
            # Clean up values
            for field in ['nominal_value', 'price', 'actual_value']:
                if field in security and security[field]:
                    value = str(security[field])
                    # Remove thousands separators and other non-numeric characters
                    value = value.replace("'", "").replace(",", "").replace(" ", "")
                    try:
                        security[field] = float(value)
                    except ValueError:
                        # Keep original value if conversion fails
                        pass
            
            # Detect security type if not present
            if 'type' not in security and 'description' in security:
                security['type'] = self.knowledge.detect_security_type(security['description'])
            
            # Detect currency if not present
            if 'currency' not in security and 'description' in security:
                security['currency'] = self.knowledge.detect_currency(security['description'])
            
            # Validate value calculation
            if all(field in security for field in ['nominal_value', 'price', 'actual_value']):
                try:
                    nominal = float(security['nominal_value'])
                    price = float(security['price'])
                    value = float(security['actual_value'])
                    
                    calculated_value = nominal * price / 100
                    # Allow for 5% deviation
                    value_calculation_valid = abs(calculated_value - value) / value < 0.05
                    
                    security['validation']['value_calculation_valid'] = value_calculation_valid
                    
                    if not value_calculation_valid:
                        logger.warning(f"Value calculation invalid for security {security.get('isin', 'unknown')}")
                except (ValueError, ZeroDivisionError):
                    security['validation']['value_calculation_valid'] = False
            
            validated_securities.append(security)
        
        return validated_securities
    
    def extract_securities_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract securities from a PDF file.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary containing extracted securities and metadata
        """
        # Extract text from PDF
        try:
            import fitz  # PyMuPDF
            
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            
            # Extract document type
            doc_type = self.knowledge.detect_document_type(text)
            
            # Extract securities
            securities = self.extract_securities_from_text(text)
            
            # Extract portfolio summary
            portfolio_summary = self.extract_portfolio_summary(text)
            
            # Verify extraction
            verification = self.framework.verify_extraction(securities, portfolio_summary)
            
            return {
                "document_type": doc_type,
                "securities": securities,
                "portfolio_summary": portfolio_summary,
                "verification": verification
            }
        
        except Exception as e:
            logger.error(f"Error extracting securities from PDF: {str(e)}")
            return {"error": str(e)}
    
    def extract_portfolio_summary(self, text: str) -> Dict[str, Any]:
        """
        Extract portfolio summary from document text.
        
        Args:
            text: Document text
            
        Returns:
            Dictionary containing portfolio summary
        """
        if not self.model:
            logger.error("Gemini Pro model not initialized")
            return {"error": "Model not initialized"}
        
        prompt = """
        I'm going to extract the portfolio summary from a financial document using sequential thinking.
        
        STEP 1: Locate the summary section
        - Look for headings like "Summary", "Portfolio Summary", etc.
        - Identify the section containing summary information
        
        STEP 2: Extract key information
        - Extract total portfolio value
        - Extract currency
        - Extract performance information
        - Extract valuation date
        - Extract client information
        
        STEP 3: Validate the extracted data
        - Check if values make sense
        - Ensure all required fields are present
        
        Here's the document:
        {text}
        
        Please extract the portfolio summary with the following fields if available:
        - total_value: The total portfolio value
        - currency: The portfolio currency
        - performance: The portfolio performance
        - valuation_date: The valuation date
        - client_number: The client number or ID
        
        Format the output as a JSON object.
        """
        
        try:
            response = self.model.generate_content(prompt.format(text=text[:10000]))  # Limit text length
            
            # Parse the response
            try:
                summary = json.loads(response.text)
                return summary
            except json.JSONDecodeError:
                # If not valid JSON, extract JSON-like content
                json_match = re.search(r'```json\n(.*?)\n```', response.text, re.DOTALL)
                if json_match:
                    try:
                        summary = json.loads(json_match.group(1))
                        return summary
                    except json.JSONDecodeError:
                        pass
                
                # Return text as fallback
                return {"error": "Failed to parse JSON", "response": response.text}
        
        except Exception as e:
            logger.error(f"Error extracting portfolio summary: {str(e)}")
            return {"error": str(e)}

# Example usage
if __name__ == "__main__":
    # Initialize agent
    agent = EnhancedSecuritiesExtractionAgent()
    
    # Example document text
    document_text = """
    Portfolio Statement
    Client: John Doe
    Account: 123456
    Date: 31.12.2023
    
    Summary:
    Total Value: 1,000,000 USD
    Performance: +5.2%
    
    Holdings:
    ISIN        Description                 Nominal     Price     Value      Currency
    US0378331005 Apple Inc.                 100         190.50    19,050     USD
    US5949181045 Microsoft Corp.            50          380.20    19,010     USD
    """
    
    # Extract securities
    result = agent.extract_securities_from_text(document_text)
    print("Extracted Securities:")
    print(json.dumps(result, indent=2))
