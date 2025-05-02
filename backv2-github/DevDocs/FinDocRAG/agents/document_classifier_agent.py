"""
Document classifier agent for identifying document types.
"""
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class DocumentClassifierAgent:
    """
    Classify documents by type.
    """
    
    def __init__(self, ai_service):
        """
        Initialize the document classifier agent.
        
        Args:
            ai_service: AI service proxy for API calls
        """
        self.ai_service = ai_service
    
    def classify(self, document_data: Dict[str, Any]) -> str:
        """
        Classify a document by type.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Document type
        """
        logger.info(f"Classifying document {document_data.get('document_id')}")
        
        # Extract text for classification
        text_sample = self._get_text_sample(document_data)
        
        # Check for common document types based on keywords
        doc_type = self._classify_by_keywords(text_sample, document_data)
        
        if doc_type != "unknown":
            return doc_type
        
        # Use AI service for classification
        return self._classify_with_ai(text_sample, document_data)
    
    def _get_text_sample(self, document_data: Dict[str, Any]) -> str:
        """
        Get a text sample from the document for classification.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Text sample
        """
        # Try to get the first few pages of text
        text_sample = ""
        
        if document_data.get("file_type") == "pdf" and document_data.get("pages"):
            # Get text from first 3 pages
            for page in document_data["pages"][:3]:
                text_sample += page.get("text", "") + "\n\n"
        
        # If no text from pages, use full text
        if not text_sample and document_data.get("full_text"):
            # Limit to first 5000 characters
            text_sample = document_data["full_text"][:5000]
        
        # If still no text, try to get text from tables
        if not text_sample and document_data.get("tables"):
            for table in document_data["tables"][:3]:
                if "data" in table:
                    for row in table["data"]:
                        text_sample += " ".join(str(cell) for cell in row.values()) + "\n"
        
        return text_sample
    
    def _classify_by_keywords(self, text_sample: str, document_data: Dict[str, Any]) -> str:
        """
        Classify document by keywords.
        
        Args:
            text_sample: Text sample from the document
            document_data: Document data from the document processor
            
        Returns:
            Document type
        """
        text_lower = text_sample.lower()
        
        # Check for portfolio statement
        portfolio_keywords = [
            "portfolio statement", "portfolio summary", "investment summary",
            "asset allocation", "holdings summary", "securities account",
            "portfolio valuation", "investment portfolio"
        ]
        
        for keyword in portfolio_keywords:
            if keyword in text_lower:
                return "portfolio_statement"
        
        # Check for bank statement
        bank_keywords = [
            "bank statement", "account statement", "transaction history",
            "balance summary", "opening balance", "closing balance",
            "account activity", "statement of account"
        ]
        
        for keyword in bank_keywords:
            if keyword in text_lower:
                return "bank_statement"
        
        # Check for annual report
        annual_report_keywords = [
            "annual report", "financial report", "annual financial statement",
            "income statement", "balance sheet", "cash flow statement",
            "statement of changes in equity", "notes to the financial statements"
        ]
        
        for keyword in annual_report_keywords:
            if keyword in text_lower:
                return "annual_report"
        
        # Check for ISINs
        if document_data.get("isins") and len(document_data["isins"]) > 5:
            return "portfolio_statement"
        
        return "unknown"
    
    def _classify_with_ai(self, text_sample: str, document_data: Dict[str, Any]) -> str:
        """
        Classify document with AI.
        
        Args:
            text_sample: Text sample from the document
            document_data: Document data from the document processor
            
        Returns:
            Document type
        """
        # Create prompt
        prompt = f"""
        Classify the following financial document into one of these categories:
        - portfolio_statement: Investment portfolio statements, holdings reports, asset allocation reports
        - bank_statement: Bank account statements, transaction histories
        - annual_report: Annual financial reports, quarterly reports, financial statements
        
        Document text sample:
        {text_sample}
        
        Additional information:
        - File type: {document_data.get('file_type', 'unknown')}
        - Number of ISINs found: {len(document_data.get('isins', []))}
        - Number of tables: {len(document_data.get('tables', []))}
        
        Return ONLY the category name, nothing else.
        """
        
        # Call AI service
        try:
            response = self.ai_service.call_text_api(prompt)
            
            # Extract category
            response = response.strip().lower()
            
            if "portfolio" in response:
                return "portfolio_statement"
            elif "bank" in response:
                return "bank_statement"
            elif "annual" in response:
                return "annual_report"
            else:
                return "unknown"
        except Exception as e:
            logger.error(f"Error classifying document with AI: {str(e)}")
            return "unknown"
