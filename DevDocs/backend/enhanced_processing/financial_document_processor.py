"""
Financial Document Processor

This module provides a comprehensive solution for processing financial documents.
It extracts text, tables, securities (ISINs), and other financial information from PDFs.

Features:
- Text extraction using pdfminer.six
- Table extraction using camelot-py
- Securities (ISINs) extraction using regex
- Financial metrics calculation
- Multi-language support
- Error handling and logging
- Document caching for improved performance
- Batch processing support
"""

import os
import re
import json
import time
import logging
import tempfile
import hashlib
import decimal
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Union
from io import StringIO
from functools import lru_cache
from decimal import Decimal
from datetime import datetime

# Try to import NLP libraries
try:
    import nltk
    from nltk.tokenize import sent_tokenize, word_tokenize
    from nltk.tag import pos_tag
    from nltk.chunk import ne_chunk
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    logging.warning("NLTK not available. Advanced NLP features will be disabled.")

try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    logging.warning("spaCy not available. Advanced NLP features will be limited.")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class FinancialDocumentProcessor:
    """
    Financial Document Processor for extracting information from financial PDFs.
    """

    # Class-level cache for processed documents
    _cache = {}

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the Financial Document Processor.

        Args:
            config: Configuration dictionary with the following options:
                - languages: List of languages to use for OCR (default: ['eng'])
                - extract_tables: Whether to extract tables (default: True)
                - extract_securities: Whether to extract securities (default: True)
                - extract_metrics: Whether to extract financial metrics (default: True)
                - output_format: Output format (default: 'json')
                - temp_dir: Temporary directory for processing (default: system temp dir)
                - cache_enabled: Whether to enable caching (default: True)
                - cache_dir: Directory for cache files (default: system temp dir + '/cache')
                - cache_max_size: Maximum number of documents to cache (default: 100)
                - batch_size: Number of documents to process in a batch (default: 10)
        """
        self.config = config or {}
        self.languages = self.config.get('languages', ['eng'])
        self.extract_tables = self.config.get('extract_tables', True)
        self.extract_securities = self.config.get('extract_securities', True)
        self.extract_metrics = self.config.get('extract_metrics', True)
        self.output_format = self.config.get('output_format', 'json')
        self.temp_dir = self.config.get('temp_dir', tempfile.gettempdir())
        self.cache_enabled = self.config.get('cache_enabled', True)
        self.cache_dir = self.config.get('cache_dir', os.path.join(self.temp_dir, 'cache'))
        self.cache_max_size = self.config.get('cache_max_size', 100)
        self.batch_size = self.config.get('batch_size', 10)

        # Create temp directory if it doesn't exist
        os.makedirs(self.temp_dir, exist_ok=True)

        # Create cache directory if caching is enabled
        if self.cache_enabled:
            os.makedirs(self.cache_dir, exist_ok=True)

        logger.info(f"Initialized Financial Document Processor with config: {self.config}")

    def _get_document_hash(self, pdf_path: str) -> str:
        """
        Get a hash of the document content for caching.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Hash of the document content
        """
        try:
            with open(pdf_path, 'rb') as f:
                content = f.read()
                return hashlib.md5(content).hexdigest()
        except Exception as e:
            logger.error(f"Error getting document hash: {e}")
            # Use the file path as a fallback
            return hashlib.md5(pdf_path.encode()).hexdigest()

    def _get_cache_key(self, pdf_path: str) -> str:
        """
        Get a cache key for the document.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Cache key
        """
        # Get document hash
        doc_hash = self._get_document_hash(pdf_path)

        # Create a key based on the document hash and configuration
        config_str = json.dumps({
            'languages': self.languages,
            'extract_tables': self.extract_tables,
            'extract_securities': self.extract_securities,
            'extract_metrics': self.extract_metrics
        }, sort_keys=True)

        return f"{doc_hash}_{hashlib.md5(config_str.encode()).hexdigest()}"

    def _get_cache_path(self, cache_key: str) -> str:
        """
        Get the path to the cache file.

        Args:
            cache_key: Cache key

        Returns:
            Path to the cache file
        """
        return os.path.join(self.cache_dir, f"{cache_key}.json")

    def _get_from_cache(self, pdf_path: str) -> Optional[Dict[str, Any]]:
        """
        Get results from cache.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Cached results or None if not found
        """
        if not self.cache_enabled:
            return None

        # Get cache key
        cache_key = self._get_cache_key(pdf_path)

        # Check in-memory cache first
        if cache_key in self._cache:
            logger.info(f"Cache hit (memory): {pdf_path}")
            return self._cache[cache_key]

        # Check file cache
        cache_path = self._get_cache_path(cache_key)
        if os.path.exists(cache_path):
            try:
                with open(cache_path, 'r', encoding='utf-8') as f:
                    results = json.load(f)

                # Add to in-memory cache
                self._cache[cache_key] = results

                logger.info(f"Cache hit (file): {pdf_path}")
                return results
            except Exception as e:
                logger.error(f"Error reading cache file: {e}")

        return None

    def _save_to_cache(self, pdf_path: str, results: Dict[str, Any]) -> None:
        """
        Save results to cache.

        Args:
            pdf_path: Path to the PDF file
            results: Processing results
        """
        if not self.cache_enabled:
            return

        # Get cache key
        cache_key = self._get_cache_key(pdf_path)

        # Save to in-memory cache
        self._cache[cache_key] = results

        # Limit in-memory cache size
        if len(self._cache) > self.cache_max_size:
            # Remove oldest entry
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]

        # Save to file cache
        cache_path = self._get_cache_path(cache_key)
        try:
            with open(cache_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2)

            logger.info(f"Saved to cache: {pdf_path}")
        except Exception as e:
            logger.error(f"Error saving to cache: {e}")

    def process(self, pdf_path: str, output_dir: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a financial document.

        Args:
            pdf_path: Path to the PDF file
            output_dir: Directory to save the results (default: None)

        Returns:
            Dictionary with processing results
        """
        try:
            logger.info(f"Processing financial document: {pdf_path}")

            # Check cache first
            if self.cache_enabled:
                cached_results = self._get_from_cache(pdf_path)
                if cached_results:
                    logger.info(f"Using cached results for {pdf_path}")

                    # Save results to output directory if provided
                    if output_dir:
                        os.makedirs(output_dir, exist_ok=True)
                        self._save_results(cached_results, output_dir)

                    return cached_results

            # Create output directory if it doesn't exist
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)

            # Start timer
            start_time = time.time()

            # Extract text from PDF
            text_result = self._extract_text(pdf_path)

            # Extract tables if enabled
            table_result = None
            if self.extract_tables:
                table_result = self._extract_tables(pdf_path)

            # Extract securities if enabled
            securities_result = None
            if self.extract_securities:
                securities_result = self._extract_securities(text_result['text'], table_result['tables'] if table_result else None)

            # Extract financial metrics if enabled
            metrics_result = None
            if self.extract_metrics:
                metrics_result = self._extract_metrics(text_result['text'], securities_result)

            # Calculate processing time
            processing_time = time.time() - start_time

            # Create results object
            results = {
                'pdf_path': pdf_path,
                'processing_time': processing_time,
                'text_result': text_result,
                'table_result': table_result,
                'securities_result': securities_result,
                'metrics_result': metrics_result
            }

            # Save results to output directory if provided
            if output_dir:
                self._save_results(results, output_dir)

            # Save to cache if enabled
            if self.cache_enabled:
                self._save_to_cache(pdf_path, results)

            logger.info(f"Finished processing financial document: {pdf_path} in {processing_time:.2f} seconds")

            return results

        except Exception as e:
            logger.error(f"Error processing financial document: {e}")
            import traceback
            logger.error(traceback.format_exc())

            # Return error result
            return {
                'pdf_path': pdf_path,
                'error': str(e),
                'traceback': traceback.format_exc()
            }

    def process_batch(self, pdf_paths: List[str], output_dir: Optional[str] = None,
                     callback: Optional[callable] = None) -> List[Dict[str, Any]]:
        """
        Process a batch of financial documents.

        Args:
            pdf_paths: List of paths to PDF files
            output_dir: Directory to save the results (default: None)
            callback: Callback function to report progress (default: None)
                     The callback function should accept the following parameters:
                     - current_index: Current document index
                     - total_count: Total number of documents
                     - current_document: Current document path
                     - status: Processing status ('processing', 'completed', 'error')
                     - result: Processing result (None for 'processing' status)

        Returns:
            List of dictionaries with processing results
        """
        results = []
        total_count = len(pdf_paths)

        logger.info(f"Processing batch of {total_count} documents")

        # Create output directory if it doesn't exist
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)

        # Process documents in batches
        for i, pdf_path in enumerate(pdf_paths):
            # Report progress
            if callback:
                callback(i, total_count, pdf_path, 'processing', None)

            try:
                # Process document
                result = self.process(pdf_path, output_dir)

                # Add result to results list
                results.append(result)

                # Report progress
                if callback:
                    callback(i, total_count, pdf_path, 'completed', result)

            except Exception as e:
                logger.error(f"Error processing document {pdf_path}: {e}")
                import traceback
                logger.error(traceback.format_exc())

                # Create error result
                error_result = {
                    'pdf_path': pdf_path,
                    'error': str(e),
                    'traceback': traceback.format_exc()
                }

                # Add error result to results list
                results.append(error_result)

                # Report progress
                if callback:
                    callback(i, total_count, pdf_path, 'error', error_result)

        logger.info(f"Finished processing batch of {total_count} documents")

        return results

    def _extract_text(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract text from a PDF file using pdfminer.six.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary with text extraction results
        """
        try:
            # Import pdfminer.six
            from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
            from pdfminer.converter import TextConverter
            from pdfminer.layout import LAParams
            from pdfminer.pdfpage import PDFPage

            logger.info(f"Extracting text from PDF: {pdf_path}")

            # Create a PDF resource manager
            resource_manager = PDFResourceManager()

            # Create a string buffer for the output
            output_string = StringIO()

            # Create a text converter
            converter = TextConverter(resource_manager, output_string, laparams=LAParams())

            # Create a PDF page interpreter
            interpreter = PDFPageInterpreter(resource_manager, converter)

            # Process each page
            all_text = ""
            page_texts = []

            with open(pdf_path, 'rb') as file:
                for page_num, page in enumerate(PDFPage.get_pages(file)):
                    logger.info(f"Extracting text from page {page_num+1}")

                    # Process the page
                    interpreter.process_page(page)

                    # Get the text from the output string
                    text = output_string.getvalue()

                    # Clear the output string for the next page
                    output_string.truncate(0)
                    output_string.seek(0)

                    # Add the text to the combined text
                    all_text += text + "\n\n"

                    # Add the text to the page texts
                    page_texts.append({
                        'page_num': page_num + 1,
                        'text': text
                    })

            # Close the converter
            converter.close()

            # Create text extraction result
            result = {
                'text': all_text,
                'page_texts': page_texts,
                'page_count': len(page_texts),
                'char_count': len(all_text),
                'word_count': len(all_text.split())
            }

            logger.info(f"Extracted {result['char_count']} characters from {result['page_count']} pages")

            return result

        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            import traceback
            logger.error(traceback.format_exc())

            # Return error result
            return {
                'error': str(e),
                'traceback': traceback.format_exc()
            }

    def _extract_tables(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract tables from a PDF file.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary with table extraction results
        """
        try:
            # Try to import camelot-py
            try:
                import camelot
            except ImportError:
                logger.warning("camelot-py not installed. Falling back to tabula-py.")
                try:
                    import tabula
                except ImportError:
                    logger.error("Neither camelot-py nor tabula-py is installed. Cannot extract tables.")
                    return {
                        'error': "Table extraction libraries not installed",
                        'tables': []
                    }

            logger.info(f"Extracting tables from PDF: {pdf_path}")

            # Extract tables using camelot-py if available
            if 'camelot' in locals():
                tables = camelot.read_pdf(pdf_path, pages='all', flavor='lattice')

                # Convert tables to list of dictionaries
                table_list = []
                for i, table in enumerate(tables):
                    table_list.append({
                        'table_num': i + 1,
                        'page_num': table.page,
                        'data': table.data,
                        'shape': table.shape,
                        'accuracy': table.accuracy,
                        'whitespace': table.whitespace,
                        'html': table.df.to_html()
                    })

            # Extract tables using tabula-py if camelot-py is not available
            elif 'tabula' in locals():
                tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)

                # Convert tables to list of dictionaries
                table_list = []
                for i, table in enumerate(tables):
                    table_list.append({
                        'table_num': i + 1,
                        'data': table.values.tolist(),
                        'shape': table.shape,
                        'html': table.to_html()
                    })

            # Create table extraction result
            result = {
                'tables': table_list,
                'table_count': len(table_list)
            }

            logger.info(f"Extracted {result['table_count']} tables from PDF")

            return result

        except Exception as e:
            logger.error(f"Error extracting tables: {e}")
            import traceback
            logger.error(traceback.format_exc())

            # Return error result
            return {
                'error': str(e),
                'traceback': traceback.format_exc(),
                'tables': []
            }

    def _extract_securities(self, text: str, tables: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Extract securities (ISINs) from text and tables.

        Args:
            text: Input text
            tables: List of extracted tables (optional)

        Returns:
            Dictionary with securities extraction results
        """
        try:
            logger.info("Extracting securities from text and tables")

            # ISIN pattern: 2 letters followed by 9 alphanumeric characters and a check digit
            isin_pattern = r'\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b'

            # Find all ISINs in text
            isins_in_text = re.findall(isin_pattern, text)

            # Create securities list
            securities = []

            # Process ISINs found in text
            for isin in isins_in_text:
                # Extract context (text around the ISIN)
                isin_index = text.find(isin)
                start_index = max(0, isin_index - 100)
                end_index = min(len(text), isin_index + len(isin) + 100)
                context = text[start_index:end_index]

                # Extract financial data using NLP
                financial_data = self._extract_financial_data_for_isin(isin, context)

                # Add security to list
                security_info = {
                    'isin': isin,
                    'context': context,
                    'source': 'text'
                }

                # Add extracted financial data
                security_info.update(financial_data)

                securities.append(security_info)

            # Process ISINs in tables if available
            if tables:
                for table_idx, table in enumerate(tables):
                    if 'data' in table:
                        # Convert table data to string for ISIN search
                        table_text = str(table['data'])

                        # Find ISINs in table
                        isins_in_table = re.findall(isin_pattern, table_text)

                        for isin in isins_in_table:
                            # Check if ISIN already processed
                            if isin in [s['isin'] for s in securities]:
                                continue

                            # Extract financial data from table for this ISIN
                            financial_data = self._extract_financial_data_from_table(isin, table)

                            # Add security to list
                            security_info = {
                                'isin': isin,
                                'context': f"Found in table {table_idx + 1}",
                                'source': 'table'
                            }

                            # Add extracted financial data
                            security_info.update(financial_data)

                            securities.append(security_info)

            # Create securities extraction result
            result = {
                'securities': securities,
                'security_count': len(securities)
            }

            logger.info(f"Extracted {result['security_count']} securities from text and tables")

            return result

        except Exception as e:
            logger.error(f"Error extracting securities: {e}")
            import traceback
            logger.error(traceback.format_exc())

            # Return error result
            return {
                'error': str(e),
                'traceback': traceback.format_exc(),
                'securities': []
            }

    def _extract_financial_data_for_isin(self, isin: str, context: str) -> Dict[str, Any]:
        """
        Extract financial data for a security using NLP techniques.

        Args:
            isin: ISIN code
            context: Text context around the ISIN

        Returns:
            Dictionary with extracted financial data
        """
        financial_data = {}

        try:
            # Extract price
            price_info = self._extract_price(context)
            if price_info:
                financial_data['price'] = price_info

            # Extract quantity
            quantity = self._extract_quantity(context)
            if quantity:
                financial_data['quantity'] = quantity

            # Extract currency
            currency = self._extract_currency(context)
            if currency:
                financial_data['currency'] = currency

            # Extract security type
            security_type = self._extract_security_type(context)
            if security_type:
                financial_data['security_type'] = security_type

            # Extract dates
            dates = self._extract_dates(context)
            if dates:
                financial_data['dates'] = dates

            # Extract security name
            name = self._extract_security_name(context, isin)
            if name:
                financial_data['name'] = name

            # Use advanced NLP if available
            if SPACY_AVAILABLE or NLTK_AVAILABLE:
                nlp_data = self._extract_data_with_nlp(context, isin)
                # Update with NLP data, but don't overwrite existing data
                for key, value in nlp_data.items():
                    if key not in financial_data:
                        financial_data[key] = value

            return financial_data

        except Exception as e:
            logger.error(f"Error extracting financial data for ISIN {isin}: {e}")
            return {}

    def _extract_financial_data_from_table(self, isin: str, table: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract financial data for a security from a table.

        Args:
            isin: ISIN code
            table: Table data

        Returns:
            Dictionary with extracted financial data
        """
        financial_data = {}

        try:
            if 'data' not in table:
                return financial_data

            table_data = table['data']

            # Find row and column containing the ISIN
            isin_row = -1
            isin_col = -1

            for i, row in enumerate(table_data):
                for j, cell in enumerate(row):
                    if isinstance(cell, str) and isin in cell:
                        isin_row = i
                        isin_col = j
                        break
                if isin_row >= 0:
                    break

            if isin_row < 0:
                return financial_data

            # Try to identify header row
            header_row = 0
            if isin_row > 0:
                # Assume the first row is the header
                header_row = 0

            # Extract data based on headers
            headers = table_data[header_row]

            # Common header patterns
            price_headers = ['price', 'kurs', 'cours', 'preis', 'valor', 'value per unit', 'unit price']
            quantity_headers = ['quantity', 'qty', 'amount', 'anzahl', 'nombre', 'units', 'shares']
            currency_headers = ['currency', 'ccy', 'währung', 'devise', 'valuta']
            value_headers = ['value', 'total', 'market value', 'valuation', 'bewertung', 'évaluation', 'amount']
            name_headers = ['name', 'description', 'security', 'title', 'bezeichnung', 'designation', 'instrument']
            type_headers = ['type', 'asset class', 'class', 'kategorie', 'category', 'asset type']

            # Extract data based on headers
            for j, header in enumerate(headers):
                if not isinstance(header, str):
                    continue

                header_lower = header.lower()
                cell_value = table_data[isin_row][j] if j < len(table_data[isin_row]) else None

                if not cell_value or not isinstance(cell_value, str):
                    continue

                # Extract price
                if any(ph in header_lower for ph in price_headers):
                    price_info = self._extract_price(cell_value)
                    if price_info:
                        financial_data['price'] = price_info

                # Extract quantity
                elif any(qh in header_lower for qh in quantity_headers):
                    quantity = self._extract_quantity(cell_value)
                    if quantity:
                        financial_data['quantity'] = quantity

                # Extract currency
                elif any(ch in header_lower for ch in currency_headers):
                    currency = self._extract_currency(cell_value)
                    if currency:
                        financial_data['currency'] = currency

                # Extract value
                elif any(vh in header_lower for vh in value_headers):
                    value_info = self._extract_price(cell_value)  # Reuse price extraction for value
                    if value_info:
                        financial_data['value'] = value_info

                # Extract name
                elif any(nh in header_lower for nh in name_headers):
                    financial_data['name'] = cell_value.strip()

                # Extract security type
                elif any(th in header_lower for th in type_headers):
                    financial_data['security_type'] = cell_value.strip()

            return financial_data

        except Exception as e:
            logger.error(f"Error extracting financial data from table for ISIN {isin}: {e}")
            return {}

    def _extract_price(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Extract price information from text.

        Args:
            text: Input text

        Returns:
            Dictionary with price value and currency, or None if not found
        """
        try:
            # Price patterns
            # Match patterns like: 100.50, 1,234.56, 1.234,56, 1 234,56
            price_patterns = [
                r'(\d{1,3}(?:,\d{3})*\.\d+)',  # 1,234.56
                r'(\d{1,3}(?:\.\d{3})*,\d+)',  # 1.234,56
                r'(\d{1,3}(?: \d{3})*\.\d+)',  # 1 234.56
                r'(\d{1,3}(?: \d{3})*,\d+)',   # 1 234,56
                r'(\d+\.\d+)',                 # 100.50
                r'(\d+,\d+)'                   # 100,50
            ]

            # Currency patterns
            currency_patterns = {
                'USD': [r'\$', r'USD', r'US\$', r'US dollars?'],
                'EUR': [r'€', r'EUR', r'euros?'],
                'GBP': [r'£', r'GBP', r'pounds?'],
                'JPY': [r'¥', r'JPY', r'yens?'],
                'CHF': [r'CHF', r'Swiss francs?'],
                'CAD': [r'CAD', r'Canadian dollars?'],
                'AUD': [r'AUD', r'Australian dollars?'],
                'CNY': [r'CNY', r'RMB', r'yuan', r'renminbi']
            }

            # Find price
            price_value = None
            for pattern in price_patterns:
                matches = re.findall(pattern, text)
                if matches:
                    # Take the first match
                    price_str = matches[0] if isinstance(matches[0], str) else matches[0][0]

                    # Clean and convert to decimal
                    price_str = price_str.replace(' ', '').replace(',', '.').replace('.', '.', 1)

                    # Handle multiple decimal points (keep only the last one)
                    if price_str.count('.') > 1:
                        parts = price_str.split('.')
                        price_str = ''.join(parts[:-1]) + '.' + parts[-1]

                    try:
                        price_value = float(price_str)
                        break
                    except ValueError:
                        continue

            if not price_value:
                return None

            # Find currency
            currency = None
            for curr, patterns in currency_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, text, re.IGNORECASE):
                        currency = curr
                        break
                if currency:
                    break

            return {
                'value': price_value,
                'currency': currency
            }

        except Exception as e:
            logger.error(f"Error extracting price: {e}")
            return None

    def _extract_quantity(self, text: str) -> Optional[float]:
        """
        Extract quantity information from text.

        Args:
            text: Input text

        Returns:
            Quantity as float, or None if not found
        """
        try:
            # Quantity patterns
            # Match patterns like: 100, 1,234, 1.234, 1 234
            quantity_patterns = [
                r'(\d{1,3}(?:,\d{3})*)',  # 1,234
                r'(\d{1,3}(?:\.\d{3})*)',  # 1.234
                r'(\d{1,3}(?: \d{3})*)',   # 1 234
                r'(\d+)'                   # 100
            ]

            # Quantity indicators
            quantity_indicators = [
                r'shares?', r'units?', r'pieces?', r'quantity', r'qty', r'amount',
                r'stücke?', r'anzahl', r'menge', r'unités?', r'quantité'
            ]

            # Find quantity with indicators
            for indicator in quantity_indicators:
                # Look for patterns like "1,234 shares" or "quantity: 1,234"
                for pattern in quantity_patterns:
                    combined_pattern = f"{pattern}\\s*{indicator}"
                    matches = re.findall(combined_pattern, text, re.IGNORECASE)
                    if matches:
                        # Take the first match
                        qty_str = matches[0] if isinstance(matches[0], str) else matches[0][0]

                        # Clean and convert to float
                        qty_str = qty_str.replace(' ', '').replace(',', '')

                        try:
                            return float(qty_str)
                        except ValueError:
                            continue

                    # Also look for patterns like "shares: 1,234"
                    combined_pattern = f"{indicator}\\s*[:-]\\s*{pattern}"
                    matches = re.findall(combined_pattern, text, re.IGNORECASE)
                    if matches:
                        # Take the first match
                        qty_str = matches[0] if isinstance(matches[0], str) else matches[0][-1]

                        # Clean and convert to float
                        qty_str = qty_str.replace(' ', '').replace(',', '')

                        try:
                            return float(qty_str)
                        except ValueError:
                            continue

            return None

        except Exception as e:
            logger.error(f"Error extracting quantity: {e}")
            return None

    def _extract_currency(self, text: str) -> Optional[str]:
        """
        Extract currency information from text.

        Args:
            text: Input text

        Returns:
            Currency code, or None if not found
        """
        try:
            # Currency patterns
            currency_patterns = {
                'USD': [r'\$', r'USD', r'US\$', r'US dollars?'],
                'EUR': [r'€', r'EUR', r'euros?'],
                'GBP': [r'£', r'GBP', r'pounds?'],
                'JPY': [r'¥', r'JPY', r'yens?'],
                'CHF': [r'CHF', r'Swiss francs?'],
                'CAD': [r'CAD', r'Canadian dollars?'],
                'AUD': [r'AUD', r'Australian dollars?'],
                'CNY': [r'CNY', r'RMB', r'yuan', r'renminbi']
            }

            # Find currency
            for curr, patterns in currency_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, text, re.IGNORECASE):
                        return curr

            return None

        except Exception as e:
            logger.error(f"Error extracting currency: {e}")
            return None

    def _extract_security_type(self, text: str) -> Optional[str]:
        """
        Extract security type information from text.

        Args:
            text: Input text

        Returns:
            Security type, or None if not found
        """
        try:
            # Security type patterns
            security_types = {
                'Equity': [r'equity', r'stock', r'share', r'aktie', r'action'],
                'Bond': [r'bond', r'fixed income', r'anleihe', r'obligation', r'debt'],
                'Fund': [r'fund', r'etf', r'mutual fund', r'fonds', r'investment fund'],
                'Option': [r'option', r'call', r'put', r'warrant', r'optionsschein'],
                'Future': [r'future', r'futures contract', r'terminkontrakt'],
                'Structured Product': [r'structured product', r'certificate', r'note', r'strukturiertes produkt']
            }

            # Find security type
            for sec_type, patterns in security_types.items():
                for pattern in patterns:
                    if re.search(r'\b' + pattern + r'\b', text, re.IGNORECASE):
                        return sec_type

            return None

        except Exception as e:
            logger.error(f"Error extracting security type: {e}")
            return None

    def _extract_dates(self, text: str) -> Optional[Dict[str, str]]:
        """
        Extract date information from text.

        Args:
            text: Input text

        Returns:
            Dictionary with date types and values, or None if not found
        """
        try:
            # Date patterns
            date_patterns = [
                r'(\d{4}-\d{2}-\d{2})',                      # YYYY-MM-DD
                r'(\d{2}/\d{2}/\d{4})',                      # MM/DD/YYYY or DD/MM/YYYY
                r'(\d{2}\.\d{2}\.\d{4})',                    # DD.MM.YYYY
                r'(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})' # 1st January 2023
            ]

            # Date type indicators
            date_types = {
                'valuation_date': [r'valuation date', r'as of', r'stand', r'date de valorisation'],
                'maturity_date': [r'maturity', r'maturity date', r'fälligkeit', r'échéance'],
                'issue_date': [r'issue date', r'issued', r'ausgabedatum', r'date d\'émission'],
                'settlement_date': [r'settlement date', r'settlement', r'abwicklung', r'règlement']
            }

            dates = {}

            # Find dates with type indicators
            for date_type, indicators in date_types.items():
                for indicator in indicators:
                    for pattern in date_patterns:
                        # Look for patterns like "maturity date: 2023-01-01"
                        combined_pattern = f"{indicator}\\s*[:-]?\\s*{pattern}"
                        matches = re.findall(combined_pattern, text, re.IGNORECASE)
                        if matches:
                            # Take the first match
                            date_str = matches[0] if isinstance(matches[0], str) else matches[0][-1]
                            dates[date_type] = date_str
                            break

                    if date_type in dates:
                        break

            # If no typed dates found, just extract all dates
            if not dates:
                all_dates = []
                for pattern in date_patterns:
                    matches = re.findall(pattern, text)
                    all_dates.extend(matches)

                if all_dates:
                    dates['dates'] = all_dates

            return dates if dates else None

        except Exception as e:
            logger.error(f"Error extracting dates: {e}")
            return None

    def _extract_security_name(self, text: str, isin: str) -> Optional[str]:
        """
        Extract security name from text.

        Args:
            text: Input text
            isin: ISIN code

        Returns:
            Security name, or None if not found
        """
        try:
            # Look for name near ISIN
            isin_index = text.find(isin)
            if isin_index < 0:
                return None

            # Get text before and after ISIN
            before_isin = text[:isin_index].strip()
            after_isin = text[isin_index + len(isin):].strip()

            # Name indicators
            name_indicators = [
                r'name', r'title', r'security', r'description',
                r'bezeichnung', r'name', r'titre', r'désignation'
            ]

            # Check for name after indicators before ISIN
            for indicator in name_indicators:
                pattern = f"{indicator}\\s*[:-]\\s*([^\\n\\r]+)"
                matches = re.findall(pattern, before_isin, re.IGNORECASE)
                if matches:
                    return matches[-1].strip()  # Take the last match

            # Check for name after indicators after ISIN
            for indicator in name_indicators:
                pattern = f"{indicator}\\s*[:-]\\s*([^\\n\\r]+)"
                matches = re.findall(pattern, after_isin, re.IGNORECASE)
                if matches:
                    return matches[0].strip()  # Take the first match

            # If no name found with indicators, try to extract name from context
            # Look for capitalized words or quoted text

            # Check for quoted text
            quoted_pattern = r'"([^"]+)"|\'([^\']+)\''
            matches = re.findall(quoted_pattern, text)
            if matches:
                for match in matches:
                    name = match[0] if match[0] else match[1]
                    if len(name) > 3 and not re.search(r'\d', name):  # Avoid short names or names with digits
                        return name.strip()

            # Check for capitalized words
            cap_word_pattern = r'\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,5})\b'
            matches = re.findall(cap_word_pattern, text)
            if matches:
                for match in matches:
                    if len(match) > 5 and not re.search(r'\d', match):  # Avoid short names or names with digits
                        return match.strip()

            return None

        except Exception as e:
            logger.error(f"Error extracting security name: {e}")
            return None

    def _extract_data_with_nlp(self, text: str, isin: str) -> Dict[str, Any]:
        """
        Extract financial data using advanced NLP techniques.

        Args:
            text: Input text
            isin: ISIN code

        Returns:
            Dictionary with extracted financial data
        """
        financial_data = {}

        try:
            # Use spaCy if available
            if SPACY_AVAILABLE:
                try:
                    # Load spaCy model if not already loaded
                    if not hasattr(self, '_nlp'):
                        self._nlp = spacy.load('en_core_web_sm')

                    # Process text with spaCy
                    doc = self._nlp(text)

                    # Extract named entities
                    for ent in doc.ents:
                        if ent.label_ == 'ORG' and 'name' not in financial_data:
                            financial_data['name'] = ent.text
                        elif ent.label_ == 'MONEY':
                            # Try to extract price and currency
                            price_info = self._extract_price(ent.text)
                            if price_info and 'price' not in financial_data:
                                financial_data['price'] = price_info
                        elif ent.label_ == 'DATE' and 'dates' not in financial_data:
                            financial_data['dates'] = {'date': ent.text}

                    # Extract numeric values
                    for token in doc:
                        if token.like_num and token.i > 0:
                            prev_token = doc[token.i - 1]
                            if prev_token.text.lower() in ['shares', 'units', 'quantity', 'qty'] and 'quantity' not in financial_data:
                                try:
                                    financial_data['quantity'] = float(token.text.replace(',', ''))
                                except ValueError:
                                    pass

                except Exception as e:
                    logger.error(f"Error using spaCy for NLP: {e}")

            # Use NLTK if available and spaCy didn't extract all data
            elif NLTK_AVAILABLE:
                try:
                    # Tokenize text
                    tokens = word_tokenize(text)

                    # Part-of-speech tagging
                    tagged = pos_tag(tokens)

                    # Named entity recognition
                    entities = ne_chunk(tagged)

                    # Extract organization names
                    for entity in entities:
                        if hasattr(entity, 'label') and entity.label() == 'ORGANIZATION' and 'name' not in financial_data:
                            financial_data['name'] = ' '.join([child[0] for child in entity])

                    # Extract numeric values
                    for i, (word, tag) in enumerate(tagged):
                        if tag == 'CD' and i > 0:  # CD = Cardinal number
                            prev_word = tagged[i-1][0].lower()
                            if prev_word in ['shares', 'units', 'quantity', 'qty'] and 'quantity' not in financial_data:
                                try:
                                    financial_data['quantity'] = float(word.replace(',', ''))
                                except ValueError:
                                    pass

                except Exception as e:
                    logger.error(f"Error using NLTK for NLP: {e}")

            return financial_data

        except Exception as e:
            logger.error(f"Error extracting data with NLP: {e}")
            return {}

    def _extract_metrics(self, text: str, securities_result: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Extract financial metrics from text.

        Args:
            text: Input text
            securities_result: Securities extraction result

        Returns:
            Dictionary with financial metrics extraction results
        """
        try:
            logger.info("Extracting financial metrics from text")

            # Count words
            words = text.split()
            word_count = len(words)

            # Count financial terms
            financial_terms = [
                'portfolio', 'value', 'shares', 'stock', 'bond', 'fund', 'isin', 'price',
                'quantity', 'allocation', 'asset', 'security', 'investment', 'dividend',
                'yield', 'return', 'equity', 'income', 'balance', 'statement'
            ]

            term_count = 0
            for term in financial_terms:
                term_count += sum(1 for word in words if word.lower() == term.lower())

            # Calculate term density
            term_density = term_count / word_count if word_count > 0 else 0

            # Securities count
            securities_count = 0
            if securities_result and 'security_count' in securities_result:
                securities_count = securities_result['security_count']

            # Calculate quality scores
            text_quality = min(100, (word_count / 1000) * 70 + term_density * 100)
            securities_quality = min(100, securities_count * 10)

            # Calculate overall score
            overall_score = (text_quality * 0.7) + (securities_quality * 0.3)

            # Determine grade
            grade = 'F'
            if overall_score >= 90:
                grade = 'A'
            elif overall_score >= 80:
                grade = 'B'
            elif overall_score >= 70:
                grade = 'C'
            elif overall_score >= 60:
                grade = 'D'

            # Create financial metrics extraction result
            result = {
                'word_count': word_count,
                'financial_terms': term_count,
                'term_density': term_density,
                'securities_count': securities_count,
                'text_quality': text_quality,
                'securities_quality': securities_quality,
                'overall_score': overall_score,
                'grade': grade
            }

            logger.info(f"Extracted financial metrics: {result}")

            return result

        except Exception as e:
            logger.error(f"Error extracting financial metrics: {e}")
            import traceback
            logger.error(traceback.format_exc())

            # Return error result
            return {
                'error': str(e),
                'traceback': traceback.format_exc()
            }

    def _save_results(self, results: Dict[str, Any], output_dir: str) -> None:
        """
        Save processing results to output directory.

        Args:
            results: Processing results
            output_dir: Output directory
        """
        try:
            # Create output directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)

            # Get PDF filename without extension
            pdf_filename = os.path.basename(results['pdf_path']).split('.')[0]

            # Save text result
            if 'text_result' in results and 'text' in results['text_result']:
                text_path = os.path.join(output_dir, f"{pdf_filename}_text.txt")
                with open(text_path, 'w', encoding='utf-8') as f:
                    f.write(results['text_result']['text'])

                # Save page texts
                if 'page_texts' in results['text_result']:
                    for page_text in results['text_result']['page_texts']:
                        page_text_path = os.path.join(output_dir, f"{pdf_filename}_page_{page_text['page_num']}.txt")
                        with open(page_text_path, 'w', encoding='utf-8') as f:
                            f.write(page_text['text'])

            # Save securities result
            if 'securities_result' in results and 'securities' in results['securities_result']:
                securities_path = os.path.join(output_dir, f"{pdf_filename}_securities.json")
                with open(securities_path, 'w', encoding='utf-8') as f:
                    json.dump(results['securities_result']['securities'], f, indent=2)

            # Save metrics result
            if 'metrics_result' in results:
                metrics_path = os.path.join(output_dir, f"{pdf_filename}_metrics.json")
                with open(metrics_path, 'w', encoding='utf-8') as f:
                    json.dump(results['metrics_result'], f, indent=2)

            # Save full results
            results_path = os.path.join(output_dir, f"{pdf_filename}_results.json")
            with open(results_path, 'w', encoding='utf-8') as f:
                # Create a copy of results without the text content to reduce file size
                results_copy = results.copy()
                if 'text_result' in results_copy and 'text' in results_copy['text_result']:
                    results_copy['text_result']['text'] = f"Saved to {pdf_filename}_text.txt"
                if 'text_result' in results_copy and 'page_texts' in results_copy['text_result']:
                    for page_text in results_copy['text_result']['page_texts']:
                        page_text['text'] = f"Saved to {pdf_filename}_page_{page_text['page_num']}.txt"

                json.dump(results_copy, f, indent=2)

            logger.info(f"Saved results to {output_dir}")

        except Exception as e:
            logger.error(f"Error saving results: {e}")
            import traceback
            logger.error(traceback.format_exc())
