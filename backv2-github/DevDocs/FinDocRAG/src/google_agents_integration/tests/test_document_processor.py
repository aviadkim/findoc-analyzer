"""
Tests for the Document Processor Agent.
"""
import os
import sys
import unittest
import tempfile
import shutil
from pathlib import Path

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the agent
from agents.document_processor_agent import extract_pdf_content, extract_isins, extract_financial_data

class TestDocumentProcessorAgent(unittest.TestCase):
    """Test cases for the Document Processor Agent."""
    
    def setUp(self):
        """Set up test environment."""
        # Create temporary directory for test files
        self.test_dir = tempfile.mkdtemp()
        
        # Path to test PDF
        self.test_pdf_path = os.path.join(self.test_dir, "test_document.pdf")
        
        # Create a simple test PDF if it doesn't exist
        if not os.path.exists(self.test_pdf_path):
            try:
                # Try to copy a sample PDF from the test data directory
                sample_pdf_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "sample.pdf")
                if os.path.exists(sample_pdf_path):
                    shutil.copy(sample_pdf_path, self.test_pdf_path)
                else:
                    # Create a simple PDF using reportlab if no sample is available
                    self._create_test_pdf()
            except Exception as e:
                print(f"Warning: Could not create test PDF: {str(e)}")
    
    def tearDown(self):
        """Clean up test environment."""
        # Remove temporary directory
        shutil.rmtree(self.test_dir)
    
    def _create_test_pdf(self):
        """Create a simple test PDF with financial data."""
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            
            c = canvas.Canvas(self.test_pdf_path, pagesize=letter)
            c.drawString(100, 750, "Test Financial Document")
            c.drawString(100, 700, "ISIN: US0378331005")
            c.drawString(100, 650, "Apple Inc.")
            c.drawString(100, 600, "Quantity: 100")
            c.drawString(100, 550, "Price: 150.00 USD")
            c.drawString(100, 500, "Value: 15000.00 USD")
            c.drawString(100, 450, "ISIN: US5949181045")
            c.drawString(100, 400, "Microsoft Corporation")
            c.drawString(100, 350, "Quantity: 50")
            c.drawString(100, 300, "Price: 300.00 USD")
            c.drawString(100, 250, "Value: 15000.00 USD")
            c.drawString(100, 200, "Total Portfolio Value: 30000.00 USD")
            c.save()
        except ImportError:
            print("Warning: reportlab not installed, cannot create test PDF")
    
    def test_extract_pdf_content(self):
        """Test extracting content from a PDF."""
        # Skip test if PDF doesn't exist
        if not os.path.exists(self.test_pdf_path):
            self.skipTest("Test PDF not available")
        
        # Extract content
        content = extract_pdf_content(self.test_pdf_path)
        
        # Check if content was extracted
        self.assertIsNotNone(content)
        self.assertIn("metadata", content)
        self.assertIn("pages", content)
        self.assertIn("full_text", content)
        
        # Check if text was extracted
        self.assertGreater(len(content["full_text"]), 0)
    
    def test_extract_isins(self):
        """Test extracting ISINs from text."""
        # Test text with ISINs
        text = """
        This document contains several ISINs:
        US0378331005 (Apple Inc.)
        US5949181045 (Microsoft Corporation)
        DE0007100000 (Mercedes-Benz Group AG)
        FR0000131104 (BNP Paribas)
        GB0002634946 (BAE Systems)
        """
        
        # Extract ISINs
        isins = extract_isins(text)
        
        # Check if ISINs were extracted
        self.assertEqual(len(isins), 5)
        self.assertIn("US0378331005", isins)
        self.assertIn("US5949181045", isins)
        self.assertIn("DE0007100000", isins)
        self.assertIn("FR0000131104", isins)
        self.assertIn("GB0002634946", isins)
    
    def test_extract_financial_data(self):
        """Test extracting financial data from document data."""
        # Create document data
        document_data = {
            "full_text": """
            Portfolio Statement
            
            Apple Inc. (US0378331005)
            Quantity: 100
            Price: 150.00 USD
            Value: 15000.00 USD
            
            Microsoft Corporation (US5949181045)
            Quantity: 50
            Price: 300.00 USD
            Value: 15000.00 USD
            
            Total Portfolio Value: 30000.00 USD
            
            Asset Allocation:
            Equities: 100%
            """,
            "tables": []
        }
        
        # Extract financial data
        financial_data = extract_financial_data(document_data)
        
        # Check if financial data was extracted
        self.assertIn("securities", financial_data)
        self.assertIn("total_value", financial_data)
        self.assertIn("currency", financial_data)
        self.assertIn("asset_allocation", financial_data)
        self.assertIn("isins", financial_data)
        
        # Check securities
        self.assertGreaterEqual(len(financial_data["securities"]), 2)
        
        # Check ISINs
        self.assertGreaterEqual(len(financial_data["isins"]), 2)
        self.assertIn("US0378331005", financial_data["isins"])
        self.assertIn("US5949181045", financial_data["isins"])
        
        # Check total value
        self.assertGreaterEqual(financial_data["total_value"], 30000)
        
        # Check currency
        self.assertEqual(financial_data["currency"], "USD")

if __name__ == "__main__":
    unittest.main()
