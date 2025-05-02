"""
Agent orchestration module for coordinating specialized agents.
"""
import os
import logging
import json
import pandas as pd
from typing import Dict, List, Any, Optional

# Import agents
from agents.document_classifier_agent import DocumentClassifierAgent
from agents.portfolio_statement_agent import PortfolioStatementAgent
from agents.bank_statement_agent import BankStatementAgent
from agents.annual_report_agent import AnnualReportAgent
from agents.query_agent import QueryAgent

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    """
    Orchestrate specialized agents for document processing and querying.
    """
    
    def __init__(self, ai_service):
        """
        Initialize the agent orchestrator.
        
        Args:
            ai_service: AI service proxy for API calls
        """
        self.ai_service = ai_service
        
        # Initialize agents
        self.agents = {
            "document_classifier": DocumentClassifierAgent(ai_service),
            "portfolio_statement": PortfolioStatementAgent(ai_service),
            "bank_statement": BankStatementAgent(ai_service),
            "annual_report": AnnualReportAgent(ai_service),
            "query": QueryAgent(ai_service)
        }
        
        # Results folder for exports
        self.results_folder = os.getenv("RESULTS_FOLDER", "./results")
    
    def process_document(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a document with the appropriate agent.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Processed document data
        """
        logger.info(f"Processing document {document_data.get('document_id')} with agent orchestrator")
        
        # Classify document type
        doc_type = self.agents["document_classifier"].classify(document_data)
        logger.info(f"Document classified as: {doc_type}")
        
        # Process with appropriate agent
        if doc_type in self.agents:
            results = self.agents[doc_type].process(document_data)
        else:
            # Use generic processing
            results = self._generic_processing(document_data)
        
        # Add document type to results
        results["document_type"] = doc_type
        
        return results
    
    def query_document(self, document_data: Dict[str, Any], query: str) -> Dict[str, Any]:
        """
        Query a document with natural language.
        
        Args:
            document_data: Document data from the document processor
            query: Natural language query
            
        Returns:
            Query results
        """
        logger.info(f"Querying document {document_data.get('document_id')}: {query}")
        
        # Use query agent
        results = self.agents["query"].query(document_data, query)
        
        return results
    
    def export_document(self, document_data: Dict[str, Any], export_format: str = "csv", 
                        export_options: Dict[str, Any] = None) -> str:
        """
        Export document data to the specified format.
        
        Args:
            document_data: Document data from the document processor
            export_format: Export format (csv, json, etc.)
            export_options: Export options
            
        Returns:
            Path to the exported file
        """
        logger.info(f"Exporting document {document_data.get('document_id')} to {export_format}")
        
        export_options = export_options or {}
        document_id = document_data.get("document_id", "unknown")
        
        # Create export filename
        filename = f"{document_id}_{export_options.get('name', 'export')}.{export_format}"
        export_path = os.path.join(self.results_folder, filename)
        
        # Export based on format
        if export_format == "csv":
            self._export_to_csv(document_data, export_path, export_options)
        elif export_format == "json":
            self._export_to_json(document_data, export_path, export_options)
        else:
            raise ValueError(f"Unsupported export format: {export_format}")
        
        return export_path
    
    def _generic_processing(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generic document processing when no specialized agent is available.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Processed document data
        """
        logger.info(f"Using generic processing for document {document_data.get('document_id')}")
        
        # Extract basic information
        result = {
            "summary": self.ai_service.summarize_document(document_data),
            "entities": self._extract_entities(document_data),
            "tables": document_data.get("tables", []),
            "financial_data": document_data.get("financial_data", {})
        }
        
        return result
    
    def _extract_entities(self, document_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Extract entities from document text.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Extracted entities
        """
        # Use AI service to extract entities
        full_text = document_data.get("full_text", "")
        
        # Default entities if AI service fails
        default_entities = {
            "organizations": [],
            "people": [],
            "dates": [],
            "amounts": [],
            "securities": document_data.get("isins", [])
        }
        
        if not full_text:
            return default_entities
        
        try:
            return self.ai_service.extract_entities(full_text)
        except Exception as e:
            logger.error(f"Error extracting entities: {str(e)}")
            return default_entities
    
    def _export_to_csv(self, document_data: Dict[str, Any], export_path: str, 
                       export_options: Dict[str, Any]) -> None:
        """
        Export document data to CSV.
        
        Args:
            document_data: Document data from the document processor
            export_path: Path to save the CSV file
            export_options: Export options
        """
        # Get data to export
        data_type = export_options.get("data_type", "tables")
        
        if data_type == "tables" and document_data.get("tables"):
            # Export tables
            table_index = export_options.get("table_index", 0)
            if table_index < len(document_data["tables"]):
                table_data = document_data["tables"][table_index].get("data", [])
                df = pd.DataFrame(table_data)
                df.to_csv(export_path, index=False)
            else:
                raise ValueError(f"Table index {table_index} out of range")
        
        elif data_type == "financial_data" and document_data.get("financial_data"):
            # Export financial data
            financial_data = document_data["financial_data"]
            
            # Convert to DataFrame
            if "securities" in financial_data:
                df = pd.DataFrame(financial_data["securities"])
                df.to_csv(export_path, index=False)
            else:
                # Flatten financial data
                flat_data = self._flatten_dict(financial_data)
                df = pd.DataFrame([flat_data])
                df.to_csv(export_path, index=False)
        
        else:
            # Export custom data
            custom_data = export_options.get("custom_data", [])
            df = pd.DataFrame(custom_data)
            df.to_csv(export_path, index=False)
    
    def _export_to_json(self, document_data: Dict[str, Any], export_path: str, 
                        export_options: Dict[str, Any]) -> None:
        """
        Export document data to JSON.
        
        Args:
            document_data: Document data from the document processor
            export_path: Path to save the JSON file
            export_options: Export options
        """
        # Get data to export
        data_type = export_options.get("data_type", "full")
        
        if data_type == "full":
            # Export full document data
            with open(export_path, "w", encoding="utf-8") as f:
                json.dump(document_data, f, indent=2, ensure_ascii=False)
        
        elif data_type == "tables" and document_data.get("tables"):
            # Export tables
            with open(export_path, "w", encoding="utf-8") as f:
                json.dump(document_data["tables"], f, indent=2, ensure_ascii=False)
        
        elif data_type == "financial_data" and document_data.get("financial_data"):
            # Export financial data
            with open(export_path, "w", encoding="utf-8") as f:
                json.dump(document_data["financial_data"], f, indent=2, ensure_ascii=False)
        
        else:
            # Export custom data
            custom_data = export_options.get("custom_data", {})
            with open(export_path, "w", encoding="utf-8") as f:
                json.dump(custom_data, f, indent=2, ensure_ascii=False)
    
    def _flatten_dict(self, d: Dict[str, Any], parent_key: str = '', sep: str = '_') -> Dict[str, Any]:
        """
        Flatten a nested dictionary.
        
        Args:
            d: Dictionary to flatten
            parent_key: Parent key for nested dictionaries
            sep: Separator for keys
            
        Returns:
            Flattened dictionary
        """
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep).items())
            else:
                items.append((new_key, v))
        return dict(items)
