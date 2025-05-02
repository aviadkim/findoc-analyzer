"""
Improved Securities Extractor for Financial Documents.

This module provides enhanced securities extraction capabilities
specifically designed for financial documents, with a focus on
extracting accurate and complete securities information from tables.
"""

import os
import logging
import json
import re
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple, Union
import fitz  # PyMuPDF
import tempfile
from PIL import Image
import cv2

# Import our custom modules
from advanced_image_processor import AdvancedImageProcessor
from enhanced_table_analyzer import EnhancedTableAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImprovedSecuritiesExtractor:
    """
    Improved securities extractor for financial documents.
    """
    
    def __init__(
        self,
        languages: List[str] = ['eng'],
        debug: bool = False,
        output_dir: Optional[str] = None
    ):
        """
        Initialize the improved securities extractor.
        
        Args:
            languages: List of language codes for OCR
            debug: Whether to enable debug mode
            output_dir: Directory to save debug information
        """
        self.languages = languages
        self.debug = debug
        
        # Create output directory if provided
        if output_dir:
            self.output_dir = output_dir
            os.makedirs(output_dir, exist_ok=True)
        else:
            self.output_dir = tempfile.mkdtemp()
        
        # Initialize image processor
        self.image_processor = AdvancedImageProcessor(
            languages=languages,
            debug=debug,
            output_dir=os.path.join(self.output_dir, "image_processor") if output_dir else None
        )
        
        # Initialize table analyzer
        self.table_analyzer = EnhancedTableAnalyzer(
            debug=debug,
            output_dir=os.path.join(self.output_dir, "table_analyzer") if output_dir else None
        )
        
        # ISIN pattern
        self.isin_pattern = r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$'
    
    def extract_securities(self, document_path: str) -> Dict[str, Any]:
        """
        Extract securities from a financial document.
        
        Args:
            document_path: Path to the document
            
        Returns:
            Dictionary with extracted securities
        """
        logger.info(f"Extracting securities from {document_path}")
        
        # Check file extension
        _, ext = os.path.splitext(document_path)
        ext = ext.lower()
        
        if ext == '.pdf':
            return self._extract_from_pdf(document_path)
        elif ext in ['.xlsx', '.xls']:
            return self._extract_from_excel(document_path)
        elif ext in ['.jpg', '.jpeg', '.png', '.tiff', '.tif']:
            return self._extract_from_image(document_path)
        else:
            logger.warning(f"Unsupported file type: {ext}")
            return {"error": f"Unsupported file type: {ext}"}
    
    def _extract_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract securities from a PDF document.
        
        Args:
            pdf_path: Path to the PDF document
            
        Returns:
            Dictionary with extracted securities
        """
        logger.info(f"Extracting securities from PDF: {pdf_path}")
        
        # Open the PDF
        doc = fitz.open(pdf_path)
        
        # Initialize results
        all_securities = []
        all_tables = []
        page_results = []
        
        # Process each page
        for page_num, page in enumerate(doc):
            logger.info(f"Processing page {page_num + 1}/{len(doc)}")
            
            # Extract page as image
            pix = page.get_pixmap(dpi=300)
            img_path = os.path.join(self.output_dir, f"page_{page_num + 1}.png")
            pix.save(img_path)
            
            # Process the page image
            page_result = self._process_page_image(img_path, page_num + 1)
            page_results.append(page_result)
            
            # Add tables and securities to overall results
            all_tables.extend(page_result.get("tables", []))
            all_securities.extend(page_result.get("securities", []))
        
        # Close the document
        doc.close()
        
        # Merge and deduplicate securities
        merged_securities = self._merge_securities(all_securities)
        
        # Enhance securities with additional information
        enhanced_securities = self._enhance_securities(merged_securities)
        
        return {
            "document_path": pdf_path,
            "page_count": len(doc),
            "tables_count": len(all_tables),
            "securities_count": len(enhanced_securities),
            "securities": enhanced_securities,
            "tables": all_tables,
            "page_results": page_results
        }
    
    def _extract_from_excel(self, excel_path: str) -> Dict[str, Any]:
        """
        Extract securities from an Excel document.
        
        Args:
            excel_path: Path to the Excel document
            
        Returns:
            Dictionary with extracted securities
        """
        logger.info(f"Extracting securities from Excel: {excel_path}")
        
        # Read Excel file
        try:
            # Read all sheets
            excel_data = pd.read_excel(excel_path, sheet_name=None)
            
            # Initialize results
            all_securities = []
            all_tables = []
            sheet_results = []
            
            # Process each sheet
            for sheet_name, df in excel_data.items():
                logger.info(f"Processing sheet: {sheet_name}")
                
                # Analyze table structure
                table_analysis = self.table_analyzer.analyze_table(df)
                
                # Add table to results
                table_info = {
                    "sheet_name": sheet_name,
                    "table_type": table_analysis.get("table_type", "unknown"),
                    "column_types": table_analysis.get("column_types", {}),
                    "headers": df.columns.tolist(),
                    "row_count": len(df)
                }
                all_tables.append(table_info)
                
                # Add securities to results
                securities = table_analysis.get("securities", [])
                for security in securities:
                    security["sheet_name"] = sheet_name
                
                all_securities.extend(securities)
                
                # Add sheet result
                sheet_results.append({
                    "sheet_name": sheet_name,
                    "table_type": table_analysis.get("table_type", "unknown"),
                    "securities_count": len(securities),
                    "securities": securities
                })
            
            # Merge and deduplicate securities
            merged_securities = self._merge_securities(all_securities)
            
            # Enhance securities with additional information
            enhanced_securities = self._enhance_securities(merged_securities)
            
            return {
                "document_path": excel_path,
                "sheet_count": len(excel_data),
                "tables_count": len(all_tables),
                "securities_count": len(enhanced_securities),
                "securities": enhanced_securities,
                "tables": all_tables,
                "sheet_results": sheet_results
            }
        except Exception as e:
            logger.error(f"Error extracting from Excel: {str(e)}")
            return {"error": f"Error extracting from Excel: {str(e)}"}
    
    def _extract_from_image(self, image_path: str) -> Dict[str, Any]:
        """
        Extract securities from an image.
        
        Args:
            image_path: Path to the image
            
        Returns:
            Dictionary with extracted securities
        """
        logger.info(f"Extracting securities from image: {image_path}")
        
        # Process the image
        image_result = self._process_page_image(image_path, 1)
        
        # Enhance securities with additional information
        enhanced_securities = self._enhance_securities(image_result.get("securities", []))
        
        return {
            "document_path": image_path,
            "page_count": 1,
            "tables_count": len(image_result.get("tables", [])),
            "securities_count": len(enhanced_securities),
            "securities": enhanced_securities,
            "tables": image_result.get("tables", []),
            "page_results": [image_result]
        }
    
    def _process_page_image(self, image_path: str, page_num: int) -> Dict[str, Any]:
        """
        Process a page image to extract tables and securities.
        
        Args:
            image_path: Path to the page image
            page_num: Page number
            
        Returns:
            Dictionary with processing results
        """
        # Process the image with advanced image processor
        image_result = self.image_processor.process_image(image_path)
        
        # Extract tables from the image
        tables = image_result.get("tables", [])
        
        # Initialize securities list
        securities = []
        
        # Process each table
        for table in tables:
            # Create a DataFrame from table cells
            df = self._create_dataframe_from_cells(table.get("cells", []))
            
            if df is not None and not df.empty:
                # Analyze table structure
                table_analysis = self.table_analyzer.analyze_table(df)
                
                # Add table analysis to table info
                table["table_type"] = table_analysis.get("table_type", "unknown")
                table["column_types"] = table_analysis.get("column_types", {})
                
                # Add securities to results
                table_securities = table_analysis.get("securities", [])
                for security in table_securities:
                    security["page"] = page_num
                    security["table_id"] = table.get("id")
                
                securities.extend(table_securities)
        
        # Extract ISINs from OCR text
        ocr_text = image_result.get("ocr_results", {}).get("text", "")
        isin_securities = self._extract_isins_from_text(ocr_text, page_num)
        
        # Merge securities from tables and OCR
        all_securities = securities + isin_securities
        
        return {
            "page": page_num,
            "tables": tables,
            "securities": all_securities,
            "ocr_text": ocr_text
        }
    
    def _create_dataframe_from_cells(self, cells: List[Dict[str, Any]]) -> Optional[pd.DataFrame]:
        """
        Create a DataFrame from table cells.
        
        Args:
            cells: List of cell information
            
        Returns:
            DataFrame or None if creation fails
        """
        if not cells:
            return None
        
        try:
            # Get maximum row and column indices
            max_row = max(cell.get("row", 0) for cell in cells)
            max_col = max(cell.get("column", 0) for cell in cells)
            
            # Create empty DataFrame
            df = pd.DataFrame(index=range(max_row + 1), columns=range(max_col + 1))
            
            # Fill DataFrame with cell values
            for cell in cells:
                row = cell.get("row", 0)
                col = cell.get("column", 0)
                text = cell.get("text", "")
                
                if pd.notna(row) and pd.notna(col):
                    df.iloc[row, col] = text
            
            # Clean up DataFrame
            df = df.replace('', np.nan).dropna(how='all').dropna(axis=1, how='all')
            
            # If first row looks like headers, use it as column names
            if not df.empty and len(df) > 1:
                first_row = df.iloc[0]
                if all(pd.notna(val) and isinstance(val, str) for val in first_row):
                    df.columns = first_row
                    df = df.iloc[1:].reset_index(drop=True)
            
            return df
        except Exception as e:
            logger.warning(f"Error creating DataFrame from cells: {str(e)}")
            return None
    
    def _extract_isins_from_text(self, text: str, page_num: int) -> List[Dict[str, Any]]:
        """
        Extract ISINs from text.
        
        Args:
            text: Text to extract ISINs from
            page_num: Page number
            
        Returns:
            List of securities with ISINs
        """
        securities = []
        
        # Find all ISINs in text
        isin_matches = re.finditer(self.isin_pattern, text)
        
        for match in isin_matches:
            isin = match.group(0)
            
            # Create security object
            security = {
                "isin": isin,
                "page": page_num,
                "extraction_method": "ocr_text"
            }
            
            # Try to extract security name
            context = text[max(0, match.start() - 100):min(len(text), match.end() + 100)]
            security_name = self._extract_security_name_from_context(context, isin)
            
            if security_name:
                security["security_name"] = security_name
            
            securities.append(security)
        
        return securities
    
    def _extract_security_name_from_context(self, context: str, isin: str) -> Optional[str]:
        """
        Extract security name from context around an ISIN.
        
        Args:
            context: Text context around the ISIN
            isin: ISIN code
            
        Returns:
            Security name or None if extraction fails
        """
        # Try to find security name before ISIN
        isin_pos = context.find(isin)
        if isin_pos > 0:
            before_isin = context[:isin_pos].strip()
            
            # Look for the last line break or multiple spaces
            line_break_pos = max(before_isin.rfind('\n'), before_isin.rfind('  '))
            
            if line_break_pos >= 0:
                return before_isin[line_break_pos:].strip()
        
        return None
    
    def _merge_securities(self, securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Merge and deduplicate securities.
        
        Args:
            securities: List of securities
            
        Returns:
            Merged list of securities
        """
        if not securities:
            return []
        
        # Group securities by ISIN
        isin_groups = {}
        
        for security in securities:
            isin = security.get("isin")
            
            if isin:
                if isin in isin_groups:
                    isin_groups[isin].append(security)
                else:
                    isin_groups[isin] = [security]
        
        # Merge securities in each group
        merged_securities = []
        
        for isin, group in isin_groups.items():
            # Start with an empty merged security
            merged = {"isin": isin}
            
            # Merge fields from all securities in the group
            for security in group:
                for key, value in security.items():
                    if key != "isin" and pd.notna(value):
                        # If the field already exists, keep the non-null value
                        if key not in merged or pd.isna(merged[key]):
                            merged[key] = value
            
            merged_securities.append(merged)
        
        # Add securities without ISIN
        for security in securities:
            if not security.get("isin") and security.get("security_name"):
                # Check if this security is already included
                name = security.get("security_name")
                if not any(s.get("security_name") == name for s in merged_securities):
                    merged_securities.append(security)
        
        return merged_securities
    
    def _enhance_securities(self, securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Enhance securities with additional information.
        
        Args:
            securities: List of securities
            
        Returns:
            Enhanced list of securities
        """
        enhanced_securities = []
        
        for security in securities:
            # Create a copy of the security
            enhanced = security.copy()
            
            # Ensure all required fields are present
            for field in ["isin", "security_name", "quantity", "price", "acquisition_price", "value", "currency", "weight"]:
                if field not in enhanced or pd.isna(enhanced.get(field)):
                    enhanced[field] = None
            
            # Clean up numeric fields
            for field in ["quantity", "price", "acquisition_price", "value", "weight"]:
                if field in enhanced and enhanced[field] is not None:
                    try:
                        enhanced[field] = float(str(enhanced[field]).replace(',', '').replace('%', ''))
                    except:
                        enhanced[field] = None
            
            # Add to enhanced securities
            enhanced_securities.append(enhanced)
        
        return enhanced_securities
