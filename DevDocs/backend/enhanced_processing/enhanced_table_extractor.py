"""
Enhanced Table Extractor - Extracts tables from financial documents using multiple methods.

This module provides tools to extract tables from financial documents using
multiple extraction methods (Camelot, pdfplumber, Tabula) and classify them
based on their content.
"""
import os
import re
import logging
import tempfile
from typing import Dict, List, Any, Optional, Tuple, Union
import json
import pandas as pd
import numpy as np
import cv2
from pathlib import Path
from collections import defaultdict

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import extraction libraries
try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False
    logger.warning("pdfplumber library not available. Install with: pip install pdfplumber")

try:
    import camelot
    CAMELOT_AVAILABLE = True
except ImportError:
    CAMELOT_AVAILABLE = False
    logger.warning("camelot-py library not available. Install with: pip install camelot-py")

try:
    import tabula
    TABULA_AVAILABLE = True
except ImportError:
    TABULA_AVAILABLE = False
    logger.warning("tabula-py library not available. Install with: pip install tabula-py")

try:
    import pytesseract
    from PIL import Image
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract library not available. Install with: pip install pytesseract")

class EnhancedTableExtractor:
    """
    Enhanced table extraction using multiple methods.
    Combines results from Camelot, pdfplumber, Tabula, and OCR-based detection.
    """
    
    def __init__(
        self,
        use_camelot: bool = True,
        use_pdfplumber: bool = True,
        use_tabula: bool = True,
        use_ocr: bool = True,
        lang: str = "eng+heb",
        confidence_threshold: float = 0.7
    ):
        """
        Initialize the EnhancedTableExtractor.
        
        Args:
            use_camelot: Whether to use Camelot for table extraction
            use_pdfplumber: Whether to use pdfplumber for table extraction
            use_tabula: Whether to use Tabula for table extraction
            use_ocr: Whether to use OCR-based table detection
            lang: OCR language
            confidence_threshold: Confidence threshold for table detection
        """
        self.use_camelot = use_camelot and CAMELOT_AVAILABLE
        self.use_pdfplumber = use_pdfplumber and PDFPLUMBER_AVAILABLE
        self.use_tabula = use_tabula and TABULA_AVAILABLE
        self.use_ocr = use_ocr and TESSERACT_AVAILABLE
        self.lang = lang
        self.confidence_threshold = confidence_threshold
        self.tables = []
        
        # Check if at least one method is available
        if not any([self.use_camelot, self.use_pdfplumber, self.use_tabula, self.use_ocr]):
            logger.warning("No table extraction methods available. Install at least one of: camelot-py, pdfplumber, tabula-py, pytesseract")
    
    def extract_tables_from_pdf(self, pdf_path: str, pages: str = 'all') -> List[Dict[str, Any]]:
        """
        Extract tables from a PDF file using multiple methods.
        
        Args:
            pdf_path: Path to the PDF file
            pages: Page numbers to extract tables from (e.g., '1,3,4' or 'all')
            
        Returns:
            List of dictionaries with table information
        """
        logger.info(f"Extracting tables from PDF: {pdf_path}")
        
        # Reset tables
        self.tables = []
        
        # Check if PDF file exists
        if not os.path.exists(pdf_path):
            logger.error(f"PDF file not found: {pdf_path}")
            return []
        
        try:
            # Extract tables using multiple methods
            if self.use_pdfplumber:
                pdfplumber_tables = self._extract_with_pdfplumber(pdf_path, pages)
                self.tables.extend(pdfplumber_tables)
                logger.info(f"Extracted {len(pdfplumber_tables)} tables with pdfplumber")
            
            if self.use_camelot:
                camelot_tables = self._extract_with_camelot(pdf_path, pages)
                self.tables.extend(camelot_tables)
                logger.info(f"Extracted {len(camelot_tables)} tables with camelot")
            
            if self.use_tabula:
                tabula_tables = self._extract_with_tabula(pdf_path, pages)
                self.tables.extend(tabula_tables)
                logger.info(f"Extracted {len(tabula_tables)} tables with tabula")
            
            if self.use_ocr:
                ocr_tables = self._extract_with_ocr(pdf_path, pages)
                self.tables.extend(ocr_tables)
                logger.info(f"Extracted {len(ocr_tables)} tables with OCR")
            
            # Remove duplicates
            self.tables = self._remove_duplicate_tables(self.tables)
            logger.info(f"Found {len(self.tables)} unique tables after deduplication")
            
            # Classify tables
            self._classify_tables()
            
            return self.tables
            
        except Exception as e:
            logger.error(f"Error extracting tables from PDF: {str(e)}")
            return []
    
    def extract_tables_from_image(self, image_path: Union[str, np.ndarray]) -> List[Dict[str, Any]]:
        """
        Extract tables from an image using OCR-based detection.
        
        Args:
            image_path: Path to the image file or numpy array
            
        Returns:
            List of dictionaries with table information
        """
        logger.info(f"Extracting tables from image")
        
        # Reset tables
        self.tables = []
        
        if not self.use_ocr:
            logger.warning("OCR-based table detection is not available")
            return []
        
        try:
            # Load the image
            if isinstance(image_path, str):
                if not os.path.exists(image_path):
                    logger.error(f"Image file not found: {image_path}")
                    return []
                img = cv2.imread(image_path)
            else:
                img = image_path
            
            # Extract tables using OCR
            ocr_tables = self._extract_tables_from_image(img)
            self.tables.extend(ocr_tables)
            logger.info(f"Extracted {len(ocr_tables)} tables from image")
            
            # Classify tables
            self._classify_tables()
            
            return self.tables
            
        except Exception as e:
            logger.error(f"Error extracting tables from image: {str(e)}")
            return []
    
    def _extract_with_pdfplumber(self, pdf_path: str, pages: str) -> List[Dict[str, Any]]:
        """
        Extract tables using pdfplumber.
        
        Args:
            pdf_path: Path to the PDF file
            pages: Page numbers to extract tables from
            
        Returns:
            List of dictionaries with table information
        """
        if not self.use_pdfplumber:
            return []
        
        tables = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Convert pages string to list of page numbers
                if pages == 'all':
                    page_numbers = range(len(pdf.pages))
                else:
                    page_numbers = [int(p) - 1 for p in pages.split(',')]  # Convert to 0-based indexing
                
                for i in page_numbers:
                    if i < len(pdf.pages):
                        page = pdf.pages[i]
                        page_tables = page.extract_tables()
                        
                        for j, table in enumerate(page_tables):
                            if table and len(table) > 0:
                                # Convert to pandas DataFrame
                                df = pd.DataFrame(table[1:], columns=table[0])
                                
                                # Create table info
                                table_info = {
                                    'id': f'pdfplumber_{i+1}_{j+1}',
                                    'page': i + 1,
                                    'extraction_method': 'pdfplumber',
                                    'table_number': j + 1,
                                    'data': df.to_dict(orient='records'),
                                    'headers': table[0],
                                    'rows': table[1:],
                                    'confidence': 0.8  # Arbitrary confidence for pdfplumber
                                }
                                
                                tables.append(table_info)
            
            return tables
            
        except Exception as e:
            logger.error(f"Error extracting tables with pdfplumber: {str(e)}")
            return []
    
    def _extract_with_camelot(self, pdf_path: str, pages: str) -> List[Dict[str, Any]]:
        """
        Extract tables using Camelot.
        
        Args:
            pdf_path: Path to the PDF file
            pages: Page numbers to extract tables from
            
        Returns:
            List of dictionaries with table information
        """
        if not self.use_camelot:
            return []
        
        tables = []
        
        try:
            # Extract tables with lattice method
            lattice_tables = camelot.read_pdf(
                pdf_path,
                pages=pages,
                flavor='lattice',
                suppress_stdout=True
            )
            
            # Process lattice tables
            for i, table in enumerate(lattice_tables):
                # Convert to pandas DataFrame
                df = table.df
                
                # Create table info
                table_info = {
                    'id': f'camelot_lattice_{table.page}_{i+1}',
                    'page': int(table.page),
                    'extraction_method': 'camelot_lattice',
                    'table_number': i + 1,
                    'data': df.to_dict(orient='records'),
                    'headers': df.columns.tolist(),
                    'rows': df.values.tolist(),
                    'confidence': table.accuracy,
                    'bbox': table.bbox
                }
                
                tables.append(table_info)
            
            # Extract tables with stream method
            stream_tables = camelot.read_pdf(
                pdf_path,
                pages=pages,
                flavor='stream',
                suppress_stdout=True,
                edge_tol=50,
                row_tol=10
            )
            
            # Process stream tables
            for i, table in enumerate(stream_tables):
                # Convert to pandas DataFrame
                df = table.df
                
                # Create table info
                table_info = {
                    'id': f'camelot_stream_{table.page}_{i+1}',
                    'page': int(table.page),
                    'extraction_method': 'camelot_stream',
                    'table_number': i + 1,
                    'data': df.to_dict(orient='records'),
                    'headers': df.columns.tolist(),
                    'rows': df.values.tolist(),
                    'confidence': table.accuracy,
                    'bbox': table.bbox
                }
                
                tables.append(table_info)
            
            return tables
            
        except Exception as e:
            logger.error(f"Error extracting tables with camelot: {str(e)}")
            return []
    
    def _extract_with_tabula(self, pdf_path: str, pages: str) -> List[Dict[str, Any]]:
        """
        Extract tables using Tabula.
        
        Args:
            pdf_path: Path to the PDF file
            pages: Page numbers to extract tables from
            
        Returns:
            List of dictionaries with table information
        """
        if not self.use_tabula:
            return []
        
        tables = []
        
        try:
            # Convert pages string to tabula format
            if pages == 'all':
                tabula_pages = 'all'
            else:
                tabula_pages = pages
            
            # Extract tables
            tabula_tables = tabula.read_pdf(
                pdf_path,
                pages=tabula_pages,
                multiple_tables=True
            )
            
            # Process tables
            for i, df in enumerate(tabula_tables):
                if not df.empty:
                    # Create table info
                    table_info = {
                        'id': f'tabula_{i+1}',
                        'page': i + 1,  # Approximate page number
                        'extraction_method': 'tabula',
                        'table_number': i + 1,
                        'data': df.to_dict(orient='records'),
                        'headers': df.columns.tolist(),
                        'rows': df.values.tolist(),
                        'confidence': 0.75  # Arbitrary confidence for tabula
                    }
                    
                    tables.append(table_info)
            
            return tables
            
        except Exception as e:
            logger.error(f"Error extracting tables with tabula: {str(e)}")
            return []
    
    def _extract_with_ocr(self, pdf_path: str, pages: str) -> List[Dict[str, Any]]:
        """
        Extract tables using OCR-based detection.
        
        Args:
            pdf_path: Path to the PDF file
            pages: Page numbers to extract tables from
            
        Returns:
            List of dictionaries with table information
        """
        if not self.use_ocr:
            return []
        
        tables = []
        
        try:
            # Convert PDF to images
            from pdf2image import convert_from_path
            
            # Convert pages string to list of page numbers
            if pages == 'all':
                page_numbers = None  # All pages
            else:
                page_numbers = [int(p) for p in pages.split(',')]
            
            # Convert PDF to images
            images = convert_from_path(
                pdf_path,
                dpi=300,
                first_page=page_numbers[0] if page_numbers else None,
                last_page=page_numbers[-1] if page_numbers else None
            )
            
            # Process each page
            for i, img in enumerate(images):
                page_num = i + 1 if page_numbers is None else page_numbers[i]
                
                # Convert PIL Image to numpy array
                img_array = np.array(img)
                
                # Extract tables from the image
                page_tables = self._extract_tables_from_image(img_array, page_num=page_num)
                tables.extend(page_tables)
            
            return tables
            
        except Exception as e:
            logger.error(f"Error extracting tables with OCR: {str(e)}")
            return []
    
    def _extract_tables_from_image(self, img: np.ndarray, page_num: int = 1) -> List[Dict[str, Any]]:
        """
        Extract tables from an image using OCR-based detection.
        
        Args:
            img: Image as numpy array
            page_num: Page number
            
        Returns:
            List of dictionaries with table information
        """
        if not self.use_ocr:
            return []
        
        tables = []
        
        try:
            # Convert to grayscale if needed
            if len(img.shape) == 3:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            else:
                gray = img.copy()
            
            # Apply binary thresholding
            _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
            
            # Detect horizontal and vertical lines
            horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (50, 1))
            vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 50))
            
            horizontal_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, horizontal_kernel)
            vertical_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, vertical_kernel)
            
            # Combine lines
            table_structure = cv2.add(horizontal_lines, vertical_lines)
            
            # Find contours
            contours, _ = cv2.findContours(table_structure, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter contours to find potential tables
            for i, contour in enumerate(contours):
                x, y, w, h = cv2.boundingRect(contour)
                
                # Filter by size (tables are usually large)
                if w > img.shape[1] * 0.3 and h > img.shape[0] * 0.1:
                    # Extract table region
                    table_img = gray[y:y+h, x:x+w]
                    
                    # Extract text from the table
                    table_text = pytesseract.image_to_string(table_img, lang=self.lang)
                    
                    # Extract table data
                    table_data = self._extract_table_data_from_image(table_img)
                    
                    if table_data and len(table_data) > 1:  # At least header and one row
                        # Create table info
                        table_info = {
                            'id': f'ocr_{page_num}_{i+1}',
                            'page': page_num,
                            'extraction_method': 'ocr',
                            'table_number': i + 1,
                            'data': pd.DataFrame(table_data[1:], columns=table_data[0]).to_dict(orient='records'),
                            'headers': table_data[0],
                            'rows': table_data[1:],
                            'confidence': 0.7,  # Arbitrary confidence for OCR
                            'bbox': [x, y, x+w, y+h],
                            'text': table_text
                        }
                        
                        tables.append(table_info)
            
            return tables
            
        except Exception as e:
            logger.error(f"Error extracting tables from image: {str(e)}")
            return []
    
    def _extract_table_data_from_image(self, table_img: np.ndarray) -> List[List[str]]:
        """
        Extract structured data from a table image.
        
        Args:
            table_img: Table image as numpy array
            
        Returns:
            List of rows, each containing a list of cell values
        """
        try:
            # Get data with bounding boxes
            data = pytesseract.image_to_data(
                table_img, lang=self.lang, config='--psm 6',
                output_type=pytesseract.Output.DICT
            )
            
            # Group text by lines
            lines = {}
            for i in range(len(data['text'])):
                if data['text'][i].strip():
                    line_num = data['line_num'][i]
                    if line_num not in lines:
                        lines[line_num] = []
                    
                    lines[line_num].append({
                        'text': data['text'][i],
                        'x': data['left'][i],
                        'width': data['width'][i]
                    })
            
            # Sort lines by y-coordinate
            sorted_lines = sorted(lines.items())
            
            # Extract rows
            rows = []
            for _, line in sorted_lines:
                # Sort text elements by x-coordinate
                sorted_line = sorted(line, key=lambda item: item['x'])
                
                # Extract text
                row = [item['text'] for item in sorted_line]
                rows.append(row)
            
            return rows
            
        except Exception as e:
            logger.error(f"Error extracting table data from image: {str(e)}")
            return []
    
    def _remove_duplicate_tables(self, tables: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate tables based on content similarity.
        
        Args:
            tables: List of tables
            
        Returns:
            List of unique tables
        """
        if not tables:
            return []
        
        # Group tables by page
        tables_by_page = defaultdict(list)
        for table in tables:
            tables_by_page[table['page']].append(table)
        
        # Process each page
        unique_tables = []
        for page, page_tables in tables_by_page.items():
            # Sort tables by confidence
            sorted_tables = sorted(page_tables, key=lambda t: t.get('confidence', 0), reverse=True)
            
            # Keep track of processed tables
            processed = set()
            
            for i, table1 in enumerate(sorted_tables):
                if i in processed:
                    continue
                
                # Add to unique tables
                unique_tables.append(table1)
                processed.add(i)
                
                # Check for duplicates
                for j, table2 in enumerate(sorted_tables):
                    if j in processed or i == j:
                        continue
                    
                    # Check if tables are similar
                    if self._are_tables_similar(table1, table2):
                        processed.add(j)
        
        return unique_tables
    
    def _are_tables_similar(self, table1: Dict[str, Any], table2: Dict[str, Any]) -> bool:
        """
        Check if two tables are similar based on content.
        
        Args:
            table1: First table
            table2: Second table
            
        Returns:
            True if tables are similar, False otherwise
        """
        # Check if tables are on the same page
        if table1['page'] != table2['page']:
            return False
        
        # Check if tables have similar bounding boxes
        if 'bbox' in table1 and 'bbox' in table2:
            bbox1 = table1['bbox']
            bbox2 = table2['bbox']
            
            # Calculate overlap
            x_overlap = max(0, min(bbox1[2], bbox2[2]) - max(bbox1[0], bbox2[0]))
            y_overlap = max(0, min(bbox1[3], bbox2[3]) - max(bbox1[1], bbox2[1]))
            
            # Calculate areas
            area1 = (bbox1[2] - bbox1[0]) * (bbox1[3] - bbox1[1])
            area2 = (bbox2[2] - bbox2[0]) * (bbox2[3] - bbox2[1])
            overlap_area = x_overlap * y_overlap
            
            # Check if overlap is significant
            if overlap_area > 0.5 * min(area1, area2):
                return True
        
        # Check if tables have similar content
        if 'headers' in table1 and 'headers' in table2:
            headers1 = table1['headers']
            headers2 = table2['headers']
            
            # Check if headers are similar
            if len(headers1) == len(headers2):
                similar_headers = sum(1 for h1, h2 in zip(headers1, headers2) if self._are_strings_similar(h1, h2))
                if similar_headers >= 0.7 * len(headers1):
                    return True
        
        return False
    
    def _are_strings_similar(self, str1: str, str2: str) -> bool:
        """
        Check if two strings are similar.
        
        Args:
            str1: First string
            str2: Second string
            
        Returns:
            True if strings are similar, False otherwise
        """
        # Convert to lowercase and remove whitespace
        s1 = str1.lower().strip()
        s2 = str2.lower().strip()
        
        # Check if strings are identical
        if s1 == s2:
            return True
        
        # Check if one string is a substring of the other
        if s1 in s2 or s2 in s1:
            return True
        
        # Calculate similarity
        from difflib import SequenceMatcher
        similarity = SequenceMatcher(None, s1, s2).ratio()
        
        return similarity > 0.7
    
    def _classify_tables(self):
        """
        Classify tables based on content.
        """
        for table in self.tables:
            # Get headers
            headers = table.get('headers', [])
            
            # Convert headers to lowercase for case-insensitive matching
            headers_lower = [str(h).lower() for h in headers]
            
            # Check for portfolio table
            portfolio_keywords = ['security', 'isin', 'quantity', 'price', 'value', 'weight', '%', 'symbol', 'name']
            if any(keyword in ' '.join(headers_lower) for keyword in portfolio_keywords):
                table['table_type'] = 'portfolio'
                continue
            
            # Check for asset allocation table
            asset_keywords = ['asset', 'class', 'allocation', 'weight', '%', 'value', 'type']
            if any(keyword in ' '.join(headers_lower) for keyword in asset_keywords):
                table['table_type'] = 'asset_allocation'
                continue
            
            # Check for income statement table
            income_keywords = ['revenue', 'income', 'expense', 'profit', 'loss', 'ebitda', 'net']
            if any(keyword in ' '.join(headers_lower) for keyword in income_keywords):
                table['table_type'] = 'income_statement'
                continue
            
            # Check for balance sheet table
            balance_keywords = ['asset', 'liability', 'equity', 'total', 'current', 'non-current']
            if any(keyword in ' '.join(headers_lower) for keyword in balance_keywords):
                table['table_type'] = 'balance_sheet'
                continue
            
            # Default to unknown
            table['table_type'] = 'unknown'
    
    def save_results(self, output_path: str) -> str:
        """
        Save extraction results to a file.
        
        Args:
            output_path: Output file path
            
        Returns:
            Path to the saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save results to JSON file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                'tables': self.tables,
                'count': len(self.tables)
            }, f, ensure_ascii=False, indent=2)
        
        return output_path
