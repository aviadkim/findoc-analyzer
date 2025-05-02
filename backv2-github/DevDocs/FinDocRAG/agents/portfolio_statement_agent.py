"""
Portfolio statement agent for processing portfolio statements.
"""
import logging
import json
import re
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class PortfolioStatementAgent:
    """
    Process portfolio statements.
    """
    
    def __init__(self, ai_service):
        """
        Initialize the portfolio statement agent.
        
        Args:
            ai_service: AI service proxy for API calls
        """
        self.ai_service = ai_service
    
    def process(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a portfolio statement.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Processed document data
        """
        logger.info(f"Processing portfolio statement {document_data.get('document_id')}")
        
        # Extract basic information
        basic_info = self._extract_basic_info(document_data)
        
        # Extract securities
        securities = self._extract_securities(document_data)
        
        # Extract asset allocation
        asset_allocation = self._extract_asset_allocation(document_data)
        
        # Extract performance metrics
        performance_metrics = self._extract_performance_metrics(document_data)
        
        # Compile results
        results = {
            "basic_info": basic_info,
            "securities": securities,
            "asset_allocation": asset_allocation,
            "performance_metrics": performance_metrics,
            "summary": self._generate_summary(basic_info, securities, asset_allocation, performance_metrics)
        }
        
        return results
    
    def _extract_basic_info(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract basic information from the portfolio statement.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Basic information
        """
        # Get financial data
        financial_data = document_data.get("financial_data", {})
        
        # Extract basic information
        basic_info = {
            "total_value": financial_data.get("total_value", 0),
            "currency": financial_data.get("currency", "USD"),
            "statement_date": self._extract_statement_date(document_data),
            "account_number": self._extract_account_number(document_data),
            "account_name": self._extract_account_name(document_data)
        }
        
        return basic_info
    
    def _extract_statement_date(self, document_data: Dict[str, Any]) -> str:
        """
        Extract statement date from the portfolio statement.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Statement date
        """
        # Get full text
        full_text = document_data.get("full_text", "")
        
        # Look for date patterns
        date_patterns = [
            r'(?:statement|valuation|as of|dated)(?:\s+date)?(?:\s*[:;])?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})',
            r'(?:statement|valuation|as of|dated)(?:\s+date)?(?:\s*[:;])?\s*(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{2,4})',
            r'(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return ""
    
    def _extract_account_number(self, document_data: Dict[str, Any]) -> str:
        """
        Extract account number from the portfolio statement.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Account number
        """
        # Get full text
        full_text = document_data.get("full_text", "")
        
        # Look for account number patterns
        account_patterns = [
            r'(?:account|portfolio|a/c)(?:\s+number)?(?:\s*[:;])?\s*([A-Z0-9]{5,20})',
            r'(?:account|portfolio|a/c)(?:\s+number)?(?:\s*[:;])?\s*([A-Z0-9]{3,10}[-\s][A-Z0-9]{3,10})'
        ]
        
        for pattern in account_patterns:
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return ""
    
    def _extract_account_name(self, document_data: Dict[str, Any]) -> str:
        """
        Extract account name from the portfolio statement.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Account name
        """
        # Get full text
        full_text = document_data.get("full_text", "")
        
        # Look for account name patterns
        name_patterns = [
            r'(?:account|portfolio)(?:\s+name)?(?:\s*[:;])?\s*([A-Za-z\s]{5,50})',
            r'(?:client|customer|investor)(?:\s+name)?(?:\s*[:;])?\s*([A-Za-z\s]{5,50})'
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return ""
    
    def _extract_securities(self, document_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract securities from the portfolio statement.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            List of securities
        """
        # Get financial data
        financial_data = document_data.get("financial_data", {})
        
        # Get securities
        securities = financial_data.get("securities", [])
        
        # Enhance securities with additional information
        enhanced_securities = []
        
        for security in securities:
            # Get ISIN
            isin = security.get("identifier", "")
            
            # Enhance with additional information
            enhanced_security = {
                "name": security.get("name", ""),
                "identifier": isin,
                "quantity": security.get("quantity"),
                "value": security.get("value"),
                "currency": financial_data.get("currency", "USD"),
                "asset_class": self._determine_asset_class(security, document_data),
                "price": self._extract_price(security, document_data),
                "price_date": self._extract_price_date(security, document_data)
            }
            
            enhanced_securities.append(enhanced_security)
        
        return enhanced_securities
    
    def _determine_asset_class(self, security: Dict[str, Any], document_data: Dict[str, Any]) -> str:
        """
        Determine the asset class of a security.
        
        Args:
            security: Security data
            document_data: Document data from the document processor
            
        Returns:
            Asset class
        """
        # Get security name
        name = security.get("name", "").lower()
        
        # Check for common asset classes
        if "bond" in name or "fixed income" in name:
            return "Bonds"
        elif "equity" in name or "stock" in name or "share" in name:
            return "Equities"
        elif "fund" in name or "etf" in name:
            return "Funds"
        elif "cash" in name or "money market" in name:
            return "Cash"
        elif "commodity" in name or "gold" in name or "silver" in name:
            return "Commodities"
        elif "real estate" in name or "property" in name or "reit" in name:
            return "Real Estate"
        elif "structured" in name or "certificate" in name or "note" in name:
            return "Structured Products"
        elif "option" in name or "future" in name or "swap" in name:
            return "Derivatives"
        
        # Check asset allocation
        financial_data = document_data.get("financial_data", {})
        asset_allocation = financial_data.get("asset_allocation", {})
        
        for asset_class, percentage in asset_allocation.items():
            if asset_class.lower() in name:
                return asset_class
        
        return "Other"
    
    def _extract_price(self, security: Dict[str, Any], document_data: Dict[str, Any]) -> float:
        """
        Extract the price of a security.
        
        Args:
            security: Security data
            document_data: Document data from the document processor
            
        Returns:
            Security price
        """
        # Check if we can calculate price from quantity and value
        quantity = security.get("quantity")
        value = security.get("value")
        
        if quantity and value and float(quantity) > 0:
            try:
                return float(value) / float(quantity)
            except (ValueError, ZeroDivisionError):
                pass
        
        # Look for price in tables
        isin = security.get("identifier", "")
        
        if isin:
            for table in document_data.get("tables", []):
                if "data" not in table:
                    continue
                
                for row in table["data"]:
                    # Check if row contains the ISIN
                    row_str = str(row)
                    if isin in row_str:
                        # Look for price column
                        for key, value in row.items():
                            if "price" in str(key).lower() and self._is_numeric(value):
                                try:
                                    return float(self._clean_numeric(value))
                                except ValueError:
                                    pass
        
        return 0.0
    
    def _extract_price_date(self, security: Dict[str, Any], document_data: Dict[str, Any]) -> str:
        """
        Extract the price date of a security.
        
        Args:
            security: Security data
            document_data: Document data from the document processor
            
        Returns:
            Price date
        """
        # Look for price date in tables
        isin = security.get("identifier", "")
        
        if isin:
            for table in document_data.get("tables", []):
                if "data" not in table:
                    continue
                
                for row in table["data"]:
                    # Check if row contains the ISIN
                    row_str = str(row)
                    if isin in row_str:
                        # Look for date column
                        for key, value in row.items():
                            if "date" in str(key).lower() and self._is_date(value):
                                return str(value)
        
        # Use statement date as fallback
        return self._extract_statement_date(document_data)
    
    def _extract_asset_allocation(self, document_data: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract asset allocation from the portfolio statement.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Asset allocation
        """
        # Get financial data
        financial_data = document_data.get("financial_data", {})
        
        # Get asset allocation
        asset_allocation = financial_data.get("asset_allocation", {})
        
        # If no asset allocation, try to calculate from securities
        if not asset_allocation:
            securities = self._extract_securities(document_data)
            
            if securities:
                # Group securities by asset class
                asset_classes = {}
                total_value = 0.0
                
                for security in securities:
                    asset_class = security.get("asset_class", "Other")
                    value = security.get("value", 0)
                    
                    if value:
                        try:
                            value_float = float(value)
                            total_value += value_float
                            
                            if asset_class not in asset_classes:
                                asset_classes[asset_class] = 0
                            
                            asset_classes[asset_class] += value_float
                        except ValueError:
                            pass
                
                # Calculate percentages
                if total_value > 0:
                    for asset_class, value in asset_classes.items():
                        asset_allocation[asset_class] = round(value / total_value * 100, 2)
        
        return asset_allocation
    
    def _extract_performance_metrics(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract performance metrics from the portfolio statement.
        
        Args:
            document_data: Document data from the document processor
            
        Returns:
            Performance metrics
        """
        # Get full text
        full_text = document_data.get("full_text", "")
        
        # Look for performance metrics
        performance_metrics = {
            "ytd_return": self._extract_metric(full_text, r'(?:ytd|year[\s-]*to[\s-]*date)(?:\s+return)?(?:\s*[:;])?\s*([-+]?\d+\.?\d*)\s*%'),
            "1y_return": self._extract_metric(full_text, r'(?:1[\s-]*year|12[\s-]*month)(?:\s+return)?(?:\s*[:;])?\s*([-+]?\d+\.?\d*)\s*%'),
            "3y_return": self._extract_metric(full_text, r'(?:3[\s-]*year|36[\s-]*month)(?:\s+return)?(?:\s*[:;])?\s*([-+]?\d+\.?\d*)\s*%'),
            "5y_return": self._extract_metric(full_text, r'(?:5[\s-]*year|60[\s-]*month)(?:\s+return)?(?:\s*[:;])?\s*([-+]?\d+\.?\d*)\s*%'),
            "volatility": self._extract_metric(full_text, r'(?:volatility|standard[\s-]*deviation)(?:\s*[:;])?\s*(\d+\.?\d*)\s*%'),
            "sharpe_ratio": self._extract_metric(full_text, r'(?:sharpe[\s-]*ratio)(?:\s*[:;])?\s*([-+]?\d+\.?\d*)')
        }
        
        return performance_metrics
    
    def _extract_metric(self, text: str, pattern: str) -> float:
        """
        Extract a metric from text.
        
        Args:
            text: Text to extract from
            pattern: Regex pattern
            
        Returns:
            Extracted metric
        """
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass
        
        return 0.0
    
    def _generate_summary(self, basic_info: Dict[str, Any], securities: List[Dict[str, Any]], 
                         asset_allocation: Dict[str, float], performance_metrics: Dict[str, Any]) -> str:
        """
        Generate a summary of the portfolio statement.
        
        Args:
            basic_info: Basic information
            securities: List of securities
            asset_allocation: Asset allocation
            performance_metrics: Performance metrics
            
        Returns:
            Summary
        """
        # Create prompt
        prompt = f"""
        Generate a concise summary of this portfolio statement:
        
        Basic Information:
        - Total Value: {basic_info.get('total_value', 0)} {basic_info.get('currency', 'USD')}
        - Statement Date: {basic_info.get('statement_date', '')}
        - Account Number: {basic_info.get('account_number', '')}
        - Account Name: {basic_info.get('account_name', '')}
        
        Securities:
        {json.dumps(securities[:5], indent=2)}
        
        Asset Allocation:
        {json.dumps(asset_allocation, indent=2)}
        
        Performance Metrics:
        {json.dumps(performance_metrics, indent=2)}
        
        Keep the summary concise and focused on the key financial information.
        """
        
        # Call AI service
        try:
            summary = self.ai_service.call_text_api(prompt)
            return summary
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return f"Portfolio statement with total value {basic_info.get('total_value', 0)} {basic_info.get('currency', 'USD')} and {len(securities)} securities."
    
    def _is_numeric(self, value: Any) -> bool:
        """
        Check if a value is numeric.
        
        Args:
            value: Value to check
            
        Returns:
            True if numeric, False otherwise
        """
        if value is None:
            return False
        
        # Convert to string
        value_str = str(value)
        
        # Remove common formatting
        value_str = value_str.replace(",", "").replace("'", "").replace(" ", "")
        
        # Check if it's a number
        try:
            float(value_str)
            return True
        except ValueError:
            return False
    
    def _clean_numeric(self, value: Any) -> float:
        """
        Clean a numeric value.
        
        Args:
            value: Value to clean
            
        Returns:
            Cleaned numeric value
        """
        if value is None:
            return 0.0
        
        # Convert to string
        value_str = str(value)
        
        # Remove common formatting
        value_str = value_str.replace(",", "").replace("'", "").replace(" ", "")
        
        # Remove currency symbols
        currency_symbols = ["$", "€", "£", "¥", "Fr."]
        for symbol in currency_symbols:
            value_str = value_str.replace(symbol, "")
        
        # Remove percentage sign
        value_str = value_str.replace("%", "")
        
        # Convert to float
        return float(value_str)
    
    def _is_date(self, value: Any) -> bool:
        """
        Check if a value is a date.
        
        Args:
            value: Value to check
            
        Returns:
            True if date, False otherwise
        """
        if value is None:
            return False
        
        # Convert to string
        value_str = str(value)
        
        # Check common date formats
        date_patterns = [
            r'\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}',
            r'\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{2,4}'
        ]
        
        for pattern in date_patterns:
            if re.match(pattern, value_str):
                return True
        
        return False
