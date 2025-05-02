"""
Enhanced Table Extractor for financial documents.

This module provides enhanced table extraction capabilities using multiple libraries.
"""

import os
import sys
import json
import logging
import tempfile
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np
import camelot
import tabula
import pdfplumber
import cv2
import fitz  # PyMuPDF
from pdf2image import convert_from_path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedTableExtractor:
    """
    Enhanced table extractor using multiple libraries.
    """

    def __init__(self, debug: bool = False):
        """
        Initialize the enhanced table extractor.

        Args:
            debug: Whether to print debug information
        """
        self.debug = debug

    def extract_tables(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract tables from a PDF using multiple methods.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary containing extracted tables
        """
        if self.debug:
            logger.info(f"Extracting tables from {pdf_path}")

        results = {
            "tables": [],
            "metadata": {
                "filename": os.path.basename(pdf_path),
                "extraction_methods": []
            }
        }

        # Try Camelot extraction
        try:
            camelot_tables = self._extract_with_camelot(pdf_path)
            if camelot_tables:
                results["tables"].extend(camelot_tables)
                results["metadata"]["extraction_methods"].append("camelot")
                if self.debug:
                    logger.info(f"Extracted {len(camelot_tables)} tables with Camelot")
        except Exception as e:
            logger.error(f"Camelot extraction failed: {str(e)}")

        # Try Tabula extraction
        try:
            tabula_tables = self._extract_with_tabula(pdf_path)
            if tabula_tables:
                results["tables"].extend(tabula_tables)
                results["metadata"]["extraction_methods"].append("tabula")
                if self.debug:
                    logger.info(f"Extracted {len(tabula_tables)} tables with Tabula")
        except Exception as e:
            logger.error(f"Tabula extraction failed: {str(e)}")

        # Try PDFPlumber extraction
        try:
            pdfplumber_tables = self._extract_with_pdfplumber(pdf_path)
            if pdfplumber_tables:
                results["tables"].extend(pdfplumber_tables)
                results["metadata"]["extraction_methods"].append("pdfplumber")
                if self.debug:
                    logger.info(f"Extracted {len(pdfplumber_tables)} tables with PDFPlumber")
        except Exception as e:
            logger.error(f"PDFPlumber extraction failed: {str(e)}")

        # Try visual table detection
        try:
            visual_tables = self._extract_with_visual_detection(pdf_path)
            if visual_tables:
                results["tables"].extend(visual_tables)
                results["metadata"]["extraction_methods"].append("visual_detection")
                if self.debug:
                    logger.info(f"Extracted {len(visual_tables)} tables with visual detection")
        except Exception as e:
            logger.error(f"Visual table detection failed: {str(e)}")

        # Deduplicate tables
        results["tables"] = self._deduplicate_tables(results["tables"])
        
        # Add table quality scores
        results["tables"] = self._add_quality_scores(results["tables"])
        
        # Sort tables by quality score
        results["tables"] = sorted(results["tables"], key=lambda x: x.get("quality_score", 0), reverse=True)
        
        return results

    def _extract_with_camelot(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract tables using Camelot.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            List of extracted tables
        """
        tables = []
        
        # Try lattice mode first (for tables with borders)
        lattice_tables = camelot.read_pdf(pdf_path, pages='all', flavor='lattice')
        
        for i, table in enumerate(lattice_tables):
            if table.df.empty:
                continue
                
            table_data = {
                "id": f"lattice_{i+1}",
                "page": table.page,
                "method": "camelot_lattice",
                "accuracy": table.accuracy,
                "data": table.df.to_dict('records'),
                "headers": table.parsing_report.get('header_rows', []),
                "rows": table.df.values.tolist()
            }
            
            # Convert DataFrame to avoid JSON serialization issues
            table_data["dataframe"] = table.df
            
            tables.append(table_data)
        
        # Try stream mode (for tables without borders)
        stream_tables = camelot.read_pdf(pdf_path, pages='all', flavor='stream')
        
        for i, table in enumerate(stream_tables):
            if table.df.empty:
                continue
                
            table_data = {
                "id": f"stream_{i+1}",
                "page": table.page,
                "method": "camelot_stream",
                "accuracy": table.accuracy,
                "data": table.df.to_dict('records'),
                "headers": table.parsing_report.get('header_rows', []),
                "rows": table.df.values.tolist()
            }
            
            # Convert DataFrame to avoid JSON serialization issues
            table_data["dataframe"] = table.df
            
            tables.append(table_data)
            
        return tables

    def _extract_with_tabula(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract tables using Tabula.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            List of extracted tables
        """
        tables = []
        
        # Extract tables with default settings
        dfs = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)
        
        for i, df in enumerate(dfs):
            if df.empty:
                continue
                
            table_data = {
                "id": f"tabula_{i+1}",
                "page": i + 1,  # Approximate page number
                "method": "tabula",
                "accuracy": 90.0,  # Tabula doesn't provide accuracy scores
                "data": df.to_dict('records'),
                "headers": [0] if not df.columns.equals(pd.RangeIndex(start=0, stop=len(df.columns))) else [],
                "rows": df.values.tolist()
            }
            
            # Convert DataFrame to avoid JSON serialization issues
            table_data["dataframe"] = df
            
            tables.append(table_data)
            
        # Try with different settings for lattice tables
        try:
            lattice_dfs = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True, lattice=True)
            
            for i, df in enumerate(lattice_dfs):
                if df.empty:
                    continue
                    
                table_data = {
                    "id": f"tabula_lattice_{i+1}",
                    "page": i + 1,  # Approximate page number
                    "method": "tabula_lattice",
                    "accuracy": 85.0,  # Tabula doesn't provide accuracy scores
                    "data": df.to_dict('records'),
                    "headers": [0] if not df.columns.equals(pd.RangeIndex(start=0, stop=len(df.columns))) else [],
                    "rows": df.values.tolist()
                }
                
                # Convert DataFrame to avoid JSON serialization issues
                table_data["dataframe"] = df
                
                tables.append(table_data)
        except:
            pass
            
        return tables

    def _extract_with_pdfplumber(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract tables using PDFPlumber.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            List of extracted tables
        """
        tables = []
        
        # Open the PDF
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_tables = page.extract_tables()
                
                for i, table_data in enumerate(page_tables):
                    if not table_data or len(table_data) == 0:
                        continue
                        
                    # Convert to DataFrame
                    df = pd.DataFrame(table_data)
                    
                    # Use first row as header if it looks like a header
                    if len(df) > 1:
                        headers = [0]
                        df.columns = df.iloc[0]
                        df = df.iloc[1:]
                    else:
                        headers = []
                    
                    table_info = {
                        "id": f"pdfplumber_{page_num+1}_{i+1}",
                        "page": page_num + 1,
                        "method": "pdfplumber",
                        "accuracy": 80.0,  # PDFPlumber doesn't provide accuracy scores
                        "data": df.to_dict('records'),
                        "headers": headers,
                        "rows": df.values.tolist()
                    }
                    
                    # Convert DataFrame to avoid JSON serialization issues
                    table_info["dataframe"] = df
                    
                    tables.append(table_info)
                    
        return tables

    def _extract_with_visual_detection(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract tables using visual detection techniques.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            List of extracted tables
        """
        tables = []
        
        # Convert PDF to images
        with tempfile.TemporaryDirectory() as temp_dir:
            images = convert_from_path(pdf_path)
            
            for i, image in enumerate(images):
                # Save image to temporary file
                image_path = os.path.join(temp_dir, f"page_{i+1}.png")
                image.save(image_path)
                
                # Detect tables in the image
                detected_tables = self._detect_tables_in_image(image_path, i+1)
                tables.extend(detected_tables)
                
        return tables

    def _detect_tables_in_image(self, image_path: str, page_num: int) -> List[Dict[str, Any]]:
        """
        Detect tables in an image using OpenCV.

        Args:
            image_path: Path to the image
            page_num: Page number

        Returns:
            List of detected tables
        """
        tables = []
        
        # Read the image
        img = cv2.imread(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours by size
        min_area = img.shape[0] * img.shape[1] * 0.01  # At least 1% of the image
        table_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]
        
        # Process each potential table
        for i, contour in enumerate(table_contours):
            x, y, w, h = cv2.boundingRect(contour)
            
            # Skip if too small
            if w < 100 or h < 100:
                continue
                
            # Create a table entry
            table_data = {
                "id": f"visual_{page_num}_{i+1}",
                "page": page_num,
                "method": "visual_detection",
                "accuracy": 70.0,  # Visual detection is less accurate
                "bbox": [x, y, x+w, y+h],
                "data": [],  # No data extracted yet
                "headers": [],
                "rows": []
            }
            
            # Create an empty DataFrame
            df = pd.DataFrame()
            table_data["dataframe"] = df
            
            tables.append(table_data)
            
        return tables

    def _deduplicate_tables(self, tables: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deduplicate tables based on content similarity.

        Args:
            tables: List of tables

        Returns:
            Deduplicated list of tables
        """
        if not tables:
            return []
            
        # Group tables by page
        tables_by_page = {}
        for table in tables:
            page = table.get("page", 0)
            if page not in tables_by_page:
                tables_by_page[page] = []
            tables_by_page[page].append(table)
            
        # Deduplicate tables on each page
        deduplicated_tables = []
        for page, page_tables in tables_by_page.items():
            # Sort by accuracy
            page_tables = sorted(page_tables, key=lambda x: x.get("accuracy", 0), reverse=True)
            
            # Keep track of tables we've seen
            seen_tables = set()
            
            for table in page_tables:
                # Create a fingerprint of the table content
                fingerprint = self._create_table_fingerprint(table)
                
                # Skip if we've seen a similar table
                if fingerprint in seen_tables:
                    continue
                    
                # Add to deduplicated tables
                deduplicated_tables.append(table)
                seen_tables.add(fingerprint)
                
        return deduplicated_tables

    def _create_table_fingerprint(self, table: Dict[str, Any]) -> str:
        """
        Create a fingerprint for a table based on its content.

        Args:
            table: Table data

        Returns:
            Table fingerprint
        """
        # Get the DataFrame
        df = table.get("dataframe")
        
        if df is None or df.empty:
            return ""
            
        # Create a simplified representation of the table
        rows = []
        for _, row in df.iterrows():
            # Convert row to string and remove whitespace
            row_str = "".join(str(val).strip() for val in row.values)
            rows.append(row_str)
            
        # Join rows and return
        return "|".join(rows)

    def _add_quality_scores(self, tables: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Add quality scores to tables based on various metrics.

        Args:
            tables: List of tables

        Returns:
            Tables with quality scores
        """
        for table in tables:
            # Start with the accuracy score
            quality_score = table.get("accuracy", 0)
            
            # Get the DataFrame
            df = table.get("dataframe")
            
            if df is not None and not df.empty:
                # Add points for number of rows and columns
                quality_score += min(df.shape[0] * 0.5, 10)  # Up to 10 points for rows
                quality_score += min(df.shape[1] * 2, 10)    # Up to 10 points for columns
                
                # Add points for non-empty cells
                non_empty_cells = df.notna().sum().sum()
                total_cells = df.size
                if total_cells > 0:
                    quality_score += (non_empty_cells / total_cells) * 10  # Up to 10 points for cell coverage
                
                # Add points for numeric content (financial tables often have numbers)
                numeric_cells = df.apply(lambda x: pd.to_numeric(x, errors='coerce')).notna().sum().sum()
                if total_cells > 0:
                    quality_score += (numeric_cells / total_cells) * 10  # Up to 10 points for numeric content
            
            # Add the quality score to the table
            table["quality_score"] = quality_score
            
        return tables

def main():
    """
    Main function for testing the enhanced table extractor.
    """
    import argparse
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Extract tables from a PDF using multiple methods.')
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('--output', help='Path to save the output JSON file')
    parser.add_argument('--debug', action='store_true', help='Print debug information')
    
    args = parser.parse_args()
    
    # Create extractor
    extractor = EnhancedTableExtractor(debug=args.debug)
    
    # Extract tables
    tables = extractor.extract_tables(args.pdf_path)
    
    # Remove DataFrames before serializing to JSON
    for table in tables["tables"]:
        if "dataframe" in table:
            del table["dataframe"]
    
    # Save or print tables
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(tables, f, indent=2, ensure_ascii=False)
        logger.info(f"Tables saved to {args.output}")
    else:
        print(json.dumps(tables, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
