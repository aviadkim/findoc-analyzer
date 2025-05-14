"""
Financial Data Analyzer Agent for analyzing financial data.
"""
import pandas as pd
import numpy as np
import json
import os
from typing import Dict, Any, List, Optional, Union
from .base_agent import BaseAgent

class FinancialDataAnalyzerAgent(BaseAgent):
    """Agent for analyzing financial data."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize the financial data analyzer agent.

        Args:
            api_key: OpenRouter API key
            **kwargs: Additional parameters for the base agent
        """
        super().__init__(name="Financial Data Analyzer")
        self.api_key = api_key
        self.description = "I analyze financial data and provide insights."

    def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task to analyze financial data.

        Args:
            task: Task dictionary with the following keys:
                - document: Financial document data
                - or
                - table_data: Table data
                - analysis_type: Type of analysis to perform (optional)

        Returns:
            Dictionary with analysis results
        """
        # Get the analysis type
        analysis_type = task.get('analysis_type', 'comprehensive')

        # Get the data
        if 'document' in task:
            document = task['document']
            return self.analyze_document(document, analysis_type)
        elif 'table_data' in task:
            table_data = task['table_data']
            return self.analyze_table_data(table_data, analysis_type)
        else:
            # For backward compatibility, assume the task itself is the document
            if 'metadata' in task and 'financial_data' in task:
                return self.analyze_document(task, analysis_type)
            else:
                raise ValueError("Task must contain 'document' or 'table_data'")

    def analyze_document(self, document: Dict[str, Any], analysis_type: str) -> Dict[str, Any]:
        """
        Analyze a financial document.

        Args:
            document: Financial document data
            analysis_type: Type of analysis to perform

        Returns:
            Dictionary with analysis results
        """
        # Check if the document has the required structure
        if 'metadata' not in document or 'financial_data' not in document:
            raise ValueError("Document must contain 'metadata' and 'financial_data'")

        # Extract metadata
        metadata = document['metadata']
        document_type = metadata.get('document_type', 'unknown')
        document_date = metadata.get('document_date', '')
        client_name = metadata.get('client_name', '')
        client_number = metadata.get('client_number', '')
        valuation_currency = metadata.get('valuation_currency', 'USD')

        # Extract financial data
        financial_data = document['financial_data']

        # Perform analysis based on document type
        if document_type == 'portfolio_statement':
            return self._analyze_portfolio(financial_data, analysis_type, valuation_currency)
        elif document_type == 'asset_allocation':
            return self._analyze_asset_allocation(financial_data, analysis_type, valuation_currency)
        elif document_type == 'income_statement':
            return self._analyze_income_statement(financial_data, analysis_type, valuation_currency)
        elif document_type == 'balance_sheet':
            return self._analyze_balance_sheet(financial_data, analysis_type, valuation_currency)
        else:
            # Generic analysis
            return self._analyze_generic(financial_data, analysis_type, valuation_currency)

    def analyze_table_data(self, table_data: Dict[str, Any], analysis_type: str) -> Dict[str, Any]:
        """
        Analyze table data.

        Args:
            table_data: Table data
            analysis_type: Type of analysis to perform

        Returns:
            Dictionary with analysis results
        """
        # Check if the table data has the required structure
        if 'data' not in table_data:
            raise ValueError("Table data must contain 'data'")

        # Extract table data
        data = table_data['data']
        table_type = table_data.get('type', 'unknown')

        # Convert data to DataFrame if it's not already
        if not isinstance(data, pd.DataFrame):
            if isinstance(data, list):
                # If it's a list of dictionaries, convert to DataFrame
                if data and isinstance(data[0], dict):
                    df = pd.DataFrame(data)
                # If it's a list of lists, convert to DataFrame
                elif data and isinstance(data[0], list):
                    df = pd.DataFrame(data)
                    # If the first row looks like headers, use it as columns
                    if all(isinstance(val, str) for val in data[0]):
                        df.columns = data[0]
                        df = df.iloc[1:]
                else:
                    raise ValueError("Table data format not supported")
            else:
                raise ValueError("Table data format not supported")
        else:
            df = data

        # Perform analysis based on table type
        if table_type == 'portfolio':
            return self._analyze_portfolio_table(df, analysis_type)
        elif table_type == 'asset_allocation':
            return self._analyze_asset_allocation_table(df, analysis_type)
        elif table_type == 'income_statement':
            return self._analyze_income_statement_table(df, analysis_type)
        elif table_type == 'balance_sheet':
            return self._analyze_balance_sheet_table(df, analysis_type)
        else:
            # Generic analysis
            return self._analyze_generic_table(df, analysis_type)

    def _analyze_portfolio(self, financial_data: Dict[str, Any], analysis_type: str, currency: str) -> Dict[str, Any]:
        """
        Analyze portfolio data.

        Args:
            financial_data: Financial data
            analysis_type: Type of analysis to perform
            currency: Valuation currency

        Returns:
            Dictionary with analysis results
        """
        # Check if the financial data has the required structure
        if 'portfolio' not in financial_data:
            raise ValueError("Financial data must contain 'portfolio'")

        portfolio = financial_data['portfolio']
        securities = portfolio.get('securities', [])
        summary = portfolio.get('summary', {})

        # Convert securities to DataFrame
        if securities:
            securities_df = pd.DataFrame(securities)
        else:
            securities_df = pd.DataFrame()

        # Calculate asset allocation
        asset_allocation = self._calculate_asset_allocation(securities_df)

        # Calculate risk metrics
        risk_metrics = self._calculate_risk_metrics(securities_df)

        # Calculate performance metrics
        performance_metrics = self._calculate_performance_metrics(securities_df)

        # Calculate diversification metrics
        diversification_metrics = self._calculate_diversification_metrics(securities_df)

        # Prepare analysis results
        analysis = {
            'document_type': 'portfolio_statement',
            'analysis_type': analysis_type,
            'currency': currency,
            'summary': summary,
            'asset_allocation': asset_allocation,
            'risk_metrics': risk_metrics,
            'performance_metrics': performance_metrics,
            'diversification_metrics': diversification_metrics
        }

        return {
            'status': 'success',
            'analysis': analysis
        }

    def _analyze_asset_allocation(self, financial_data: Dict[str, Any], analysis_type: str, currency: str) -> Dict[str, Any]:
        """
        Analyze asset allocation data.

        Args:
            financial_data: Financial data
            analysis_type: Type of analysis to perform
            currency: Valuation currency

        Returns:
            Dictionary with analysis results
        """
        # Check if the financial data has the required structure
        if 'asset_allocation' not in financial_data:
            raise ValueError("Financial data must contain 'asset_allocation'")

        asset_allocation = financial_data['asset_allocation']

        # Convert asset allocation to DataFrame
        asset_allocation_df = pd.DataFrame([
            {'type': asset_type, 'value': data['value'], 'weight': data['weight']}
            for asset_type, data in asset_allocation.items()
        ])

        # Calculate diversification metrics
        diversification_metrics = {
            'asset_count': len(asset_allocation),
            'concentration': self._calculate_concentration(asset_allocation_df['weight'].values if not asset_allocation_df.empty else [])
        }

        # Prepare analysis results
        analysis = {
            'document_type': 'asset_allocation',
            'analysis_type': analysis_type,
            'currency': currency,
            'asset_allocation': asset_allocation,
            'diversification_metrics': diversification_metrics
        }

        return {
            'status': 'success',
            'analysis': analysis
        }

    def _analyze_income_statement(self, financial_data: Dict[str, Any], analysis_type: str, currency: str) -> Dict[str, Any]:
        """
        Analyze income statement data.

        Args:
            financial_data: Financial data
            analysis_type: Type of analysis to perform
            currency: Valuation currency

        Returns:
            Dictionary with analysis results
        """
        # Check if the financial data has the required structure
        if 'income_statement' not in financial_data:
            raise ValueError("Financial data must contain 'income_statement'")

        income_statement = financial_data['income_statement']
        revenues = income_statement.get('revenues', {})
        expenses = income_statement.get('expenses', {})
        profits = income_statement.get('profits', {})
        summary = income_statement.get('summary', {})

        # Calculate total revenue
        total_revenue = sum(value for value in revenues.values() if isinstance(value, (int, float)))

        # Calculate total expenses
        total_expenses = sum(value for value in expenses.values() if isinstance(value, (int, float)))

        # Calculate net profit
        net_profit = total_revenue - total_expenses

        # Calculate profit margin
        profit_margin = (net_profit / total_revenue) * 100 if total_revenue > 0 else 0

        # Prepare analysis results
        analysis = {
            'document_type': 'income_statement',
            'analysis_type': analysis_type,
            'currency': currency,
            'summary': {
                'total_revenue': total_revenue,
                'total_expenses': total_expenses,
                'net_profit': net_profit,
                'profit_margin': profit_margin
            },
            'revenues': revenues,
            'expenses': expenses,
            'profits': profits
        }

        return {
            'status': 'success',
            'analysis': analysis
        }

    def _analyze_balance_sheet(self, financial_data: Dict[str, Any], analysis_type: str, currency: str) -> Dict[str, Any]:
        """
        Analyze balance sheet data.

        Args:
            financial_data: Financial data
            analysis_type: Type of analysis to perform
            currency: Valuation currency

        Returns:
            Dictionary with analysis results
        """
        # Check if the financial data has the required structure
        if 'balance_sheet' not in financial_data:
            raise ValueError("Financial data must contain 'balance_sheet'")

        balance_sheet = financial_data['balance_sheet']
        assets = balance_sheet.get('assets', {})
        liabilities = balance_sheet.get('liabilities', {})
        equity = balance_sheet.get('equity', {})
        summary = balance_sheet.get('summary', {})

        # Calculate total assets
        total_assets = sum(value for value in assets.values() if isinstance(value, (int, float)))

        # Calculate total liabilities
        total_liabilities = sum(value for value in liabilities.values() if isinstance(value, (int, float)))

        # Calculate total equity
        total_equity = sum(value for value in equity.values() if isinstance(value, (int, float)))

        # Calculate debt-to-equity ratio
        debt_to_equity = total_liabilities / total_equity if total_equity > 0 else float('inf')

        # Calculate current ratio (if current assets and liabilities are available)
        current_assets = assets.get('current_assets', 0)
        current_liabilities = liabilities.get('current_liabilities', 0)
        current_ratio = current_assets / current_liabilities if current_liabilities > 0 else float('inf')

        # Prepare analysis results
        analysis = {
            'document_type': 'balance_sheet',
            'analysis_type': analysis_type,
            'currency': currency,
            'summary': {
                'total_assets': total_assets,
                'total_liabilities': total_liabilities,
                'total_equity': total_equity,
                'debt_to_equity': debt_to_equity,
                'current_ratio': current_ratio
            },
            'assets': assets,
            'liabilities': liabilities,
            'equity': equity
        }

        return {
            'status': 'success',
            'analysis': analysis
        }

    def _analyze_generic(self, financial_data: Dict[str, Any], analysis_type: str, currency: str) -> Dict[str, Any]:
        """
        Analyze generic financial data.

        Args:
            financial_data: Financial data
            analysis_type: Type of analysis to perform
            currency: Valuation currency

        Returns:
            Dictionary with analysis results
        """
        # Try to identify the type of financial data
        if 'portfolio' in financial_data:
            return self._analyze_portfolio(financial_data, analysis_type, currency)
        elif 'asset_allocation' in financial_data:
            return self._analyze_asset_allocation(financial_data, analysis_type, currency)
        elif 'income_statement' in financial_data:
            return self._analyze_income_statement(financial_data, analysis_type, currency)
        elif 'balance_sheet' in financial_data:
            return self._analyze_balance_sheet(financial_data, analysis_type, currency)
        else:
            # Prepare generic analysis results
            analysis = {
                'document_type': 'generic',
                'analysis_type': analysis_type,
                'currency': currency,
                'data': financial_data
            }

            return {
                'status': 'success',
                'analysis': analysis
            }

    def _analyze_portfolio_table(self, df: pd.DataFrame, analysis_type: str) -> Dict[str, Any]:
        """
        Analyze portfolio table data.

        Args:
            df: Portfolio table data
            analysis_type: Type of analysis to perform

        Returns:
            Dictionary with analysis results
        """
        # Normalize column names
        df.columns = [col.lower() for col in df.columns]

        # Map common column names
        column_mapping = {
            'security': 'description',
            'name': 'description',
            'ticker': 'symbol',
            'symbol': 'symbol',
            'price': 'price',
            'quantity': 'quantity',
            'value': 'value',
            'weight': 'weight',
            'percentage': 'weight',
            '%': 'weight',
            'type': 'type',
            'asset class': 'type',
            'asset type': 'type',
            'asset': 'type'
        }

        # Rename columns based on mapping
        for col in df.columns:
            for key, value in column_mapping.items():
                if key in col:
                    df = df.rename(columns={col: value})
                    break

        # Calculate asset allocation
        asset_allocation = self._calculate_asset_allocation(df)

        # Calculate risk metrics
        risk_metrics = self._calculate_risk_metrics(df)

        # Calculate performance metrics
        performance_metrics = self._calculate_performance_metrics(df)

        # Calculate diversification metrics
        diversification_metrics = self._calculate_diversification_metrics(df)

        # Prepare analysis results
        analysis = {
            'document_type': 'portfolio_statement',
            'analysis_type': analysis_type,
            'summary': {
                'total_value': df['value'].sum() if 'value' in df.columns else 0,
                'total_securities': len(df)
            },
            'asset_allocation': asset_allocation,
            'risk_metrics': risk_metrics,
            'performance_metrics': performance_metrics,
            'diversification_metrics': diversification_metrics
        }

        return {
            'status': 'success',
            'analysis': analysis
        }

    def _analyze_asset_allocation_table(self, df: pd.DataFrame, analysis_type: str) -> Dict[str, Any]:
        """
        Analyze asset allocation table data.

        Args:
            df: Asset allocation table data
            analysis_type: Type of analysis to perform

        Returns:
            Dictionary with analysis results
        """
        # Normalize column names
        df.columns = [col.lower() for col in df.columns]

        # Map common column names
        column_mapping = {
            'asset class': 'type',
            'asset type': 'type',
            'asset': 'type',
            'class': 'type',
            'category': 'type',
            'allocation': 'weight',
            'percentage': 'weight',
            '%': 'weight',
            'amount': 'value',
            'total': 'value'
        }

        # Rename columns based on mapping
        for col in df.columns:
            for key, value in column_mapping.items():
                if key in col:
                    df = df.rename(columns={col: value})
                    break

        # Calculate diversification metrics
        diversification_metrics = {
            'asset_count': len(df),
            'concentration': self._calculate_concentration(df['weight'].values if 'weight' in df.columns else [])
        }

        # Prepare analysis results
        analysis = {
            'document_type': 'asset_allocation',
            'analysis_type': analysis_type,
            'asset_allocation': df.to_dict(orient='records'),
            'diversification_metrics': diversification_metrics
        }

        return {
            'status': 'success',
            'analysis': analysis
        }

    def _analyze_income_statement_table(self, df: pd.DataFrame, analysis_type: str) -> Dict[str, Any]:
        """
        Analyze income statement table data.

        Args:
            df: Income statement table data
            analysis_type: Type of analysis to perform

        Returns:
            Dictionary with analysis results
        """
        # Normalize column names
        df.columns = [col.lower() for col in df.columns]

        # Identify revenue, expense, and profit rows
        revenue_rows = []
        expense_rows = []
        profit_rows = []

        # Keywords for identification
        revenue_keywords = ["revenue", "income", "sales", "turnover"]
        expense_keywords = ["expense", "cost", "expenditure", "payment"]
        profit_keywords = ["profit", "loss", "margin", "earnings", "ebitda", "ebit"]

        for idx, row in df.iterrows():
            row_text = ' '.join(str(val) for val in row.values).lower()

            is_revenue = any(keyword in row_text for keyword in revenue_keywords)
            is_expense = any(keyword in row_text for keyword in expense_keywords)
            is_profit = any(keyword in row_text for keyword in profit_keywords)

            if is_revenue and not is_expense:
                revenue_rows.append(idx)
            if is_expense and not is_revenue:
                expense_rows.append(idx)
            if is_profit:
                profit_rows.append(idx)

        # Extract data
        revenues = {}
        expenses = {}
        profits = {}

        # Extract revenue data
        for idx in revenue_rows:
            row = df.iloc[idx]
            label = str(row.iloc[0])
            value = self._extract_numeric_value(row)
            if value is not None:
                revenues[label] = value

        # Extract expense data
        for idx in expense_rows:
            row = df.iloc[idx]
            label = str(row.iloc[0])
            value = self._extract_numeric_value(row)
            if value is not None:
                expenses[label] = value

        # Extract profit data
        for idx in profit_rows:
            row = df.iloc[idx]
            label = str(row.iloc[0])
            value = self._extract_numeric_value(row)
            if value is not None:
                profits[label] = value

        # Calculate total revenue
        total_revenue = sum(revenues.values())

        # Calculate total expenses
        total_expenses = sum(expenses.values())

        # Calculate net profit
        net_profit = total_revenue - total_expenses

        # Calculate profit margin
        profit_margin = (net_profit / total_revenue) * 100 if total_revenue > 0 else 0

        # Prepare analysis results
        analysis = {
            'document_type': 'income_statement',
            'analysis_type': analysis_type,
            'summary': {
                'total_revenue': total_revenue,
                'total_expenses': total_expenses,
                'net_profit': net_profit,
                'profit_margin': profit_margin
            },
            'revenues': revenues,
            'expenses': expenses,
            'profits': profits
        }

        return {
            'status': 'success',
            'analysis': analysis
        }

    def _analyze_balance_sheet_table(self, df: pd.DataFrame, analysis_type: str) -> Dict[str, Any]:
        """
        Analyze balance sheet table data.

        Args:
            df: Balance sheet table data
            analysis_type: Type of analysis to perform

        Returns:
            Dictionary with analysis results
        """
        # Normalize column names
        df.columns = [col.lower() for col in df.columns]

        # Identify asset, liability, and equity rows
        asset_rows = []
        liability_rows = []
        equity_rows = []

        # Keywords for identification
        asset_keywords = ["asset", "investment", "cash", "inventory", "receivable"]
        liability_keywords = ["liability", "debt", "payable", "loan", "credit"]
        equity_keywords = ["equity", "capital", "shareholder", "retained", "earnings"]

        for idx, row in df.iterrows():
            row_text = ' '.join(str(val) for val in row.values).lower()

            is_asset = any(keyword in row_text for keyword in asset_keywords)
            is_liability = any(keyword in row_text for keyword in liability_keywords)
            is_equity = any(keyword in row_text for keyword in equity_keywords)

            if is_asset and not is_liability and not is_equity:
                asset_rows.append(idx)
            if is_liability and not is_asset and not is_equity:
                liability_rows.append(idx)
            if is_equity and not is_asset and not is_liability:
                equity_rows.append(idx)

        # Extract data
        assets = {}
        liabilities = {}
        equity = {}

        # Extract asset data
        for idx in asset_rows:
            row = df.iloc[idx]
            label = str(row.iloc[0])
            value = self._extract_numeric_value(row)
            if value is not None:
                assets[label] = value

        # Extract liability data
        for idx in liability_rows:
            row = df.iloc[idx]
            label = str(row.iloc[0])
            value = self._extract_numeric_value(row)
            if value is not None:
                liabilities[label] = value

        # Extract equity data
        for idx in equity_rows:
            row = df.iloc[idx]
            label = str(row.iloc[0])
            value = self._extract_numeric_value(row)
            if value is not None:
                equity[label] = value

        # Calculate total assets
        total_assets = sum(assets.values())

        # Calculate total liabilities
        total_liabilities = sum(liabilities.values())

        # Calculate total equity
        total_equity = sum(equity.values())

        # Calculate debt-to-equity ratio
        debt_to_equity = total_liabilities / total_equity if total_equity > 0 else float('inf')

        # Calculate current ratio (if current assets and liabilities are available)
        current_assets = assets.get('current assets', 0)
        current_liabilities = liabilities.get('current liabilities', 0)
        current_ratio = current_assets / current_liabilities if current_liabilities > 0 else float('inf')

        # Prepare analysis results
        analysis = {
            'document_type': 'balance_sheet',
            'analysis_type': analysis_type,
            'summary': {
                'total_assets': total_assets,
                'total_liabilities': total_liabilities,
                'total_equity': total_equity,
                'debt_to_equity': debt_to_equity,
                'current_ratio': current_ratio
            },
            'assets': assets,
            'liabilities': liabilities,
            'equity': equity
        }

        return {
            'status': 'success',
            'analysis': analysis
        }

    def _analyze_generic_table(self, df: pd.DataFrame, analysis_type: str) -> Dict[str, Any]:
        """
        Analyze generic table data.

        Args:
            df: Generic table data
            analysis_type: Type of analysis to perform

        Returns:
            Dictionary with analysis results
        """
        # Normalize column names
        df.columns = [col.lower() for col in df.columns]

        # Try to identify the type of table
        if self._is_portfolio_table(df):
            return self._analyze_portfolio_table(df, analysis_type)
        elif self._is_asset_allocation_table(df):
            return self._analyze_asset_allocation_table(df, analysis_type)
        elif self._is_income_statement_table(df):
            return self._analyze_income_statement_table(df, analysis_type)
        elif self._is_balance_sheet_table(df):
            return self._analyze_balance_sheet_table(df, analysis_type)
        else:
            # Prepare generic analysis results
            analysis = {
                'document_type': 'generic',
                'analysis_type': analysis_type,
                'data': df.to_dict(orient='records')
            }

            return {
                'status': 'success',
                'analysis': analysis
            }

    def _is_portfolio_table(self, df: pd.DataFrame) -> bool:
        """
        Check if the table is a portfolio table.

        Args:
            df: Table data

        Returns:
            True if the table is a portfolio table, False otherwise
        """
        portfolio_keywords = ["security", "isin", "quantity", "price", "value", "weight", "asset class"]
        column_text = ' '.join(str(col) for col in df.columns).lower()
        return any(keyword in column_text for keyword in portfolio_keywords)

    def _is_asset_allocation_table(self, df: pd.DataFrame) -> bool:
        """
        Check if the table is an asset allocation table.

        Args:
            df: Table data

        Returns:
            True if the table is an asset allocation table, False otherwise
        """
        asset_allocation_keywords = ["asset class", "asset type", "allocation", "weight", "percentage"]
        column_text = ' '.join(str(col) for col in df.columns).lower()
        return any(keyword in column_text for keyword in asset_allocation_keywords)

    def _is_income_statement_table(self, df: pd.DataFrame) -> bool:
        """
        Check if the table is an income statement table.

        Args:
            df: Table data

        Returns:
            True if the table is an income statement table, False otherwise
        """
        income_statement_keywords = ["revenue", "income", "expense", "profit", "loss", "margin"]
        column_text = ' '.join(str(col) for col in df.columns).lower()
        table_text = ' '.join(str(val) for row in df.values for val in row).lower()
        return (any(keyword in column_text for keyword in income_statement_keywords) or
                any(keyword in table_text for keyword in income_statement_keywords))

    def _is_balance_sheet_table(self, df: pd.DataFrame) -> bool:
        """
        Check if the table is a balance sheet table.

        Args:
            df: Table data

        Returns:
            True if the table is a balance sheet table, False otherwise
        """
        balance_sheet_keywords = ["asset", "liability", "equity", "current", "total"]
        column_text = ' '.join(str(col) for col in df.columns).lower()
        table_text = ' '.join(str(val) for row in df.values for val in row).lower()
        return (any(keyword in column_text for keyword in balance_sheet_keywords) or
                any(keyword in table_text for keyword in balance_sheet_keywords))

    def _extract_numeric_value(self, row: pd.Series) -> Optional[float]:
        """
        Extract numeric value from a row.

        Args:
            row: Row data

        Returns:
            Numeric value if found, None otherwise
        """
        # Look for numeric values in the row
        for value in row[1:]:  # Skip the first column (label)
            if isinstance(value, (int, float)):
                return float(value)
            elif isinstance(value, str):
                # Try to convert to float
                try:
                    # Remove currency symbols and commas
                    clean_value = value.replace('$', '').replace('€', '').replace('£', '').replace(',', '')
                    return float(clean_value)
                except ValueError:
                    pass
        return None

    def _calculate_asset_allocation(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate asset allocation.

        Args:
            df: Securities DataFrame

        Returns:
            Dictionary with asset allocation
        """
        if df.empty or 'type' not in df.columns:
            return {}

        # Group by type
        if 'value' in df.columns:
            asset_allocation = df.groupby('type')['value'].sum().reset_index()
            total_value = asset_allocation['value'].sum()
            asset_allocation['weight'] = (asset_allocation['value'] / total_value * 100).round(2)
        elif 'weight' in df.columns:
            asset_allocation = df.groupby('type')['weight'].sum().reset_index()
        else:
            # If no value or weight, just count securities
            asset_allocation = df.groupby('type').size().reset_index(name='count')
            total_count = asset_allocation['count'].sum()
            asset_allocation['weight'] = (asset_allocation['count'] / total_count * 100).round(2)

        # Convert to dictionary
        result = {}
        for _, row in asset_allocation.iterrows():
            asset_type = row['type']
            result[asset_type] = {
                'value': float(row['value']) if 'value' in row else 0,
                'weight': float(row['weight']) if 'weight' in row else 0,
                'count': int(row['count']) if 'count' in row else 0
            }

        return result

    def _calculate_risk_metrics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate risk metrics.

        Args:
            df: Securities DataFrame

        Returns:
            Dictionary with risk metrics
        """
        if df.empty:
            return {
                'message': 'No securities data available for risk calculation'
            }

        # Calculate basic risk metrics
        risk_metrics = {}

        # Calculate volatility if return data is available
        if 'return' in df.columns:
            returns = df['return'].values
            returns = np.array([val for val in returns if isinstance(val, (int, float))])
            if len(returns) > 0:
                risk_metrics['volatility'] = float(np.std(returns))
                risk_metrics['mean_return'] = float(np.mean(returns))
                risk_metrics['min_return'] = float(np.min(returns))
                risk_metrics['max_return'] = float(np.max(returns))

        # Count securities by risk level if risk data is available
        if 'risk' in df.columns:
            risk_counts = df['risk'].value_counts().to_dict()
            risk_metrics['risk_distribution'] = {str(k): int(v) for k, v in risk_counts.items()}

        return risk_metrics if risk_metrics else {
            'message': 'Risk metrics calculation requires return or risk data'
        }

    def _calculate_performance_metrics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate performance metrics.

        Args:
            df: Securities DataFrame

        Returns:
            Dictionary with performance metrics
        """
        if df.empty:
            return {
                'message': 'No securities data available for performance calculation'
            }

        # Calculate basic performance metrics
        performance_metrics = {}

        # Calculate total return if return data is available
        if 'return' in df.columns and 'value' in df.columns:
            # Calculate weighted average return
            weights = df['value'].values
            returns = df['return'].values
            valid_indices = np.logical_and(
                np.array([isinstance(w, (int, float)) for w in weights]),
                np.array([isinstance(r, (int, float)) for r in returns])
            )
            if np.any(valid_indices):
                weights = weights[valid_indices]
                returns = returns[valid_indices]
                total_weight = np.sum(weights)
                if total_weight > 0:
                    performance_metrics['weighted_avg_return'] = float(np.sum(weights * returns) / total_weight)

        # Calculate top performers if return data is available
        if 'return' in df.columns and 'description' in df.columns:
            # Sort by return
            df_sorted = df.sort_values('return', ascending=False)
            top_performers = []
            for _, row in df_sorted.head(5).iterrows():
                if isinstance(row['return'], (int, float)):
                    top_performers.append({
                        'name': str(row['description']),
                        'return': float(row['return']),
                        'value': float(row['value']) if 'value' in row and isinstance(row['value'], (int, float)) else 0
                    })
            if top_performers:
                performance_metrics['top_performers'] = top_performers

        return performance_metrics if performance_metrics else {
            'message': 'Performance metrics calculation requires return and value data'
        }

    def _calculate_diversification_metrics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate diversification metrics.

        Args:
            df: Securities DataFrame

        Returns:
            Dictionary with diversification metrics
        """
        if df.empty:
            return {
                'security_count': 0,
                'asset_type_count': 0,
                'concentration': 0
            }

        # Calculate security count
        security_count = len(df)

        # Calculate asset type count
        asset_type_count = len(df['type'].unique()) if 'type' in df.columns else 0

        # Calculate concentration (Herfindahl-Hirschman Index)
        if 'weight' in df.columns:
            concentration = self._calculate_concentration(df['weight'].values)
        else:
            concentration = 0

        return {
            'security_count': security_count,
            'asset_type_count': asset_type_count,
            'concentration': concentration
        }

    def _calculate_concentration(self, weights: np.ndarray) -> float:
        """
        Calculate concentration using Herfindahl-Hirschman Index.

        Args:
            weights: Array of weights

        Returns:
            Concentration value
        """
        if len(weights) == 0:
            return 0

        # Convert weights to percentages (0-100)
        weights = np.array(weights)
        if weights.max() <= 1:
            weights = weights * 100

        # Calculate HHI
        hhi = np.sum((weights / 100) ** 2)

        return float(hhi)

    def save_results(self, analysis: Dict[str, Any], output_dir: str) -> str:
        """
        Save analysis results to a file.

        Args:
            analysis: Analysis results
            output_dir: Output directory

        Returns:
            Path to the saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Save results to a JSON file
        output_file = os.path.join(output_dir, "financial_analysis_results.json")

        # Convert numpy types to Python types for JSON serialization
        def convert_numpy_types(obj):
            if isinstance(obj, dict):
                return {k: convert_numpy_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(item) for item in obj]
            elif isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return convert_numpy_types(obj.tolist())
            else:
                return obj

        # Convert numpy types
        serializable_analysis = convert_numpy_types(analysis)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(serializable_analysis, f, indent=2)

        return output_file
