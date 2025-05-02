"""
Tests for the API endpoints.
"""

import os
import sys
import json
import unittest
from unittest.mock import patch, MagicMock
import tempfile
from pathlib import Path
import io

# Add the parent directory to the path so we can import the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import app

class TestAPI(unittest.TestCase):
    """Tests for the API endpoints."""
    
    def setUp(self):
        """Set up the test environment."""
        # Create a test client
        app.app.testing = True
        self.client = app.app.test_client()
        
        # Create a temporary directory for uploads
        self.temp_dir = tempfile.TemporaryDirectory()
        app.app.config["UPLOAD_FOLDER"] = self.temp_dir.name
        
        # Create a test PDF file
        self.test_pdf_path = os.path.join(self.temp_dir.name, "test.pdf")
        with open(self.test_pdf_path, "wb") as f:
            f.write(b"Test PDF content")
    
    def tearDown(self):
        """Clean up the test environment."""
        self.temp_dir.cleanup()
    
    def test_health_endpoint(self):
        """Test the health endpoint."""
        response = self.client.get("/api/health")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["status"], "healthy")
    
    def test_documents_endpoint(self):
        """Test the documents endpoint."""
        response = self.client.get("/api/documents")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("documents", response.json)
    
    def test_financial_isins_endpoint(self):
        """Test the financial/isins endpoint."""
        response = self.client.get("/api/financial/isins")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("isins", response.json)
    
    def test_financial_portfolio_endpoint(self):
        """Test the financial/portfolio endpoint."""
        response = self.client.get("/api/financial/portfolio")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("portfolio", response.json)
    
    def test_agents_endpoint(self):
        """Test the agents endpoint."""
        response = self.client.get("/api/agents")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("agents", response.json)
    
    def test_rag_status_endpoint(self):
        """Test the rag/status endpoint."""
        response = self.client.get("/api/rag/status")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["status"], "active")
    
    def test_rag_process_endpoint(self):
        """Test the rag/process endpoint."""
        # Create a test file
        data = {
            "languages": "eng,heb"
        }
        
        with open(self.test_pdf_path, "rb") as f:
            file_data = f.read()
        
        response = self.client.post(
            "/api/rag/process",
            data={"file": (io.BytesIO(file_data), "test.pdf"), **data},
            content_type="multipart/form-data"
        )
        
        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.json["status"], "processing")
        self.assertIn("task_id", response.json)
    
    def test_rag_process_endpoint_no_file(self):
        """Test the rag/process endpoint with no file."""
        response = self.client.post("/api/rag/process")
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
    
    def test_rag_process_endpoint_empty_filename(self):
        """Test the rag/process endpoint with an empty filename."""
        response = self.client.post(
            "/api/rag/process",
            data={"file": (io.BytesIO(b""), "")},
            content_type="multipart/form-data"
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
    
    def test_rag_process_endpoint_unsupported_file_type(self):
        """Test the rag/process endpoint with an unsupported file type."""
        response = self.client.post(
            "/api/rag/process",
            data={"file": (io.BytesIO(b"Test content"), "test.xyz")},
            content_type="multipart/form-data"
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json)
    
    def test_rag_task_status_endpoint(self):
        """Test the rag/task/:task_id endpoint."""
        response = self.client.get("/api/rag/task/test-task-id")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["task_id"], "test-task-id")
    
    def test_rag_task_result_endpoint(self):
        """Test the rag/result/:task_id endpoint."""
        response = self.client.get("/api/rag/result/test-task-id")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["task_id"], "test-task-id")
    
    def test_rag_visualizations_endpoint(self):
        """Test the rag/visualizations/:task_id endpoint."""
        response = self.client.get("/api/rag/visualizations/test-task-id")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["task_id"], "test-task-id")
        self.assertIn("files", response.json)

if __name__ == "__main__":
    unittest.main()
