"""
Backend integration for Google Agent Technologies with FinDoc Analyzer.

This module provides integration between the Google Agent Technologies
and the existing FinDoc Analyzer backend.
"""
import os
import logging
import json
from typing import Dict, List, Any, Optional
import threading

# Import coordinator agent
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents'))
from coordinator_agent import handle_request

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FinDocRAGBackendIntegration:
    """
    Backend integration for FinDocRAG with Google Agent Technologies.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the backend integration.
        
        Args:
            config: Configuration options
        """
        self.config = config or {}
        self.upload_folder = self.config.get("upload_folder", "./uploads")
        self.results_folder = self.config.get("results_folder", "./results")
        
        # Ensure directories exist
        os.makedirs(self.upload_folder, exist_ok=True)
        os.makedirs(self.results_folder, exist_ok=True)
        
        # In-memory storage for processed documents
        self.processed_documents = {}
        self.processing_status = {}
    
    def process_document(self, file_path: str, document_id: Optional[str] = None) -> str:
        """
        Process a document using Google Agent Technologies.
        
        Args:
            file_path: Path to the document file
            document_id: Optional document ID
            
        Returns:
            Document ID
        """
        # Generate document ID if not provided
        if not document_id:
            document_id = os.path.splitext(os.path.basename(file_path))[0]
        
        # Update processing status
        self.processing_status[document_id] = "processing"
        
        # Process document in background
        def process_document_thread():
            try:
                # Create request for coordinator agent
                request_data = {
                    "type": "process_document",
                    "document_path": file_path
                }
                
                # Process document
                response = handle_request(request_data)
                
                # Store processed document
                self.processed_documents[document_id] = response["document_data"]
                
                # Update processing status
                self.processing_status[document_id] = "completed"
                
                logger.info(f"Document {document_id} processed successfully")
            except Exception as e:
                logger.error(f"Error processing document {document_id}: {str(e)}")
                self.processing_status[document_id] = "failed"
        
        # Start processing thread
        threading.Thread(target=process_document_thread).start()
        
        return document_id
    
    def get_document_status(self, document_id: str) -> str:
        """
        Get document processing status.
        
        Args:
            document_id: Document ID
            
        Returns:
            Processing status
        """
        return self.processing_status.get(document_id, "not_found")
    
    def query_document(self, document_id: str, query: str) -> Dict[str, Any]:
        """
        Query a document using Google Agent Technologies.
        
        Args:
            document_id: Document ID
            query: Query text
            
        Returns:
            Query results
        """
        # Check if document is processed
        if document_id not in self.processed_documents:
            raise ValueError(f"Document {document_id} not found or still processing")
        
        # Create request for coordinator agent
        request_data = {
            "type": "query",
            "query": query,
            "document_data": self.processed_documents[document_id]
        }
        
        # Process query
        response = handle_request(request_data)
        
        return {
            "query": query,
            "answer": response["answer"]
        }
    
    def get_document_summary(self, document_id: str) -> Dict[str, Any]:
        """
        Get document summary.
        
        Args:
            document_id: Document ID
            
        Returns:
            Document summary
        """
        # Check if document is processed
        if document_id not in self.processed_documents:
            raise ValueError(f"Document {document_id} not found or still processing")
        
        # Get document data
        document_data = self.processed_documents[document_id]
        
        # Extract summary information
        financial_data = document_data.get("financial_data", {})
        portfolio_analysis = document_data.get("portfolio_analysis", {})
        
        summary = {
            "document_id": document_id,
            "total_value": financial_data.get("total_value", 0),
            "currency": financial_data.get("currency", "USD"),
            "security_count": len(financial_data.get("securities", [])),
            "asset_allocation": financial_data.get("asset_allocation", {}),
            "diversification_score": portfolio_analysis.get("diversification_score", 0),
            "risk_profile": portfolio_analysis.get("risk_profile", "Unknown"),
            "recommendations": portfolio_analysis.get("recommendations", [])
        }
        
        return summary
    
    def get_document_securities(self, document_id: str) -> List[Dict[str, Any]]:
        """
        Get document securities.
        
        Args:
            document_id: Document ID
            
        Returns:
            List of securities
        """
        # Check if document is processed
        if document_id not in self.processed_documents:
            raise ValueError(f"Document {document_id} not found or still processing")
        
        # Get document data
        document_data = self.processed_documents[document_id]
        
        # Extract securities information
        financial_data = document_data.get("financial_data", {})
        securities = financial_data.get("securities", [])
        security_evaluations = document_data.get("security_evaluations", [])
        
        # Combine securities with evaluations
        enhanced_securities = []
        
        for security in securities:
            # Find matching evaluation
            evaluation = None
            for eval in security_evaluations:
                if eval.get("identifier") == security.get("identifier"):
                    evaluation = eval
                    break
            
            # Combine data
            enhanced_security = {
                "name": security.get("name", ""),
                "identifier": security.get("identifier", ""),
                "quantity": security.get("quantity"),
                "value": security.get("value"),
                "asset_class": evaluation.get("asset_class", "Unknown") if evaluation else "Unknown",
                "security_type": evaluation.get("security_type", "Unknown") if evaluation else "Unknown",
                "risk_level": evaluation.get("risk_level", "Unknown") if evaluation else "Unknown",
                "recommendations": evaluation.get("recommendations", []) if evaluation else []
            }
            
            enhanced_securities.append(enhanced_security)
        
        return enhanced_securities
    
    def export_document_to_csv(self, document_id: str) -> str:
        """
        Export document data to CSV.
        
        Args:
            document_id: Document ID
            
        Returns:
            Path to the CSV file
        """
        # Check if document is processed
        if document_id not in self.processed_documents:
            raise ValueError(f"Document {document_id} not found or still processing")
        
        # Get document data
        document_data = self.processed_documents[document_id]
        
        # Extract securities information
        financial_data = document_data.get("financial_data", {})
        securities = financial_data.get("securities", [])
        
        # Create CSV file
        import pandas as pd
        
        # Convert securities to DataFrame
        df = pd.DataFrame(securities)
        
        # Save to CSV
        csv_path = os.path.join(self.results_folder, f"{document_id}_securities.csv")
        df.to_csv(csv_path, index=False)
        
        return csv_path
