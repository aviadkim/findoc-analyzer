"""
Tests for the integration with FinDoc Analyzer.
"""
import os
import sys
import unittest
import tempfile
import shutil
from flask import Flask
from werkzeug.datastructures import FileStorage

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the integration
from integration.backend_integration import FinDocRAGBackendIntegration
from integration.flask_routes import register_routes

class TestIntegration(unittest.TestCase):
    """Test cases for the integration with FinDoc Analyzer."""
    
    def setUp(self):
        """Set up test environment."""
        # Create temporary directory for test files
        self.test_dir = tempfile.mkdtemp()
        
        # Path to test PDF
        self.test_pdf_path = os.path.join(self.test_dir, "test_document.pdf")
        
        # Create a simple test PDF
        self._create_test_pdf()
        
        # Create Flask app
        self.app = Flask(__name__)
        
        # Register routes
        register_routes(self.app)
        
        # Create test client
        self.client = self.app.test_client()
        
        # Create backend integration
        self.integration = FinDocRAGBackendIntegration({
            "upload_folder": self.test_dir,
            "results_folder": self.test_dir
        })
    
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
            # Create empty file
            with open(self.test_pdf_path, "w") as f:
                f.write("Test PDF")
    
    def test_health_check(self):
        """Test health check endpoint."""
        # Call health check endpoint
        response = self.client.get("/api/rag/health")
        
        # Check response
        self.assertEqual(response.status_code, 200)
        self.assertIn("status", response.json)
        self.assertEqual(response.json["status"], "ok")
    
    def test_backend_integration(self):
        """Test backend integration."""
        # Process document
        document_id = self.integration.process_document(self.test_pdf_path)
        
        # Check if document ID was returned
        self.assertIsNotNone(document_id)
        
        # Check document status
        status = self.integration.get_document_status(document_id)
        self.assertEqual(status, "processing")
        
        # Wait for processing to complete (in a real test, we would use a mock)
        # For now, we'll just set the status manually
        self.integration.processing_status[document_id] = "completed"
        
        # Create dummy document data
        self.integration.processed_documents[document_id] = {
            "full_text": "Test document",
            "financial_data": {
                "securities": [
                    {
                        "name": "Apple Inc.",
                        "identifier": "US0378331005",
                        "quantity": "100",
                        "value": "15000"
                    }
                ],
                "total_value": 15000,
                "currency": "USD",
                "asset_allocation": {
                    "Equities": 100
                }
            },
            "portfolio_analysis": {
                "diversification_score": 0,
                "risk_profile": "Aggressive",
                "recommendations": ["Diversify your portfolio"]
            },
            "security_evaluations": [
                {
                    "name": "Apple Inc.",
                    "identifier": "US0378331005",
                    "security_type": "Stock",
                    "asset_class": "Equities",
                    "risk_level": "High",
                    "recommendations": []
                }
            ]
        }
        
        # Check document summary
        summary = self.integration.get_document_summary(document_id)
        self.assertIn("document_id", summary)
        self.assertIn("total_value", summary)
        self.assertIn("currency", summary)
        self.assertIn("security_count", summary)
        self.assertIn("asset_allocation", summary)
        self.assertIn("diversification_score", summary)
        self.assertIn("risk_profile", summary)
        self.assertIn("recommendations", summary)
        
        # Check document securities
        securities = self.integration.get_document_securities(document_id)
        self.assertEqual(len(securities), 1)
        self.assertIn("name", securities[0])
        self.assertIn("identifier", securities[0])
        self.assertIn("quantity", securities[0])
        self.assertIn("value", securities[0])
        self.assertIn("asset_class", securities[0])
        self.assertIn("security_type", securities[0])
        self.assertIn("risk_level", securities[0])
        self.assertIn("recommendations", securities[0])
        
        # Query document
        query_result = self.integration.query_document(document_id, "What is the total value?")
        self.assertIn("query", query_result)
        self.assertIn("answer", query_result)
    
    def test_flask_routes(self):
        """Test Flask routes."""
        # Test health check endpoint
        response = self.client.get("/api/rag/health")
        self.assertEqual(response.status_code, 200)
        
        # Test document upload endpoint
        with open(self.test_pdf_path, "rb") as f:
            response = self.client.post(
                "/api/rag/document/upload",
                data={"file": (f, "test_document.pdf")}
            )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("document_id", response.json)
        
        # Get document ID
        document_id = response.json["document_id"]
        
        # Test document status endpoint
        response = self.client.get(f"/api/rag/document/status/{document_id}")
        self.assertEqual(response.status_code, 200)
        self.assertIn("status", response.json)
        
        # Note: We can't test the other endpoints without waiting for processing to complete
        # In a real test, we would use a mock or a test-specific implementation

if __name__ == "__main__":
    unittest.main()
