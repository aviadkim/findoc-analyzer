"""
Enhanced securities extractor for financial documents.

This module provides functions to extract securities information from financial documents,
particularly focusing on the messos PDF format.
"""

import os
import json
import re
import camelot
import pandas as pd
import numpy as np
import fitz  # PyMuPDF
import tempfile
import cv2
from typing import List, Dict, Any, Optional, Tuple

# Import the grid analyzer and ISIN validator
from grid_analyzer import GridAnalyzer
from isin_validator import is_valid_isin

class SecurityExtractor:
    """
    Class for extracting securities information from financial documents.
    """

    def __init__(self, debug: bool = False):
        """
        Initialize the SecurityExtractor.

        Args:
            debug: Whether to print debug information
        """
        self.debug = debug
        self.grid_analyzer = GridAnalyzer(debug=debug)

    def extract_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract securities information from a PDF file.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary containing extracted information
        """
        if self.debug:
            print(f"Processing {pdf_path} to extract securities information...")

        # Try the enhanced grid-based extraction first
        try:
            grid_result = self.grid_analyzer.analyze_pdf(pdf_path)
            grid_securities = self.grid_analyzer.extract_securities(pdf_path)

            if self.debug:
                print(f"Extracted {len(grid_securities)} securities using grid analysis")

            if len(grid_securities) > 0:
                # Extract text from PDF for document type detection
                doc = fitz.open(pdf_path)
                text = ""
                for page in doc:
                    text += page.get_text()
                doc.close()

                # Detect document type
                doc_type = self._detect_document_type_from_text(text)

                # Extract portfolio summary and asset allocation
                portfolio_summary = self._extract_portfolio_summary(text, doc_type)
                asset_allocation = self._extract_asset_allocation(text, doc_type)

                # Validate securities
                validated_securities = self._validate_securities(grid_securities, portfolio_summary)

                return {
                    "document_type": doc_type,
                    "securities": validated_securities,
                    "portfolio_summary": portfolio_summary,
                    "asset_allocation": asset_allocation
                }
        except Exception as e:
            if self.debug:
                print(f"Error using grid analysis: {str(e)}")
                print("Falling back to traditional extraction methods")

        # Fallback to traditional extraction methods
        # Detect document type
        doc_type = self._detect_document_type(pdf_path)

        if doc_type == "messos":
            return self._extract_from_messos(pdf_path)
        else:
            # Generic extraction for other document types
            return self._extract_generic(pdf_path)

    def _detect_document_type(self, pdf_path: str) -> str:
        """
        Detect the type of financial document.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Document type as a string
        """
        # Extract text from first page
        tables = camelot.read_pdf(
            pdf_path,
            pages='1',
            flavor='stream',
            suppress_stdout=True
        )

        if len(tables) == 0:
            return "unknown"

        # Convert to text
        text = ' '.join([' '.join(row) for row in tables[0].df.values.tolist()])

        return self._detect_document_type_from_text(text)

    def _detect_document_type_from_text(self, text: str) -> str:
        """
        Detect the type of financial document from text.

        Args:
            text: Document text

        Returns:
            Document type as a string
        """
        # Check for document type indicators
        if "MESSOS ENTERPRISES" in text or "Cornèr Banca" in text:
            if self.debug:
                print("Detected document type: messos")
            return "messos"

        # Check for portfolio statement
        if any(x in text.lower() for x in ["portfolio statement", "portfolio valuation", "asset statement"]):
            if self.debug:
                print("Detected document type: portfolio_statement")
            return "portfolio_statement"

        # Check for account statement
        if any(x in text.lower() for x in ["account statement", "bank statement", "transaction statement"]):
            if self.debug:
                print("Detected document type: account_statement")
            return "account_statement"

        # Check for fund fact sheet
        if any(x in text.lower() for x in ["fund fact sheet", "kiid", "key investor information"]):
            if self.debug:
                print("Detected document type: fund_fact_sheet")
            return "fund_fact_sheet"

        # Add more document type detection logic here

        return "generic"

    def _extract_from_messos(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract information from a messos PDF.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary containing extracted information
        """
        result = {
            "document_type": "messos",
            "portfolio_summary": self._extract_messos_summary(pdf_path),
            "securities": self._extract_messos_securities(pdf_path),
            "asset_allocation": self._extract_messos_asset_allocation(pdf_path)
        }

        return result

    def _extract_messos_summary(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract summary information from a messos PDF.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary containing summary information
        """
        # Extract tables from summary page (usually page 3)
        tables = camelot.read_pdf(
            pdf_path,
            pages='1-3',
            flavor='stream',
            suppress_stdout=True
        )

        summary = {
            "client_number": None,
            "valuation_date": None,
            "valuation_currency": None,
            "total_value": None,
            "performance": None
        }

        # Process tables to find summary information
        for table in tables:
            df = table.df
            text = ' '.join([' '.join(row) for row in df.values.tolist()])

            # Extract client number
            client_match = re.search(r'Client\s+Number\s+//?\s*(\d+)', text)
            if client_match:
                summary["client_number"] = client_match.group(1)

            # Extract valuation date
            date_match = re.search(r'as\s+of\s+(\d{2}\.\d{2}\.\d{4})', text)
            if date_match:
                summary["valuation_date"] = date_match.group(1)

            # Extract valuation currency
            currency_match = re.search(r'Valuation\s+currency\s+//?\s*(\w+)', text)
            if currency_match:
                summary["valuation_currency"] = currency_match.group(1)

            # Extract total value
            total_match = re.search(r'Total\s+(\d+\'?\d*\'?\d*)', text)
            if total_match:
                summary["total_value"] = total_match.group(1)

            # Look for specific rows that might contain the total value
            for i, row in enumerate(df.values.tolist()):
                row_text = ' '.join(row)
                if "Total" in row_text and any(x in row_text for x in ["assets", "portfolio"]):
                    for cell in row:
                        value_match = re.search(r'(\d+\'?\d*\'?\d*)', cell)
                        if value_match and summary["total_value"] is None:
                            summary["total_value"] = value_match.group(1)

                # Look for performance information
                if "Performance" in row_text and "%" in row_text:
                    for cell in row:
                        perf_match = re.search(r'(\d+\.?\d*\s*%)', cell)
                        if perf_match:
                            summary["performance"] = perf_match.group(1)

        return summary

    def _extract_messos_asset_allocation(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract asset allocation information from a messos PDF.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary containing asset allocation information
        """
        # Extract tables from asset allocation page (usually page 4-5)
        tables = camelot.read_pdf(
            pdf_path,
            pages='3-5',
            flavor='stream',
            suppress_stdout=True
        )

        asset_allocation = {
            "liquidity": None,
            "bonds": None,
            "equities": None,
            "structured_products": None,
            "other_assets": None
        }

        # Process tables to find asset allocation information
        for table in tables:
            df = table.df

            # Look for asset allocation rows
            for i, row in enumerate(df.values.tolist()):
                row_text = ' '.join(row)

                # Extract liquidity
                if "Liquidity" in row_text and not any(x in row_text for x in ["Assets", "Asset"]):
                    for j, cell in enumerate(row):
                        if re.search(r'\d+\'?\d*', cell) and j > 0:
                            asset_allocation["liquidity"] = {
                                "value": cell.strip(),
                                "percentage": next((row[k].strip() for k in range(j+1, len(row)) if "%" in row[k]), None)
                            }

                # Extract bonds
                elif "Bonds" in row_text and not any(x in row_text for x in ["funds", "Convertible", "Assets", "Asset"]):
                    for j, cell in enumerate(row):
                        if re.search(r'\d+\'?\d*', cell) and j > 0:
                            asset_allocation["bonds"] = {
                                "value": cell.strip(),
                                "percentage": next((row[k].strip() for k in range(j+1, len(row)) if "%" in row[k]), None)
                            }

                # Extract equities
                elif "Equities" in row_text and not any(x in row_text for x in ["funds", "Assets", "Asset"]):
                    for j, cell in enumerate(row):
                        if re.search(r'\d+\'?\d*', cell) and j > 0:
                            asset_allocation["equities"] = {
                                "value": cell.strip(),
                                "percentage": next((row[k].strip() for k in range(j+1, len(row)) if "%" in row[k]), None)
                            }

                # Extract structured products
                elif "Structured products" in row_text and not any(x in row_text for x in ["Bonds", "Equities", "Assets", "Asset"]):
                    for j, cell in enumerate(row):
                        if re.search(r'\d+\'?\d*', cell) and j > 0:
                            asset_allocation["structured_products"] = {
                                "value": cell.strip(),
                                "percentage": next((row[k].strip() for k in range(j+1, len(row)) if "%" in row[k]), None)
                            }

                # Extract other assets
                elif "Other assets" in row_text:
                    for j, cell in enumerate(row):
                        if re.search(r'\d+\'?\d*', cell) and j > 0:
                            asset_allocation["other_assets"] = {
                                "value": cell.strip(),
                                "percentage": next((row[k].strip() for k in range(j+1, len(row)) if "%" in row[k]), None)
                            }

        return asset_allocation

    def _extract_messos_securities(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extract securities information from a messos PDF.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            List of dictionaries containing securities information
        """
        # Extract tables from securities pages (usually pages 6-12)
        tables = camelot.read_pdf(
            pdf_path,
            pages='6-12',
            flavor='stream',
            suppress_stdout=True
        )

        if self.debug:
            print(f"Found {len(tables)} tables on pages 6-12")

        securities = []

        # Process tables to find securities
        for i, table in enumerate(tables):
            # Convert to pandas DataFrame
            df = table.df

            # Check if this is a securities table by looking for ISIN
            table_text = ' '.join([' '.join(row) for row in df.values.tolist()])
            if 'ISIN:' in table_text:
                if self.debug:
                    print(f"Found securities table: table_{i+1} on page {table.page}")

                # Extract securities from this table
                securities.extend(self._extract_securities_from_table(df, table.page))

        # Post-process securities to clean up and add additional information
        securities = self._post_process_securities(securities)

        return securities

    def _extract_securities_from_table(self, df: pd.DataFrame, page_number: int) -> List[Dict[str, Any]]:
        """
        Extract securities from a table.

        Args:
            df: Pandas DataFrame containing the table
            page_number: Page number of the table

        Returns:
            List of dictionaries containing securities information
        """
        securities = []

        # Convert DataFrame to list of rows
        rows = df.values.tolist()

        # Process rows to extract securities
        current_security = None

        for row in rows:
            row_text = ' '.join(row)

            # Check if this row contains an ISIN
            isin_match = re.search(r'ISIN:\s*([A-Z]{2}[A-Z0-9]{9}[0-9])', row_text)

            if isin_match:
                # If we were processing a security, add it to the list
                if current_security:
                    securities.append(current_security)

                # Start a new security
                isin = isin_match.group(1)

                # Extract description/name from the row
                description = None
                for cell in row:
                    if len(cell) > 10 and 'ISIN:' not in cell:
                        description = cell.strip()
                        break

                # Extract nominal/quantity
                nominal = None
                for cell in row:
                    if re.search(r'\d+\'?\d*', cell) and len(cell) < 15:
                        nominal = cell.strip()
                        break

                # Extract value
                value = None
                for i, cell in enumerate(row):
                    if i+1 < len(row) and re.search(r'\d+\'?\d*', row[i+1]):
                        if re.search(r'\d+\'?\d*', row[i+1]):
                            value = row[i+1].strip()
                            break

                # Create new security
                current_security = {
                    'isin': isin,
                    'description': description,
                    'nominal': nominal,
                    'page': page_number,
                    'value': value,
                    'details': [row_text]
                }

            # If we're processing a security, add details
            elif current_security:
                # Skip empty rows
                if not row_text.strip():
                    continue

                # Add row as details
                current_security['details'].append(row_text)

                # Check for maturity date
                maturity_match = re.search(r'Maturity:\s*(\d{2}\.\d{2}\.\d{4})', row_text)
                if maturity_match:
                    current_security['maturity'] = maturity_match.group(1)

                # Check for coupon
                coupon_match = re.search(r'Coupon:.*?(\d+\.?\d*)\s*%', row_text)
                if coupon_match:
                    current_security['coupon'] = coupon_match.group(1) + '%'

                # Check for security type
                type_match = re.search(r'(Ordinary Bonds|Zero Bonds|Structured Bonds|Bond Funds|Ordinary Stocks)', row_text)
                if type_match:
                    current_security['type'] = type_match.group(1)

        # Add the last security if we were processing one
        if current_security:
            securities.append(current_security)

        return securities

    def _post_process_securities(self, securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Post-process securities to clean up and add additional information.

        Args:
            securities: List of securities to process

        Returns:
            Processed list of securities
        """
        processed_securities = []

        for security in securities:
            # Clean up nominal value
            if security.get('nominal'):
                security['nominal'] = security['nominal'].replace("'", "")

            # Clean up value
            if security.get('value'):
                security['value'] = security['value'].replace("'", "")

            # Extract currency
            currency = None
            for detail in security.get('details', []):
                currency_match = re.search(r'^(USD|EUR|CHF|GBP|JPY)', detail)
                if currency_match:
                    currency = currency_match.group(1)
                    break

            if currency:
                security['currency'] = currency

            # Extract more accurate value from details
            if not security.get('value'):
                for detail in security.get('details', []):
                    value_match = re.search(r'(\d+\'?\d*\'?\d*)\s+\d+\.?\d*%', detail)
                    if value_match:
                        security['value'] = value_match.group(1).replace("'", "")
                        break

            # Extract more accurate description from details
            if not security.get('description'):
                for detail in security.get('details', []):
                    if len(detail) > 20 and security['isin'] not in detail and 'ISIN:' not in detail:
                        security['description'] = detail.strip()
                        break

            processed_securities.append(security)

        return processed_securities

    def _extract_generic(self, pdf_path: str) -> Dict[str, Any]:
        """
        Generic extraction for other document types.

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Dictionary containing extracted information
        """
        # Extract tables from all pages
        tables = camelot.read_pdf(
            pdf_path,
            pages='all',
            flavor='stream',
            suppress_stdout=True
        )

        result = {
            "document_type": "generic",
            "securities": []
        }

        # Process tables to find securities
        for i, table in enumerate(tables):
            # Convert to pandas DataFrame
            df = table.df

            # Check if this is a securities table by looking for ISIN
            table_text = ' '.join([' '.join(row) for row in df.values.tolist()])
            if 'ISIN' in table_text:
                # Extract securities from this table
                securities = self._extract_securities_from_generic_table(df, table.page)
                result["securities"].extend(securities)

        return result

    def _extract_securities_from_generic_table(self, df: pd.DataFrame, page_number: int) -> List[Dict[str, Any]]:
        """
        Extract securities from a generic table.

        Args:
            df: Pandas DataFrame containing the table
            page_number: Page number of the table

        Returns:
            List of dictionaries containing securities information
        """
        securities = []

        # Convert DataFrame to list of rows
        rows = df.values.tolist()

        # Process rows to extract securities
        for row in rows:
            row_text = ' '.join(row)

            # Check if this row contains an ISIN
            isin_match = re.search(r'(?:ISIN|isin)[:\s]*([A-Z]{2}[A-Z0-9]{9}[0-9])', row_text, re.IGNORECASE)

            if isin_match:
                isin = isin_match.group(1)

                # Create new security
                security = {
                    'isin': isin,
                    'page': page_number,
                    'details': [row_text]
                }

                # Extract other information
                for i, cell in enumerate(row):
                    # Skip empty cells
                    if not cell.strip():
                        continue

                    # Skip the cell with the ISIN
                    if isin in cell:
                        continue

                    # Try to identify what this cell contains
                    if re.search(r'\d{2}\.\d{2}\.\d{4}', cell):
                        security['maturity'] = re.search(r'\d{2}\.\d{2}\.\d{4}', cell).group(0)
                    elif re.search(r'\d+\.?\d*\s*%', cell):
                        security['coupon'] = re.search(r'\d+\.?\d*\s*%', cell).group(0)
                    elif re.search(r'\d+\'?\d*\'?\d*', cell) and len(cell) < 15:
                        security['nominal'] = cell.strip().replace("'", "")
                    elif len(cell) > 10:
                        security['description'] = cell.strip()

                securities.append(security)

        return securities

    def _extract_portfolio_summary(self, text: str, document_type: str) -> Dict[str, Any]:
        """
        Extract portfolio summary from text.

        Args:
            text: Document text
            document_type: Document type

        Returns:
            Dictionary containing portfolio summary
        """
        summary = {
            "total_value": None,
            "currency": None,
            "valuation_date": None
        }

        # Extract total value
        total_value_patterns = [
            r'Total\s+Value\s*:?\s*([\d\,\.\'\'\s]+)',
            r'Total\s*:?\s*([\d\,\.\'\'\s]+)',
            r'Portfolio\s+Value\s*:?\s*([\d\,\.\'\'\s]+)',
            r'Portfolio\s+Total\s*:?\s*([\d\,\.\'\'\s]+)'
        ]

        for pattern in total_value_patterns:
            match = re.search(pattern, text, re.IGNORECASE)

            if match:
                value_str = match.group(1).strip().replace("'", "").replace(",", "")
                try:
                    summary["total_value"] = float(value_str)
                    break
                except:
                    pass

        # Extract currency
        currency_patterns = [
            r'(USD|EUR|GBP|CHF|JPY)',
            r'Currency\s*:?\s*(USD|EUR|GBP|CHF|JPY)',
            r'Valuation\s+Currency\s*:?\s*(USD|EUR|GBP|CHF|JPY)'
        ]

        for pattern in currency_patterns:
            match = re.search(pattern, text)

            if match:
                summary["currency"] = match.group(1)
                break

        # Extract valuation date
        date_patterns = [
            r'Valuation\s+Date\s*:?\s*(\d{2}\.\d{2}\.\d{4})',
            r'Date\s*:?\s*(\d{2}\.\d{2}\.\d{4})',
            r'As\s+of\s*:?\s*(\d{2}\.\d{2}\.\d{4})'
        ]

        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)

            if match:
                summary["valuation_date"] = match.group(1)
                break

        # Document-specific extraction
        if document_type == "messos":
            # For messos documents, try to extract total value from specific sections
            messos_total_pattern = r'Total\s+Value\s*:?\s*([\d\,\.\'\'\s]+)\s*USD'
            match = re.search(messos_total_pattern, text, re.IGNORECASE)

            if match:
                value_str = match.group(1).strip().replace("'", "").replace(",", "")
                try:
                    summary["total_value"] = float(value_str)
                except:
                    pass

            # Set currency to USD for messos documents
            summary["currency"] = "USD"

        return summary

    def _extract_asset_allocation(self, text: str, document_type: str) -> Dict[str, Any]:
        """
        Extract asset allocation from text.

        Args:
            text: Document text
            document_type: Document type

        Returns:
            Dictionary containing asset allocation
        """
        allocation = {}

        # Extract asset allocation
        allocation_patterns = [
            (r'Fixed\s+Income\s*:?\s*([\d\,\.\'\'\s]+)%', "Fixed Income"),
            (r'Equity\s*:?\s*([\d\,\.\'\'\s]+)%', "Equity"),
            (r'Funds?\s*:?\s*([\d\,\.\'\'\s]+)%', "Funds"),
            (r'Alternative\s*:?\s*([\d\,\.\'\'\s]+)%', "Alternative"),
            (r'Cash\s*:?\s*([\d\,\.\'\'\s]+)%', "Cash"),
            (r'Structured\s+Products?\s*:?\s*([\d\,\.\'\'\s]+)%', "Structured Products")
        ]

        for pattern, asset_class in allocation_patterns:
            match = re.search(pattern, text, re.IGNORECASE)

            if match:
                value_str = match.group(1).strip().replace("'", "").replace(",", "")
                try:
                    allocation[asset_class] = {
                        "percentage": float(value_str)
                    }
                except:
                    pass

        # Document-specific extraction
        if document_type == "messos":
            # For messos documents, try to extract asset allocation from specific sections
            messos_allocation_pattern = r'Asset\s+Allocation'
            match = re.search(messos_allocation_pattern, text, re.IGNORECASE)

            if match:
                # Extract the section after "Asset Allocation"
                section_start = match.end()
                section_end = min(section_start + 1000, len(text))
                section = text[section_start:section_end]

                # Extract asset classes and percentages
                asset_class_pattern = r'([A-Za-z\s]+)\s+([\d\,\.\'\'\s]+)%'
                asset_class_matches = re.findall(asset_class_pattern, section)

                for asset_class, percentage in asset_class_matches:
                    asset_class = asset_class.strip()
                    percentage_str = percentage.strip().replace("'", "").replace(",", "")

                    try:
                        allocation[asset_class] = {
                            "percentage": float(percentage_str)
                        }
                    except:
                        pass

        return allocation

    def _validate_securities(self, securities: List[Dict[str, Any]], portfolio_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Validate securities.

        Args:
            securities: List of securities to validate
            portfolio_summary: Portfolio summary

        Returns:
            List of validated securities
        """
        validated_securities = []

        for security in securities:
            # Validate ISIN
            isin = security.get("isin")

            if not isin or not self._is_valid_isin(isin):
                if self.debug:
                    print(f"Invalid ISIN: {isin}")
                continue

            # Clean up values
            for field in ["nominal_value", "price", "actual_value"]:
                if security.get(field):
                    if isinstance(security[field], str):
                        security[field] = security[field].replace("'", "").replace(",", "")
                        try:
                            security[field] = float(security[field])
                        except:
                            pass

            # Map fields from old format to new format
            if "nominal" in security and "nominal_value" not in security:
                security["nominal_value"] = security["nominal"]

            if "value" in security and "actual_value" not in security:
                security["actual_value"] = security["value"]

            # Validate actual value
            if security.get("nominal_value") and security.get("price") and not security.get("actual_value"):
                # Calculate actual value
                try:
                    nominal = float(security["nominal_value"])
                    price = float(security["price"])
                    security["actual_value"] = nominal * price / 100
                except:
                    pass

            # Set currency from portfolio summary if not present
            if not security.get("currency") and portfolio_summary.get("currency"):
                security["currency"] = portfolio_summary["currency"]

            # Add to validated securities
            validated_securities.append(security)

        return validated_securities

    def _is_valid_isin(self, isin: str) -> bool:
        """
        Validate an ISIN.

        Args:
            isin: ISIN to validate

        Returns:
            True if valid, False otherwise
        """
        # Use the imported is_valid_isin function
        return is_valid_isin(isin)

def main():
    """
    Main function for testing the SecurityExtractor.
    """
    import argparse

    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Extract securities from a PDF.')
    parser.add_argument('pdf_path', nargs='?', help='Path to the PDF file')
    parser.add_argument('--debug', action='store_true', help='Print debug information')
    parser.add_argument('--output', help='Path to save the output JSON')

    args = parser.parse_args()

    # Get PDF path
    pdf_path = args.pdf_path

    if not pdf_path:
        # Find the messos PDF file
        for root, dirs, files in os.walk('.'):
            for file in files:
                if 'messos' in file.lower() and file.lower().endswith('.pdf'):
                    pdf_path = os.path.join(root, file)
                    break
            if pdf_path:
                break

    if not pdf_path:
        print("Could not find the messos PDF file. Please provide the path:")
        pdf_path = input("> ")

    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return

    # Extract securities
    extractor = SecurityExtractor(debug=args.debug or True)
    result = extractor.extract_from_pdf(pdf_path)

    # Save results
    output_path = args.output or 'messos_enhanced.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Saved results to {output_path}")

    # Print summary
    print("\nDocument Type:", result["document_type"])

    if "portfolio_summary" in result:
        print("\nPortfolio Summary:")
        for key, value in result["portfolio_summary"].items():
            print(f"  {key}: {value}")

    if "asset_allocation" in result:
        print("\nAsset Allocation:")
        for key, value in result["asset_allocation"].items():
            if value:
                print(f"  {key}: {value.get('value', 'N/A')} ({value.get('percentage', 'N/A')})")

    print(f"\nFound {len(result['securities'])} securities")

    # Print first 3 securities as example
    for i, security in enumerate(result["securities"][:3]):
        print(f"\nSecurity {i+1}:")
        print(f"  ISIN: {security.get('isin', 'Unknown')}")
        print(f"  Description: {security.get('description', 'Unknown')}")
        print(f"  Type: {security.get('type', 'Unknown')}")
        print(f"  Nominal Value: {security.get('nominal_value', security.get('nominal', 'Unknown'))}")
        print(f"  Price: {security.get('price', 'Unknown')}")
        print(f"  Actual Value: {security.get('actual_value', security.get('value', 'Unknown'))}")
        print(f"  Currency: {security.get('currency', 'Unknown')}")
        print(f"  Maturity: {security.get('maturity', 'Unknown')}")
        print(f"  Coupon: {security.get('coupon', 'Unknown')}")

if __name__ == "__main__":
    main()
