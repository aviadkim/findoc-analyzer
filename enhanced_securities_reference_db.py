"""
Enhanced Securities Reference Database

This module provides a comprehensive reference database of securities information
with expanded coverage, improved matching algorithms, external data integration,
and regular update mechanisms.
"""

import json
import os
import re
import logging
import datetime
import requests
from typing import Dict, List, Any, Optional, Set, Tuple, Union
from difflib import SequenceMatcher

# Set up logging
logger = logging.getLogger('securities_reference_db')
logger.setLevel(logging.INFO)

# Create console handler if not already set up
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

class SecuritiesReferenceDB:
    """
    An enhanced reference database for securities information to improve extraction accuracy.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the enhanced reference database.
        
        Args:
            config_path: Optional path to a configuration file
        """
        # Maps for ISIN lookups
        self.isin_to_name = {}
        self.isin_to_ticker = {}
        self.isin_to_exchange = {}
        self.isin_to_sector = {}
        self.isin_to_industry = {}
        self.isin_to_security_type = {}
        self.isin_to_country = {}
        self.isin_to_currency = {}
        self.isin_to_metadata = {}  # Additional metadata (issuer, rating, etc.)
        
        # Maps for ticker lookups
        self.ticker_to_name = {}
        self.ticker_to_isin = {}
        self.ticker_to_exchange = {}
        
        # Maps for name lookups
        self.name_to_ticker = {}
        self.name_to_isin = {}
        
        # Maps for CUSIP, SEDOL, and other identifiers
        self.cusip_to_isin = {}
        self.sedol_to_isin = {}
        self.figi_to_isin = {}
        
        # Historical data tracking
        self.historical_data = {}  # Key: ISIN, Value: Dict of historical data
        
        # Database update tracking
        self.last_update = None
        self.data_sources = set()
        self.update_frequency = 7  # days
        
        # Common securities types (expanded)
        self.security_types = {
            'equity': {
                'stock', 'share', 'common', 'preferred', 'ordinary', 'class a', 'class b',
                'adr', 'gdr', 'common stock', 'preferred stock', 'ordinary share'
            },
            'bond': {
                'bond', 'note', 'debt', 'treasury', 'debenture', 'gilt', 'corporate bond',
                'municipal bond', 'government bond', 'treasury bond', 'treasury note',
                'zero coupon', 'fixed income', 'convertible bond', 'senior notes'
            },
            'etf': {
                'etf', 'exchange traded fund', 'exchange-traded', 'index etf', 'sector etf',
                'bond etf', 'commodity etf', 'currency etf', 'inverse etf', 'leveraged etf'
            },
            'fund': {
                'mutual fund', 'investment fund', 'hedge fund', 'index fund', 'money market fund',
                'balanced fund', 'income fund', 'growth fund', 'value fund', 'target date fund',
                'ucits fund', 'sicav', 'closed-end fund', 'open-end fund'
            },
            'option': {
                'option', 'call', 'put', 'warrant', 'call option', 'put option',
                'covered call', 'naked option', 'leap', 'employee stock option'
            },
            'future': {
                'future', 'futures contract', 'commodity future', 'index future',
                'currency future', 'interest rate future', 'bond future', 'e-mini'
            },
            'crypto': {
                'crypto', 'cryptocurrency', 'token', 'coin', 'bitcoin', 'ethereum',
                'altcoin', 'stablecoin', 'defi token', 'nft'
            },
            'reit': {
                'reit', 'real estate investment trust', 'mortgage reit', 'equity reit',
                'hybrid reit', 'residential reit', 'commercial reit'
            },
            'commodity': {
                'commodity', 'gold', 'silver', 'oil', 'gas', 'precious metal',
                'base metal', 'agricultural commodity', 'energy commodity'
            },
            'structured_product': {
                'structured product', 'structured note', 'capital protected note',
                'participation certificate', 'reverse convertible', 'barrier reverse convertible',
                'discount certificate', 'bonus certificate', 'autocallable'
            },
            'forex': {
                'forex', 'currency pair', 'fx', 'foreign exchange'
            }
        }
        
        # Common stock exchanges and their codes (expanded)
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
            'ASX': 'Australian Securities Exchange',
            'BME': 'Bolsa de Madrid',
            'JSE': 'Johannesburg Stock Exchange',
            'BSE': 'Bombay Stock Exchange',
            'NSE': 'National Stock Exchange of India',
            'KRX': 'Korea Exchange',
            'BIT': 'Borsa Italiana',
            'SGX': 'Singapore Exchange',
            'IDX': 'Indonesia Stock Exchange',
            'MOEX': 'Moscow Exchange',
            'B3': 'Brasil Bolsa Balcão',
            'OSE': 'Oslo Stock Exchange',
            'STO': 'Stockholm Stock Exchange',
            'TASE': 'Tel Aviv Stock Exchange',
            'TWSE': 'Taiwan Stock Exchange',
            'SET': 'Stock Exchange of Thailand',
            'BVL': 'Bolsa de Valores de Lima',
            'MYX': 'Bursa Malaysia',
            'QSE': 'Qatar Stock Exchange',
            'ADX': 'Abu Dhabi Securities Exchange',
            'DFM': 'Dubai Financial Market'
        }
        
        # Currency codes and names
        self.currencies = {
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'JPY': 'Japanese Yen',
            'GBP': 'British Pound',
            'CHF': 'Swiss Franc',
            'CAD': 'Canadian Dollar',
            'AUD': 'Australian Dollar',
            'NZD': 'New Zealand Dollar',
            'CNY': 'Chinese Yuan',
            'HKD': 'Hong Kong Dollar',
            'SGD': 'Singapore Dollar',
            'SEK': 'Swedish Krona',
            'NOK': 'Norwegian Krone',
            'DKK': 'Danish Krone',
            'ILS': 'Israeli Shekel',
            'RUB': 'Russian Ruble',
            'INR': 'Indian Rupee',
            'BRL': 'Brazilian Real',
            'ZAR': 'South African Rand',
            'MXN': 'Mexican Peso',
            'AED': 'UAE Dirham',
            'SAR': 'Saudi Riyal',
            'TRY': 'Turkish Lira',
            'KRW': 'South Korean Won',
            'PLN': 'Polish Zloty',
            'THB': 'Thai Baht',
            'IDR': 'Indonesian Rupiah',
            'PHP': 'Philippine Peso',
            'MYR': 'Malaysian Ringgit',
            'CZK': 'Czech Koruna'
        }
        
        # Common words that appear in company names (used for preprocessing)
        self.common_company_suffixes = {
            'inc', 'incorporated', 'corp', 'corporation', 'co', 'company', 'ltd', 'limited',
            'llc', 'plc', 'lp', 'ag', 'sa', 'se', 'spa', 'nv', 'bv', 'holdings', 'holding',
            'group', 'intl', 'international', 'worldwide', 'global', 'tech', 'technologies',
            'solutions', 'systems', 'industries', 'trust', 'partners', 'investment', 'investments'
        }
        
        # Major company names and their tickers/ISINs (expanded)
        self.major_companies = {
            'AAPL': {'name': 'Apple Inc.', 'isin': 'US0378331005', 'sector': 'Technology', 'industry': 'Consumer Electronics'},
            'MSFT': {'name': 'Microsoft Corporation', 'isin': 'US5949181045', 'sector': 'Technology', 'industry': 'Software'},
            'GOOGL': {'name': 'Alphabet Inc.', 'isin': 'US02079K3059', 'sector': 'Communication Services', 'industry': 'Internet Content & Information'},
            'GOOG': {'name': 'Alphabet Inc.', 'isin': 'US02079K1079', 'sector': 'Communication Services', 'industry': 'Internet Content & Information'},
            'AMZN': {'name': 'Amazon.com Inc.', 'isin': 'US0231351067', 'sector': 'Consumer Cyclical', 'industry': 'Internet Retail'},
            'META': {'name': 'Meta Platforms Inc.', 'isin': 'US30303M1027', 'sector': 'Communication Services', 'industry': 'Social Media'},
            'NVDA': {'name': 'NVIDIA Corporation', 'isin': 'US67066G1040', 'sector': 'Technology', 'industry': 'Semiconductors'},
            'TSLA': {'name': 'Tesla Inc.', 'isin': 'US88160R1014', 'sector': 'Consumer Cyclical', 'industry': 'Auto Manufacturers'},
            'JPM': {'name': 'JPMorgan Chase & Co.', 'isin': 'US46625H1005', 'sector': 'Financial Services', 'industry': 'Banks'},
            'V': {'name': 'Visa Inc.', 'isin': 'US92826C8394', 'sector': 'Financial Services', 'industry': 'Credit Services'},
            'WMT': {'name': 'Walmart Inc.', 'isin': 'US9311421039', 'sector': 'Consumer Defensive', 'industry': 'Discount Stores'},
            'UNH': {'name': 'UnitedHealth Group Inc.', 'isin': 'US91324P1021', 'sector': 'Healthcare', 'industry': 'Healthcare Plans'},
            'JNJ': {'name': 'Johnson & Johnson', 'isin': 'US4781601046', 'sector': 'Healthcare', 'industry': 'Drug Manufacturers'},
            'BAC': {'name': 'Bank of America Corp.', 'isin': 'US0605051046', 'sector': 'Financial Services', 'industry': 'Banks'},
            'PG': {'name': 'Procter & Gamble Co.', 'isin': 'US7427181091', 'sector': 'Consumer Defensive', 'industry': 'Household & Personal Products'},
            'MA': {'name': 'Mastercard Inc.', 'isin': 'US57636Q1040', 'sector': 'Financial Services', 'industry': 'Credit Services'},
            'XOM': {'name': 'Exxon Mobil Corp.', 'isin': 'US30231G1022', 'sector': 'Energy', 'industry': 'Oil & Gas Integrated'},
            'HD': {'name': 'Home Depot Inc.', 'isin': 'US4370761029', 'sector': 'Consumer Cyclical', 'industry': 'Home Improvement Retail'},
            'CVX': {'name': 'Chevron Corp.', 'isin': 'US1667641005', 'sector': 'Energy', 'industry': 'Oil & Gas Integrated'},
            'ABBV': {'name': 'AbbVie Inc.', 'isin': 'US00287Y1091', 'sector': 'Healthcare', 'industry': 'Drug Manufacturers'},
            'PFE': {'name': 'Pfizer Inc.', 'isin': 'US7170811035', 'sector': 'Healthcare', 'industry': 'Drug Manufacturers'},
            'AVGO': {'name': 'Broadcom Inc.', 'isin': 'US11135F1012', 'sector': 'Technology', 'industry': 'Semiconductors'},
            'CSCO': {'name': 'Cisco Systems Inc.', 'isin': 'US17275R1023', 'sector': 'Technology', 'industry': 'Communication Equipment'},
            'CMCSA': {'name': 'Comcast Corp.', 'isin': 'US20030N1019', 'sector': 'Communication Services', 'industry': 'Entertainment'},
            'PEP': {'name': 'PepsiCo Inc.', 'isin': 'US7134481081', 'sector': 'Consumer Defensive', 'industry': 'Beverages - Non-Alcoholic'},
            'INTC': {'name': 'Intel Corp.', 'isin': 'US4581401001', 'sector': 'Technology', 'industry': 'Semiconductors'},
            'ADBE': {'name': 'Adobe Inc.', 'isin': 'US00724F1012', 'sector': 'Technology', 'industry': 'Software'},
            'T': {'name': 'AT&T Inc.', 'isin': 'US00206R1023', 'sector': 'Communication Services', 'industry': 'Telecom Services'},
            'ORCL': {'name': 'Oracle Corp.', 'isin': 'US68389X1054', 'sector': 'Technology', 'industry': 'Software'},
            'IBM': {'name': 'International Business Machines Corp.', 'isin': 'US4592001014', 'sector': 'Technology', 'industry': 'Information Technology Services'},
            'MRK': {'name': 'Merck & Co. Inc.', 'isin': 'US58933Y1055', 'sector': 'Healthcare', 'industry': 'Drug Manufacturers'},
            'KO': {'name': 'Coca-Cola Co.', 'isin': 'US1912161007', 'sector': 'Consumer Defensive', 'industry': 'Beverages - Non-Alcoholic'},
            'DIS': {'name': 'Walt Disney Co.', 'isin': 'US2546871060', 'sector': 'Communication Services', 'industry': 'Entertainment'},
            'NFLX': {'name': 'Netflix Inc.', 'isin': 'US64110L1061', 'sector': 'Communication Services', 'industry': 'Entertainment'},
            'CRM': {'name': 'Salesforce Inc.', 'isin': 'US79466L3024', 'sector': 'Technology', 'industry': 'Software'},
            'AMD': {'name': 'Advanced Micro Devices Inc.', 'isin': 'US0079031078', 'sector': 'Technology', 'industry': 'Semiconductors'},
            'PYPL': {'name': 'PayPal Holdings Inc.', 'isin': 'US70450Y1038', 'sector': 'Financial Services', 'industry': 'Credit Services'},
            'SBUX': {'name': 'Starbucks Corp.', 'isin': 'US8552441094', 'sector': 'Consumer Cyclical', 'industry': 'Restaurants'},
            'ACN': {'name': 'Accenture PLC', 'isin': 'IE00B4BNMY34', 'sector': 'Technology', 'industry': 'Information Technology Services'},
            'NKE': {'name': 'Nike Inc.', 'isin': 'US6541061031', 'sector': 'Consumer Cyclical', 'industry': 'Footwear & Accessories'},
            'COST': {'name': 'Costco Wholesale Corp.', 'isin': 'US22160K1051', 'sector': 'Consumer Defensive', 'industry': 'Discount Stores'},
            'TMO': {'name': 'Thermo Fisher Scientific Inc.', 'isin': 'US8835561023', 'sector': 'Healthcare', 'industry': 'Diagnostics & Research'},
            'TMUS': {'name': 'T-Mobile US Inc.', 'isin': 'US8725901040', 'sector': 'Communication Services', 'industry': 'Telecom Services'},
            'VZ': {'name': 'Verizon Communications Inc.', 'isin': 'US92343V1044', 'sector': 'Communication Services', 'industry': 'Telecom Services'},
            'QCOM': {'name': 'Qualcomm Inc.', 'isin': 'US7475251036', 'sector': 'Technology', 'industry': 'Semiconductors'},
            'TXN': {'name': 'Texas Instruments Inc.', 'isin': 'US8825081040', 'sector': 'Technology', 'industry': 'Semiconductors'},
            'NEE': {'name': 'NextEra Energy Inc.', 'isin': 'US65339F1012', 'sector': 'Utilities', 'industry': 'Utilities - Regulated Electric'},
            'UNP': {'name': 'Union Pacific Corp.', 'isin': 'US9078181081', 'sector': 'Industrials', 'industry': 'Railroads'},
            
            # Major European companies
            'NESN': {'name': 'Nestle SA', 'isin': 'CH0038863350', 'sector': 'Consumer Defensive', 'industry': 'Packaged Foods'},
            'ROG': {'name': 'Roche Holding AG', 'isin': 'CH0012032048', 'sector': 'Healthcare', 'industry': 'Drug Manufacturers'},
            'NOVN': {'name': 'Novartis AG', 'isin': 'CH0012005267', 'sector': 'Healthcare', 'industry': 'Drug Manufacturers'},
            'ASML': {'name': 'ASML Holding NV', 'isin': 'NL0010273215', 'sector': 'Technology', 'industry': 'Semiconductor Equipment & Materials'},
            'SAP': {'name': 'SAP SE', 'isin': 'DE0007164600', 'sector': 'Technology', 'industry': 'Software'},
            'LVMH': {'name': 'LVMH Moet Hennessy Louis Vuitton SE', 'isin': 'FR0000121014', 'sector': 'Consumer Cyclical', 'industry': 'Luxury Goods'},
            'BARC': {'name': 'Barclays PLC', 'isin': 'GB0031348658', 'sector': 'Financial Services', 'industry': 'Banks'},
            'HSBA': {'name': 'HSBC Holdings PLC', 'isin': 'GB0005405286', 'sector': 'Financial Services', 'industry': 'Banks'},
            'BP': {'name': 'BP PLC', 'isin': 'GB0007980591', 'sector': 'Energy', 'industry': 'Oil & Gas Integrated'},
            'VOD': {'name': 'Vodafone Group PLC', 'isin': 'GB00BH4HKS39', 'sector': 'Communication Services', 'industry': 'Telecom Services'},
            
            # Major Asian companies
            '9984': {'name': 'SoftBank Group Corp.', 'isin': 'JP3436100006', 'sector': 'Communication Services', 'industry': 'Telecom Services'},
            '9988': {'name': 'Alibaba Group Holding Ltd.', 'isin': 'KYG017191142', 'sector': 'Consumer Cyclical', 'industry': 'Internet Retail'},
            '700': {'name': 'Tencent Holdings Ltd.', 'isin': 'KYG875721634', 'sector': 'Communication Services', 'industry': 'Internet Content & Information'},
            '005930': {'name': 'Samsung Electronics Co. Ltd.', 'isin': 'KR7005930003', 'sector': 'Technology', 'industry': 'Consumer Electronics'},
            
            # Major ETFs
            'SPY': {'name': 'SPDR S&P 500 ETF Trust', 'isin': 'US78462F1030', 'sector': 'ETF', 'industry': 'Large Cap Blend Equity'},
            'QQQ': {'name': 'Invesco QQQ Trust Series 1', 'isin': 'US46090E1038', 'sector': 'ETF', 'industry': 'Large Cap Growth Equity'},
            'IWM': {'name': 'iShares Russell 2000 ETF', 'isin': 'US4642876555', 'sector': 'ETF', 'industry': 'Small Cap Blend Equity'},
            'VTI': {'name': 'Vanguard Total Stock Market ETF', 'isin': 'US9229087690', 'sector': 'ETF', 'industry': 'Total Market Equity'},
            'GLD': {'name': 'SPDR Gold Shares', 'isin': 'US78463V1070', 'sector': 'ETF', 'industry': 'Precious Metals'},
            'AGG': {'name': 'iShares Core U.S. Aggregate Bond ETF', 'isin': 'US4642872265', 'sector': 'ETF', 'industry': 'Fixed Income'},
            'VEA': {'name': 'Vanguard FTSE Developed Markets ETF', 'isin': 'US9219438580', 'sector': 'ETF', 'industry': 'International Equity'},
            'EEM': {'name': 'iShares MSCI Emerging Markets ETF', 'isin': 'US4642872349', 'sector': 'ETF', 'industry': 'Emerging Markets Equity'},
            
            # Popular bonds
            'US10Y': {'name': 'U.S. Treasury 10-Year Note', 'isin': 'US91282CJL17', 'sector': 'Fixed Income', 'industry': 'Government Bond'},
            'US30Y': {'name': 'U.S. Treasury 30-Year Bond', 'isin': 'US912810SU88', 'sector': 'Fixed Income', 'industry': 'Government Bond'},
            'BUND': {'name': 'German 10-Year Bund', 'isin': 'DE0001102580', 'sector': 'Fixed Income', 'industry': 'Government Bond'},
            
            # Add more securities as needed
        }
        
        # Load configuration if provided
        if config_path and os.path.exists(config_path):
            self._load_config(config_path)
        
        # Process the major companies data to populate lookup maps
        self._populate_lookups()
        
        # Initialize external data sources
        self._init_external_sources()
    
    def _load_config(self, config_path: str) -> None:
        """
        Load configuration from file.
        
        Args:
            config_path: Path to the configuration file
        """
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # Set update frequency
            if 'update_frequency' in config:
                self.update_frequency = config['update_frequency']
            
            # Set data sources
            if 'data_sources' in config:
                self.data_sources = set(config['data_sources'])
            
            # Load API keys and endpoints
            if 'api_keys' in config:
                self.api_keys = config['api_keys']
            
            # Load database paths
            if 'database_paths' in config:
                self.database_paths = config['database_paths']
                
                # Load data from specified paths
                for db_name, db_path in self.database_paths.items():
                    if os.path.exists(db_path):
                        self.load_from_file(db_path)
            
            logger.info(f"Loaded configuration from {config_path}")
            
        except Exception as e:
            logger.error(f"Error loading configuration: {e}")
    
    def _init_external_sources(self) -> None:
        """Initialize external data sources."""
        # This would typically connect to APIs or databases
        # For this implementation, we'll just set up some placeholders
        self.external_sources = {
            'finnhub': {
                'url': 'https://finnhub.io/api/v1',
                'enabled': hasattr(self, 'api_keys') and 'finnhub' in getattr(self, 'api_keys', {})
            },
            'alpha_vantage': {
                'url': 'https://www.alphavantage.co/query',
                'enabled': hasattr(self, 'api_keys') and 'alpha_vantage' in getattr(self, 'api_keys', {})
            },
            'yahoo_finance': {
                'url': 'https://query1.finance.yahoo.com/v8/finance/chart',
                'enabled': True  # No API key needed
            }
        }
    
    def _populate_lookups(self) -> None:
        """Populate the various lookup maps from the major companies data."""
        for ticker, data in self.major_companies.items():
            name = data['name']
            isin = data.get('isin')
            sector = data.get('sector')
            industry = data.get('industry')
            
            if isin:
                self.isin_to_name[isin] = name
                self.isin_to_ticker[isin] = ticker
                self.name_to_isin[name.lower()] = isin
                
                # Add sector and industry information
                if sector:
                    self.isin_to_sector[isin] = sector
                if industry:
                    self.isin_to_industry[isin] = industry
                
                # Add variations of the company name for better matching
                self._add_name_variations(name, isin)
                
                # Determine security type from sector
                if sector == 'ETF':
                    self.isin_to_security_type[isin] = 'etf'
                elif sector == 'Fixed Income':
                    self.isin_to_security_type[isin] = 'bond'
                else:
                    self.isin_to_security_type[isin] = 'equity'
                
                # Extract country from ISIN
                country_code = isin[:2]
                self.isin_to_country[isin] = country_code
                
                # Determine likely currency based on country
                currency_map = {
                    'US': 'USD', 'GB': 'GBP', 'JP': 'JPY', 'CH': 'CHF',
                    'EU': 'EUR', 'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR',
                    'ES': 'EUR', 'NL': 'EUR', 'IE': 'EUR', 'FI': 'EUR',
                    'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'GR': 'EUR',
                    'CA': 'CAD', 'AU': 'AUD', 'NZ': 'NZD', 'CN': 'CNY',
                    'HK': 'HKD', 'SG': 'SGD', 'KR': 'KRW', 'TW': 'TWD',
                    'BR': 'BRL', 'MX': 'MXN', 'ZA': 'ZAR', 'SE': 'SEK',
                    'NO': 'NOK', 'DK': 'DKK', 'IL': 'ILS', 'TR': 'TRY',
                    'RU': 'RUB', 'IN': 'INR', 'ID': 'IDR', 'MY': 'MYR',
                    'TH': 'THB', 'PH': 'PHP', 'KY': 'USD'  # Cayman Islands often use USD
                }
                if country_code in currency_map:
                    self.isin_to_currency[isin] = currency_map[country_code]
            
            self.ticker_to_name[ticker] = name
            self.name_to_ticker[name.lower()] = ticker
            
            if isin:
                self.ticker_to_isin[ticker] = isin
                
                # Add CUSIP and SEDOL mappings if they exist
                if 'cusip' in data:
                    self.cusip_to_isin[data['cusip']] = isin
                
                if 'sedol' in data:
                    self.sedol_to_isin[data['sedol']] = isin
                
                if 'figi' in data:
                    self.figi_to_isin[data['figi']] = isin
    
    def _add_name_variations(self, name: str, isin: str) -> None:
        """
        Add variations of a company name to the lookup maps.
        
        Args:
            name: Company name
            isin: ISIN for the company
        """
        name_lower = name.lower()
        self.name_to_isin[name_lower] = isin
        
        # Add without suffixes (Inc, Corp, etc.)
        for suffix in self.common_company_suffixes:
            pattern = r'\s+' + re.escape(suffix) + r'\.?$'
            simplified_name = re.sub(pattern, '', name, flags=re.IGNORECASE)
            if simplified_name != name:
                self.name_to_isin[simplified_name.lower()] = isin
        
        # Add without legal form designations
        patterns = [
            r'\s+(?:Inc|Corp|Corporation|Co|Company|Ltd|Limited)\.?$',
            r'\s+(?:LLC|LLP|L\.L\.C\.|L\.L\.P\.)$',
            r'\s+(?:PLC|P\.L\.C\.)$',
            r'\s+(?:Group|Holdings|Holding)$',
            r'\s+(?:AG|SA|SE|NV|BV|SpA)$'
        ]
        
        for pattern in patterns:
            simplified_name = re.sub(pattern, '', name, flags=re.IGNORECASE)
            if simplified_name != name:
                self.name_to_isin[simplified_name.lower()] = isin
        
        # Add acronym/initials
        initials_match = re.findall(r'([A-Z])[a-z]+', name)
        if len(initials_match) > 1:
            initials = ''.join(initials_match)
            self.name_to_isin[initials.lower()] = isin
        
        # Add variations with common abbreviations
        abbreviation_map = {
            'international': 'intl',
            'technologies': 'tech',
            'technology': 'tech',
            'incorporated': 'inc',
            'corporation': 'corp',
            'company': 'co',
            'limited': 'ltd',
            'brothers': 'bros',
            'manufacturing': 'mfg',
            'industries': 'ind'
        }
        
        for full, abbr in abbreviation_map.items():
            pattern = r'\b' + re.escape(full) + r'\b'
            abbreviated_name = re.sub(pattern, abbr, name_lower, flags=re.IGNORECASE)
            if abbreviated_name != name_lower:
                self.name_to_isin[abbreviated_name] = isin
        
        # Add "The" in front if not already there
        if not name.startswith('The '):
            self.name_to_isin[f"the {name_lower}"] = isin
        
        # Remove "The" from the beginning if it's there
        if name.startswith('The '):
            self.name_to_isin[name_lower[4:]] = isin
    
    def load_from_file(self, file_path: str) -> bool:
        """
        Load securities data from a JSON file.
        
        Args:
            file_path: Path to the JSON file
            
        Returns:
            True if successful, False otherwise
        """
        if not os.path.exists(file_path):
            logger.warning(f"File not found: {file_path}")
            return False
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Check for metadata
            if 'metadata' in data:
                metadata = data['metadata']
                if 'last_update' in metadata:
                    self.last_update = metadata['last_update']
                if 'sources' in metadata:
                    self.data_sources.update(metadata['sources'])
            
            # Add securities data to the lookup maps
            for security in data.get('securities', []):
                isin = security.get('isin')
                name = security.get('name')
                ticker = security.get('ticker')
                exchange = security.get('exchange')
                sector = security.get('sector')
                industry = security.get('industry')
                security_type = security.get('security_type')
                country = security.get('country')
                currency = security.get('currency')
                cusip = security.get('cusip')
                sedol = security.get('sedol')
                figi = security.get('figi')
                metadata = security.get('metadata', {})
                
                if isin and name:
                    self.isin_to_name[isin] = name
                    self.name_to_isin[name.lower()] = isin
                    
                    # Add name variations for better matching
                    self._add_name_variations(name, isin)
                
                if isin and ticker:
                    self.isin_to_ticker[isin] = ticker
                    self.ticker_to_isin[ticker] = ticker
                    self.ticker_to_name[ticker] = name
                
                if isin and exchange:
                    self.isin_to_exchange[isin] = exchange
                    if ticker:
                        self.ticker_to_exchange[ticker] = exchange
                
                if isin and sector:
                    self.isin_to_sector[isin] = sector
                
                if isin and industry:
                    self.isin_to_industry[isin] = industry
                
                if isin and security_type:
                    self.isin_to_security_type[isin] = security_type
                
                if isin and country:
                    self.isin_to_country[isin] = country
                
                if isin and currency:
                    self.isin_to_currency[isin] = currency
                
                if isin and cusip:
                    self.cusip_to_isin[cusip] = isin
                
                if isin and sedol:
                    self.sedol_to_isin[sedol] = isin
                
                if isin and figi:
                    self.figi_to_isin[figi] = isin
                
                if name and ticker:
                    self.name_to_ticker[name.lower()] = ticker
                
                if isin and metadata:
                    self.isin_to_metadata[isin] = metadata
                
                # Process historical data if present
                if isin and 'historical_data' in security:
                    self.historical_data[isin] = security['historical_data']
            
            logger.info(f"Successfully loaded {len(data.get('securities', []))} securities from {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading securities data: {e}")
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
            
            # Get all unique ISINs
            all_isins = set(self.isin_to_name.keys())
            
            # Add ISINs from other maps
            all_isins.update(self.isin_to_ticker.keys())
            all_isins.update(self.isin_to_exchange.keys())
            all_isins.update(self.isin_to_sector.keys())
            all_isins.update(self.isin_to_industry.keys())
            all_isins.update(self.isin_to_security_type.keys())
            all_isins.update(self.isin_to_country.keys())
            all_isins.update(self.isin_to_currency.keys())
            all_isins.update(self.isin_to_metadata.keys())
            
            # Process each ISIN
            for isin in all_isins:
                security = {
                    'isin': isin,
                    'name': self.isin_to_name.get(isin),
                    'ticker': self.isin_to_ticker.get(isin),
                    'exchange': self.isin_to_exchange.get(isin),
                    'sector': self.isin_to_sector.get(isin),
                    'industry': self.isin_to_industry.get(isin),
                    'security_type': self.isin_to_security_type.get(isin),
                    'country': self.isin_to_country.get(isin),
                    'currency': self.isin_to_currency.get(isin)
                }
                
                # Add reverse mappings for CUSIP, SEDOL, FIGI
                for cusip, cusip_isin in self.cusip_to_isin.items():
                    if cusip_isin == isin:
                        security['cusip'] = cusip
                        break
                
                for sedol, sedol_isin in self.sedol_to_isin.items():
                    if sedol_isin == isin:
                        security['sedol'] = sedol
                        break
                
                for figi, figi_isin in self.figi_to_isin.items():
                    if figi_isin == isin:
                        security['figi'] = figi
                        break
                
                # Add metadata if available
                if isin in self.isin_to_metadata:
                    security['metadata'] = self.isin_to_metadata[isin]
                
                # Add historical data if available
                if isin in self.historical_data:
                    security['historical_data'] = self.historical_data[isin]
                
                # Remove None values
                security = {k: v for k, v in security.items() if v is not None}
                
                securities.append(security)
            
            # Create metadata
            metadata = {
                'last_update': datetime.datetime.now().isoformat(),
                'record_count': len(securities),
                'sources': list(self.data_sources)
            }
            
            data = {
                'metadata': metadata,
                'securities': securities
            }
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Successfully saved {len(securities)} securities to {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving securities data: {e}")
            return False
    
    def get_name_by_isin(self, isin: str) -> Optional[str]:
        """
        Get a company name by ISIN.
        
        Args:
            isin: The ISIN to look up
            
        Returns:
            Company name or None if not found
        """
        # First check local database
        if isin in self.isin_to_name:
            return self.isin_to_name.get(isin)
        
        # If not found and we have external sources enabled, try to fetch from external source
        return self._fetch_security_info_from_external(isin, 'name')
    
    def get_ticker_by_isin(self, isin: str) -> Optional[str]:
        """
        Get a ticker symbol by ISIN.
        
        Args:
            isin: The ISIN to look up
            
        Returns:
            Ticker symbol or None if not found
        """
        # First check local database
        if isin in self.isin_to_ticker:
            return self.isin_to_ticker.get(isin)
        
        # If not found and we have external sources enabled, try to fetch from external source
        return self._fetch_security_info_from_external(isin, 'ticker')
    
    def get_isin_by_name(self, name: str) -> Optional[str]:
        """
        Get an ISIN by company name.
        
        Args:
            name: The company name to look up
            
        Returns:
            ISIN or None if not found
        """
        # First try direct lookup
        name_lower = name.lower()
        if name_lower in self.name_to_isin:
            return self.name_to_isin.get(name_lower)
        
        # If not found directly, try with fuzzy matching
        return self._fuzzy_match_name(name)
    
    def get_isin_by_ticker(self, ticker: str) -> Optional[str]:
        """
        Get an ISIN by ticker symbol.
        
        Args:
            ticker: The ticker symbol to look up
            
        Returns:
            ISIN or None if not found
        """
        return self.ticker_to_isin.get(ticker.upper())
    
    def get_isin_by_cusip(self, cusip: str) -> Optional[str]:
        """
        Get an ISIN by CUSIP number.
        
        Args:
            cusip: The CUSIP number to look up
            
        Returns:
            ISIN or None if not found
        """
        return self.cusip_to_isin.get(cusip)
    
    def get_isin_by_sedol(self, sedol: str) -> Optional[str]:
        """
        Get an ISIN by SEDOL number.
        
        Args:
            sedol: The SEDOL number to look up
            
        Returns:
            ISIN or None if not found
        """
        return self.sedol_to_isin.get(sedol)
    
    def get_security_type(self, isin: str) -> Optional[str]:
        """
        Get the security type by ISIN.
        
        Args:
            isin: The ISIN to look up
            
        Returns:
            Security type or None if not found
        """
        return self.isin_to_security_type.get(isin)
    
    def get_sector(self, isin: str) -> Optional[str]:
        """
        Get the sector by ISIN.
        
        Args:
            isin: The ISIN to look up
            
        Returns:
            Sector or None if not found
        """
        return self.isin_to_sector.get(isin)
    
    def get_industry(self, isin: str) -> Optional[str]:
        """
        Get the industry by ISIN.
        
        Args:
            isin: The ISIN to look up
            
        Returns:
            Industry or None if not found
        """
        return self.isin_to_industry.get(isin)
    
    def get_country(self, isin: str) -> Optional[str]:
        """
        Get the country by ISIN.
        
        Args:
            isin: The ISIN to look up
            
        Returns:
            Country code or None if not found
        """
        return self.isin_to_country.get(isin)
    
    def get_currency(self, isin: str) -> Optional[str]:
        """
        Get the trading currency by ISIN.
        
        Args:
            isin: The ISIN to look up
            
        Returns:
            Currency code or None if not found
        """
        return self.isin_to_currency.get(isin)
    
    def get_exchange(self, isin: str) -> Optional[str]:
        """
        Get the primary exchange by ISIN.
        
        Args:
            isin: The ISIN to look up
            
        Returns:
            Exchange code or None if not found
        """
        return self.isin_to_exchange.get(isin)
    
    def get_historical_data(self, isin: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
        """
        Get historical data for a security.
        
        Args:
            isin: The ISIN to look up
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            
        Returns:
            Dictionary with historical data or empty dict if not found
        """
        if isin not in self.historical_data:
            return {}
        
        data = self.historical_data[isin]
        
        # If no date range specified, return all data
        if not start_date and not end_date:
            return data
        
        # Filter by date range
        result = {}
        for date, values in data.items():
            if start_date and date < start_date:
                continue
            if end_date and date > end_date:
                continue
            result[date] = values
        
        return result
    
    def get_security_info(self, isin: str) -> Dict[str, Any]:
        """
        Get comprehensive information about a security.
        
        Args:
            isin: The ISIN to look up
            
        Returns:
            Dictionary with all available information
        """
        # Check if ISIN exists
        if isin not in self.isin_to_name and not self._fetch_security_info_from_external(isin, 'name'):
            return {}
        
        # Build comprehensive info
        info = {
            'isin': isin,
            'name': self.get_name_by_isin(isin),
            'ticker': self.get_ticker_by_isin(isin),
            'security_type': self.get_security_type(isin),
            'sector': self.get_sector(isin),
            'industry': self.get_industry(isin),
            'exchange': self.get_exchange(isin),
            'country': self.get_country(isin),
            'currency': self.get_currency(isin)
        }
        
        # Add additional metadata
        if isin in self.isin_to_metadata:
            info['metadata'] = self.isin_to_metadata[isin]
        
        # Remove None values
        return {k: v for k, v in info.items() if v is not None}
    
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
        
        # Check if this is a known security using fuzzy matching
        best_match = self._fuzzy_match_name(name)
        if best_match:
            return self.isin_to_name[best_match]
        
        # If not found, perform basic normalization
        normalized = name
        
        # Remove suffixes like Inc., Corp., etc.
        for suffix in self.common_company_suffixes:
            pattern = r'\s+' + re.escape(suffix) + r'\.?$'
            normalized = re.sub(pattern, '', normalized, flags=re.IGNORECASE)
        
        # Remove commas and periods
        normalized = normalized.replace(',', '').replace('.', '')
        
        # Fix casing - capitalize first letter of each word
        normalized = ' '.join(word.capitalize() for word in normalized.split())
        
        return normalized
    
    def find_best_match_for_name(self, name: str, threshold: float = 0.6) -> Optional[Dict[str, Any]]:
        """
        Find the best match for a security name.
        
        Args:
            name: Name to look up
            threshold: Similarity threshold for fuzzy matching (0-1)
            
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
                'match_quality': 'exact',
                'security_type': self.isin_to_security_type.get(isin),
                'sector': self.isin_to_sector.get(isin),
                'industry': self.isin_to_industry.get(isin)
            }
        
        # Try with fuzzy matching
        isin = self._fuzzy_match_name(name, threshold)
        if isin:
            ticker = self.isin_to_ticker.get(isin)
            return {
                'name': self.isin_to_name[isin],
                'isin': isin,
                'ticker': ticker,
                'match_quality': 'fuzzy',
                'security_type': self.isin_to_security_type.get(isin),
                'sector': self.isin_to_sector.get(isin),
                'industry': self.isin_to_industry.get(isin)
            }
        
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
        try:
            s = ''.join(str(int(c, 36)) for c in isin[0:11])
            digits = ''.join(str((2 if i % 2 else 1) * int(c)) for i, c in enumerate(s))
            checksum = (10 - sum(int(c) for c in digits) % 10) % 10
            
            return int(isin[11]) == checksum
        except Exception:
            return False
    
    def update_database(self, force: bool = False) -> bool:
        """
        Update the database from external sources.
        
        Args:
            force: Force update even if not needed
            
        Returns:
            True if update was successful, False otherwise
        """
        # Check if update is needed
        if not force and self.last_update:
            last_update_date = datetime.datetime.fromisoformat(self.last_update)
            days_since_update = (datetime.datetime.now() - last_update_date).days
            if days_since_update < self.update_frequency:
                logger.info(f"Database was updated {days_since_update} days ago, less than update frequency of {self.update_frequency} days")
                return True
        
        # Update from configured sources
        success = True
        
        for source in self.data_sources:
            if source == 'file' and hasattr(self, 'database_paths'):
                for db_path in self.database_paths.values():
                    if os.path.exists(db_path):
                        if not self.load_from_file(db_path):
                            success = False
            elif source in getattr(self, 'external_sources', {}):
                if self.external_sources[source]['enabled']:
                    if not self._update_from_external_source(source):
                        success = False
        
        if success:
            self.last_update = datetime.datetime.now().isoformat()
            logger.info("Database update completed successfully")
        else:
            logger.warning("Database update completed with some errors")
        
        return success
    
    def add_security(self, security_data: Dict[str, Any]) -> bool:
        """
        Add a new security to the database.
        
        Args:
            security_data: Dictionary containing security information
            
        Returns:
            True if added successfully, False otherwise
        """
        try:
            # Validate required fields
            if 'isin' not in security_data or not security_data['isin']:
                logger.error("ISIN is required to add a security")
                return False
            
            isin = security_data['isin']
            
            # Validate ISIN
            if not self.validate_isin(isin):
                logger.error(f"Invalid ISIN: {isin}")
                return False
            
            # Add to database
            if 'name' in security_data and security_data['name']:
                self.isin_to_name[isin] = security_data['name']
                self.name_to_isin[security_data['name'].lower()] = isin
                
                # Add name variations
                self._add_name_variations(security_data['name'], isin)
            
            if 'ticker' in security_data and security_data['ticker']:
                ticker = security_data['ticker']
                self.isin_to_ticker[isin] = ticker
                self.ticker_to_isin[ticker] = isin
                
                if 'name' in security_data and security_data['name']:
                    self.ticker_to_name[ticker] = security_data['name']
                    self.name_to_ticker[security_data['name'].lower()] = ticker
            
            if 'exchange' in security_data and security_data['exchange']:
                self.isin_to_exchange[isin] = security_data['exchange']
            
            if 'sector' in security_data and security_data['sector']:
                self.isin_to_sector[isin] = security_data['sector']
            
            if 'industry' in security_data and security_data['industry']:
                self.isin_to_industry[isin] = security_data['industry']
            
            if 'security_type' in security_data and security_data['security_type']:
                self.isin_to_security_type[isin] = security_data['security_type']
            
            if 'country' in security_data and security_data['country']:
                self.isin_to_country[isin] = security_data['country']
            
            if 'currency' in security_data and security_data['currency']:
                self.isin_to_currency[isin] = security_data['currency']
            
            if 'cusip' in security_data and security_data['cusip']:
                self.cusip_to_isin[security_data['cusip']] = isin
            
            if 'sedol' in security_data and security_data['sedol']:
                self.sedol_to_isin[security_data['sedol']] = isin
            
            if 'figi' in security_data and security_data['figi']:
                self.figi_to_isin[security_data['figi']] = isin
            
            if 'metadata' in security_data and security_data['metadata']:
                self.isin_to_metadata[isin] = security_data['metadata']
            
            if 'historical_data' in security_data and security_data['historical_data']:
                self.historical_data[isin] = security_data['historical_data']
            
            logger.info(f"Successfully added security with ISIN: {isin}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding security: {e}")
            return False
    
    def remove_security(self, isin: str) -> bool:
        """
        Remove a security from the database.
        
        Args:
            isin: ISIN of the security to remove
            
        Returns:
            True if removed successfully, False otherwise
        """
        if not isin or isin not in self.isin_to_name:
            logger.warning(f"Security with ISIN {isin} not found in database")
            return False
        
        try:
            # Remove from name maps
            name = self.isin_to_name.get(isin)
            if name:
                if name.lower() in self.name_to_isin:
                    del self.name_to_isin[name.lower()]
                
                # Remove name variations (more complex, would require scanning all keys)
                for key in list(self.name_to_isin.keys()):
                    if self.name_to_isin[key] == isin:
                        del self.name_to_isin[key]
            
            # Remove from ticker maps
            ticker = self.isin_to_ticker.get(isin)
            if ticker:
                if ticker in self.ticker_to_isin:
                    del self.ticker_to_isin[ticker]
                if ticker in self.ticker_to_name:
                    del self.ticker_to_name[ticker]
                if name and name.lower() in self.name_to_ticker:
                    del self.name_to_ticker[name.lower()]
            
            # Remove from CUSIP, SEDOL, FIGI maps
            for key in list(self.cusip_to_isin.keys()):
                if self.cusip_to_isin[key] == isin:
                    del self.cusip_to_isin[key]
            
            for key in list(self.sedol_to_isin.keys()):
                if self.sedol_to_isin[key] == isin:
                    del self.sedol_to_isin[key]
            
            for key in list(self.figi_to_isin.keys()):
                if self.figi_to_isin[key] == isin:
                    del self.figi_to_isin[key]
            
            # Remove from all other maps
            if isin in self.isin_to_name:
                del self.isin_to_name[isin]
            if isin in self.isin_to_ticker:
                del self.isin_to_ticker[isin]
            if isin in self.isin_to_exchange:
                del self.isin_to_exchange[isin]
            if isin in self.isin_to_sector:
                del self.isin_to_sector[isin]
            if isin in self.isin_to_industry:
                del self.isin_to_industry[isin]
            if isin in self.isin_to_security_type:
                del self.isin_to_security_type[isin]
            if isin in self.isin_to_country:
                del self.isin_to_country[isin]
            if isin in self.isin_to_currency:
                del self.isin_to_currency[isin]
            if isin in self.isin_to_metadata:
                del self.isin_to_metadata[isin]
            if isin in self.historical_data:
                del self.historical_data[isin]
            
            logger.info(f"Successfully removed security with ISIN: {isin}")
            return True
            
        except Exception as e:
            logger.error(f"Error removing security: {e}")
            return False
    
    def _fuzzy_match_name(self, name: str, threshold: float = 0.6) -> Optional[str]:
        """
        Perform fuzzy matching on company names.
        
        Args:
            name: Company name to match
            threshold: Similarity threshold (0-1)
            
        Returns:
            ISIN of best match or None if no match above threshold
        """
        if not name:
            return None
        
        name_lower = name.lower()
        
        # Direct match first
        if name_lower in self.name_to_isin:
            return self.name_to_isin[name_lower]
        
        # Preprocess name for better matching
        processed_name = self._preprocess_name(name_lower)
        
        # Find best matching name
        best_match = None
        best_score = 0
        
        for db_name, isin in self.name_to_isin.items():
            # Skip very short names to avoid false matches
            if len(db_name) < 4:
                continue
            
            # Preprocess database name
            processed_db_name = self._preprocess_name(db_name)
            
            # Calculate similarity using multiple methods
            # 1. Simple containment
            containment_score = 0
            if processed_db_name in processed_name or processed_name in processed_db_name:
                containment_len = min(len(processed_db_name), len(processed_name))
                containment_score = containment_len / max(len(processed_name), len(processed_db_name))
            
            # 2. Sequence matcher
            seqmatch_score = SequenceMatcher(None, processed_name, processed_db_name).ratio()
            
            # 3. Token set ratio (compare sets of words)
            tokens1 = set(processed_name.split())
            tokens2 = set(processed_db_name.split())
            
            # Calculate Jaccard similarity
            if tokens1 or tokens2:  # Avoid division by zero
                intersection = len(tokens1.intersection(tokens2))
                union = len(tokens1.union(tokens2))
                token_score = intersection / union
            else:
                token_score = 0
            
            # Combine scores with weights
            combined_score = (0.4 * containment_score) + (0.4 * seqmatch_score) + (0.2 * token_score)
            
            if combined_score > best_score:
                best_score = combined_score
                best_match = isin
        
        # Return the best match if it's above the threshold
        if best_score >= threshold:
            return best_match
        
        return None
    
    def _preprocess_name(self, name: str) -> str:
        """
        Preprocess a company name for better matching.
        
        Args:
            name: Company name to preprocess
            
        Returns:
            Preprocessed name
        """
        # Convert to lowercase
        processed = name.lower()
        
        # Remove punctuation
        processed = re.sub(r'[^\w\s]', ' ', processed)
        
        # Remove common stop words and company suffixes
        stop_words = {'the', 'and', 'of', 'a', 'an', 'in', 'on', 'at', 'by', 'for'}
        tokens = processed.split()
        tokens = [t for t in tokens if t not in stop_words and t not in self.common_company_suffixes]
        
        # Join back with spaces
        processed = ' '.join(tokens)
        
        # Remove extra spaces
        processed = re.sub(r'\s+', ' ', processed).strip()
        
        return processed
    
    def _fetch_security_info_from_external(self, isin: str, info_type: str) -> Any:
        """
        Fetch security information from external sources.
        
        Args:
            isin: ISIN to look up
            info_type: Type of information to fetch ('name', 'ticker', etc.)
            
        Returns:
            Requested information or None if not found
        """
        # Placeholder for external API calls
        # In a real implementation, this would query various financial data providers
        
        # For demonstration purposes, just return None
        return None
    
    def _update_from_external_source(self, source_name: str) -> bool:
        """
        Update database from an external source.
        
        Args:
            source_name: Name of the external source
            
        Returns:
            True if update was successful, False otherwise
        """
        # Placeholder for external API updates
        # In a real implementation, this would fetch data from various sources
        
        # For demonstration purposes, just return True
        logger.info(f"Updated from external source: {source_name}")
        return True

def main():
    """
    Main function for testing the enhanced SecuritiesReferenceDB.
    """
    print("Testing Enhanced Securities Reference Database")
    
    # Initialize the database
    db = SecuritiesReferenceDB()
    
    # Test ISIN validation
    print("\nTesting ISIN validation:")
    print("US0378331005 (Apple):", db.validate_isin("US0378331005"))
    print("US5949181045 (Microsoft):", db.validate_isin("US5949181045"))
    print("Invalid ISIN:", db.validate_isin("US123456789X"))
    
    # Test lookups
    print("\nTesting lookups:")
    print("Name for ISIN US0378331005:", db.get_name_by_isin("US0378331005"))
    print("Ticker for ISIN US0378331005:", db.get_ticker_by_isin("US0378331005"))
    print("ISIN for Apple Inc.:", db.get_isin_by_name("Apple Inc."))
    print("ISIN for AAPL:", db.get_isin_by_ticker("AAPL"))
    
    # Test enhanced information
    apple_isin = "US0378331005"
    print(f"\nFull information for {apple_isin}:")
    apple_info = db.get_security_info(apple_isin)
    for key, value in apple_info.items():
        print(f"  {key}: {value}")
    
    # Test fuzzy name matching
    print("\nTesting fuzzy name matching:")
    match1 = db.find_best_match_for_name("Apple")
    match2 = db.find_best_match_for_name("Microsoft Corp")
    match3 = db.find_best_match_for_name("Google")
    
    if match1:
        print(f"Match for 'Apple': {match1['name']} ({match1['isin']})")
    if match2:
        print(f"Match for 'Microsoft Corp': {match2['name']} ({match2['isin']})")
    if match3:
        print(f"Match for 'Google': {match3['name']} ({match3['isin']})")
    
    # Test security type detection
    print("\nTesting security type detection:")
    print("'Apple common stock':", db.detect_security_type("Apple common stock"))
    print("'US Treasury Bond 2.5%':", db.detect_security_type("US Treasury Bond 2.5%"))
    print("'SPDR S&P 500 ETF':", db.detect_security_type("SPDR S&P 500 ETF"))
    
    # Test saving to file
    test_file = "test_securities_db.json"
    print(f"\nSaving database to {test_file}")
    success = db.save_to_file(test_file)
    print(f"Save {'successful' if success else 'failed'}")
    
    # Test loading from file
    if success:
        print(f"Loading database from {test_file}")
        db_new = SecuritiesReferenceDB()
        load_success = db_new.load_from_file(test_file)
        print(f"Load {'successful' if load_success else 'failed'}")
        
        if load_success:
            print(f"Name for ISIN US0378331005: {db_new.get_name_by_isin('US0378331005')}")
    
    # Test adding a new security
    print("\nAdding a new security:")
    new_security = {
        "isin": "FR0000131104",
        "name": "BNP Paribas SA",
        "ticker": "BNP.PA",
        "exchange": "Euronext Paris",
        "sector": "Financial Services",
        "industry": "Banks - Diversified",
        "security_type": "equity",
        "country": "FR",
        "currency": "EUR"
    }
    add_success = db.add_security(new_security)
    print(f"Add {'successful' if add_success else 'failed'}")
    
    if add_success:
        print(f"Name for ISIN FR0000131104: {db.get_name_by_isin('FR0000131104')}")
        print(f"ISIN for BNP Paribas: {db.get_isin_by_name('BNP Paribas')}")

if __name__ == "__main__":
    main()