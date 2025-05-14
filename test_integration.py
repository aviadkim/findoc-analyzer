"""
Integration tests for the enhanced securities extractor with real documents.

This module tests the securities extractor against real financial PDF documents,
verifying that it correctly extracts securities information from different document formats.
"""

import os
import json
import unittest
from enhanced_securities_extractor import SecurityExtractor, configure_file_logging

# Set up file logging for integration tests
configure_file_logging('integration_tests.log')

class TestIntegration(unittest.TestCase):
    """Integration tests for the enhanced securities extractor."""
    
    def setUp(self):
        """Set up the test environment."""
        self.extractor = SecurityExtractor(debug=True, log_level="DEBUG")
        
        # Define paths to test PDF files - using a wide range of real documents
        self.test_files = {
            "messos": "/mnt/c/Users/aviad/OneDrive/Desktop/backv2-main/messos.pdf",
            "sample_portfolio": "/mnt/c/Users/aviad/OneDrive/Desktop/backv2-main/sample_portfolio.pdf"
        }
        
        # Add additional test files from test_pdfs directory if they exist
        test_pdfs_dir = "/mnt/c/Users/aviad/OneDrive/Desktop/backv2-main/test_pdfs"
        if os.path.exists(test_pdfs_dir):
            for pdf_type in [
                "portfolio_statement_1.pdf", 
                "portfolio_statement_2.pdf",
                "simple_financial_statement.pdf",
                "investment_statement.pdf"
            ]:
                pdf_path = os.path.join(test_pdfs_dir, pdf_type)
                if os.path.exists(pdf_path):
                    key = pdf_type.replace(".pdf", "")
                    self.test_files[key] = pdf_path
        
        # Create output directory for extraction results
        self.output_dir = "integration_test_results"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Create an expected results structure for validation
        # This contains some minimal expected values for each document type
        self.expected_results = {
            "messos": {
                "document_type": "messos",
                "min_securities": 3  # Expect at least 3 securities
            },
            "sample_portfolio": {
                "min_securities": 1  # Expect at least 1 security
            },
            # Add more expectations for other document types
        }
        
    def test_extraction_from_real_documents(self):
        """Test extraction from real financial PDF documents."""
        for doc_type, pdf_path in self.test_files.items():
            if not os.path.exists(pdf_path):
                print(f"Skipping {doc_type} test - file not found: {pdf_path}")
                continue
                
            print(f"\nTesting extraction from {doc_type} document: {pdf_path}")
            
            # Extract securities from the PDF
            result = self.extractor.extract_from_pdf(pdf_path)
            
            # Save the result for inspection
            output_path = os.path.join(self.output_dir, f"{doc_type}_result.json")
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            # Basic validation - extraction succeeded without errors
            self.assertIsNone(result.get("error"), 
                             f"Error extracting from {doc_type}: {result.get('error')}")
            
            # Check document type if expected
            if "document_type" in self.expected_results.get(doc_type, {}):
                self.assertEqual(
                    self.expected_results[doc_type]["document_type"],
                    result["document_type"],
                    f"Incorrect document type for {doc_type}"
                )
            
            # Check minimum number of securities
            if "min_securities" in self.expected_results.get(doc_type, {}):
                min_securities = self.expected_results[doc_type]["min_securities"]
                self.assertGreaterEqual(
                    len(result["securities"]),
                    min_securities,
                    f"Expected at least {min_securities} securities for {doc_type}, got {len(result['securities'])}"
                )
            
            # Verify each security has required fields
            for i, security in enumerate(result["securities"]):
                # Check ISIN format (if present)
                if security.get("isin"):
                    self.assertRegex(
                        security["isin"],
                        r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$',
                        f"Invalid ISIN format in security {i+1}: {security.get('isin')}"
                    )
                
                # Ensure description is not empty if present
                if "description" in security:
                    self.assertTrue(
                        security["description"] is None or len(security["description"]) > 0,
                        f"Empty description in security {i+1}"
                    )
                
                # Check basic data types for numerical fields
                if "value" in security:
                    self.assertTrue(
                        security["value"] is None or isinstance(security["value"], (int, float)),
                        f"Value in security {i+1} is not numeric: {security['value']}"
                    )
                    
                if "price" in security:
                    self.assertTrue(
                        security["price"] is None or isinstance(security["price"], (int, float)),
                        f"Price in security {i+1} is not numeric: {security['price']}"
                    )
                    
                if "nominal" in security:
                    self.assertTrue(
                        security["nominal"] is None or isinstance(security["nominal"], (int, float)),
                        f"Nominal in security {i+1} is not numeric: {security['nominal']}"
                    )
            
            print(f"Successfully validated {doc_type} extraction ({len(result['securities'])} securities found)")
            
    def test_cross_document_extraction_consistency(self):
        """Test consistency of extraction across multiple documents of the same type."""
        portfolio_pdfs = []
        
        # Find portfolio statement PDFs
        for doc_type, pdf_path in self.test_files.items():
            if "portfolio" in doc_type.lower() and os.path.exists(pdf_path):
                portfolio_pdfs.append((doc_type, pdf_path))
        
        if len(portfolio_pdfs) < 2:
            print("Skipping cross-document consistency test - need at least 2 portfolio PDFs")
            return
            
        print(f"\nTesting extraction consistency across {len(portfolio_pdfs)} portfolio documents")
        
        # Extract from each portfolio PDF
        results = []
        for doc_type, pdf_path in portfolio_pdfs:
            result = self.extractor.extract_from_pdf(pdf_path)
            results.append((doc_type, result))
            
        # Compare structure consistency across results
        for i, (doc_type, result) in enumerate(results):
            # Check for consistent document fields
            self.assertIn("securities", result, f"Missing 'securities' field in {doc_type}")
            self.assertIn("document_type", result, f"Missing 'document_type' field in {doc_type}")
            
            # Check for consistent security fields in at least one security (if present)
            if result["securities"]:
                security = result["securities"][0]
                self.assertIn("isin", security, f"Missing 'isin' field in securities for {doc_type}")
                
        print("Successfully validated cross-document extraction consistency")
            
    def test_performance_on_real_documents(self):
        """Test performance on real documents by extracting from multiple documents."""
        import time
        
        print("\nTesting performance on real documents")
        
        # Track total extraction time
        total_time = 0
        count = 0
        
        for doc_type, pdf_path in self.test_files.items():
            if not os.path.exists(pdf_path):
                continue
                
            # Measure extraction time
            start_time = time.time()
            result = self.extractor.extract_from_pdf(pdf_path)
            end_time = time.time()
            
            # Calculate and record time
            extraction_time = end_time - start_time
            total_time += extraction_time
            count += 1
            
            print(f"Extracted from {doc_type} in {extraction_time:.2f} seconds ({len(result['securities'])} securities)")
            
        if count > 0:
            avg_time = total_time / count
            print(f"Average extraction time: {avg_time:.2f} seconds per document")
            
            # Performance assertion - average extraction should be under 10 seconds per document
            # This threshold might need adjustment based on the environment
            self.assertLess(avg_time, 10.0, "Extraction performance is too slow")
        
    def test_error_handling_with_real_documents(self):
        """Test error handling with real documents by intentionally creating error conditions."""
        import tempfile
        import shutil
        
        # Test with valid document but corrupted after first page
        for doc_type, pdf_path in self.test_files.items():
            if not os.path.exists(pdf_path):
                continue
                
            # Copy first 1000 bytes of the PDF to simulate corruption
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                corrupted_path = temp_file.name
                
                with open(pdf_path, 'rb') as f:
                    # Read first 1000 bytes (valid PDF header but corrupted content)
                    data = f.read(1000)
                    temp_file.write(data)
            
            try:
                print(f"\nTesting error handling with corrupted {doc_type} document")
                
                # Extract from corrupted PDF - should not crash but return error
                result = self.extractor.extract_from_pdf(corrupted_path)
                
                # Should return valid result structure even with error
                self.assertIsInstance(result, dict, "Result should be a dictionary even for corrupted files")
                self.assertIn("securities", result, "Result should have 'securities' field even for corrupted files")
                
                # It's acceptable for extractor to either detect an error or return empty results
                if result.get("error"):
                    print(f"Extractor properly detected error: {result['error']}")
                else:
                    self.assertEqual(len(result["securities"]), 0, 
                                    "Corrupted file should either report error or return empty securities list")
                    print("Extractor handled corrupted file gracefully with empty results")
                
            finally:
                # Clean up
                if os.path.exists(corrupted_path):
                    os.unlink(corrupted_path)

if __name__ == "__main__":
    unittest.main()