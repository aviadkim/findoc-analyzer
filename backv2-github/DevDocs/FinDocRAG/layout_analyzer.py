"""
Layout Analyzer module.

This module provides functions to analyze document layouts using Layout Parser.
"""

import os
import logging
import json
import numpy as np
import cv2
from typing import List, Dict, Any, Optional, Tuple
import fitz  # PyMuPDF
from PIL import Image
import tempfile
import re


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LayoutAnalyzer:
    """
    Layout Analyzer class for document layout analysis.
    """

    def __init__(self):
        """
        Initialize the Layout Analyzer.
        """
        # No external model needed
        self.model_available = True
        logger.info("Layout analyzer initialized")

    def analyze_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Analyze the layout of a PDF document.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary containing layout analysis results
        """
        try:
            # Open the PDF
            pdf_document = fitz.open(pdf_path)

            # Initialize results
            results = {
                "document_path": pdf_path,
                "page_count": len(pdf_document),
                "pages": []
            }

            # Process each page
            for page_num, page in enumerate(pdf_document):
                logger.info(f"Processing page {page_num + 1}/{len(pdf_document)}")

                # Get page text directly
                text_blocks = []

                # Get text blocks
                text_dict = page.get_text("dict")

                # Get raw text
                raw_text = page.get_text("text")

                # Create a simple block for the raw text
                if raw_text.strip():
                    text_blocks.append({
                        "type": "Text",
                        "text": raw_text,
                        "coordinates": {
                            "x1": 0,
                            "y1": 0,
                            "x2": page.rect.width,
                            "y2": page.rect.height
                        }
                    })

                # Create a simple layout with the text blocks
                page_layout = {
                    "blocks": text_blocks
                }

                # Add to results
                results["pages"].append({
                    "page_number": page_num + 1,
                    "layout": page_layout
                })

            return results

        except Exception as e:
            logger.error(f"Error analyzing PDF: {str(e)}")
            return {"error": f"Error analyzing PDF: {str(e)}"}

    def _analyze_page_text(self, text_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze the text dictionary from PyMuPDF.

        Args:
            text_dict: Text dictionary from PyMuPDF

        Returns:
            Dictionary containing layout analysis results
        """
        try:
            # Initialize layout dictionary
            layout_dict = {
                "blocks": []
            }

            # Process each block
            for block in text_dict.get("blocks", []):
                block_type = self._determine_block_type(block)

                # Get coordinates
                bbox = block.get("bbox", [0, 0, 0, 0])

                # Check if coordinates are valid
                if not bbox or len(bbox) != 4 or bbox[0] > 1000000 or bbox[1] > 1000000 or bbox[2] < -1000000 or bbox[3] < -1000000:
                    # Invalid coordinates, use default
                    coords = {
                        "x1": 0,
                        "y1": 0,
                        "x2": 0,
                        "y2": 0
                    }
                else:
                    coords = {
                        "x1": int(bbox[0]),
                        "y1": int(bbox[1]),
                        "x2": int(bbox[2]),
                        "y2": int(bbox[3])
                    }

                # Create block dictionary
                block_dict = {
                    "type": block_type,
                    "score": 1.0,  # No confidence score in PyMuPDF
                    "coordinates": coords,
                    "text": self._extract_block_text(block)
                }

                layout_dict["blocks"].append(block_dict)

            return layout_dict

        except Exception as e:
            logger.error(f"Error analyzing page text: {str(e)}")
            return {"error": f"Error analyzing page text: {str(e)}"}

    def _determine_block_type(self, block: Dict[str, Any]) -> str:
        """
        Determine the type of a block.

        Args:
            block: Block dictionary from PyMuPDF

        Returns:
            Block type ("Text", "Table", "Figure", etc.)
        """
        # Check if the block has lines
        if "lines" in block:
            # Check if it's a table
            if self._is_table(block):
                return "Table"

            # Check if it's a title
            if self._is_title(block):
                return "Title"

            # Default to text
            return "Text"

        # Check if it's an image
        if "image" in block:
            return "Figure"

        # Default to unknown
        return "Unknown"

    def _is_table(self, block: Dict[str, Any]) -> bool:
        """
        Check if a block is a table.

        Args:
            block: Block dictionary from PyMuPDF

        Returns:
            True if the block is a table, False otherwise
        """
        # Count the number of lines and spans
        line_count = len(block.get("lines", []))
        span_count = sum(len(line.get("spans", [])) for line in block.get("lines", []))

        # Check if there are multiple lines and spans
        if line_count >= 3 and span_count >= 6:
            # Check if the spans are aligned in columns
            spans_x = []
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    spans_x.append(span.get("bbox", [0, 0, 0, 0])[0])

            # Count unique x-coordinates (with some tolerance)
            unique_x = set()
            for x in spans_x:
                found = False
                for ux in unique_x:
                    if abs(x - ux) < 5:  # 5 pixels tolerance
                        found = True
                        break
                if not found:
                    unique_x.add(x)

            # If there are multiple columns, it's likely a table
            if len(unique_x) >= 3:
                return True

            # Check for table-like text patterns
            text = self._extract_block_text(block)

            # Check for financial table indicators
            financial_indicators = [
                "ISIN", "Valor", "Symbol", "Currency", "Price", "Quantity", "Value",
                "Coupon", "Maturity", "Yield", "Duration", "Rating", "Issuer",
                "Nominal", "Market Value", "Cost", "Gain/Loss", "Performance",
                "Asset Class", "Sector", "Country", "Weight", "Allocation"
            ]

            # Count financial indicators
            indicator_count = 0
            for indicator in financial_indicators:
                if indicator in text:
                    indicator_count += 1

            # If multiple financial indicators are found, it's likely a table
            if indicator_count >= 2:
                return True

            # Check for numeric patterns (e.g., currency values)
            currency_pattern = r'[\$€£¥]\s*[\d,.]+|[\d,.]+\s*[\$€£¥]'
            percentage_pattern = r'[\d,.]+\s*%'
            date_pattern = r'\d{1,2}[./-]\d{1,2}[./-]\d{2,4}'

            # Count pattern matches
            currency_matches = len(re.findall(currency_pattern, text))
            percentage_matches = len(re.findall(percentage_pattern, text))
            date_matches = len(re.findall(date_pattern, text))

            # If multiple patterns are found, it's likely a table
            if currency_matches + percentage_matches + date_matches >= 3:
                return True

        return False

    def _is_title(self, block: Dict[str, Any]) -> bool:
        """
        Check if a block is a title.

        Args:
            block: Block dictionary from PyMuPDF

        Returns:
            True if the block is a title, False otherwise
        """
        # Check if there's only one line
        if len(block.get("lines", [])) == 1:
            # Check if the font size is larger than average
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    # Font size is usually larger for titles
                    if span.get("size", 0) > 12:  # Arbitrary threshold
                        return True

        return False

    def _extract_block_text(self, block: Dict[str, Any]) -> str:
        """
        Extract text from a block.

        Args:
            block: Block dictionary from PyMuPDF

        Returns:
            Extracted text
        """
        text = ""

        # Extract text from lines and spans
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                text += span.get("text", "")
            text += "\n"

        return text.strip()

    def extract_tables(self, pdf_path: str, page_num: int) -> List[Dict[str, Any]]:
        """
        Extract tables from a PDF page.

        Args:
            pdf_path: Path to the PDF file
            page_num: Page number (0-based)

        Returns:
            List of tables
        """
        try:
            # Open the PDF
            pdf_document = fitz.open(pdf_path)

            # Get the page
            page = pdf_document[page_num]

            # Get page text
            text = page.get_text("dict")

            # Analyze layout
            layout = self._analyze_page_text(text)

            # Extract table blocks
            table_blocks = []
            for i, block in enumerate(layout.get("blocks", [])):
                if block.get("type") == "Table":
                    # Add table ID and page number
                    block["id"] = f"table_{i+1}"
                    block["page"] = page_num + 1
                    table_blocks.append(block)

            return table_blocks

        except Exception as e:
            logger.error(f"Error extracting tables: {str(e)}")
            return []


# Test function
def test_layout_analyzer(pdf_path: str, output_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Test the Layout Analyzer.

    Args:
        pdf_path: Path to the PDF file
        output_path: Path to save the results

    Returns:
        Layout analysis results
    """
    # Initialize the Layout Analyzer
    analyzer = LayoutAnalyzer()

    # Analyze the PDF
    results = analyzer.analyze_pdf(pdf_path)

    # Save results
    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        logger.info(f"Layout analysis results saved to {output_path}")

    return results


if __name__ == "__main__":
    import argparse

    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test layout analysis.')
    parser.add_argument('--pdf', type=str, required=True, help='Path to the PDF file')
    parser.add_argument('--output', type=str, help='Path to save the results')

    args = parser.parse_args()

    # Test the Layout Analyzer
    test_layout_analyzer(args.pdf, args.output)
