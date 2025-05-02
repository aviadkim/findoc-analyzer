"""
Financial Knowledge Base for document understanding.

This module provides domain-specific knowledge about financial documents,
including common patterns, relationships, and validation rules.
"""
from typing import Dict, List, Any, Optional
import re

class FinancialDocumentKnowledge:
    """Knowledge base for financial document understanding."""
    
    # Common column patterns in financial documents
    COLUMN_PATTERNS = {
        "isin": ["isin", "security id", "identifier", "id", "security code"],
        "description": ["description", "security name", "name", "security", "instrument"],
        "nominal": ["nominal", "quantity", "amount", "face value", "par", "nominal value"],
        "price": ["price", "rate", "quote", "market price", "price %"],
        "value": ["value", "valuation", "market value", "amount", "total"],
        "currency": ["currency", "ccy", "curr", "cur"],
        "maturity": ["maturity", "maturity date", "due date", "expiry"],
        "coupon": ["coupon", "interest rate", "rate", "yield", "coupon rate"]
    }
    
    # Relationships between financial concepts
    RELATIONSHIPS = {
        "value_calculation": "price * nominal / 100",
        "yield_calculation": "coupon / price * 100",
        "total_verification": "sum of individual values should equal portfolio total"
    }
    
    # Document type indicators
    DOCUMENT_TYPES = {
        "portfolio_statement": ["portfolio statement", "asset statement", "holdings", "portfolio summary"],
        "account_statement": ["account statement", "transaction statement", "account summary"],
        "fund_fact_sheet": ["fact sheet", "fund information", "kiid", "key investor information"],
        "messos": ["messos", "messos enterprises", "cornèr banca"]
    }
    
    # Security type patterns
    SECURITY_TYPES = {
        "bond": ["bond", "note", "debt", "fixed income"],
        "equity": ["equity", "stock", "share"],
        "fund": ["fund", "etf", "mutual fund", "investment fund"],
        "structured_product": ["structured", "certificate", "structured note", "structured product"],
        "derivative": ["option", "future", "forward", "swap", "derivative"]
    }
    
    # Currency symbols and codes
    CURRENCIES = {
        "USD": ["$", "USD", "US Dollar", "Dollar"],
        "EUR": ["€", "EUR", "Euro"],
        "GBP": ["£", "GBP", "British Pound", "Pound Sterling"],
        "CHF": ["CHF", "Swiss Franc"],
        "JPY": ["¥", "JPY", "Japanese Yen", "Yen"]
    }
    
    # Date formats
    DATE_FORMATS = [
        r"\d{2}\.\d{2}\.\d{4}",  # DD.MM.YYYY
        r"\d{2}/\d{2}/\d{4}",    # DD/MM/YYYY
        r"\d{2}-\d{2}-\d{4}",    # DD-MM-YYYY
        r"\d{4}-\d{2}-\d{2}",    # YYYY-MM-DD
        r"\d{4}/\d{2}/\d{2}"     # YYYY/MM/DD
    ]
    
    # ISIN validation pattern
    ISIN_PATTERN = r"[A-Z]{2}[A-Z0-9]{9}[0-9]"
    
    @classmethod
    def detect_document_type(cls, text: str) -> str:
        """
        Detect the type of financial document based on text content.
        
        Args:
            text: Text content of the document
            
        Returns:
            Document type as a string
        """
        text_lower = text.lower()
        
        for doc_type, patterns in cls.DOCUMENT_TYPES.items():
            for pattern in patterns:
                if pattern.lower() in text_lower:
                    return doc_type
        
        return "unknown"
    
    @classmethod
    def detect_security_type(cls, description: str) -> str:
        """
        Detect the type of security based on its description.
        
        Args:
            description: Security description
            
        Returns:
            Security type as a string
        """
        description_lower = description.lower()
        
        for sec_type, patterns in cls.SECURITY_TYPES.items():
            for pattern in patterns:
                if pattern.lower() in description_lower:
                    return sec_type
        
        return "unknown"
    
    @classmethod
    def detect_currency(cls, text: str) -> str:
        """
        Detect currency from text.
        
        Args:
            text: Text to detect currency from
            
        Returns:
            Currency code as a string
        """
        text_lower = text.lower()
        
        for currency, patterns in cls.CURRENCIES.items():
            for pattern in patterns:
                if pattern.lower() in text_lower:
                    return currency
        
        return "USD"  # Default to USD
    
    @classmethod
    def extract_dates(cls, text: str) -> List[str]:
        """
        Extract dates from text.
        
        Args:
            text: Text to extract dates from
            
        Returns:
            List of extracted dates
        """
        dates = []
        
        for date_format in cls.DATE_FORMATS:
            matches = re.findall(date_format, text)
            dates.extend(matches)
        
        return dates
    
    @classmethod
    def is_valid_isin(cls, isin: str) -> bool:
        """
        Validate an ISIN number.
        
        Args:
            isin: ISIN to validate
            
        Returns:
            True if valid, False otherwise
        """
        # Check format
        if not re.match(cls.ISIN_PATTERN, isin):
            return False
        
        # Check length
        if len(isin) != 12:
            return False
        
        # Check digit validation
        try:
            # Convert letters to numbers (A=10, B=11, ..., Z=35)
            values = []
            for char in isin[:-1]:  # Exclude check digit
                if char.isdigit():
                    values.append(int(char))
                else:
                    values.append(ord(char) - ord('A') + 10)
            
            # Double every second digit from right to left
            for i in range(len(values)-1, -1, -2):
                values[i] *= 2
                if values[i] > 9:
                    values[i] = values[i] % 10 + values[i] // 10
            
            # Sum all digits
            total = sum(values)
            
            # Check digit is the amount needed to reach the next multiple of 10
            check_digit = (10 - (total % 10)) % 10
            
            return check_digit == int(isin[-1])
        except Exception:
            return False
    
    @classmethod
    def validate_security_data(cls, security: Dict[str, Any]) -> Dict[str, bool]:
        """
        Validate security data for consistency.
        
        Args:
            security: Security data to validate
            
        Returns:
            Dictionary with validation results
        """
        validation = {
            "isin_valid": False,
            "value_calculation_valid": False,
            "data_complete": False
        }
        
        # Validate ISIN
        if 'isin' in security:
            validation["isin_valid"] = cls.is_valid_isin(security['isin'])
        
        # Validate value calculation
        if all(k in security for k in ['nominal_value', 'price', 'actual_value']):
            try:
                nominal = float(str(security['nominal_value']).replace(',', '').replace("'", ""))
                price = float(str(security['price']).replace(',', '').replace("'", ""))
                value = float(str(security['actual_value']).replace(',', '').replace("'", ""))
                
                calculated_value = nominal * price / 100
                # Allow for 5% deviation
                validation["value_calculation_valid"] = abs(calculated_value - value) / value < 0.05
            except (ValueError, ZeroDivisionError):
                validation["value_calculation_valid"] = False
        
        # Check data completeness
        required_fields = ['isin', 'description', 'nominal_value', 'actual_value', 'currency']
        validation["data_complete"] = all(field in security for field in required_fields)
        
        return validation

# Example usage
if __name__ == "__main__":
    # Test document type detection
    text = "Portfolio Statement as of 31.12.2023"
    doc_type = FinancialDocumentKnowledge.detect_document_type(text)
    print(f"Document type: {doc_type}")
    
    # Test ISIN validation
    isin = "US0378331005"  # Apple Inc.
    is_valid = FinancialDocumentKnowledge.is_valid_isin(isin)
    print(f"ISIN {isin} is valid: {is_valid}")
    
    # Test security type detection
    description = "Apple Inc. Common Stock"
    sec_type = FinancialDocumentKnowledge.detect_security_type(description)
    print(f"Security type: {sec_type}")
