"""
Document processing module for extracting text, tables, and financial data from documents.
"""
import os
import logging
import uuid
from typing import Dict, List, Any, Optional
import fitz  # PyMuPDF
import pandas as pd
import re
from PIL import Image

# Import extractors
from extractors.ocr_engine import OCREngine
from extractors.table_extractor import TableExtractor
from extractors.isin_extractor import ISINExtractor
from extractors.excel_extractor import ExcelExtractor

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """
    Process documents to extract text, tables, and financial data.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the document processor.
        
        Args:
            config: Configuration options
        """
        self.config = config or {}
        self.ocr_engine = OCREngine()
        self.table_extractor = TableExtractor()
        self.isin_extractor = ISINExtractor()
        self.excel_extractor = ExcelExtractor()
    
    def process(self, file_path: str) -> Dict[str, Any]:
        """
        Process a document file.
        
        Args:
            file_path: Path to the document file
            
        Returns:
            Extracted document data
        """
        logger.info(f"Processing document: {file_path}")
        
        # Generate document ID
        document_id = str(uuid.uuid4())
        
        # Get file extension
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()
        
        # Process based on file type
        if ext in ['.pdf']:
            return self._process_pdf(file_path, document_id)
        elif ext in ['.xlsx', '.xls']:
            return self._process_excel(file_path, document_id)
        elif ext in ['.csv']:
            return self._process_csv(file_path, document_id)
        else:
            raise ValueError(f"Unsupported file type: {ext}")
    
    def _process_pdf(self, file_path: str, document_id: str) -> Dict[str, Any]:
        """
        Process a PDF file.
        
        Args:
            file_path: Path to the PDF file
            document_id: Document ID
            
        Returns:
            Extracted document data
        """
        logger.info(f"Processing PDF: {file_path}")
        
        # Extract text using PyMuPDF
        doc = fitz.open(file_path)
        
        # Extract basic metadata
        metadata = {
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
            "subject": doc.metadata.get("subject", ""),
            "keywords": doc.metadata.get("keywords", ""),
            "creator": doc.metadata.get("creator", ""),
            "producer": doc.metadata.get("producer", ""),
            "page_count": len(doc),
            "file_size": os.path.getsize(file_path),
        }
        
        # Extract text from each page
        pages = []
        full_text = ""
        
        for page_num, page in enumerate(doc):
            page_text = page.get_text()
            full_text += page_text
            
            # Extract images if needed
            images = self._extract_images_from_page(page)
            
            pages.append({
                "page_num": page_num + 1,
                "text": page_text,
                "images": images
            })
        
        # Extract tables
        tables = self.table_extractor.extract_tables(file_path)
        
        # Extract ISINs and financial data
        isins = self.isin_extractor.extract_isins(full_text)
        financial_data = self.isin_extractor.extract_financial_data(full_text, tables)
        
        # Compile results
        result = {
            "document_id": document_id,
            "file_path": file_path,
            "file_type": "pdf",
            "metadata": metadata,
            "pages": pages,
            "full_text": full_text,
            "tables": tables,
            "isins": isins,
            "financial_data": financial_data
        }
        
        return result
    
    def _process_excel(self, file_path: str, document_id: str) -> Dict[str, Any]:
        """
        Process an Excel file.
        
        Args:
            file_path: Path to the Excel file
            document_id: Document ID
            
        Returns:
            Extracted document data
        """
        logger.info(f"Processing Excel: {file_path}")
        
        # Extract data from Excel
        sheets_data = self.excel_extractor.extract_sheets(file_path)
        
        # Extract ISINs and financial data
        all_text = " ".join([sheet["text"] for sheet in sheets_data])
        isins = self.isin_extractor.extract_isins(all_text)
        financial_data = self.isin_extractor.extract_financial_data_from_excel(sheets_data)
        
        # Compile results
        result = {
            "document_id": document_id,
            "file_path": file_path,
            "file_type": "excel",
            "metadata": {
                "file_size": os.path.getsize(file_path),
                "sheet_count": len(sheets_data)
            },
            "sheets": sheets_data,
            "full_text": all_text,
            "isins": isins,
            "financial_data": financial_data
        }
        
        return result
    
    def _process_csv(self, file_path: str, document_id: str) -> Dict[str, Any]:
        """
        Process a CSV file.
        
        Args:
            file_path: Path to the CSV file
            document_id: Document ID
            
        Returns:
            Extracted document data
        """
        logger.info(f"Processing CSV: {file_path}")
        
        # Read CSV file
        try:
            df = pd.read_csv(file_path)
            csv_data = df.to_dict(orient="records")
            csv_text = df.to_string()
        except Exception as e:
            logger.error(f"Error reading CSV file: {str(e)}")
            # Try with different encoding
            try:
                df = pd.read_csv(file_path, encoding="latin1")
                csv_data = df.to_dict(orient="records")
                csv_text = df.to_string()
            except Exception as e2:
                logger.error(f"Error reading CSV file with latin1 encoding: {str(e2)}")
                raise ValueError(f"Could not read CSV file: {str(e2)}")
        
        # Extract ISINs and financial data
        isins = self.isin_extractor.extract_isins(csv_text)
        financial_data = self.isin_extractor.extract_financial_data_from_csv(csv_data)
        
        # Compile results
        result = {
            "document_id": document_id,
            "file_path": file_path,
            "file_type": "csv",
            "metadata": {
                "file_size": os.path.getsize(file_path),
                "row_count": len(csv_data),
                "column_count": len(df.columns) if not df.empty else 0
            },
            "data": csv_data,
            "full_text": csv_text,
            "isins": isins,
            "financial_data": financial_data
        }
        
        return result
    
    def _extract_images_from_page(self, page) -> List[Dict[str, Any]]:
        """
        Extract images from a PDF page.
        
        Args:
            page: PyMuPDF page object
            
        Returns:
            List of extracted images
        """
        images = []
        
        # Extract images
        image_list = page.get_images(full=True)
        
        for img_index, img_info in enumerate(image_list):
            xref = img_info[0]
            base_image = page.parent.extract_image(xref)
            
            if base_image:
                image_data = {
                    "index": img_index,
                    "width": base_image["width"],
                    "height": base_image["height"],
                    "format": base_image["ext"],
                }
                images.append(image_data)
        
        return images
