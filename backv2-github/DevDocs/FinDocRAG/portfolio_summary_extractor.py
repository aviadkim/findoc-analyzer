"""
Portfolio Summary Extractor for financial documents.
"""

import os
import sys
import json
import logging
import re
import fitz  # PyMuPDF
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PortfolioSummaryExtractor:
    """
    Extracts portfolio summary information from financial documents.
    """

    def __init__(self, debug: bool = False):
        """
        Initialize the portfolio summary extractor.

        Args:
            debug: Whether to print debug information
        """
        self.debug = debug

    def extract_summary(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract portfolio summary from a PDF.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary containing portfolio summary information
        """
        if self.debug:
            logger.info(f"Extracting portfolio summary from {pdf_path}")

        # Initialize summary
        summary = {
            "total_value": None,
            "currency": None,
            "asset_allocation": {},
            "currency_allocation": {},
            "top_positions": []
        }

        try:
            # Open the PDF
            doc = fitz.open(pdf_path)

            # Process the first few pages (usually summary is on page 2-3)
            for page_num in range(min(5, len(doc))):
                page = doc[page_num]
                
                # Get page text
                text = page.get_text()
                
                # Extract total value and currency
                total_value, currency = self._extract_total_value(text)
                if total_value is not None:
                    summary["total_value"] = total_value
                    summary["currency"] = currency
                
                # Extract asset allocation
                asset_allocation = self._extract_asset_allocation(text)
                if asset_allocation:
                    summary["asset_allocation"] = asset_allocation
                
                # Extract currency allocation
                currency_allocation = self._extract_currency_allocation(text)
                if currency_allocation:
                    summary["currency_allocation"] = currency_allocation
                
                # Extract top positions
                top_positions = self._extract_top_positions(text)
                if top_positions:
                    summary["top_positions"] = top_positions
            
            # Close the PDF
            doc.close()
            
            return summary
        
        except Exception as e:
            logger.error(f"Error extracting portfolio summary: {str(e)}")
            return summary

    def _extract_total_value(self, text: str) -> Tuple[Optional[float], Optional[str]]:
        """
        Extract total portfolio value and currency from text.

        Args:
            text: Text to extract from

        Returns:
            Tuple of (total_value, currency)
        """
        # Look for total value patterns
        patterns = [
            r"Total\s+(?:value|assets|portfolio|valuation)\s*:?\s*([A-Z]{3})\s*([0-9',.]+)",
            r"(?:Total|Portfolio)\s+(?:value|assets|portfolio|valuation)\s*:?\s*([0-9',.]+)\s*([A-Z]{3})",
            r"(?:Total|Portfolio)\s+(?:value|assets|portfolio|valuation)\s*:?\s*([A-Z]{3})\s*([0-9',.]+)",
            r"(?:Total|Portfolio)\s*:?\s*([A-Z]{3})\s*([0-9',.]+)",
            r"(?:Total|Portfolio)\s*:?\s*([0-9',.]+)\s*([A-Z]{3})"
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            if matches:
                for match in matches:
                    # Check if first group is currency or value
                    if re.match(r"[A-Z]{3}", match[0]):
                        currency = match[0]
                        value_str = match[1]
                    else:
                        value_str = match[0]
                        currency = match[1]
                    
                    # Clean up value
                    value_str = value_str.replace("'", "").replace(",", "")
                    try:
                        value = float(value_str)
                        return value, currency
                    except:
                        continue
        
        return None, None

    def _extract_asset_allocation(self, text: str) -> Dict[str, float]:
        """
        Extract asset allocation from text.

        Args:
            text: Text to extract from

        Returns:
            Dictionary mapping asset classes to percentages
        """
        asset_allocation = {}
        
        # Look for asset allocation section
        asset_section_patterns = [
            r"(?:Asset\s+Allocation|Asset\s+Class\s+Allocation|Portfolio\s+Allocation).*?(?=Currency\s+Allocation|\n\n)",
            r"(?:Asset\s+Allocation|Asset\s+Class\s+Allocation|Portfolio\s+Allocation).*"
        ]
        
        asset_section = None
        for pattern in asset_section_patterns:
            matches = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if matches:
                asset_section = matches.group(0)
                break
        
        if not asset_section:
            return asset_allocation
        
        # Extract asset classes and percentages
        asset_pattern = r"((?:Cash|Equities|Bonds|Structured\s+Products|Alternative\s+Investments|Commodities|Real\s+Estate|Funds|Other)[^0-9%\n]*)\s*([0-9.]+)%"
        
        matches = re.findall(asset_pattern, asset_section, re.IGNORECASE)
        for match in matches:
            asset_class = match[0].strip()
            percentage = float(match[1])
            asset_allocation[asset_class] = percentage
        
        return asset_allocation

    def _extract_currency_allocation(self, text: str) -> Dict[str, float]:
        """
        Extract currency allocation from text.

        Args:
            text: Text to extract from

        Returns:
            Dictionary mapping currencies to percentages
        """
        currency_allocation = {}
        
        # Look for currency allocation section
        currency_section_patterns = [
            r"(?:Currency\s+Allocation|Currency\s+Exposure|Currency\s+Breakdown).*?(?=Asset\s+Allocation|\n\n)",
            r"(?:Currency\s+Allocation|Currency\s+Exposure|Currency\s+Breakdown).*"
        ]
        
        currency_section = None
        for pattern in currency_section_patterns:
            matches = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if matches:
                currency_section = matches.group(0)
                break
        
        if not currency_section:
            return currency_allocation
        
        # Extract currencies and percentages
        currency_pattern = r"([A-Z]{3})[^0-9%\n]*\s*([0-9.]+)%"
        
        matches = re.findall(currency_pattern, currency_section)
        for match in matches:
            currency = match[0].strip()
            percentage = float(match[1])
            currency_allocation[currency] = percentage
        
        return currency_allocation

    def _extract_top_positions(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract top positions from text.

        Args:
            text: Text to extract from

        Returns:
            List of top positions
        """
        top_positions = []
        
        # Look for top positions section
        top_positions_section_patterns = [
            r"(?:Top\s+Positions|Largest\s+Positions|Top\s+Holdings).*?(?=\n\n)",
            r"(?:Top\s+Positions|Largest\s+Positions|Top\s+Holdings).*"
        ]
        
        top_positions_section = None
        for pattern in top_positions_section_patterns:
            matches = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if matches:
                top_positions_section = matches.group(0)
                break
        
        if not top_positions_section:
            return top_positions
        
        # Extract positions
        position_pattern = r"([A-Z0-9]{12})[^0-9%\n]*\s*([0-9',.]+)\s*([A-Z]{3})\s*([0-9.]+)%"
        
        matches = re.findall(position_pattern, top_positions_section)
        for match in matches:
            isin = match[0].strip()
            value_str = match[1].replace("'", "").replace(",", "")
            currency = match[2].strip()
            percentage = float(match[3])
            
            try:
                value = float(value_str)
            except:
                value = None
            
            top_positions.append({
                "isin": isin,
                "value": value,
                "currency": currency,
                "percentage": percentage
            })
        
        return top_positions

def main():
    """
    Main function.
    """
    import argparse
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Extract portfolio summary from a PDF.')
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('--output', help='Path to save the output JSON file')
    parser.add_argument('--debug', action='store_true', help='Print debug information')
    
    args = parser.parse_args()
    
    # Create extractor
    extractor = PortfolioSummaryExtractor(debug=args.debug)
    
    # Extract summary
    summary = extractor.extract_summary(args.pdf_path)
    
    # Save or print summary
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        logger.info(f"Summary saved to {args.output}")
    else:
        print(json.dumps(summary, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
