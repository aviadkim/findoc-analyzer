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
        # Placeholder for income statement analysis
        analysis = {
            'document_type': 'income_statement',
            'analysis_type': analysis_type,
            'currency': currency,
            'message': 'Income statement analysis not implemented yet'
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
        # Placeholder for balance sheet analysis
        analysis = {
            'document_type': 'balance_sheet',
            'analysis_type': analysis_type,
            'currency': currency,
            'message': 'Balance sheet analysis not implemented yet'
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
        # Placeholder for generic analysis
        analysis = {
            'document_type': 'generic',
            'analysis_type': analysis_type,
            'currency': currency,
            'message': 'Generic analysis not implemented yet'
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
        # Placeholder for income statement table analysis
        analysis = {
            'document_type': 'income_statement',
            'analysis_type': analysis_type,
            'message': 'Income statement table analysis not implemented yet'
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
        # Placeholder for balance sheet table analysis
        analysis = {
            'document_type': 'balance_sheet',
            'analysis_type': analysis_type,
            'message': 'Balance sheet table analysis not implemented yet'
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
        # Placeholder for generic table analysis
        analysis = {
            'document_type': 'generic',
            'analysis_type': analysis_type,
            'message': 'Generic table analysis not implemented yet'
        }

        return {
            'status': 'success',
            'analysis': analysis
        }

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
        # Placeholder for risk metrics
        return {
            'message': 'Risk metrics calculation not implemented yet'
        }

    def _calculate_performance_metrics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate performance metrics.

        Args:
            df: Securities DataFrame

        Returns:
            Dictionary with performance metrics
        """
        # Placeholder for performance metrics
        return {
            'message': 'Performance metrics calculation not implemented yet'
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
