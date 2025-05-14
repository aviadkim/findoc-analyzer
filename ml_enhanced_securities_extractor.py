"""
ML-Enhanced Securities Extractor

This module provides an enhanced securities extractor that leverages machine learning
models to improve extraction accuracy, robustness, and adaptability.

It builds upon the existing rule-based extractor while adding ML capabilities for:
- Document type classification
- Security entity recognition
- Table structure analysis
- Relationship extraction
- Validation and error correction
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
import torch
from torch import nn
import pickle
from dataclasses import dataclass
from collections import defaultdict

# Import the existing extractor for integration
try:
    from enhanced_securities_extractor import SecurityExtractor as RuleBasedExtractor
    from securities_extraction_monitor import track_extraction_performance
    from securities_reference_db import SecuritiesReferenceDB
    from enhanced_securities_formats import (
        DOCUMENT_TYPE_PATTERNS,
        DOCUMENT_CURRENCY_MAP,
        EXTRACTION_FUNCTIONS,
        detect_document_format
    )
except ImportError:
    # Stubs for when imports are not available
    track_extraction_performance = lambda func: func  # Simple decorator stub
    
    class RuleBasedExtractor:
        def __init__(self, *args, **kwargs):
            self.debug = kwargs.get('debug', False)
            
        def extract_from_pdf(self, pdf_path):
            return {"document_type": "unknown", "securities": [], "error": "Rule-based extractor not available"}
    
    class SecuritiesReferenceDB:
        def __init__(self):
            pass
        def get_name_by_isin(self, isin):
            return None
        def normalize_security_name(self, name):
            return name
        def validate_isin(self, isin):
            return True
        def find_best_match_for_name(self, name):
            return None
        def detect_security_type(self, description):
            return None
    
    DOCUMENT_TYPE_PATTERNS = {}
    DOCUMENT_CURRENCY_MAP = {}
    EXTRACTION_FUNCTIONS = {}
    
    def detect_document_format(text):
        return None

# Set up logging
logger = logging.getLogger('ml_securities_extractor')
logger.setLevel(logging.INFO)

# Create console handler if not already set up
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

# Document types supported by the ML model
DOCUMENT_TYPES = [
    'messos', 'bofa', 'ubs', 'db', 'ms', 'interactive_brokers', 
    'schwab', 'vanguard', 'fidelity', 'tdameritrade', 'etrade', 'generic'
]

# Entity types for NER model
ENTITY_TYPES = [
    'ISIN', 'CUSIP', 'SEDOL', 'SECURITY_NAME', 'QUANTITY', 
    'PRICE', 'VALUE', 'CURRENCY', 'PERCENTAGE', 'DATE'
]

# Features used for document classification
DOCUMENT_FEATURES = [
    'text_length', 'has_isin', 'has_cusip', 'has_tables',
    'table_count', 'securities_keyword_count', 'investment_keyword_count',
    'banking_keyword_count', 'date_count', 'currency_symbol_count',
    'percentage_count', 'number_count'
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
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Entity':
        """Create entity from dictionary."""
        return cls(
            text=data['text'],
            start=data['start'],
            end=data['end'],
            label=data['label'],
            confidence=data['confidence'],
            page=data.get('page', 0)
        )

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
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Relationship':
        """Create relationship from dictionary."""
        return cls(
            source=Entity.from_dict(data['source']) if isinstance(data['source'], dict) else data['source'],
            target=Entity.from_dict(data['target']) if isinstance(data['target'], dict) else data['target'],
            relation_type=data['relation_type'],
            confidence=data['confidence']
        )

class DocumentTypeClassifier:
    """ML model for document type classification."""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the document type classifier.
        
        Args:
            model_path: Path to the saved model file
        """
        self.model = None
        self.feature_extractor = None
        self.vectorizer = None
        self.label_encoder = None
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            logger.warning("No model path provided or model not found. Using default classifier.")
            self._init_default_model()
    
    def _init_default_model(self):
        """Initialize a simple default model when no trained model is available."""
        # This is a placeholder that will use regex patterns as fallback
        # In a real implementation, we would train a proper model
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
    
    def load_model(self, model_path: str):
        """
        Load the model and associated artifacts.
        
        Args:
            model_path: Path to the saved model file
        """
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data['model']
            self.vectorizer = model_data.get('vectorizer')
            self.label_encoder = model_data.get('label_encoder')
            self.feature_extractor = model_data.get('feature_extractor')
            
            logger.info(f"Successfully loaded document type classifier from {model_path}")
        except Exception as e:
            logger.error(f"Error loading document type classifier: {e}")
            self._init_default_model()
    
    def save_model(self, model_path: str):
        """
        Save the model and associated artifacts.
        
        Args:
            model_path: Path to save the model file
        """
        if not self.model:
            logger.error("No model to save")
            return False
        
        try:
            os.makedirs(os.path.dirname(os.path.abspath(model_path)), exist_ok=True)
            
            model_data = {
                'model': self.model,
                'vectorizer': self.vectorizer,
                'label_encoder': self.label_encoder,
                'feature_extractor': self.feature_extractor
            }
            
            with open(model_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            logger.info(f"Successfully saved document type classifier to {model_path}")
            return True
        except Exception as e:
            logger.error(f"Error saving document type classifier: {e}")
            return False
    
    def extract_features(self, text: str) -> Dict[str, float]:
        """
        Extract features for document classification from text.
        
        Args:
            text: Document text
            
        Returns:
            Dictionary of features
        """
        features = {}
        
        # Basic text statistics
        features['text_length'] = len(text)
        
        # Identifier presence
        features['has_isin'] = 1 if re.search(r'[A-Z]{2}[A-Z0-9]{9}[0-9]', text) else 0
        features['has_cusip'] = 1 if re.search(r'[0-9A-Z]{9}', text) else 0
        
        # Keyword counts
        features['securities_keyword_count'] = sum(1 for keyword in ['securities', 'stocks', 'bonds', 'equities', 'etf', 'fund', 'portfolio'] if keyword.lower() in text.lower())
        features['investment_keyword_count'] = sum(1 for keyword in ['investment', 'investor', 'holdings', 'asset', 'allocation', 'performance'] if keyword.lower() in text.lower())
        features['banking_keyword_count'] = sum(1 for keyword in ['bank', 'account', 'statement', 'balance', 'transfer', 'deposit'] if keyword.lower() in text.lower())
        
        # Pattern counts
        features['date_count'] = len(re.findall(r'\d{1,2}[./]\d{1,2}[./]\d{2,4}', text))
        features['currency_symbol_count'] = len(re.findall(r'[$€£¥]', text))
        features['percentage_count'] = len(re.findall(r'\d+\.?\d*\s*%', text))
        features['number_count'] = len(re.findall(r'\b\d+[\.,]\d+\b', text))
        
        return features
    
    def predict(self, text: str, tables: Optional[List[Any]] = None) -> Tuple[str, float]:
        """
        Predict the document type.
        
        Args:
            text: Document text
            tables: List of extracted tables (optional)
            
        Returns:
            Tuple of (document_type, confidence)
        """
        if self.model:
            # If we have a trained model, use it
            try:
                # Extract features
                features = self.extract_features(text)
                
                # Add table features if available
                if tables:
                    features['table_count'] = len(tables)
                    features['has_tables'] = 1 if tables else 0
                else:
                    features['table_count'] = 0
                    features['has_tables'] = 0
                
                # Convert features to the format expected by the model
                if self.vectorizer:
                    feature_vector = self.vectorizer.transform([features])
                else:
                    # If no vectorizer, assume the model can handle the dictionary
                    feature_vector = np.array([[features[f] for f in DOCUMENT_FEATURES]])
                
                # Make prediction
                if hasattr(self.model, 'predict_proba'):
                    # Get probability scores if available
                    probs = self.model.predict_proba(feature_vector)[0]
                    pred_idx = np.argmax(probs)
                    confidence = probs[pred_idx]
                    if self.label_encoder:
                        document_type = self.label_encoder.inverse_transform([pred_idx])[0]
                    else:
                        document_type = DOCUMENT_TYPES[pred_idx]
                else:
                    # Otherwise just get the class prediction
                    pred_idx = self.model.predict(feature_vector)[0]
                    if self.label_encoder:
                        document_type = self.label_encoder.inverse_transform([pred_idx])[0]
                    else:
                        document_type = DOCUMENT_TYPES[pred_idx]
                    confidence = 0.8  # Default confidence when no probabilities
                
                return document_type, confidence
                
            except Exception as e:
                logger.error(f"Error making model prediction: {e}")
                # Fall through to pattern-based backup
        
        # Fallback to pattern-based detection
        for doc_type, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return doc_type, 0.9  # High confidence for exact pattern match
        
        # If no patterns match, try the existing detection function
        try:
            enhanced_format = detect_document_format(text)
            if enhanced_format:
                return enhanced_format, 0.8
        except Exception:
            pass
        
        # Default to generic with low confidence
        return "generic", 0.3

class SecurityEntityRecognizer:
    """ML model for named entity recognition of securities information."""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the security entity recognizer.
        
        Args:
            model_path: Path to the saved model file
        """
        self.model = None
        self.tokenizer = None
        self.config = None
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            logger.warning("No model path provided or model not found. Using pattern-based entity recognition.")
            self._init_default_patterns()
    
    def _init_default_patterns(self):
        """Initialize default regex patterns for entity recognition."""
        self.patterns = {
            'ISIN': r'[A-Z]{2}[A-Z0-9]{9}[0-9]',
            'CUSIP': r'[0-9A-Z]{9}',
            'SEDOL': r'[0-9A-Z]{7}',
            'SECURITY_NAME': r'([A-Z][A-Za-z0-9\s\.\&\-]+(?:Corp|Inc|Ltd|LLC|SA|AG|NV|ETF|Fund|Trust|PLC|Group|Holding|Tech|Co))',
            'QUANTITY': r'(\d+[\.,\']?\d*[\.,\']?\d*)\s*(?:shares|units|bonds|stocks|pieces)',
            'PRICE': r'(?:Price|Rate):\s*[$€£]?\s*(\d+[\.,]?\d*[\.,]?\d*)',
            'VALUE': r'(?:Value|Worth|Total|Amount):\s*[$€£]?\s*(\d+[\.,]?\d*[\.,]?\d*[\.,]?\d*)',
            'CURRENCY': r'\b(USD|EUR|CHF|GBP|JPY|CAD|AUD|HKD)\b',
            'PERCENTAGE': r'(\d+\.?\d*\s*%)',
            'DATE': r'(\d{1,2}[./]\d{1,2}[./]\d{2,4})'
        }
    
    def load_model(self, model_path: str):
        """
        Load the NER model and associated artifacts.
        
        Args:
            model_path: Path to the saved model file
        """
        try:
            # In a real implementation, we would load a PyTorch/TensorFlow model
            # Here we'll just check if the file exists and initialize a placeholder
            if os.path.exists(model_path):
                logger.info(f"Found model at {model_path}, would load real model here")
            else:
                logger.warning(f"Model file {model_path} not found")
            
            # Initialize default patterns as fallback
            self._init_default_patterns()
            
        except Exception as e:
            logger.error(f"Error loading security entity recognizer: {e}")
            self._init_default_patterns()
    
    def predict(self, text: str, page_num: int = 0) -> List[Entity]:
        """
        Predict entities in the text.
        
        Args:
            text: Document text
            page_num: Page number in the document
            
        Returns:
            List of Entity objects
        """
        entities = []
        
        if self.model:
            # If we have a trained model, we would use it here
            # This is a placeholder for where the actual model inference would go
            logger.info("Would use trained NER model here if available")
        
        # Fallback to regex pattern matching
        for entity_type, pattern in self.patterns.items():
            for match in re.finditer(pattern, text):
                entities.append(Entity(
                    text=match.group(0),
                    start=match.start(),
                    end=match.end(),
                    label=entity_type,
                    confidence=0.8,  # Default confidence for pattern matches
                    page=page_num
                ))
        
        return entities

class TableStructureAnalyzer:
    """ML model for analyzing table structures in documents."""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the table structure analyzer.
        
        Args:
            model_path: Path to the saved model file
        """
        self.model = None
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            logger.warning("No model path provided or model not found. Using heuristic table analysis.")
    
    def load_model(self, model_path: str):
        """
        Load the table analysis model.
        
        Args:
            model_path: Path to the saved model file
        """
        # Placeholder for model loading
        logger.info(f"Would load table analysis model from {model_path}")
    
    def analyze_table(self, table) -> Dict[str, Any]:
        """
        Analyze a table to identify column meanings and structure.
        
        Args:
            table: Extracted table (e.g., camelot Table object)
            
        Returns:
            Dictionary with table structure information
        """
        # Placeholder implementation using heuristics
        result = {
            'column_types': {},
            'is_securities_table': False,
            'has_header': False,
            'header_row': None,
            'data_rows': [],
            'confidence': 0.0
        }
        
        try:
            # Convert to pandas dataframe if not already
            if hasattr(table, 'df'):
                df = table.df
            else:
                df = pd.DataFrame(table)
            
            # Check if empty
            if df.empty:
                return result
            
            # Check if this is likely a securities table
            table_text = ' '.join([' '.join(str(cell) for cell in row) for row in df.values.tolist()])
            
            # Check for securities-related keywords
            security_keywords = ['ISIN', 'Security', 'Quantity', 'Price', 'Value', 'Currency', 'Bond', 'Stock', 'Share', 'Fund']
            keyword_count = sum(1 for keyword in security_keywords if keyword in table_text)
            
            # Look for ISIN patterns
            isin_matches = re.findall(r'[A-Z]{2}[A-Z0-9]{9}[0-9]', table_text)
            
            # Determine if this is likely a securities table
            result['is_securities_table'] = len(isin_matches) > 0 or keyword_count >= 2
            
            if result['is_securities_table']:
                result['confidence'] = min(0.5 + 0.1 * keyword_count + 0.2 * len(isin_matches), 0.95)
                
                # Try to identify header row
                for i, row in enumerate(df.values.tolist()):
                    row_text = ' '.join(str(cell) for cell in row)
                    header_keywords = sum(1 for keyword in ['ISIN', 'Security', 'Description', 'Quantity', 'Price', 'Value'] if keyword in row_text)
                    if header_keywords >= 2:
                        result['has_header'] = True
                        result['header_row'] = i
                        break
                
                # If no header found, assume first row
                if result['header_row'] is None:
                    result['header_row'] = 0
                
                # Determine data rows
                result['data_rows'] = list(range(result['header_row'] + 1, len(df)))
                
                # Try to identify column types
                if result['has_header']:
                    header = df.iloc[result['header_row']].tolist()
                    for i, col_name in enumerate(header):
                        col_name_str = str(col_name).lower()
                        if 'isin' in col_name_str:
                            result['column_types'][i] = 'ISIN'
                        elif any(x in col_name_str for x in ['security', 'description', 'name']):
                            result['column_types'][i] = 'SECURITY_NAME'
                        elif any(x in col_name_str for x in ['quantity', 'amount', 'shares', 'units']):
                            result['column_types'][i] = 'QUANTITY'
                        elif 'price' in col_name_str:
                            result['column_types'][i] = 'PRICE'
                        elif any(x in col_name_str for x in ['value', 'total', 'worth']):
                            result['column_types'][i] = 'VALUE'
                        elif any(x in col_name_str for x in ['currency', 'ccy']):
                            result['column_types'][i] = 'CURRENCY'
                        elif any(x in col_name_str for x in ['date', 'maturity']):
                            result['column_types'][i] = 'DATE'
                
                # If no header or couldn't identify columns, try to infer from data
                if not result['column_types']:
                    # Analyze data columns to guess types
                    for i in range(df.shape[1]):
                        col_data = df.iloc[result['data_rows'], i].astype(str).tolist()
                        col_text = ' '.join(col_data)
                        
                        # Check for patterns
                        isin_count = sum(1 for cell in col_data if re.match(r'[A-Z]{2}[A-Z0-9]{9}[0-9]', str(cell)))
                        name_count = sum(1 for cell in col_data if len(str(cell)) > 10 and not str(cell).isdigit())
                        number_count = sum(1 for cell in col_data if re.match(r'\d+\.?\d*', str(cell)))
                        currency_count = sum(1 for cell in col_data if re.search(r'\b(USD|EUR|CHF|GBP)\b', str(cell)))
                        date_count = sum(1 for cell in col_data if re.match(r'\d{1,2}[./]\d{1,2}[./]\d{2,4}', str(cell)))
                        
                        # Assign column type based on the most frequent pattern
                        max_count = max(isin_count, name_count, number_count, currency_count, date_count)
                        if max_count > 0:
                            if isin_count == max_count:
                                result['column_types'][i] = 'ISIN'
                            elif name_count == max_count:
                                result['column_types'][i] = 'SECURITY_NAME'
                            elif currency_count == max_count:
                                result['column_types'][i] = 'CURRENCY'
                            elif date_count == max_count:
                                result['column_types'][i] = 'DATE'
                            elif number_count == max_count:
                                # Distinguish between quantity, price, value based on magnitude
                                # (very rough heuristic)
                                try:
                                    values = [float(re.sub(r'[^\d.]', '', str(cell))) for cell in col_data 
                                              if re.match(r'\d+\.?\d*', str(cell))]
                                    if values:
                                        avg_value = sum(values) / len(values)
                                        if avg_value < 1000:
                                            result['column_types'][i] = 'PRICE'
                                        elif avg_value < 10000:
                                            result['column_types'][i] = 'QUANTITY'
                                        else:
                                            result['column_types'][i] = 'VALUE'
                                except:
                                    result['column_types'][i] = 'NUMBER'
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing table: {e}")
            return result

class RelationshipExtractor:
    """ML model for extracting relationships between entities."""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the relationship extractor.
        
        Args:
            model_path: Path to the saved model file
        """
        self.model = None
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            logger.warning("No model path provided or model not found. Using rule-based relationship extraction.")
    
    def load_model(self, model_path: str):
        """
        Load the relationship extraction model.
        
        Args:
            model_path: Path to the saved model file
        """
        # Placeholder for model loading
        logger.info(f"Would load relationship extraction model from {model_path}")
    
    def extract_relationships(self, entities: List[Entity], text: str) -> List[Relationship]:
        """
        Extract relationships between entities.
        
        Args:
            entities: List of identified entities
            text: Document text
            
        Returns:
            List of Relationship objects
        """
        relationships = []
        
        # Group entities by type
        entity_by_type = defaultdict(list)
        for entity in entities:
            entity_by_type[entity.label].append(entity)
        
        # Find ISIN-SecurityName relationships based on proximity
        for isin_entity in entity_by_type.get('ISIN', []):
            # Find closest security name
            closest_name = None
            min_distance = float('inf')
            
            for name_entity in entity_by_type.get('SECURITY_NAME', []):
                # Skip if not on same page
                if isin_entity.page != name_entity.page:
                    continue
                
                # Calculate character distance
                distance = abs(isin_entity.start - name_entity.start)
                
                # Update if closer
                if distance < min_distance:
                    min_distance = distance
                    closest_name = name_entity
            
            # Add relationship if found and reasonably close
            if closest_name and min_distance < 500:  # Arbitrary threshold
                confidence = max(0.3, 1.0 - min_distance / 1000)  # Higher confidence for closer entities
                relationships.append(Relationship(
                    source=isin_entity,
                    target=closest_name,
                    relation_type='has_name',
                    confidence=confidence
                ))
        
        # Find ISIN-Quantity, ISIN-Price, ISIN-Value relationships
        for relation_type, target_type in [
            ('has_quantity', 'QUANTITY'), 
            ('has_price', 'PRICE'), 
            ('has_value', 'VALUE')
        ]:
            for isin_entity in entity_by_type.get('ISIN', []):
                closest_entity = None
                min_distance = float('inf')
                
                # Try to find the closest entity of the target type
                for target_entity in entity_by_type.get(target_type, []):
                    # Skip if not on same page
                    if isin_entity.page != target_entity.page:
                        continue
                    
                    # Calculate distance
                    distance = abs(isin_entity.start - target_entity.start)
                    
                    # Update if closer
                    if distance < min_distance:
                        min_distance = distance
                        closest_entity = target_entity
                
                # Add relationship if found and reasonably close
                if closest_entity and min_distance < 1000:  # Arbitrary threshold
                    confidence = max(0.3, 1.0 - min_distance / 2000)  # Higher confidence for closer entities
                    relationships.append(Relationship(
                        source=isin_entity,
                        target=closest_entity,
                        relation_type=relation_type,
                        confidence=confidence
                    ))
        
        return relationships

class ValidationModel:
    """Model for validating and correcting extracted securities information."""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the validation model.
        
        Args:
            model_path: Path to the saved model file
        """
        self.model = None
        self.rules = []
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            logger.warning("No model path provided or model not found. Using rule-based validation.")
            self._init_default_rules()
    
    def _init_default_rules(self):
        """Initialize default validation rules."""
        self.rules = [
            # Rule: ISIN format validation
            lambda security: ('isin_valid', 
                             re.match(r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$', security.get('isin', '')), 
                             'Invalid ISIN format'),
            
            # Rule: Check quantity is numeric
            lambda security: ('quantity_valid', 
                             isinstance(security.get('nominal'), (int, float)) or 
                             (isinstance(security.get('nominal'), str) and 
                              re.match(r'^\d+\.?\d*$', security.get('nominal', ''))), 
                             'Invalid quantity format'),
            
            # Rule: Check price is numeric
            lambda security: ('price_valid', 
                             isinstance(security.get('price'), (int, float)) or 
                             (isinstance(security.get('price'), str) and 
                              re.match(r'^\d+\.?\d*$', security.get('price', ''))), 
                             'Invalid price format'),
            
            # Rule: Check value is numeric
            lambda security: ('value_valid', 
                             isinstance(security.get('value'), (int, float)) or 
                             (isinstance(security.get('value'), str) and 
                              re.match(r'^\d+\.?\d*$', security.get('value', ''))), 
                             'Invalid value format'),
            
            # Rule: Value should be approx quantity * price
            lambda security: ('value_validation', 
                             not (isinstance(security.get('nominal'), (int, float)) and 
                                  isinstance(security.get('price'), (int, float)) and 
                                  isinstance(security.get('value'), (int, float))) or 
                             abs(security.get('nominal', 0) * security.get('price', 0) - 
                                 security.get('value', 0)) / max(security.get('value', 1), 1) < 0.2, 
                             'Value inconsistent with quantity and price'),
            
            # Rule: ISIN country code should be valid
            lambda security: ('isin_country_valid', 
                             not security.get('isin') or 
                             security.get('isin', '')[:2] in 
                             ['US', 'GB', 'DE', 'FR', 'CH', 'JP', 'CA', 'AU', 'ES', 'IT', 
                              'NL', 'SE', 'NO', 'DK', 'FI', 'BE', 'AT', 'BR', 'CN', 'HK', 
                              'IE', 'LU', 'SG', 'ZA', 'KR', 'TW', 'IN', 'RU', 'IL', 'KY', 
                              'MX', 'PT', 'ID', 'MY', 'TH', 'PH', 'GR', 'TR', 'AE', 'SA', 
                              'QA', 'NZ', 'CL', 'CO', 'AR', 'PE', 'IS', 'VG', 'BM'], 
                             'Invalid ISIN country code'),
        ]
    
    def load_model(self, model_path: str):
        """
        Load the validation model.
        
        Args:
            model_path: Path to the saved model file
        """
        # Placeholder for model loading
        logger.info(f"Would load validation model from {model_path}")
        
        # Initialize default rules as fallback
        self._init_default_rules()
    
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
        for rule in self.rules:
            rule_name, rule_result, rule_message = rule(security)
            rule_results[rule_name] = rule_result
            if not rule_result:
                issues.append(rule_message)
        
        # Calculate validity and confidence
        is_valid = len(issues) <= 3  # Allow a few issues
        
        # Calculate confidence based on rule results
        # More passed rules = higher confidence
        passed_rules = sum(1 for result in rule_results.values() if result)
        total_rules = len(rule_results)
        confidence = passed_rules / max(total_rules, 1)
        
        # Adjust confidence based on data completeness
        key_fields = ['isin', 'description', 'nominal', 'price', 'value']
        completeness = sum(1 for field in key_fields if field in security and security[field]) / len(key_fields)
        confidence *= 0.7 + 0.3 * completeness  # Scale completeness impact
        
        return is_valid, confidence, issues
    
    def correct_security(self, security: Dict[str, Any]) -> Dict[str, Any]:
        """
        Attempt to correct issues in a security.
        
        Args:
            security: Dictionary with security information
            
        Returns:
            Corrected security dictionary
        """
        corrected = security.copy()
        
        try:
            # Ensure nominal/price/value are numeric
            for field in ['nominal', 'price', 'value']:
                if field in corrected and corrected[field] is not None:
                    if isinstance(corrected[field], str):
                        # Clean the string and convert to float
                        clean_value = re.sub(r'[^\d.]', '', corrected[field])
                        try:
                            corrected[field] = float(clean_value) if clean_value else None
                        except ValueError:
                            corrected[field] = None
            
            # Calculate missing values
            if corrected.get('nominal') is not None and corrected.get('price') is not None and corrected.get('value') is None:
                corrected['value'] = corrected['nominal'] * corrected['price']
                
            elif corrected.get('nominal') is not None and corrected.get('price') is None and corrected.get('value') is not None:
                corrected['price'] = corrected['value'] / corrected['nominal'] if corrected['nominal'] else None
                
            elif corrected.get('nominal') is None and corrected.get('price') is not None and corrected.get('value') is not None:
                corrected['nominal'] = corrected['value'] / corrected['price'] if corrected['price'] else None
            
            # Cross-check value calculation
            if corrected.get('nominal') is not None and corrected.get('price') is not None and corrected.get('value') is not None:
                calculated_value = corrected['nominal'] * corrected['price']
                actual_value = corrected['value']
                
                # If there's a significant discrepancy, adjust based on confidence
                if actual_value != 0:
                    discrepancy_ratio = calculated_value / actual_value
                    
                    # If the discrepancy is large, prefer the calculated value
                    if discrepancy_ratio > 10 or discrepancy_ratio < 0.1:
                        corrected['value'] = calculated_value
                        corrected['value_corrected'] = True
            
            # Clean up ISIN if needed
            if 'isin' in corrected and corrected['isin']:
                # Remove any spaces or special characters
                corrected['isin'] = re.sub(r'[^A-Z0-9]', '', corrected['isin'].upper())
                
                # Ensure it matches ISIN format
                if not re.match(r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$', corrected['isin']):
                    corrected['isin_invalid'] = True
            
            return corrected
            
        except Exception as e:
            logger.error(f"Error correcting security: {e}")
            return security

class MLSecurityExtractor:
    """
    ML-enhanced securities extractor that combines ML models with rule-based extraction.
    """
    
    def __init__(self, model_dir: Optional[str] = None, debug: bool = False, 
                 reference_db_path: Optional[str] = None, log_level: str = "INFO"):
        """
        Initialize the ML-enhanced securities extractor.
        
        Args:
            model_dir: Directory containing ML models
            debug: Whether to print debug information
            reference_db_path: Path to securities reference database
            log_level: Logging level
        """
        self.debug = debug
        
        # Configure logging
        numeric_level = getattr(logging, log_level.upper(), None)
        if not isinstance(numeric_level, int):
            numeric_level = logging.INFO
        logger.setLevel(numeric_level)
        
        # Initialize rule-based extractor as fallback
        self.rule_based_extractor = RuleBasedExtractor(debug=debug, reference_db_path=reference_db_path, log_level=log_level)
        
        # Initialize ML models
        if model_dir and os.path.exists(model_dir):
            self.document_classifier = DocumentTypeClassifier(os.path.join(model_dir, 'document_classifier.pkl'))
            self.entity_recognizer = SecurityEntityRecognizer(os.path.join(model_dir, 'entity_recognizer.pkl'))
            self.table_analyzer = TableStructureAnalyzer(os.path.join(model_dir, 'table_analyzer.pkl'))
            self.relationship_extractor = RelationshipExtractor(os.path.join(model_dir, 'relationship_extractor.pkl'))
            self.validation_model = ValidationModel(os.path.join(model_dir, 'validation_model.pkl'))
        else:
            logger.warning(f"Model directory not provided or not found: {model_dir}")
            self.document_classifier = DocumentTypeClassifier()
            self.entity_recognizer = SecurityEntityRecognizer()
            self.table_analyzer = TableStructureAnalyzer()
            self.relationship_extractor = RelationshipExtractor()
            self.validation_model = ValidationModel()
        
        # Initialize securities reference database
        self.securities_db = SecuritiesReferenceDB()
        if reference_db_path and os.path.exists(reference_db_path):
            self.securities_db.load_from_file(reference_db_path)
            logger.info(f"Loaded securities reference data from {reference_db_path}")
            if self.debug:
                print(f"Loaded securities reference data from {reference_db_path}")
    
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
            "extraction_method": "ml",
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
                print(f"Processing {pdf_path} with ML-enhanced extractor...")
            
            # Phase 1: Extract text and tables from PDF
            try:
                tables = camelot.read_pdf(
                    pdf_path,
                    pages='all',
                    flavor='stream',
                    suppress_stdout=True
                )
                
                # Convert to text
                all_text = ' '.join([' '.join([' '.join(cell) for cell in row]) for table in tables for row in table.df.values.tolist()])
                
            except Exception as e:
                logger.error(f"Error extracting text and tables from PDF: {str(e)}")
                default_result["error"] = f"Error extracting text and tables: {str(e)}"
                return default_result
            
            # Phase 2: Classify document type
            try:
                document_type, doc_type_confidence = self.document_classifier.predict(all_text, tables)
                default_result["document_type"] = document_type
                default_result["document_type_confidence"] = doc_type_confidence
                
                if self.debug:
                    print(f"Detected document type: {document_type} (confidence: {doc_type_confidence:.2f})")
                
            except Exception as e:
                logger.error(f"Error classifying document type: {str(e)}")
                # Continue with unknown document type
            
            # Phase 3: Extract document currency
            try:
                # Use rule-based extraction for currency detection
                currency = self.rule_based_extractor._get_document_currency(pdf_path, default_result["document_type"])
                default_result["currency"] = currency
                
                if self.debug:
                    print(f"Detected currency: {currency}")
                
            except Exception as e:
                logger.error(f"Error detecting currency: {str(e)}")
                # Use default currency based on document type
                doc_type_currency_map = {
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
                default_result["currency"] = doc_type_currency_map.get(document_type, "USD")
            
            # Phase 4: Extract entities from text
            try:
                entities = []
                for i, table in enumerate(tables):
                    # Extract text from table with page number
                    table_text = ' '.join([' '.join(cell) for row in table.df.values.tolist() for cell in row])
                    page_entities = self.entity_recognizer.predict(table_text, table.page)
                    entities.extend(page_entities)
                
                if self.debug:
                    print(f"Extracted {len(entities)} entities from text")
                
            except Exception as e:
                logger.error(f"Error extracting entities: {str(e)}")
                entities = []
            
            # Phase 5: Analyze table structures
            try:
                table_structures = []
                for i, table in enumerate(tables):
                    structure = self.table_analyzer.analyze_table(table)
                    structure['table_index'] = i
                    structure['page'] = table.page
                    table_structures.append(structure)
                
                # Identify securities tables
                securities_tables = [t for t in table_structures if t['is_securities_table']]
                
                if self.debug:
                    print(f"Found {len(securities_tables)} securities tables")
                
            except Exception as e:
                logger.error(f"Error analyzing table structures: {str(e)}")
                table_structures = []
                securities_tables = []
            
            # Phase 6: Extract relationships between entities
            try:
                relationships = self.relationship_extractor.extract_relationships(entities, all_text)
                
                if self.debug:
                    print(f"Extracted {len(relationships)} relationships between entities")
                
            except Exception as e:
                logger.error(f"Error extracting relationships: {str(e)}")
                relationships = []
            
            # Phase 7: Construct securities from entities and relationships
            try:
                securities = self._construct_securities_from_entities(entities, relationships, table_structures, default_result["currency"])
                
                if self.debug:
                    print(f"Constructed {len(securities)} securities from entities and relationships")
                
            except Exception as e:
                logger.error(f"Error constructing securities: {str(e)}")
                securities = []
            
            # Phase 8: Extract securities from tables directly
            try:
                table_securities = self._extract_securities_from_tables(tables, securities_tables, default_result["currency"])
                
                if self.debug:
                    print(f"Extracted {len(table_securities)} securities directly from tables")
                
            except Exception as e:
                logger.error(f"Error extracting securities from tables: {str(e)}")
                table_securities = []
            
            # Phase 9: Merge and validate securities from different sources
            try:
                # Combine securities from entity extraction and table extraction
                all_securities = self._merge_securities(securities, table_securities)
                
                # Validate and correct securities
                validated_securities = []
                for security in all_securities:
                    # Apply corrections
                    corrected_security = self.validation_model.correct_security(security)
                    
                    # Validate
                    is_valid, confidence, issues = self.validation_model.validate_security(corrected_security)
                    
                    # Add validation information
                    corrected_security['validation_confidence'] = confidence
                    if issues:
                        corrected_security['validation_issues'] = issues
                    
                    # Keep if valid or has minimal data
                    if is_valid or (
                        corrected_security.get('isin') and 
                        (corrected_security.get('description') or corrected_security.get('name'))
                    ):
                        validated_securities.append(corrected_security)
                
                if self.debug:
                    print(f"Validated and merged {len(validated_securities)} securities")
                
                default_result["securities"] = validated_securities
                
            except Exception as e:
                logger.error(f"Error validating and merging securities: {str(e)}")
                default_result["securities"] = securities + table_securities
            
            # Phase 10: Fallback to rule-based extraction if we found few or no securities
            if len(default_result["securities"]) < 2:
                try:
                    if self.debug:
                        print("Few securities found with ML, falling back to rule-based extraction")
                    
                    rule_based_result = self.rule_based_extractor.extract_from_pdf(pdf_path)
                    
                    if len(rule_based_result.get("securities", [])) > len(default_result["securities"]):
                        if self.debug:
                            print(f"Rule-based extraction found more securities: {len(rule_based_result['securities'])}")
                        
                        # Keep ML document type and currency if they were found
                        rule_based_result["document_type"] = default_result["document_type"]
                        rule_based_result["currency"] = default_result["currency"]
                        rule_based_result["extraction_method"] = "rule_based_fallback"
                        
                        return rule_based_result
                    
                except Exception as e:
                    logger.error(f"Error in rule-based fallback: {str(e)}")
            
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
    
    def _construct_securities_from_entities(self, entities: List[Entity], 
                                           relationships: List[Relationship],
                                           table_structures: List[Dict[str, Any]],
                                           default_currency: str) -> List[Dict[str, Any]]:
        """
        Construct securities from entities and their relationships.
        
        Args:
            entities: List of extracted entities
            relationships: List of entity relationships
            table_structures: List of table structure analyses
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
                'currency': default_currency
            }
            
            # Find related entities through relationships
            related_entities = []
            for relationship in relationships:
                if isinstance(relationship.source, Entity) and relationship.source.text == isin_entity.text:
                    related_entities.append((relationship.relation_type, relationship.target, relationship.confidence))
                elif isinstance(relationship.target, Entity) and relationship.target.text == isin_entity.text:
                    related_entities.append((f"inverse_{relationship.relation_type}", relationship.source, relationship.confidence))
            
            # Add related entity information to security
            for relation_type, entity, confidence in related_entities:
                if relation_type == 'has_name' and isinstance(entity, Entity):
                    security['description'] = entity.text
                elif relation_type == 'has_quantity' and isinstance(entity, Entity):
                    security['nominal'] = self._parse_numeric(entity.text)
                elif relation_type == 'has_price' and isinstance(entity, Entity):
                    security['price'] = self._parse_numeric(entity.text)
                elif relation_type == 'has_value' and isinstance(entity, Entity):
                    security['value'] = self._parse_numeric(entity.text)
            
            # Calculate missing values if possible
            if 'nominal' in security and 'price' in security and 'value' not in security:
                try:
                    security['value'] = security['nominal'] * security['price']
                    security['value_derived'] = True
                except:
                    pass
            
            # Lookup more information from the reference database
            try:
                if 'description' not in security:
                    security['description'] = self.securities_db.get_name_by_isin(security['isin'])
                
                if not security.get('description') and 'name' in security:
                    security['description'] = security['name']
                
                if not security.get('description'):
                    # Try to construct a description from related text
                    for entity in entities:
                        if entity.label == 'SECURITY_NAME' and abs(entity.start - isin_entity.start) < 500:
                            security['description'] = entity.text
                            break
                
                # Add security type if not already present
                if 'type' not in security and 'description' in security:
                    security['type'] = self.securities_db.detect_security_type(security['description'])
            except Exception as e:
                logger.error(f"Error enriching security with reference DB: {str(e)}")
            
            securities.append(security)
        
        return securities
    
    def _extract_securities_from_tables(self, tables, table_structures: List[Dict[str, Any]], 
                                       default_currency: str) -> List[Dict[str, Any]]:
        """
        Extract securities directly from table structures.
        
        Args:
            tables: List of extracted tables
            table_structures: List of table structure analyses
            default_currency: Default currency to use
            
        Returns:
            List of securities
        """
        securities = []
        
        # Process each table that was identified as a securities table
        for structure in table_structures:
            if not structure['is_securities_table']:
                continue
            
            table_idx = structure['table_index']
            if table_idx >= len(tables):
                continue
            
            table = tables[table_idx]
            df = table.df
            
            # Define column mappings
            column_mappings = structure['column_types']
            if not column_mappings:
                continue
            
            # Determine rows to process
            data_rows = structure['data_rows']
            if not data_rows:
                # If no data rows identified, use all rows except header if exists
                if structure['has_header'] and structure['header_row'] is not None:
                    data_rows = [i for i in range(len(df)) if i != structure['header_row']]
                else:
                    data_rows = list(range(len(df)))
            
            # Process each data row
            for row_idx in data_rows:
                if row_idx >= len(df):
                    continue
                
                row = df.iloc[row_idx].tolist()
                
                # Initialize security with default values
                security = {
                    'currency': default_currency,
                    'extraction_confidence': structure['confidence'],
                    'source': f"table_{table_idx}"
                }
                
                # Extract information based on column mappings
                for col_idx, col_type in column_mappings.items():
                    if col_idx >= len(row):
                        continue
                    
                    cell_value = row[col_idx]
                    if cell_value is None or cell_value == '':
                        continue
                    
                    cell_text = str(cell_value).strip()
                    
                    if col_type == 'ISIN':
                        # Clean ISIN
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
                    
                    elif col_type == 'DATE':
                        security['date'] = cell_text
                
                # Only include the security if it has minimum information
                if 'isin' in security or ('description' in security and any(k in security for k in ['nominal', 'price', 'value'])):
                    # Calculate missing values if possible
                    if 'nominal' in security and 'price' in security and 'value' not in security:
                        try:
                            security['value'] = security['nominal'] * security['price']
                            security['value_derived'] = True
                        except:
                            pass
                    
                    securities.append(security)
        
        return securities
    
    def _merge_securities(self, securities1: List[Dict[str, Any]], 
                         securities2: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Merge securities from different sources, removing duplicates.
        
        Args:
            securities1: First list of securities
            securities2: Second list of securities
            
        Returns:
            Merged list of securities
        """
        # Use ISIN as primary key for merging
        merged = {}
        
        # Helper function to merge two security dictionaries
        def merge_security_dicts(s1, s2):
            # Start with s1 and update with non-null values from s2
            result = s1.copy()
            
            for key, value in s2.items():
                if value is not None and (key not in result or result[key] is None):
                    result[key] = value
                elif key in result and result[key] is not None and value is not None:
                    # If both have values, use the one with higher confidence
                    if (key == 'extraction_confidence' or 
                        ('extraction_confidence' in s2 and 'extraction_confidence' in s1 and 
                         s2['extraction_confidence'] > s1['extraction_confidence'])):
                        result[key] = value
            
            # Update confidence to max of the two
            result['extraction_confidence'] = max(
                s1.get('extraction_confidence', 0),
                s2.get('extraction_confidence', 0)
            )
            
            # Add source information
            result['source'] = f"{s1.get('source', 'unknown')}+{s2.get('source', 'unknown')}"
            
            return result
        
        # Process first list
        for security in securities1:
            if 'isin' in security and security['isin']:
                merged[security['isin']] = security
            else:
                # No ISIN, use description as backup key
                desc_key = f"desc:{security.get('description', '')}"
                if desc_key not in merged:
                    merged[desc_key] = security
        
        # Process second list, merging duplicates
        for security in securities2:
            if 'isin' in security and security['isin']:
                if security['isin'] in merged:
                    # Merge with existing security
                    merged[security['isin']] = merge_security_dicts(merged[security['isin']], security)
                else:
                    # Add new security
                    merged[security['isin']] = security
            else:
                # No ISIN, use description as backup key
                desc_key = f"desc:{security.get('description', '')}"
                if desc_key in merged:
                    # Merge with existing security
                    merged[desc_key] = merge_security_dicts(merged[desc_key], security)
                else:
                    # Add new security
                    merged[desc_key] = security
        
        return list(merged.values())
    
    def _parse_numeric(self, text: str) -> Optional[float]:
        """
        Parse numeric value from text, handling various formats.
        
        Args:
            text: Text containing numeric value
            
        Returns:
            Parsed float value or None if parsing fails
        """
        if text is None:
            return None
        
        if isinstance(text, (int, float)):
            return float(text)
        
        if not isinstance(text, str):
            text = str(text)
        
        # Remove non-numeric characters except decimal point and minus sign
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

def configure_file_logging(log_file_path: str) -> None:
    """
    Configure file logging for the ML securities extractor.
    
    Args:
        log_file_path: Path to the log file
    """
    # Create file handler
    file_handler = logging.FileHandler(log_file_path)
    file_handler.setLevel(logging.DEBUG)  # Set to DEBUG to capture all logs
    
    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    
    # Add the handler to the logger
    logger.addHandler(file_handler)
    logger.info(f"File logging configured to {log_file_path}")

def main():
    """
    Main function for testing the ML-enhanced SecurityExtractor.
    """
    # Find the messos PDF file
    pdf_path = None
    for root, dirs, files in os.walk('.'):
        for file in files:
            if 'messos' in file.lower() and file.lower().endswith('.pdf'):
                pdf_path = os.path.join(root, file)
                break
        if pdf_path:
            break
    
    if not pdf_path:
        print("Could not find the messos PDF file. Please provide the path:")
        pdf_path = input("> ")
    
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return
    
    # Set up logging to file
    configure_file_logging('ml_securities_extraction.log')
    
    # Create model directory if it doesn't exist
    model_dir = 'models/securities_extraction'
    os.makedirs(model_dir, exist_ok=True)
    
    # Extract securities using ML extractor
    extractor = MLSecurityExtractor(model_dir=model_dir, debug=True, log_level="DEBUG")
    result = extractor.extract_from_pdf(pdf_path)
    
    # Save results
    output_path = 'messos_ml_enhanced.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"Saved results to {output_path}")
    
    # Print summary
    print("\nDocument Type:", result["document_type"])
    print("Extraction Method:", result.get("extraction_method", "ml"))
    
    if "securities" in result:
        print(f"\nFound {len(result['securities'])} securities")
        
        # Print first 3 securities as example
        for i, security in enumerate(result["securities"][:3]):
            print(f"\nSecurity {i+1}:")
            print(f"  ISIN: {security.get('isin', 'Unknown')}")
            print(f"  Description: {security.get('description', 'Unknown')}")
            print(f"  Type: {security.get('type', 'Unknown')}")
            print(f"  Nominal: {security.get('nominal', 'Unknown')}")
            print(f"  Value: {security.get('value', 'Unknown')}")
            print(f"  Currency: {security.get('currency', 'Unknown')}")
            print(f"  Confidence: {security.get('extraction_confidence', 'Unknown')}")
            if 'validation_issues' in security:
                print(f"  Validation Issues: {', '.join(security['validation_issues'])}")

if __name__ == "__main__":
    main()