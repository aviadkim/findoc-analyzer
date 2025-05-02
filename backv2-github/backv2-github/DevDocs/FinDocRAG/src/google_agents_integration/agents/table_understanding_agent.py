"""
Table Understanding Agent using Google's Agent Development Kit (ADK).

This agent is responsible for understanding table structures in financial documents
and extracting meaningful information from them.
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TableUnderstandingAgent:
    """
    Agent for understanding table structures in financial documents.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the table understanding agent.
        
        Args:
            api_key: Gemini API key
        """
        self.api_key = api_key or os.environ.get('GEMINI_API_KEY')
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Initialized Gemini Pro model for table understanding")
        else:
            logger.warning("No API key provided, Gemini Pro model not initialized")
            self.model = None
        
        # Initialize the sequential thinking framework
        self.framework = SequentialThinkingFramework(api_key=self.api_key)
        
        # Initialize the financial knowledge base
        self.knowledge = FinancialDocumentKnowledge()
    
    def identify_tables(self, text: str) -> List[Dict[str, Any]]:
        """
        Identify tables in a document.
        
        Args:
            text: Document text
            
        Returns:
            List of identified tables with their positions and types
        """
        if not self.model:
            logger.error("Gemini Pro model not initialized")
            return [{"error": "Model not initialized"}]
        
        prompt = """
        I'm going to identify tables in a financial document.
        
        STEP 1: Scan the document for table-like structures
        - Look for content organized in columns and rows
        - Identify column headers and row delimiters
        
        STEP 2: Determine the type of each table
        - Identify if it's a securities table, summary table, asset allocation table, etc.
        - Determine the purpose of each table
        
        STEP 3: Extract the position of each table
        - Identify the start and end of each table
        - Note any section headings that precede the table
        
        Here's the document:
        {text}
        
        Please identify all tables in this document and provide:
        1. Table type (securities, summary, asset allocation, etc.)
        2. Table position (start and end markers)
        3. Table purpose
        
        Format the output as a JSON array of table objects.
        """
        
        try:
            response = self.model.generate_content(prompt.format(text=text[:10000]))  # Limit text length
            
            # Parse the response
            try:
                tables = json.loads(response.text)
                return tables
            except json.JSONDecodeError:
                # If not valid JSON, extract JSON-like content
                json_match = re.search(r'```json\n(.*?)\n```', response.text, re.DOTALL)
                if json_match:
                    try:
                        tables = json.loads(json_match.group(1))
                        return tables
                    except json.JSONDecodeError:
                        pass
                
                # Return text as fallback
                return [{"error": "Failed to parse JSON", "response": response.text}]
        
        except Exception as e:
            logger.error(f"Error identifying tables: {str(e)}")
            return [{"error": str(e)}]
    
    def extract_table_text(self, text: str, table_position: Dict[str, Any]) -> str:
        """
        Extract table text based on position information.
        
        Args:
            text: Document text
            table_position: Table position information
            
        Returns:
            Extracted table text
        """
        # Extract table based on start and end markers
        start_marker = table_position.get('start_marker')
        end_marker = table_position.get('end_marker')
        
        if start_marker and end_marker:
            start_idx = text.find(start_marker)
            end_idx = text.find(end_marker, start_idx) + len(end_marker)
            
            if start_idx >= 0 and end_idx > start_idx:
                return text[start_idx:end_idx]
        
        # If markers not found or invalid, try to extract based on line numbers
        start_line = table_position.get('start_line')
        end_line = table_position.get('end_line')
        
        if start_line is not None and end_line is not None:
            lines = text.split('\n')
            if 0 <= start_line < len(lines) and 0 <= end_line < len(lines) and start_line <= end_line:
                return '\n'.join(lines[start_line:end_line+1])
        
        # If all else fails, return a portion of text around a keyword
        keyword = table_position.get('keyword')
        if keyword:
            keyword_idx = text.find(keyword)
            if keyword_idx >= 0:
                # Extract 20 lines before and after the keyword
                lines = text.split('\n')
                line_idx = text[:keyword_idx].count('\n')
                start_line = max(0, line_idx - 20)
                end_line = min(len(lines), line_idx + 20)
                return '\n'.join(lines[start_line:end_line])
        
        # If nothing works, return empty string
        return ""
    
    def understand_table(self, table_text: str, table_type: str) -> Dict[str, Any]:
        """
        Understand the structure of a table.
        
        Args:
            table_text: Table text
            table_type: Type of table
            
        Returns:
            Table structure analysis
        """
        # Use the sequential thinking framework to understand the table
        return self.framework.understand_table_structure(table_text)
    
    def extract_column_mappings(self, table_structure: Dict[str, Any]) -> Dict[str, int]:
        """
        Extract column mappings from table structure.
        
        Args:
            table_structure: Table structure analysis
            
        Returns:
            Dictionary mapping column concepts to column indices
        """
        column_mappings = {}
        
        # Extract column structure from table analysis
        columns = table_structure.get('column_structure', [])
        
        # Map columns to financial concepts
        for i, column in enumerate(columns):
            column_name = column.get('name', '').lower()
            column_concept = column.get('concept', '').lower()
            
            # Check against known column patterns
            for concept, patterns in self.knowledge.COLUMN_PATTERNS.items():
                if any(pattern in column_name for pattern in patterns) or concept == column_concept:
                    column_mappings[concept] = i
                    break
        
        return column_mappings
    
    def process_table(self, text: str, table_type: str = None) -> Dict[str, Any]:
        """
        Process a table to extract its structure and content.
        
        Args:
            text: Document text
            table_type: Optional table type
            
        Returns:
            Dictionary containing table analysis and extracted data
        """
        # Identify tables if table_type not provided
        if not table_type:
            tables = self.identify_tables(text)
            if not tables or 'error' in tables[0]:
                return {"error": "Failed to identify tables"}
            
            # Use the first table
            table_info = tables[0]
            table_type = table_info.get('type', 'unknown')
            table_text = self.extract_table_text(text, table_info)
        else:
            table_text = text
        
        # Understand table structure
        table_structure = self.understand_table(table_text, table_type)
        if 'error' in table_structure:
            return {"error": "Failed to understand table structure"}
        
        # Extract column mappings
        column_mappings = self.extract_column_mappings(table_structure)
        
        return {
            "table_type": table_type,
            "table_structure": table_structure,
            "column_mappings": column_mappings,
            "table_text": table_text
        }

# Example usage
if __name__ == "__main__":
    # Initialize agent
    agent = TableUnderstandingAgent()
    
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
    
    # Process table
    result = agent.process_table(document_text)
    print("Table Analysis:")
    print(json.dumps(result, indent=2))
