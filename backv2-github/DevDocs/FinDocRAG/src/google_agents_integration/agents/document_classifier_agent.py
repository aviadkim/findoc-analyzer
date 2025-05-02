"""
Document Classifier Agent using Google's Agent Development Kit (ADK).

This agent is responsible for classifying financial documents and determining the appropriate
processing strategy based on the document type.
"""
import os
import logging
import re
from typing import Dict, List, Any, Optional
import fitz  # PyMuPDF

from google.adk.agents import Agent
from google.adk.tools import Tool

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define document types and their patterns
DOCUMENT_TYPES = {
    'messos': [
        'messos', 'portfolio summary', 'asset allocation', 'securities',
        'portfolio statement', 'investment summary'
    ],
    'account_statement': [
        'account statement', 'transaction history', 'balance', 'account summary',
        'account activity', 'statement of account'
    ],
    'fund_fact_sheet': [
        'fund fact sheet', 'performance', 'expense ratio', 'fund objective',
        'investment objective', 'fund overview', 'fund profile'
    ],
    'financial_report': [
        'annual report', 'quarterly report', 'income statement', 'balance sheet',
        'cash flow statement', 'financial statement', 'earnings report'
    ],
    'prospectus': [
        'prospectus', 'offering document', 'investment objectives', 'risk factors',
        'fund expenses', 'investment strategy'
    ],
    'research_report': [
        'research report', 'analyst report', 'investment research', 'market analysis',
        'company analysis', 'sector analysis', 'industry analysis'
    ]
}

# Define tool functions
def classify_document(document_path: str) -> Dict[str, Any]:
    """
    Classify a financial document based on its content.
    
    Args:
        document_path: Path to the document
        
    Returns:
        Dictionary containing document classification
    """
    logger.info(f"Classifying document: {document_path}")
    
    try:
        # Extract text from document
        doc = fitz.open(document_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        
        # Convert to lowercase for case-insensitive matching
        text_lower = text.lower()
        
        # Check for each document type pattern
        type_scores = {}
        for doc_type, patterns in DOCUMENT_TYPES.items():
            # Count pattern matches
            matches = sum(1 for pattern in patterns if pattern in text_lower)
            # Calculate score as percentage of patterns matched
            score = matches / len(patterns) * 100
            type_scores[doc_type] = score
        
        # Determine the most likely document type
        best_type = max(type_scores, key=type_scores.get)
        best_score = type_scores[best_type]
        
        # Check if score is high enough to be confident
        if best_score >= 30:  # At least 30% of patterns matched
            confidence = "high" if best_score >= 60 else "medium"
        else:
            best_type = "unknown"
            confidence = "low"
        
        # Extract document metadata
        metadata = {
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
            "subject": doc.metadata.get("subject", ""),
            "keywords": doc.metadata.get("keywords", ""),
            "creator": doc.metadata.get("creator", ""),
            "producer": doc.metadata.get("producer", ""),
            "page_count": len(doc)
        }
        
        # Detect currency
        currency = "USD"  # Default
        if "eur" in text_lower or "€" in text:
            currency = "EUR"
        elif "gbp" in text_lower or "£" in text:
            currency = "GBP"
        elif "chf" in text_lower:
            currency = "CHF"
        elif "jpy" in text_lower or "¥" in text:
            currency = "JPY"
        
        # Detect language
        language = "en"  # Default
        if re.search(r'\b(der|die|das|und|ist|für)\b', text_lower):
            language = "de"
        elif re.search(r'\b(le|la|les|et|est|pour)\b', text_lower):
            language = "fr"
        elif re.search(r'\b(el|la|los|las|y|es|para)\b', text_lower):
            language = "es"
        elif re.search(r'\b(il|lo|la|i|e|è|per)\b', text_lower):
            language = "it"
        
        # Detect date format
        date_format = "unknown"
        if re.search(r'\d{2}/\d{2}/\d{4}', text):
            date_format = "DD/MM/YYYY"
        elif re.search(r'\d{2}-\d{2}-\d{4}', text):
            date_format = "DD-MM-YYYY"
        elif re.search(r'\d{4}/\d{2}/\d{2}', text):
            date_format = "YYYY/MM/DD"
        elif re.search(r'\d{4}-\d{2}-\d{2}', text):
            date_format = "YYYY-MM-DD"
        elif re.search(r'\d{2}\.\d{2}\.\d{4}', text):
            date_format = "DD.MM.YYYY"
        
        # Detect if document contains tables
        has_tables = "table" in text_lower or ":" in text or "\t" in text
        
        # Detect if document contains charts or graphs
        has_charts = "chart" in text_lower or "graph" in text_lower or "figure" in text_lower
        
        # Compile classification
        classification = {
            "document_type": best_type,
            "confidence": confidence,
            "type_scores": type_scores,
            "metadata": metadata,
            "currency": currency,
            "language": language,
            "date_format": date_format,
            "has_tables": has_tables,
            "has_charts": has_charts,
            "processing_strategy": determine_processing_strategy(best_type)
        }
        
        logger.info(f"Document classified as {best_type} with {confidence} confidence")
        
        return classification
    
    except Exception as e:
        logger.error(f"Error classifying document: {str(e)}")
        return {
            "document_type": "unknown",
            "confidence": "none",
            "error": str(e),
            "processing_strategy": "generic"
        }

def determine_processing_strategy(document_type: str) -> str:
    """
    Determine the appropriate processing strategy based on document type.
    
    Args:
        document_type: Type of document
        
    Returns:
        Processing strategy
    """
    if document_type == "messos":
        return "messos_processor"
    elif document_type == "account_statement":
        return "account_statement_processor"
    elif document_type == "fund_fact_sheet":
        return "fund_fact_sheet_processor"
    elif document_type == "financial_report":
        return "financial_report_processor"
    elif document_type == "prospectus":
        return "prospectus_processor"
    elif document_type == "research_report":
        return "research_report_processor"
    else:
        return "generic_processor"

def analyze_document_structure(document_path: str) -> Dict[str, Any]:
    """
    Analyze the structure of a document to identify sections, tables, and key elements.
    
    Args:
        document_path: Path to the document
        
    Returns:
        Dictionary containing document structure analysis
    """
    logger.info(f"Analyzing document structure: {document_path}")
    
    try:
        # Open the document
        doc = fitz.open(document_path)
        
        # Initialize structure
        structure = {
            "page_count": len(doc),
            "sections": [],
            "tables": [],
            "charts": [],
            "headers_footers": [],
            "toc": []
        }
        
        # Analyze each page
        for page_num, page in enumerate(doc):
            # Extract text
            text = page.get_text()
            
            # Extract blocks (paragraphs, tables, etc.)
            blocks = page.get_text("blocks")
            
            # Identify potential section headers
            lines = text.split('\n')
            for i, line in enumerate(lines):
                if line and len(line.strip()) < 100 and line.strip().upper() == line.strip():
                    structure["sections"].append({
                        "page": page_num + 1,
                        "title": line.strip(),
                        "position": i
                    })
            
            # Identify potential tables
            for block in blocks:
                block_text = block[4]
                if block_text.count('\n') > 3 and block_text.count('\t') > 0:
                    structure["tables"].append({
                        "page": page_num + 1,
                        "position": block[:4],
                        "rows": block_text.count('\n') + 1,
                        "columns": block_text.count('\t') / block_text.count('\n') if block_text.count('\n') > 0 else 0
                    })
            
            # Identify headers and footers
            if page_num > 0:  # Skip first page for header detection
                top_text = page.get_text("text", clip=(0, 0, page.rect.width, 50))
                if top_text:
                    structure["headers_footers"].append({
                        "page": page_num + 1,
                        "type": "header",
                        "text": top_text.strip()
                    })
            
            bottom_text = page.get_text("text", clip=(0, page.rect.height - 50, page.rect.width, page.rect.height))
            if bottom_text:
                structure["headers_footers"].append({
                    "page": page_num + 1,
                    "type": "footer",
                    "text": bottom_text.strip()
                })
        
        # Try to extract table of contents
        toc = doc.get_toc()
        if toc:
            structure["toc"] = toc
        
        doc.close()
        
        return structure
    
    except Exception as e:
        logger.error(f"Error analyzing document structure: {str(e)}")
        return {
            "error": str(e),
            "page_count": 0,
            "sections": [],
            "tables": [],
            "charts": [],
            "headers_footers": [],
            "toc": []
        }

# Define tools
document_classifier_tool = Tool(
    name="document_classifier",
    description="Classify financial documents based on content",
    function=classify_document
)

document_structure_analyzer_tool = Tool(
    name="document_structure_analyzer",
    description="Analyze the structure of financial documents",
    function=analyze_document_structure
)

# Create the document classifier agent
document_classifier_agent = Agent(
    name="document_classifier",
    model="gemini-2.0-pro-vision",
    instruction="""
    You are a financial document classification expert. Your job is to analyze financial documents and determine their type and structure.
    
    For each document:
    1. Classify the document type using the document_classifier tool
    2. Analyze the document structure using the document_structure_analyzer tool
    
    Be thorough and precise in your analysis. Pay special attention to:
    - Document type and confidence level
    - Document structure (sections, tables, charts)
    - Document metadata (title, author, etc.)
    - Currency and language
    
    Use this information to determine the appropriate processing strategy for the document.
    """,
    description="Classifies financial documents and determines the appropriate processing strategy.",
    tools=[document_classifier_tool, document_structure_analyzer_tool]
)

if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python document_classifier_agent.py <pdf_path>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    # Classify document
    classification = classify_document(pdf_path)
    
    # Analyze document structure
    structure = analyze_document_structure(pdf_path)
    
    # Print results
    print("\n=== Document Classification ===")
    print(f"Document Type: {classification['document_type']} (Confidence: {classification['confidence']})")
    print(f"Currency: {classification['currency']}")
    print(f"Language: {classification['language']}")
    print(f"Processing Strategy: {classification['processing_strategy']}")
    
    print("\n=== Document Structure ===")
    print(f"Pages: {structure['page_count']}")
    print(f"Sections: {len(structure['sections'])}")
    print(f"Tables: {len(structure['tables'])}")
    print(f"Headers/Footers: {len(structure['headers_footers'])}")
    
    if structure['toc']:
        print("\nTable of Contents:")
        for item in structure['toc']:
            print(f"  {item[0]} {item[1]} (Page {item[2]})")
