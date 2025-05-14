"""
Test error handling in the enhanced securities extractor.

This module tests the robustness of the error handling in the enhanced securities extractor,
by providing various invalid inputs and checking that the extractor handles them gracefully.
"""

import os
import unittest
import pandas as pd
from enhanced_securities_extractor import SecurityExtractor

class TestErrorHandling(unittest.TestCase):
    """Tests for error handling in the enhanced securities extractor."""
    
    def setUp(self):
        """Set up the test environment."""
        self.extractor = SecurityExtractor(debug=True)
        # Create a temporary invalid PDF for testing
        self.invalid_pdf = "invalid_test.pdf"
        with open(self.invalid_pdf, "w") as f:
            f.write("This is not a valid PDF file")
        
    def tearDown(self):
        """Clean up the test environment."""
        # Remove the temporary invalid PDF
        if os.path.exists(self.invalid_pdf):
            os.remove(self.invalid_pdf)
    
    def test_extract_from_pdf_invalid_path(self):
        """Test extract_from_pdf with invalid file path."""
        # Test with None
        result = self.extractor.extract_from_pdf(None)
        self.assertIsNotNone(result.get("error"))
        self.assertEqual(result["document_type"], "unknown")
        self.assertEqual(len(result["securities"]), 0)
        
        # Test with non-string
        result = self.extractor.extract_from_pdf(123)
        self.assertIsNotNone(result.get("error"))
        
        # Test with non-existent file
        result = self.extractor.extract_from_pdf("non_existent_file.pdf")
        self.assertIsNotNone(result.get("error"))
        self.assertTrue("not found" in result["error"])
    
    def test_extract_from_pdf_invalid_file(self):
        """Test extract_from_pdf with invalid PDF file."""
        result = self.extractor.extract_from_pdf(self.invalid_pdf)
        self.assertIsNotNone(result.get("error"))
    
    def test_extract_from_messos_invalid_path(self):
        """Test _extract_from_messos with invalid file path."""
        # Test with None
        result = self.extractor._extract_from_messos(None)
        self.assertIsNotNone(result.get("error"))
        self.assertEqual(result["document_type"], "messos")
        self.assertEqual(len(result["securities"]), 0)
        
        # Test with non-existent file
        result = self.extractor._extract_from_messos("non_existent_file.pdf")
        self.assertIsNotNone(result.get("error"))
    
    def test_extract_from_messos_invalid_file(self):
        """Test _extract_from_messos with invalid PDF file."""
        result = self.extractor._extract_from_messos(self.invalid_pdf)
        self.assertIsNotNone(result.get("error"))
    
    def test_extract_generic_invalid_path(self):
        """Test _extract_generic with invalid file path."""
        # Test with None
        result = self.extractor._extract_generic(None)
        self.assertIsNotNone(result.get("error"))
        self.assertEqual(result["document_type"], "generic")
        self.assertEqual(len(result["securities"]), 0)
        
        # Test with non-existent file
        result = self.extractor._extract_generic("non_existent_file.pdf")
        self.assertIsNotNone(result.get("error"))
    
    def test_extract_generic_invalid_file(self):
        """Test _extract_generic with invalid PDF file."""
        result = self.extractor._extract_generic(self.invalid_pdf)
        self.assertIsNotNone(result.get("error"))
    
    def test_extract_securities_from_generic_table_invalid_df(self):
        """Test _extract_securities_from_generic_table with invalid DataFrame."""
        # Test with None
        result = self.extractor._extract_securities_from_generic_table(None, 1)
        self.assertEqual(len(result), 0)
        
        # Test with invalid DataFrame (not a pandas DataFrame)
        result = self.extractor._extract_securities_from_generic_table("not a dataframe", 1)
        self.assertEqual(len(result), 0)
        
        # Test with empty DataFrame
        result = self.extractor._extract_securities_from_generic_table(pd.DataFrame(), 1)
        self.assertEqual(len(result), 0)
        
        # Test with invalid page number
        result = self.extractor._extract_securities_from_generic_table(pd.DataFrame({"A": [1, 2]}), "not a number")
        self.assertEqual(len(result), 0)
    
    def test_extract_messos_summary_invalid_path(self):
        """Test _extract_messos_summary with invalid file path."""
        # Test with None
        result = self.extractor._extract_messos_summary(None)
        self.assertIsNotNone(result.get("error"))
        self.assertIsNone(result["client_number"])
        self.assertIsNone(result["valuation_date"])
        
        # Test with non-existent file
        result = self.extractor._extract_messos_summary("non_existent_file.pdf")
        self.assertIsNotNone(result.get("error"))
    
    def test_extract_messos_summary_invalid_file(self):
        """Test _extract_messos_summary with invalid PDF file."""
        result = self.extractor._extract_messos_summary(self.invalid_pdf)
        self.assertIsNotNone(result.get("error"))
    
    def test_extract_messos_asset_allocation_invalid_path(self):
        """Test _extract_messos_asset_allocation with invalid file path."""
        # Test with None
        result = self.extractor._extract_messos_asset_allocation(None)
        self.assertIsNotNone(result.get("error"))
        self.assertIsNone(result["liquidity"])
        self.assertIsNone(result["bonds"])
        
        # Test with non-existent file
        result = self.extractor._extract_messos_asset_allocation("non_existent_file.pdf")
        self.assertIsNotNone(result.get("error"))
    
    def test_extract_messos_asset_allocation_invalid_file(self):
        """Test _extract_messos_asset_allocation with invalid PDF file."""
        result = self.extractor._extract_messos_asset_allocation(self.invalid_pdf)
        self.assertIsNotNone(result.get("error"))
    
    def test_extract_messos_securities_invalid_path(self):
        """Test _extract_messos_securities with invalid file path."""
        # Test with None
        result = self.extractor._extract_messos_securities(None)
        self.assertEqual(len(result), 0)
        
        # Test with non-existent file
        result = self.extractor._extract_messos_securities("non_existent_file.pdf")
        self.assertEqual(len(result), 0)
    
    def test_extract_messos_securities_invalid_file(self):
        """Test _extract_messos_securities with invalid PDF file."""
        result = self.extractor._extract_messos_securities(self.invalid_pdf)
        self.assertEqual(len(result), 0)
    
    def test_safe_str(self):
        """Test _safe_str with various inputs."""
        # Test with None
        self.assertIsNone(self.extractor._safe_str(None))
        
        # Test with integer
        self.assertEqual(self.extractor._safe_str(123), "123")
        
        # Test with string
        self.assertEqual(self.extractor._safe_str("test"), "test")
        
        # Test with object that raises exception when converted to string
        class BadObject:
            def __str__(self):
                raise ValueError("Cannot convert to string")
        
        self.assertIsNone(self.extractor._safe_str(BadObject()))
    
    def test_safe_float(self):
        """Test _safe_float with various inputs."""
        # Test with None
        self.assertIsNone(self.extractor._safe_float(None))
        
        # Test with integer
        self.assertEqual(self.extractor._safe_float(123), 123.0)
        
        # Test with float
        self.assertEqual(self.extractor._safe_float(123.45), 123.45)
        
        # Test with numeric string
        self.assertEqual(self.extractor._safe_float("123"), 123.0)
        
        # Test with numeric string with commas
        self.assertEqual(self.extractor._safe_float("1,000"), 1000.0)
        
        # Test with string containing non-numeric characters
        self.assertEqual(self.extractor._safe_float("$1,000"), 1000.0)
        
        # Test with non-numeric string
        self.assertIsNone(self.extractor._safe_float("test"))
    
    def test_safe_int(self):
        """Test _safe_int with various inputs."""
        # Test with None
        self.assertIsNone(self.extractor._safe_int(None))
        
        # Test with integer
        self.assertEqual(self.extractor._safe_int(123), 123)
        
        # Test with float
        self.assertEqual(self.extractor._safe_int(123.45), 123)
        
        # Test with numeric string
        self.assertEqual(self.extractor._safe_int("123"), 123)
        
        # Test with numeric string with commas
        self.assertEqual(self.extractor._safe_int("1,000"), 1000)
        
        # Test with non-numeric string
        self.assertIsNone(self.extractor._safe_int("test"))

if __name__ == "__main__":
    unittest.main()