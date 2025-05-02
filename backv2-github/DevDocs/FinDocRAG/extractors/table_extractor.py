"""
Table extractor for structured data extraction from documents.
"""
import os
import logging
import pandas as pd
import camelot
import tabula
import re
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class TableExtractor:
    """
    Extract tables from documents.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the table extractor.
        
        Args:
            config: Configuration options
        """
        self.config = config or {}
    
    def extract_tables(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Extract tables from a document.
        
        Args:
            file_path: Path to the document
            
        Returns:
            List of extracted tables
        """
        # Get file extension
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()
        
        if ext == '.pdf':
            return self._extract_tables_from_pdf(file_path)
        elif ext in ['.xlsx', '.xls']:
            return self._extract_tables_from_excel(file_path)
        elif ext == '.csv':
            return self._extract_tables_from_csv(file_path)
        else:
            logger.warning(f"Unsupported file type for table extraction: {ext}")
            return []
    
    def _extract_tables_from_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract tables from a PDF.
        
        Args:
            pdf_path: Path to the PDF
            
        Returns:
            List of extracted tables
        """
        tables = []
        
        # Try with camelot first (better for bordered tables)
        try:
            camelot_tables = camelot.read_pdf(pdf_path, pages='all', flavor='lattice')
            
            for i, table in enumerate(camelot_tables):
                if table.df.empty:
                    continue
                
                # Convert to list of dictionaries
                headers = table.df.iloc[0].tolist()
                data = []
                
                for _, row in table.df.iloc[1:].iterrows():
                    row_dict = {}
                    for j, header in enumerate(headers):
                        if j < len(row):
                            row_dict[header] = row[j]
                    data.append(row_dict)
                
                tables.append({
                    "table_id": f"camelot_{i+1}",
                    "page": table.page,
                    "headers": headers,
                    "data": data,
                    "extraction_method": "camelot"
                })
        except Exception as e:
            logger.warning(f"Camelot table extraction failed: {str(e)}")
        
        # Try with tabula (better for unbordered tables)
        try:
            tabula_tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)
            
            for i, df in enumerate(tabula_tables):
                if df.empty:
                    continue
                
                # Clean up headers
                headers = [str(col).strip() for col in df.columns]
                
                # Convert to list of dictionaries
                data = df.to_dict(orient='records')
                
                # Clean up data
                clean_data = []
                for row in data:
                    clean_row = {}
                    for key, value in row.items():
                        clean_key = str(key).strip()
                        clean_value = str(value).strip() if pd.notna(value) else ""
                        clean_row[clean_key] = clean_value
                    clean_data.append(clean_row)
                
                tables.append({
                    "table_id": f"tabula_{i+1}",
                    "page": i + 1,  # Tabula doesn't provide page numbers
                    "headers": headers,
                    "data": clean_data,
                    "extraction_method": "tabula"
                })
        except Exception as e:
            logger.warning(f"Tabula table extraction failed: {str(e)}")
        
        # Deduplicate tables
        unique_tables = []
        seen_data = set()
        
        for table in tables:
            # Create a hash of the table data
            table_hash = str(table["headers"]) + str(table["data"])
            
            if table_hash not in seen_data:
                seen_data.add(table_hash)
                unique_tables.append(table)
        
        return unique_tables
    
    def _extract_tables_from_excel(self, excel_path: str) -> List[Dict[str, Any]]:
        """
        Extract tables from an Excel file.
        
        Args:
            excel_path: Path to the Excel file
            
        Returns:
            List of extracted tables
        """
        tables = []
        
        try:
            # Read all sheets
            excel_file = pd.ExcelFile(excel_path)
            
            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(excel_path, sheet_name=sheet_name)
                
                if df.empty:
                    continue
                
                # Clean up headers
                headers = [str(col).strip() for col in df.columns]
                
                # Convert to list of dictionaries
                data = df.to_dict(orient='records')
                
                # Clean up data
                clean_data = []
                for row in data:
                    clean_row = {}
                    for key, value in row.items():
                        clean_key = str(key).strip()
                        clean_value = str(value).strip() if pd.notna(value) else ""
                        clean_row[clean_key] = clean_value
                    clean_data.append(clean_row)
                
                tables.append({
                    "table_id": sheet_name,
                    "sheet": sheet_name,
                    "headers": headers,
                    "data": clean_data,
                    "extraction_method": "excel"
                })
        except Exception as e:
            logger.error(f"Error extracting tables from Excel {excel_path}: {str(e)}")
        
        return tables
    
    def _extract_tables_from_csv(self, csv_path: str) -> List[Dict[str, Any]]:
        """
        Extract tables from a CSV file.
        
        Args:
            csv_path: Path to the CSV file
            
        Returns:
            List of extracted tables
        """
        tables = []
        
        try:
            # Try with default encoding
            df = pd.read_csv(csv_path)
        except Exception as e:
            logger.warning(f"Error reading CSV with default encoding: {str(e)}")
            try:
                # Try with Latin-1 encoding
                df = pd.read_csv(csv_path, encoding='latin1')
            except Exception as e2:
                logger.error(f"Error reading CSV with Latin-1 encoding: {str(e2)}")
                return []
        
        if df.empty:
            return []
        
        # Clean up headers
        headers = [str(col).strip() for col in df.columns]
        
        # Convert to list of dictionaries
        data = df.to_dict(orient='records')
        
        # Clean up data
        clean_data = []
        for row in data:
            clean_row = {}
            for key, value in row.items():
                clean_key = str(key).strip()
                clean_value = str(value).strip() if pd.notna(value) else ""
                clean_row[clean_key] = clean_value
            clean_data.append(clean_row)
        
        tables.append({
            "table_id": "csv_table",
            "headers": headers,
            "data": clean_data,
            "extraction_method": "csv"
        })
        
        return tables
