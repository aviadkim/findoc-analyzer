#!/usr/bin/env python3
"""
Comprehensive test suite for the enhanced securities extractor.
This script tests the extractor with various document types and validates
the extraction accuracy using ground truth data.
"""

import os
import json
import argparse
import time
from typing import Dict, List, Any, Optional, Tuple
import unittest
from enhanced_securities_extractor import SecurityExtractor
from securities_reference_db import SecuritiesReferenceDB

class TestEnhancedSecuritiesExtractor(unittest.TestCase):
    """Test suite for the enhanced securities extractor."""

    def setUp(self):
        """Set up the test environment."""
        self.extractor = SecurityExtractor(debug=True)
        
        # Path to test data directory
        self.test_data_dir = os.path.join(os.path.dirname(__file__), 'test_data')
        
        # Path to sample PDF file (messos)
        messos_pdf_path = None
        for root, dirs, files in os.walk('.'):
            for file in files:
                if 'messos' in file.lower() and file.lower().endswith('.pdf'):
                    messos_pdf_path = os.path.join(root, file)
                    break
            if messos_pdf_path:
                break
        
        self.messos_pdf_path = messos_pdf_path
        
        # Load expected data (ground truth)
        self.expected_data = self._load_expected_data()

    def _load_expected_data(self) -> Dict[str, Any]:
        """Load expected data from JSON files."""
        expected_data = {}
        expected_data_dir = os.path.join(os.path.dirname(__file__), 'expected_data')
        
        # If the directory doesn't exist, return empty dict
        if not os.path.exists(expected_data_dir):
            return expected_data
        
        # Load all JSON files in the expected_data directory
        for filename in os.listdir(expected_data_dir):
            if filename.endswith('.json'):
                try:
                    with open(os.path.join(expected_data_dir, filename), 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        expected_data[filename[:-5]] = data  # Remove .json extension
                except Exception as e:
                    print(f"Error loading expected data from {filename}: {e}")
        
        return expected_data

    def test_initialization(self):
        """Test the initialization of the SecurityExtractor class."""
        self.assertIsInstance(self.extractor, SecurityExtractor)
        self.assertIsInstance(self.extractor.securities_db, SecuritiesReferenceDB)
        
    def test_isin_validation(self):
        """Test ISIN validation."""
        # Valid ISINs
        self.assertTrue(self.extractor.securities_db.validate_isin("US0378331005"))  # Apple
        self.assertTrue(self.extractor.securities_db.validate_isin("US5949181045"))  # Microsoft
        
        # Invalid ISINs
        self.assertFalse(self.extractor.securities_db.validate_isin("US12345678901"))  # Wrong format
        self.assertFalse(self.extractor.securities_db.validate_isin("US123456789"))   # Too short
        self.assertFalse(self.extractor.securities_db.validate_isin("XX0378331005"))  # Invalid country code
    
    def test_security_name_lookup(self):
        """Test security name lookup in reference database."""
        # Known securities
        self.assertEqual(self.extractor.securities_db.get_name_by_isin("US0378331005"), "Apple Inc.")
        self.assertEqual(self.extractor.securities_db.get_name_by_isin("US5949181045"), "Microsoft Corporation")
        
        # Unknown securities
        self.assertIsNone(self.extractor.securities_db.get_name_by_isin("FR0000127771"))  # Unknown ISIN

    def test_security_type_detection(self):
        """Test security type detection."""
        # Test equity detection
        self.assertEqual(self.extractor.securities_db.detect_security_type("Apple Inc. Common Stock"), "equity")
        self.assertEqual(self.extractor.securities_db.detect_security_type("Microsoft Corp Ordinary Shares"), "equity")
        
        # Test bond detection
        self.assertEqual(self.extractor.securities_db.detect_security_type("US Treasury 2.5% Bond 2026"), "bond")
        self.assertEqual(self.extractor.securities_db.detect_security_type("Apple Inc. 3.85% Senior Notes"), "bond")
        
        # Test ETF detection
        self.assertEqual(self.extractor.securities_db.detect_security_type("SPDR S&P 500 ETF Trust"), "etf")
        self.assertEqual(self.extractor.securities_db.detect_security_type("Vanguard Total Stock Market ETF"), "etf")

    def test_extract_from_messos_pdf(self):
        """Test extraction from a messos PDF."""
        if not self.messos_pdf_path:
            self.skipTest("Messos PDF file not found")
            return
            
        # Extract information from the PDF
        start_time = time.time()
        result = self.extractor.extract_from_pdf(self.messos_pdf_path)
        extraction_time = time.time() - start_time
        
        print(f"Extraction from messos PDF took {extraction_time:.2f} seconds")
        
        # Validate the result structure
        self.assertEqual(result["document_type"], "messos")
        self.assertIn("securities", result)
        self.assertIn("portfolio_summary", result)
        self.assertIn("asset_allocation", result)
        
        # Validate securities
        securities = result["securities"]
        self.assertIsInstance(securities, list)
        self.assertGreater(len(securities), 0)
        
        # Check that basic fields are present in all securities
        for security in securities:
            self.assertIn("isin", security)
            self.assertIsNotNone(security.get("description"))
            self.assertIsNotNone(security.get("currency"))
    
    def test_security_values(self):
        """Test that security values are reasonable."""
        if not self.messos_pdf_path:
            self.skipTest("Messos PDF file not found")
            return
            
        # Extract information from the PDF
        result = self.extractor.extract_from_pdf(self.messos_pdf_path)
        
        # Check security values
        securities = result["securities"]
        for security in securities:
            # Check that numeric values are correctly converted to float
            if "value" in security:
                self.assertIsInstance(security["value"], (int, float))
                self.assertGreaterEqual(security["value"], 0)
            
            if "price" in security:
                self.assertIsInstance(security["price"], (int, float))
                self.assertGreaterEqual(security["price"], 0)
            
            if "nominal" in security:
                self.assertIsInstance(security["nominal"], (int, float))
                self.assertGreaterEqual(security["nominal"], 0)
            
            # If we have both price and nominal, validate the relationship with value
            if all(k in security for k in ["price", "nominal", "value"]):
                calculated_value = security["price"] * security["nominal"]
                # Allow for some rounding error (5% tolerance)
                self.assertAlmostEqual(
                    security["value"],
                    calculated_value,
                    delta=max(0.05 * security["value"], 0.01)
                )

    def test_against_ground_truth(self):
        """Test extraction against ground truth data."""
        # Skip if no expected data is available
        if not self.expected_data:
            self.skipTest("No expected data available")
            return
        
        # Get ground truth data for messos
        if "messos" not in self.expected_data or not self.messos_pdf_path:
            self.skipTest("No ground truth data for messos or no messos PDF")
            return
        
        ground_truth = self.expected_data["messos"]
        
        # Extract information from the PDF
        result = self.extractor.extract_from_pdf(self.messos_pdf_path)
        
        # Validate against ground truth
        if "securities" in ground_truth:
            # Create a dictionary of securities by ISIN for easier lookup
            extracted_securities_by_isin = {s["isin"]: s for s in result["securities"] if "isin" in s}
            
            for expected_security in ground_truth["securities"]:
                if "isin" not in expected_security:
                    continue
                    
                isin = expected_security["isin"]
                self.assertIn(isin, extracted_securities_by_isin, f"Security with ISIN {isin} not found in extracted data")
                
                extracted = extracted_securities_by_isin[isin]
                
                # Check description (name)
                if "description" in expected_security:
                    self.assertIn("description", extracted)
                    # Names might not match exactly due to normalization
                    self.assertTrue(
                        expected_security["description"].lower() in extracted["description"].lower() or
                        extracted["description"].lower() in expected_security["description"].lower(),
                        f"Description mismatch for {isin}: expected '{expected_security['description']}', got '{extracted['description']}'"
                    )
                
                # Check numeric values with tolerance
                for field in ["value", "price", "nominal"]:
                    if field in expected_security and field in extracted:
                        tolerance = max(0.05 * float(expected_security[field]), 0.01)
                        self.assertAlmostEqual(
                            float(extracted[field]),
                            float(expected_security[field]),
                            delta=tolerance,
                            msg=f"{field} mismatch for {isin}"
                        )

    def test_currency_detection(self):
        """Test currency detection."""
        if not self.messos_pdf_path:
            self.skipTest("Messos PDF file not found")
            return
            
        # Extract information from the PDF
        result = self.extractor.extract_from_pdf(self.messos_pdf_path)
        
        # Check that currency is present and correct
        self.assertIn("currency", result)
        
        # All securities should have the same currency as the document
        for security in result["securities"]:
            self.assertIn("currency", security)
            self.assertEqual(security["currency"], result["currency"])

    def test_cross_validation(self):
        """Test cross-validation of security data."""
        if not self.messos_pdf_path:
            self.skipTest("Messos PDF file not found")
            return
            
        # Extract information from the PDF
        result = self.extractor.extract_from_pdf(self.messos_pdf_path)
        
        # Check for portfolio total and weights
        total_portfolio_value = sum(s.get("value", 0) for s in result["securities"])
        self.assertGreater(total_portfolio_value, 0)
        
        # Check weight calculations
        total_weight = 0
        for security in result["securities"]:
            if "value" in security and "weight" in security:
                expected_weight = (security["value"] / total_portfolio_value) * 100
                self.assertAlmostEqual(security["weight"], expected_weight, delta=0.1)
                total_weight += security["weight"]
        
        # Total weight should be close to 100%
        if total_weight > 0:
            self.assertAlmostEqual(total_weight, 100.0, delta=0.1)

    def test_performance(self):
        """Test the performance of the extractor."""
        if not self.messos_pdf_path:
            self.skipTest("Messos PDF file not found")
            return
            
        # Run extraction multiple times and measure performance
        iterations = 3
        times = []
        
        for i in range(iterations):
            start_time = time.time()
            self.extractor.extract_from_pdf(self.messos_pdf_path)
            end_time = time.time()
            times.append(end_time - start_time)
        
        avg_time = sum(times) / len(times)
        
        print(f"Average extraction time over {iterations} iterations: {avg_time:.2f} seconds")
        
        # This is not a strict test, just informative
        self.assertLess(avg_time, 60, "Extraction takes too long")

def main():
    """Run the test suite."""
    parser = argparse.ArgumentParser(description="Test the enhanced securities extractor")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")
    parser.add_argument("--test", "-t", help="Run specific test")
    
    args = parser.parse_args()
    
    # Configure unittest
    if args.verbose:
        unittest.main(argv=["", "-v"])
    elif args.test:
        unittest.main(argv=["", args.test])
    else:
        unittest.main(argv=[""])

if __name__ == "__main__":
    main()