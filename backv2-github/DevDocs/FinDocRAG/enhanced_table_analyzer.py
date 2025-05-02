"""
Enhanced Table Structure Analyzer for Financial Documents.

This module provides advanced table structure analysis capabilities
specifically designed for financial documents and tables.
"""

import os
import logging
import json
import re
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple, Union
import fitz  # PyMuPDF

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedTableAnalyzer:
    """
    Enhanced table structure analyzer for financial documents.
    """
    
    def __init__(
        self,
        debug: bool = False,
        output_dir: Optional[str] = None
    ):
        """
        Initialize the enhanced table analyzer.
        
        Args:
            debug: Whether to enable debug mode
            output_dir: Directory to save debug information
        """
        self.debug = debug
        self.output_dir = output_dir
        
        if output_dir and debug:
            os.makedirs(output_dir, exist_ok=True)
        
        # Financial column patterns
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
        
        # ISIN pattern
        self.isin_pattern = r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$'
    
    def analyze_table(self, table_data: Union[pd.DataFrame, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze a table structure.
        
        Args:
            table_data: Table data as DataFrame or dictionary
            
        Returns:
            Dictionary with table analysis results
        """
        # Convert to DataFrame if necessary
        if isinstance(table_data, dict):
            if "dataframe" in table_data:
                df = table_data["dataframe"]
            elif "data" in table_data and isinstance(table_data["data"], list):
                df = pd.DataFrame(table_data["data"])
            else:
                logger.warning("Invalid table data format")
                return {"error": "Invalid table data format"}
        else:
            df = table_data
        
        # Clean up DataFrame
        df = self._clean_dataframe(df)
        
        # Analyze column types
        column_types = self._analyze_column_types(df)
        
        # Identify header rows
        header_rows = self._identify_header_rows(df)
        
        # Identify footer rows
        footer_rows = self._identify_footer_rows(df)
        
        # Identify security rows
        security_rows = self._identify_security_rows(df, column_types)
        
        # Extract securities
        securities = self._extract_securities(df, column_types, security_rows)
        
        # Analyze table type
        table_type = self._determine_table_type(column_types, securities)
        
        return {
            "table_type": table_type,
            "column_types": column_types,
            "header_rows": header_rows,
            "footer_rows": footer_rows,
            "security_rows": security_rows,
            "securities_count": len(securities),
            "securities": securities
        }
    
    def _clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean up a DataFrame for analysis.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Cleaned DataFrame
        """
        # Make a copy to avoid modifying the original
        df = df.copy()
        
        # Convert all column names to strings
        df.columns = [str(col) for col in df.columns]
        
        # Replace empty strings with NaN
        df = df.replace('', np.nan)
        
        # Drop completely empty rows and columns
        df = df.dropna(how='all').dropna(axis=1, how='all')
        
        # Reset index
        df = df.reset_index(drop=True)
        
        return df
    
    def _analyze_column_types(self, df: pd.DataFrame) -> Dict[str, str]:
        """
        Analyze column types in a DataFrame.
        
        Args:
            df: DataFrame to analyze
            
        Returns:
            Dictionary mapping column names to types
        """
        column_types = {}
        
        for col in df.columns:
            col_str = str(col).strip().lower()
            
            # Try to match column name against patterns
            col_type = None
            for type_name, patterns in self.column_patterns.items():
                if any(re.search(pattern, col_str) for pattern in patterns):
                    col_type = type_name
                    break
            
            # If no match by name, analyze content
            if not col_type:
                col_type = self._detect_column_type_by_content(df[col])
            
            column_types[col] = col_type
        
        return column_types
    
    def _detect_column_type_by_content(self, column: pd.Series) -> str:
        """
        Detect column type by analyzing its content.
        
        Args:
            column: Column to analyze
            
        Returns:
            Column type as string
        """
        # Drop NaN values
        values = column.dropna()
        
        if len(values) == 0:
            return "unknown"
        
        # Convert values to strings for pattern matching
        str_values = values.astype(str)
        
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
            numeric_values = pd.to_numeric(values)
            
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
        try:
            pd.to_datetime(values)
            return "date"
        except:
            pass
        
        # Default to text if no other type matches
        return "text"
    
    def _identify_header_rows(self, df: pd.DataFrame) -> List[int]:
        """
        Identify header rows in a DataFrame.
        
        Args:
            df: DataFrame to analyze
            
        Returns:
            List of header row indices
        """
        header_rows = []
        
        # Check first few rows
        for i in range(min(3, len(df))):
            row = df.iloc[i]
            
            # Header rows typically have shorter text
            avg_len = sum(len(str(val)) for val in row if pd.notna(val)) / max(1, sum(1 for val in row if pd.notna(val)))
            
            # Header rows typically have more text cells than numeric
            text_ratio = sum(1 for val in row if pd.notna(val) and not self._is_numeric(val)) / max(1, len(row))
            
            # Header rows typically have different formatting than data rows
            if avg_len < 15 and text_ratio > 0.5:
                header_rows.append(i)
        
        return header_rows
    
    def _identify_footer_rows(self, df: pd.DataFrame) -> List[int]:
        """
        Identify footer rows in a DataFrame.
        
        Args:
            df: DataFrame to analyze
            
        Returns:
            List of footer row indices
        """
        footer_rows = []
        
        # Check last few rows
        for i in range(max(0, len(df) - 3), len(df)):
            row = df.iloc[i]
            
            # Footer rows often contain summary information
            if any(str(val).lower().startswith(('total', 'sum', 'average')) for val in row if pd.notna(val)):
                footer_rows.append(i)
                continue
            
            # Footer rows often have fewer filled cells
            filled_ratio = sum(1 for val in row if pd.notna(val)) / len(row)
            if filled_ratio < 0.5:
                footer_rows.append(i)
        
        return footer_rows
    
    def _identify_security_rows(self, df: pd.DataFrame, column_types: Dict[str, str]) -> List[int]:
        """
        Identify rows containing security information.
        
        Args:
            df: DataFrame to analyze
            column_types: Dictionary of column types
            
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
        header_rows = self._identify_header_rows(df)
        start_row = max(header_rows) + 1 if header_rows else 0
        
        # Skip footer rows
        footer_rows = self._identify_footer_rows(df)
        end_row = min(footer_rows) if footer_rows else len(df)
        
        # Check each row
        for i in range(start_row, end_row):
            row = df.iloc[i]
            
            # If we have an ISIN column, check for valid ISIN
            if isin_col is not None:
                isin_value = row[isin_col]
                if pd.notna(isin_value) and re.match(self.isin_pattern, str(isin_value)):
                    security_rows.append(i)
                    continue
            
            # Otherwise, use heuristics to identify security rows
            # Security rows typically have more filled cells
            filled_ratio = sum(1 for val in row if pd.notna(val)) / len(row)
            
            # Security rows typically have a mix of text and numeric values
            text_count = sum(1 for val in row if pd.notna(val) and not self._is_numeric(val))
            numeric_count = sum(1 for val in row if pd.notna(val) and self._is_numeric(val))
            
            if filled_ratio > 0.5 and text_count > 0 and numeric_count > 0:
                security_rows.append(i)
        
        return security_rows
    
    def _extract_securities(self, df: pd.DataFrame, column_types: Dict[str, str], security_rows: List[int]) -> List[Dict[str, Any]]:
        """
        Extract securities information from a DataFrame.
        
        Args:
            df: DataFrame to analyze
            column_types: Dictionary of column types
            security_rows: List of security row indices
            
        Returns:
            List of securities
        """
        securities = []
        
        # Create a mapping from column types to column names
        type_to_col = {}
        for col, col_type in column_types.items():
            if col_type not in type_to_col:
                type_to_col[col_type] = col
        
        # Process each security row
        for row_idx in security_rows:
            row = df.iloc[row_idx]
            
            # Create security object
            security = {
                "row_index": row_idx
            }
            
            # Extract values for each field
            for field in ["isin", "security_name", "quantity", "price", "acquisition_price", "value", "currency", "weight", "performance", "date"]:
                if field in type_to_col:
                    col = type_to_col[field]
                    value = row[col]
                    
                    # Clean and convert value
                    if pd.notna(value):
                        if field in ["quantity", "price", "acquisition_price", "value"]:
                            security[field] = self._parse_numeric(value)
                        elif field == "weight":
                            security[field] = self._parse_percentage(value)
                        else:
                            security[field] = str(value).strip()
            
            # Only add security if it has at least an ISIN or name
            if "isin" in security or "security_name" in security:
                securities.append(security)
        
        return securities
    
    def _determine_table_type(self, column_types: Dict[str, str], securities: List[Dict[str, Any]]) -> str:
        """
        Determine the type of financial table.
        
        Args:
            column_types: Dictionary of column types
            securities: List of extracted securities
            
        Returns:
            Table type as string
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
        if pd.isna(value):
            return False
        
        # Try to convert to float
        try:
            float(str(value).replace(',', '').replace('%', '').strip())
            return True
        except:
            return False
    
    def _parse_numeric(self, value: Any) -> float:
        """
        Parse a numeric value.
        
        Args:
            value: Value to parse
            
        Returns:
            Parsed numeric value
        """
        if pd.isna(value):
            return None
        
        # Convert to string
        str_val = str(value)
        
        # Remove currency symbols and commas
        cleaned = re.sub(r'[$€£¥,]', '', str_val)
        
        # Remove any remaining non-numeric characters except decimal point
        cleaned = re.sub(r'[^\d.-]', '', cleaned)
        
        try:
            return float(cleaned)
        except:
            return None
    
    def _parse_percentage(self, value: Any) -> float:
        """
        Parse a percentage value.
        
        Args:
            value: Value to parse
            
        Returns:
            Parsed percentage value
        """
        if pd.isna(value):
            return None
        
        # Convert to string
        str_val = str(value)
        
        # Remove percentage symbol
        cleaned = str_val.replace('%', '')
        
        # Remove any remaining non-numeric characters except decimal point
        cleaned = re.sub(r'[^\d.-]', '', cleaned)
        
        try:
            return float(cleaned)
        except:
            return None
