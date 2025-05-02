"""
Table Extractor Module

This module provides enhanced table extraction functionality for financial documents.
"""

import os
import logging
import tempfile
from typing import List, Dict, Any, Optional, Tuple, Union
import json
import re

import pandas as pd
import numpy as np
import fitz  # PyMuPDF
import camelot
import tabula
import pdfplumber
from pdf2image import convert_from_path
import cv2
import pytesseract

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TableExtractor:
    """
    Enhanced table extractor for financial documents.
    """
    
    def __init__(self, pdf_path: str, ocr_enabled: bool = True):
        """
        Initialize the table extractor.
        
        Args:
            pdf_path: Path to the PDF file
            ocr_enabled: Whether to use OCR for scanned documents
        """
        self.pdf_path = pdf_path
        self.ocr_enabled = ocr_enabled
        self.tables = []
        self.tables_camelot_lattice = []
        self.tables_camelot_stream = []
        self.tables_tabula = []
        self.tables_pdfplumber = []
        self.is_scanned = False
        
        # Check if the document is scanned
        self._check_if_scanned()
    
    def _check_if_scanned(self):
        """
        Check if the PDF is a scanned document.
        """
        try:
            # Open the PDF
            doc = fitz.open(self.pdf_path)
            
            # Check the first few pages
            num_pages_to_check = min(5, len(doc))
            text_count = 0
            
            for page_num in range(num_pages_to_check):
                page = doc[page_num]
                text = page.get_text()
                text_count += len(text)
            
            # If there's very little text, it's likely a scanned document
            avg_text_per_page = text_count / num_pages_to_check
            self.is_scanned = avg_text_per_page < 100
            
            logger.info(f"Document scan check: Average text per page: {avg_text_per_page}, Is scanned: {self.is_scanned}")
            
            doc.close()
        except Exception as e:
            logger.error(f"Error checking if document is scanned: {e}")
            self.is_scanned = False
    
    def extract_tables(self, pages: str = 'all') -> List[Dict[str, Any]]:
        """
        Extract tables from the PDF using multiple methods and combine results.
        
        Args:
            pages: Page numbers to extract tables from (e.g., '1,3,4' or 'all')
            
        Returns:
            List of dictionaries containing the extracted tables
        """
        logger.info(f"Extracting tables from {self.pdf_path} (pages: {pages})")
        
        # If the document is scanned and OCR is enabled, use OCR
        if self.is_scanned and self.ocr_enabled:
            logger.info("Document appears to be scanned, using OCR for table extraction")
            return self._extract_tables_with_ocr(pages)
        
        # Extract tables using different methods
        try:
            self._extract_tables_camelot(pages)
            self._extract_tables_tabula(pages)
            self._extract_tables_pdfplumber(pages)
            
            # Combine and deduplicate tables
            self._combine_tables()
            
            # Convert tables to the desired format
            return self._format_tables()
        except Exception as e:
            logger.error(f"Error extracting tables: {e}")
            return []
    
    def _extract_tables_camelot(self, pages: str = 'all'):
        """
        Extract tables using Camelot.
        
        Args:
            pages: Page numbers to extract tables from
        """
        logger.info("Extracting tables with Camelot")
        
        try:
            # Extract tables using lattice method (for bordered tables)
            self.tables_camelot_lattice = camelot.read_pdf(
                self.pdf_path,
                pages=pages,
                flavor='lattice',
                suppress_stdout=True
            )
            logger.info(f"Extracted {len(self.tables_camelot_lattice)} tables using lattice method")
            
            # Extract tables using stream method (for non-bordered tables)
            self.tables_camelot_stream = camelot.read_pdf(
                self.pdf_path,
                pages=pages,
                flavor='stream',
                suppress_stdout=True,
                edge_tol=50,
                row_tol=10
            )
            logger.info(f"Extracted {len(self.tables_camelot_stream)} tables using stream method")
        except Exception as e:
            logger.error(f"Error extracting tables with Camelot: {e}")
    
    def _extract_tables_tabula(self, pages: str = 'all'):
        """
        Extract tables using Tabula.
        
        Args:
            pages: Page numbers to extract tables from
        """
        logger.info("Extracting tables with Tabula")
        
        try:
            # Convert pages string to list of integers for Tabula
            if pages == 'all':
                # Get total number of pages
                doc = fitz.open(self.pdf_path)
                pages_list = list(range(1, len(doc) + 1))
                doc.close()
            else:
                pages_list = [int(p) for p in pages.split(',')]
            
            # Extract tables using Tabula
            self.tables_tabula = tabula.read_pdf(
                self.pdf_path,
                pages=pages_list,
                multiple_tables=True,
                guess=True,
                lattice=True
            )
            logger.info(f"Extracted {len(self.tables_tabula)} tables using Tabula")
        except Exception as e:
            logger.error(f"Error extracting tables with Tabula: {e}")
            self.tables_tabula = []
    
    def _extract_tables_pdfplumber(self, pages: str = 'all'):
        """
        Extract tables using PDFPlumber.
        
        Args:
            pages: Page numbers to extract tables from
        """
        logger.info("Extracting tables with PDFPlumber")
        
        try:
            # Open PDF with PDFPlumber
            with pdfplumber.open(self.pdf_path) as pdf:
                # Get pages to process
                if pages == 'all':
                    pages_to_process = range(len(pdf.pages))
                else:
                    # Convert pages string to list of integers
                    pages_to_process = [int(p) - 1 for p in pages.split(',')]
                
                # Extract tables
                self.tables_pdfplumber = []
                for i, page_num in enumerate(pages_to_process):
                    if page_num < 0 or page_num >= len(pdf.pages):
                        continue
                    
                    page = pdf.pages[page_num]
                    tables = page.extract_tables()
                    
                    for table in tables:
                        # Convert to DataFrame
                        df = pd.DataFrame(table)
                        
                        # Skip empty tables
                        if df.empty or df.shape[0] < 2 or df.shape[1] < 2:
                            continue
                        
                        # Use first row as header if it contains strings
                        if df.iloc[0].astype(str).str.strip().str.len().mean() > 0:
                            df.columns = df.iloc[0]
                            df = df.iloc[1:]
                        
                        self.tables_pdfplumber.append({
                            'dataframe': df,
                            'page': page_num + 1,
                            'method': 'pdfplumber'
                        })
                
                logger.info(f"Extracted {len(self.tables_pdfplumber)} tables using PDFPlumber")
        except Exception as e:
            logger.error(f"Error extracting tables with PDFPlumber: {e}")
            self.tables_pdfplumber = []
    
    def _extract_tables_with_ocr(self, pages: str = 'all') -> List[Dict[str, Any]]:
        """
        Extract tables using OCR.
        
        Args:
            pages: Page numbers to extract tables from
            
        Returns:
            List of dictionaries containing the extracted tables
        """
        logger.info("Extracting tables with OCR")
        
        try:
            # Convert PDF to images
            images = convert_from_path(self.pdf_path)
            
            # Get pages to process
            if pages == 'all':
                pages_to_process = range(len(images))
            else:
                # Convert pages string to list of integers
                pages_to_process = [int(p) - 1 for p in pages.split(',')]
            
            # Filter images by pages
            images_to_process = [images[i] for i in pages_to_process if i < len(images)]
            
            # Extract tables from images
            ocr_tables = []
            for i, image in enumerate(images_to_process):
                page_num = pages_to_process[i] + 1
                
                # Convert PIL image to OpenCV format
                img = np.array(image)
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                
                # Preprocess image for better OCR
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
                
                # Detect lines to find tables
                horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
                vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
                
                horizontal_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
                vertical_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel, iterations=2)
                
                # Combine lines
                table_mask = cv2.bitwise_or(horizontal_lines, vertical_lines)
                
                # Find contours
                contours, _ = cv2.findContours(table_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                # Filter contours by size
                min_area = img.shape[0] * img.shape[1] * 0.01  # 1% of image area
                table_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]
                
                # Process each potential table
                for j, contour in enumerate(table_contours):
                    # Get bounding box
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    # Extract table region
                    table_img = gray[y:y+h, x:x+w]
                    
                    # OCR the table region
                    ocr_text = pytesseract.image_to_string(table_img)
                    
                    # Split into rows and columns
                    rows = [row.strip() for row in ocr_text.split('\n') if row.strip()]
                    
                    # Skip if too few rows
                    if len(rows) < 2:
                        continue
                    
                    # Try to determine columns by spaces
                    # This is a simple approach; more sophisticated methods would be needed for complex tables
                    data = []
                    for row in rows:
                        # Split by multiple spaces
                        cols = re.split(r'\s{2,}', row)
                        data.append(cols)
                    
                    # Create DataFrame
                    df = pd.DataFrame(data)
                    
                    # Use first row as header
                    if not df.empty and df.shape[0] > 1:
                        df.columns = df.iloc[0]
                        df = df.iloc[1:]
                        
                        ocr_tables.append({
                            'dataframe': df,
                            'page': page_num,
                            'method': 'ocr',
                            'bbox': (x, y, x+w, y+h)
                        })
            
            logger.info(f"Extracted {len(ocr_tables)} tables using OCR")
            
            # Format tables
            return self._format_tables_from_list(ocr_tables)
        except Exception as e:
            logger.error(f"Error extracting tables with OCR: {e}")
            return []
    
    def _combine_tables(self):
        """
        Combine tables from different extraction methods and remove duplicates.
        """
        logger.info("Combining tables from different extraction methods")
        
        # Convert Camelot tables to our format
        camelot_tables = []
        
        # Process lattice tables
        for i, table in enumerate(self.tables_camelot_lattice):
            df = table.df
            
            # Use first row as header if it contains strings
            if df.iloc[0].astype(str).str.strip().str.len().mean() > 0:
                df.columns = df.iloc[0]
                df = df.iloc[1:]
            
            camelot_tables.append({
                'dataframe': df,
                'page': table.page,
                'method': 'camelot_lattice',
                'accuracy': table.accuracy,
                'whitespace': table.whitespace
            })
        
        # Process stream tables
        for i, table in enumerate(self.tables_camelot_stream):
            df = table.df
            
            # Use first row as header if it contains strings
            if df.iloc[0].astype(str).str.strip().str.len().mean() > 0:
                df.columns = df.iloc[0]
                df = df.iloc[1:]
            
            camelot_tables.append({
                'dataframe': df,
                'page': table.page,
                'method': 'camelot_stream',
                'accuracy': table.accuracy,
                'whitespace': table.whitespace
            })
        
        # Convert Tabula tables to our format
        tabula_tables = []
        for i, df in enumerate(self.tables_tabula):
            # Skip empty tables
            if df.empty or df.shape[0] < 2 or df.shape[1] < 2:
                continue
            
            tabula_tables.append({
                'dataframe': df,
                'page': i + 1,  # Approximate page number
                'method': 'tabula'
            })
        
        # Combine all tables
        all_tables = camelot_tables + tabula_tables + self.tables_pdfplumber
        
        # Remove duplicates
        self.tables = self._remove_duplicate_tables(all_tables)
        logger.info(f"Combined {len(self.tables)} unique tables")
    
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
        
        unique_tables = []
        
        for table in tables:
            df = table['dataframe']
            
            # Skip empty tables
            if df.empty or df.shape[0] < 2 or df.shape[1] < 2:
                continue
            
            # Convert DataFrame to string for comparison
            table_str = df.to_string()
            
            # Check if this table is similar to any existing unique table
            is_duplicate = False
            for unique_table in unique_tables:
                unique_df = unique_table['dataframe']
                unique_table_str = unique_df.to_string()
                
                # Simple similarity check: Jaccard similarity of words
                table_words = set(re.findall(r'\b\w+\b', table_str))
                unique_table_words = set(re.findall(r'\b\w+\b', unique_table_str))
                
                if table_words and unique_table_words:
                    intersection = len(table_words.intersection(unique_table_words))
                    union = len(table_words.union(unique_table_words))
                    similarity = intersection / union
                    
                    # If tables are very similar, consider it a duplicate
                    if similarity > 0.8:
                        is_duplicate = True
                        
                        # Keep the table with higher accuracy or from a preferred method
                        if table.get('method') == 'camelot_lattice' and unique_table.get('method') != 'camelot_lattice':
                            # Replace the existing table with this one
                            unique_tables.remove(unique_table)
                            unique_tables.append(table)
                        elif table.get('accuracy', 0) > unique_table.get('accuracy', 0):
                            # Replace the existing table with this one
                            unique_tables.remove(unique_table)
                            unique_tables.append(table)
                        
                        break
            
            if not is_duplicate:
                unique_tables.append(table)
        
        return unique_tables
    
    def _format_tables(self) -> List[Dict[str, Any]]:
        """
        Format tables for output.
        
        Returns:
            List of dictionaries containing the formatted tables
        """
        return self._format_tables_from_list(self.tables)
    
    def _format_tables_from_list(self, tables: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Format a list of tables for output.
        
        Args:
            tables: List of tables
            
        Returns:
            List of dictionaries containing the formatted tables
        """
        formatted_tables = []
        
        for i, table in enumerate(tables):
            df = table['dataframe']
            
            # Skip empty tables
            if df.empty or df.shape[0] < 2 or df.shape[1] < 2:
                continue
            
            # Convert DataFrame to list of lists
            data = df.values.tolist()
            
            # Get column names
            columns = df.columns.tolist()
            
            # Create formatted table
            formatted_table = {
                'id': i + 1,
                'page': table.get('page', 1),
                'method': table.get('method', 'unknown'),
                'accuracy': table.get('accuracy', 1.0),
                'columns': columns,
                'data': data,
                'num_rows': len(data),
                'num_cols': len(columns)
            }
            
            # Add bounding box if available
            if 'bbox' in table:
                formatted_table['bbox'] = table['bbox']
            
            formatted_tables.append(formatted_table)
        
        return formatted_tables
    
    def get_table_as_dataframe(self, table_id: int) -> Optional[pd.DataFrame]:
        """
        Get a specific table as a pandas DataFrame.
        
        Args:
            table_id: ID of the table
            
        Returns:
            DataFrame or None if table not found
        """
        if not self.tables or table_id < 1 or table_id > len(self.tables):
            return None
        
        return self.tables[table_id - 1]['dataframe']
    
    def get_table_as_html(self, table_id: int) -> Optional[str]:
        """
        Get a specific table as HTML.
        
        Args:
            table_id: ID of the table
            
        Returns:
            HTML string or None if table not found
        """
        df = self.get_table_as_dataframe(table_id)
        if df is None:
            return None
        
        return df.to_html(index=False)
    
    def get_table_as_csv(self, table_id: int) -> Optional[str]:
        """
        Get a specific table as CSV.
        
        Args:
            table_id: ID of the table
            
        Returns:
            CSV string or None if table not found
        """
        df = self.get_table_as_dataframe(table_id)
        if df is None:
            return None
        
        return df.to_csv(index=False)
    
    def get_table_as_json(self, table_id: int) -> Optional[str]:
        """
        Get a specific table as JSON.
        
        Args:
            table_id: ID of the table
            
        Returns:
            JSON string or None if table not found
        """
        df = self.get_table_as_dataframe(table_id)
        if df is None:
            return None
        
        return df.to_json(orient='records')
    
    def save_tables_to_excel(self, output_path: str) -> bool:
        """
        Save all tables to an Excel file.
        
        Args:
            output_path: Path to save the Excel file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with pd.ExcelWriter(output_path) as writer:
                for i, table in enumerate(self.tables):
                    df = table['dataframe']
                    sheet_name = f"Table_{i+1}_Page_{table.get('page', 1)}"
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
            
            return True
        except Exception as e:
            logger.error(f"Error saving tables to Excel: {e}")
            return False
