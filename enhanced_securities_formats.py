"""
Enhanced Securities Formats Module

This module extends the Enhanced Securities Extractor to support additional
financial document formats from various brokerages.

Supported formats:
- Interactive Brokers
- Charles Schwab
- Vanguard
- Fidelity
- TD Ameritrade
- E*TRADE
"""

import re
from typing import Dict, Any, List, Optional, Pattern, Callable

# Document type detection patterns
DOCUMENT_TYPE_PATTERNS = {
    # Interactive Brokers pattern
    'interactive_brokers': [
        r'Interactive\s+Brokers',
        r'IBKR',
        r'INTERACTIVE\s+BROKERS\s+LLC',
        r'Account Statement',
        r'IB\s+Account\s+Statement'
    ],
    
    # Charles Schwab pattern
    'schwab': [
        r'Charles\s+Schwab',
        r'Schwab\s+One\s+Account',
        r'The\s+Charles\s+Schwab\s+Corporation',
        r'Schwab\s+Brokerage\s+Account'
    ],
    
    # Vanguard pattern
    'vanguard': [
        r'Vanguard',
        r'VANGUARD',
        r'The\s+Vanguard\s+Group',
        r'Vanguard\s+Brokerage\s+Services',
        r'Vanguard\s+Account'
    ],
    
    # Fidelity pattern
    'fidelity': [
        r'Fidelity\s+Investments',
        r'FIDELITY',
        r'FMR\s+LLC',
        r'Fidelity\s+Brokerage\s+Services',
        r'Fidelity\s+Account'
    ],
    
    # TD Ameritrade pattern
    'tdameritrade': [
        r'TD\s+Ameritrade',
        r'TDAMERITRADE',
        r'TDA',
        r'TD\s+Ameritrade\s+Clearing',
        r'TD\s+Ameritrade\s+Account'
    ],
    
    # E*TRADE pattern
    'etrade': [
        r'E\*TRADE',
        r'ETRADE',
        r'E\*TRADE\s+Securities',
        r'E\*TRADE\s+Financial',
        r'E\*TRADE\s+Account'
    ]
}

# Default currencies by document type
DOCUMENT_CURRENCY_MAP = {
    'interactive_brokers': 'USD',
    'schwab': 'USD',
    'vanguard': 'USD',
    'fidelity': 'USD',
    'tdameritrade': 'USD',
    'etrade': 'USD'
}

# Patterns for extracting securities data
SECURITY_PATTERNS = {
    # Interactive Brokers patterns
    'interactive_brokers': {
        'positions_table_header': r'(Positions|Open\s+Positions|Financial\s+Instrument|Symbol|ISIN|Quantity|Position)',
        'isin_pattern': r'([A-Z]{2}[A-Z0-9]{9}[0-9])',
        'ticker_pattern': r'\b([A-Z]{1,5})\b',
        'quantity_pattern': r'(?:Quantity|Position|Shares)[\s:]+(-?[\d,.]+)',
        'price_pattern': r'(?:Price|Market\s+Price|Last\s+Price)[\s:]+(-?[\d,.]+)',
        'value_pattern': r'(?:Market\s+Value|Value|Position\s+Value)[\s:]+(-?[\d,.]+)',
        'description_pattern': r'(?:Description|Name|Security|Financial\s+Instrument)[\s:]+([^\n\r]+)'
    },
    
    # Charles Schwab patterns
    'schwab': {
        'positions_table_header': r'(Positions|Current\s+positions|Symbol|Quantity|Market\s+Value)',
        'isin_pattern': r'([A-Z]{2}[A-Z0-9]{9}[0-9])',
        'ticker_pattern': r'(?:Symbol|Ticker)[\s:]+([A-Z]{1,5})',
        'quantity_pattern': r'(?:Quantity|Shares)[\s:]+(-?[\d,.]+)',
        'price_pattern': r'(?:Price|Share\s+Price)[\s:]+(-?[\d,.]+)',
        'value_pattern': r'(?:Market\s+Value|Value)[\s:]+(-?[\d,.]+)',
        'description_pattern': r'(?:Description|Security\s+Description)[\s:]+([^\n\r]+)'
    },
    
    # Vanguard patterns
    'vanguard': {
        'positions_table_header': r'(Investments|Balances|Holdings|Symbol|Shares|Price)',
        'isin_pattern': r'([A-Z]{2}[A-Z0-9]{9}[0-9])',
        'ticker_pattern': r'(?:Symbol|Ticker)[\s:]+([A-Z]{1,5})',
        'quantity_pattern': r'(?:Shares|Quantity|Balance)[\s:]+(-?[\d,.]+)',
        'price_pattern': r'(?:Price|Share\s+Price)[\s:]+\$?(-?[\d,.]+)',
        'value_pattern': r'(?:Balance|Current\s+Value|Value)[\s:]+\$?(-?[\d,.]+)',
        'description_pattern': r'(?:Fund\s+Name|Description|Investment)[\s:]+([^\n\r]+)'
    },
    
    # Fidelity patterns
    'fidelity': {
        'positions_table_header': r'(Positions|Holdings|Investment\s+details|Symbol|Quantity|Price)',
        'isin_pattern': r'([A-Z]{2}[A-Z0-9]{9}[0-9])',
        'ticker_pattern': r'(?:Symbol|Ticker)[\s:]+([A-Z]{1,5})',
        'quantity_pattern': r'(?:Quantity|Shares|Amount)[\s:]+(-?[\d,.]+)',
        'price_pattern': r'(?:Price|Share\s+Price|Last\s+Price)[\s:]+\$?(-?[\d,.]+)',
        'value_pattern': r'(?:Current\s+Value|Market\s+Value|Value)[\s:]+\$?(-?[\d,.]+)',
        'description_pattern': r'(?:Description|Security|Name)[\s:]+([^\n\r]+)'
    },
    
    # TD Ameritrade patterns
    'tdameritrade': {
        'positions_table_header': r'(Positions|Position\s+Statement|Symbol|Quantity|Market\s+Value)',
        'isin_pattern': r'([A-Z]{2}[A-Z0-9]{9}[0-9])',
        'ticker_pattern': r'(?:Symbol|Ticker)[\s:]+([A-Z]{1,5})',
        'quantity_pattern': r'(?:Quantity|Shares)[\s:]+(-?[\d,.]+)',
        'price_pattern': r'(?:Price|Market\s+Price)[\s:]+\$?(-?[\d,.]+)',
        'value_pattern': r'(?:Market\s+Value|Value)[\s:]+\$?(-?[\d,.]+)',
        'description_pattern': r'(?:Description|Name|Security\s+Name)[\s:]+([^\n\r]+)'
    },
    
    # E*TRADE patterns
    'etrade': {
        'positions_table_header': r'(Portfolio|Positions|Symbol|Quantity|Price|Value)',
        'isin_pattern': r'([A-Z]{2}[A-Z0-9]{9}[0-9])',
        'ticker_pattern': r'(?:Symbol|Ticker)[\s:]+([A-Z]{1,5})',
        'quantity_pattern': r'(?:Quantity|Shares|Amount)[\s:]+(-?[\d,.]+)',
        'price_pattern': r'(?:Price|Last\s+Price)[\s:]+\$?(-?[\d,.]+)',
        'value_pattern': r'(?:Market\s+Value|Value|Position\s+Value)[\s:]+\$?(-?[\d,.]+)',
        'description_pattern': r'(?:Description|Security\s+Description|Name)[\s:]+([^\n\r]+)'
    }
}

# Table structure indicators for different document formats
TABLE_STRUCTURE = {
    'interactive_brokers': {
        'header_row': ['Symbol', 'Description', 'Quantity', 'Price', 'Value'],
        'alternate_headers': [
            ['Financial Instrument', 'Position', 'Market Price', 'Market Value'],
            ['Symbol', 'Name', 'Shares', 'Price', 'Current Value'],
            ['Security', 'ISIN', 'Quantity', 'Price', 'Position Value']
        ],
        'security_type_column': 2,  # Index of the column that might contain security type info
        'ticker_column': 0,
        'description_column': 1,
        'quantity_column': 2,
        'price_column': 3,
        'value_column': 4
    },
    
    'schwab': {
        'header_row': ['Symbol', 'Description', 'Quantity', 'Price', 'Market Value'],
        'alternate_headers': [
            ['Symbol', 'Security Description', 'Shares', 'Price', 'Value'],
            ['Ticker', 'Security Name', 'Quantity', 'Share Price', 'Market Value']
        ],
        'security_type_column': 1,
        'ticker_column': 0,
        'description_column': 1,
        'quantity_column': 2,
        'price_column': 3,
        'value_column': 4
    },
    
    'vanguard': {
        'header_row': ['Fund Name', 'Symbol', 'Shares', 'Price', 'Balance'],
        'alternate_headers': [
            ['Investment', 'Ticker', 'Shares', 'Share Price', 'Current Value'],
            ['Security', 'Symbol', 'Quantity', 'Price', 'Value']
        ],
        'security_type_column': 0,
        'ticker_column': 1,
        'description_column': 0,
        'quantity_column': 2,
        'price_column': 3,
        'value_column': 4
    },
    
    'fidelity': {
        'header_row': ['Symbol', 'Description', 'Quantity', 'Price', 'Market Value'],
        'alternate_headers': [
            ['Symbol', 'Security Name', 'Shares', 'Last Price', 'Current Value'],
            ['Ticker', 'Description', 'Amount', 'Price', 'Value']
        ],
        'security_type_column': 1,
        'ticker_column': 0,
        'description_column': 1,
        'quantity_column': 2,
        'price_column': 3,
        'value_column': 4
    },
    
    'tdameritrade': {
        'header_row': ['Symbol', 'Description', 'Quantity', 'Price', 'Market Value'],
        'alternate_headers': [
            ['Symbol', 'Security Name', 'Shares', 'Market Price', 'Value'],
            ['Ticker', 'Description', 'Quantity', 'Price', 'Value']
        ],
        'security_type_column': 1,
        'ticker_column': 0,
        'description_column': 1,
        'quantity_column': 2,
        'price_column': 3,
        'value_column': 4
    },
    
    'etrade': {
        'header_row': ['Symbol', 'Description', 'Quantity', 'Price', 'Value'],
        'alternate_headers': [
            ['Symbol', 'Security Description', 'Shares', 'Last Price', 'Market Value'],
            ['Ticker', 'Name', 'Amount', 'Price', 'Position Value']
        ],
        'security_type_column': 1,
        'ticker_column': 0,
        'description_column': 1,
        'quantity_column': 2,
        'price_column': 3,
        'value_column': 4
    }
}

# Document-specific extraction functions

def extract_interactive_brokers(text: str, tables: List[Any]) -> List[Dict[str, Any]]:
    """
    Extract securities from Interactive Brokers statements.
    
    Args:
        text: Full text of the document
        tables: List of extracted tables
        
    Returns:
        List of extracted securities
    """
    securities = []
    patterns = SECURITY_PATTERNS['interactive_brokers']
    
    # First look for positions section
    positions_match = re.search(patterns['positions_table_header'], text, re.IGNORECASE)
    if not positions_match:
        return securities
    
    # Process tables to find securities tables
    for table in tables:
        table_text = ' '.join([' '.join(str(cell) for cell in row) for row in table.df.values.tolist()])
        
        # Look for tables with position information
        if re.search(patterns['positions_table_header'], table_text, re.IGNORECASE):
            # Process each row as a potential security
            for row in table.df.values.tolist()[1:]:  # Skip header row
                # Skip empty rows
                if all(not str(cell).strip() for cell in row):
                    continue
                
                security = {}
                
                # Extract ticker
                ticker_match = re.search(patterns['ticker_pattern'], str(row[0]))
                if ticker_match:
                    security['ticker'] = ticker_match.group(1)
                
                # Extract ISIN if present
                isin_match = None
                for cell in row:
                    cell_str = str(cell)
                    isin_match = re.search(patterns['isin_pattern'], cell_str)
                    if isin_match:
                        security['isin'] = isin_match.group(1)
                        break
                
                # Extract description
                # Interactive Brokers typically has description in column 1 or 2
                for i in [1, 2]:
                    if i < len(row) and str(row[i]).strip() and len(str(row[i])) > 5:
                        security['description'] = str(row[i]).strip()
                        break
                
                # Extract quantity, price, value
                for i, cell in enumerate(row):
                    cell_str = str(cell).strip()
                    
                    # Skip empty cells
                    if not cell_str:
                        continue
                    
                    # Look for numeric values that could be quantity, price, or value
                    if re.match(r'^-?[\d,\.]+$', cell_str):
                        # Use column position to determine what this value represents
                        struct = TABLE_STRUCTURE['interactive_brokers']
                        
                        if i == struct['quantity_column'] and 'quantity' not in security:
                            security['nominal'] = float(cell_str.replace(',', ''))
                        elif i == struct['price_column'] and 'price' not in security:
                            security['price'] = float(cell_str.replace(',', ''))
                        elif i == struct['value_column'] and 'value' not in security:
                            security['value'] = float(cell_str.replace(',', ''))
                
                # Add currency info
                security['currency'] = 'USD'  # Default for Interactive Brokers
                
                # Add to list if we have at least some key information
                if ('description' in security or 'ticker' in security) and any(k in security for k in ['nominal', 'value']):
                    securities.append(security)
    
    return securities

def extract_schwab(text: str, tables: List[Any]) -> List[Dict[str, Any]]:
    """
    Extract securities from Charles Schwab statements.
    
    Args:
        text: Full text of the document
        tables: List of extracted tables
        
    Returns:
        List of extracted securities
    """
    securities = []
    patterns = SECURITY_PATTERNS['schwab']
    
    # First look for positions section
    positions_match = re.search(patterns['positions_table_header'], text, re.IGNORECASE)
    if not positions_match:
        return securities
    
    # Process tables to find securities tables
    for table in tables:
        table_text = ' '.join([' '.join(str(cell) for cell in row) for row in table.df.values.tolist()])
        
        # Look for tables with position information
        if re.search(patterns['positions_table_header'], table_text, re.IGNORECASE):
            # Process each row as a potential security
            for row in table.df.values.tolist()[1:]:  # Skip header row
                # Skip empty rows
                if all(not str(cell).strip() for cell in row):
                    continue
                
                security = {}
                
                # Extract ticker (typically first column in Schwab)
                if str(row[0]).strip() and len(str(row[0]).strip()) <= 5:
                    security['ticker'] = str(row[0]).strip()
                
                # Extract ISIN if present
                isin_match = None
                for cell in row:
                    cell_str = str(cell)
                    isin_match = re.search(patterns['isin_pattern'], cell_str)
                    if isin_match:
                        security['isin'] = isin_match.group(1)
                        break
                
                # Extract description
                # Schwab typically has description in column 1
                if len(row) > 1 and str(row[1]).strip() and len(str(row[1])) > 5:
                    security['description'] = str(row[1]).strip()
                
                # Extract quantity, price, value
                for i, cell in enumerate(row):
                    cell_str = str(cell).strip()
                    
                    # Skip empty cells
                    if not cell_str:
                        continue
                    
                    # Look for numeric values that could be quantity, price, or value
                    if re.match(r'^-?[\d,\.]+$', cell_str.replace('$', '').strip()):
                        # Use column position to determine what this value represents
                        struct = TABLE_STRUCTURE['schwab']
                        
                        if i == struct['quantity_column'] and 'nominal' not in security:
                            security['nominal'] = float(cell_str.replace(',', '').replace('$', ''))
                        elif i == struct['price_column'] and 'price' not in security:
                            security['price'] = float(cell_str.replace(',', '').replace('$', ''))
                        elif i == struct['value_column'] and 'value' not in security:
                            security['value'] = float(cell_str.replace(',', '').replace('$', ''))
                
                # Add currency info - Schwab typically uses USD
                security['currency'] = 'USD'
                
                # Add to list if we have at least some key information
                if ('description' in security or 'ticker' in security) and any(k in security for k in ['nominal', 'value']):
                    securities.append(security)
    
    return securities

def extract_vanguard(text: str, tables: List[Any]) -> List[Dict[str, Any]]:
    """
    Extract securities from Vanguard statements.
    
    Args:
        text: Full text of the document
        tables: List of extracted tables
        
    Returns:
        List of extracted securities
    """
    securities = []
    patterns = SECURITY_PATTERNS['vanguard']
    
    # First look for investments section
    positions_match = re.search(patterns['positions_table_header'], text, re.IGNORECASE)
    if not positions_match:
        return securities
    
    # Process tables to find securities tables
    for table in tables:
        table_text = ' '.join([' '.join(str(cell) for cell in row) for row in table.df.values.tolist()])
        
        # Look for tables with position information
        if re.search(patterns['positions_table_header'], table_text, re.IGNORECASE):
            # Vanguard often has fund name as the first column, then ticker
            # Process each row as a potential security
            for row in table.df.values.tolist()[1:]:  # Skip header row
                # Skip empty rows
                if all(not str(cell).strip() for cell in row):
                    continue
                
                security = {}
                
                # Vanguard often has the fund name as the first column
                if str(row[0]).strip() and len(str(row[0])) > 5:
                    security['description'] = str(row[0]).strip()
                
                # Extract ticker (usually column 1 in Vanguard)
                if len(row) > 1 and str(row[1]).strip() and len(str(row[1]).strip()) <= 5:
                    security['ticker'] = str(row[1]).strip()
                
                # Extract ISIN if present
                isin_match = None
                for cell in row:
                    cell_str = str(cell)
                    isin_match = re.search(patterns['isin_pattern'], cell_str)
                    if isin_match:
                        security['isin'] = isin_match.group(1)
                        break
                
                # Extract quantity, price, value
                for i, cell in enumerate(row):
                    cell_str = str(cell).strip()
                    
                    # Skip empty cells
                    if not cell_str:
                        continue
                    
                    # Look for numeric values that could be quantity, price, or value
                    if re.match(r'^-?[\d,\.]+$', cell_str.replace('$', '').strip()):
                        # Use column position to determine what this value represents
                        struct = TABLE_STRUCTURE['vanguard']
                        
                        if i == struct['quantity_column'] and 'nominal' not in security:
                            security['nominal'] = float(cell_str.replace(',', '').replace('$', ''))
                        elif i == struct['price_column'] and 'price' not in security:
                            security['price'] = float(cell_str.replace(',', '').replace('$', ''))
                        elif i == struct['value_column'] and 'value' not in security:
                            security['value'] = float(cell_str.replace(',', '').replace('$', ''))
                
                # Add currency info - Vanguard typically uses USD
                security['currency'] = 'USD'
                
                # Try to assign security type based on description (Vanguard specific)
                if 'description' in security:
                    desc = security['description'].lower()
                    if 'fund' in desc or 'index' in desc:
                        security['type'] = 'fund'
                    elif 'etf' in desc:
                        security['type'] = 'etf'
                    elif 'bond' in desc or 'treasury' in desc:
                        security['type'] = 'bond'
                    else:
                        security['type'] = 'equity'
                
                # Add to list if we have at least some key information
                if ('description' in security or 'ticker' in security) and any(k in security for k in ['nominal', 'value']):
                    securities.append(security)
    
    return securities

def extract_fidelity(text: str, tables: List[Any]) -> List[Dict[str, Any]]:
    """
    Extract securities from Fidelity statements.
    
    Args:
        text: Full text of the document
        tables: List of extracted tables
        
    Returns:
        List of extracted securities
    """
    securities = []
    patterns = SECURITY_PATTERNS['fidelity']
    
    # First look for positions section
    positions_match = re.search(patterns['positions_table_header'], text, re.IGNORECASE)
    if not positions_match:
        return securities
    
    # Process tables to find securities tables
    for table in tables:
        table_text = ' '.join([' '.join(str(cell) for cell in row) for row in table.df.values.tolist()])
        
        # Look for tables with position information
        if re.search(patterns['positions_table_header'], table_text, re.IGNORECASE):
            # Process each row as a potential security
            for row in table.df.values.tolist()[1:]:  # Skip header row
                # Skip empty rows
                if all(not str(cell).strip() for cell in row):
                    continue
                
                security = {}
                
                # Extract ticker (typically first column in Fidelity)
                if str(row[0]).strip() and len(str(row[0]).strip()) <= 5:
                    security['ticker'] = str(row[0]).strip()
                
                # Extract ISIN if present
                isin_match = None
                for cell in row:
                    cell_str = str(cell)
                    isin_match = re.search(patterns['isin_pattern'], cell_str)
                    if isin_match:
                        security['isin'] = isin_match.group(1)
                        break
                
                # Extract description
                # Fidelity typically has description in column 1
                if len(row) > 1 and str(row[1]).strip() and len(str(row[1])) > 5:
                    security['description'] = str(row[1]).strip()
                
                # Extract quantity, price, value
                for i, cell in enumerate(row):
                    cell_str = str(cell).strip()
                    
                    # Skip empty cells
                    if not cell_str:
                        continue
                    
                    # Look for numeric values that could be quantity, price, or value
                    if re.match(r'^-?[\d,\.]+$', cell_str.replace('$', '').strip()):
                        # Use column position to determine what this value represents
                        struct = TABLE_STRUCTURE['fidelity']
                        
                        if i == struct['quantity_column'] and 'nominal' not in security:
                            security['nominal'] = float(cell_str.replace(',', '').replace('$', ''))
                        elif i == struct['price_column'] and 'price' not in security:
                            security['price'] = float(cell_str.replace(',', '').replace('$', ''))
                        elif i == struct['value_column'] and 'value' not in security:
                            security['value'] = float(cell_str.replace(',', '').replace('$', ''))
                
                # Add currency info - Fidelity typically uses USD
                security['currency'] = 'USD'
                
                # Try to assign security type based on description (Fidelity specific)
                if 'description' in security:
                    desc = security['description'].lower()
                    if 'fund' in desc:
                        security['type'] = 'fund'
                    elif 'etf' in desc:
                        security['type'] = 'etf'
                    elif 'bond' in desc or 'treasury' in desc:
                        security['type'] = 'bond'
                    elif 'option' in desc:
                        security['type'] = 'option'
                    else:
                        security['type'] = 'equity'
                
                # Add to list if we have at least some key information
                if ('description' in security or 'ticker' in security) and any(k in security for k in ['nominal', 'value']):
                    securities.append(security)
    
    return securities

def extract_tdameritrade(text: str, tables: List[Any]) -> List[Dict[str, Any]]:
    """
    Extract securities from TD Ameritrade statements.
    
    Args:
        text: Full text of the document
        tables: List of extracted tables
        
    Returns:
        List of extracted securities
    """
    securities = []
    patterns = SECURITY_PATTERNS['tdameritrade']
    
    # First look for positions section
    positions_match = re.search(patterns['positions_table_header'], text, re.IGNORECASE)
    if not positions_match:
        return securities
    
    # Process tables to find securities tables
    for table in tables:
        table_text = ' '.join([' '.join(str(cell) for cell in row) for row in table.df.values.tolist()])
        
        # Look for tables with position information
        if re.search(patterns['positions_table_header'], table_text, re.IGNORECASE):
            # Process each row as a potential security
            for row in table.df.values.tolist()[1:]:  # Skip header row
                # Skip empty rows
                if all(not str(cell).strip() for cell in row):
                    continue
                
                security = {}
                
                # Extract ticker (typically first column in TD Ameritrade)
                if str(row[0]).strip() and len(str(row[0]).strip()) <= 5:
                    security['ticker'] = str(row[0]).strip()
                
                # Extract ISIN if present
                isin_match = None
                for cell in row:
                    cell_str = str(cell)
                    isin_match = re.search(patterns['isin_pattern'], cell_str)
                    if isin_match:
                        security['isin'] = isin_match.group(1)
                        break
                
                # Extract description
                # TD Ameritrade typically has description in column 1
                if len(row) > 1 and str(row[1]).strip() and len(str(row[1])) > 5:
                    security['description'] = str(row[1]).strip()
                
                # Extract quantity, price, value
                for i, cell in enumerate(row):
                    cell_str = str(cell).strip()
                    
                    # Skip empty cells
                    if not cell_str:
                        continue
                    
                    # Look for numeric values that could be quantity, price, or value
                    if re.match(r'^-?[\d,\.]+$', cell_str.replace('$', '').strip()):
                        # Use column position to determine what this value represents
                        struct = TABLE_STRUCTURE['tdameritrade']
                        
                        if i == struct['quantity_column'] and 'nominal' not in security:
                            security['nominal'] = float(cell_str.replace(',', '').replace('$', ''))
                        elif i == struct['price_column'] and 'price' not in security:
                            security['price'] = float(cell_str.replace(',', '').replace('$', ''))
                        elif i == struct['value_column'] and 'value' not in security:
                            security['value'] = float(cell_str.replace(',', '').replace('$', ''))
                
                # Add currency info - TD Ameritrade typically uses USD
                security['currency'] = 'USD'
                
                # Try to assign security type based on description
                if 'description' in security:
                    desc = security['description'].lower()
                    if 'fund' in desc:
                        security['type'] = 'fund'
                    elif 'etf' in desc:
                        security['type'] = 'etf'
                    elif 'bond' in desc or 'treasury' in desc:
                        security['type'] = 'bond'
                    elif 'option' in desc:
                        security['type'] = 'option'
                    else:
                        security['type'] = 'equity'
                
                # Add to list if we have at least some key information
                if ('description' in security or 'ticker' in security) and any(k in security for k in ['nominal', 'value']):
                    securities.append(security)
    
    return securities

def extract_etrade(text: str, tables: List[Any]) -> List[Dict[str, Any]]:
    """
    Extract securities from E*TRADE statements.
    
    Args:
        text: Full text of the document
        tables: List of extracted tables
        
    Returns:
        List of extracted securities
    """
    securities = []
    patterns = SECURITY_PATTERNS['etrade']
    
    # First look for positions section
    positions_match = re.search(patterns['positions_table_header'], text, re.IGNORECASE)
    if not positions_match:
        return securities
    
    # Process tables to find securities tables
    for table in tables:
        table_text = ' '.join([' '.join(str(cell) for cell in row) for row in table.df.values.tolist()])
        
        # Look for tables with position information
        if re.search(patterns['positions_table_header'], table_text, re.IGNORECASE):
            # Process each row as a potential security
            for row in table.df.values.tolist()[1:]:  # Skip header row
                # Skip empty rows
                if all(not str(cell).strip() for cell in row):
                    continue
                
                security = {}
                
                # Extract ticker (typically first column in E*TRADE)
                if str(row[0]).strip() and len(str(row[0]).strip()) <= 5:
                    security['ticker'] = str(row[0]).strip()
                
                # Extract ISIN if present
                isin_match = None
                for cell in row:
                    cell_str = str(cell)
                    isin_match = re.search(patterns['isin_pattern'], cell_str)
                    if isin_match:
                        security['isin'] = isin_match.group(1)
                        break
                
                # Extract description
                # E*TRADE typically has description in column 1
                if len(row) > 1 and str(row[1]).strip() and len(str(row[1])) > 5:
                    security['description'] = str(row[1]).strip()
                
                # Extract quantity, price, value
                for i, cell in enumerate(row):
                    cell_str = str(cell).strip()
                    
                    # Skip empty cells
                    if not cell_str:
                        continue
                    
                    # Look for numeric values that could be quantity, price, or value
                    if re.match(r'^-?[\d,\.]+$', cell_str.replace('$', '').strip()):
                        # Use column position to determine what this value represents
                        struct = TABLE_STRUCTURE['etrade']
                        
                        if i == struct['quantity_column'] and 'nominal' not in security:
                            security['nominal'] = float(cell_str.replace(',', '').replace('$', ''))
                        elif i == struct['price_column'] and 'price' not in security:
                            security['price'] = float(cell_str.replace(',', '').replace('$', ''))
                        elif i == struct['value_column'] and 'value' not in security:
                            security['value'] = float(cell_str.replace(',', '').replace('$', ''))
                
                # Add currency info - E*TRADE typically uses USD
                security['currency'] = 'USD'
                
                # Add to list if we have at least some key information
                if ('description' in security or 'ticker' in security) and any(k in security for k in ['nominal', 'value']):
                    securities.append(security)
    
    return securities

# Mapping of document types to extraction functions
EXTRACTION_FUNCTIONS = {
    'interactive_brokers': extract_interactive_brokers,
    'schwab': extract_schwab,
    'vanguard': extract_vanguard,
    'fidelity': extract_fidelity,
    'tdameritrade': extract_tdameritrade,
    'etrade': extract_etrade
}

# Helper function for document type detection
def detect_document_format(text: str) -> Optional[str]:
    """
    Detect the document format from text content.
    
    Args:
        text: Document text content
        
    Returns:
        Document type string or None if unknown
    """
    for doc_type, patterns in DOCUMENT_TYPE_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return doc_type
    
    return None