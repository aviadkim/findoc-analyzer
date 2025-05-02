"""
Financial Document Processor.

This module provides a comprehensive solution for processing financial documents,
with a focus on extracting securities information, understanding table structures,
and analyzing portfolio data.
"""

import os
import logging
import json
import tempfile
from typing import List, Dict, Any, Optional, Union
import fitz  # PyMuPDF
import pandas as pd
import numpy as np
from datetime import datetime

# Import our custom modules
from advanced_image_processor import AdvancedImageProcessor
from enhanced_table_analyzer import EnhancedTableAnalyzer
from improved_securities_extractor import ImprovedSecuritiesExtractor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FinancialDocumentProcessor:
    """
    Comprehensive processor for financial documents.
    """
    
    def __init__(
        self,
        languages: List[str] = ['eng'],
        debug: bool = False,
        output_dir: Optional[str] = None
    ):
        """
        Initialize the financial document processor.
        
        Args:
            languages: List of language codes for OCR
            debug: Whether to enable debug mode
            output_dir: Directory to save output and debug information
        """
        self.languages = languages
        self.debug = debug
        
        # Create output directory if provided
        if output_dir:
            self.output_dir = output_dir
            os.makedirs(output_dir, exist_ok=True)
        else:
            self.output_dir = tempfile.mkdtemp()
        
        # Initialize components
        self.image_processor = AdvancedImageProcessor(
            languages=languages,
            debug=debug,
            output_dir=os.path.join(self.output_dir, "image_processor") if output_dir else None
        )
        
        self.table_analyzer = EnhancedTableAnalyzer(
            debug=debug,
            output_dir=os.path.join(self.output_dir, "table_analyzer") if output_dir else None
        )
        
        self.securities_extractor = ImprovedSecuritiesExtractor(
            languages=languages,
            debug=debug,
            output_dir=os.path.join(self.output_dir, "securities_extractor") if output_dir else None
        )
    
    def process_document(self, document_path: str) -> Dict[str, Any]:
        """
        Process a financial document.
        
        Args:
            document_path: Path to the document
            
        Returns:
            Dictionary with processing results
        """
        logger.info(f"Processing document: {document_path}")
        
        # Create document-specific output directory
        doc_name = os.path.basename(document_path)
        doc_output_dir = os.path.join(self.output_dir, f"{os.path.splitext(doc_name)[0]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        os.makedirs(doc_output_dir, exist_ok=True)
        
        # Check file extension
        _, ext = os.path.splitext(document_path)
        ext = ext.lower()
        
        # Initialize processing steps
        processing_steps = []
        
        # Step 1: Document type detection
        doc_type_result = self._detect_document_type(document_path)
        processing_steps.append({
            "step": "document_type_detection",
            "result": doc_type_result
        })
        
        # Step 2: Extract securities
        securities_result = self.securities_extractor.extract_securities(document_path)
        processing_steps.append({
            "step": "securities_extraction",
            "result": {
                "securities_count": securities_result.get("securities_count", 0),
                "tables_count": securities_result.get("tables_count", 0)
            }
        })
        
        # Step 3: Extract portfolio summary
        portfolio_summary = self._extract_portfolio_summary(document_path, doc_type_result.get("document_type"))
        processing_steps.append({
            "step": "portfolio_summary_extraction",
            "result": portfolio_summary
        })
        
        # Step 4: Analyze portfolio
        portfolio_analysis = self._analyze_portfolio(securities_result.get("securities", []), portfolio_summary)
        processing_steps.append({
            "step": "portfolio_analysis",
            "result": portfolio_analysis
        })
        
        # Save results to file
        results_path = os.path.join(doc_output_dir, "processing_results.json")
        with open(results_path, 'w', encoding='utf-8') as f:
            json.dump({
                "document_path": document_path,
                "document_type": doc_type_result.get("document_type"),
                "processing_date": datetime.now().isoformat(),
                "securities": securities_result.get("securities", []),
                "portfolio_summary": portfolio_summary,
                "portfolio_analysis": portfolio_analysis,
                "processing_steps": processing_steps
            }, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Document processing complete. Results saved to {results_path}")
        
        return {
            "document_path": document_path,
            "document_type": doc_type_result.get("document_type"),
            "securities_count": securities_result.get("securities_count", 0),
            "securities": securities_result.get("securities", []),
            "portfolio_summary": portfolio_summary,
            "portfolio_analysis": portfolio_analysis,
            "results_path": results_path
        }
    
    def _detect_document_type(self, document_path: str) -> Dict[str, Any]:
        """
        Detect the type of financial document.
        
        Args:
            document_path: Path to the document
            
        Returns:
            Dictionary with document type information
        """
        logger.info("Step 1: Document Type Detection")
        
        # Extract text from document
        text = self._extract_text(document_path)
        
        # Initialize document type detection
        doc_type = "unknown"
        confidence = 0.0
        features = {}
        
        # Check for portfolio statement features
        portfolio_features = [
            "portfolio", "statement", "holdings", "positions", "assets",
            "securities", "investments", "allocation", "valuation"
        ]
        portfolio_score = sum(1 for feature in portfolio_features if feature.lower() in text.lower())
        features["portfolio_score"] = portfolio_score
        
        # Check for transaction statement features
        transaction_features = [
            "transaction", "trade", "buy", "sell", "purchase", "sale",
            "order", "execution", "settlement", "confirmation"
        ]
        transaction_score = sum(1 for feature in transaction_features if feature.lower() in text.lower())
        features["transaction_score"] = transaction_score
        
        # Check for performance report features
        performance_features = [
            "performance", "return", "yield", "gain", "loss",
            "profit", "benchmark", "comparison", "historical"
        ]
        performance_score = sum(1 for feature in performance_features if feature.lower() in text.lower())
        features["performance_score"] = performance_score
        
        # Determine document type based on scores
        if portfolio_score > transaction_score and portfolio_score > performance_score:
            doc_type = "portfolio_statement"
            confidence = min(1.0, portfolio_score / len(portfolio_features))
        elif transaction_score > portfolio_score and transaction_score > performance_score:
            doc_type = "transaction_statement"
            confidence = min(1.0, transaction_score / len(transaction_features))
        elif performance_score > portfolio_score and performance_score > transaction_score:
            doc_type = "performance_report"
            confidence = min(1.0, performance_score / len(performance_features))
        
        logger.info(f"Detected document type: {doc_type} (confidence: {confidence:.2f})")
        
        return {
            "document_type": doc_type,
            "confidence": confidence,
            "features": features
        }
    
    def _extract_text(self, document_path: str) -> str:
        """
        Extract text from a document.
        
        Args:
            document_path: Path to the document
            
        Returns:
            Extracted text
        """
        # Check file extension
        _, ext = os.path.splitext(document_path)
        ext = ext.lower()
        
        if ext == '.pdf':
            return self._extract_text_from_pdf(document_path)
        elif ext in ['.xlsx', '.xls']:
            return self._extract_text_from_excel(document_path)
        elif ext in ['.jpg', '.jpeg', '.png', '.tiff', '.tif']:
            return self._extract_text_from_image(document_path)
        else:
            logger.warning(f"Unsupported file type for text extraction: {ext}")
            return ""
    
    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from a PDF document.
        
        Args:
            pdf_path: Path to the PDF document
            
        Returns:
            Extracted text
        """
        try:
            # Open the PDF
            doc = fitz.open(pdf_path)
            
            # Extract text from each page
            text = ""
            for page in doc:
                text += page.get_text()
            
            # Close the document
            doc.close()
            
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return ""
    
    def _extract_text_from_excel(self, excel_path: str) -> str:
        """
        Extract text from an Excel document.
        
        Args:
            excel_path: Path to the Excel document
            
        Returns:
            Extracted text
        """
        try:
            # Read Excel file
            excel_data = pd.read_excel(excel_path, sheet_name=None)
            
            # Extract text from each sheet
            text = ""
            for sheet_name, df in excel_data.items():
                text += f"Sheet: {sheet_name}\n"
                text += df.to_string() + "\n\n"
            
            return text
        except Exception as e:
            logger.error(f"Error extracting text from Excel: {str(e)}")
            return ""
    
    def _extract_text_from_image(self, image_path: str) -> str:
        """
        Extract text from an image.
        
        Args:
            image_path: Path to the image
            
        Returns:
            Extracted text
        """
        try:
            # Process the image
            image_result = self.image_processor.process_image(image_path)
            
            # Get OCR text
            return image_result.get("ocr_results", {}).get("text", "")
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            return ""
    
    def _extract_portfolio_summary(self, document_path: str, document_type: str) -> Dict[str, Any]:
        """
        Extract portfolio summary from a document.
        
        Args:
            document_path: Path to the document
            document_type: Type of document
            
        Returns:
            Dictionary with portfolio summary
        """
        logger.info("Step 3: Portfolio Summary Extraction")
        
        # Extract text from document
        text = self._extract_text(document_path)
        
        # Initialize portfolio summary
        portfolio_summary = {
            "total_value": None,
            "currency": None,
            "valuation_date": None,
            "asset_classes": {}
        }
        
        # Extract total value
        total_value_patterns = [
            r"total\s+value\s*[:=]?\s*([\d,]+\.?\d*)",
            r"total\s+assets\s*[:=]?\s*([\d,]+\.?\d*)",
            r"portfolio\s+value\s*[:=]?\s*([\d,]+\.?\d*)",
            r"total\s+portfolio\s*[:=]?\s*([\d,]+\.?\d*)"
        ]
        
        for pattern in total_value_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    value_str = match.group(1).replace(',', '')
                    portfolio_summary["total_value"] = float(value_str)
                    break
                except:
                    pass
        
        # Extract currency
        currency_patterns = [
            r"currency\s*[:=]?\s*([A-Z]{3})",
            r"in\s+([A-Z]{3})",
            r"([A-Z]{3})\s+\d+[,\d]*\.\d*"
        ]
        
        for pattern in currency_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                currency = match.group(1).upper()
                if currency in ["USD", "EUR", "GBP", "CHF", "JPY"]:
                    portfolio_summary["currency"] = currency
                    break
        
        # Extract valuation date
        date_patterns = [
            r"valuation\s+date\s*[:=]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})",
            r"as\s+of\s*[:=]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})",
            r"date\s*[:=]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})"
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                portfolio_summary["valuation_date"] = match.group(1)
                break
        
        # Extract asset classes
        asset_class_patterns = [
            (r"equities\s*[:=]?\s*([\d,]+\.?\d*)\s*%", "equities"),
            (r"bonds\s*[:=]?\s*([\d,]+\.?\d*)\s*%", "bonds"),
            (r"cash\s*[:=]?\s*([\d,]+\.?\d*)\s*%", "cash"),
            (r"alternatives\s*[:=]?\s*([\d,]+\.?\d*)\s*%", "alternatives"),
            (r"real\s+estate\s*[:=]?\s*([\d,]+\.?\d*)\s*%", "real_estate"),
            (r"commodities\s*[:=]?\s*([\d,]+\.?\d*)\s*%", "commodities")
        ]
        
        for pattern, asset_class in asset_class_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    percentage = float(match.group(1).replace(',', ''))
                    portfolio_summary["asset_classes"][asset_class] = percentage
                except:
                    pass
        
        logger.info(f"Extracted portfolio summary: {portfolio_summary}")
        
        return portfolio_summary
    
    def _analyze_portfolio(self, securities: List[Dict[str, Any]], portfolio_summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze portfolio based on extracted securities.
        
        Args:
            securities: List of extracted securities
            portfolio_summary: Portfolio summary information
            
        Returns:
            Dictionary with portfolio analysis
        """
        logger.info("Step 4: Portfolio Analysis")
        
        # Initialize portfolio analysis
        portfolio_analysis = {
            "security_count": len(securities),
            "total_value": 0.0,
            "currency_breakdown": {},
            "isin_coverage": 0.0,
            "complete_securities": 0,
            "incomplete_securities": 0
        }
        
        # Calculate total value from securities
        total_value = 0.0
        for security in securities:
            value = security.get("value")
            if value is not None:
                total_value += value
        
        portfolio_analysis["total_value"] = total_value
        
        # Calculate currency breakdown
        currency_values = {}
        for security in securities:
            currency = security.get("currency")
            value = security.get("value")
            
            if currency is not None and value is not None:
                if currency in currency_values:
                    currency_values[currency] += value
                else:
                    currency_values[currency] = value
        
        # Convert to percentages
        if total_value > 0:
            for currency, value in currency_values.items():
                portfolio_analysis["currency_breakdown"][currency] = (value / total_value) * 100
        
        # Calculate ISIN coverage
        isin_count = sum(1 for security in securities if security.get("isin") is not None)
        if len(securities) > 0:
            portfolio_analysis["isin_coverage"] = (isin_count / len(securities)) * 100
        
        # Count complete and incomplete securities
        for security in securities:
            # Check if security has all essential fields
            has_essential_fields = all(
                security.get(field) is not None
                for field in ["isin", "security_name", "quantity", "value"]
            )
            
            if has_essential_fields:
                portfolio_analysis["complete_securities"] += 1
            else:
                portfolio_analysis["incomplete_securities"] += 1
        
        # Calculate completeness percentage
        if len(securities) > 0:
            portfolio_analysis["completeness_percentage"] = (portfolio_analysis["complete_securities"] / len(securities)) * 100
        else:
            portfolio_analysis["completeness_percentage"] = 0.0
        
        logger.info(f"Portfolio analysis complete: {portfolio_analysis}")
        
        return portfolio_analysis
