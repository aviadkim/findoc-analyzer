"""
Sequential Thinking Framework for financial document analysis.

This module provides a framework for analyzing financial documents in a
sequential, step-by-step manner to improve accuracy and understanding.
"""
import os
import logging
import json
from typing import Dict, List, Any, Optional
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SequentialThinkingFramework:
    """
    Framework for sequential thinking in financial document analysis.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the sequential thinking framework.
        
        Args:
            api_key: Gemini API key
        """
        self.api_key = api_key or os.environ.get('GEMINI_API_KEY')
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Initialized Gemini Pro model")
        else:
            logger.warning("No API key provided, Gemini Pro model not initialized")
            self.model = None
    
    def analyze_document_structure(self, text: str) -> Dict[str, Any]:
        """
        Analyze document structure using sequential thinking.
        
        Args:
            text: Document text
            
        Returns:
            Dictionary containing document structure analysis
        """
        if not self.model:
            logger.error("Gemini Pro model not initialized")
            return {"error": "Model not initialized"}
        
        prompt = """
        I'm going to analyze a financial document using sequential thinking.
        
        STEP 1: Identify the document type
        - Look for key indicators like "Portfolio Statement", "Account Statement", etc.
        - Determine the purpose of the document
        
        STEP 2: Identify the main sections
        - Look for headings, subheadings, and section breaks
        - Identify the summary section, holdings section, etc.
        
        STEP 3: Locate tables and understand their structure
        - Identify tables containing financial data
        - Determine the column headers and their meanings
        - Understand the row structure
        
        STEP 4: Identify key information
        - Find client information, dates, currency, etc.
        - Locate portfolio summary information (total value, performance, etc.)
        
        Here's the document:
        {text}
        
        Please provide a structured analysis of this document, including:
        1. Document type
        2. Main sections
        3. Table structures
        4. Key information
        
        Format the output as a JSON object.
        """
        
        try:
            response = self.model.generate_content(prompt.format(text=text[:10000]))  # Limit text length
            
            # Parse the response
            try:
                analysis = json.loads(response.text)
                return analysis
            except json.JSONDecodeError:
                # If not valid JSON, extract JSON-like content
                import re
                json_match = re.search(r'```json\n(.*?)\n```', response.text, re.DOTALL)
                if json_match:
                    try:
                        analysis = json.loads(json_match.group(1))
                        return analysis
                    except json.JSONDecodeError:
                        pass
                
                # Return text as fallback
                return {"analysis": response.text}
        
        except Exception as e:
            logger.error(f"Error analyzing document structure: {str(e)}")
            return {"error": str(e)}
    
    def understand_table_structure(self, table_text: str) -> Dict[str, Any]:
        """
        Understand table structure using sequential thinking.
        
        Args:
            table_text: Table text
            
        Returns:
            Dictionary containing table structure analysis
        """
        if not self.model:
            logger.error("Gemini Pro model not initialized")
            return {"error": "Model not initialized"}
        
        prompt = """
        I'm going to analyze a financial table using sequential thinking.
        
        STEP 1: Identify the table type
        - Determine if this is a securities table, summary table, etc.
        - Identify the purpose of the table
        
        STEP 2: Understand the column structure
        - Identify column headers
        - Map each column to a financial concept (ISIN, description, nominal, price, value, etc.)
        - Determine the data type of each column
        
        STEP 3: Understand the row structure
        - Determine what each row represents (a security, a summary, etc.)
        - Identify any grouping or categorization of rows
        
        STEP 4: Identify special formatting or notation
        - Look for footnotes, special symbols, or formatting
        - Understand how missing values are represented
        
        Here's the table:
        {table_text}
        
        Please provide a structured analysis of this table, including:
        1. Table type
        2. Column structure (with mappings to financial concepts)
        3. Row structure
        4. Special formatting or notation
        
        Format the output as a JSON object.
        """
        
        try:
            response = self.model.generate_content(prompt.format(table_text=table_text))
            
            # Parse the response
            try:
                analysis = json.loads(response.text)
                return analysis
            except json.JSONDecodeError:
                # If not valid JSON, extract JSON-like content
                import re
                json_match = re.search(r'```json\n(.*?)\n```', response.text, re.DOTALL)
                if json_match:
                    try:
                        analysis = json.loads(json_match.group(1))
                        return analysis
                    except json.JSONDecodeError:
                        pass
                
                # Return text as fallback
                return {"analysis": response.text}
        
        except Exception as e:
            logger.error(f"Error understanding table structure: {str(e)}")
            return {"error": str(e)}
    
    def extract_securities(self, table_text: str, table_structure: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract securities from a table using sequential thinking.
        
        Args:
            table_text: Table text
            table_structure: Table structure analysis
            
        Returns:
            List of extracted securities
        """
        if not self.model:
            logger.error("Gemini Pro model not initialized")
            return [{"error": "Model not initialized"}]
        
        prompt = """
        I'm going to extract securities from a financial table using sequential thinking.
        
        STEP 1: Understand the table structure
        {table_structure}
        
        STEP 2: Extract securities row by row
        - For each row, extract the security details
        - Map each value to the correct attribute based on column understanding
        - Handle any special formatting or notation
        
        STEP 3: Validate the extracted data
        - Check if values make sense (e.g., value should be approximately nominal * price / 100)
        - Verify that ISINs follow the correct format (2 letters followed by 9 alphanumeric characters and a check digit)
        - Ensure all required fields are present
        
        Here's the table:
        {table_text}
        
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
            response = self.model.generate_content(
                prompt.format(
                    table_text=table_text,
                    table_structure=json.dumps(table_structure, indent=2)
                )
            )
            
            # Parse the response
            try:
                securities = json.loads(response.text)
                return securities
            except json.JSONDecodeError:
                # If not valid JSON, extract JSON-like content
                import re
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
            logger.error(f"Error extracting securities: {str(e)}")
            return [{"error": str(e)}]
    
    def verify_extraction(self, securities: List[Dict[str, Any]], portfolio_summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify extracted securities for accuracy.
        
        Args:
            securities: List of extracted securities
            portfolio_summary: Portfolio summary information
            
        Returns:
            Verification results
        """
        if not self.model:
            logger.error("Gemini Pro model not initialized")
            return {"error": "Model not initialized"}
        
        prompt = """
        I'm going to verify the accuracy of extracted securities using sequential thinking.
        
        STEP 1: Check individual securities
        - Verify that each security has all required fields
        - Validate ISINs for correct format
        - Check if value calculations make sense (value ≈ nominal * price / 100)
        
        STEP 2: Check portfolio totals
        - Calculate the sum of security values
        - Compare with the portfolio total from the summary
        - Identify any discrepancies
        
        STEP 3: Identify and resolve issues
        - Flag securities with missing or invalid data
        - Suggest corrections for issues
        - Provide confidence scores for each security
        
        Here are the extracted securities:
        {securities}
        
        Here is the portfolio summary:
        {portfolio_summary}
        
        Please verify the accuracy of the extracted securities and provide:
        1. Verification results for each security
        2. Portfolio total verification
        3. Overall confidence score
        4. Suggestions for improvements
        
        Format the output as a JSON object.
        """
        
        try:
            response = self.model.generate_content(
                prompt.format(
                    securities=json.dumps(securities, indent=2),
                    portfolio_summary=json.dumps(portfolio_summary, indent=2)
                )
            )
            
            # Parse the response
            try:
                verification = json.loads(response.text)
                return verification
            except json.JSONDecodeError:
                # If not valid JSON, extract JSON-like content
                import re
                json_match = re.search(r'```json\n(.*?)\n```', response.text, re.DOTALL)
                if json_match:
                    try:
                        verification = json.loads(json_match.group(1))
                        return verification
                    except json.JSONDecodeError:
                        pass
                
                # Return text as fallback
                return {"verification": response.text}
        
        except Exception as e:
            logger.error(f"Error verifying extraction: {str(e)}")
            return {"error": str(e)}

# Example usage
if __name__ == "__main__":
    # Initialize framework
    framework = SequentialThinkingFramework()
    
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
    
    # Analyze document structure
    structure = framework.analyze_document_structure(document_text)
    print("Document Structure:")
    print(json.dumps(structure, indent=2))
    
    # Extract securities
    securities = framework.extract_securities(document_text, structure)
    print("\nExtracted Securities:")
    print(json.dumps(securities, indent=2))
