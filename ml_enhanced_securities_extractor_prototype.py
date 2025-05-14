"""
ML-Enhanced Securities Extractor Prototype

This module demonstrates the enhanced capabilities of the ML-based securities extractor.
It integrates prototype ML models with the existing rule-based extraction logic.

NOTE: This is a prototype implementation for demonstration purposes. The actual
ML models would require proper training data and infrastructure.
"""

import os
import json
import re
import logging
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple, Union, Set
import camelot
from pathlib import Path
from dataclasses import dataclass
from collections import defaultdict

# Import the existing extractor for integration and fallback
try:
    from enhanced_securities_extractor import SecurityExtractor as RuleBasedExtractor
    from securities_extraction_monitor import track_extraction_performance
except ImportError:
    # Stubs for when imports are not available
    track_extraction_performance = lambda func: func  # Simple decorator stub
    
    class RuleBasedExtractor:
        def __init__(self, *args, **kwargs):
            self.debug = kwargs.get('debug', False)
            
        def extract_from_pdf(self, pdf_path):
            return {"document_type": "unknown", "securities": [], "error": "Rule-based extractor not available"}

# Set up logging
logger = logging.getLogger('ml_securities_extractor_prototype')
logger.setLevel(logging.INFO)

# Create console handler if not already set up
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

# Reference list of document types
DOCUMENT_TYPES = [
    'messos', 'bofa', 'ubs', 'db', 'ms', 'interactive_brokers', 
    'schwab', 'vanguard', 'fidelity', 'tdameritrade', 'etrade', 'generic'
]

# Entity types we want to detect
ENTITY_TYPES = [
    'ISIN', 'CUSIP', 'SEDOL', 'SECURITY_NAME', 'QUANTITY', 
    'PRICE', 'VALUE', 'CURRENCY', 'PERCENTAGE', 'DATE'
]

@dataclass
class Entity:
    """Class to store entity information from NER model."""
    text: str
    start: int
    end: int
    label: str
    confidence: float
    page: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert entity to dictionary."""
        return {
            'text': self.text,
            'start': self.start,
            'end': self.end,
            'label': self.label,
            'confidence': self.confidence,
            'page': self.page
        }

@dataclass
class Relationship:
    """Class to store relationship between entities."""
    source: Entity
    target: Entity
    relation_type: str
    confidence: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert relationship to dictionary."""
        return {
            'source': self.source.to_dict() if isinstance(self.source, Entity) else self.source,
            'target': self.target.to_dict() if isinstance(self.target, Entity) else self.target,
            'relation_type': self.relation_type,
            'confidence': self.confidence
        }

class DocumentClassifier:
    """Prototype ML document classifier with rule-based fallback."""
    
    def __init__(self):
        """Initialize the document classifier prototype."""
        logger.info("Initializing Document Classifier prototype")
        # In a real implementation, we would load a trained model here
        # For the prototype, we'll use pattern matching as fallback
        self.patterns = {
            'messos': [r'MESSOS ENTERPRISES', r'Cornèr Banca'],
            'bofa': [r'Bank of America', r'Merrill Lynch'],
            'ubs': [r'\bUBS\b'],
            'db': [r'Deutsche Bank'],
            'ms': [r'Morgan Stanley'],
            'interactive_brokers': [r'Interactive Brokers'],
            'schwab': [r'Charles Schwab', r'Schwab'],
            'vanguard': [r'Vanguard'],
            'fidelity': [r'Fidelity'],
            'tdameritrade': [r'TD Ameritrade', r'TDAmeritrade'],
            'etrade': [r'E\*TRADE', r'ETRADE', r'E-TRADE'],
        }
        
        # Simulated ML model confidence scores
        self.mock_confidence = {
            'messos': 0.92,
            'bofa': 0.89,
            'ubs': 0.87,
            'db': 0.86,
            'ms': 0.88,
            'interactive_brokers': 0.90,
            'schwab': 0.87,
            'vanguard': 0.89,
            'fidelity': 0.88,
            'tdameritrade': 0.85,
            'etrade': 0.84,
            'generic': 0.70
        }
    
    def extract_features(self, text: str) -> Dict[str, float]:
        """
        Extract features for document classification (prototype implementation).
        
        Args:
            text: Document text
            
        Returns:
            Dictionary of features
        """
        # Simple feature extraction for demo purposes
        features = {}
        
        # Document length
        features['text_length'] = len(text)
        
        # Presence of identifiers
        features['has_isin'] = 1 if re.search(r'[A-Z]{2}[A-Z0-9]{9}[0-9]', text) else 0
        features['has_cusip'] = 1 if re.search(r'[0-9A-Z]{9}', text) else 0
        
        # Keyword frequencies
        securities_keywords = ['securities', 'stocks', 'bonds', 'equities', 'etf', 'fund', 'portfolio']
        features['securities_keyword_count'] = sum(1 for kw in securities_keywords if kw.lower() in text.lower())
        
        investment_keywords = ['investment', 'investor', 'holdings', 'asset', 'allocation', 'performance']
        features['investment_keyword_count'] = sum(1 for kw in investment_keywords if kw.lower() in text.lower())
        
        banking_keywords = ['bank', 'account', 'statement', 'balance', 'transfer', 'deposit']
        features['banking_keyword_count'] = sum(1 for kw in banking_keywords if kw.lower() in text.lower())
        
        # Formatting features
        features['date_count'] = len(re.findall(r'\d{1,2}[./]\d{1,2}[./]\d{2,4}', text))
        features['currency_count'] = len(re.findall(r'[$€£¥]', text))
        features['percentage_count'] = len(re.findall(r'\d+\.?\d*\s*%', text))
        
        return features
    
    def predict(self, text: str, tables: Optional[List[Any]] = None) -> Tuple[str, float]:
        """
        Predict document type with confidence score.
        
        Args:
            text: Document text
            tables: Extracted tables (optional)
            
        Returns:
            Tuple of (document_type, confidence)
        """
        logger.info("Classifying document type")
        
        # Extract features
        features = self.extract_features(text)
        
        # In a real implementation, we would use the features with our trained model
        # For the prototype, we'll detect document type using patterns
        
        # First check for exact pattern matches
        for doc_type, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    logger.info(f"Document classified as {doc_type} (pattern match)")
                    return doc_type, self.mock_confidence[doc_type]
        
        # If no exact matches, use a "simulated" ML prediction based on features
        # For demo, use a simplified heuristic
        scores = {
            'messos': 0.1 * features['investment_keyword_count'] + 0.2 * features['securities_keyword_count'],
            'bofa': 0.3 * features['banking_keyword_count'] + 0.1 * features['securities_keyword_count'],
            'generic': 0.5  # Baseline score for generic type
        }
        
        # Add scores based on ISIN presence
        if features['has_isin']:
            for key in scores:
                scores[key] += 0.2
        
        # Select highest scoring document type
        doc_type = max(scores.items(), key=lambda x: x[1])[0]
        
        # Use lower confidence for this simulated prediction
        confidence = min(0.7, scores[doc_type])
        
        logger.info(f"Document classified as {doc_type} (heuristic classification)")
        return doc_type, confidence


class EntityRecognizer:
    """Prototype ML entity recognizer with rule-based fallback."""
    
    def __init__(self):
        """Initialize the entity recognizer prototype."""
        logger.info("Initializing Entity Recognizer prototype")
        # Pattern-based recognition with confidence scores
        self.patterns = {
            'ISIN': (r'[A-Z]{2}[A-Z0-9]{9}[0-9]', 0.95),
            'CUSIP': (r'[0-9A-Z]{9}', 0.85),
            'SEDOL': (r'[0-9A-Z]{7}', 0.85),
            # More specific patterns for security names
            'SECURITY_NAME': (r'([A-Z][A-Za-z0-9\s\.\&\-]+(?:Corp|Inc|Ltd|LLC|SA|AG|NV|ETF|Fund|Trust|PLC|Group|Holding|Tech|Co))', 0.80),
            # Enhanced patterns for quantity
            'QUANTITY': (r'(?:Quantity|Shares|Units|Amount)[:\s]\s*(\d+[\.,\']?\d*[\.,\']?\d*)', 0.90),
            # More specific price patterns
            'PRICE': (r'(?:Price|Rate|NAV|Market\sPrice)[:\s]\s*[$€£]?\s*(\d+[\.,]?\d*[\.,]?\d*)', 0.85),
            # Enhanced value patterns
            'VALUE': (r'(?:Value|Market\sValue|Total|Amount|Position\sValue)[:\s]\s*[$€£]?\s*(\d+[\.,]?\d*[\.,]?\d*[\.,]?\d*)', 0.85),
            'CURRENCY': (r'\b(USD|EUR|CHF|GBP|JPY|CAD|AUD|HKD)\b', 0.95),
            'PERCENTAGE': (r'(\d+\.?\d*\s*%)', 0.90),
            'DATE': (r'(\d{1,2}[./]\d{1,2}[./]\d{2,4})', 0.90)
        }
        
        # Context-aware recognition improvement
        self.context_boosts = {
            'ISIN': [r'ISIN[:\s]', r'Security ID', r'Identifier'],
            'QUANTITY': [r'shares', r'units', r'quantity', r'position'],
            'PRICE': [r'price', r'rate', r'per share', r'per unit'],
            'VALUE': [r'value', r'worth', r'total', r'amount']
        }
        
        # Simulated NER confidence adjustments
        self.confidence_boosts = {
            'in_table_header': 0.1,
            'context_match': 0.1,
            'consistent_format': 0.05,
            'repeated_pattern': 0.05
        }
    
    def predict(self, text: str, page_num: int = 0) -> List[Entity]:
        """
        Predict entities in text with confidence scores.
        
        Args:
            text: Document text
            page_num: Page number for reference
            
        Returns:
            List of Entity objects
        """
        logger.info(f"Extracting entities from page {page_num}")
        entities = []
        
        # Simulated entity recognition using enhanced patterns
        for entity_type, (pattern, base_confidence) in self.patterns.items():
            # Find all matches
            for match in re.finditer(pattern, text):
                confidence = base_confidence
                
                # Check for context-based confidence boost
                if entity_type in self.context_boosts:
                    context_text = text[max(0, match.start() - 50):match.start()]
                    if any(re.search(ctx, context_text, re.IGNORECASE) for ctx in self.context_boosts[entity_type]):
                        confidence += self.confidence_boosts['context_match']
                
                # Check if entity appears in what might be a table header
                if re.search(r'^\s*[A-Z][A-Za-z\s]+\s*$', match.group(0)):
                    confidence += self.confidence_boosts['in_table_header']
                
                # Apply cap to confidence
                confidence = min(0.98, confidence)
                
                entities.append(Entity(
                    text=match.group(0),
                    start=match.start(),
                    end=match.end(),
                    label=entity_type,
                    confidence=confidence,
                    page=page_num
                ))
        
        # Add some simulated "enhanced" entity recognition
        # This would use more sophisticated NLP in a real implementation
        
        # 1. Look for security names near ISIN codes
        isin_entities = [e for e in entities if e.label == 'ISIN']
        for isin_entity in isin_entities:
            # Look for potential company name in surrounding text (50 chars before and after)
            context_start = max(0, isin_entity.start - 50)
            context_end = min(len(text), isin_entity.end + 50)
            context = text[context_start:context_end]
            
            # Try to identify company name not already caught by the pattern
            # In a real ML model, this would use named entity recognition
            # Here we use a simplified heuristic
            company_match = re.search(r'([A-Z][a-zA-Z\s]{5,}(?:Inc|Corp|Ltd|LLC|Fund|ETF)?)', context)
            if company_match and not any(e.text == company_match.group(0) for e in entities):
                # Avoid adding any match that contains the ISIN
                if isin_entity.text not in company_match.group(0):
                    # Calculate absolute position
                    abs_start = context_start + company_match.start()
                    abs_end = context_start + company_match.end()
                    
                    entities.append(Entity(
                        text=company_match.group(0),
                        start=abs_start,
                        end=abs_end,
                        label='SECURITY_NAME',
                        confidence=0.75,  # Lower confidence for heuristic match
                        page=page_num
                    ))
        
        # 2. Identify date formats not caught by the main pattern
        # e.g., "Maturity: 2025-06-30"
        maturity_dates = re.finditer(r'Maturity:?\s*(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|\d{2}\.\d{2}\.\d{4})', text)
        for match in maturity_dates:
            date_part = match.group(1)
            entities.append(Entity(
                text=date_part,
                start=match.start(1),
                end=match.end(1),
                label='DATE',
                confidence=0.92,
                page=page_num
            ))
        
        logger.info(f"Found {len(entities)} entities on page {page_num}")
        return entities


class TableAnalyzer:
    """Prototype table structure analyzer with ML-like capabilities."""
    
    def __init__(self):
        """Initialize the table analyzer prototype."""
        logger.info("Initializing Table Analyzer prototype")
        
        # Column header patterns for identification
        self.header_patterns = {
            'ISIN': [r'ISIN', r'Security ID', r'Identifier'],
            'SECURITY_NAME': [r'Security', r'Description', r'Name', r'Fund'],
            'QUANTITY': [r'Quantity', r'Shares', r'Units', r'Amount', r'Position Size'],
            'PRICE': [r'Price', r'Rate', r'NAV', r'Market Price'],
            'VALUE': [r'Value', r'Market Value', r'Total', r'Amount', r'Position Value'],
            'CURRENCY': [r'Currency', r'CCY'],
            'DATE': [r'Date', r'Maturity', r'Settlement']
        }
        
        # Data type signatures for column classification
        self.data_signatures = {
            'ISIN': {'pattern': r'[A-Z]{2}[A-Z0-9]{9}[0-9]', 'min_confidence': 0.9},
            'CUSIP': {'pattern': r'[0-9A-Z]{9}', 'min_confidence': 0.85},
            'SEDOL': {'pattern': r'[0-9A-Z]{7}', 'min_confidence': 0.85},
            'QUANTITY': {'pattern': r'\d+[\.,\']\d*', 'numeric': True, 'min_confidence': 0.8},
            'PRICE': {'pattern': r'\d+\.\d*', 'numeric': True, 'min_confidence': 0.8},
            'VALUE': {'pattern': r'\d+[\.,\']\d*', 'numeric': True, 'min_confidence': 0.8},
            'CURRENCY': {'pattern': r'USD|EUR|CHF|GBP|JPY|CAD|AUD|HKD', 'min_confidence': 0.9},
            'DATE': {'pattern': r'\d{1,2}[./]\d{1,2}[./]\d{2,4}', 'min_confidence': 0.85}
        }
    
    def analyze_table(self, table) -> Dict[str, Any]:
        """
        Analyze table structure to identify rows, columns, and their purposes.
        
        Args:
            table: Camelot table object
            
        Returns:
            Dictionary with table structure analysis
        """
        logger.info(f"Analyzing table structure on page {table.page}")
        
        # Initialize result structure
        result = {
            'is_securities_table': False,
            'confidence': 0.0,
            'header_row': None,
            'data_rows': [],
            'column_types': {},
            'has_header': False
        }
        
        try:
            # Convert to dataframe if needed
            df = table.df if hasattr(table, 'df') else table
            
            if df.empty:
                return result
            
            # Check if this is a securities table based on content
            table_text = ' '.join([' '.join(str(cell) for cell in row) for row in df.values.tolist()])
            
            # Look for securities table indicators
            security_indicators = [
                'ISIN', 'Security', 'Portfolio', 'Holdings', 'Shares', 
                'Quantity', 'Price', 'Value', 'Securities'
            ]
            
            indicator_count = sum(1 for ind in security_indicators if ind in table_text)
            
            # Look for ISIN patterns
            isin_matches = re.findall(r'[A-Z]{2}[A-Z0-9]{9}[0-9]', table_text)
            
            # Determine if this is likely a securities table
            result['is_securities_table'] = len(isin_matches) > 0 or indicator_count >= 2
            
            if result['is_securities_table']:
                # Set confidence based on indicators
                result['confidence'] = min(0.6 + 0.1 * indicator_count + 0.1 * len(isin_matches), 0.95)
                
                # Try to identify header row
                for i, row in enumerate(df.values.tolist()):
                    row_text = ' '.join(str(cell) for cell in row)
                    header_matches = sum(1 for entity, patterns in self.header_patterns.items() 
                                         for pattern in patterns if re.search(pattern, row_text, re.IGNORECASE))
                    
                    if header_matches >= 2:
                        result['has_header'] = True
                        result['header_row'] = i
                        
                        # Analyze column headers
                        for j, cell in enumerate(row):
                            cell_text = str(cell).strip()
                            
                            # Check if cell matches any column header pattern
                            for entity, patterns in self.header_patterns.items():
                                if any(re.search(pattern, cell_text, re.IGNORECASE) for pattern in patterns):
                                    result['column_types'][j] = entity
                                    break
                        
                        break
                
                # If no header found but this is a securities table, try first row
                if not result['has_header']:
                    result['header_row'] = 0
                
                # Determine data rows (all rows except header)
                result['data_rows'] = [i for i in range(len(df)) if i != result['header_row']]
                
                # If column types not identified from header, try to infer from data
                if not result['column_types']:
                    # For each column, analyze content to determine type
                    for j in range(df.shape[1]):
                        column_data = [str(df.iloc[i, j]) for i in result['data_rows']]
                        
                        # Skip empty columns
                        if not any(cell.strip() for cell in column_data):
                            continue
                        
                        # Count matches for each entity type
                        type_matches = {}
                        for entity_type, signature in self.data_signatures.items():
                            matches = [cell for cell in column_data if re.search(signature['pattern'], cell)]
                            type_matches[entity_type] = len(matches) / max(1, len(column_data))
                        
                        # Select entity type with highest match ratio, if above threshold
                        best_match = max(type_matches.items(), key=lambda x: x[1])
                        if best_match[1] >= self.data_signatures[best_match[0]]['min_confidence']:
                            result['column_types'][j] = best_match[0]
            
            logger.info(f"Table analysis complete - {'securities table' if result['is_securities_table'] else 'not a securities table'}")
            return result
            
        except Exception as e:
            logger.error(f"Error in table analysis: {str(e)}")
            return result


class RelationshipExtractor:
    """Prototype relationship extractor with ML-like capabilities."""
    
    def __init__(self):
        """Initialize the relationship extractor prototype."""
        logger.info("Initializing Relationship Extractor prototype")
        
        # Relationship extraction rules
        self.proximity_thresholds = {
            'has_name': 500,  # Character distance
            'has_quantity': 800,
            'has_price': 800,
            'has_value': 800
        }
        
        # Context patterns that strengthen relationships
        self.context_patterns = {
            'has_name': [r'security', r'description', r'name'],
            'has_quantity': [r'quantity', r'shares', r'units', r'amount'],
            'has_price': [r'price', r'rate', r'per share', r'per unit'],
            'has_value': [r'value', r'worth', r'total', r'amount']
        }
    
    def extract_relationships(self, entities: List[Entity], text: str) -> List[Relationship]:
        """
        Extract relationships between entities.
        
        Args:
            entities: List of identified entities
            text: Full document text
            
        Returns:
            List of Relationship objects
        """
        logger.info("Extracting relationships between entities")
        relationships = []
        
        # Group entities by type
        entity_by_type = defaultdict(list)
        for entity in entities:
            entity_by_type[entity.label].append(entity)
        
        # Process ISIN entities as the base for relationships
        for isin_entity in entity_by_type.get('ISIN', []):
            # For each relationship type, find the closest matching entity
            for relation_type, target_type in [
                ('has_name', 'SECURITY_NAME'),
                ('has_quantity', 'QUANTITY'),
                ('has_price', 'PRICE'),
                ('has_value', 'VALUE')
            ]:
                # Find closest entity of the target type
                closest_entity = None
                min_distance = float('inf')
                
                for target_entity in entity_by_type.get(target_type, []):
                    # Skip if not on same page
                    if isin_entity.page != target_entity.page:
                        continue
                    
                    # Calculate distance
                    distance = abs(isin_entity.start - target_entity.start)
                    
                    # Check if within threshold
                    if distance < self.proximity_thresholds[relation_type] and distance < min_distance:
                        min_distance = distance
                        closest_entity = target_entity
                
                # If we found a matching entity, create a relationship
                if closest_entity:
                    # Calculate confidence based on distance and context
                    base_confidence = max(0.5, 1.0 - min_distance / (2 * self.proximity_thresholds[relation_type]))
                    
                    # Check for context patterns that strengthen the relationship
                    context_start = min(isin_entity.start, closest_entity.start)
                    context_end = max(isin_entity.end, closest_entity.end)
                    context_text = text[context_start:context_end]
                    
                    # Boost confidence if context patterns are found
                    context_boost = 0.0
                    for pattern in self.context_patterns.get(relation_type, []):
                        if re.search(pattern, context_text, re.IGNORECASE):
                            context_boost += 0.1
                            break
                    
                    # Cap total confidence
                    confidence = min(0.95, base_confidence + context_boost)
                    
                    # Create relationship
                    relationships.append(Relationship(
                        source=isin_entity,
                        target=closest_entity,
                        relation_type=relation_type,
                        confidence=confidence
                    ))
        
        logger.info(f"Extracted {len(relationships)} relationships")
        return relationships


class ValidationModel:
    """Prototype validation model with error correction capabilities."""
    
    def __init__(self):
        """Initialize the validation model prototype."""
        logger.info("Initializing Validation Model prototype")
        
        # Define validation rules
        self.validation_rules = [
            # ISIN format validation
            lambda security: ('isin_valid', 
                             re.match(r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$', security.get('isin', '')), 
                             'Invalid ISIN format'),
            
            # Cross-field consistency check for quantity * price ≈ value
            lambda security: ('value_consistent', 
                             not (isinstance(security.get('nominal'), (int, float)) and 
                                  isinstance(security.get('price'), (int, float)) and 
                                  isinstance(security.get('value'), (int, float))) or 
                             abs(security.get('nominal', 0) * security.get('price', 0) - 
                                 security.get('value', 0)) / max(security.get('value', 1), 1) < 0.2, 
                             'Value inconsistent with quantity and price'),
            
            # Check for unreasonable values
            lambda security: ('reasonable_values',
                            not isinstance(security.get('nominal'), (int, float)) or 
                            (security.get('nominal', 0) > 0 and security.get('nominal', 0) < 1000000),
                            'Quantity value outside reasonable range'),
            
            # Check for minimum required fields
            lambda security: ('minimum_fields',
                            bool(security.get('isin')) and 
                            (bool(security.get('description')) or bool(security.get('name'))),
                            'Missing required fields (ISIN and description/name)'),
        ]
        
        # Error correction strategies
        self.correction_rules = [
            # Clean ISIN format
            lambda security: {
                **security, 
                'isin': re.sub(r'[^A-Z0-9]', '', str(security.get('isin', '')).upper())
            } if 'isin' in security else security,
            
            # Ensure numeric values for nominal, price, value
            lambda security: {
                **security,
                'nominal': self._parse_numeric(security.get('nominal')) if 'nominal' in security else None,
                'price': self._parse_numeric(security.get('price')) if 'price' in security else None,
                'value': self._parse_numeric(security.get('value')) if 'value' in security else None
            },
            
            # Calculate missing fields if possible
            lambda security: self._calculate_missing_fields(security),
            
            # Normalize security name
            lambda security: {
                **security,
                'description': self._normalize_name(security.get('description', '')) if 'description' in security else security.get('name', '')
            }
        ]
    
    def _parse_numeric(self, value):
        """Parse numeric value from various formats."""
        if value is None:
            return None
            
        if isinstance(value, (int, float)):
            return float(value)
            
        if isinstance(value, str):
            # Remove non-numeric characters except decimal point
            cleaned = re.sub(r'[^\d.\-]', '', value.replace(',', '.'))
            
            try:
                return float(cleaned)
            except ValueError:
                # Try to find a numeric pattern
                match = re.search(r'(\d+\.?\d*)', cleaned)
                if match:
                    try:
                        return float(match.group(1))
                    except ValueError:
                        return None
        
        return None
    
    def _normalize_name(self, name):
        """Normalize security name format."""
        if not name:
            return ""
            
        # Clean up whitespace
        name = re.sub(r'\s+', ' ', name).strip()
        
        # Capitalize if all lowercase
        if name.islower():
            name = name.title()
            
        return name
    
    def _calculate_missing_fields(self, security):
        """Calculate missing values using the relationship: nominal * price = value."""
        result = security.copy()
        
        # Calculate missing values if possible
        if result.get('nominal') is not None and result.get('price') is not None and result.get('value') is None:
            result['value'] = result['nominal'] * result['price']
            result['value_derived'] = True
        elif result.get('nominal') is not None and result.get('price') is None and result.get('value') is not None:
            result['price'] = result['value'] / result['nominal'] if result['nominal'] else None
            result['price_derived'] = True
        elif result.get('nominal') is None and result.get('price') is not None and result.get('value') is not None:
            result['nominal'] = result['value'] / result['price'] if result['price'] else None
            result['nominal_derived'] = True
            
        return result
    
    def validate_security(self, security: Dict[str, Any]) -> Tuple[bool, float, List[str]]:
        """
        Validate a security and provide confidence score.
        
        Args:
            security: Dictionary with security information
            
        Returns:
            Tuple of (is_valid, confidence_score, list_of_issues)
        """
        issues = []
        rule_results = {}
        
        # Apply validation rules
        for rule in self.validation_rules:
            rule_name, rule_result, rule_message = rule(security)
            rule_results[rule_name] = rule_result
            if not rule_result:
                issues.append(rule_message)
        
        # Calculate validity based on issues
        is_valid = len(issues) <= 2  # Allow a few issues
        
        # Calculate confidence based on rule results
        passed_rules = sum(1 for result in rule_results.values() if result)
        total_rules = len(rule_results)
        confidence = passed_rules / max(total_rules, 1)
        
        # Check data completeness
        key_fields = ['isin', 'description', 'nominal', 'price', 'value']
        completeness = sum(1 for field in key_fields if field in security and security[field]) / len(key_fields)
        
        # Adjust confidence based on data completeness
        final_confidence = 0.6 * confidence + 0.4 * completeness
        
        return is_valid, final_confidence, issues
    
    def correct_security(self, security: Dict[str, Any]) -> Dict[str, Any]:
        """
        Attempt to correct issues in a security.
        
        Args:
            security: Dictionary with security information
            
        Returns:
            Corrected security dictionary
        """
        corrected = security.copy()
        
        # Apply correction rules sequentially
        for rule in self.correction_rules:
            corrected = rule(corrected)
        
        return corrected


class MLSecurityExtractorPrototype:
    """
    Prototype ML-enhanced securities extractor.
    
    This class demonstrates the enhanced capabilities of the ML approach
    while maintaining compatibility with the existing extraction workflow.
    """
    
    def __init__(self, debug: bool = False, log_level: str = "INFO"):
        """
        Initialize the ML-enhanced securities extractor prototype.
        
        Args:
            debug: Whether to print debug information
            log_level: Logging level
        """
        logger.info("Initializing ML-enhanced Securities Extractor Prototype")
        self.debug = debug
        
        # Configure logging
        numeric_level = getattr(logging, log_level.upper(), None)
        if not isinstance(numeric_level, int):
            numeric_level = logging.INFO
        logger.setLevel(numeric_level)
        
        # Initialize rule-based extractor as fallback
        self.rule_based_extractor = RuleBasedExtractor(debug=debug, log_level=log_level)
        
        # Initialize ML model prototypes
        self.document_classifier = DocumentClassifier()
        self.entity_recognizer = EntityRecognizer()
        self.table_analyzer = TableAnalyzer()
        self.relationship_extractor = RelationshipExtractor()
        self.validation_model = ValidationModel()
        
        # Currency mapping
        self.doc_type_currency_map = {
            "messos": "USD",
            "bofa": "USD",
            "ubs": "CHF",
            "db": "EUR",
            "ms": "USD",
            "interactive_brokers": "USD",
            "schwab": "USD",
            "vanguard": "USD",
            "fidelity": "USD",
            "tdameritrade": "USD",
            "etrade": "USD",
            "generic": "USD"
        }
    
    @track_extraction_performance
    def extract_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract securities information from a PDF file.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary containing extracted information
        """
        logger.info(f"Starting ML-enhanced extraction from PDF: {pdf_path}")
        
        # Initialize default result structure
        default_result = {
            "document_type": "unknown",
            "securities": [],
            "extraction_method": "ml_prototype",
            "ml_confidence": {},
            "error": None
        }
        
        try:
            # Validate input
            if not pdf_path or not isinstance(pdf_path, str):
                error_msg = "Invalid PDF path provided"
                logger.error(error_msg)
                default_result["error"] = error_msg
                return default_result
                
            # Check if file exists
            if not os.path.exists(pdf_path):
                default_result["error"] = f"PDF file not found: {pdf_path}"
                return default_result
                
            if self.debug:
                print(f"Processing {pdf_path} with ML-enhanced extractor prototype...")
            
            # Phase 1: Extract text and tables from PDF
            try:
                tables = camelot.read_pdf(
                    pdf_path,
                    pages='all',
                    flavor='stream',
                    suppress_stdout=True
                )
                
                # Extract full text
                all_text = ' '.join([' '.join([' '.join(cell) for cell in row]) for table in tables for row in table.df.values.tolist()])
                
                if self.debug:
                    print(f"Extracted {len(tables)} tables from PDF")
                
            except Exception as e:
                logger.error(f"Error extracting text and tables from PDF: {str(e)}")
                default_result["error"] = f"Error extracting text and tables: {str(e)}"
                return default_result
            
            # Phase 2: Classify document type
            try:
                document_type, doc_type_confidence = self.document_classifier.predict(all_text, tables)
                default_result["document_type"] = document_type
                default_result["ml_confidence"]["document_type"] = doc_type_confidence
                
                if self.debug:
                    print(f"Detected document type: {document_type} (confidence: {doc_type_confidence:.2f})")
                
            except Exception as e:
                logger.error(f"Error classifying document type: {str(e)}")
                default_result["error"] = f"Error in document classification: {str(e)}"
                # Continue with default document type
            
            # Phase 3: Determine document currency
            try:
                # Use default currency based on document type
                default_result["currency"] = self.doc_type_currency_map.get(document_type, "USD")
                
                # In a real implementation, this would use ML to detect currency
                # Look for currency mentions in the text
                currency_matches = re.findall(r'\b(USD|EUR|CHF|GBP|JPY|CAD|AUD|HKD)\b', all_text)
                if currency_matches:
                    # Use most common currency
                    from collections import Counter
                    currency_counter = Counter(currency_matches)
                    most_common = currency_counter.most_common(1)[0][0]
                    default_result["currency"] = most_common
                    default_result["ml_confidence"]["currency_detection"] = 0.85
                
                if self.debug:
                    print(f"Detected currency: {default_result['currency']}")
                
            except Exception as e:
                logger.error(f"Error detecting currency: {str(e)}")
                # Continue with default currency
            
            # Phase 4: Extract entities from text
            try:
                entities = []
                for i, table in enumerate(tables):
                    # Extract text from table with page number
                    table_text = ' '.join([' '.join(cell) for row in table.df.values.tolist() for cell in row])
                    page_entities = self.entity_recognizer.predict(table_text, table.page)
                    entities.extend(page_entities)
                
                if self.debug:
                    print(f"Extracted {len(entities)} entities using NER")
                    # Print entity type distribution
                    entity_counts = {}
                    for entity in entities:
                        entity_counts[entity.label] = entity_counts.get(entity.label, 0) + 1
                    print("Entity distribution:")
                    for label, count in entity_counts.items():
                        print(f"  {label}: {count}")
                
                # Record average entity confidence
                if entities:
                    avg_entity_confidence = sum(e.confidence for e in entities) / len(entities)
                    default_result["ml_confidence"]["entity_recognition"] = avg_entity_confidence
                
            except Exception as e:
                logger.error(f"Error extracting entities: {str(e)}")
                default_result["error"] = f"Error in entity extraction: {str(e)}"
                entities = []
            
            # Phase 5: Analyze table structures
            try:
                table_structures = []
                securities_tables = []
                
                for i, table in enumerate(tables):
                    structure = self.table_analyzer.analyze_table(table)
                    structure['table_index'] = i
                    structure['page'] = table.page
                    table_structures.append(structure)
                    
                    if structure['is_securities_table']:
                        securities_tables.append(structure)
                
                if self.debug:
                    print(f"Found {len(securities_tables)} securities tables")
                
                # Record average table confidence
                if securities_tables:
                    avg_table_confidence = sum(t['confidence'] for t in securities_tables) / len(securities_tables)
                    default_result["ml_confidence"]["table_analysis"] = avg_table_confidence
                
            except Exception as e:
                logger.error(f"Error analyzing table structures: {str(e)}")
                default_result["error"] = f"Error in table analysis: {str(e)}"
                table_structures = []
                securities_tables = []
            
            # Phase 6: Extract relationships between entities
            try:
                relationships = self.relationship_extractor.extract_relationships(entities, all_text)
                
                if self.debug:
                    print(f"Extracted {len(relationships)} relationships between entities")
                    # Print relationship type distribution
                    rel_counts = {}
                    for rel in relationships:
                        rel_counts[rel.relation_type] = rel_counts.get(rel.relation_type, 0) + 1
                    print("Relationship distribution:")
                    for rel_type, count in rel_counts.items():
                        print(f"  {rel_type}: {count}")
                
                # Record average relationship confidence
                if relationships:
                    avg_rel_confidence = sum(r.confidence for r in relationships) / len(relationships)
                    default_result["ml_confidence"]["relationship_extraction"] = avg_rel_confidence
                
            except Exception as e:
                logger.error(f"Error extracting relationships: {str(e)}")
                default_result["error"] = f"Error in relationship extraction: {str(e)}"
                relationships = []
            
            # Phase 7: Construct securities from entities and relationships
            try:
                securities = self._construct_securities_from_entities(
                    entities, relationships, default_result["currency"]
                )
                
                if self.debug:
                    print(f"Constructed {len(securities)} securities from entities")
                
            except Exception as e:
                logger.error(f"Error constructing securities from entities: {str(e)}")
                default_result["error"] = f"Error in security construction: {str(e)}"
                securities = []
            
            # Phase 8: Extract securities from tables directly
            try:
                table_securities = self._extract_securities_from_tables(
                    tables, securities_tables, default_result["currency"]
                )
                
                if self.debug:
                    print(f"Extracted {len(table_securities)} securities from tables")
                
            except Exception as e:
                logger.error(f"Error extracting securities from tables: {str(e)}")
                default_result["error"] = f"Error in table extraction: {str(e)}"
                table_securities = []
            
            # Phase 9: Merge securities from both sources
            try:
                all_securities = self._merge_securities(securities, table_securities)
                
                if self.debug:
                    print(f"Combined into {len(all_securities)} unique securities")
                
            except Exception as e:
                logger.error(f"Error merging securities: {str(e)}")
                default_result["error"] = f"Error in securities merging: {str(e)}"
                all_securities = securities + table_securities
            
            # Phase 10: Validate and correct securities
            try:
                validated_securities = []
                overall_confidence = 0.0
                
                for security in all_securities:
                    # Apply corrections
                    corrected = self.validation_model.correct_security(security)
                    
                    # Validate
                    is_valid, confidence, issues = self.validation_model.validate_security(corrected)
                    
                    # Add validation information
                    corrected['validation_confidence'] = confidence
                    overall_confidence += confidence
                    
                    if issues:
                        corrected['validation_issues'] = issues
                    
                    # Include if valid or has minimal required data
                    if is_valid or (
                        corrected.get('isin') and 
                        (corrected.get('description') or corrected.get('name'))
                    ):
                        validated_securities.append(corrected)
                
                if validated_securities:
                    # Record average validation confidence
                    avg_validation_confidence = overall_confidence / len(validated_securities)
                    default_result["ml_confidence"]["validation"] = avg_validation_confidence
                
                default_result["securities"] = validated_securities
                
                if self.debug:
                    print(f"Validated {len(validated_securities)} securities")
                    # Print validation statistics
                    validation_issues = sum(1 for s in validated_securities if 'validation_issues' in s)
                    print(f"Securities with validation issues: {validation_issues}")
                
            except Exception as e:
                logger.error(f"Error validating securities: {str(e)}")
                default_result["error"] = f"Error in validation: {str(e)}"
                default_result["securities"] = all_securities
            
            # Phase 11: Fallback to rule-based extraction if few securities found
            if len(default_result["securities"]) < 2:
                try:
                    if self.debug:
                        print("Few securities found, falling back to rule-based extraction")
                    
                    rule_based_result = self.rule_based_extractor.extract_from_pdf(pdf_path)
                    rule_securities = rule_based_result.get("securities", [])
                    
                    if len(rule_securities) > len(default_result["securities"]):
                        if self.debug:
                            print(f"Rule-based extraction found more securities: {len(rule_securities)}")
                        
                        # Prefer ML document type and currency if detected
                        rule_based_result["document_type"] = default_result["document_type"]
                        rule_based_result["currency"] = default_result["currency"]
                        rule_based_result["extraction_method"] = "rule_based_fallback"
                        rule_based_result["ml_confidence"] = default_result["ml_confidence"]
                        
                        return rule_based_result
                    
                except Exception as e:
                    logger.error(f"Error in rule-based fallback: {str(e)}")
            
            # Calculate overall confidence
            confidence_values = default_result["ml_confidence"].values()
            if confidence_values:
                default_result["ml_confidence"]["overall"] = sum(confidence_values) / len(confidence_values)
            
            if self.debug:
                print(f"Extraction complete: Found {len(default_result['securities'])} securities")
                if "overall" in default_result["ml_confidence"]:
                    print(f"Overall confidence: {default_result['ml_confidence']['overall']:.2f}")
            
            return default_result
            
        except Exception as e:
            # Catch any unexpected errors
            logger.error(f"Unexpected error in ML extraction: {str(e)}")
            default_result["error"] = f"Unexpected error in extraction: {str(e)}"
            
            # Try rule-based as final fallback
            try:
                rule_based_result = self.rule_based_extractor.extract_from_pdf(pdf_path)
                rule_based_result["extraction_method"] = "rule_based_emergency_fallback"
                return rule_based_result
            except:
                return default_result
    
    def _construct_securities_from_entities(self, 
                                           entities: List[Entity],
                                           relationships: List[Relationship],
                                           default_currency: str) -> List[Dict[str, Any]]:
        """
        Construct securities from entities and relationships.
        
        Args:
            entities: Extracted entities
            relationships: Extracted relationships
            default_currency: Default currency to use
            
        Returns:
            List of securities
        """
        securities = []
        
        # Group entities by type
        entity_by_type = defaultdict(list)
        for entity in entities:
            entity_by_type[entity.label].append(entity)
        
        # Start with ISIN entities as the base for securities
        for isin_entity in entity_by_type.get('ISIN', []):
            security = {
                'isin': isin_entity.text,
                'extraction_confidence': isin_entity.confidence,
                'currency': default_currency,
                'source': 'entity_extraction'
            }
            
            # Find related entities through relationships
            for relationship in relationships:
                if isinstance(relationship.source, Entity) and relationship.source.text == isin_entity.text:
                    # Handle different relationship types
                    if relationship.relation_type == 'has_name':
                        security['description'] = relationship.target.text
                    elif relationship.relation_type == 'has_quantity':
                        security['nominal'] = self._parse_numeric(relationship.target.text)
                    elif relationship.relation_type == 'has_price':
                        security['price'] = self._parse_numeric(relationship.target.text)
                    elif relationship.relation_type == 'has_value':
                        security['value'] = self._parse_numeric(relationship.target.text)
            
            # For demonstration, include relationship confidence
            rel_confidences = [r.confidence for r in relationships 
                              if isinstance(r.source, Entity) and r.source.text == isin_entity.text]
            if rel_confidences:
                security['relationship_confidence'] = sum(rel_confidences) / len(rel_confidences)
            
            # Calculate missing values if possible
            if 'nominal' in security and 'price' in security and 'value' not in security:
                security['value'] = security['nominal'] * security['price']
                security['value_derived'] = True
            
            securities.append(security)
        
        # Also check for CUSIP and SEDOL entities if no ISIN found
        if not securities:
            for id_type in ['CUSIP', 'SEDOL']:
                for id_entity in entity_by_type.get(id_type, []):
                    security = {
                        id_type.lower(): id_entity.text,
                        'extraction_confidence': id_entity.confidence,
                        'currency': default_currency,
                        'source': 'entity_extraction'
                    }
                    
                    # Find closest security name
                    closest_name = None
                    min_distance = float('inf')
                    
                    for name_entity in entity_by_type.get('SECURITY_NAME', []):
                        if id_entity.page == name_entity.page:
                            distance = abs(id_entity.start - name_entity.start)
                            if distance < 500 and distance < min_distance:
                                min_distance = distance
                                closest_name = name_entity
                    
                    if closest_name:
                        security['description'] = closest_name.text
                    
                    securities.append(security)
        
        return securities
    
    def _extract_securities_from_tables(self, tables, table_structures, default_currency: str) -> List[Dict[str, Any]]:
        """
        Extract securities from tables using structure analysis.
        
        Args:
            tables: Extracted tables
            table_structures: Table structure analyses
            default_currency: Default currency to use
            
        Returns:
            List of securities
        """
        securities = []
        
        # Process securities tables
        for structure in table_structures:
            if not structure['is_securities_table']:
                continue
                
            table_idx = structure['table_index']
            if table_idx >= len(tables):
                continue
                
            table = tables[table_idx]
            df = table.df
            
            # Get column mappings
            column_mappings = structure['column_types']
            if not column_mappings:
                continue
                
            # Determine data rows
            data_rows = structure['data_rows']
            if not data_rows:
                continue
                
            # Process each data row
            for row_idx in data_rows:
                if row_idx >= len(df):
                    continue
                    
                row = df.iloc[row_idx].tolist()
                
                # Initialize security
                security = {
                    'currency': default_currency,
                    'extraction_confidence': structure['confidence'],
                    'source': f"table_{table_idx}"
                }
                
                # Extract data based on column mappings
                for col_idx, col_type in column_mappings.items():
                    if col_idx >= len(row):
                        continue
                        
                    cell_value = row[col_idx]
                    if not cell_value or str(cell_value).strip() == '':
                        continue
                        
                    cell_text = str(cell_value).strip()
                    
                    # Process based on column type
                    if col_type == 'ISIN':
                        isin_match = re.search(r'([A-Z]{2}[A-Z0-9]{9}[0-9])', cell_text)
                        if isin_match:
                            security['isin'] = isin_match.group(1)
                    elif col_type == 'SECURITY_NAME':
                        security['description'] = cell_text
                    elif col_type == 'QUANTITY':
                        security['nominal'] = self._parse_numeric(cell_text)
                    elif col_type == 'PRICE':
                        security['price'] = self._parse_numeric(cell_text)
                    elif col_type == 'VALUE':
                        security['value'] = self._parse_numeric(cell_text)
                    elif col_type == 'CURRENCY':
                        currency_match = re.search(r'\b(USD|EUR|CHF|GBP|JPY|CAD|AUD|HKD)\b', cell_text)
                        if currency_match:
                            security['currency'] = currency_match.group(1)
                
                # Only include if we have minimal required data
                if ('isin' in security or 
                    ('description' in security and any(k in security for k in ['nominal', 'price', 'value']))):
                    # Calculate missing values if possible
                    if 'nominal' in security and 'price' in security and 'value' not in security:
                        security['value'] = security['nominal'] * security['price']
                        security['value_derived'] = True
                        
                    securities.append(security)
        
        return securities
    
    def _merge_securities(self, securities1, securities2) -> List[Dict[str, Any]]:
        """
        Merge securities from different sources, removing duplicates.
        
        Args:
            securities1: First list of securities
            securities2: Second list of securities
            
        Returns:
            Merged list of securities
        """
        merged = {}
        
        # Helper function to merge two security dictionaries
        def merge_security_dicts(s1, s2):
            result = s1.copy()
            
            # Merge non-null values from s2
            for key, value in s2.items():
                if value is not None and (key not in result or result[key] is None):
                    result[key] = value
                elif key in result and result[key] is not None and value is not None:
                    # If both have values, prefer the one with higher confidence
                    if (key in ['extraction_confidence', 'relationship_confidence']):
                        result[key] = max(s1.get(key, 0), s2.get(key, 0))
                    elif s2.get('extraction_confidence', 0) > s1.get('extraction_confidence', 0):
                        # For other fields, prefer source with higher confidence
                        result[key] = value
            
            # Combined source information
            result['source'] = f"{s1.get('source', 'unknown')}+{s2.get('source', 'unknown')}"
            
            return result
        
        # Process first list
        for security in securities1:
            key = security.get('isin', f"desc:{security.get('description', '')}")
            merged[key] = security
        
        # Process second list, merging duplicates
        for security in securities2:
            key = security.get('isin', f"desc:{security.get('description', '')}")
            
            if key in merged:
                # Merge with existing security
                merged[key] = merge_security_dicts(merged[key], security)
            else:
                # Add new security
                merged[key] = security
        
        return list(merged.values())
    
    def _parse_numeric(self, text):
        """Parse numeric value from text."""
        if text is None:
            return None
            
        if isinstance(text, (int, float)):
            return float(text)
            
        if not isinstance(text, str):
            text = str(text)
            
        # Remove non-numeric characters except decimal point
        cleaned = re.sub(r'[^\d.\-]', '', text.replace(',', '.'))
        
        try:
            return float(cleaned)
        except ValueError:
            # Try to find the first number in the string
            match = re.search(r'(-?\d+\.?\d*)', cleaned)
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    return None
            return None


def main():
    """Main function for testing the ML-enhanced Securities Extractor prototype."""
    # Find a financial PDF file for testing
    pdf_path = None
    test_filenames = ['messos.pdf', 'sample.pdf', 'test_document.pdf', 'sample_portfolio.pdf']
    
    for filename in test_filenames:
        for root, dirs, files in os.walk('.'):
            if filename in files:
                pdf_path = os.path.join(root, file)
                break
        if pdf_path:
            break
    
    if not pdf_path:
        print("Could not find a financial PDF file for testing. Please provide the path:")
        pdf_path = input("> ")
    
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('ml_extractor_prototype.log'),
            logging.StreamHandler()
        ]
    )
    
    # Extract securities using ML extractor prototype
    extractor = MLSecurityExtractorPrototype(debug=True)
    print(f"\nExtracting securities from {pdf_path}...")
    result = extractor.extract_from_pdf(pdf_path)
    
    # Save results
    output_path = 'ml_extraction_prototype_results.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to {output_path}")
    
    # Print summary
    print("\nExtraction Summary:")
    print(f"Document Type: {result['document_type']}")
    print(f"Extraction Method: {result.get('extraction_method', 'ml_prototype')}")
    print(f"Securities Found: {len(result.get('securities', []))}")
    
    if 'ml_confidence' in result:
        print("\nConfidence Scores:")
        for key, value in result['ml_confidence'].items():
            print(f"  {key}: {value:.2f}")
    
    if result.get('securities'):
        print("\nSample Securities:")
        for i, security in enumerate(result['securities'][:3]):  # Show first 3
            print(f"\nSecurity {i+1}:")
            print(f"  ISIN: {security.get('isin', 'N/A')}")
            print(f"  Description: {security.get('description', 'N/A')}")
            print(f"  Quantity: {security.get('nominal', 'N/A')}")
            print(f"  Price: {security.get('price', 'N/A')}")
            print(f"  Value: {security.get('value', 'N/A')}")
            print(f"  Currency: {security.get('currency', 'N/A')}")
            print(f"  Confidence: {security.get('extraction_confidence', 'N/A')}")
            
            if 'validation_issues' in security:
                print(f"  Validation Issues: {', '.join(security['validation_issues'])}")
    
    print("\nSee ml_extraction_prototype_results.json for full results")


if __name__ == "__main__":
    main()