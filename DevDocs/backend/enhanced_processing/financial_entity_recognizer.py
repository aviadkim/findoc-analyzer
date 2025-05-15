"""
Financial Entity Recognizer Module

This module provides specialized Named Entity Recognition (NER) for financial documents.
It identifies and extracts financial entities like ISINs, securities, amounts, currencies, etc.
"""

import re
import logging
from typing import List, Dict, Any, Set, Optional
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FinancialEntityRecognizer:
    """
    Specialized entity recognizer for financial documents.
    """
    
    def __init__(self):
        """Initialize the FinancialEntityRecognizer."""
        
        # Entity patterns
        self.patterns = {
            'isin': r'\b[A-Z]{2}[A-Z0-9]{9}[0-9]\b',
            'cusip': r'\b[0-9A-Z]{9}\b',
            'ticker': r'\b[A-Z]{1,5}\b(?=\s|$|:|\.|,)',
            'amount': r'(?:[\$€£¥])\s*[\d,]+(?:\.\d+)?|\d+(?:,\d{3})*(?:\.\d+)?\s*(?:USD|EUR|GBP|JPY|CHF|CAD|AUD|NZD)',
            'percentage': r'\d+(?:\.\d+)?\s*%',
            'date': r'\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2}',
            'phone': r'(?:\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}',
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        }
        
        # Standard financial entities for contextual recognition
        self.financial_entities = {
            'security_types': [
                'stock', 'share', 'bond', 'etf', 'fund', 'treasury', 'note', 'bill', 
                'option', 'future', 'swap', 'warrant', 'certificate', 'deposit',
                'mutual fund', 'index fund', 'hedge fund', 'reit'
            ],
            'financial_terms': [
                'dividend', 'yield', 'interest', 'coupon', 'maturity', 'principal',
                'nav', 'asset', 'equity', 'debt', 'credit', 'debit', 'balance',
                'portfolio', 'investment', 'return', 'capital', 'income', 'expense',
                'gain', 'loss', 'profit', 'liability', 'asset', 'allocation'
            ],
            'currencies': [
                'usd', 'eur', 'gbp', 'jpy', 'chf', 'cad', 'aud', 'nzd', 'dollar',
                'euro', 'pound', 'yen', 'franc', 'krona', 'peso', 'rupee', 'yuan',
                'won', 'rand', 'real', 'lira', 'rupi', 'dinar', 'dirham'
            ],
            'companies': [
                'inc', 'corp', 'corporation', 'llc', 'ltd', 'limited', 'group',
                'holdings', 'plc', 'ag', 'sa', 'nv', 'co', 'company', 'trust',
                'partners', 'lp', 'gmbh', 'bank', 'capital', 'asset management'
            ]
        }
        
        # Compile regexes for better performance
        self.compiled_patterns = {name: re.compile(pattern) for name, pattern in self.patterns.items()}
        
        # For security name detection
        self.company_pattern = re.compile(r'([A-Z][A-Za-z0-9\s\.\&\-]+(?:' + '|'.join(self.financial_entities['companies']) + r'))', re.IGNORECASE)
        
        logger.info("Initialized FinancialEntityRecognizer")
    
    def recognize_entities(self, text: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Recognize financial entities in text.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with entity types and their occurrences
        """
        # Initialize results
        results = defaultdict(list)
        
        # Skip if text is empty
        if not text:
            return dict(results)
        
        # Track entity positions to avoid duplicates
        positions = set()
        
        # Extract pattern-based entities
        for entity_type, pattern in self.compiled_patterns.items():
            for match in pattern.finditer(text):
                start, end = match.span()
                
                # Skip if we already found an entity at this position
                position_key = (start, end)
                if position_key in positions:
                    continue
                
                # Add to results
                entity_text = match.group(0)
                
                # Validate entity based on type
                if entity_type == 'isin' and not self._validate_isin(entity_text):
                    continue
                
                if entity_type == 'cusip' and not self._validate_cusip(entity_text):
                    continue
                
                if entity_type == 'ticker' and entity_text.lower() in self.financial_entities['currencies']:
                    # Skip currency codes that might be mistaken for tickers
                    continue
                
                # Add to results
                results[entity_type].append({
                    'text': entity_text,
                    'start': start,
                    'end': end,
                    'confidence': 0.9  # High confidence for pattern matches
                })
                
                # Mark position as used
                positions.add(position_key)
        
        # Extract security names
        security_names = self._extract_security_names(text)
        for name_info in security_names:
            # Check if position overlaps with existing entities
            overlap = False
            for start, end in positions:
                if (name_info['start'] <= end and name_info['end'] >= start):
                    overlap = True
                    break
            
            # Add if no overlap
            if not overlap:
                results['security_name'].append(name_info)
                positions.add((name_info['start'], name_info['end']))
        
        # Extract financial metrics (context-based entities)
        metrics = self._extract_financial_metrics(text)
        for metric_type, metric_infos in metrics.items():
            for metric_info in metric_infos:
                # Check for overlap
                overlap = False
                for start, end in positions:
                    if (metric_info['start'] <= end and metric_info['end'] >= start):
                        overlap = True
                        break
                
                # Add if no overlap
                if not overlap:
                    results[metric_type].append(metric_info)
                    positions.add((metric_info['start'], metric_info['end']))
        
        return dict(results)
    
    def _validate_isin(self, isin: str) -> bool:
        """
        Validate ISIN checksum.
        
        Args:
            isin: ISIN code to validate
            
        Returns:
            True if valid, False otherwise
        """
        if not re.match(r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$', isin):
            return False
        
        # Convert letters to numbers according to ISIN conversion table
        converted = []
        for char in isin[:-1]:  # Exclude check digit
            if char.isalpha():
                # A=10, B=11, ..., Z=35
                converted.append(str(ord(char) - ord('A') + 10))
            else:
                converted.append(char)
        
        # Join into a string
        converted = ''.join(converted)
        
        # Apply Luhn algorithm
        total = 0
        for i, digit in enumerate(reversed(converted)):
            val = int(digit)
            if i % 2 == 1:  # odd positions (from right)
                val *= 2
                if val > 9:
                    val -= 9
            total += val
        
        # Check if the check digit is correct
        expected_check_digit = (10 - (total % 10)) % 10
        actual_check_digit = int(isin[-1])
        
        return expected_check_digit == actual_check_digit
    
    def _validate_cusip(self, cusip: str) -> bool:
        """
        Validate CUSIP checksum.
        
        Args:
            cusip: CUSIP code to validate
            
        Returns:
            True if valid, False otherwise
        """
        if not re.match(r'^[0-9A-Z]{9}$', cusip):
            return False
        
        # Apply CUSIP validation algorithm
        total = 0
        for i, char in enumerate(cusip[:-1]):  # Exclude check digit
            # Convert character to value
            if char.isdigit():
                val = int(char)
            else:
                # A=10, B=11, ..., Z=35
                val = ord(char) - ord('A') + 10
            
            # Double value for even positions (0-based)
            if i % 2 == 0:
                val *= 2
            
            # Add sum of digits to total
            total += (val // 10) + (val % 10)
        
        # Calculate expected check digit
        expected_check_digit = (10 - (total % 10)) % 10
        
        # Get actual check digit
        actual_check_digit = int(cusip[-1]) if cusip[-1].isdigit() else ord(cusip[-1]) - ord('A') + 10
        
        return expected_check_digit == actual_check_digit
    
    def _extract_security_names(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract security names from text.
        
        Args:
            text: Text to analyze
            
        Returns:
            List of dictionaries with name information
        """
        names = []
        
        # First, try company pattern
        for match in self.company_pattern.finditer(text):
            name = match.group(1).strip()
            # Skip short names that are likely not securities
            if len(name) < 4:
                continue
                
            # Skip if name is all caps and short (likely a ticker)
            if name.isupper() and len(name) < 6:
                continue
                
            start, end = match.span(1)
            names.append({
                'text': name,
                'start': start,
                'end': end,
                'confidence': 0.7  # Lower confidence than pattern-based entities
            })
        
        # Look for security name patterns with context
        security_contexts = [
            (r'([\w\s\.\&\-]+)(?:\s+shares|\s+stock|\s+bonds|\s+etf|\s+fund)', 0.8),
            (r'shares of ([\w\s\.\&\-]+)', 0.8),
            (r'([\w\s\.\&\-]+)(?:\s+Inc\.|\s+Corp\.|\s+Corporation|\s+LLC|\s+Ltd\.)', 0.75),
            (r'ticker:?\s+[A-Z]+\s+\(([\w\s\.\&\-]+)\)', 0.85)
        ]
        
        for pattern, confidence in security_contexts:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                name = match.group(1).strip()
                # Skip short names
                if len(name) < 4:
                    continue
                
                start, end = match.span(1)
                names.append({
                    'text': name,
                    'start': start,
                    'end': end,
                    'confidence': confidence
                })
        
        return names
    
    def _extract_financial_metrics(self, text: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Extract financial metrics based on context.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with metric types and their occurrences
        """
        metrics = defaultdict(list)
        
        # Define metric patterns with their context
        metric_patterns = [
            # Format: (metric_type, pattern, confidence)
            ('total_value', r'(?:total|balance|sum)(?:\s+value|\s+amount)?:?\s*([\$€£]?[\d,]+(?:\.\d+)?)', 0.85),
            ('nav', r'(?:nav|net\s+asset\s+value):?\s*([\$€£]?[\d,]+(?:\.\d+)?)', 0.9),
            ('yield', r'(?:yield|dividend\s+yield):?\s*([\d,]+(?:\.\d+)?\s*%)', 0.9),
            ('interest_rate', r'(?:interest\s+rate|rate):?\s*([\d,]+(?:\.\d+)?\s*%)', 0.9),
            ('expense_ratio', r'(?:expense\s+ratio|fees):?\s*([\d,]+(?:\.\d+)?\s*%)', 0.85),
            ('performance', r'(?:performance|return):?\s*((?:\+|\-)?[\d,]+(?:\.\d+)?\s*%)', 0.8)
        ]
        
        for metric_type, pattern, confidence in metric_patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                value = match.group(1).strip()
                start, end = match.span(1)
                metrics[metric_type].append({
                    'text': value,
                    'start': start,
                    'end': end,
                    'confidence': confidence
                })
        
        return dict(metrics)
    
    def extract_structured_data(self, text: str) -> Dict[str, Any]:
        """
        Extract structured financial data from text.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with structured financial data
        """
        # Initialize result structure
        result = {
            'securities': [],
            'metrics': {},
            'dates': {},
            'identifiers': {}
        }
        
        # Recognize all entities
        entities = self.recognize_entities(text)
        
        # Process ISINs and assign to securities
        if 'isin' in entities:
            result['identifiers']['isins'] = [entity['text'] for entity in entities['isin']]
            
            # Try to pair ISINs with security names
            if 'security_name' in entities:
                for isin_entity in entities['isin']:
                    isin = isin_entity['text']
                    isin_pos = (isin_entity['start'], isin_entity['end'])
                    
                    # Find closest security name
                    closest_name = None
                    min_distance = float('inf')
                    
                    for name_entity in entities['security_name']:
                        name = name_entity['text']
                        name_pos = (name_entity['start'], name_entity['end'])
                        
                        # Calculate distance between entities
                        if name_pos[1] < isin_pos[0]:
                            distance = isin_pos[0] - name_pos[1]
                        elif name_pos[0] > isin_pos[1]:
                            distance = name_pos[0] - isin_pos[1]
                        else:
                            # Overlapping positions - skip
                            continue
                        
                        if distance < min_distance:
                            min_distance = distance
                            closest_name = name
                    
                    # If the name is close enough, pair them
                    security = {'isin': isin}
                    if closest_name and min_distance < 200:  # 200 characters is a reasonable proximity
                        security['name'] = closest_name
                    
                    result['securities'].append(security)
        
        # Process CUSIP identifiers
        if 'cusip' in entities:
            result['identifiers']['cusips'] = [entity['text'] for entity in entities['cusip']]
        
        # Process ticker symbols
        if 'ticker' in entities:
            result['identifiers']['tickers'] = [entity['text'] for entity in entities['ticker']]
        
        # Process amounts and assign to securities if possible
        if 'amount' in entities:
            amounts = [entity['text'] for entity in entities['amount']]
            result['metrics']['amounts'] = amounts
        
        # Process dates
        if 'date' in entities:
            dates = [entity['text'] for entity in entities['date']]
            result['dates']['all_dates'] = dates
            
            # Try to identify statement date vs. valuation date
            statement_date_pattern = r'(?:statement|report|as of)(?:\s+date)?:?\s*([0-9\/\.\-]+)'
            valuation_date_pattern = r'(?:valuation|pricing|effective)(?:\s+date)?:?\s*([0-9\/\.\-]+)'
            
            statement_match = re.search(statement_date_pattern, text, re.IGNORECASE)
            if statement_match:
                result['dates']['statement_date'] = statement_match.group(1)
                
            valuation_match = re.search(valuation_date_pattern, text, re.IGNORECASE)
            if valuation_match:
                result['dates']['valuation_date'] = valuation_match.group(1)
        
        # Process financial metrics
        for metric_type in ['total_value', 'nav', 'yield', 'interest_rate', 'expense_ratio', 'performance']:
            if metric_type in entities:
                result['metrics'][metric_type] = [entity['text'] for entity in entities[metric_type]]
        
        return result


# Example usage
if __name__ == "__main__":
    # This will only run when the script is executed directly
    sample_text = """
    Portfolio Statement
    
    Client ID: 12345678
    Statement Date: 12/31/2023
    
    Security Holdings:
    
    Apple Inc. (AAPL)
    ISIN: US0378331005
    Shares: 100
    Price: $178.65
    Value: $17,865.00
    
    Microsoft Corporation (MSFT)
    ISIN: US5949181045
    Shares: 50
    Price: $374.51
    Value: $18,725.50
    
    Total Value: $36,590.50
    
    Performance: +12.5%
    NAV: $36.59
    Yield: 1.85%
    """
    
    recognizer = FinancialEntityRecognizer()
    entities = recognizer.recognize_entities(sample_text)
    
    print("Recognized entities:")
    for entity_type, entities_list in entities.items():
        print(f"\n{entity_type.upper()}:")
        for entity in entities_list:
            print(f"  {entity['text']} (confidence: {entity['confidence']:.2f})")
    
    structured_data = recognizer.extract_structured_data(sample_text)
    
    print("\nStructured data:")
    import json
    print(json.dumps(structured_data, indent=2))