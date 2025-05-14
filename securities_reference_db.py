"""
Securities Reference Database

This module provides a reference database of common securities information
to help with entity resolution, name matching, and data validation.
"""

import json
import os
import re
from typing import Dict, List, Any, Optional, Set, Tuple

class SecuritiesReferenceDB:
    """
    A reference database for securities information to improve extraction accuracy.
    """
    
    def __init__(self):
        """Initialize the reference database."""
        # Maps for ISIN lookups
        self.isin_to_name = {}
        self.isin_to_ticker = {}
        self.isin_to_exchange = {}
        self.ticker_to_name = {}
        self.name_to_ticker = {}
        self.name_to_isin = {}
        
        # Common securities types
        self.security_types = {
            'equity': {'stock', 'share', 'common', 'preferred', 'ordinary', 'class a', 'class b'},
            'bond': {'bond', 'note', 'debt', 'treasury', 'debenture', 'gilt'},
            'etf': {'etf', 'exchange traded fund', 'exchange-traded', 'fund'},
            'fund': {'mutual fund', 'investment fund', 'hedge fund', 'index fund'},
            'option': {'option', 'call', 'put', 'warrant'},
            'future': {'future', 'futures contract'},
            'crypto': {'crypto', 'cryptocurrency', 'token', 'coin'},
            'reit': {'reit', 'real estate investment trust'},
            'commodity': {'commodity', 'gold', 'silver', 'oil', 'gas'}
        }
        
        # Common stock exchanges and their codes
        self.exchanges = {
            'NYSE': 'New York Stock Exchange',
            'NASDAQ': 'NASDAQ Stock Market',
            'LSE': 'London Stock Exchange',
            'TSE': 'Tokyo Stock Exchange',
            'SSE': 'Shanghai Stock Exchange',
            'HKEX': 'Hong Kong Stock Exchange',
            'TSX': 'Toronto Stock Exchange',
            'FWB': 'Frankfurt Stock Exchange',
            'SIX': 'SIX Swiss Exchange',
            'ASX': 'Australian Securities Exchange'
        }
        
        # Major company names and their tickers/ISINs
        self.major_companies = {
            'AAPL': {'name': 'Apple Inc.', 'isin': 'US0378331005'},
            'MSFT': {'name': 'Microsoft Corporation', 'isin': 'US5949181045'},
            'GOOGL': {'name': 'Alphabet Inc.', 'isin': 'US02079K3059'},
            'AMZN': {'name': 'Amazon.com Inc.', 'isin': 'US0231351067'},
            'META': {'name': 'Meta Platforms Inc.', 'isin': 'US30303M1027'},
            'NVDA': {'name': 'NVIDIA Corporation', 'isin': 'US67066G1040'},
            'TSLA': {'name': 'Tesla Inc.', 'isin': 'US88160R1014'},
            'JPM': {'name': 'JPMorgan Chase & Co.', 'isin': 'US46625H1005'},
            'V': {'name': 'Visa Inc.', 'isin': 'US92826C8394'},
            'WMT': {'name': 'Walmart Inc.', 'isin': 'US9311421039'},
            'UNH': {'name': 'UnitedHealth Group Inc.', 'isin': 'US91324P1021'},
            'JNJ': {'name': 'Johnson & Johnson', 'isin': 'US4781601046'},
            'BAC': {'name': 'Bank of America Corp.', 'isin': 'US0605051046'},
            'PG': {'name': 'Procter & Gamble Co.', 'isin': 'US7427181091'},
            'MA': {'name': 'Mastercard Inc.', 'isin': 'US57636Q1040'},
            'XOM': {'name': 'Exxon Mobil Corp.', 'isin': 'US30231G1022'},
            'HD': {'name': 'Home Depot Inc.', 'isin': 'US4370761029'},
            'CVX': {'name': 'Chevron Corp.', 'isin': 'US1667641005'},
            'ABBV': {'name': 'AbbVie Inc.', 'isin': 'US00287Y1091'},
            'PFE': {'name': 'Pfizer Inc.', 'isin': 'US7170811035'},
            'AVGO': {'name': 'Broadcom Inc.', 'isin': 'US11135F1012'},
            'CSCO': {'name': 'Cisco Systems Inc.', 'isin': 'US17275R1023'},
            'CMCSA': {'name': 'Comcast Corp.', 'isin': 'US20030N1019'},
            'PEP': {'name': 'PepsiCo Inc.', 'isin': 'US7134481081'},
            'INTC': {'name': 'Intel Corp.', 'isin': 'US4581401001'},
            'ADBE': {'name': 'Adobe Inc.', 'isin': 'US00724F1012'},
            'T': {'name': 'AT&T Inc.', 'isin': 'US00206R1023'},
            'ORCL': {'name': 'Oracle Corp.', 'isin': 'US68389X1054'},
            'IBM': {'name': 'International Business Machines Corp.', 'isin': 'US4592001014'},
            'MRK': {'name': 'Merck & Co. Inc.', 'isin': 'US58933Y1055'},
        }
        
        # Process the major companies data to populate lookup maps
        self._populate_lookups()
    
    def _populate_lookups(self):
        """Populate the various lookup maps from the major companies data."""
        for ticker, data in self.major_companies.items():
            name = data['name']
            isin = data.get('isin')
            
            if isin:
                self.isin_to_name[isin] = name
                self.isin_to_ticker[isin] = ticker
                self.name_to_isin[name.lower()] = isin
                
                # Add variations of the company name
                simplified_name = re.sub(r'\s+(?:Inc|Corp|Corporation|Co|Company|Ltd|Limited)\.$', '', name)
                self.name_to_isin[simplified_name.lower()] = isin
                
                initials_match = re.findall(r'([A-Z])[a-z]+', name)
                if len(initials_match) > 1:
                    initials = ''.join(initials_match)
                    self.name_to_isin[initials] = isin
            
            self.ticker_to_name[ticker] = name
            self.name_to_ticker[name.lower()] = ticker
    
    def load_from_file(self, file_path: str) -> bool:
        """
        Load securities data from a JSON file.
        
        Args:
            file_path: Path to the JSON file
            
        Returns:
            True if successful, False otherwise
        """
        if not os.path.exists(file_path):
            return False
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Add data to the lookup maps
            for security in data.get('securities', []):
                isin = security.get('isin')
                name = security.get('name')
                ticker = security.get('ticker')
                exchange = security.get('exchange')
                
                if isin and name:
                    self.isin_to_name[isin] = name
                    self.name_to_isin[name.lower()] = isin
                
                if isin and ticker:
                    self.isin_to_ticker[isin] = ticker
                    self.ticker_to_name[ticker] = name
                
                if isin and exchange:
                    self.isin_to_exchange[isin] = exchange
                
                if name and ticker:
                    self.name_to_ticker[name.lower()] = ticker
            
            return True
        except Exception as e:
            print(f"Error loading securities data: {e}")
            return False
    
    def save_to_file(self, file_path: str) -> bool:
        """
        Save the securities data to a JSON file.
        
        Args:
            file_path: Path to save the JSON file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Construct data from the lookup maps
            securities = []
            
            for isin, name in self.isin_to_name.items():
                security = {
                    'isin': isin,
                    'name': name,
                    'ticker': self.isin_to_ticker.get(isin),
                    'exchange': self.isin_to_exchange.get(isin)
                }
                securities.append(security)
            
            data = {
                'securities': securities
            }
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving securities data: {e}")
            return False
    
    def get_name_by_isin(self, isin: str) -> Optional[str]:
        """
        Get a company name by ISIN.
        
        Args:
            isin: The ISIN to look up
            
        Returns:
            Company name or None if not found
        """
        return self.isin_to_name.get(isin)
    
    def get_ticker_by_isin(self, isin: str) -> Optional[str]:
        """
        Get a ticker symbol by ISIN.
        
        Args:
            isin: The ISIN to look up
            
        Returns:
            Ticker symbol or None if not found
        """
        return self.isin_to_ticker.get(isin)
    
    def get_isin_by_name(self, name: str) -> Optional[str]:
        """
        Get an ISIN by company name.
        
        Args:
            name: The company name to look up
            
        Returns:
            ISIN or None if not found
        """
        return self.name_to_isin.get(name.lower())
    
    def detect_security_type(self, description: str) -> Optional[str]:
        """
        Detect the type of security from a description.
        
        Args:
            description: Description of the security
            
        Returns:
            Security type or None if can't determine
        """
        if not description:
            return None
        
        description_lower = description.lower()
        
        for security_type, keywords in self.security_types.items():
            for keyword in keywords:
                if keyword in description_lower:
                    return security_type
        
        return None
    
    def normalize_security_name(self, name: str) -> str:
        """
        Normalize a security name for better matching.
        
        Args:
            name: Original security name
            
        Returns:
            Normalized name
        """
        if not name:
            return ""
        
        # Check if this is a known security
        for company_name in self.isin_to_name.values():
            if name.lower() in company_name.lower() or company_name.lower() in name.lower():
                return company_name
        
        # If not found, perform basic normalization
        normalized = name
        
        # Remove suffixes like Inc., Corp., etc.
        normalized = re.sub(r'\s+(Inc|Corp|Corporation|Co|Company|Ltd|Limited)\.?$', '', normalized)
        
        # Remove commas and periods
        normalized = normalized.replace(',', '').replace('.', '')
        
        # Fix casing - capitalize first letter of each word
        normalized = ' '.join(word.capitalize() for word in normalized.split())
        
        return normalized
    
    def find_best_match_for_name(self, name: str) -> Optional[Dict[str, Any]]:
        """
        Find the best match for a security name.
        
        Args:
            name: Name to look up
            
        Returns:
            Dictionary with best match info or None if no good match
        """
        if not name:
            return None
        
        name_lower = name.lower()
        
        # Direct match
        if name_lower in self.name_to_isin:
            isin = self.name_to_isin[name_lower]
            ticker = self.isin_to_ticker.get(isin)
            return {
                'name': self.isin_to_name[isin],
                'isin': isin,
                'ticker': ticker,
                'match_quality': 'exact'
            }
        
        # Partial matches
        best_match = None
        best_score = 0
        
        for db_name, isin in self.name_to_isin.items():
            # Skip very short names to avoid false matches
            if len(db_name) < 4:
                continue
                
            if db_name in name_lower or name_lower in db_name:
                score = len(db_name) / max(len(name_lower), 1)
                
                if score > best_score:
                    best_score = score
                    ticker = self.isin_to_ticker.get(isin)
                    best_match = {
                        'name': self.isin_to_name[isin],
                        'isin': isin,
                        'ticker': ticker,
                        'match_quality': 'partial',
                        'score': score
                    }
        
        # Require a minimum match quality
        if best_match and best_score >= 0.5:
            return best_match
        
        return None
    
    def validate_isin(self, isin: str) -> bool:
        """
        Validate an ISIN code.
        
        Args:
            isin: ISIN code to validate
            
        Returns:
            True if valid, False otherwise
        """
        if not isin or not isinstance(isin, str):
            return False
        
        # Check format: 2 letters followed by 9 alphanumeric characters and a check digit
        if not re.match(r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$', isin):
            return False
        
        # Validate check digit
        s = ''.join(str(int(c, 36)) for c in isin[0:11])
        digits = ''.join(str((2 if i % 2 else 1) * int(c)) for i, c in enumerate(s))
        checksum = (10 - sum(int(c) for c in digits) % 10) % 10
        
        return int(isin[11]) == checksum