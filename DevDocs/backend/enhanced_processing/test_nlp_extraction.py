"""
Test script for NLP-based financial data extraction.

This script tests the NLP-based financial data extraction features of the Financial Document Processor.
"""

import os
import sys
import json
import logging
from pathlib import Path

# Add parent directory to path to import financial_document_processor
sys.path.append(str(Path(__file__).parent.parent))

from enhanced_processing.financial_document_processor import FinancialDocumentProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def test_price_extraction():
    """
    Test price extraction.
    """
    processor = FinancialDocumentProcessor()
    
    test_cases = [
        "The price is $100.50 per share.",
        "The bond is trading at EUR 98.75.",
        "Current value: 1,234.56 USD",
        "Market price: 1.234,56 €",
        "The stock closed at 45.67 pounds.",
        "JPY 10,000 per unit",
        "CHF 123.45",
        "1 234,56 CAD",
    ]
    
    print("\n=== Price Extraction Test ===")
    for text in test_cases:
        price_info = processor._extract_price(text)
        print(f"Text: {text}")
        print(f"Extracted: {price_info}")
        print()

def test_quantity_extraction():
    """
    Test quantity extraction.
    """
    processor = FinancialDocumentProcessor()
    
    test_cases = [
        "100 shares",
        "Quantity: 1,234 units",
        "The portfolio contains 5,678 pieces",
        "Amount: 1.234 shares",
        "Shares: 1 234",
        "Qty: 42",
        "Anzahl: 567",
        "Quantité: 890",
    ]
    
    print("\n=== Quantity Extraction Test ===")
    for text in test_cases:
        quantity = processor._extract_quantity(text)
        print(f"Text: {text}")
        print(f"Extracted: {quantity}")
        print()

def test_currency_extraction():
    """
    Test currency extraction.
    """
    processor = FinancialDocumentProcessor()
    
    test_cases = [
        "The price is $100.50 per share.",
        "The bond is trading at EUR 98.75.",
        "Current value: 1,234.56 USD",
        "Market price: 1.234,56 €",
        "The stock closed at 45.67 pounds.",
        "JPY 10,000 per unit",
        "CHF 123.45",
        "1 234,56 CAD",
    ]
    
    print("\n=== Currency Extraction Test ===")
    for text in test_cases:
        currency = processor._extract_currency(text)
        print(f"Text: {text}")
        print(f"Extracted: {currency}")
        print()

def test_security_type_extraction():
    """
    Test security type extraction.
    """
    processor = FinancialDocumentProcessor()
    
    test_cases = [
        "Apple Inc. common stock",
        "US Treasury 10-year bond",
        "Vanguard S&P 500 ETF fund",
        "MSFT 250 Call Option",
        "E-mini S&P 500 Future",
        "Credit Suisse Structured Product",
        "Deutsche Bank Anleihe",
        "Total SA Action",
    ]
    
    print("\n=== Security Type Extraction Test ===")
    for text in test_cases:
        security_type = processor._extract_security_type(text)
        print(f"Text: {text}")
        print(f"Extracted: {security_type}")
        print()

def test_date_extraction():
    """
    Test date extraction.
    """
    processor = FinancialDocumentProcessor()
    
    test_cases = [
        "Valuation date: 2023-01-15",
        "Maturity: 01/15/2030",
        "Issue date: 15.01.2020",
        "Settlement date: 1st January 2023",
        "As of 2023-03-31, the portfolio value was $1,000,000.",
        "The bond matures on 15.06.2025 with a yield of 3.5%.",
        "Issued on 01/10/2019 by XYZ Bank.",
        "Settlement: 15th March 2023",
    ]
    
    print("\n=== Date Extraction Test ===")
    for text in test_cases:
        dates = processor._extract_dates(text)
        print(f"Text: {text}")
        print(f"Extracted: {dates}")
        print()

def test_security_name_extraction():
    """
    Test security name extraction.
    """
    processor = FinancialDocumentProcessor()
    
    test_cases = [
        "Name: Apple Inc. (ISIN: US0378331005)",
        "US0378331005 - Apple Inc.",
        "Security: Microsoft Corporation, ISIN: US5949181045",
        "ISIN: DE0007664039, Name: Volkswagen AG",
        "ISIN US0231351067 (Amazon.com Inc.)",
        "Title: 'Tesla Inc.' with ISIN US88160R1014",
        "ISIN FR0000120271 Total Energies",
        "Alphabet Inc. Class A (ISIN: US02079K3059)",
    ]
    
    print("\n=== Security Name Extraction Test ===")
    for text in test_cases:
        # Extract ISIN first
        isin_pattern = r'\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b'
        import re
        isins = re.findall(isin_pattern, text)
        if isins:
            isin = isins[0]
            name = processor._extract_security_name(text, isin)
            print(f"Text: {text}")
            print(f"ISIN: {isin}")
            print(f"Extracted name: {name}")
            print()

def test_financial_data_extraction():
    """
    Test financial data extraction for ISINs.
    """
    processor = FinancialDocumentProcessor()
    
    test_cases = [
        "Apple Inc. (ISIN: US0378331005) is trading at $175.50 with 100 shares in the portfolio. The stock is valued at $17,550.00 as of 2023-04-15.",
        "Bond ISIN: XS2530201644, Maturity: 15.06.2028, Price: 98.75 EUR, Quantity: 10,000 units, Type: Fixed Income",
        "Vanguard S&P 500 ETF (US9229087690) - 250 shares at $410.25 USD, Total value: $102,562.50, Asset class: Fund",
        "ISIN DE0007664039 Volkswagen AG, 150 shares, Price: 145,60 EUR, Valuation date: 31.03.2023",
        "Microsoft Corporation (ISIN: US5949181045) - 75 shares - $350.25 per share - $26,268.75 total - Equity",
    ]
    
    print("\n=== Financial Data Extraction Test ===")
    for text in test_cases:
        # Extract ISIN first
        isin_pattern = r'\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b'
        import re
        isins = re.findall(isin_pattern, text)
        if isins:
            isin = isins[0]
            financial_data = processor._extract_financial_data_for_isin(isin, text)
            print(f"Text: {text}")
            print(f"ISIN: {isin}")
            print(f"Extracted data: {json.dumps(financial_data, indent=2, default=str)}")
            print()

def test_nlp_extraction():
    """
    Test NLP-based extraction.
    """
    processor = FinancialDocumentProcessor()
    
    test_cases = [
        "Apple Inc. (ISIN: US0378331005) is trading at $175.50 with 100 shares in the portfolio. The stock is valued at $17,550.00 as of 2023-04-15.",
        "Bond ISIN: XS2530201644, Maturity: 15.06.2028, Price: 98.75 EUR, Quantity: 10,000 units, Type: Fixed Income",
        "Vanguard S&P 500 ETF (US9229087690) - 250 shares at $410.25 USD, Total value: $102,562.50, Asset class: Fund",
        "ISIN DE0007664039 Volkswagen AG, 150 shares, Price: 145,60 EUR, Valuation date: 31.03.2023",
        "Microsoft Corporation (ISIN: US5949181045) - 75 shares - $350.25 per share - $26,268.75 total - Equity",
    ]
    
    print("\n=== NLP Extraction Test ===")
    for text in test_cases:
        # Extract ISIN first
        isin_pattern = r'\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b'
        import re
        isins = re.findall(isin_pattern, text)
        if isins:
            isin = isins[0]
            nlp_data = processor._extract_data_with_nlp(text, isin)
            print(f"Text: {text}")
            print(f"ISIN: {isin}")
            print(f"Extracted NLP data: {json.dumps(nlp_data, indent=2, default=str)}")
            print()

def main():
    """
    Main function.
    """
    print("Testing NLP-based financial data extraction")
    
    # Run tests
    test_price_extraction()
    test_quantity_extraction()
    test_currency_extraction()
    test_security_type_extraction()
    test_date_extraction()
    test_security_name_extraction()
    test_financial_data_extraction()
    test_nlp_extraction()
    
    print("\nAll tests completed")

if __name__ == "__main__":
    main()
