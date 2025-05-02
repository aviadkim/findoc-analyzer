"""
Table Understanding Agent for Financial Document Processing.

This module provides the table understanding agent that analyzes complex table structures.
"""

import os
import logging
import json
import re
from typing import Dict, Any, List, Optional, Union

import pandas as pd
import numpy as np

from ..llm_agent import LlmAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TableUnderstandingAgent(LlmAgent):
    """
    Table understanding agent for financial document processing.
    """
    
    def __init__(
        self,
        name: str = "table_understanding",
        description: str = "I analyze complex table structures.",
        model: str = "gemini-2.0-pro",
        debug: bool = False,
        output_dir: Optional[str] = None
    ):
        """
        Initialize the table understanding agent.
        
        Args:
            name: Agent name
            description: Agent description
            model: LLM model to use
            debug: Whether to enable debug mode
            output_dir: Directory to save output and debug information
        """
        super().__init__(
            name=name,
            description=description,
            model=model,
            debug=debug,
            output_dir=output_dir,
            system_instruction="""
            You are the Table Understanding Agent for financial document processing.
            Your role is to analyze complex table structures in financial documents.
            
            You will receive tables extracted from documents and perform the following analyses:
            1. Identify table type (portfolio holdings, price list, transaction list, etc.)
            2. Identify header and footer rows
            3. Identify column types (ISIN, security name, quantity, price, etc.)
            4. Identify security rows
            5. Analyze table structure and relationships between columns
            
            Provide a detailed analysis of each table to help other agents extract
            accurate information from them.
            """
        )
        
        # Initialize column patterns
        self.column_patterns = {
            "isin": [
                r"^isin$", 
                r"^isin\s*code$", 
                r"^security\s*id$", 
                r"^identifier$"
            ],
            "security_name": [
                r"^name$", 
                r"^security\s*name$", 
                r"^description$", 
                r"^instrument$"
            ],
            "quantity": [
                r"^quantity$", 
                r"^qty$", 
                r"^nominal$", 
                r"^nominal\s*value$", 
                r"^amount$", 
                r"^units$"
            ],
            "price": [
                r"^price$", 
                r"^current\s*price$", 
                r"^market\s*price$", 
                r"^unit\s*price$", 
                r"^price\s*per\s*unit$"
            ],
            "acquisition_price": [
                r"^acquisition\s*price$", 
                r"^purchase\s*price$", 
                r"^cost\s*price$", 
                r"^avg\s*price$", 
                r"^average\s*price$"
            ],
            "value": [
                r"^value$", 
                r"^market\s*value$", 
                r"^valuation$", 
                r"^current\s*value$", 
                r"^total\s*value$"
            ],
            "currency": [
                r"^currency$", 
                r"^ccy$", 
                r"^curr$"
            ],
            "weight": [
                r"^weight$", 
                r"^weighting$", 
                r"^allocation$", 
                r"^%\s*of\s*assets$", 
                r"^%\s*of\s*portfolio$", 
                r"^percentage$"
            ],
            "performance": [
                r"^performance$", 
                r"^perf$", 
                r"^return$", 
                r"^ytd$", 
                r"^ytd\s*return$", 
                r"^year\s*to\s*date$"
            ],
            "date": [
                r"^date$", 
                r"^as\s*of\s*date$", 
                r"^valuation\s*date$", 
                r"^price\s*date$"
            ]
        }
        
        # Initialize ISIN pattern
        self.isin_pattern = r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$'
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data by analyzing table structures.
        
        Args:
            input_data: Input data to process
            
        Returns:
            Processing results
        """
        # Update state
        self.set_state({
            "processing": True,
            "completed": False,
            "error": None
        })
        
        try:
            # Extract tables from input data
            tables = self._extract_tables(input_data)
            
            if not tables:
                logger.warning("No tables found in input data")
                return {
                    "warning": "No tables found in input data",
                    "input_data": input_data
                }
            
            # Analyze each table
            analyzed_tables = []
            for table in tables:
                analyzed_table = self._analyze_table(table)
                analyzed_tables.append(analyzed_table)
            
            # Create result
            result = {
                "tables": analyzed_tables,
                "table_count": len(analyzed_tables)
            }
            
            # Update state
            self.set_state({
                "processing": False,
                "completed": True
            })
            
            # Save results if in debug mode
            if self.debug:
                self.save_results(result)
            
            return result
        except Exception as e:
            # Update state
            self.set_state({
                "processing": False,
                "completed": False,
                "error": str(e)
            })
            
            logger.error(f"Error analyzing tables: {str(e)}")
            
            return {
                "error": str(e),
                "input_data": input_data
            }
    
    def _extract_tables(self, input_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract tables from input data.
        
        Args:
            input_data: Input data
            
        Returns:
            List of tables
        """
        # Check if tables are directly in input data
        if "tables" in input_data:
            return input_data["tables"]
        
        # Check if tables are in input_data
        if "input_data" in input_data and "tables" in input_data["input_data"]:
            return input_data["input_data"]["tables"]
        
        # Check if tables are in previous results
        if "previous_results" in input_data:
            # Check if document analyzer result exists
            if "document_analyzer" in input_data["previous_results"]:
                analyzer_result = input_data["previous_results"]["document_analyzer"]
                if "tables" in analyzer_result:
                    return analyzer_result["tables"]
        
        # No tables found
        return []
    
    def _analyze_table(self, table: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a table structure.
        
        Args:
            table: Table to analyze
            
        Returns:
            Analyzed table
        """
        # Create a copy of the table
        analyzed_table = table.copy()
        
        # Extract table data
        headers = table.get("headers", [])
        data = table.get("data", [])
        rows = table.get("rows", [])
        
        # Create DataFrame if possible
        df = None
        if headers and rows:
            try:
                df = pd.DataFrame(rows, columns=headers)
            except:
                logger.warning(f"Failed to create DataFrame for table {table.get('id')}")
        
        # Analyze column types
        column_types = self._analyze_column_types(headers, rows)
        analyzed_table["column_types"] = column_types
        
        # Identify header rows
        header_rows = self._identify_header_rows(rows)
        analyzed_table["header_rows"] = header_rows
        
        # Identify footer rows
        footer_rows = self._identify_footer_rows(rows)
        analyzed_table["footer_rows"] = footer_rows
        
        # Identify security rows
        security_rows = self._identify_security_rows(rows, column_types)
        analyzed_table["security_rows"] = security_rows
        
        # Determine table type
        table_type = self._determine_table_type(column_types, security_rows)
        analyzed_table["table_type"] = table_type
        
        return analyzed_table
    
    def _analyze_column_types(self, headers: List[str], rows: List[List[Any]]) -> Dict[int, str]:
        """
        Analyze column types.
        
        Args:
            headers: List of headers
            rows: List of rows
            
        Returns:
            Mapping from column indices to column types
        """
        column_types = {}
        
        # Check if headers exist
        if not headers:
            return column_types
        
        # Analyze each column
        for i, header in enumerate(headers):
            # Convert header to string and lowercase
            header_str = str(header).lower()
            
            # Try to match header against patterns
            col_type = None
            for type_name, patterns in self.column_patterns.items():
                if any(re.search(pattern, header_str) for pattern in patterns):
                    col_type = type_name
                    break
            
            # If no match by header, analyze content
            if not col_type and rows:
                col_type = self._detect_column_type_by_content([row[i] for row in rows if i < len(row)])
            
            # Add column type
            if col_type:
                column_types[i] = col_type
        
        return column_types
    
    def _detect_column_type_by_content(self, values: List[Any]) -> Optional[str]:
        """
        Detect column type by analyzing its content.
        
        Args:
            values: Column values
            
        Returns:
            Column type or None if detection fails
        """
        # Filter out None and empty values
        filtered_values = [val for val in values if val is not None and str(val).strip()]
        
        if not filtered_values:
            return None
        
        # Convert values to strings for pattern matching
        str_values = [str(val) for val in filtered_values]
        
        # Check for ISIN pattern
        isin_matches = sum(1 for val in str_values if re.match(self.isin_pattern, val))
        if isin_matches / len(str_values) > 0.5:
            return "isin"
        
        # Check for currency symbols
        currency_pattern = r'^[$€£¥]'
        currency_matches = sum(1 for val in str_values if re.search(currency_pattern, val))
        if currency_matches / len(str_values) > 0.5:
            return "value"
        
        # Check for percentage symbols
        percentage_pattern = r'%$'
        percentage_matches = sum(1 for val in str_values if re.search(percentage_pattern, val))
        if percentage_matches / len(str_values) > 0.5:
            return "weight"
        
        # Try to convert to numeric
        try:
            numeric_values = [float(re.sub(r'[^\d.-]', '', val)) for val in str_values]
            
            # Check value ranges for different types
            if all(0 <= val <= 100 for val in numeric_values):
                return "weight"
            elif all(val > 1000 for val in numeric_values):
                return "value"
            elif all(0 < val < 1000 for val in numeric_values):
                return "price"
            else:
                return "numeric"
        except:
            pass
        
        # Check for date patterns
        date_pattern = r'\d{1,2}[./-]\d{1,2}[./-]\d{2,4}'
        date_matches = sum(1 for val in str_values if re.search(date_pattern, val))
        if date_matches / len(str_values) > 0.5:
            return "date"
        
        # Default to text if no other type matches
        return "text"
    
    def _identify_header_rows(self, rows: List[List[Any]]) -> List[int]:
        """
        Identify header rows.
        
        Args:
            rows: List of rows
            
        Returns:
            List of header row indices
        """
        header_rows = []
        
        # Check first few rows
        for i in range(min(3, len(rows))):
            row = rows[i]
            
            # Header rows typically have shorter text
            avg_len = sum(len(str(val)) for val in row if val) / max(1, sum(1 for val in row if val))
            
            # Header rows typically have more text cells than numeric
            text_ratio = sum(1 for val in row if val and not self._is_numeric(val)) / max(1, len(row))
            
            # Header rows typically have different formatting than data rows
            if avg_len < 15 and text_ratio > 0.5:
                header_rows.append(i)
        
        return header_rows
    
    def _identify_footer_rows(self, rows: List[List[Any]]) -> List[int]:
        """
        Identify footer rows.
        
        Args:
            rows: List of rows
            
        Returns:
            List of footer row indices
        """
        footer_rows = []
        
        # Check last few rows
        for i in range(max(0, len(rows) - 3), len(rows)):
            row = rows[i]
            
            # Footer rows often contain summary information
            if any(str(val).lower().startswith(('total', 'sum', 'average')) for val in row if val):
                footer_rows.append(i)
                continue
            
            # Footer rows often have fewer filled cells
            filled_ratio = sum(1 for val in row if val) / len(row)
            if filled_ratio < 0.5:
                footer_rows.append(i)
        
        return footer_rows
    
    def _identify_security_rows(self, rows: List[List[Any]], column_types: Dict[int, str]) -> List[int]:
        """
        Identify security rows.
        
        Args:
            rows: List of rows
            column_types: Mapping from column indices to column types
            
        Returns:
            List of security row indices
        """
        security_rows = []
        
        # Find ISIN column if available
        isin_col = None
        for col, col_type in column_types.items():
            if col_type == "isin":
                isin_col = col
                break
        
        # Skip header rows
        header_rows = self._identify_header_rows(rows)
        start_row = max(header_rows) + 1 if header_rows else 0
        
        # Skip footer rows
        footer_rows = self._identify_footer_rows(rows)
        end_row = min(footer_rows) if footer_rows else len(rows)
        
        # Check each row
        for i in range(start_row, end_row):
            row = rows[i]
            
            # If we have an ISIN column, check for valid ISIN
            if isin_col is not None and isin_col < len(row):
                isin_value = row[isin_col]
                if isin_value and re.match(self.isin_pattern, str(isin_value)):
                    security_rows.append(i)
                    continue
            
            # Otherwise, use heuristics to identify security rows
            # Security rows typically have more filled cells
            filled_ratio = sum(1 for val in row if val) / len(row)
            
            # Security rows typically have a mix of text and numeric values
            text_count = sum(1 for val in row if val and not self._is_numeric(val))
            numeric_count = sum(1 for val in row if val and self._is_numeric(val))
            
            if filled_ratio > 0.5 and text_count > 0 and numeric_count > 0:
                security_rows.append(i)
        
        return security_rows
    
    def _determine_table_type(self, column_types: Dict[int, str], security_rows: List[int]) -> str:
        """
        Determine the type of financial table.
        
        Args:
            column_types: Mapping from column indices to column types
            security_rows: List of security row indices
            
        Returns:
            Table type
        """
        # Count column types
        type_counts = {}
        for col_type in column_types.values():
            if col_type in type_counts:
                type_counts[col_type] += 1
            else:
                type_counts[col_type] = 1
        
        # Check for portfolio holdings table
        if "isin" in type_counts and "value" in type_counts and "weight" in type_counts:
            return "portfolio_holdings"
        
        # Check for price list
        if "isin" in type_counts and "price" in type_counts and "date" in type_counts:
            return "price_list"
        
        # Check for transaction list
        if "date" in type_counts and "quantity" in type_counts and "price" in type_counts:
            return "transaction_list"
        
        # Default to generic financial table
        return "financial_table"
    
    def _is_numeric(self, value: Any) -> bool:
        """
        Check if a value is numeric.
        
        Args:
            value: Value to check
            
        Returns:
            True if numeric, False otherwise
        """
        if value is None:
            return False
        
        # Try to convert to float
        try:
            float(str(value).replace(',', '').replace('%', '').strip())
            return True
        except:
            return False
