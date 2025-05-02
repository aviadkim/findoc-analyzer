"""
Document Classifier Module

This module provides functionality to classify financial documents based on their content.
"""

import re
import logging
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentClassifier:
    """
    Document classifier for financial documents.
    """
    
    # Document type patterns
    DOCUMENT_PATTERNS = {
        'portfolio_statement': [
            r'portfolio\s+statement',
            r'portfolio\s+valuation',
            r'asset\s+statement',
            r'investment\s+summary',
            r'holdings\s+statement'
        ],
        'account_statement': [
            r'account\s+statement',
            r'bank\s+statement',
            r'transaction\s+statement',
            r'account\s+summary',
            r'statement\s+of\s+account'
        ],
        'fund_fact_sheet': [
            r'fund\s+fact\s+sheet',
            r'kiid',
            r'key\s+investor\s+information',
            r'fund\s+profile',
            r'fund\s+summary'
        ],
        'prospectus': [
            r'prospectus',
            r'offering\s+memorandum',
            r'offering\s+circular',
            r'information\s+memorandum'
        ],
        'annual_report': [
            r'annual\s+report',
            r'financial\s+report',
            r'yearly\s+report',
            r'annual\s+financial\s+statement'
        ],
        'trade_confirmation': [
            r'trade\s+confirmation',
            r'contract\s+note',
            r'transaction\s+confirmation',
            r'execution\s+notice'
        ]
    }
    
    # Bank and financial institution patterns
    INSTITUTION_PATTERNS = {
        'ubs': [r'ubs', r'union\s+bank\s+of\s+switzerland'],
        'credit_suisse': [r'credit\s+suisse'],
        'jpmorgan': [r'jpmorgan', r'jp\s+morgan'],
        'goldman_sachs': [r'goldman\s+sachs'],
        'morgan_stanley': [r'morgan\s+stanley'],
        'bank_of_america': [r'bank\s+of\s+america', r'merrill\s+lynch'],
        'deutsche_bank': [r'deutsche\s+bank'],
        'barclays': [r'barclays'],
        'hsbc': [r'hsbc'],
        'bnp_paribas': [r'bnp\s+paribas'],
        'citi': [r'citi', r'citibank', r'citigroup'],
        'wells_fargo': [r'wells\s+fargo'],
        'blackrock': [r'blackrock'],
        'vanguard': [r'vanguard'],
        'fidelity': [r'fidelity'],
        'charles_schwab': [r'charles\s+schwab', r'schwab'],
        'td_ameritrade': [r'td\s+ameritrade'],
        'interactive_brokers': [r'interactive\s+brokers'],
        'robinhood': [r'robinhood'],
        'etrade': [r'etrade', r'e-trade', r'e\s+trade']
    }
    
    def __init__(self):
        """
        Initialize the document classifier.
        """
        # Compile regex patterns for efficiency
        self.document_patterns = {
            doc_type: [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
            for doc_type, patterns in self.DOCUMENT_PATTERNS.items()
        }
        
        self.institution_patterns = {
            institution: [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
            for institution, patterns in self.INSTITUTION_PATTERNS.items()
        }
    
    def classify(self, text: str) -> Dict[str, Any]:
        """
        Classify a document based on its text content.
        
        Args:
            text: The text content of the document
            
        Returns:
            Dictionary with classification results
        """
        logger.info("Classifying document...")
        
        # Initialize result
        result = {
            'document_type': 'unknown',
            'document_type_confidence': 0.0,
            'institution': 'unknown',
            'institution_confidence': 0.0,
            'language': 'en',
            'contains_tables': False,
            'contains_securities': False,
            'contains_portfolio_summary': False,
            'contains_asset_allocation': False
        }
        
        # Detect document type
        doc_type_scores = {}
        for doc_type, patterns in self.document_patterns.items():
            score = 0
            for pattern in patterns:
                matches = pattern.findall(text)
                score += len(matches)
            
            if score > 0:
                doc_type_scores[doc_type] = score
        
        # Determine document type with highest score
        if doc_type_scores:
            max_score = max(doc_type_scores.values())
            max_doc_types = [dt for dt, score in doc_type_scores.items() if score == max_score]
            result['document_type'] = max_doc_types[0]
            result['document_type_confidence'] = min(1.0, max_score / 5.0)
        
        # Detect financial institution
        institution_scores = {}
        for institution, patterns in self.institution_patterns.items():
            score = 0
            for pattern in patterns:
                matches = pattern.findall(text)
                score += len(matches)
            
            if score > 0:
                institution_scores[institution] = score
        
        # Determine institution with highest score
        if institution_scores:
            max_score = max(institution_scores.values())
            max_institutions = [inst for inst, score in institution_scores.items() if score == max_score]
            result['institution'] = max_institutions[0]
            result['institution_confidence'] = min(1.0, max_score / 3.0)
        
        # Check for tables
        result['contains_tables'] = bool(re.search(r'table|column|row', text, re.IGNORECASE))
        
        # Check for securities
        result['contains_securities'] = bool(
            re.search(r'security|securities|stock|bond|fund|etf|isin|cusip|sedol', text, re.IGNORECASE)
        )
        
        # Check for portfolio summary
        result['contains_portfolio_summary'] = bool(
            re.search(r'portfolio\s+summary|total\s+value|net\s+asset\s+value|nav', text, re.IGNORECASE)
        )
        
        # Check for asset allocation
        result['contains_asset_allocation'] = bool(
            re.search(r'asset\s+allocation|asset\s+class|equity|fixed\s+income|cash|alternative', text, re.IGNORECASE)
        )
        
        logger.info(f"Document classified as {result['document_type']} from {result['institution']}")
        return result
    
    def detect_language(self, text: str) -> str:
        """
        Detect the language of the document.
        
        Args:
            text: The text content of the document
            
        Returns:
            ISO language code (e.g., 'en', 'fr', 'de')
        """
        # Simple language detection based on common words
        # In a production environment, use a proper language detection library
        
        # Count words in different languages
        english_words = len(re.findall(r'\b(the|and|of|to|in|is|that|for|with|as)\b', text, re.IGNORECASE))
        french_words = len(re.findall(r'\b(le|la|les|et|de|à|en|est|que|pour)\b', text, re.IGNORECASE))
        german_words = len(re.findall(r'\b(der|die|das|und|in|ist|zu|den|für|mit)\b', text, re.IGNORECASE))
        
        # Determine language with highest word count
        counts = {
            'en': english_words,
            'fr': french_words,
            'de': german_words
        }
        
        return max(counts, key=counts.get)
    
    def extract_metadata(self, text: str) -> Dict[str, Any]:
        """
        Extract metadata from the document text.
        
        Args:
            text: The text content of the document
            
        Returns:
            Dictionary with metadata
        """
        metadata = {}
        
        # Extract date
        date_match = re.search(r'(?:date|as of|valuation date)[:\s]+(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})', text, re.IGNORECASE)
        if date_match:
            metadata['date'] = date_match.group(1)
        
        # Extract account number
        account_match = re.search(r'(?:account|portfolio|client)(?:\s+number|#|no\.?)[:\s]+([a-z0-9\-]+)', text, re.IGNORECASE)
        if account_match:
            metadata['account_number'] = account_match.group(1)
        
        # Extract client name
        client_match = re.search(r'(?:client|customer|investor|account holder)[:\s]+([a-z\s\.]+)', text, re.IGNORECASE)
        if client_match:
            metadata['client_name'] = client_match.group(1).strip()
        
        # Extract currency
        currency_match = re.search(r'(?:currency|in)[:\s]+(USD|EUR|GBP|CHF|JPY)', text)
        if currency_match:
            metadata['currency'] = currency_match.group(1)
        
        return metadata
