"""
Securities Extraction Agent for financial documents.

This module provides an agent for extracting securities information from financial documents.
"""

import os
import sys
import json
import logging
import re
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np
import fitz  # PyMuPDF
from agent_framework import Agent
from enhanced_table_extractor import EnhancedTableExtractor
from grid_analyzer import GridAnalyzer
from isin_validator import is_valid_isin

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SecuritiesExtractionAgent(Agent):
    """
    Agent for extracting securities information from financial documents.
    """

    def __init__(self, name: str = "Securities Extraction Agent", model: str = "gemini-1.5-pro", debug: bool = False):
        """
        Initialize the securities extraction agent.

        Args:
            name: Agent name
            model: Model to use
            debug: Whether to print debug information
        """
        super().__init__(name, model, debug)
        self.table_extractor = EnhancedTableExtractor(debug=debug)
        self.grid_analyzer = GridAnalyzer(debug=debug)

    def process(self, document_path: str) -> Dict[str, Any]:
        """
        Process a document to extract securities information.

        Args:
            document_path: Path to the document

        Returns:
            Dictionary containing extracted securities information
        """
        # Extract tables from document
        tables_result = self.table_extractor.extract_tables(document_path)
        
        # Extract securities using grid analyzer
        securities = self.grid_analyzer.extract_securities(document_path)
        
        # Enhance securities with LLM
        enhanced_securities = self._enhance_securities_with_llm(document_path, securities)
        
        # Combine results
        result = {
            "tables_count": len(tables_result["tables"]),
            "securities_count": len(enhanced_securities),
            "securities": enhanced_securities
        }
        
        return result

    def _enhance_securities_with_llm(self, document_path: str, securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Enhance securities information using LLM.

        Args:
            document_path: Path to the document
            securities: List of extracted securities

        Returns:
            Enhanced list of securities
        """
        # Extract text from document
        document_text = self._extract_text(document_path)
        
        # Create prompt for securities enhancement
        prompt = self._create_securities_enhancement_prompt(document_text, securities)
        
        # Generate response
        response = self.generate_response(prompt)
        
        # Parse response
        enhanced_securities = self._parse_securities_enhancement_response(response, securities)
        
        return enhanced_securities

    def _extract_text(self, document_path: str) -> str:
        """
        Extract text from a document.

        Args:
            document_path: Path to the document

        Returns:
            Extracted text
        """
        try:
            # Open the PDF
            doc = fitz.open(document_path)
            
            # Extract text from all pages
            text = ""
            for page_num in range(len(doc)):
                page = doc[page_num]
                text += f"\n--- Page {page_num + 1} ---\n"
                text += page.get_text()
            
            # Close the PDF
            doc.close()
            
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return ""

    def _create_securities_enhancement_prompt(self, document_text: str, securities: List[Dict[str, Any]]) -> str:
        """
        Create a prompt for securities enhancement.

        Args:
            document_text: Text extracted from the document
            securities: List of extracted securities

        Returns:
            Prompt for securities enhancement
        """
        # Truncate document text if too long
        max_text_length = 15000
        if len(document_text) > max_text_length:
            document_text = document_text[:max_text_length] + "..."

        # Format securities for prompt
        securities_json = json.dumps(securities[:10], indent=2)  # Limit to first 10 securities

        prompt = f"""
        You are a financial document analyzer specializing in securities extraction. I have extracted some securities information from a financial document, but some data might be missing or incomplete. Your task is to enhance this information using the document text.

        Document Text:
        {document_text}

        Extracted Securities (partial list):
        {securities_json}

        For each security, please try to fill in any missing information:
        1. If a security has an ISIN but missing description, find the description in the document
        2. If a security has missing nominal_value, price, or actual_value, find these values in the document
        3. If a security has missing currency, determine the currency from the document
        4. If a security has missing weight (percentage allocation), find this information
        5. If a security has missing acquisition_price, find this information

        Please respond with a JSON array of enhanced securities. Each security should have the following fields:
        - isin: ISIN code
        - description: Security description
        - nominal_value: Nominal value/quantity
        - price: Current price
        - acquisition_price: Acquisition/purchase price
        - actual_value: Current value/valuation
        - currency: Currency code
        - weight: Percentage weight in portfolio
        - is_valid_isin: Whether the ISIN is valid

        Only include securities that you can enhance with additional information. If you cannot enhance a security, exclude it from the response.

        JSON Response:
        """

        return prompt

    def _parse_securities_enhancement_response(self, response: str, original_securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Parse the securities enhancement response.

        Args:
            response: Response from the model
            original_securities: Original list of securities

        Returns:
            Enhanced list of securities
        """
        try:
            # Extract JSON from response
            json_start = response.find("[")
            json_end = response.rfind("]") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                enhanced_securities = json.loads(json_str)
                
                # Create a map of original securities by ISIN
                original_securities_map = {s["isin"]: s for s in original_securities}
                
                # Merge enhanced securities with original securities
                merged_securities = []
                for enhanced in enhanced_securities:
                    isin = enhanced.get("isin")
                    if isin and isin in original_securities_map:
                        # Start with original security
                        merged = original_securities_map[isin].copy()
                        
                        # Update with enhanced fields
                        for key, value in enhanced.items():
                            if value is not None and (key not in merged or merged[key] is None):
                                merged[key] = value
                        
                        merged_securities.append(merged)
                
                # Add any original securities that weren't enhanced
                enhanced_isins = {s.get("isin") for s in enhanced_securities}
                for original in original_securities:
                    if original.get("isin") not in enhanced_isins:
                        merged_securities.append(original)
                
                return merged_securities
            else:
                # If no JSON found, return original securities
                return original_securities
        except Exception as e:
            logger.error(f"Error parsing securities enhancement response: {str(e)}")
            return original_securities

class TableUnderstandingAgent(Agent):
    """
    Agent for understanding table structures in financial documents.
    """

    def __init__(self, name: str = "Table Understanding Agent", model: str = "gemini-1.5-pro", debug: bool = False):
        """
        Initialize the table understanding agent.

        Args:
            name: Agent name
            model: Model to use
            debug: Whether to print debug information
        """
        super().__init__(name, model, debug)
        self.table_extractor = EnhancedTableExtractor(debug=debug)

    def process(self, document_path: str) -> Dict[str, Any]:
        """
        Process a document to understand table structures.

        Args:
            document_path: Path to the document

        Returns:
            Dictionary containing table structure information
        """
        # Extract tables from document
        tables_result = self.table_extractor.extract_tables(document_path)
        
        # Analyze table structures
        table_structures = []
        for table in tables_result["tables"]:
            # Skip tables without data
            if not table.get("data"):
                continue
                
            # Analyze table structure
            structure = self._analyze_table_structure(table)
            table_structures.append(structure)
        
        # Combine results
        result = {
            "tables_count": len(tables_result["tables"]),
            "structures_count": len(table_structures),
            "table_structures": table_structures
        }
        
        return result

    def _analyze_table_structure(self, table: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze the structure of a table.

        Args:
            table: Table data

        Returns:
            Dictionary containing table structure information
        """
        # Create prompt for table structure analysis
        prompt = self._create_table_structure_prompt(table)
        
        # Generate response
        response = self.generate_response(prompt)
        
        # Parse response
        structure = self._parse_table_structure_response(response)
        
        # Add table metadata
        structure["table_id"] = table.get("id")
        structure["page"] = table.get("page")
        structure["method"] = table.get("method")
        
        return structure

    def _create_table_structure_prompt(self, table: Dict[str, Any]) -> str:
        """
        Create a prompt for table structure analysis.

        Args:
            table: Table data

        Returns:
            Prompt for table structure analysis
        """
        # Format table data for prompt
        table_data = table.get("data", [])
        table_rows = table.get("rows", [])
        
        if table_rows:
            table_text = "\n".join([" | ".join([str(cell) for cell in row]) for row in table_rows])
        else:
            table_text = json.dumps(table_data, indent=2)

        prompt = f"""
        You are a financial table structure analyzer. Your task is to analyze the structure of the following table from a financial document:

        Table ID: {table.get("id")}
        Page: {table.get("page")}
        Method: {table.get("method")}

        Table Data:
        {table_text}

        Please analyze the table structure and identify:
        1. The purpose of the table (e.g., portfolio holdings, asset allocation, transactions)
        2. Header rows (row indices that contain column headers)
        3. Footer rows (row indices that contain totals or summaries)
        4. Column types (e.g., ISIN, description, quantity, price, value, currency)
        5. Any special formatting or structure

        Please respond with a JSON object containing the following fields:
        - purpose: The purpose of the table
        - header_rows: Array of row indices that are headers
        - footer_rows: Array of row indices that are footers
        - column_types: Object mapping column indices or names to types
        - notes: Any additional notes about the table structure

        JSON Response:
        """

        return prompt

    def _parse_table_structure_response(self, response: str) -> Dict[str, Any]:
        """
        Parse the table structure response.

        Args:
            response: Response from the model

        Returns:
            Parsed table structure
        """
        try:
            # Extract JSON from response
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                structure = json.loads(json_str)
                return structure
            else:
                # If no JSON found, return empty structure
                return {
                    "purpose": "unknown",
                    "header_rows": [],
                    "footer_rows": [],
                    "column_types": {},
                    "notes": "Failed to parse response"
                }
        except Exception as e:
            logger.error(f"Error parsing table structure response: {str(e)}")
            return {
                "purpose": "unknown",
                "header_rows": [],
                "footer_rows": [],
                "column_types": {},
                "notes": f"Error: {str(e)}"
            }

def main():
    """
    Main function for testing the securities extraction agent.
    """
    import argparse

    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test the securities extraction agent.')
    parser.add_argument('document_path', help='Path to the document to process')
    parser.add_argument('--output', help='Path to save the output JSON file')
    parser.add_argument('--debug', action='store_true', help='Print debug information')

    args = parser.parse_args()

    # Create agent
    agent = SecuritiesExtractionAgent(debug=args.debug)

    # Process document
    result = agent.process(args.document_path)

    # Save or print result
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        logger.info(f"Result saved to {args.output}")
    else:
        print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
