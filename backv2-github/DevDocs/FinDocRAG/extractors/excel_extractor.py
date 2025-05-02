"""
Excel extractor for structured data extraction from Excel files.
"""
import logging
import pandas as pd
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class ExcelExtractor:
    """
    Extract data from Excel files.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the Excel extractor.
        
        Args:
            config: Configuration options
        """
        self.config = config or {}
    
    def extract_sheets(self, excel_path: str) -> List[Dict[str, Any]]:
        """
        Extract data from all sheets in an Excel file.
        
        Args:
            excel_path: Path to the Excel file
            
        Returns:
            List of sheet data
        """
        sheets_data = []
        
        try:
            # Read Excel file
            excel_file = pd.ExcelFile(excel_path)
            
            # Process each sheet
            for sheet_name in excel_file.sheet_names:
                sheet_data = self._extract_sheet(excel_path, sheet_name)
                sheets_data.append(sheet_data)
            
            return sheets_data
        except Exception as e:
            logger.error(f"Error extracting data from Excel file {excel_path}: {str(e)}")
            return []
    
    def _extract_sheet(self, excel_path: str, sheet_name: str) -> Dict[str, Any]:
        """
        Extract data from a single sheet.
        
        Args:
            excel_path: Path to the Excel file
            sheet_name: Name of the sheet
            
        Returns:
            Sheet data
        """
        try:
            # Read sheet
            df = pd.read_excel(excel_path, sheet_name=sheet_name)
            
            # Convert to records
            records = df.to_dict(orient="records")
            
            # Convert to string for text extraction
            text = df.to_string()
            
            # Get sheet metadata
            sheet_data = {
                "sheet_name": sheet_name,
                "row_count": len(df),
                "column_count": len(df.columns),
                "headers": list(df.columns),
                "data": records,
                "text": text
            }
            
            return sheet_data
        except Exception as e:
            logger.error(f"Error extracting data from sheet {sheet_name}: {str(e)}")
            return {
                "sheet_name": sheet_name,
                "row_count": 0,
                "column_count": 0,
                "headers": [],
                "data": [],
                "text": ""
            }
