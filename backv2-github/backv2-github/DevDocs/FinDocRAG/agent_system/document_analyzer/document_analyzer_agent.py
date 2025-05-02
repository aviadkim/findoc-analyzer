"""
Document Analyzer Agent for Financial Document Processing.

This module provides the document analyzer agent that analyzes document structure
and extracts raw data.
"""

import os
import logging
import json
import re
from typing import Dict, Any, List, Optional, Union

import fitz  # PyMuPDF
import pandas as pd
import numpy as np

from ..llm_agent import LlmAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentAnalyzerAgent(LlmAgent):
    """
    Document analyzer agent for financial document processing.
    """
    
    def __init__(
        self,
        name: str = "document_analyzer",
        description: str = "I analyze document structure and extract raw data.",
        model: str = "gemini-2.0-pro",
        debug: bool = False,
        output_dir: Optional[str] = None
    ):
        """
        Initialize the document analyzer agent.
        
        Args:
            name: Agent name
            description: Agent description
            model: LLM model to use
            debug: Whether to enable debug mode
            output_dir: Directory to save output and debug information
        """
        super().__init__(
            name=name,
            description=description,
            model=model,
            debug=debug,
            output_dir=output_dir,
            system_instruction="""
            You are the Document Analyzer Agent for financial document processing.
            Your role is to analyze document structure and extract raw data.
            
            You will receive a document path, extract text and identify key sections:
            1. Document type (portfolio statement, transaction statement, etc.)
            2. Document metadata (date, client info, etc.)
            3. Table locations and structures
            4. Key sections (summary, holdings, transactions, etc.)
            
            Provide a detailed analysis of the document structure to help other agents
            process the document more effectively.
            """
        )
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data by analyzing document structure.
        
        Args:
            input_data: Input data to process
            
        Returns:
            Processing results
        """
        # Update state
        self.set_state({
            "processing": True,
            "completed": False,
            "error": None
        })
        
        try:
            # Extract document path from input data
            document_path = input_data.get("document_path")
            if not document_path:
                # Try to extract from input_data
                document_path = input_data.get("input_data", {}).get("document_path")
            
            if not document_path:
                raise ValueError("Document path not provided")
            
            # Check if document exists
            if not os.path.exists(document_path):
                raise FileNotFoundError(f"Document not found: {document_path}")
            
            # Analyze document based on file type
            _, ext = os.path.splitext(document_path)
            ext = ext.lower()
            
            if ext == '.pdf':
                analysis_result = self._analyze_pdf(document_path)
            elif ext in ['.xlsx', '.xls']:
                analysis_result = self._analyze_excel(document_path)
            elif ext in ['.jpg', '.jpeg', '.png', '.tiff', '.tif']:
                analysis_result = self._analyze_image(document_path)
            else:
                raise ValueError(f"Unsupported file type: {ext}")
            
            # Determine document type
            document_type = self._determine_document_type(analysis_result)
            analysis_result["document_type"] = document_type
            
            # Extract metadata
            metadata = self._extract_metadata(analysis_result)
            analysis_result["metadata"] = metadata
            
            # Update state
            self.set_state({
                "processing": False,
                "completed": True
            })
            
            # Save results if in debug mode
            if self.debug:
                self.save_results(analysis_result)
            
            return analysis_result
        except Exception as e:
            # Update state
            self.set_state({
                "processing": False,
                "completed": False,
                "error": str(e)
            })
            
            logger.error(f"Error analyzing document: {str(e)}")
            
            return {
                "error": str(e),
                "input_data": input_data
            }
    
    def _analyze_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Analyze a PDF document.
        
        Args:
            pdf_path: Path to the PDF document
            
        Returns:
            Analysis result
        """
        logger.info(f"Analyzing PDF: {pdf_path}")
        
        # Open the PDF
        doc = fitz.open(pdf_path)
        
        # Initialize results
        result = {
            "document_path": pdf_path,
            "page_count": len(doc),
            "text": "",
            "pages": [],
            "tables": []
        }
        
        # Process each page
        for page_num, page in enumerate(doc):
            # Extract text
            text = page.get_text()
            
            # Add page info
            result["pages"].append({
                "page_num": page_num + 1,
                "text": text,
                "width": page.rect.width,
                "height": page.rect.height
            })
            
            # Add to overall text
            result["text"] += text + "\n\n"
            
            # Extract tables using PyMuPDF's built-in table detection
            try:
                tab = page.find_tables()
                
                if tab.tables:
                    for i, table in enumerate(tab.tables):
                        # Convert table to DataFrame
                        rows = []
                        for cells in table.cells:
                            row = []
                            for cell in cells:
                                # Get text from cell
                                rect = cell.rect
                                text = page.get_text("text", clip=rect).strip()
                                row.append(text)
                            rows.append(row)
                        
                        # Create table info
                        if rows:
                            headers = rows[0] if rows else []
                            data = rows[1:] if len(rows) > 1 else []
                            
                            # Create table info
                            table_info = {
                                "id": f"page_{page_num+1}_table_{i+1}",
                                "page": page_num + 1,
                                "headers": headers,
                                "data": [dict(zip(headers, row)) for row in data],
                                "rows": data
                            }
                            
                            result["tables"].append(table_info)
            except Exception as e:
                logger.warning(f"Error extracting tables from page {page_num+1}: {str(e)}")
        
        # Close the document
        doc.close()
        
        return result
    
    def _analyze_excel(self, excel_path: str) -> Dict[str, Any]:
        """
        Analyze an Excel document.
        
        Args:
            excel_path: Path to the Excel document
            
        Returns:
            Analysis result
        """
        logger.info(f"Analyzing Excel: {excel_path}")
        
        # Read Excel file
        excel_data = pd.read_excel(excel_path, sheet_name=None)
        
        # Initialize results
        result = {
            "document_path": excel_path,
            "sheet_count": len(excel_data),
            "text": "",
            "sheets": [],
            "tables": []
        }
        
        # Process each sheet
        for sheet_name, df in excel_data.items():
            # Convert to string
            sheet_text = df.to_string()
            
            # Add sheet info
            result["sheets"].append({
                "sheet_name": sheet_name,
                "text": sheet_text,
                "row_count": len(df),
                "column_count": len(df.columns)
            })
            
            # Add to overall text
            result["text"] += f"Sheet: {sheet_name}\n{sheet_text}\n\n"
            
            # Add table info
            table_info = {
                "id": f"sheet_{sheet_name}",
                "sheet": sheet_name,
                "headers": df.columns.tolist(),
                "data": df.to_dict(orient="records"),
                "rows": df.values.tolist()
            }
            
            result["tables"].append(table_info)
        
        return result
    
    def _analyze_image(self, image_path: str) -> Dict[str, Any]:
        """
        Analyze an image document.
        
        Args:
            image_path: Path to the image document
            
        Returns:
            Analysis result
        """
        logger.info(f"Analyzing image: {image_path}")
        
        # Initialize results
        result = {
            "document_path": image_path,
            "text": "Image document - OCR required",
            "pages": [{
                "page_num": 1,
                "text": "Image document - OCR required"
            }],
            "tables": []
        }
        
        # Note: For actual OCR, we would use Tesseract or another OCR library here
        # For now, we'll just return a placeholder result
        
        return result
    
    def _determine_document_type(self, analysis_result: Dict[str, Any]) -> str:
        """
        Determine the document type based on analysis result.
        
        Args:
            analysis_result: Analysis result
            
        Returns:
            Document type
        """
        text = analysis_result.get("text", "").lower()
        
        # Check for portfolio statement features
        portfolio_features = [
            "portfolio", "statement", "holdings", "positions", "assets",
            "securities", "investments", "allocation", "valuation"
        ]
        portfolio_score = sum(1 for feature in portfolio_features if feature in text)
        
        # Check for transaction statement features
        transaction_features = [
            "transaction", "trade", "buy", "sell", "purchase", "sale",
            "order", "execution", "settlement", "confirmation"
        ]
        transaction_score = sum(1 for feature in transaction_features if feature in text)
        
        # Check for performance report features
        performance_features = [
            "performance", "return", "yield", "gain", "loss",
            "profit", "benchmark", "comparison", "historical"
        ]
        performance_score = sum(1 for feature in performance_features if feature in text)
        
        # Determine document type based on scores
        if portfolio_score > transaction_score and portfolio_score > performance_score:
            return "portfolio_statement"
        elif transaction_score > portfolio_score and transaction_score > performance_score:
            return "transaction_statement"
        elif performance_score > portfolio_score and performance_score > transaction_score:
            return "performance_report"
        else:
            return "unknown"
    
    def _extract_metadata(self, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract metadata from analysis result.
        
        Args:
            analysis_result: Analysis result
            
        Returns:
            Metadata
        """
        text = analysis_result.get("text", "")
        
        # Initialize metadata
        metadata = {
            "date": None,
            "client_name": None,
            "client_id": None,
            "account_number": None,
            "currency": None,
            "total_value": None
        }
        
        # Extract date
        date_patterns = [
            r"(?:valuation|as of|date)[:\s]+(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})",
            r"(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})"
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                metadata["date"] = match.group(1)
                break
        
        # Extract client name
        client_patterns = [
            r"(?:client|customer|account holder)[:\s]+([A-Za-z\s]+)",
            r"(?:name)[:\s]+([A-Za-z\s]+)"
        ]
        
        for pattern in client_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                metadata["client_name"] = match.group(1).strip()
                break
        
        # Extract client ID
        client_id_patterns = [
            r"(?:client|customer)\s+(?:id|number)[:\s]+([A-Za-z0-9]+)",
            r"(?:account|client)\s+(?:id|number)[:\s]+([A-Za-z0-9]+)"
        ]
        
        for pattern in client_id_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                metadata["client_id"] = match.group(1).strip()
                break
        
        # Extract account number
        account_patterns = [
            r"(?:account)\s+(?:id|number|#)[:\s]+([A-Za-z0-9]+)",
            r"(?:account)[:\s]+([A-Za-z0-9]+)"
        ]
        
        for pattern in account_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                metadata["account_number"] = match.group(1).strip()
                break
        
        # Extract currency
        currency_patterns = [
            r"(?:currency)[:\s]+([A-Z]{3})",
            r"(?:in)\s+([A-Z]{3})",
            r"([A-Z]{3})\s+\d+[,\d]*\.\d*"
        ]
        
        for pattern in currency_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                currency = match.group(1).upper()
                if currency in ["USD", "EUR", "GBP", "CHF", "JPY"]:
                    metadata["currency"] = currency
                    break
        
        # Extract total value
        value_patterns = [
            r"(?:total|portfolio)\s+(?:value|assets)[:\s]+([0-9,]+\.?[0-9]*)",
            r"(?:total|portfolio)[:\s]+([0-9,]+\.?[0-9]*)"
        ]
        
        for pattern in value_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    value_str = match.group(1).replace(',', '')
                    metadata["total_value"] = float(value_str)
                    break
                except:
                    pass
        
        return metadata
