"""
Tests for the RAG processor.
"""

import os
import sys
import json
import unittest
from unittest.mock import patch, MagicMock
import tempfile
from pathlib import Path

# Add the parent directory to the path so we can import the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rag_processor import RagProcessor

class TestRagProcessor(unittest.TestCase):
    """Tests for the RAG processor."""
    
    def setUp(self):
        """Set up the test environment."""
        # Create a temporary directory for uploads
        self.temp_dir = tempfile.TemporaryDirectory()
        self.upload_dir = self.temp_dir.name
        
        # Create a RAG processor
        self.rag_processor = RagProcessor(upload_dir=self.upload_dir)
        
        # Create a test PDF file
        self.test_pdf_path = os.path.join(self.upload_dir, "test.pdf")
        with open(self.test_pdf_path, "w") as f:
            f.write("Test PDF content")
        
        # Create a test DOCX file
        self.test_docx_path = os.path.join(self.upload_dir, "test.docx")
        with open(self.test_docx_path, "w") as f:
            f.write("Test DOCX content")
        
        # Create a test CSV file
        self.test_csv_path = os.path.join(self.upload_dir, "test.csv")
        with open(self.test_csv_path, "w") as f:
            f.write("Test CSV content")
        
        # Create a test TXT file
        self.test_txt_path = os.path.join(self.upload_dir, "test.txt")
        with open(self.test_txt_path, "w") as f:
            f.write("Test TXT content")
    
    def tearDown(self):
        """Clean up the test environment."""
        self.temp_dir.cleanup()
    
    def test_get_status(self):
        """Test the get_status method."""
        status = self.rag_processor.get_status()
        
        self.assertEqual(status["status"], "active")
        self.assertEqual(status["version"], "1.0.0")
        self.assertFalse(status["api_key_configured"])
        self.assertIsInstance(status["supported_document_types"], list)
        self.assertIsInstance(status["supported_languages"], list)
    
    def test_process_document_pdf(self):
        """Test the process_document method with a PDF file."""
        result = self.rag_processor.process_document(self.test_pdf_path)
        
        self.assertIn("task_id", result)
        self.assertIn("document_info", result)
        self.assertIn("financial_data", result)
        self.assertIn("rag_validation", result)
    
    def test_process_document_docx(self):
        """Test the process_document method with a DOCX file."""
        result = self.rag_processor.process_document(self.test_docx_path)
        
        self.assertIn("task_id", result)
        self.assertIn("document_info", result)
        self.assertIn("financial_data", result)
        self.assertIn("rag_validation", result)
    
    def test_process_document_csv(self):
        """Test the process_document method with a CSV file."""
        result = self.rag_processor.process_document(self.test_csv_path)
        
        self.assertIn("task_id", result)
        self.assertIn("document_info", result)
        self.assertIn("financial_data", result)
        self.assertIn("rag_validation", result)
    
    def test_process_document_txt(self):
        """Test the process_document method with a TXT file."""
        result = self.rag_processor.process_document(self.test_txt_path)
        
        self.assertIn("task_id", result)
        self.assertIn("document_info", result)
        self.assertIn("financial_data", result)
        self.assertIn("rag_validation", result)
    
    def test_process_document_with_languages(self):
        """Test the process_document method with languages."""
        result = self.rag_processor.process_document(self.test_pdf_path, languages=["eng", "heb"])
        
        self.assertIn("task_id", result)
        self.assertIn("document_info", result)
        self.assertIn("financial_data", result)
        self.assertIn("rag_validation", result)
    
    def test_process_document_with_options(self):
        """Test the process_document method with options."""
        result = self.rag_processor.process_document(
            self.test_pdf_path,
            languages=["eng"],
            options={"extract_tables": True, "extract_text": True}
        )
        
        self.assertIn("task_id", result)
        self.assertIn("document_info", result)
        self.assertIn("financial_data", result)
        self.assertIn("rag_validation", result)
    
    def test_process_document_file_not_found(self):
        """Test the process_document method with a non-existent file."""
        with self.assertRaises(FileNotFoundError):
            self.rag_processor.process_document("non_existent_file.pdf")
    
    def test_process_document_unsupported_type(self):
        """Test the process_document method with an unsupported file type."""
        # Create a test file with an unsupported extension
        test_unsupported_path = os.path.join(self.upload_dir, "test.xyz")
        with open(test_unsupported_path, "w") as f:
            f.write("Test unsupported content")
        
        with self.assertRaises(ValueError):
            self.rag_processor.process_document(test_unsupported_path)
    
    def test_process_document_unsupported_language(self):
        """Test the process_document method with an unsupported language."""
        with self.assertRaises(ValueError):
            self.rag_processor.process_document(self.test_pdf_path, languages=["xyz"])
    
    def test_get_task_status(self):
        """Test the get_task_status method."""
        # Process a document to get a task ID
        result = self.rag_processor.process_document(self.test_pdf_path)
        task_id = result["task_id"]
        
        # Get the task status
        status = self.rag_processor.get_task_status(task_id)
        
        self.assertEqual(status["task_id"], task_id)
        self.assertIn(status["status"], ["processing", "completed"])
    
    def test_get_task_status_not_found(self):
        """Test the get_task_status method with a non-existent task ID."""
        status = self.rag_processor.get_task_status("non_existent_task_id")
        
        self.assertEqual(status["status"], "not_found")
    
    def test_get_task_result(self):
        """Test the get_task_result method."""
        # Process a document to get a task ID
        result = self.rag_processor.process_document(self.test_pdf_path)
        task_id = result["task_id"]
        
        # Get the task result
        result = self.rag_processor.get_task_result(task_id)
        
        self.assertEqual(result["task_id"], task_id)
        self.assertIn("document_info", result)
        self.assertIn("financial_data", result)
        self.assertIn("rag_validation", result)
    
    def test_get_visualizations(self):
        """Test the get_visualizations method."""
        # Process a document to get a task ID
        result = self.rag_processor.process_document(self.test_pdf_path)
        task_id = result["task_id"]
        
        # Get the visualizations
        visualizations = self.rag_processor.get_visualizations(task_id)
        
        self.assertEqual(visualizations["task_id"], task_id)
        self.assertIn("files", visualizations)
        self.assertIsInstance(visualizations["files"], list)

if __name__ == "__main__":
    unittest.main()
