#!/usr/bin/env python3
"""
Tests for the enhanced securities formats support in the SecurityExtractor.

This script tests the extraction capabilities for the following formats:
- Interactive Brokers
- Charles Schwab
- Vanguard
- Fidelity
- TD Ameritrade
- E*TRADE
"""

import os
import json
import unittest
from enhanced_securities_extractor import SecurityExtractor
from enhanced_securities_formats import (
    DOCUMENT_TYPE_PATTERNS,
    detect_document_format
)

class TestEnhancedFormats(unittest.TestCase):
    """Test suite for enhanced formats support."""
    
    def setUp(self):
        """Set up test environment."""
        self.extractor = SecurityExtractor(debug=True)
        
        # Sample paths
        self.test_data_dir = os.path.join(os.path.dirname(__file__), 'test_data')
        self.sample_paths = {
            'interactive_brokers': None,
            'schwab': None,
            'vanguard': None,
            'fidelity': None,
            'tdameritrade': None,
            'etrade': None
        }
        
        # Find sample files if available
        for root, dirs, files in os.walk('.'):
            for file in files:
                if file.lower().endswith('.pdf'):
                    file_lower = file.lower()
                    
                    # Check if file name contains any of our format keywords
                    if 'interactive' in file_lower or 'ibkr' in file_lower:
                        self.sample_paths['interactive_brokers'] = os.path.join(root, file)
                    elif 'schwab' in file_lower:
                        self.sample_paths['schwab'] = os.path.join(root, file)
                    elif 'vanguard' in file_lower:
                        self.sample_paths['vanguard'] = os.path.join(root, file)
                    elif 'fidelity' in file_lower:
                        self.sample_paths['fidelity'] = os.path.join(root, file)
                    elif 'td' in file_lower or 'ameritrade' in file_lower:
                        self.sample_paths['tdameritrade'] = os.path.join(root, file)
                    elif 'etrade' in file_lower or 'e-trade' in file_lower:
                        self.sample_paths['etrade'] = os.path.join(root, file)
    
    def test_document_type_patterns(self):
        """Test that document type patterns are properly defined."""
        # Check that all formats have patterns defined
        self.assertIn('interactive_brokers', DOCUMENT_TYPE_PATTERNS)
        self.assertIn('schwab', DOCUMENT_TYPE_PATTERNS)
        self.assertIn('vanguard', DOCUMENT_TYPE_PATTERNS)
        self.assertIn('fidelity', DOCUMENT_TYPE_PATTERNS)
        self.assertIn('tdameritrade', DOCUMENT_TYPE_PATTERNS)
        self.assertIn('etrade', DOCUMENT_TYPE_PATTERNS)
        
        # Check that each format has at least one pattern
        for format_type, patterns in DOCUMENT_TYPE_PATTERNS.items():
            self.assertGreater(len(patterns), 0, f"No patterns defined for {format_type}")
    
    def test_format_detection(self):
        """Test format detection functionality."""
        # Test detection of Interactive Brokers format
        ibkr_text = "Interactive Brokers LLC\nAccount Statement\nCUSIP: 123456789\nTicker: AAPL"
        self.assertEqual(detect_document_format(ibkr_text), 'interactive_brokers')
        
        # Test detection of Charles Schwab format
        schwab_text = "Charles Schwab\nBrokerage Account Statement\nAccount Summary\nSymbol: MSFT"
        self.assertEqual(detect_document_format(schwab_text), 'schwab')
        
        # Test detection of Vanguard format
        vanguard_text = "The Vanguard Group\nAccount Statement\nFund Name: Vanguard Total Stock Market Index Fund"
        self.assertEqual(detect_document_format(vanguard_text), 'vanguard')
        
        # Test detection of Fidelity format
        fidelity_text = "Fidelity Investments\nBrokerage Statement\nSymbol: AMZN"
        self.assertEqual(detect_document_format(fidelity_text), 'fidelity')
        
        # Test detection of TD Ameritrade format
        td_text = "TD Ameritrade Clearing\nAccount Statement\nPosition Statement\nSymbol: GOOGL"
        self.assertEqual(detect_document_format(td_text), 'tdameritrade')
        
        # Test detection of E*TRADE format
        etrade_text = "E*TRADE Securities\nAccount Statement\nPortfolio\nSymbol: NVDA"
        self.assertEqual(detect_document_format(etrade_text), 'etrade')
        
        # Test with text that doesn't match any format
        unknown_text = "This is not a financial statement"
        self.assertIsNone(detect_document_format(unknown_text))
    
    def _test_extraction_if_sample_available(self, format_name):
        """Helper method to test extraction if a sample file is available."""
        if not self.sample_paths[format_name]:
            self.skipTest(f"No sample {format_name} PDF file found")
            return
        
        # Extract securities from the sample file
        result = self.extractor.extract_from_pdf(self.sample_paths[format_name])
        
        # Basic validation of result
        self.assertEqual(result["document_type"], format_name)
        self.assertIn("securities", result)
        self.assertIsNotNone(result.get("currency"))
        
        # Check securities list
        securities = result["securities"]
        self.assertIsInstance(securities, list)
        
        # If securities were found, validate their structure
        if securities:
            for security in securities:
                # Check that basic fields are present
                self.assertTrue(
                    "ticker" in security or "isin" in security, 
                    "Security must have either ticker or ISIN"
                )
                self.assertIn("description", security)
                
                # Check for numeric values
                self.assertTrue(
                    "nominal" in security or "value" in security,
                    "Security must have either nominal or value"
                )
                
                # If value and nominal are present, check that they are numeric
                if "value" in security:
                    self.assertIsInstance(security["value"], (int, float))
                if "nominal" in security:
                    self.assertIsInstance(security["nominal"], (int, float))
                if "price" in security:
                    self.assertIsInstance(security["price"], (int, float))
    
    def test_interactive_brokers_extraction(self):
        """Test extraction from Interactive Brokers statements."""
        self._test_extraction_if_sample_available('interactive_brokers')
    
    def test_schwab_extraction(self):
        """Test extraction from Charles Schwab statements."""
        self._test_extraction_if_sample_available('schwab')
    
    def test_vanguard_extraction(self):
        """Test extraction from Vanguard statements."""
        self._test_extraction_if_sample_available('vanguard')
    
    def test_fidelity_extraction(self):
        """Test extraction from Fidelity statements."""
        self._test_extraction_if_sample_available('fidelity')
    
    def test_tdameritrade_extraction(self):
        """Test extraction from TD Ameritrade statements."""
        self._test_extraction_if_sample_available('tdameritrade')
    
    def test_etrade_extraction(self):
        """Test extraction from E*TRADE statements."""
        self._test_extraction_if_sample_available('etrade')
    
    def test_mock_extraction(self):
        """
        Test extraction using mock data when sample files are not available.
        This ensures basic functionality even without real-world samples.
        """
        from unittest.mock import patch, MagicMock
        import pandas as pd
        
        # Create a mock table with securities data
        mock_table = MagicMock()
        mock_table.page = 1
        
        # Create mock dataframe data
        columns = ["Symbol", "Description", "Quantity", "Price", "Value"]
        data = [
            columns,  # Header row
            ["AAPL", "Apple Inc.", "100", "150.00", "15000.00"],
            ["MSFT", "Microsoft Corporation", "50", "250.00", "12500.00"],
            ["GOOGL", "Alphabet Inc.", "25", "2000.00", "50000.00"]
        ]
        mock_table.df = pd.DataFrame(data)
        
        # Create a collection of mock tables
        mock_tables = [mock_table]
        
        # Mock the camelot.read_pdf function to return our mock tables
        with patch('camelot.read_pdf', return_value=mock_tables):
            # Test extraction for each format
            for format_name in self.sample_paths.keys():
                # Create a fake text that would trigger format detection
                mock_text = f"This is a {format_name} statement"
                
                # Patch the detect_document_format function to return our format
                with patch('enhanced_securities_extractor.detect_document_format', return_value=format_name):
                    # Create a fake file path
                    fake_path = f"/fake/path/{format_name}_statement.pdf"
                    
                    # Extract "securities" from the mock data
                    result = self.extractor.extract_from_pdf(fake_path)
                    
                    # Basic validation
                    self.assertEqual(result["document_type"], format_name)
                    self.assertIn("securities", result)
                    
                    # If extraction was successful, we should have at least some securities
                    if "error" not in result or not result["error"]:
                        securities = result["securities"]
                        self.assertIsInstance(securities, list)
                        
                        # We might have securities if the format-specific function processed the mock data
                        if securities:
                            # Check first security if present
                            security = securities[0]
                            self.assertTrue(
                                "ticker" in security or "isin" in security or "description" in security,
                                f"Expected basic securities info for {format_name}"
                            )

if __name__ == "__main__":
    unittest.main()