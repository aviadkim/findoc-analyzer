"""
Document Type Detector for financial documents.

This module provides functionality to detect the type of financial document.
"""

import os
import sys
import json
import logging
import re
from typing import List, Dict, Any, Optional, Tuple
import fitz  # PyMuPDF
import pandas as pd
import numpy as np
from collections import Counter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentTypeDetector:
    """
    Detector for financial document types.
    """

    # Document type definitions with keywords and patterns
    DOCUMENT_TYPES = {
        "portfolio_statement": {
            "keywords": [
                "portfolio", "statement", "asset", "listing", "holdings", "positions",
                "valuation", "investment", "summary", "overview", "allocation"
            ],
            "patterns": [
                r"portfolio\s+statement",
                r"asset\s+listing",
                r"investment\s+summary",
                r"holdings\s+(summary|report)",
                r"valuation\s+(statement|report)"
            ]
        },
        "transaction_report": {
            "keywords": [
                "transaction", "trade", "buy", "sell", "purchase", "sale",
                "execution", "order", "confirmation", "settlement"
            ],
            "patterns": [
                r"transaction\s+(report|statement|summary)",
                r"trade\s+(confirmation|report|summary)",
                r"(buy|sell)\s+order",
                r"settlement\s+statement"
            ]
        },
        "performance_report": {
            "keywords": [
                "performance", "return", "yield", "profit", "loss",
                "gain", "benchmark", "comparison", "analysis"
            ],
            "patterns": [
                r"performance\s+(report|summary|analysis)",
                r"return\s+(analysis|summary)",
                r"investment\s+performance",
                r"portfolio\s+performance"
            ]
        },
        "account_statement": {
            "keywords": [
                "account", "statement", "balance", "summary", "activity",
                "deposit", "withdrawal", "fee", "charge", "interest"
            ],
            "patterns": [
                r"account\s+statement",
                r"balance\s+summary",
                r"account\s+summary",
                r"account\s+activity"
            ]
        },
        "tax_document": {
            "keywords": [
                "tax", "dividend", "interest", "income", "withholding",
                "1099", "form", "statement", "report", "fiscal"
            ],
            "patterns": [
                r"tax\s+(statement|report|document)",
                r"dividend\s+income",
                r"interest\s+income",
                r"withholding\s+tax",
                r"form\s+1099"
            ]
        }
    }

    def __init__(self, debug: bool = False):
        """
        Initialize the document type detector.

        Args:
            debug: Whether to print debug information
        """
        self.debug = debug

    def detect_document_type(self, pdf_path: str) -> Dict[str, Any]:
        """
        Detect the type of financial document.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary containing document type information
        """
        if self.debug:
            logger.info(f"Detecting document type for {pdf_path}")

        # Extract text from the first few pages
        text = self._extract_text_from_pages(pdf_path, pages=[0, 1, 2])
        
        # Analyze text to determine document type
        document_type, confidence, features = self._analyze_text(text)
        
        # Extract metadata
        metadata = self._extract_metadata(pdf_path)
        
        # Combine results
        result = {
            "document_type": document_type,
            "confidence": confidence,
            "features": features,
            "metadata": metadata
        }
        
        if self.debug:
            logger.info(f"Detected document type: {document_type} (confidence: {confidence:.2f})")
            
        return result

    def _extract_text_from_pages(self, pdf_path: str, pages: List[int] = None) -> str:
        """
        Extract text from specific pages of a PDF.

        Args:
            pdf_path: Path to the PDF file
            pages: List of page indices to extract (0-based)

        Returns:
            Extracted text
        """
        text = ""
        
        try:
            # Open the PDF
            doc = fitz.open(pdf_path)
            
            # If no pages specified, use all pages
            if pages is None:
                pages = range(len(doc))
                
            # Extract text from specified pages
            for page_idx in pages:
                if page_idx < len(doc):
                    page = doc[page_idx]
                    text += page.get_text()
            
            # Close the PDF
            doc.close()
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            
        return text

    def _analyze_text(self, text: str) -> Tuple[str, float, Dict[str, Any]]:
        """
        Analyze text to determine document type.

        Args:
            text: Text to analyze

        Returns:
            Tuple of (document_type, confidence, features)
        """
        # Normalize text
        normalized_text = text.lower()
        
        # Calculate scores for each document type
        scores = {}
        features = {}
        
        for doc_type, type_info in self.DOCUMENT_TYPES.items():
            # Count keyword occurrences
            keyword_count = sum(1 for keyword in type_info["keywords"] if keyword in normalized_text)
            
            # Count pattern matches
            pattern_matches = sum(1 for pattern in type_info["patterns"] if re.search(pattern, normalized_text))
            
            # Calculate score
            score = (keyword_count * 0.5) + (pattern_matches * 2.0)
            
            # Store score and features
            scores[doc_type] = score
            features[doc_type] = {
                "keyword_count": keyword_count,
                "pattern_matches": pattern_matches,
                "score": score
            }
        
        # Find the document type with the highest score
        if scores:
            max_score = max(scores.values())
            max_score_types = [doc_type for doc_type, score in scores.items() if score == max_score]
            
            # If there's a tie, choose the one with more pattern matches
            if len(max_score_types) > 1:
                max_pattern_matches = max(features[doc_type]["pattern_matches"] for doc_type in max_score_types)
                max_pattern_types = [doc_type for doc_type in max_score_types if features[doc_type]["pattern_matches"] == max_pattern_matches]
                
                document_type = max_pattern_types[0]
            else:
                document_type = max_score_types[0]
                
            # Calculate confidence (normalize to 0-100)
            total_score = sum(scores.values())
            confidence = (max_score / total_score * 100) if total_score > 0 else 0
        else:
            document_type = "unknown"
            confidence = 0
            
        return document_type, confidence, features

    def _extract_metadata(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract metadata from a PDF.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary containing metadata
        """
        metadata = {
            "filename": os.path.basename(pdf_path),
            "filesize": os.path.getsize(pdf_path),
            "pages": 0,
            "title": None,
            "author": None,
            "creation_date": None,
            "modification_date": None
        }
        
        try:
            # Open the PDF
            doc = fitz.open(pdf_path)
            
            # Get number of pages
            metadata["pages"] = len(doc)
            
            # Get document metadata
            pdf_metadata = doc.metadata
            
            if pdf_metadata:
                metadata["title"] = pdf_metadata.get("title")
                metadata["author"] = pdf_metadata.get("author")
                metadata["creation_date"] = pdf_metadata.get("creationDate")
                metadata["modification_date"] = pdf_metadata.get("modDate")
            
            # Close the PDF
            doc.close()
        except Exception as e:
            logger.error(f"Error extracting metadata from PDF: {str(e)}")
            
        return metadata

def main():
    """
    Main function for testing the document type detector.
    """
    import argparse
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Detect the type of financial document.')
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('--output', help='Path to save the output JSON file')
    parser.add_argument('--debug', action='store_true', help='Print debug information')
    
    args = parser.parse_args()
    
    # Create detector
    detector = DocumentTypeDetector(debug=args.debug)
    
    # Detect document type
    result = detector.detect_document_type(args.pdf_path)
    
    # Save or print result
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        logger.info(f"Result saved to {args.output}")
    else:
        print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
