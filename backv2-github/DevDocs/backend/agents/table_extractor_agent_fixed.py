"""
Table Extractor Agent for extracting tables from documents.
"""
import os
import json
import logging
import tempfile
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Union
from pathlib import Path
from .base_agent import BaseAgent

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TableExtractorAgent(BaseAgent):
    """Agent for extracting tables from documents."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize the table extractor agent.

        Args:
            api_key: OpenRouter API key (optional)
            **kwargs: Additional parameters for the base agent
        """
        super().__init__(name="Table Extractor Agent")
        self.api_key = api_key
        self.description = "I extract tables from documents."

        # Check for required libraries
        self.available_extractors = self._check_available_extractors()
        if not self.available_extractors:
            logger.warning("No table extraction libraries available. Install at least one of: camelot-py, pdfplumber, tabula-py, pytesseract")

    def _check_available_extractors(self) -> Dict[str, bool]:
        """
        Check which table extraction libraries are available.

        Returns:
            Dictionary with availability of each extractor
        """
        extractors = {
            'pdfplumber': False,
            'camelot': False,
            'tabula': False,
            'pytesseract': False
        }
        
        # Check pdfplumber
        try:
            import pdfplumber
            extractors['pdfplumber'] = True
        except ImportError:
            pass
        
        # Check camelot
        try:
            import camelot
            extractors['camelot'] = True
        except ImportError:
            pass
        
        # Check tabula
        try:
            import tabula
            extractors['tabula'] = True
        except ImportError:
            pass
        
        # Check pytesseract
        try:
            import pytesseract
            from PIL import Image
            extractors['pytesseract'] = True
        except ImportError:
            pass
        
        return extractors

    def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task to extract tables from a document.

        Args:
            task: Task dictionary with the following keys:
                - file_path: Path to the document file
                - or
                - image_path: Path to the image file
                - or
                - pdf_bytes: PDF file as bytes
                - or
                - image: Image as numpy array
                - pages: Page numbers to extract tables from (optional)
                - output_format: Format of the output (optional)
                - extractors: List of extractors to use (optional)

        Returns:
            Dictionary with extracted tables
        """
        # Check if any extractors are available
        if not any(self.available_extractors.values()):
            return {
                'status': 'error',
                'message': 'No table extraction libraries available'
            }

        # Get the document
        if 'file_path' in task:
            file_path = task['file_path']
            if not os.path.exists(file_path):
                return {
                    'status': 'error',
                    'message': f'File not found: {file_path}'
                }
            
            # Check file type
            if file_path.lower().endswith('.pdf'):
                return self._extract_tables_from_pdf(task)
            elif file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
                return self._extract_tables_from_image(task)
            else:
                return {
                    'status': 'error',
                    'message': f'Unsupported file type: {file_path}'
                }
        elif 'image_path' in task:
            return self._extract_tables_from_image(task)
        elif 'pdf_bytes' in task:
            return self._extract_tables_from_pdf_bytes(task)
        elif 'image' in task:
            return self._extract_tables_from_image(task)
        else:
            return {
                'status': 'error',
                'message': 'No document provided'
            }

    def _extract_tables_from_pdf(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract tables from a PDF file.

        Args:
            task: Task dictionary

        Returns:
            Dictionary with extracted tables
        """
        file_path = task['file_path']
        pages = task.get('pages', 'all')
        output_format = task.get('output_format', 'json')
        extractors = task.get('extractors', None)
        
        # Determine which extractors to use
        if extractors:
            extractors = {extractor: self.available_extractors.get(extractor, False) for extractor in extractors}
        else:
            extractors = self.available_extractors
        
        # Extract tables using available extractors
        tables = []
        
        # Extract with pdfplumber
        if extractors.get('pdfplumber', False):
            try:
                pdfplumber_tables = self._extract_with_pdfplumber(file_path, pages)
                tables.extend(pdfplumber_tables)
                logger.info(f"Extracted {len(pdfplumber_tables)} tables with pdfplumber")
            except Exception as e:
                logger.error(f"Error extracting tables with pdfplumber: {str(e)}")
        
        # Extract with camelot
        if extractors.get('camelot', False):
            try:
                camelot_tables = self._extract_with_camelot(file_path, pages)
                tables.extend(camelot_tables)
                logger.info(f"Extracted {len(camelot_tables)} tables with camelot")
            except Exception as e:
                logger.error(f"Error extracting tables with camelot: {str(e)}")
        
        # Extract with tabula
        if extractors.get('tabula', False):
            try:
                tabula_tables = self._extract_with_tabula(file_path, pages)
                tables.extend(tabula_tables)
                logger.info(f"Extracted {len(tabula_tables)} tables with tabula")
            except Exception as e:
                logger.error(f"Error extracting tables with tabula: {str(e)}")
        
        # Remove duplicates
        tables = self._remove_duplicate_tables(tables)
        logger.info(f"Found {len(tables)} unique tables after deduplication")
        
        # Format the output
        if output_format == 'dataframe':
            # Convert tables to pandas DataFrames
            for table in tables:
                if 'data' in table and not isinstance(table['data'], pd.DataFrame):
                    if isinstance(table['data'], list):
                        if table['data'] and isinstance(table['data'][0], dict):
                            table['dataframe'] = pd.DataFrame(table['data'])
                        elif table['data'] and isinstance(table['data'][0], list):
                            if 'headers' in table and table['headers']:
                                table['dataframe'] = pd.DataFrame(table['data'], columns=table['headers'])
                            else:
                                table['dataframe'] = pd.DataFrame(table['data'])
                        else:
                            table['dataframe'] = pd.DataFrame()
                    else:
                        table['dataframe'] = pd.DataFrame()
                elif 'data' in table and isinstance(table['data'], pd.DataFrame):
                    table['dataframe'] = table['data']
                else:
                    table['dataframe'] = pd.DataFrame()
        
        return {
            'status': 'success',
            'tables': tables,
            'count': len(tables),
            'file_path': file_path
        }

    def _extract_tables_from_pdf_bytes(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract tables from PDF bytes.

        Args:
            task: Task dictionary

        Returns:
            Dictionary with extracted tables
        """
        pdf_bytes = task['pdf_bytes']
        pages = task.get('pages', 'all')
        output_format = task.get('output_format', 'json')
        extractors = task.get('extractors', None)
        
        # Save PDF bytes to a temporary file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp:
            temp_path = temp.name
            temp.write(pdf_bytes)
        
        # Create a new task with the temporary file path
        new_task = {
            'file_path': temp_path,
            'pages': pages,
            'output_format': output_format,
            'extractors': extractors
        }
        
        # Extract tables from the temporary file
        result = self._extract_tables_from_pdf(new_task)
        
        # Remove the temporary file
        os.unlink(temp_path)
        
        return result

    def _extract_tables_from_image(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract tables from an image.

        Args:
            task: Task dictionary

        Returns:
            Dictionary with extracted tables
        """
        # Check if pytesseract is available
        if not self.available_extractors.get('pytesseract', False):
            return {
                'status': 'error',
                'message': 'pytesseract is not available'
            }
        
        # Get the image
        if 'image_path' in task:
            image_path = task['image_path']
            if not os.path.exists(image_path):
                return {
                    'status': 'error',
                    'message': f'Image not found: {image_path}'
                }
        elif 'image' in task:
            image = task['image']
            
            # Save image to a temporary file
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp:
                temp_path = temp.name
                
                # Convert numpy array to image and save
                try:
                    from PIL import Image
                    Image.fromarray(image).save(temp_path)
                    image_path = temp_path
                except Exception as e:
                    return {
                        'status': 'error',
                        'message': f'Error saving image: {str(e)}'
                    }
        else:
            return {
                'status': 'error',
                'message': 'No image provided'
            }
        
        output_format = task.get('output_format', 'json')
        
        # Extract tables using pytesseract
        try:
            import pytesseract
            from PIL import Image
            import cv2
            
            # Load the image
            img = cv2.imread(image_path)
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
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
            tables = []
            for i, contour in enumerate(contours):
                x, y, w, h = cv2.boundingRect(contour)
                
                # Filter by size (tables are usually large)
                if w > img.shape[1] * 0.3 and h > img.shape[0] * 0.1:
                    # Extract table region
                    table_img = gray[y:y+h, x:x+w]
                    
                    # Extract text from the table
                    table_text = pytesseract.image_to_string(table_img)
                    
                    # Extract table data
                    table_data = self._extract_table_data_from_image(table_img)
                    
                    if table_data and len(table_data) > 1:  # At least header and one row
                        # Create table info
                        table_info = {
                            'id': f'ocr_{i+1}',
                            'extraction_method': 'ocr',
                            'table_number': i + 1,
                            'data': table_data[1:],
                            'headers': table_data[0],
                            'rows': len(table_data) - 1,
                            'columns': len(table_data[0]),
                            'bbox': [x, y, x+w, y+h],
                            'text': table_text
                        }
                        
                        tables.append(table_info)
            
            # Format the output
            if output_format == 'dataframe':
                # Convert tables to pandas DataFrames
                for table in tables:
                    if 'data' in table and not isinstance(table['data'], pd.DataFrame):
                        if isinstance(table['data'], list):
                            if 'headers' in table and table['headers']:
                                table['dataframe'] = pd.DataFrame(table['data'], columns=table['headers'])
                            else:
                                table['dataframe'] = pd.DataFrame(table['data'])
                        else:
                            table['dataframe'] = pd.DataFrame()
                    elif 'data' in table and isinstance(table['data'], pd.DataFrame):
                        table['dataframe'] = table['data']
                    else:
                        table['dataframe'] = pd.DataFrame()
            
            # Clean up temporary file if created
            if 'image' in task:
                os.unlink(image_path)
            
            return {
                'status': 'success',
                'tables': tables,
                'count': len(tables),
                'image_path': image_path if 'image_path' in task else None
            }
            
        except Exception as e:
            logger.error(f"Error extracting tables from image: {str(e)}")
            
            # Clean up temporary file if created
            if 'image' in task:
                os.unlink(image_path)
            
            return {
                'status': 'error',
                'message': f'Error extracting tables from image: {str(e)}'
            }

    def _extract_with_pdfplumber(self, pdf_path: str, pages: str) -> List[Dict[str, Any]]:
        """
        Extract tables using pdfplumber.

        Args:
            pdf_path: Path to the PDF file
            pages: Page numbers to extract tables from

        Returns:
            List of dictionaries with table information
        """
        import pdfplumber
        
        tables = []
        
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
                                'rows': len(table) - 1,
                                'columns': len(table[0]),
                                'confidence': 0.8  # Arbitrary confidence for pdfplumber
                            }
                            
                            tables.append(table_info)
        
        return tables

    def _extract_with_camelot(self, pdf_path: str, pages: str) -> List[Dict[str, Any]]:
        """
        Extract tables using Camelot.

        Args:
            pdf_path: Path to the PDF file
            pages: Page numbers to extract tables from

        Returns:
            List of dictionaries with table information
        """
        import camelot
        
        tables = []
        
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
                'rows': len(df),
                'columns': len(df.columns),
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
                'rows': len(df),
                'columns': len(df.columns),
                'confidence': table.accuracy,
                'bbox': table.bbox
            }
            
            tables.append(table_info)
        
        return tables

    def _extract_with_tabula(self, pdf_path: str, pages: str) -> List[Dict[str, Any]]:
        """
        Extract tables using Tabula.

        Args:
            pdf_path: Path to the PDF file
            pages: Page numbers to extract tables from

        Returns:
            List of dictionaries with table information
        """
        import tabula
        
        tables = []
        
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
                    'rows': len(df),
                    'columns': len(df.columns),
                    'confidence': 0.75  # Arbitrary confidence for tabula
                }
                
                tables.append(table_info)
        
        return tables

    def _extract_table_data_from_image(self, table_img) -> List[List[str]]:
        """
        Extract structured data from a table image.

        Args:
            table_img: Table image as numpy array

        Returns:
            List of rows, each containing a list of cell values
        """
        import pytesseract
        
        try:
            # Get data with bounding boxes
            data = pytesseract.image_to_data(
                table_img, config='--psm 6',
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
        tables_by_page = {}
        for table in tables:
            page = table.get('page', 1)
            if page not in tables_by_page:
                tables_by_page[page] = []
            tables_by_page[page].append(table)
        
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
        if 'page' in table1 and 'page' in table2 and table1['page'] != table2['page']:
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
        s1 = str(str1).lower().strip()
        s2 = str(str2).lower().strip()
        
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

    def classify_tables(self, tables: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Classify tables based on content.

        Args:
            tables: List of tables

        Returns:
            List of classified tables
        """
        for table in tables:
            # Get headers
            headers = table.get('headers', [])
            
            # Convert headers to lowercase for case-insensitive matching
            headers_lower = [str(h).lower() for h in headers]
            headers_str = ' '.join(headers_lower)
            
            # Check for portfolio table
            portfolio_keywords = ['security', 'isin', 'quantity', 'price', 'value', 'weight', '%', 'symbol', 'name']
            if any(keyword in headers_str for keyword in portfolio_keywords):
                table['table_type'] = 'portfolio'
                continue
            
            # Check for asset allocation table
            asset_keywords = ['asset', 'class', 'allocation', 'weight', '%', 'value', 'type']
            if any(keyword in headers_str for keyword in asset_keywords):
                table['table_type'] = 'asset_allocation'
                continue
            
            # Check for income statement table
            income_keywords = ['revenue', 'income', 'expense', 'profit', 'loss', 'ebitda', 'net']
            if any(keyword in headers_str for keyword in income_keywords):
                table['table_type'] = 'income_statement'
                continue
            
            # Check for balance sheet table
            balance_keywords = ['asset', 'liability', 'equity', 'total', 'current', 'non-current']
            if any(keyword in headers_str for keyword in balance_keywords):
                table['table_type'] = 'balance_sheet'
                continue
            
            # Default to unknown
            table['table_type'] = 'unknown'
        
        return tables

    def save_results(self, tables: List[Dict[str, Any]], output_path: str) -> str:
        """
        Save extracted tables to a file.

        Args:
            tables: Extracted tables
            output_path: Output file path

        Returns:
            Path to the saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Convert DataFrames to dictionaries for JSON serialization
        serializable_tables = []
        for table in tables:
            serializable_table = table.copy()
            if 'dataframe' in serializable_table:
                del serializable_table['dataframe']
            serializable_tables.append(serializable_table)

        # Save to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                'tables': serializable_tables,
                'count': len(serializable_tables)
            }, f, indent=2)

        return output_path
