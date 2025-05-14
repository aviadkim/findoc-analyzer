"""
Enhanced securities extractor for financial documents.

This module provides functions to extract securities information from financial documents,
supporting various formats including messos, Interactive Brokers, Charles Schwab, Vanguard,
Fidelity, TD Ameritrade, and E*TRADE.
"""

import os
import json
import re
import camelot
import pandas as pd
import logging
from typing import List, Dict, Any, Optional, Tuple

# Import monitoring functionality
from securities_extraction_monitor import track_extraction_performance

# Import the securities reference database
try:
    from securities_reference_db import SecuritiesReferenceDB
except ImportError:
    # Create a minimal stub if the module is not available
    class SecuritiesReferenceDB:
        def __init__(self):
            pass
        def get_name_by_isin(self, isin):
            return None
        def normalize_security_name(self, name):
            return name
        def validate_isin(self, isin):
            return True
        def find_best_match_for_name(self, name):
            return None
        def detect_security_type(self, description):
            return None

# Import additional format support
try:
    from enhanced_securities_formats import (
        DOCUMENT_TYPE_PATTERNS,
        DOCUMENT_CURRENCY_MAP,
        EXTRACTION_FUNCTIONS,
        detect_document_format
    )
except ImportError:
    # Create minimal stubs if the module is not available
    DOCUMENT_TYPE_PATTERNS = {}
    DOCUMENT_CURRENCY_MAP = {}
    EXTRACTION_FUNCTIONS = {}
    
    def detect_document_format(text):
        return None

# Set up logging
logger = logging.getLogger('securities_extractor')
logger.setLevel(logging.INFO)

# Create console handler if not already set up
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

class SecurityExtractor:
    """
    Class for extracting securities information from financial documents.
    """
    
    def __init__(self, debug: bool = False, reference_db_path: Optional[str] = None, log_level: str = "INFO"):
        """
        Initialize the SecurityExtractor.
        
        Args:
            debug: Whether to print debug information
            reference_db_path: Optional path to securities reference database file
            log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        """
        self.debug = debug
        
        # Configure logging based on level
        numeric_level = getattr(logging, log_level.upper(), None)
        if not isinstance(numeric_level, int):
            numeric_level = logging.INFO
        logger.setLevel(numeric_level)
        
        # Mapping of document types to default currencies
        self.doc_type_currency_map = {
            "messos": "USD",
            "bofa": "USD",
            "ubs": "CHF",
            "db": "EUR",
            "ms": "USD",
            "interactive_brokers": "USD",
            "schwab": "USD",
            "vanguard": "USD",
            "fidelity": "USD",
            "tdameritrade": "USD",
            "etrade": "USD",
            "generic": "USD" # Default fallback
        }
        
        # Add additional currencies from enhanced formats
        if DOCUMENT_CURRENCY_MAP:
            self.doc_type_currency_map.update(DOCUMENT_CURRENCY_MAP)
        
        # Currency symbols mapping
        self.currency_symbols = {
            "$": "USD",
            "€": "EUR", 
            "£": "GBP",
            "¥": "JPY",
            "Fr.": "CHF",
            "₣": "CHF",
            "C$": "CAD",
            "A$": "AUD",
            "HK$": "HKD"
        }
        
        # Initialize the securities reference database
        self.securities_db = SecuritiesReferenceDB()
        
        # Load additional securities data if provided
        if reference_db_path and os.path.exists(reference_db_path):
            self.securities_db.load_from_file(reference_db_path)
            logger.info(f"Loaded securities reference data from {reference_db_path}")
            if self.debug:
                print(f"Loaded securities reference data from {reference_db_path}")
    
    # Helper functions for safe type operations
    
    def _safe_str(self, value: Any) -> Optional[str]:
        """
        Safely convert a value to string.
        
        Args:
            value: Value to convert
            
        Returns:
            String representation or None if conversion fails
        """
        if value is None:
            return None
        
        try:
            return str(value)
        except Exception:
            return None
    
    def _safe_float(self, value: Any) -> Optional[float]:
        """
        Safely convert a value to float.
        
        Args:
            value: Value to convert
            
        Returns:
            Float value or None if conversion fails
        """
        if value is None:
            return None
        
        if isinstance(value, (int, float)):
            return float(value)
        
        if isinstance(value, str):
            # Clean the string
            cleaned_value = value.replace("'", "").replace(",", "")
            try:
                return float(cleaned_value)
            except ValueError:
                # Handle case where value might have other text
                numeric_part = re.search(r'(\d+[\.,]?\d*)', cleaned_value)
                if numeric_part:
                    try:
                        return float(numeric_part.group(1).replace(',', ''))
                    except (ValueError, IndexError):
                        return None
        
        return None
    
    def _safe_int(self, value: Any) -> Optional[int]:
        """
        Safely convert a value to integer.
        
        Args:
            value: Value to convert
            
        Returns:
            Integer value or None if conversion fails
        """
        float_value = self._safe_float(value)
        if float_value is None:
            return None
        
        try:
            return int(float_value)
        except (ValueError, OverflowError):
            return None
            
    def _normalize_text(self, text: Any) -> str:
        """
        Normalize text to a consistent format.
        
        Args:
            text: Text to normalize
            
        Returns:
            Normalized text
        """
        if text is None:
            return ""
        
        if not isinstance(text, str):
            text = self._safe_str(text)
            if text is None:
                return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    @track_extraction_performance
    def extract_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract securities information from a PDF file.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary containing extracted information
        """
        logger.info(f"Starting extraction from PDF: {pdf_path}")
        # Initialize default result structure
        default_result = {
            "document_type": "unknown",
            "securities": [],
            "error": None
        }
        
        try:
            # Validate input
            if not pdf_path or not isinstance(pdf_path, str):
                error_msg = "Invalid PDF path provided"
                logger.error(error_msg)
                default_result["error"] = error_msg
                return default_result
                
            # Check if file exists
            if not os.path.exists(pdf_path):
                default_result["error"] = f"PDF file not found: {pdf_path}"
                return default_result
                
            if self.debug:
                print(f"Processing {pdf_path} to extract securities information...")
            
            # Detect document type
            try:
                doc_type = self._detect_document_type(pdf_path)
            except Exception as e:
                default_result["error"] = f"Error detecting document type: {str(e)}"
                return default_result
            
            # Extract based on document type
            if doc_type == "messos":
                try:
                    result = self._extract_from_messos(pdf_path)
                    return result
                except Exception as e:
                    default_result["error"] = f"Error extracting from messos PDF: {str(e)}"
                    default_result["document_type"] = "messos"
                    return default_result
            elif doc_type in EXTRACTION_FUNCTIONS:
                # Use the format-specific extraction function
                try:
                    # Get document information
                    default_result["document_type"] = doc_type
                    
                    # Extract text from PDF using camelot for enhanced formats
                    tables = camelot.read_pdf(
                        pdf_path,
                        pages='all',
                        flavor='stream',
                        suppress_stdout=True
                    )
                    
                    # Convert to text
                    all_text = ' '.join([' '.join([' '.join(cell) for cell in row]) for table in tables for row in table.df.values.tolist()])
                    
                    # Get document currency
                    try:
                        currency = self._get_document_currency(pdf_path, doc_type)
                        default_result["currency"] = currency
                    except Exception as e:
                        logger.warning(f"Error detecting currency for {doc_type}: {str(e)}")
                        default_result["currency"] = self.doc_type_currency_map.get(doc_type, "USD")
                    
                    # Call the format-specific extraction function
                    securities = EXTRACTION_FUNCTIONS[doc_type](all_text, tables)
                    
                    # Apply post-processing to standardize securities data
                    if securities:
                        securities = self._post_process_securities(securities)
                    
                    default_result["securities"] = securities
                    
                    return default_result
                except Exception as e:
                    default_result["error"] = f"Error extracting from {doc_type} PDF: {str(e)}"
                    default_result["document_type"] = doc_type
                    return default_result
            else:
                # Generic extraction for other document types
                try:
                    result = self._extract_generic(pdf_path)
                    return result
                except Exception as e:
                    default_result["error"] = f"Error in generic extraction: {str(e)}"
                    default_result["document_type"] = doc_type
                    return default_result
                    
        except Exception as e:
            # Catch any unexpected errors
            default_result["error"] = f"Unexpected error in extraction: {str(e)}"
            return default_result
    
    def _detect_document_type(self, pdf_path: str) -> str:
        """
        Detect the type of financial document.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Document type as a string
        """
        # Extract text from first page
        tables = camelot.read_pdf(
            pdf_path,
            pages='1',
            flavor='stream',
            suppress_stdout=True
        )
        
        if len(tables) == 0:
            return "unknown"
        
        # Convert to text
        text = ' '.join([' '.join(row) for row in tables[0].df.values.tolist()])
        
        # Check for document type indicators
        if "MESSOS ENTERPRISES" in text or "Cornèr Banca" in text:
            if self.debug:
                print("Detected document type: messos")
            return "messos"
        
        # Check for additional document types and their default currencies
        if "Bank of America" in text or "Merrill Lynch" in text:
            if self.debug:
                print("Detected document type: bofa")
            return "bofa" # Default currency USD
            
        if "UBS" in text:
            if self.debug:
                print("Detected document type: ubs")
            return "ubs"  # Default currency might be CHF
            
        if "Deutsche Bank" in text:
            if self.debug:
                print("Detected document type: db")
            return "db"   # Default currency might be EUR
            
        if "Morgan Stanley" in text:
            if self.debug:
                print("Detected document type: ms")
            return "ms"   # Default currency USD
        
        # Try to detect additional document types using the enhanced formats
        enhanced_format = detect_document_format(text)
        if enhanced_format:
            if self.debug:
                print(f"Detected document type: {enhanced_format}")
            return enhanced_format
        
        return "generic"
    
    def _get_document_currency(self, pdf_path: str, doc_type: str) -> str:
        """
        Determine the primary currency used in the document.
        
        Args:
            pdf_path: Path to the PDF file
            doc_type: Document type
            
        Returns:
            Currency code (USD, EUR, etc.)
        """
        # First, try to extract from document text
        tables = camelot.read_pdf(
            pdf_path,
            pages='1-3',  # Check first few pages
            flavor='stream',
            suppress_stdout=True
        )
        
        # Join all text
        full_text = ""
        for table in tables:
            full_text += ' '.join([' '.join(row) for row in table.df.values.tolist()])
        
        # Look for valuation currency
        currency_mentions = {
            'USD': 0,
            'EUR': 0,
            'CHF': 0,
            'GBP': 0,
            'JPY': 0,
            'CAD': 0
        }
        
        # Look for specific currency mentions
        valuation_currency = re.search(r'(?:Valuation|Reporting|Base)\s+[Cc]urrency\s*[:/]?\s*(USD|EUR|CHF|GBP|JPY|CAD)', full_text)
        if valuation_currency:
            return valuation_currency.group(1)
        
        # Count explicit mentions of currency codes
        for currency in currency_mentions.keys():
            currency_mentions[currency] = len(re.findall(r'\b' + currency + r'\b', full_text))
        
        # Count currency symbols
        for symbol, currency in self.currency_symbols.items():
            symbol_pattern = re.escape(symbol)
            symbol_count = len(re.findall(symbol_pattern, full_text))
            if currency in currency_mentions:
                currency_mentions[currency] += symbol_count
        
        # Find most common currency
        most_common_currency = max(currency_mentions.items(), key=lambda x: x[1])
        if most_common_currency[1] > 0:
            return most_common_currency[0]
        
        # If we can't find currency mentions, use document type default
        return self.doc_type_currency_map.get(doc_type, "USD")
        
    @track_extraction_performance
    def _extract_from_messos(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract information from a messos PDF.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary containing extracted information
        """
        # Initialize default result structure
        default_result = {
            "document_type": "messos",
            "currency": "USD",  # Default currency
            "portfolio_summary": {},
            "securities": [],
            "asset_allocation": {},
            "error": None
        }
        
        try:
            # Validate input
            if not pdf_path or not isinstance(pdf_path, str):
                default_result["error"] = "Invalid PDF path provided to _extract_from_messos"
                return default_result
                
            # Check if file exists
            if not os.path.exists(pdf_path):
                default_result["error"] = f"PDF file not found: {pdf_path}"
                return default_result
            
            if self.debug:
                print(f"Extracting from messos PDF: {pdf_path}")
            
            # Get document currency with error handling
            try:
                currency = self._get_document_currency(pdf_path, "messos")
                default_result["currency"] = currency
            except Exception as e:
                if self.debug:
                    print(f"Error detecting currency: {str(e)}")
                # Continue with default currency
                
            # Extract portfolio summary with error handling
            try:
                portfolio_summary = self._extract_messos_summary(pdf_path)
                default_result["portfolio_summary"] = portfolio_summary
            except Exception as e:
                default_result["error"] = f"Error extracting portfolio summary: {str(e)}"
                # Continue with other extractions
            
            # Extract securities with error handling
            try:
                securities = self._extract_messos_securities(pdf_path)
                default_result["securities"] = securities
            except Exception as e:
                default_result["error"] = f"Error extracting securities: {str(e)}"
                # Continue with other extractions
            
            # Extract asset allocation with error handling
            try:
                asset_allocation = self._extract_messos_asset_allocation(pdf_path)
                default_result["asset_allocation"] = asset_allocation
            except Exception as e:
                default_result["error"] = f"Error extracting asset allocation: {str(e)}"
                # Continue with other extractions
            
            return default_result
            
        except Exception as e:
            # Catch any unexpected errors
            default_result["error"] = f"Unexpected error in messos extraction: {str(e)}"
            return default_result
    
    def _extract_messos_summary(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract summary information from a messos PDF.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary containing summary information
        """
        # Initialize default summary structure
        summary = {
            "client_number": None,
            "valuation_date": None,
            "valuation_currency": None,
            "total_value": None,
            "performance": None,
            "error": None
        }
        
        try:
            # Validate input
            if not pdf_path or not isinstance(pdf_path, str):
                summary["error"] = "Invalid PDF path provided to _extract_messos_summary"
                return summary
                
            # Check if file exists
            if not os.path.exists(pdf_path):
                summary["error"] = f"PDF file not found: {pdf_path}"
                return summary
            
            # Extract tables from summary page (usually page 3)
            try:
                tables = camelot.read_pdf(
                    pdf_path,
                    pages='1-3',
                    flavor='stream',
                    suppress_stdout=True
                )
            except Exception as e:
                summary["error"] = f"Error extracting tables from PDF: {str(e)}"
                return summary
            
            # Process tables to find summary information
            for table_idx, table in enumerate(tables):
                try:
                    df = table.df
                    
                    # Convert all rows to text with safe string conversion
                    try:
                        text = ' '.join([' '.join(self._safe_str(cell) for cell in row if cell is not None) for row in df.values.tolist()])
                    except Exception as text_error:
                        if self.debug:
                            print(f"Error joining table {table_idx} text: {str(text_error)}")
                        continue  # Skip this table if text joining fails
                    
                    # Extract client number with safe regex
                    try:
                        client_match = re.search(r'Client\s+Number\s+//?\s*(\d+)', text)
                        if client_match:
                            summary["client_number"] = client_match.group(1)
                    except Exception as re_error:
                        if self.debug:
                            print(f"Error in client number regex: {str(re_error)}")
                    
                    # Extract valuation date with safe regex
                    try:
                        date_match = re.search(r'as\s+of\s+(\d{2}\.\d{2}\.\d{4})', text)
                        if date_match:
                            summary["valuation_date"] = date_match.group(1)
                    except Exception as re_error:
                        if self.debug:
                            print(f"Error in valuation date regex: {str(re_error)}")
                    
                    # Extract valuation currency with safe regex
                    try:
                        currency_match = re.search(r'Valuation\s+currency\s+//?\s*(\w+)', text)
                        if currency_match:
                            summary["valuation_currency"] = currency_match.group(1)
                    except Exception as re_error:
                        if self.debug:
                            print(f"Error in valuation currency regex: {str(re_error)}")
                    
                    # Extract total value with safe regex
                    try:
                        total_match = re.search(r'Total\s+(\d+\'?\d*\'?\d*)', text)
                        if total_match:
                            summary["total_value"] = self._safe_str(total_match.group(1))
                    except Exception as re_error:
                        if self.debug:
                            print(f"Error in total value regex: {str(re_error)}")
                    
                    # Look for specific rows that might contain the total value
                    try:
                        for i, row in enumerate(df.values.tolist()):
                            try:
                                row_text = ' '.join(self._safe_str(cell) for cell in row if cell is not None)
                                
                                if "Total" in row_text and any(x in row_text for x in ["assets", "portfolio"]):
                                    for cell in row:
                                        cell_str = self._safe_str(cell)
                                        if not cell_str:
                                            continue
                                            
                                        value_match = re.search(r'(\d+\'?\d*\'?\d*)', cell_str)
                                        if value_match and (not summary["total_value"] or summary["total_value"] == "None"):
                                            summary["total_value"] = self._safe_str(value_match.group(1))
                                
                                # Look for performance information
                                if "Performance" in row_text and "%" in row_text:
                                    for cell in row:
                                        cell_str = self._safe_str(cell)
                                        if not cell_str:
                                            continue
                                            
                                        perf_match = re.search(r'(\d+\.?\d*\s*%)', cell_str)
                                        if perf_match:
                                            summary["performance"] = perf_match.group(1)
                            except Exception as row_error:
                                if self.debug:
                                    print(f"Error processing summary row {i}: {str(row_error)}")
                                continue  # Skip this row if processing fails
                    except Exception as rows_error:
                        if self.debug:
                            print(f"Error processing summary rows: {str(rows_error)}")
                    
                except Exception as table_error:
                    if self.debug:
                        print(f"Error processing summary table {table_idx}: {str(table_error)}")
                    continue  # Skip this table if processing fails
            
            # Clean up and normalize values
            if summary["total_value"]:
                try:
                    clean_value = self._safe_str(summary["total_value"]).replace("'", "").replace(",", "")
                    float_value = self._safe_float(clean_value)
                    if float_value is not None:
                        summary["total_value_float"] = float_value
                except Exception as clean_error:
                    if self.debug:
                        print(f"Error cleaning total value: {str(clean_error)}")
            
            # Remove error field if no error occurred
            if "error" in summary and summary["error"] is None:
                del summary["error"]
                
            return summary
            
        except Exception as e:
            # Catch any unexpected errors
            summary["error"] = f"Unexpected error in _extract_messos_summary: {str(e)}"
            return summary
    
    def _extract_messos_asset_allocation(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract asset allocation information from a messos PDF.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary containing asset allocation information
        """
        # Initialize default asset allocation structure
        asset_allocation = {
            "liquidity": None,
            "bonds": None,
            "equities": None,
            "structured_products": None,
            "other_assets": None,
            "error": None
        }
        
        try:
            # Validate input
            if not pdf_path or not isinstance(pdf_path, str):
                asset_allocation["error"] = "Invalid PDF path provided to _extract_messos_asset_allocation"
                return asset_allocation
                
            # Check if file exists
            if not os.path.exists(pdf_path):
                asset_allocation["error"] = f"PDF file not found: {pdf_path}"
                return asset_allocation
            
            # Extract tables from asset allocation page (usually page 4-5)
            try:
                tables = camelot.read_pdf(
                    pdf_path,
                    pages='3-5',
                    flavor='stream',
                    suppress_stdout=True
                )
            except Exception as e:
                asset_allocation["error"] = f"Error extracting tables from asset allocation pages: {str(e)}"
                return asset_allocation
            
            # Process tables to find asset allocation information
            for table_idx, table in enumerate(tables):
                try:
                    df = table.df
                    
                    # Look for asset allocation rows
                    for i, row in enumerate(df.values.tolist()):
                        try:
                            # Convert row to text with safe string conversion
                            row_text = ' '.join(self._safe_str(cell) for cell in row if cell is not None)
                            
                            # Extract liquidity with error handling
                            try:
                                if "Liquidity" in row_text and not any(x in row_text for x in ["Assets", "Asset"]):
                                    for j, cell in enumerate(row):
                                        cell_str = self._safe_str(cell)
                                        if not cell_str:
                                            continue
                                            
                                        if re.search(r'\d+\'?\d*', cell_str) and j > 0:
                                            try:
                                                # Extract percentage with safe next() operation
                                                percentage = None
                                                for k in range(j+1, len(row)):
                                                    if k < len(row) and "%" in self._safe_str(row[k]):
                                                        percentage = self._safe_str(row[k]).strip()
                                                        break
                                                        
                                                asset_allocation["liquidity"] = {
                                                    "value": cell_str.strip(),
                                                    "percentage": percentage
                                                }
                                                break
                                            except Exception as value_error:
                                                if self.debug:
                                                    print(f"Error extracting liquidity value: {str(value_error)}")
                            except Exception as liquidity_error:
                                if self.debug:
                                    print(f"Error processing liquidity row: {str(liquidity_error)}")
                            
                            # Extract bonds with error handling
                            try:
                                if "Bonds" in row_text and not any(x in row_text for x in ["funds", "Convertible", "Assets", "Asset"]):
                                    for j, cell in enumerate(row):
                                        cell_str = self._safe_str(cell)
                                        if not cell_str:
                                            continue
                                            
                                        if re.search(r'\d+\'?\d*', cell_str) and j > 0:
                                            try:
                                                # Extract percentage with safe next() operation
                                                percentage = None
                                                for k in range(j+1, len(row)):
                                                    if k < len(row) and "%" in self._safe_str(row[k]):
                                                        percentage = self._safe_str(row[k]).strip()
                                                        break
                                                        
                                                asset_allocation["bonds"] = {
                                                    "value": cell_str.strip(),
                                                    "percentage": percentage
                                                }
                                                break
                                            except Exception as value_error:
                                                if self.debug:
                                                    print(f"Error extracting bonds value: {str(value_error)}")
                            except Exception as bonds_error:
                                if self.debug:
                                    print(f"Error processing bonds row: {str(bonds_error)}")
                            
                            # Extract equities with error handling
                            try:
                                if "Equities" in row_text and not any(x in row_text for x in ["funds", "Assets", "Asset"]):
                                    for j, cell in enumerate(row):
                                        cell_str = self._safe_str(cell)
                                        if not cell_str:
                                            continue
                                            
                                        if re.search(r'\d+\'?\d*', cell_str) and j > 0:
                                            try:
                                                # Extract percentage with safe next() operation
                                                percentage = None
                                                for k in range(j+1, len(row)):
                                                    if k < len(row) and "%" in self._safe_str(row[k]):
                                                        percentage = self._safe_str(row[k]).strip()
                                                        break
                                                        
                                                asset_allocation["equities"] = {
                                                    "value": cell_str.strip(),
                                                    "percentage": percentage
                                                }
                                                break
                                            except Exception as value_error:
                                                if self.debug:
                                                    print(f"Error extracting equities value: {str(value_error)}")
                            except Exception as equities_error:
                                if self.debug:
                                    print(f"Error processing equities row: {str(equities_error)}")
                            
                            # Extract structured products with error handling
                            try:
                                if "Structured products" in row_text and not any(x in row_text for x in ["Bonds", "Equities", "Assets", "Asset"]):
                                    for j, cell in enumerate(row):
                                        cell_str = self._safe_str(cell)
                                        if not cell_str:
                                            continue
                                            
                                        if re.search(r'\d+\'?\d*', cell_str) and j > 0:
                                            try:
                                                # Extract percentage with safe next() operation
                                                percentage = None
                                                for k in range(j+1, len(row)):
                                                    if k < len(row) and "%" in self._safe_str(row[k]):
                                                        percentage = self._safe_str(row[k]).strip()
                                                        break
                                                        
                                                asset_allocation["structured_products"] = {
                                                    "value": cell_str.strip(),
                                                    "percentage": percentage
                                                }
                                                break
                                            except Exception as value_error:
                                                if self.debug:
                                                    print(f"Error extracting structured products value: {str(value_error)}")
                            except Exception as sp_error:
                                if self.debug:
                                    print(f"Error processing structured products row: {str(sp_error)}")
                            
                            # Extract other assets with error handling
                            try:
                                if "Other assets" in row_text:
                                    for j, cell in enumerate(row):
                                        cell_str = self._safe_str(cell)
                                        if not cell_str:
                                            continue
                                            
                                        if re.search(r'\d+\'?\d*', cell_str) and j > 0:
                                            try:
                                                # Extract percentage with safe next() operation
                                                percentage = None
                                                for k in range(j+1, len(row)):
                                                    if k < len(row) and "%" in self._safe_str(row[k]):
                                                        percentage = self._safe_str(row[k]).strip()
                                                        break
                                                        
                                                asset_allocation["other_assets"] = {
                                                    "value": cell_str.strip(),
                                                    "percentage": percentage
                                                }
                                                break
                                            except Exception as value_error:
                                                if self.debug:
                                                    print(f"Error extracting other assets value: {str(value_error)}")
                            except Exception as other_error:
                                if self.debug:
                                    print(f"Error processing other assets row: {str(other_error)}")
                                    
                        except Exception as row_error:
                            if self.debug:
                                print(f"Error processing asset allocation row {i}: {str(row_error)}")
                            continue  # Skip this row if processing fails
                            
                except Exception as table_error:
                    if self.debug:
                        print(f"Error processing asset allocation table {table_idx}: {str(table_error)}")
                    continue  # Skip this table if processing fails
            
            # Clean up and normalize values
            try:
                for asset_type in ["liquidity", "bonds", "equities", "structured_products", "other_assets"]:
                    if asset_allocation[asset_type] and "value" in asset_allocation[asset_type]:
                        value_str = asset_allocation[asset_type]["value"]
                        try:
                            # Clean the value string and convert to float
                            clean_value = self._safe_str(value_str).replace("'", "").replace(",", "")
                            float_value = self._safe_float(clean_value)
                            if float_value is not None:
                                asset_allocation[asset_type]["value_float"] = float_value
                        except Exception as clean_error:
                            if self.debug:
                                print(f"Error cleaning {asset_type} value: {str(clean_error)}")
            except Exception as normalize_error:
                if self.debug:
                    print(f"Error normalizing asset allocation values: {str(normalize_error)}")
            
            # Remove error field if no error occurred
            if "error" in asset_allocation and asset_allocation["error"] is None:
                del asset_allocation["error"]
                
            return asset_allocation
            
        except Exception as e:
            # Catch any unexpected errors
            asset_allocation["error"] = f"Unexpected error in _extract_messos_asset_allocation: {str(e)}"
            return asset_allocation
    
    def _extract_messos_securities(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract securities information from a messos PDF.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            List of dictionaries containing securities information
        """
        securities = []
        
        try:
            # Validate input
            if not pdf_path or not isinstance(pdf_path, str):
                if self.debug:
                    print("Invalid PDF path provided to _extract_messos_securities")
                return securities
                
            # Check if file exists
            if not os.path.exists(pdf_path):
                if self.debug:
                    print(f"PDF file not found: {pdf_path}")
                return securities
                
            # Extract tables from securities pages (usually pages 6-12)
            try:
                tables = camelot.read_pdf(
                    pdf_path,
                    pages='6-12',
                    flavor='stream',
                    suppress_stdout=True
                )
                
                if self.debug:
                    print(f"Found {len(tables)} tables on pages 6-12")
                    
            except Exception as e:
                if self.debug:
                    print(f"Error extracting tables from securities pages: {str(e)}")
                return securities
            
            # Process tables to find securities
            for i, table in enumerate(tables):
                try:
                    # Convert to pandas DataFrame
                    df = table.df
                    
                    # Check if this is a securities table by looking for ISIN
                    try:
                        table_text = ' '.join([' '.join(self._safe_str(cell) for cell in row if cell is not None) for row in df.values.tolist()])
                    except Exception as text_error:
                        if self.debug:
                            print(f"Error joining table {i} text: {str(text_error)}")
                        continue  # Skip this table if text joining fails
                    
                    if 'ISIN:' in table_text:
                        if self.debug:
                            print(f"Found securities table: table_{i+1} on page {table.page}")
                        
                        # Extract securities from this table with error handling
                        try:
                            extracted_securities = self._extract_securities_from_table(df, table.page)
                            securities.extend(extracted_securities)
                            
                            if self.debug:
                                print(f"Extracted {len(extracted_securities)} securities from table_{i+1}")
                                
                        except Exception as extract_error:
                            if self.debug:
                                print(f"Error extracting securities from table_{i+1}: {str(extract_error)}")
                            # Continue with next table
                            continue
                            
                except Exception as table_error:
                    if self.debug:
                        print(f"Error processing table {i}: {str(table_error)}")
                    # Continue with next table
                    continue
            
            # Post-process securities to clean up and add additional information
            try:
                if securities:
                    securities = self._post_process_securities(securities)
                    
                    if self.debug:
                        print(f"Post-processed {len(securities)} securities")
                    
            except Exception as process_error:
                if self.debug:
                    print(f"Error post-processing securities: {str(process_error)}")
                # Return unprocessed securities
                return securities
            
            return securities
            
        except Exception as e:
            # Catch any unexpected errors
            if self.debug:
                print(f"Unexpected error in _extract_messos_securities: {str(e)}")
            return securities
    
    def _extract_securities_from_table(self, df: pd.DataFrame, page_number: int) -> List[Dict[str, Any]]:
        """
        Extract securities from a table.
        
        Args:
            df: Pandas DataFrame containing the table
            page_number: Page number of the table
            
        Returns:
            List of dictionaries containing securities information
        """
        securities = []
        
        # Validate input
        if not isinstance(df, pd.DataFrame) or df.empty:
            return securities
            
        if not isinstance(page_number, int) or page_number < 0:
            page_number = 0
        
        # Convert DataFrame to list of rows
        try:
            rows = df.values.tolist()
        except Exception:
            # Handle any unexpected errors in dataframe conversion
            return securities
        
        # Process rows to extract securities
        current_security = None
        
        for row in rows:
            # Ensure row is properly formatted
            try:
                row_text = ' '.join(str(cell) for cell in row if cell is not None)
            except Exception:
                # Skip rows that can't be properly joined
                continue
            
            # Check if this row contains an ISIN
            isin_match = re.search(r'ISIN:\s*([A-Z]{2}[A-Z0-9]{9}[0-9])', row_text)
            
            if isin_match:
                # If we were processing a security, add it to the list
                if current_security:
                    securities.append(current_security)
                
                # Start a new security
                isin = isin_match.group(1)
                
                # Extract description/name from the row - improved security name extraction
                description = None
                for cell in row:
                    # Convert cell to string safely
                    cell_str = self._safe_str(cell)
                    if cell_str and len(cell_str) > 10 and 'ISIN:' not in cell_str:
                        description = cell_str.strip()
                        break
                    
                # Look for more accurate security names by pattern matching
                name_pattern = re.search(r'([A-Z][A-Za-z0-9\s\.\&\-]+(?:Corp|Inc|Ltd|LLC|SA|AG|NV|ETF|Fund|Trust|PLC|Group|Holding|Tech|Co))', row_text)
                if name_pattern:
                    description = name_pattern.group(1).strip()
                
                # Extract nominal/quantity with enhanced pattern matching
                nominal = None
                
                # Look for common quantity indicators with various formats
                quantity_patterns = [
                    # Format: 100 shares
                    r'(\d+[\.,\']?\d*[\.,\']?\d*)\s*(?:shares|units|bonds|stocks|pieces)', 
                    
                    # Format: Quantity: 100
                    r'(?:quantity|amount|units|nominal|position size|holding)[:;]\s*(\d+[\.,\']?\d*[\.,\']?\d*)',
                    
                    # Format: 100 USD Nominal
                    r'(\d+[\.,\']?\d*[\.,\']?\d*)\s*(?:USD|EUR|CHF|GBP)\s*(?:nominal|face value)',
                    
                    # Format: "shares: 100" or similar at the start of a line
                    r'^(?:shares|units|quantity|amount)[:;]\s*(\d+[\.,\']?\d*[\.,\']?\d*)',
                    
                    # Format: qty:100 (common in some reports)
                    r'(?:qty|quant|pos)[:;]\s*(\d+[\.,\']?\d*[\.,\']?\d*)'
                ]
                
                # Try each pattern until we find a match
                for pattern in quantity_patterns:
                    try:
                        quantity_match = re.search(pattern, row_text, re.IGNORECASE)
                        if quantity_match:
                            nominal_str = quantity_match.group(1).strip()
                            nominal = self._safe_float(nominal_str)
                            break
                    except (IndexError, AttributeError):
                        continue
                
                # If no match found with specific patterns, look for a number near quantity indicators
                if nominal is None:
                    # Look for quantity indicators near numbers
                    for i, cell in enumerate(row):
                        cell_str = self._safe_str(cell)
                        if cell_str and any(indicator in cell_str.lower() for indicator in ['qty', 'quant', 'units', 'shares', 'amount']):
                            # Check adjacent cells for numbers
                            for offset in [-1, 1]:  # Check cells before and after
                                adj_idx = i + offset
                                if 0 <= adj_idx < len(row):
                                    adjacent_cell = self._safe_str(row[adj_idx])
                                    if adjacent_cell and re.search(r'\d+[\.,\']?\d*', adjacent_cell):
                                        nominal = self._safe_float(adjacent_cell)
                                        break
                
                # Fallback to simple numeric extraction if still no match
                if nominal is None:
                    for cell in row:
                        cell_str = self._safe_str(cell)
                        # Look for numbers that are likely to be quantities (not too long, not containing too many decimals)
                        if cell_str and re.search(r'\d+[\.,\']?\d*', cell_str) and len(cell_str) < 15 and cell_str.count('.') <= 1:
                            nominal = self._safe_float(cell_str)
                            break
                
                # Extract price (look specifically for currency symbols or patterns)
                price = None
                try:
                    price_match = re.search(r'(?:[$€£]\s*)(\d+[\.,]?\d*[\.,]?\d*)|(?:(\d+[\.,]?\d*[\.,]?\d*)\s*(?:USD|EUR|CHF|GBP))', row_text)
                    if price_match:
                        price_str = price_match.group(1) or price_match.group(2)
                        price = self._safe_float(price_str)
                except (IndexError, AttributeError):
                    pass
                
                # Extract value (improved pattern matching including currency symbols)
                value = None
                try:
                    # Look for currency symbol followed by number with possible commas/periods
                    value_match = re.search(r'(?:[$€£]\s*)(\d+[\.,]?\d*[\.,]?\d*[\.,]?\d*)|(?:(\d+[\.,]?\d*[\.,]?\d*[\.,]?\d*)\s*(?:USD|EUR|CHF|GBP))', row_text)
                    if value_match:
                        value_str = value_match.group(1) or value_match.group(2)
                        value = self._safe_float(value_str)
                except (IndexError, AttributeError):
                    pass
                
                if value is None:
                    # Try to extract value as last significant number in row
                    for i, cell in enumerate(row):
                        if i+1 < len(row):
                            next_cell = self._safe_str(row[i+1])
                            if next_cell and re.search(r'\d+[\.,]?\d*[\.,]?\d*', next_cell):
                                value = self._safe_float(next_cell)
                                break
                
                # Create new security with safe type handling
                current_security = {
                    'isin': isin,
                    'description': description,
                    'nominal': nominal,
                    'price': price,
                    'page': page_number,
                    'value': value,
                    'details': [row_text]
                }
            
            # If we're processing a security, add details
            elif current_security:
                # Skip empty rows
                if not row_text.strip():
                    continue
                    
                # Add row as details
                current_security['details'].append(row_text)
                
                # Check for maturity date with safe error handling
                try:
                    maturity_match = re.search(r'Maturity:\s*(\d{2}\.\d{2}\.\d{4})', row_text)
                    if maturity_match:
                        current_security['maturity'] = maturity_match.group(1)
                except (IndexError, AttributeError):
                    pass
                
                # Check for coupon with safe error handling
                try:
                    coupon_match = re.search(r'Coupon:.*?(\d+\.?\d*)\s*%', row_text)
                    if coupon_match:
                        coupon_value = self._safe_float(coupon_match.group(1))
                        if coupon_value is not None:
                            current_security['coupon'] = f"{coupon_value}%"
                except (IndexError, AttributeError):
                    pass
                
                # Check for security type with safe error handling
                try:
                    type_match = re.search(r'(Ordinary Bonds|Zero Bonds|Structured Bonds|Bond Funds|Ordinary Stocks|Equities|Stocks|Shares|ETF)', row_text)
                    if type_match:
                        current_security['type'] = self._normalize_text(type_match.group(1))
                except (IndexError, AttributeError):
                    pass
                
                # Also look for additional price or value information in these rows
                # Additional price information
                if 'price' not in current_security or not current_security['price']:
                    try:
                        price_match = re.search(r'(?:price|rate)\s*[:\s]\s*[$€£]?\s*(\d+[\.,]?\d*[\.,]?\d*)', row_text, re.IGNORECASE)
                        if price_match:
                            current_security['price'] = self._safe_float(price_match.group(1))
                    except (IndexError, AttributeError):
                        pass
                
                # Additional value information
                if 'value' not in current_security or not current_security['value']:
                    try:
                        value_match = re.search(r'(?:value|worth|total)\s*[:\s]\s*[$€£]?\s*(\d+[\.,]?\d*[\.,]?\d*[\.,]?\d*)', row_text, re.IGNORECASE)
                        if value_match:
                            current_security['value'] = self._safe_float(value_match.group(1))
                    except (IndexError, AttributeError):
                        pass
        
        # Add the last security if we were processing one
        if current_security:
            securities.append(current_security)
        
        return securities
    
    def _post_process_securities(self, securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Post-process securities to clean up and add additional information.
        
        Args:
            securities: List of securities to process
            
        Returns:
            Processed list of securities
        """
        processed_securities = []
        total_portfolio_value = 0
        
        # First pass - clean values and calculate total portfolio value
        for security in securities:
            # Validate and possibly correct ISIN
            if security.get('isin'):
                # Check if the ISIN is valid
                is_valid = self.securities_db.validate_isin(security['isin'])
                if not is_valid and self.debug:
                    print(f"Warning: Invalid ISIN detected: {security['isin']}")
            
            # Clean up nominal value and convert to float
            if security.get('nominal') is not None:
                security['nominal'] = self._safe_float(security['nominal'])
            
            # Clean up price and convert to float
            if security.get('price') is not None:
                security['price'] = self._safe_float(security['price'])
            
            # Clean up value and convert to float
            if security.get('value') is not None:
                security['value'] = self._safe_float(security['value'])
                if security['value'] is not None:
                    total_portfolio_value += security['value']
        
        # Second pass - extract additional information and cross-validate
        for security in securities:
            # Look up security information in reference database
            if security.get('isin'):
                ref_name = self.securities_db.get_name_by_isin(security['isin'])
                if ref_name and (not security.get('description') or security.get('description').startswith('Securities:')):
                    security['description'] = ref_name
                    security['name_source'] = 'reference_db'
            
            # If we have a description but no ISIN match, try to find a match by name
            elif security.get('description') and not security.get('isin'):
                best_match = self.securities_db.find_best_match_for_name(security['description'])
                if best_match:
                    security['description'] = best_match['name']
                    security['isin'] = best_match['isin']
                    security['ticker'] = best_match.get('ticker')
                    security['name_source'] = 'name_lookup'
            
            # Extract currency with more comprehensive approach
            currency = None
            for detail in security.get('details', []):
                # Look for currency markers in various formats
                # First, check for ISO currency codes
                iso_match = re.search(r'\b(USD|EUR|CHF|GBP|JPY|CAD|AUD|HKD)\b', detail)
                if iso_match:
                    currency = iso_match.group(1)
                    break
                    
                # Next, check for currency symbols
                for symbol, code in self.currency_symbols.items():
                    if symbol in detail:
                        currency = code
                        break
                
                # Also check for currency phrases
                currency_phrase = re.search(r'(?:currency|in)\s+([A-Z]{3})', detail)
                if currency_phrase and currency_phrase.group(1) in ['USD', 'EUR', 'CHF', 'GBP', 'JPY', 'CAD']:
                    currency = currency_phrase.group(1)
                    break
            
            if currency:
                security['currency'] = currency
            else:
                # Get the document default currency from the document type map
                doc_type = self._detect_document_type(pdf_path) if 'pdf_path' in locals() else "generic"
                security['currency'] = self.doc_type_currency_map.get(doc_type, "USD")
                
            # Cross-validate security properties and calculate missing values
            # Ensure all numeric values are properly converted to float using our safe function
            for field in ['nominal', 'price', 'value']:
                if security.get(field) is not None:
                    security[field] = self._safe_float(security[field])
            
            # Calculate missing values based on relationship: quantity * price = value
            if security.get('nominal') is not None and security.get('price') is not None and security.get('value') is None:
                security['value'] = security['nominal'] * security['price']
            elif security.get('nominal') is not None and security.get('price') is None and security.get('value') is not None:
                security['price'] = security['value'] / security['nominal']
            elif security.get('nominal') is None and security.get('price') is not None and security.get('value') is not None:
                security['nominal'] = security['value'] / security['price']
            
            # Validate calculated values for reasonableness
            # Check for extreme values that are likely errors
            if security.get('price') is not None:
                # Price is typically between 0.01 and 10,000 for most securities
                if security['price'] < 0.01 or security['price'] > 50000:
                    # This might be a scale error (e.g., cents vs dollars) or a parsing error
                    if security['price'] < 0.01 and security.get('value') is not None and security.get('nominal') is not None:
                        # Try scaling the price up by 100 and check if it makes more sense
                        adjusted_price = security['price'] * 100
                        if abs(adjusted_price * security['nominal'] - security['value']) < abs(security['price'] * security['nominal'] - security['value']):
                            security['price'] = adjusted_price
                    elif security['price'] > 50000 and security.get('value') is not None and security.get('nominal') is not None:
                        # Try scaling the price down and check if it makes more sense
                        adjusted_price = security['price'] / 100
                        if abs(adjusted_price * security['nominal'] - security['value']) < abs(security['price'] * security['nominal'] - security['value']):
                            security['price'] = adjusted_price
            
            # Cross-check value calculation
            if security.get('nominal') is not None and security.get('price') is not None and security.get('value') is not None:
                calculated_value = security['nominal'] * security['price']
                actual_value = security['value']
                
                # If there's a significant discrepancy, adjust based on confidence
                discrepancy_ratio = calculated_value / actual_value if actual_value != 0 else float('inf')
                
                # If the discrepancy is within a reasonable margin (20%), keep the stored value
                if 0.8 <= discrepancy_ratio <= 1.2:
                    # Values are close enough - no adjustment needed
                    pass
                elif discrepancy_ratio > 10 or discrepancy_ratio < 0.1:
                    # Large discrepancy - determine which is more likely to be correct
                    security['value'] = calculated_value  # Trust the calculated value in case of large discrepancy
                    
                    # Add a flag for human review
                    security['value_discrepancy'] = True
            
            # Extract more accurate description from details (if not already set from reference DB)
            if (not security.get('description') or security.get('description').startswith('Securities:')) and not security.get('name_source'):
                # Look for company names in the details section
                company_name = None
                for detail in security.get('details', []):
                    # Look for typical company names and formats
                    name_match = re.search(r'([A-Z][A-Za-z0-9\s\.\&\-]+(?:Corp|Inc|Ltd|LLC|SA|AG|NV|ETF|Fund|Trust|PLC|Group|Holding|Tech|Co))', detail)
                    if name_match and security['isin'] not in name_match.group(1) and len(name_match.group(1)) > 5:
                        company_name = name_match.group(1).strip()
                        break
                    # Alternative pattern for company tickers
                    ticker_match = re.search(r'\b([A-Z]{2,5})\b(?!\d)', detail)
                    # Only set ticker if we don't have a company name yet
                    if not company_name and ticker_match and ticker_match.group(1) not in ['ISIN', 'USD', 'EUR', 'CHF', 'GBP', 'JPY']:
                        company_name = ticker_match.group(1).strip()
                
                if company_name:
                    security['description'] = company_name
                else:
                    # If no company name pattern is found, use a longer text segment without ISIN
                    for detail in security.get('details', []):
                        if len(detail) > 20 and security['isin'] not in detail and 'ISIN:' not in detail:
                            security['description'] = detail.strip()
                            break
            
            # Normalize security description if we have one
            if security.get('description'):
                # First normalize using our method
                security['description'] = self._normalize_text(security['description'])
                # Then use the database's specialized normalization if available
                if security['description']:
                    security['description'] = self.securities_db.normalize_security_name(security['description'])
            
            # Detect security type if not already present
            if not security.get('type') and security.get('description'):
                detected_type = self.securities_db.detect_security_type(security['description'])
                if detected_type:
                    security['type'] = detected_type
            
            # Calculate weight/percentage if we have all values
            if security.get('value') is not None and total_portfolio_value > 0:
                security['weight'] = round((security['value'] / total_portfolio_value) * 100, 2)
                
            processed_securities.append(security)
            
        # Normalize weights to ensure they sum to 100%
        total_weight = sum(s.get('weight', 0) for s in processed_securities)
        if total_weight > 0:
            for security in processed_securities:
                if 'weight' in security:
                    security['weight'] = round((security['weight'] / total_weight) * 100, 2)
        
        # Add validation statistics to help identify potential issues
        total_securities = len(processed_securities)
        securities_with_value = sum(1 for s in processed_securities if s.get('value') is not None)
        securities_with_price = sum(1 for s in processed_securities if s.get('price') is not None)
        securities_with_nominal = sum(1 for s in processed_securities if s.get('nominal') is not None)
        securities_with_all = sum(1 for s in processed_securities if s.get('value') is not None and s.get('price') is not None and s.get('nominal') is not None)
        securities_with_discrepancy = sum(1 for s in processed_securities if s.get('value_discrepancy', False))
        
        # Calculate true total portfolio value (sum of all security values)
        actual_total_value = sum(s.get('value', 0) for s in processed_securities)
        
        # Re-verify total portfolio value for consistency
        if abs(actual_total_value - total_portfolio_value) > actual_total_value * 0.2:  # More than 20% difference
            # The total is likely incorrect, adjust it
            total_portfolio_value = actual_total_value
            
            # Recalculate weights with corrected total
            if total_portfolio_value > 0:
                for security in processed_securities:
                    if security.get('value') is not None:
                        security['weight'] = round((security['value'] / total_portfolio_value) * 100, 2)
        
        # Add portfolio summary to the first security for debugging
        if processed_securities and self.debug:
            processed_securities[0]['_portfolio_stats'] = {
                'total_securities': total_securities,
                'with_value': securities_with_value,
                'with_price': securities_with_price,
                'with_nominal': securities_with_nominal,
                'with_all_values': securities_with_all,
                'with_discrepancies': securities_with_discrepancy,
                'total_portfolio_value': total_portfolio_value
            }
        
        return processed_securities
    
    @track_extraction_performance
    def _extract_generic(self, pdf_path: str) -> Dict[str, Any]:
        """
        Generic extraction for other document types.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary containing extracted information
        """
        # Initialize default result structure
        default_result = {
            "document_type": "generic",
            "currency": "USD",  # Default currency
            "securities": [],
            "error": None
        }
        
        try:
            # Validate input
            if not pdf_path or not isinstance(pdf_path, str):
                default_result["error"] = "Invalid PDF path provided to _extract_generic"
                return default_result
                
            # Check if file exists
            if not os.path.exists(pdf_path):
                default_result["error"] = f"PDF file not found: {pdf_path}"
                return default_result
            
            if self.debug:
                print(f"Extracting from generic PDF: {pdf_path}")
            
            # Detect document type with error handling
            try:
                doc_type = self._detect_document_type(pdf_path)
                default_result["document_type"] = doc_type
            except Exception as e:
                if self.debug:
                    print(f"Error detecting document type: {str(e)}")
                # Continue with default document type
                
            # Get document currency with error handling
            try:
                currency = self._get_document_currency(pdf_path, default_result["document_type"])
                default_result["currency"] = currency
            except Exception as e:
                if self.debug:
                    print(f"Error detecting currency: {str(e)}")
                # Continue with default currency from the document type map
                default_result["currency"] = self.doc_type_currency_map.get(default_result["document_type"], "USD")
            
            # Extract tables from all pages with error handling
            try:
                tables = camelot.read_pdf(
                    pdf_path,
                    pages='all',
                    flavor='stream',
                    suppress_stdout=True
                )
                
                # Process tables to find securities
                for i, table in enumerate(tables):
                    try:
                        # Convert to pandas DataFrame
                        df = table.df
                        
                        # Check if this is a securities table by looking for ISIN
                        table_text = ' '.join([' '.join(self._safe_str(cell) for cell in row) for row in df.values.tolist()])
                        if 'ISIN' in table_text:
                            # Extract securities from this table
                            securities = self._extract_securities_from_generic_table(df, table.page)
                            default_result["securities"].extend(securities)
                    except Exception as table_error:
                        if self.debug:
                            print(f"Error processing table {i} on page {table.page}: {str(table_error)}")
                        # Continue with next table
                        continue
                        
            except Exception as e:
                default_result["error"] = f"Error extracting tables from PDF: {str(e)}"
                # Return what we have so far
                return default_result
            
            # Post-process securities for consistency
            try:
                if default_result["securities"]:
                    default_result["securities"] = self._post_process_securities(default_result["securities"])
            except Exception as e:
                default_result["error"] = f"Error post-processing securities: {str(e)}"
                # Continue with unprocessed securities
                
            return default_result
            
        except Exception as e:
            # Catch any unexpected errors
            default_result["error"] = f"Unexpected error in generic extraction: {str(e)}"
            return default_result
    
    def _extract_securities_from_generic_table(self, df: pd.DataFrame, page_number: int) -> List[Dict[str, Any]]:
        """
        Extract securities from a generic table.
        
        Args:
            df: Pandas DataFrame containing the table
            page_number: Page number of the table
            
        Returns:
            List of dictionaries containing securities information
        """
        securities = []
        
        try:
            # Validate input
            if not isinstance(df, pd.DataFrame) or df.empty:
                if self.debug:
                    print(f"Invalid or empty DataFrame provided to _extract_securities_from_generic_table on page {page_number}")
                return securities
                
            if not isinstance(page_number, int) or page_number < 0:
                page_number = 0  # Default page number if invalid
                if self.debug:
                    print("Invalid page number provided, using default of 0")
            
            # Convert DataFrame to list of rows with error handling
            try:
                rows = df.values.tolist()
            except Exception as e:
                if self.debug:
                    print(f"Error converting DataFrame to list: {str(e)}")
                return securities
            
            # Process rows to extract securities
            for row_idx, row in enumerate(rows):
                try:
                    # Create row_text with safe string conversion for each cell
                    try:
                        row_text = ' '.join(self._safe_str(cell) for cell in row if cell is not None)
                    except Exception as join_error:
                        if self.debug:
                            print(f"Error joining row {row_idx} text: {str(join_error)}")
                        row_text = str(row)  # Fallback to simple string representation
                    
                    # Check if this row contains an ISIN
                    try:
                        isin_match = re.search(r'(?:ISIN|isin)[:\s]*([A-Z]{2}[A-Z0-9]{9}[0-9])', row_text, re.IGNORECASE)
                    except Exception as regex_error:
                        if self.debug:
                            print(f"Error in ISIN regex search: {str(regex_error)}")
                        continue  # Skip this row if regex fails
                    
                    if isin_match:
                        isin = isin_match.group(1)
                        
                        # Validate ISIN format
                        if not re.match(r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$', isin):
                            if self.debug:
                                print(f"Invalid ISIN format detected: {isin}")
                            continue  # Skip this row if ISIN format is invalid
                        
                        # Create new security
                        security = {
                            'isin': isin,
                            'page': page_number,
                            'details': [row_text]
                        }
                        
                        # Extract other information with error handling
                        for i, cell in enumerate(row):
                            try:
                                # Convert cell to string safely
                                cell_str = self._safe_str(cell)
                                if not cell_str or not cell_str.strip():
                                    continue
                                
                                # Skip the cell with the ISIN
                                if isin in cell_str:
                                    continue
                                
                                # Try to identify what this cell contains with safe regex handling
                                try:
                                    if re.search(r'\d{2}\.\d{2}\.\d{4}', cell_str):
                                        maturity_match = re.search(r'\d{2}\.\d{2}\.\d{4}', cell_str)
                                        if maturity_match:
                                            security['maturity'] = maturity_match.group(0)
                                except Exception as re_error:
                                    if self.debug:
                                        print(f"Error in maturity regex: {str(re_error)}")
                                
                                try:
                                    if re.search(r'\d+\.?\d*\s*%', cell_str):
                                        coupon_match = re.search(r'\d+\.?\d*\s*%', cell_str)
                                        if coupon_match:
                                            security['coupon'] = coupon_match.group(0)
                                except Exception as re_error:
                                    if self.debug:
                                        print(f"Error in coupon regex: {str(re_error)}")
                                
                                try:
                                    if re.search(r'\d+\'?\d*\'?\d*', cell_str) and len(cell_str) < 15:
                                        security['nominal'] = self._safe_str(cell_str.strip().replace("'", ""))
                                except Exception as re_error:
                                    if self.debug:
                                        print(f"Error in nominal regex: {str(re_error)}")
                                
                                try:
                                    if len(cell_str) > 10 and 'description' not in security:
                                        security['description'] = self._normalize_text(cell_str)
                                except Exception as e:
                                    if self.debug:
                                        print(f"Error setting description: {str(e)}")
                                
                            except Exception as cell_error:
                                if self.debug:
                                    print(f"Error processing cell {i} in row {row_idx}: {str(cell_error)}")
                                continue  # Skip this cell if processing fails
                        
                        securities.append(security)
                        
                except Exception as row_error:
                    if self.debug:
                        print(f"Error processing row {row_idx}: {str(row_error)}")
                    continue  # Skip this row if processing fails
            
            # Validate extracted securities (add consistency checks)
            for sec_idx, security in enumerate(securities):
                try:
                    # Ensure required fields are present
                    if 'isin' not in security or not security['isin']:
                        if self.debug:
                            print(f"Security at index {sec_idx} is missing ISIN")
                        continue
                        
                    # If we have a numerical value, ensure it's properly formatted
                    if 'nominal' in security and security['nominal'] is not None:
                        try:
                            security['nominal'] = self._safe_float(security['nominal'])
                        except Exception:
                            pass  # Keep as string if conversion fails
                        
                except Exception as sec_error:
                    if self.debug:
                        print(f"Error validating security at index {sec_idx}: {str(sec_error)}")
            
            return securities
            
        except Exception as e:
            # Catch any unexpected errors
            if self.debug:
                print(f"Unexpected error in _extract_securities_from_generic_table: {str(e)}")
            return securities

def configure_file_logging(log_file_path: str) -> None:
    """
    Configure file logging for the securities extractor.
    
    Args:
        log_file_path: Path to the log file
    """
    # Create file handler
    file_handler = logging.FileHandler(log_file_path)
    file_handler.setLevel(logging.DEBUG)  # Set to DEBUG to capture all logs
    
    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    
    # Add the handler to the logger
    logger.addHandler(file_handler)
    logger.info(f"File logging configured to {log_file_path}")

def main():
    """
    Main function for testing the SecurityExtractor.
    """
    # Find the messos PDF file
    pdf_path = None
    for root, dirs, files in os.walk('.'):
        for file in files:
            if 'messos' in file.lower() and file.lower().endswith('.pdf'):
                pdf_path = os.path.join(root, file)
                break
        if pdf_path:
            break
    
    if not pdf_path:
        print("Could not find the messos PDF file. Please provide the path:")
        pdf_path = input("> ")
    
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return
    
    # Set up logging to file
    configure_file_logging('securities_extraction.log')
    
    # Extract securities
    extractor = SecurityExtractor(debug=True, log_level="DEBUG")
    result = extractor.extract_from_pdf(pdf_path)
    
    # Save results
    output_path = 'messos_enhanced.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"Saved results to {output_path}")
    
    # Print summary
    print("\nDocument Type:", result["document_type"])
    
    if "portfolio_summary" in result:
        print("\nPortfolio Summary:")
        for key, value in result["portfolio_summary"].items():
            print(f"  {key}: {value}")
    
    if "asset_allocation" in result:
        print("\nAsset Allocation:")
        for key, value in result["asset_allocation"].items():
            if value:
                print(f"  {key}: {value.get('value', 'N/A')} ({value.get('percentage', 'N/A')})")
    
    print(f"\nFound {len(result['securities'])} securities")
    
    # Print first 3 securities as example
    for i, security in enumerate(result["securities"][:3]):
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
