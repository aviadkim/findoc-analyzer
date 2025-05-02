"""
Financial Document Processor

This module provides a specialized document processor for financial documents.
"""

import os
import re
import json
import uuid
import logging
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime
from document_processor import DocumentProcessor

class FinancialDocumentProcessor(DocumentProcessor):
    """
    Financial document processor for extracting financial data from documents.
    
    This class extends the base DocumentProcessor to provide specialized
    functionality for processing financial documents.
    """
    
    def __init__(self, upload_dir: str = "uploads"):
        """
        Initialize the financial document processor.
        
        Args:
            upload_dir: Directory to store uploaded documents
        """
        super().__init__(upload_dir)
        
        # Create output directory
        self.output_dir = "results"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Compile common patterns
        self.isin_pattern = re.compile(r'[A-Z]{2}[A-Z0-9]{9}[0-9]')
        self.date_pattern = re.compile(r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},\s+\d{4}\b|\b\d{1,2}/\d{1,2}/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b')
        self.currency_pattern = re.compile(r'[$€£¥]\s*\d+(?:,\d{3})*(?:\.\d+)?|\d+(?:,\d{3})*(?:\.\d+)?\s*[$€£¥]')
        self.percentage_pattern = re.compile(r'\d+(?:\.\d+)?%')
        self.portfolio_pattern = re.compile(r'(?:portfolio|holdings|positions|investments|securities)\s+(?:summary|overview|details|list|statement)', re.IGNORECASE)
        
    def process_document(self, file_path: str) -> Dict[str, Any]:
        """
        Process a financial document.
        
        Args:
            file_path: Path to the document
            
        Returns:
            Dict containing the processing result
        """
        # Extract text and tables from the document
        document_data = self.extract_document_data(file_path)
        
        # Extract financial data
        financial_data = self.extract_financial_data(document_data)
        
        # Create result
        result = {
            "document_id": str(uuid.uuid4()),
            "document_name": os.path.basename(file_path),
            "processing_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "document_data": document_data,
            "financial_data": financial_data
        }
        
        return result
    
    def extract_document_data(self, file_path: str) -> Dict[str, Any]:
        """
        Extract text and tables from a document.
        
        Args:
            file_path: Path to the document
            
        Returns:
            Dict containing the extracted text and tables
        """
        # In a real implementation, this would use OCR and table extraction libraries
        # For this demo, we'll return a simulated result
        return {
            "text": "This is a simulated financial document text.",
            "tables": []
        }
    
    def extract_financial_data(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract financial data from document data.
        
        Args:
            document_data: Dict containing the document text and tables
            
        Returns:
            Dict containing the extracted financial data
        """
        text = document_data.get("text", "")
        tables = document_data.get("tables", [])
        
        # Extract ISINs
        isins = self._extract_isins(text)
        
        # Extract financial statements
        income_statement = self._extract_financial_statement(text, tables, "income")
        balance_sheet = self._extract_financial_statement(text, tables, "balance")
        cash_flow = self._extract_financial_statement(text, tables, "cash_flow")
        
        # Extract portfolio data
        portfolio = self._extract_portfolio_data(text, tables)
        
        # Extract financial metrics
        metrics = self._extract_financial_metrics(text)
        
        return {
            "isins": isins,
            "income_statement": income_statement,
            "balance_sheet": balance_sheet,
            "cash_flow": cash_flow,
            "portfolio": portfolio,
            "metrics": metrics
        }
    
    def _extract_isins(self, text: str) -> List[str]:
        """Extract ISINs from text."""
        return list(set(self.isin_pattern.findall(text)))
    
    def _extract_financial_statement(self, text: str, tables: List[Dict], statement_type: str) -> Dict[str, Any]:
        """Extract a financial statement from text and tables."""
        # Look for section containing the financial statement
        section_patterns = {
            "income": r'(?:income statement|statement of (?:income|operations|earnings)|profit and loss|p&l)',
            "balance": r'(?:balance sheet|statement of (?:financial position|financial condition))',
            "cash_flow": r'(?:cash flow statement|statement of cash flows)'
        }
        
        pattern = section_patterns.get(statement_type, "")
        if not pattern:
            return {"line_items": []}
        
        # Find the section
        section_match = re.search(pattern, text, re.IGNORECASE)
        if not section_match:
            return {"line_items": []}
        
        section_start = section_match.start()
        section_end = self._find_section_end(text, section_start)
        section_text = text[section_start:section_end]
        
        # Extract period and currency
        period = self._extract_statement_period(section_text)
        currency = self._extract_statement_currency(section_text)
        
        # Create result
        result = {
            "period": period,
            "currency": currency,
            "line_items": []
        }
        
        # Define patterns for line items based on statement type
        if statement_type == "income":
            line_item_patterns = [
                (r'revenue|sales|turnover', 'Revenue'),
                (r'cost of (?:goods sold|sales|revenue)|cogs', 'Cost of Goods Sold'),
                (r'gross profit|gross margin', 'Gross Profit'),
                (r'operating expenses|opex', 'Operating Expenses'),
                (r'research and development|r&d', 'Research and Development'),
                (r'selling, general and administrative|sg&a', 'SG&A'),
                (r'operating income|operating profit|ebit', 'Operating Income'),
                (r'interest expense', 'Interest Expense'),
                (r'interest income', 'Interest Income'),
                (r'income before tax|profit before tax|ebt', 'Income Before Tax'),
                (r'income tax|tax expense', 'Income Tax'),
                (r'net income|net profit|net earnings', 'Net Income'),
                (r'earnings per share|eps', 'Earnings Per Share'),
                (r'diluted earnings per share|diluted eps', 'Diluted Earnings Per Share'),
                (r'ebitda', 'EBITDA')
            ]
        elif statement_type == "balance":
            line_item_patterns = [
                (r'total assets', 'Total Assets'),
                (r'current assets', 'Current Assets'),
                (r'cash and cash equivalents', 'Cash and Cash Equivalents'),
                (r'short-term investments', 'Short-Term Investments'),
                (r'accounts receivable', 'Accounts Receivable'),
                (r'inventory', 'Inventory'),
                (r'non-current assets|long-term assets', 'Non-Current Assets'),
                (r'property, plant and equipment|ppe', 'Property, Plant and Equipment'),
                (r'goodwill', 'Goodwill'),
                (r'intangible assets', 'Intangible Assets'),
                (r'total liabilities', 'Total Liabilities'),
                (r'current liabilities', 'Current Liabilities'),
                (r'accounts payable', 'Accounts Payable'),
                (r'short-term debt', 'Short-Term Debt'),
                (r'non-current liabilities|long-term liabilities', 'Non-Current Liabilities'),
                (r'long-term debt', 'Long-Term Debt'),
                (r"shareholders' equity|stockholders' equity|equity", 'Shareholders\' Equity'),
                (r'retained earnings', 'Retained Earnings'),
                (r'share capital|common stock', 'Share Capital')
            ]
        elif statement_type == "cash_flow":
            line_item_patterns = [
                (r'net cash (?:from|provided by) operating activities|operating cash flow', 'Operating Cash Flow'),
                (r'net cash (?:used in|from) investing activities|investing cash flow', 'Investing Cash Flow'),
                (r'net cash (?:used in|from) financing activities|financing cash flow', 'Financing Cash Flow'),
                (r'capital expenditures|capex', 'Capital Expenditures'),
                (r'dividends paid', 'Dividends Paid'),
                (r'share repurchases|stock buyback', 'Share Repurchases'),
                (r'net (?:increase|decrease) in cash', 'Net Change in Cash'),
                (r'free cash flow', 'Free Cash Flow')
            ]
        else:
            line_item_patterns = []
        
        # Extract line items
        for pattern, label in line_item_patterns:
            matches = re.finditer(pattern, section_text, re.IGNORECASE)
            for match in matches:
                context_start = max(0, match.start() - 20)
                context_end = min(len(section_text), match.end() + 50)
                context = section_text[context_start:context_end]
                
                # Extract value
                value = self._extract_value_from_context(context)
                
                if value:
                    result["line_items"].append({
                        "label": label,
                        "value": value,
                        "context": context
                    })
        
        return result
    
    def _extract_statement_period(self, section_text: str) -> str:
        """Extract the time period for a financial statement."""
        # Look for year patterns
        year_pattern = re.compile(r'(?:year ended|fiscal year|fy|period ended|quarter ended|q[1-4]).*?\b(20\d{2})\b', re.IGNORECASE)
        year_match = year_pattern.search(section_text)
        
        if year_match:
            return year_match.group(0)
        
        # Look for date patterns
        date_matches = self.date_pattern.findall(section_text[:500])  # Check only the beginning of the section
        if date_matches:
            return date_matches[0]
        
        return ""
    
    def _extract_statement_currency(self, section_text: str) -> str:
        """Extract the currency used in a financial statement."""
        # Look for currency indicators
        currency_indicators = [
            (r'(?:in|thousands of|millions of|billions of)\s+(?:US dollars|USD)', 'USD'),
            (r'(?:in|thousands of|millions of|billions of)\s+(?:euros|EUR)', 'EUR'),
            (r'(?:in|thousands of|millions of|billions of)\s+(?:pounds sterling|GBP)', 'GBP'),
            (r'(?:in|thousands of|millions of|billions of)\s+(?:Japanese yen|JPY)', 'JPY'),
            (r'\$', 'USD'),
            (r'€', 'EUR'),
            (r'£', 'GBP'),
            (r'¥', 'JPY')
        ]
        
        for pattern, currency in currency_indicators:
            if re.search(pattern, section_text, re.IGNORECASE):
                return currency
        
        return ""
    
    def _extract_portfolio_data(self, text: str, tables: List[Dict]) -> List[Dict[str, Any]]:
        """Extract portfolio data from text and tables."""
        portfolio_items = []
        
        # First, try to extract from tables
        for table in tables:
            if self._is_portfolio_table(table):
                portfolio_items.extend(self._extract_portfolio_from_table(table))
        
        # If no items found in tables, try to extract from text
        if not portfolio_items:
            portfolio_items = self._extract_portfolio_from_text(text)
        
        return portfolio_items
    
    def _is_portfolio_table(self, table: Dict) -> bool:
        """Determine if a table contains portfolio data."""
        # Check if the table headers suggest portfolio data
        portfolio_headers = ['security', 'holding', 'position', 'stock', 'bond', 'fund', 'etf', 
                            'isin', 'cusip', 'ticker', 'symbol', 'quantity', 'shares', 'units',
                            'price', 'value', 'weight', 'allocation', 'sector', 'industry']
        
        headers = [h.lower() for h in table.get("headers", [])]
        
        # Check if at least 2 portfolio-related headers are present
        matches = sum(1 for h in headers if any(ph in h for ph in portfolio_headers))
        return matches >= 2
    
    def _extract_portfolio_from_table(self, table: Dict) -> List[Dict[str, Any]]:
        """Extract portfolio items from a table."""
        items = []
        headers = [h.lower() for h in table.get("headers", [])]
        data = table.get("data", [])
        
        # Map common header variations to standardized fields
        header_mapping = {
            'security': ['security', 'name', 'description', 'holding', 'position'],
            'isin': ['isin'],
            'cusip': ['cusip'],
            'ticker': ['ticker', 'symbol', 'code'],
            'quantity': ['quantity', 'shares', 'units', 'amount', 'position size'],
            'price': ['price', 'market price', 'last price', 'current price'],
            'value': ['value', 'market value', 'position value', 'amount'],
            'weight': ['weight', 'allocation', '%', 'percent', 'weighting'],
            'sector': ['sector', 'industry', 'category'],
            'asset_class': ['asset class', 'type', 'asset type', 'security type'],
            'currency': ['currency', 'ccy']
        }
        
        # Create a mapping from actual headers to standardized fields
        field_mapping = {}
        for std_field, variations in header_mapping.items():
            for i, header in enumerate(headers):
                if any(var in header for var in variations):
                    field_mapping[i] = std_field
                    break
        
        # Extract data using the mapping
        for row in data:
            if isinstance(row, dict):
                # Handle dict-style data
                item = {}
                for i, header in enumerate(headers):
                    if i in field_mapping:
                        std_field = field_mapping[i]
                        item[std_field] = row.get(header, "")
                
                # Extract ISIN if present in the security name but not in a dedicated column
                if 'security' in item and 'isin' not in item:
                    isin_match = self.isin_pattern.search(str(item['security']))
                    if isin_match:
                        item['isin'] = isin_match.group(0)
                
                if item:  # Only add non-empty items
                    items.append(item)
            elif isinstance(row, list):
                # Handle list-style data
                item = {}
                for i, value in enumerate(row):
                    if i in field_mapping:
                        std_field = field_mapping[i]
                        item[std_field] = value
                
                if item:  # Only add non-empty items
                    items.append(item)
        
        return items
    
    def _extract_portfolio_from_text(self, text: str) -> List[Dict[str, Any]]:
        """Extract portfolio items from text."""
        items = []
        
        # Look for portfolio section
        portfolio_matches = self.portfolio_pattern.finditer(text)
        for match in portfolio_matches:
            section_start = match.start()
            section_end = self._find_section_end(text, section_start)
            section_text = text[section_start:section_end]
            
            # Look for securities with ISINs
            security_pattern = re.compile(r'([^.!?]*?(?:' + '|'.join([
                r'[A-Z]{2}[A-Z0-9]{9}[0-9]',  # ISIN
                r'[A-Z0-9]{6,}',              # CUSIP or ticker
                r'(?:stock|share|bond|fund|etf)'
            ]) + r')[^.!?]*)', re.IGNORECASE)
            
            security_matches = security_pattern.findall(section_text)
            
            for security_text in security_matches:
                item = {}
                
                # Extract security name
                name_match = re.search(r'([A-Za-z0-9\s\.,]+)(?:\(|\s+[A-Z]{2}[A-Z0-9]{9}[0-9])', security_text)
                if name_match:
                    item['security'] = name_match.group(1).strip()
                
                # Extract ISIN
                isin_match = self.isin_pattern.search(security_text)
                if isin_match:
                    item['isin'] = isin_match.group(0)
                
                # Extract quantity
                quantity_match = re.search(r'(\d+(?:,\d{3})*(?:\.\d+)?)\s+(?:shares|units)', security_text, re.IGNORECASE)
                if quantity_match:
                    item['quantity'] = quantity_match.group(1)
                
                # Extract price
                price_match = re.search(r'(?:at|price)\s+(?:of\s+)?([€$£¥]?\s*\d+(?:,\d{3})*(?:\.\d+)?)', security_text, re.IGNORECASE)
                if price_match:
                    item['price'] = price_match.group(1)
                
                # Extract value
                value_match = re.search(r'(?:value|worth)\s+(?:of\s+)?([€$£¥]?\s*\d+(?:,\d{3})*(?:\.\d+)?)', security_text, re.IGNORECASE)
                if value_match:
                    item['value'] = value_match.group(1)
                
                if item:  # Only add non-empty items
                    items.append(item)
        
        return items
    
    def _extract_financial_metrics(self, text: str) -> Dict[str, Any]:
        """Extract key financial metrics from text."""
        metrics = {
            "profitability": [],
            "liquidity": [],
            "solvency": [],
            "valuation": [],
            "growth": [],
            "efficiency": []
        }
        
        # Profitability metrics
        profitability_patterns = [
            (r'(?:return on equity|roe)[:\s]+([0-9.]+%)', 'Return on Equity'),
            (r'(?:return on assets|roa)[:\s]+([0-9.]+%)', 'Return on Assets'),
            (r'(?:return on invested capital|roic)[:\s]+([0-9.]+%)', 'Return on Invested Capital'),
            (r'(?:net profit margin|profit margin)[:\s]+([0-9.]+%)', 'Net Profit Margin'),
            (r'(?:gross margin)[:\s]+([0-9.]+%)', 'Gross Margin'),
            (r'(?:operating margin)[:\s]+([0-9.]+%)', 'Operating Margin')
        ]
        
        # Liquidity metrics
        liquidity_patterns = [
            (r'(?:current ratio)[:\s]+([0-9.]+)', 'Current Ratio'),
            (r'(?:quick ratio|acid-test ratio)[:\s]+([0-9.]+)', 'Quick Ratio'),
            (r'(?:cash ratio)[:\s]+([0-9.]+)', 'Cash Ratio'),
            (r'(?:working capital)[:\s]+([€$£¥]?\s*\d+(?:,\d{3})*(?:\.\d+)?)', 'Working Capital')
        ]
        
        # Solvency metrics
        solvency_patterns = [
            (r'(?:debt-to-equity|debt to equity)[:\s]+([0-9.]+)', 'Debt to Equity'),
            (r'(?:debt-to-assets|debt to assets)[:\s]+([0-9.]+)', 'Debt to Assets'),
            (r'(?:interest coverage)[:\s]+([0-9.]+)', 'Interest Coverage'),
            (r'(?:debt service coverage)[:\s]+([0-9.]+)', 'Debt Service Coverage')
        ]
        
        # Valuation metrics
        valuation_patterns = [
            (r'(?:price-to-earnings|price to earnings|p/e|pe ratio)[:\s]+([0-9.]+)', 'P/E Ratio'),
            (r'(?:price-to-book|price to book|p/b|pb ratio)[:\s]+([0-9.]+)', 'P/B Ratio'),
            (r'(?:price-to-sales|price to sales|p/s|ps ratio)[:\s]+([0-9.]+)', 'P/S Ratio'),
            (r'(?:enterprise value to ebitda|ev/ebitda)[:\s]+([0-9.]+)', 'EV/EBITDA'),
            (r'(?:dividend yield)[:\s]+([0-9.]+%)', 'Dividend Yield')
        ]
        
        # Growth metrics
        growth_patterns = [
            (r'(?:revenue growth|sales growth)[:\s]+([0-9.]+%)', 'Revenue Growth'),
            (r'(?:earnings growth)[:\s]+([0-9.]+%)', 'Earnings Growth'),
            (r'(?:dividend growth)[:\s]+([0-9.]+%)', 'Dividend Growth'),
            (r'(?:book value growth)[:\s]+([0-9.]+%)', 'Book Value Growth')
        ]
        
        # Efficiency metrics
        efficiency_patterns = [
            (r'(?:asset turnover)[:\s]+([0-9.]+)', 'Asset Turnover'),
            (r'(?:inventory turnover)[:\s]+([0-9.]+)', 'Inventory Turnover'),
            (r'(?:receivables turnover)[:\s]+([0-9.]+)', 'Receivables Turnover'),
            (r'(?:days sales outstanding|dso)[:\s]+([0-9.]+)', 'Days Sales Outstanding'),
            (r'(?:days inventory outstanding|dio)[:\s]+([0-9.]+)', 'Days Inventory Outstanding')
        ]
        
        # Extract metrics for each category
        metrics["profitability"] = self._extract_metrics(text, profitability_patterns)
        metrics["liquidity"] = self._extract_metrics(text, liquidity_patterns)
        metrics["solvency"] = self._extract_metrics(text, solvency_patterns)
        metrics["valuation"] = self._extract_metrics(text, valuation_patterns)
        metrics["growth"] = self._extract_metrics(text, growth_patterns)
        metrics["efficiency"] = self._extract_metrics(text, efficiency_patterns)
        
        return metrics
    
    def _extract_metrics(self, text: str, patterns: List[Tuple[str, str]]) -> List[Dict[str, str]]:
        """Extract metrics based on patterns."""
        metrics = []
        
        for pattern, label in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                if len(match.groups()) > 0:
                    value = match.group(1)
                    context_start = max(0, match.start() - 30)
                    context_end = min(len(text), match.end() + 30)
                    context = text[context_start:context_end]
                    
                    metrics.append({
                        "label": label,
                        "value": value,
                        "context": context
                    })
        
        return metrics
    
    def _find_section_end(self, text: str, section_start: int) -> int:
        """Find the end of a section."""
        # Look for the next section heading
        section_headings = [
            r'income statement',
            r'balance sheet',
            r'cash flow statement',
            r'statement of financial position',
            r'statement of cash flows',
            r'notes to the financial statements',
            r'management discussion and analysis',
            r'risk factors',
            r'portfolio holdings',
            r'investment summary'
        ]
        
        pattern = '|'.join(section_headings)
        matches = list(re.finditer(pattern, text, re.IGNORECASE))
        
        # Find the next section heading after the current section
        for match in matches:
            if match.start() > section_start + 100:  # Ensure we're not matching the current section
                return match.start()
        
        # If no next section found, return the end of the text
        return len(text)
    
    def _extract_value_from_context(self, context: str) -> str:
        """Extract a financial value from context."""
        # Look for currency values
        currency_matches = self.currency_pattern.findall(context)
        if currency_matches:
            return currency_matches[0]
        
        # Look for percentage values
        percentage_matches = self.percentage_pattern.findall(context)
        if percentage_matches:
            return percentage_matches[0]
        
        # Look for numeric values
        numeric_pattern = re.compile(r'\d+(?:,\d{3})*(?:\.\d+)?')
        numeric_matches = numeric_pattern.findall(context)
        if numeric_matches:
            return numeric_matches[0]
        
        return ""
    
    def save_uploaded_file(self, file, filename: str) -> str:
        """Save an uploaded file to the upload directory."""
        return super().save_uploaded_file(file, filename)
