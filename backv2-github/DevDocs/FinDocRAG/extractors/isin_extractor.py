"""
ISIN extractor for financial document processing.
"""
import logging
import re
import pandas as pd
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class ISINExtractor:
    """
    Extract ISINs and financial data from documents.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the ISIN extractor.
        
        Args:
            config: Configuration options
        """
        self.config = config or {}
    
    def extract_isins(self, text: str) -> List[str]:
        """
        Extract ISINs from text.
        
        Args:
            text: Text to extract ISINs from
            
        Returns:
            List of extracted ISINs
        """
        # ISIN pattern: 2 letters followed by 10 alphanumeric characters
        isin_pattern = r'[A-Z]{2}[A-Z0-9]{10}'
        
        # Find all matches
        isins = re.findall(isin_pattern, text)
        
        # Remove duplicates
        unique_isins = list(set(isins))
        
        # Validate ISINs
        valid_isins = [isin for isin in unique_isins if self._validate_isin(isin)]
        
        return valid_isins
    
    def extract_financial_data(self, text: str, tables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract financial data from text and tables.
        
        Args:
            text: Text to extract financial data from
            tables: Tables extracted from the document
            
        Returns:
            Extracted financial data
        """
        # Extract ISINs
        isins = self.extract_isins(text)
        
        # Extract securities
        securities = self._extract_securities(text, tables, isins)
        
        # Extract total value
        total_value = self._extract_total_value(text, tables)
        
        # Extract currency
        currency = self._extract_currency(text, tables)
        
        # Extract asset allocation
        asset_allocation = self._extract_asset_allocation(text, tables)
        
        # Compile financial data
        financial_data = {
            "securities": securities,
            "total_value": total_value,
            "currency": currency,
            "asset_allocation": asset_allocation,
            "metrics": {}
        }
        
        return financial_data
    
    def extract_financial_data_from_excel(self, sheets_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract financial data from Excel sheets.
        
        Args:
            sheets_data: Data from Excel sheets
            
        Returns:
            Extracted financial data
        """
        # Extract text from all sheets
        all_text = " ".join([sheet["text"] for sheet in sheets_data])
        
        # Extract ISINs
        isins = self.extract_isins(all_text)
        
        # Extract securities
        securities = []
        
        for sheet in sheets_data:
            if "data" in sheet:
                for row in sheet["data"]:
                    # Check if any cell contains an ISIN
                    for cell in row.values():
                        for isin in isins:
                            if isin in str(cell):
                                # Extract security data
                                security = self._extract_security_from_row(row, isin)
                                if security:
                                    securities.append(security)
        
        # Extract total value
        total_value = 0
        
        for sheet in sheets_data:
            if "data" in sheet:
                for row in sheet["data"]:
                    # Look for total value
                    for key, value in row.items():
                        if "total" in str(key).lower() and self._is_numeric(value):
                            try:
                                total_value = float(self._clean_numeric(value))
                                break
                            except ValueError:
                                pass
        
        # Extract currency
        currency = self._extract_currency_from_excel(sheets_data)
        
        # Compile financial data
        financial_data = {
            "securities": securities,
            "total_value": total_value,
            "currency": currency,
            "asset_allocation": {},
            "metrics": {}
        }
        
        return financial_data
    
    def extract_financial_data_from_csv(self, csv_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract financial data from CSV data.
        
        Args:
            csv_data: Data from CSV file
            
        Returns:
            Extracted financial data
        """
        # Convert CSV data to text
        text = ""
        for row in csv_data:
            text += " ".join(str(value) for value in row.values()) + " "
        
        # Extract ISINs
        isins = self.extract_isins(text)
        
        # Extract securities
        securities = []
        
        for row in csv_data:
            # Check if any cell contains an ISIN
            for cell in row.values():
                for isin in isins:
                    if isin in str(cell):
                        # Extract security data
                        security = self._extract_security_from_row(row, isin)
                        if security:
                            securities.append(security)
        
        # Extract total value
        total_value = 0
        
        for row in csv_data:
            # Look for total value
            for key, value in row.items():
                if "total" in str(key).lower() and self._is_numeric(value):
                    try:
                        total_value = float(self._clean_numeric(value))
                        break
                    except ValueError:
                        pass
        
        # Extract currency
        currency = self._extract_currency_from_csv(csv_data)
        
        # Compile financial data
        financial_data = {
            "securities": securities,
            "total_value": total_value,
            "currency": currency,
            "asset_allocation": {},
            "metrics": {}
        }
        
        return financial_data
    
    def _validate_isin(self, isin: str) -> bool:
        """
        Validate an ISIN.
        
        Args:
            isin: ISIN to validate
            
        Returns:
            True if valid, False otherwise
        """
        # Basic validation: 2 letters followed by 10 alphanumeric characters
        if not re.match(r'^[A-Z]{2}[A-Z0-9]{10}$', isin):
            return False
        
        # Check digit validation (Luhn algorithm)
        try:
            # Convert letters to numbers (A=10, B=11, ..., Z=35)
            digits = []
            for char in isin:
                if char.isalpha():
                    digits.append(ord(char) - ord('A') + 10)
                else:
                    digits.append(int(char))
            
            # Reverse the digits
            digits = digits[::-1]
            
            # Apply Luhn algorithm
            total = 0
            for i, digit in enumerate(digits):
                if i % 2 == 0:
                    total += digit
                else:
                    total += sum(int(d) for d in str(digit * 2))
            
            return total % 10 == 0
        except Exception:
            return False
    
    def _extract_securities(self, text: str, tables: List[Dict[str, Any]], isins: List[str]) -> List[Dict[str, Any]]:
        """
        Extract securities from text and tables.
        
        Args:
            text: Text to extract securities from
            tables: Tables extracted from the document
            isins: List of ISINs
            
        Returns:
            List of extracted securities
        """
        securities = []
        
        # Extract securities from tables
        for table in tables:
            if "data" not in table:
                continue
            
            for row in table["data"]:
                # Check if any cell contains an ISIN
                for cell in row.values():
                    for isin in isins:
                        if isin in str(cell):
                            # Extract security data
                            security = self._extract_security_from_row(row, isin)
                            if security:
                                securities.append(security)
        
        # Extract securities from text
        for isin in isins:
            # Find context around ISIN
            isin_index = text.find(isin)
            if isin_index >= 0:
                # Get context (100 characters before and after)
                start = max(0, isin_index - 100)
                end = min(len(text), isin_index + 100)
                context = text[start:end]
                
                # Extract security data
                security = self._extract_security_from_text(context, isin)
                if security:
                    # Check if already extracted
                    if not any(s["identifier"] == isin for s in securities):
                        securities.append(security)
        
        return securities
    
    def _extract_security_from_row(self, row: Dict[str, Any], isin: str) -> Optional[Dict[str, Any]]:
        """
        Extract security data from a table row.
        
        Args:
            row: Table row
            isin: ISIN
            
        Returns:
            Extracted security data or None
        """
        security = {
            "name": "",
            "identifier": isin,
            "quantity": None,
            "value": None
        }
        
        # Extract name
        for key, value in row.items():
            if "name" in str(key).lower() or "description" in str(key).lower():
                security["name"] = str(value).strip()
                break
        
        # If no name found, use the first non-empty cell
        if not security["name"]:
            for value in row.values():
                if value and not self._is_numeric(value) and isin not in str(value):
                    security["name"] = str(value).strip()
                    break
        
        # Extract quantity
        for key, value in row.items():
            if "quantity" in str(key).lower() or "amount" in str(key).lower() or "units" in str(key).lower():
                if self._is_numeric(value):
                    security["quantity"] = self._clean_numeric(value)
                    break
        
        # Extract value
        for key, value in row.items():
            if "value" in str(key).lower() or "total" in str(key).lower() or "market" in str(key).lower():
                if self._is_numeric(value):
                    security["value"] = self._clean_numeric(value)
                    break
        
        # If no value found, look for the last numeric cell
        if security["value"] is None:
            for value in reversed(list(row.values())):
                if self._is_numeric(value):
                    security["value"] = self._clean_numeric(value)
                    break
        
        return security
    
    def _extract_security_from_text(self, text: str, isin: str) -> Optional[Dict[str, Any]]:
        """
        Extract security data from text.
        
        Args:
            text: Text to extract security data from
            isin: ISIN
            
        Returns:
            Extracted security data or None
        """
        security = {
            "name": "",
            "identifier": isin,
            "quantity": None,
            "value": None
        }
        
        # Extract name
        # Look for common patterns
        name_patterns = [
            r'([^0-9\n]{3,50})\s+' + re.escape(isin),  # Name before ISIN
            re.escape(isin) + r'\s+([^0-9\n]{3,50})'   # Name after ISIN
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text)
            if match:
                security["name"] = match.group(1).strip()
                break
        
        # Extract quantity and value
        # Look for numbers near the ISIN
        number_pattern = r'[\d,\.\']+\s*(?:[A-Z]{3})?'
        numbers = re.findall(number_pattern, text)
        
        if len(numbers) >= 2:
            # Assume first number is quantity, last is value
            try:
                security["quantity"] = self._clean_numeric(numbers[0])
                security["value"] = self._clean_numeric(numbers[-1])
            except ValueError:
                pass
        
        return security
    
    def _extract_total_value(self, text: str, tables: List[Dict[str, Any]]) -> float:
        """
        Extract total value from text and tables.
        
        Args:
            text: Text to extract total value from
            tables: Tables extracted from the document
            
        Returns:
            Extracted total value
        """
        # Look for total value in tables
        for table in tables:
            if "data" not in table:
                continue
            
            for row in table["data"]:
                # Check if row contains "total"
                for key, value in row.items():
                    if "total" in str(key).lower() or "total" in str(value).lower():
                        # Look for numeric value
                        for cell in row.values():
                            if self._is_numeric(cell):
                                try:
                                    return float(self._clean_numeric(cell))
                                except ValueError:
                                    pass
        
        # Look for total value in text
        total_patterns = [
            r'total\s+value\s*[:\-]?\s*([\d,\.\']+)',
            r'total\s*[:\-]?\s*([\d,\.\']+)',
            r'portfolio\s+value\s*[:\-]?\s*([\d,\.\']+)'
        ]
        
        for pattern in total_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return float(self._clean_numeric(match.group(1)))
                except ValueError:
                    pass
        
        return 0.0
    
    def _extract_currency(self, text: str, tables: List[Dict[str, Any]]) -> str:
        """
        Extract currency from text and tables.
        
        Args:
            text: Text to extract currency from
            tables: Tables extracted from the document
            
        Returns:
            Extracted currency
        """
        # Common currencies
        currencies = ["USD", "EUR", "GBP", "CHF", "JPY", "CAD", "AUD"]
        
        # Look for currency in tables
        for table in tables:
            if "data" not in table:
                continue
            
            for row in table["data"]:
                for cell in row.values():
                    for currency in currencies:
                        if currency in str(cell):
                            return currency
        
        # Look for currency in text
        for currency in currencies:
            if currency in text:
                return currency
        
        # Look for currency symbols
        currency_symbols = {
            "$": "USD",
            "€": "EUR",
            "£": "GBP",
            "¥": "JPY",
            "Fr.": "CHF"
        }
        
        for symbol, currency in currency_symbols.items():
            if symbol in text:
                return currency
        
        return "USD"  # Default
    
    def _extract_asset_allocation(self, text: str, tables: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Extract asset allocation from text and tables.
        
        Args:
            text: Text to extract asset allocation from
            tables: Tables extracted from the document
            
        Returns:
            Extracted asset allocation
        """
        asset_allocation = {}
        
        # Common asset classes
        asset_classes = [
            "Equities", "Bonds", "Cash", "Commodities", "Real Estate",
            "Alternatives", "Fixed Income", "Stocks", "Funds", "ETFs",
            "Derivatives", "Options", "Futures", "Currencies", "Crypto",
            "Structured Products", "Liquidity", "Other"
        ]
        
        # Look for asset allocation in tables
        for table in tables:
            if "data" not in table:
                continue
            
            # Check if table might be an asset allocation table
            is_allocation_table = False
            for row in table["data"]:
                for cell in row.values():
                    if "allocation" in str(cell).lower() or "asset" in str(cell).lower():
                        is_allocation_table = True
                        break
                if is_allocation_table:
                    break
            
            if is_allocation_table:
                for row in table["data"]:
                    # Look for asset class and percentage
                    asset_class = None
                    percentage = None
                    
                    for cell in row.values():
                        # Check if cell contains an asset class
                        for ac in asset_classes:
                            if ac.lower() in str(cell).lower():
                                asset_class = ac
                                break
                        
                        # Check if cell contains a percentage
                        if "%" in str(cell):
                            try:
                                percentage = float(str(cell).replace("%", "").strip())
                            except ValueError:
                                pass
                    
                    if asset_class and percentage is not None:
                        asset_allocation[asset_class] = percentage
        
        # If no asset allocation found, look for it in text
        if not asset_allocation:
            for asset_class in asset_classes:
                pattern = r'{}[^%]*?(\d+\.?\d*)%'.format(asset_class)
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    try:
                        percentage = float(match.group(1))
                        asset_allocation[asset_class] = percentage
                    except ValueError:
                        pass
        
        return asset_allocation
    
    def _extract_currency_from_excel(self, sheets_data: List[Dict[str, Any]]) -> str:
        """
        Extract currency from Excel sheets.
        
        Args:
            sheets_data: Data from Excel sheets
            
        Returns:
            Extracted currency
        """
        # Common currencies
        currencies = ["USD", "EUR", "GBP", "CHF", "JPY", "CAD", "AUD"]
        
        # Look for currency in sheets
        for sheet in sheets_data:
            if "data" not in sheet:
                continue
            
            for row in sheet["data"]:
                for cell in row.values():
                    for currency in currencies:
                        if currency in str(cell):
                            return currency
        
        return "USD"  # Default
    
    def _extract_currency_from_csv(self, csv_data: List[Dict[str, Any]]) -> str:
        """
        Extract currency from CSV data.
        
        Args:
            csv_data: Data from CSV file
            
        Returns:
            Extracted currency
        """
        # Common currencies
        currencies = ["USD", "EUR", "GBP", "CHF", "JPY", "CAD", "AUD"]
        
        # Look for currency in CSV data
        for row in csv_data:
            for cell in row.values():
                for currency in currencies:
                    if currency in str(cell):
                        return currency
        
        return "USD"  # Default
    
    def _is_numeric(self, value: Any) -> bool:
        """
        Check if a value is numeric.
        
        Args:
            value: Value to check
            
        Returns:
            True if numeric, False otherwise
        """
        if value is None:
            return False
        
        # Convert to string
        value_str = str(value)
        
        # Remove common formatting
        value_str = value_str.replace(",", "").replace("'", "").replace(" ", "")
        
        # Check if it's a number
        try:
            float(value_str)
            return True
        except ValueError:
            return False
    
    def _clean_numeric(self, value: Any) -> float:
        """
        Clean a numeric value.
        
        Args:
            value: Value to clean
            
        Returns:
            Cleaned numeric value
        """
        if value is None:
            return 0.0
        
        # Convert to string
        value_str = str(value)
        
        # Remove common formatting
        value_str = value_str.replace(",", "").replace("'", "").replace(" ", "")
        
        # Remove currency symbols
        currency_symbols = ["$", "€", "£", "¥", "Fr."]
        for symbol in currency_symbols:
            value_str = value_str.replace(symbol, "")
        
        # Remove percentage sign
        value_str = value_str.replace("%", "")
        
        # Convert to float
        return float(value_str)
