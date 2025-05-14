"""
Document Merge Agent for merging multiple financial documents.
"""
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional, Union
from .base_agent import BaseAgent

class DocumentMergeAgent(BaseAgent):
    """Agent for merging multiple financial documents."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize the document merge agent.

        Args:
            api_key: OpenRouter API key
            **kwargs: Additional parameters for the base agent
        """
        super().__init__(name="Document Merge Agent")
        self.api_key = api_key
        self.description = "I merge multiple financial documents into a single document."

    def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task to merge multiple documents.

        Args:
            task: Task dictionary with the following keys:
                - documents: List of documents to merge
                - merge_strategy: Strategy for merging (optional)

        Returns:
            Dictionary with merged document
        """
        # Get the documents
        if 'documents' not in task:
            raise ValueError("Task must contain 'documents'")

        documents = task['documents']
        if not documents:
            return {
                'status': 'error',
                'message': 'No documents provided'
            }

        # Get the merge strategy
        merge_strategy = task.get('merge_strategy', 'comprehensive')

        # Merge the documents
        merged_document = self.merge_documents(documents, merge_strategy=merge_strategy)

        # Extract merged data
        merged_data = self.extract_merged_data(merged_document)

        return {
            'status': 'success',
            'merged_document': merged_document,
            'merged_data': merged_data
        }

    def merge_documents(self, documents: List[Dict[str, Any]], merge_strategy: str) -> Dict[str, Any]:
        """
        Merge multiple documents.

        Args:
            documents: List of documents to merge
            merge_strategy: Strategy for merging

        Returns:
            Merged document
        """
        if not documents:
            return {}

        # Initialize merged document with the first document
        merged_document = documents[0].copy()

        # Merge the rest of the documents
        for document in documents[1:]:
            merged_document = self._merge_two_documents(merged_document, document, merge_strategy)

        # Add merge date
        merged_document['merge_date'] = datetime.now().isoformat()
        
        # Add original document count
        merged_document['original_documents'] = len(documents)
        
        # Add document types
        document_types = []
        for document in documents:
            doc_type = document.get('metadata', {}).get('document_type', 'unknown')
            if doc_type not in document_types:
                document_types.append(doc_type)
        merged_document['document_types'] = document_types

        return merged_document

    def _merge_two_documents(self, doc1: Dict[str, Any], doc2: Dict[str, Any], merge_strategy: str) -> Dict[str, Any]:
        """
        Merge two documents.

        Args:
            doc1: First document
            doc2: Second document
            merge_strategy: Strategy for merging

        Returns:
            Merged document
        """
        # Create a new document
        merged_doc = {}

        # Merge metadata
        merged_doc['metadata'] = self._merge_metadata(doc1.get('metadata', {}), doc2.get('metadata', {}))

        # Merge financial data
        merged_doc['financial_data'] = self._merge_financial_data(
            doc1.get('financial_data', {}),
            doc2.get('financial_data', {}),
            merge_strategy
        )

        # Merge other fields
        for key in set(doc1.keys()) | set(doc2.keys()):
            if key not in ['metadata', 'financial_data']:
                if key in doc1 and key in doc2:
                    # If both documents have the field, use the one from the first document
                    merged_doc[key] = doc1[key]
                elif key in doc1:
                    merged_doc[key] = doc1[key]
                else:
                    merged_doc[key] = doc2[key]

        return merged_doc

    def _merge_metadata(self, metadata1: Dict[str, Any], metadata2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merge metadata from two documents.

        Args:
            metadata1: Metadata from the first document
            metadata2: Metadata from the second document

        Returns:
            Merged metadata
        """
        # Create a new metadata dictionary
        merged_metadata = {}

        # Merge common fields
        for key in set(metadata1.keys()) | set(metadata2.keys()):
            if key in metadata1 and key in metadata2:
                # If both documents have the field, use the one from the first document
                merged_metadata[key] = metadata1[key]
            elif key in metadata1:
                merged_metadata[key] = metadata1[key]
            else:
                merged_metadata[key] = metadata2[key]

        return merged_metadata

    def _merge_financial_data(self, data1: Dict[str, Any], data2: Dict[str, Any], merge_strategy: str) -> Dict[str, Any]:
        """
        Merge financial data from two documents.

        Args:
            data1: Financial data from the first document
            data2: Financial data from the second document
            merge_strategy: Strategy for merging

        Returns:
            Merged financial data
        """
        # Create a new financial data dictionary
        merged_data = {}

        # Merge portfolio data
        if 'portfolio' in data1 or 'portfolio' in data2:
            merged_data['portfolio'] = self._merge_portfolio(
                data1.get('portfolio', {}),
                data2.get('portfolio', {}),
                merge_strategy
            )

        # Merge asset allocation data
        if 'asset_allocation' in data1 or 'asset_allocation' in data2:
            merged_data['asset_allocation'] = self._merge_asset_allocation(
                data1.get('asset_allocation', {}),
                data2.get('asset_allocation', {}),
                merge_strategy
            )

        # Merge income statement data
        if 'income_statement' in data1 or 'income_statement' in data2:
            merged_data['income_statement'] = self._merge_income_statement(
                data1.get('income_statement', {}),
                data2.get('income_statement', {}),
                merge_strategy
            )

        # Merge balance sheet data
        if 'balance_sheet' in data1 or 'balance_sheet' in data2:
            merged_data['balance_sheet'] = self._merge_balance_sheet(
                data1.get('balance_sheet', {}),
                data2.get('balance_sheet', {}),
                merge_strategy
            )

        # Merge bank statements data
        if 'bank_statements' in data1 or 'bank_statements' in data2:
            merged_data['bank_statements'] = self._merge_bank_statements(
                data1.get('bank_statements', {}),
                data2.get('bank_statements', {}),
                merge_strategy
            )

        # Merge salary data
        if 'salary' in data1 or 'salary' in data2:
            merged_data['salary'] = self._merge_salary_data(
                data1.get('salary', {}),
                data2.get('salary', {}),
                merge_strategy
            )

        # Merge other fields
        for key in set(data1.keys()) | set(data2.keys()):
            if key not in ['portfolio', 'asset_allocation', 'income_statement', 'balance_sheet', 'bank_statements', 'salary']:
                if key in data1 and key in data2:
                    # If both documents have the field, use the one from the first document
                    merged_data[key] = data1[key]
                elif key in data1:
                    merged_data[key] = data1[key]
                else:
                    merged_data[key] = data2[key]

        return merged_data

    def _merge_portfolio(self, portfolio1: Dict[str, Any], portfolio2: Dict[str, Any], merge_strategy: str) -> Dict[str, Any]:
        """
        Merge portfolio data from two documents.

        Args:
            portfolio1: Portfolio data from the first document
            portfolio2: Portfolio data from the second document
            merge_strategy: Strategy for merging

        Returns:
            Merged portfolio data
        """
        # Create a new portfolio dictionary
        merged_portfolio = {}

        # Merge securities
        securities1 = portfolio1.get('securities', [])
        securities2 = portfolio2.get('securities', [])
        merged_securities = self._merge_securities(securities1, securities2, merge_strategy)
        merged_portfolio['securities'] = merged_securities

        # Merge summary
        summary1 = portfolio1.get('summary', {})
        summary2 = portfolio2.get('summary', {})
        merged_summary = self._merge_summary(summary1, summary2, merged_securities)
        merged_portfolio['summary'] = merged_summary

        # Create historical data
        historical_data = self._create_historical_data(portfolio1, portfolio2)
        if historical_data:
            merged_portfolio['historical_data'] = historical_data

        # Merge other fields
        for key in set(portfolio1.keys()) | set(portfolio2.keys()):
            if key not in ['securities', 'summary', 'historical_data']:
                if key in portfolio1 and key in portfolio2:
                    # If both documents have the field, use the one from the first document
                    merged_portfolio[key] = portfolio1[key]
                elif key in portfolio1:
                    merged_portfolio[key] = portfolio1[key]
                else:
                    merged_portfolio[key] = portfolio2[key]

        return merged_portfolio

    def _create_historical_data(self, portfolio1: Dict[str, Any], portfolio2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create historical data from two portfolios.

        Args:
            portfolio1: First portfolio
            portfolio2: Second portfolio

        Returns:
            Historical data
        """
        historical_data = {}

        # Extract dates and values
        date1 = portfolio1.get('metadata', {}).get('document_date', '')
        date2 = portfolio2.get('metadata', {}).get('document_date', '')
        value1 = portfolio1.get('summary', {}).get('total_value', 0)
        value2 = portfolio2.get('summary', {}).get('total_value', 0)

        # Create portfolio values
        if date1 and value1 and date2 and value2:
            portfolio_values = []
            
            if date1 < date2:
                portfolio_values.append({'date': date1, 'value': value1})
                portfolio_values.append({'date': date2, 'value': value2})
            else:
                portfolio_values.append({'date': date2, 'value': value2})
                portfolio_values.append({'date': date1, 'value': value1})

            historical_data['portfolio_values'] = portfolio_values

            # Calculate returns
            if len(portfolio_values) > 1:
                returns = []
                for i in range(1, len(portfolio_values)):
                    current = portfolio_values[i]
                    previous = portfolio_values[i-1]

                    if previous['value'] > 0:
                        return_pct = ((current['value'] - previous['value']) / previous['value']) * 100

                        returns.append({
                            'start_date': previous['date'],
                            'end_date': current['date'],
                            'start_value': previous['value'],
                            'end_value': current['value'],
                            'return_pct': return_pct
                        })

                if returns:
                    historical_data['returns'] = returns

        return historical_data

    def _merge_securities(self, securities1: List[Dict[str, Any]], securities2: List[Dict[str, Any]], merge_strategy: str) -> List[Dict[str, Any]]:
        """
        Merge securities from two documents.

        Args:
            securities1: Securities from the first document
            securities2: Securities from the second document
            merge_strategy: Strategy for merging

        Returns:
            Merged securities
        """
        # Create a dictionary of securities by ISIN
        securities_by_isin = {}

        # Add securities from the first document
        for security in securities1:
            isin = security.get('isin')
            if isin:
                securities_by_isin[isin] = security

        # Add or update securities from the second document
        for security in securities2:
            isin = security.get('isin')
            if isin:
                if isin in securities_by_isin:
                    # If the security already exists, update it based on the merge strategy
                    if merge_strategy == 'comprehensive':
                        # Merge the security data
                        merged_security = securities_by_isin[isin].copy()
                        for key, value in security.items():
                            if key not in merged_security:
                                merged_security[key] = value
                        securities_by_isin[isin] = merged_security
                    elif merge_strategy == 'latest':
                        # Use the latest security data
                        securities_by_isin[isin] = security
                    elif merge_strategy == 'first':
                        # Keep the first security data (do nothing)
                        pass
                else:
                    # If the security doesn't exist, add it
                    securities_by_isin[isin] = security

        # Convert the dictionary back to a list
        merged_securities = list(securities_by_isin.values())

        return merged_securities

    def _merge_summary(self, summary1: Dict[str, Any], summary2: Dict[str, Any], securities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Merge summary data from two documents.

        Args:
            summary1: Summary data from the first document
            summary2: Summary data from the second document
            securities: Merged securities

        Returns:
            Merged summary data
        """
        # Create a new summary dictionary
        merged_summary = {}

        # Calculate total value
        total_value = sum(security.get('value', 0) for security in securities)
        merged_summary['total_value'] = total_value

        # Calculate total securities
        merged_summary['total_securities'] = len(securities)

        # Merge other fields
        for key in set(summary1.keys()) | set(summary2.keys()):
            if key not in ['total_value', 'total_securities']:
                if key in summary1 and key in summary2:
                    # If both documents have the field, use the one from the first document
                    merged_summary[key] = summary1[key]
                elif key in summary1:
                    merged_summary[key] = summary1[key]
                else:
                    merged_summary[key] = summary2[key]

        return merged_summary

    def _merge_asset_allocation(self, allocation1: Dict[str, Any], allocation2: Dict[str, Any], merge_strategy: str) -> Dict[str, Any]:
        """
        Merge asset allocation data from two documents.

        Args:
            allocation1: Asset allocation data from the first document
            allocation2: Asset allocation data from the second document
            merge_strategy: Strategy for merging

        Returns:
            Merged asset allocation data
        """
        # Create a new asset allocation dictionary
        merged_allocation = {}

        # Merge asset types
        for asset_type in set(allocation1.keys()) | set(allocation2.keys()):
            if asset_type in allocation1 and asset_type in allocation2:
                # If both documents have the asset type, merge the data
                merged_allocation[asset_type] = self._merge_asset_type(
                    allocation1[asset_type],
                    allocation2[asset_type],
                    merge_strategy
                )
            elif asset_type in allocation1:
                merged_allocation[asset_type] = allocation1[asset_type]
            else:
                merged_allocation[asset_type] = allocation2[asset_type]

        # Recalculate weights
        total_value = sum(data.get('value', 0) for data in merged_allocation.values())
        if total_value > 0:
            for asset_type, data in merged_allocation.items():
                if 'value' in data:
                    data['weight'] = (data['value'] / total_value) * 100

        return merged_allocation

    def _merge_asset_type(self, data1: Dict[str, Any], data2: Dict[str, Any], merge_strategy: str) -> Dict[str, Any]:
        """
        Merge asset type data from two documents.

        Args:
            data1: Asset type data from the first document
            data2: Asset type data from the second document
            merge_strategy: Strategy for merging

        Returns:
            Merged asset type data
        """
        # Create a new asset type data dictionary
        merged_data = {}

        # Merge value
        value1 = data1.get('value', 0)
        value2 = data2.get('value', 0)
        merged_data['value'] = value1 + value2

        # Merge count
        count1 = data1.get('count', 0)
        count2 = data2.get('count', 0)
        merged_data['count'] = count1 + count2

        # Weight will be recalculated later

        # Merge other fields
        for key in set(data1.keys()) | set(data2.keys()):
            if key not in ['value', 'weight', 'count']:
                if key in data1 and key in data2:
                    # If both documents have the field, use the one from the first document
                    merged_data[key] = data1[key]
                elif key in data1:
                    merged_data[key] = data1[key]
                else:
                    merged_data[key] = data2[key]

        return merged_data

    def _merge_income_statement(self, income1: Dict[str, Any], income2: Dict[str, Any], merge_strategy: str) -> Dict[str, Any]:
        """
        Merge income statement data from two documents.

        Args:
            income1: Income statement data from the first document
            income2: Income statement data from the second document
            merge_strategy: Strategy for merging

        Returns:
            Merged income statement data
        """
        # Create a new income statement dictionary
        merged_income = {}

        # Merge revenues
        revenues1 = income1.get('revenues', {})
        revenues2 = income2.get('revenues', {})
        merged_revenues = self._merge_financial_items(revenues1, revenues2, merge_strategy)
        merged_income['revenues'] = merged_revenues

        # Merge expenses
        expenses1 = income1.get('expenses', {})
        expenses2 = income2.get('expenses', {})
        merged_expenses = self._merge_financial_items(expenses1, expenses2, merge_strategy)
        merged_income['expenses'] = merged_expenses

        # Merge profits
        profits1 = income1.get('profits', {})
        profits2 = income2.get('profits', {})
        merged_profits = self._merge_financial_items(profits1, profits2, merge_strategy)
        merged_income['profits'] = merged_profits

        # Merge summary
        summary1 = income1.get('summary', {})
        summary2 = income2.get('summary', {})
        merged_summary = self._merge_financial_items(summary1, summary2, merge_strategy)

        # Recalculate summary values
        total_revenue = sum(value for value in merged_revenues.values() if isinstance(value, (int, float)))
        total_expenses = sum(value for value in merged_expenses.values() if isinstance(value, (int, float)))
        net_profit = total_revenue - total_expenses
        profit_margin = (net_profit / total_revenue) * 100 if total_revenue > 0 else 0

        merged_summary.update({
            'total_revenue': total_revenue,
            'total_expenses': total_expenses,
            'net_profit': net_profit,
            'profit_margin': profit_margin
        })

        merged_income['summary'] = merged_summary

        # Create historical data
        historical_data = self._create_income_historical_data(income1, income2)
        if historical_data:
            merged_income['historical_data'] = historical_data

        # Merge other fields
        for key in set(income1.keys()) | set(income2.keys()):
            if key not in ['revenues', 'expenses', 'profits', 'summary', 'historical_data']:
                if key in income1 and key in income2:
                    # If both documents have the field, use the one from the first document
                    merged_income[key] = income1[key]
                elif key in income1:
                    merged_income[key] = income1[key]
                else:
                    merged_income[key] = income2[key]

        return merged_income

    def _create_income_historical_data(self, income1: Dict[str, Any], income2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create historical data from two income statements.

        Args:
            income1: First income statement
            income2: Second income statement

        Returns:
            Historical data
        """
        historical_data = {}

        # Extract dates and values
        date1 = income1.get('metadata', {}).get('document_date', '')
        date2 = income2.get('metadata', {}).get('document_date', '')
        revenue1 = income1.get('summary', {}).get('total_revenue', 0)
        revenue2 = income2.get('summary', {}).get('total_revenue', 0)
        expenses1 = income1.get('summary', {}).get('total_expenses', 0)
        expenses2 = income2.get('summary', {}).get('total_expenses', 0)
        profit1 = income1.get('summary', {}).get('net_profit', 0)
        profit2 = income2.get('summary', {}).get('net_profit', 0)

        # Create total revenue values
        if date1 and revenue1 and date2 and revenue2:
            total_revenue = []
            
            if date1 < date2:
                total_revenue.append({'date': date1, 'value': revenue1})
                total_revenue.append({'date': date2, 'value': revenue2})
            else:
                total_revenue.append({'date': date2, 'value': revenue2})
                total_revenue.append({'date': date1, 'value': revenue1})

            historical_data['total_revenue'] = total_revenue

        # Create total expenses values
        if date1 and expenses1 and date2 and expenses2:
            total_expenses = []
            
            if date1 < date2:
                total_expenses.append({'date': date1, 'value': expenses1})
                total_expenses.append({'date': date2, 'value': expenses2})
            else:
                total_expenses.append({'date': date2, 'value': expenses2})
                total_expenses.append({'date': date1, 'value': expenses1})

            historical_data['total_expenses'] = total_expenses

        # Create net profit values
        if date1 and profit1 and date2 and profit2:
            net_profit = []
            
            if date1 < date2:
                net_profit.append({'date': date1, 'value': profit1})
                net_profit.append({'date': date2, 'value': profit2})
            else:
                net_profit.append({'date': date2, 'value': profit2})
                net_profit.append({'date': date1, 'value': profit1})

            historical_data['net_profit'] = net_profit

        return historical_data

    def _merge_balance_sheet(self, balance1: Dict[str, Any], balance2: Dict[str, Any], merge_strategy: str) -> Dict[str, Any]:
        """
        Merge balance sheet data from two documents.

        Args:
            balance1: Balance sheet data from the first document
            balance2: Balance sheet data from the second document
            merge_strategy: Strategy for merging

        Returns:
            Merged balance sheet data
        """
        # Create a new balance sheet dictionary
        merged_balance = {}

        # Merge assets
        assets1 = balance1.get('assets', {})
        assets2 = balance2.get('assets', {})
        merged_assets = self._merge_financial_items(assets1, assets2, merge_strategy)
        merged_balance['assets'] = merged_assets

        # Merge liabilities
        liabilities1 = balance1.get('liabilities', {})
        liabilities2 = balance2.get('liabilities', {})
        merged_liabilities = self._merge_financial_items(liabilities1, liabilities2, merge_strategy)
        merged_balance['liabilities'] = merged_liabilities

        # Merge equity
        equity1 = balance1.get('equity', {})
        equity2 = balance2.get('equity', {})
        merged_equity = self._merge_financial_items(equity1, equity2, merge_strategy)
        merged_balance['equity'] = merged_equity

        # Merge summary
        summary1 = balance1.get('summary', {})
        summary2 = balance2.get('summary', {})
        merged_summary = self._merge_financial_items(summary1, summary2, merge_strategy)

        # Recalculate summary values
        total_assets = sum(value for value in merged_assets.values() if isinstance(value, (int, float)))
        total_liabilities = sum(value for value in merged_liabilities.values() if isinstance(value, (int, float)))
        total_equity = sum(value for value in merged_equity.values() if isinstance(value, (int, float)))
        debt_to_equity = total_liabilities / total_equity if total_equity > 0 else float('inf')

        merged_summary.update({
            'total_assets': total_assets,
            'total_liabilities': total_liabilities,
            'total_equity': total_equity,
            'debt_to_equity': debt_to_equity
        })

        merged_balance['summary'] = merged_summary

        # Create historical data
        historical_data = self._create_balance_historical_data(balance1, balance2)
        if historical_data:
            merged_balance['historical_data'] = historical_data

        # Merge other fields
        for key in set(balance1.keys()) | set(balance2.keys()):
            if key not in ['assets', 'liabilities', 'equity', 'summary', 'historical_data']:
                if key in balance1 and key in balance2:
                    # If both documents have the field, use the one from the first document
                    merged_balance[key] = balance1[key]
                elif key in balance1:
                    merged_balance[key] = balance1[key]
                else:
                    merged_balance[key] = balance2[key]

        return merged_balance

    def _create_balance_historical_data(self, balance1: Dict[str, Any], balance2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create historical data from two balance sheets.

        Args:
            balance1: First balance sheet
            balance2: Second balance sheet

        Returns:
            Historical data
        """
        historical_data = {}

        # Extract dates and values
        date1 = balance1.get('metadata', {}).get('document_date', '')
        date2 = balance2.get('metadata', {}).get('document_date', '')
        assets1 = balance1.get('summary', {}).get('total_assets', 0)
        assets2 = balance2.get('summary', {}).get('total_assets', 0)
        liabilities1 = balance1.get('summary', {}).get('total_liabilities', 0)
        liabilities2 = balance2.get('summary', {}).get('total_liabilities', 0)
        equity1 = balance1.get('summary', {}).get('total_equity', 0)
        equity2 = balance2.get('summary', {}).get('total_equity', 0)

        # Create total assets values
        if date1 and assets1 and date2 and assets2:
            total_assets = []
            
            if date1 < date2:
                total_assets.append({'date': date1, 'value': assets1})
                total_assets.append({'date': date2, 'value': assets2})
            else:
                total_assets.append({'date': date2, 'value': assets2})
                total_assets.append({'date': date1, 'value': assets1})

            historical_data['total_assets'] = total_assets

        # Create total liabilities values
        if date1 and liabilities1 and date2 and liabilities2:
            total_liabilities = []
            
            if date1 < date2:
                total_liabilities.append({'date': date1, 'value': liabilities1})
                total_liabilities.append({'date': date2, 'value': liabilities2})
            else:
                total_liabilities.append({'date': date2, 'value': liabilities2})
                total_liabilities.append({'date': date1, 'value': liabilities1})

            historical_data['total_liabilities'] = total_liabilities

        # Create total equity values
        if date1 and equity1 and date2 and equity2:
            total_equity = []
            
            if date1 < date2:
                total_equity.append({'date': date1, 'value': equity1})
                total_equity.append({'date': date2, 'value': equity2})
            else:
                total_equity.append({'date': date2, 'value': equity2})
                total_equity.append({'date': date1, 'value': equity1})

            historical_data['total_equity'] = total_equity

        # Calculate debt-to-equity ratio
        if historical_data.get('total_liabilities') and historical_data.get('total_equity'):
            debt_to_equity_ratio = []
            
            for i in range(len(historical_data['total_liabilities'])):
                liabilities = historical_data['total_liabilities'][i]['value']
                equity = historical_data['total_equity'][i]['value']
                date = historical_data['total_liabilities'][i]['date']
                
                if equity > 0:
                    ratio = liabilities / equity
                    debt_to_equity_ratio.append({'date': date, 'value': ratio})
            
            if debt_to_equity_ratio:
                historical_data['debt_to_equity_ratio'] = debt_to_equity_ratio

        return historical_data

    def _merge_bank_statements(self, bank1: Dict[str, Any], bank2: Dict[str, Any], merge_strategy: str) -> Dict[str, Any]:
        """
        Merge bank statements data from two documents.

        Args:
            bank1: Bank statements data from the first document
            bank2: Bank statements data from the second document
            merge_strategy: Strategy for merging

        Returns:
            Merged bank statements data
        """
        # Create a new bank statements dictionary
        merged_bank = {}

        # Merge transactions
        transactions1 = bank1.get('transactions', [])
        transactions2 = bank2.get('transactions', [])
        merged_transactions = self._merge_transactions(transactions1, transactions2)
        merged_bank['transactions'] = merged_transactions

        # Calculate summary
        merged_bank['summary'] = self._calculate_bank_summary(merged_transactions)

        # Merge other fields
        for key in set(bank1.keys()) | set(bank2.keys()):
            if key not in ['transactions', 'summary']:
                if key in bank1 and key in bank2:
                    # If both documents have the field, use the one from the first document
                    merged_bank[key] = bank1[key]
                elif key in bank1:
                    merged_bank[key] = bank1[key]
                else:
                    merged_bank[key] = bank2[key]

        return merged_bank

    def _merge_transactions(self, transactions1: List[Dict[str, Any]], transactions2: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Merge transactions from two bank statements.

        Args:
            transactions1: Transactions from the first bank statement
            transactions2: Transactions from the second bank statement

        Returns:
            Merged transactions
        """
        # Create a dictionary of transactions by key (date + description + amount)
        transactions_by_key = {}

        # Add transactions from the first document
        for transaction in transactions1:
            key = f"{transaction.get('date', '')}-{transaction.get('description', '')}-{transaction.get('amount', 0)}"
            transactions_by_key[key] = transaction

        # Add transactions from the second document
        for transaction in transactions2:
            key = f"{transaction.get('date', '')}-{transaction.get('description', '')}-{transaction.get('amount', 0)}"
            if key not in transactions_by_key:
                transactions_by_key[key] = transaction

        # Convert the dictionary back to a list
        merged_transactions = list(transactions_by_key.values())

        # Sort by date
        merged_transactions.sort(key=lambda x: x.get('date', ''))

        return merged_transactions

    def _calculate_bank_summary(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate bank summary from transactions.

        Args:
            transactions: Transactions

        Returns:
            Bank summary
        """
        summary = {
            'total_credits': 0,
            'total_debits': 0,
            'net_change': 0,
            'start_balance': None,
            'end_balance': None,
            'transaction_count': len(transactions)
        }

        for transaction in transactions:
            amount = transaction.get('amount', 0)

            if amount > 0:
                summary['total_credits'] += amount
            else:
                summary['total_debits'] += abs(amount)

            # Start balance and end balance
            if 'balance' in transaction:
                if summary['start_balance'] is None or transaction['date'] < transactions[0]['date']:
                    summary['start_balance'] = transaction['balance'] - transaction['amount']

                if summary['end_balance'] is None or transaction['date'] > transactions[-1]['date']:
                    summary['end_balance'] = transaction['balance']

        summary['net_change'] = summary['total_credits'] - summary['total_debits']

        return summary

    def _merge_salary_data(self, salary1: Dict[str, Any], salary2: Dict[str, Any], merge_strategy: str) -> Dict[str, Any]:
        """
        Merge salary data from two documents.

        Args:
            salary1: Salary data from the first document
            salary2: Salary data from the second document
            merge_strategy: Strategy for merging

        Returns:
            Merged salary data
        """
        # Create a new salary data dictionary
        merged_salary = {}

        # Merge salary slips
        salary_slips1 = salary1.get('salary_slips', [])
        salary_slips2 = salary2.get('salary_slips', [])
        merged_salary_slips = self._merge_salary_slips(salary_slips1, salary_slips2)
        merged_salary['salary_slips'] = merged_salary_slips

        # Calculate summary
        merged_salary['summary'] = self._calculate_salary_summary(merged_salary_slips)

        # Merge other fields
        for key in set(salary1.keys()) | set(salary2.keys()):
            if key not in ['salary_slips', 'summary']:
                if key in salary1 and key in salary2:
                    # If both documents have the field, use the one from the first document
                    merged_salary[key] = salary1[key]
                elif key in salary1:
                    merged_salary[key] = salary1[key]
                else:
                    merged_salary[key] = salary2[key]

        return merged_salary

    def _merge_salary_slips(self, salary_slips1: List[Dict[str, Any]], salary_slips2: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Merge salary slips from two documents.

        Args:
            salary_slips1: Salary slips from the first document
            salary_slips2: Salary slips from the second document

        Returns:
            Merged salary slips
        """
        # Create a dictionary of salary slips by date
        salary_slips_by_date = {}

        # Add salary slips from the first document
        for salary_slip in salary_slips1:
            date = salary_slip.get('date', '')
            if date:
                salary_slips_by_date[date] = salary_slip

        # Add salary slips from the second document
        for salary_slip in salary_slips2:
            date = salary_slip.get('date', '')
            if date and date not in salary_slips_by_date:
                salary_slips_by_date[date] = salary_slip

        # Convert the dictionary back to a list
        merged_salary_slips = list(salary_slips_by_date.values())

        # Sort by date
        merged_salary_slips.sort(key=lambda x: x.get('date', ''))

        return merged_salary_slips

    def _calculate_salary_summary(self, salary_slips: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate salary summary from salary slips.

        Args:
            salary_slips: Salary slips

        Returns:
            Salary summary
        """
        summary = {
            'average_gross': 0,
            'average_net': 0,
            'total_gross': 0,
            'total_net': 0,
            'period_start': None,
            'period_end': None,
            'salary_slips_count': len(salary_slips),
            'trends': {}
        }

        if not salary_slips:
            return summary

        # Sort by date
        sorted_slips = sorted(salary_slips, key=lambda x: x.get('date', ''))

        # Set period start and end
        if sorted_slips[0].get('date'):
            summary['period_start'] = sorted_slips[0]['date']

        if sorted_slips[-1].get('date'):
            summary['period_end'] = sorted_slips[-1]['date']

        # Calculate totals
        for slip in salary_slips:
            summary['total_gross'] += slip.get('gross_salary', 0)
            summary['total_net'] += slip.get('net_salary', 0)

        # Calculate averages
        if salary_slips:
            summary['average_gross'] = summary['total_gross'] / len(salary_slips)
            summary['average_net'] = summary['total_net'] / len(salary_slips)

        # Calculate trends
        if len(sorted_slips) > 1:
            # Gross salary trend
            gross_values = [slip.get('gross_salary', 0) for slip in sorted_slips]
            summary['trends']['gross_salary'] = {
                'values': gross_values,
                'change': gross_values[-1] - gross_values[0],
                'change_pct': ((gross_values[-1] - gross_values[0]) / gross_values[0]) * 100 if gross_values[0] > 0 else 0
            }

            # Net salary trend
            net_values = [slip.get('net_salary', 0) for slip in sorted_slips]
            summary['trends']['net_salary'] = {
                'values': net_values,
                'change': net_values[-1] - net_values[0],
                'change_pct': ((net_values[-1] - net_values[0]) / net_values[0]) * 100 if net_values[0] > 0 else 0
            }

        return summary

    def _merge_financial_items(self, items1: Dict[str, Any], items2: Dict[str, Any], merge_strategy: str) -> Dict[str, Any]:
        """
        Merge financial items from two documents.

        Args:
            items1: Financial items from the first document
            items2: Financial items from the second document
            merge_strategy: Strategy for merging

        Returns:
            Merged financial items
        """
        # Create a new financial items dictionary
        merged_items = {}

        # Merge items
        for item_name in set(items1.keys()) | set(items2.keys()):
            if item_name in items1 and item_name in items2:
                # If both documents have the item, merge them based on the merge strategy
                if merge_strategy == 'comprehensive' or merge_strategy == 'latest':
                    # For comprehensive or latest, sum the values
                    value1 = items1[item_name]
                    value2 = items2[item_name]
                    if isinstance(value1, (int, float)) and isinstance(value2, (int, float)):
                        merged_items[item_name] = value1 + value2
                    else:
                        # If not numeric, use the value from the first document
                        merged_items[item_name] = value1
                elif merge_strategy == 'first':
                    # For first, use the value from the first document
                    merged_items[item_name] = items1[item_name]
            elif item_name in items1:
                merged_items[item_name] = items1[item_name]
            else:
                merged_items[item_name] = items2[item_name]

        return merged_items

    def extract_merged_data(self, merged_document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract merged data from the merged document.

        Args:
            merged_document: Merged document

        Returns:
            Extracted merged data
        """
        # Extract financial data
        financial_data = merged_document.get('financial_data', {})

        # Extract portfolio data
        portfolio = financial_data.get('portfolio', {})
        portfolio_data = {
            'securities': portfolio.get('securities', []),
            'summary': portfolio.get('summary', {})
        }

        # Extract asset allocation data
        asset_allocation = financial_data.get('asset_allocation', {})

        # Extract income statement data
        income_statement = financial_data.get('income_statement', {})

        # Extract balance sheet data
        balance_sheet = financial_data.get('balance_sheet', {})

        # Extract bank statements data
        bank_statements = financial_data.get('bank_statements', {})

        # Extract salary data
        salary = financial_data.get('salary', {})

        # Create merged data
        merged_data = {
            'portfolio': portfolio_data,
            'asset_allocation': asset_allocation,
            'income_statement': income_statement,
            'balance_sheet': balance_sheet,
            'bank_statements': bank_statements,
            'salary': salary
        }

        return merged_data

    def generate_comprehensive_report(self, merged_document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a comprehensive report from the merged document.

        Args:
            merged_document: Merged document

        Returns:
            Comprehensive report
        """
        # Extract metadata
        metadata = merged_document.get('metadata', {})
        document_types = merged_document.get('document_types', [])

        # Extract financial data
        financial_data = merged_document.get('financial_data', {})

        # Extract portfolio data
        portfolio = financial_data.get('portfolio', {})
        securities = portfolio.get('securities', [])
        summary = portfolio.get('summary', {})

        # Extract asset allocation data
        asset_allocation = financial_data.get('asset_allocation', {})

        # Extract income statement data
        income_statement = financial_data.get('income_statement', {})
        income_summary = income_statement.get('summary', {})

        # Extract balance sheet data
        balance_sheet = financial_data.get('balance_sheet', {})
        balance_summary = balance_sheet.get('summary', {})

        # Extract bank statements data
        bank_statements = financial_data.get('bank_statements', {})
        bank_summary = bank_statements.get('summary', {})

        # Extract salary data
        salary = financial_data.get('salary', {})
        salary_summary = salary.get('summary', {})

        # Create financial snapshot
        financial_snapshot = self._create_financial_snapshot(merged_document)

        # Create report
        report = {
            'report_type': 'comprehensive_financial_report',
            'report_date': datetime.now().isoformat(),
            'client_name': metadata.get('client_name', ''),
            'client_number': metadata.get('client_number', ''),
            'valuation_currency': metadata.get('valuation_currency', 'USD'),
            'data_sources': document_types,
            'financial_snapshot': financial_snapshot,
            'assets_and_liabilities': self._analyze_assets_and_liabilities(merged_document),
            'income_and_expenses': self._analyze_income_and_expenses(merged_document),
            'investments': self._analyze_investments(merged_document),
            'recommendations': self._generate_recommendations(merged_document)
        }

        return report

    def _create_financial_snapshot(self, merged_document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a financial snapshot from the merged document.

        Args:
            merged_document: Merged document

        Returns:
            Financial snapshot
        """
        # Extract financial data
        financial_data = merged_document.get('financial_data', {})

        # Extract data from different sources
        portfolio = financial_data.get('portfolio', {})
        portfolio_summary = portfolio.get('summary', {})

        balance_sheet = financial_data.get('balance_sheet', {})
        balance_summary = balance_sheet.get('summary', {})

        income_statement = financial_data.get('income_statement', {})
        income_summary = income_statement.get('summary', {})

        bank_statements = financial_data.get('bank_statements', {})
        bank_summary = bank_statements.get('summary', {})

        salary = financial_data.get('salary', {})
        salary_summary = salary.get('summary', {})

        # Create snapshot
        snapshot = {
            'total_assets': balance_summary.get('total_assets', 0),
            'total_liabilities': balance_summary.get('total_liabilities', 0),
            'net_worth': balance_summary.get('total_equity', 0),
            'monthly_income': income_summary.get('total_revenue', 0) / 12 if income_summary else salary_summary.get('average_gross', 0),
            'monthly_expenses': income_summary.get('total_expenses', 0) / 12 if income_summary else bank_summary.get('total_debits', 0) / 12 if bank_summary else 0,
            'portfolio_value': portfolio_summary.get('total_value', 0),
            'debt_to_equity_ratio': balance_summary.get('debt_to_equity', 0),
            'profit_margin': income_summary.get('profit_margin', 0)
        }

        return snapshot

    def _analyze_assets_and_liabilities(self, merged_document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze assets and liabilities from the merged document.

        Args:
            merged_document: Merged document

        Returns:
            Analysis of assets and liabilities
        """
        # Extract financial data
        financial_data = merged_document.get('financial_data', {})

        # Extract balance sheet data
        balance_sheet = financial_data.get('balance_sheet', {})
        assets = balance_sheet.get('assets', {})
        liabilities = balance_sheet.get('liabilities', {})
        equity = balance_sheet.get('equity', {})
        balance_summary = balance_sheet.get('summary', {})

        # Extract portfolio data
        portfolio = financial_data.get('portfolio', {})
        portfolio_summary = portfolio.get('summary', {})

        # Calculate values
        total_assets = balance_summary.get('total_assets', 0)
        total_liabilities = balance_summary.get('total_liabilities', 0)
        net_worth = balance_summary.get('total_equity', 0)
        debt_to_equity_ratio = balance_summary.get('debt_to_equity', 0)
        portfolio_value = portfolio_summary.get('total_value', 0)

        # Create asset breakdown
        asset_breakdown = []
        for asset_name, asset_value in assets.items():
            asset_breakdown.append({
                'name': asset_name,
                'value': asset_value,
                'percentage': (asset_value / total_assets * 100) if total_assets > 0 else 0
            })

        # Add portfolio to asset breakdown if it's not already included
        if portfolio_value > 0:
            # Check if portfolio is already included in assets
            portfolio_included = False
            for asset in asset_breakdown:
                if 'portfolio' in asset['name'].lower() or 'investment' in asset['name'].lower():
                    portfolio_included = True
                    break

            if not portfolio_included:
                asset_breakdown.append({
                    'name': 'Investment Portfolio',
                    'value': portfolio_value,
                    'percentage': (portfolio_value / (total_assets + portfolio_value) * 100) if (total_assets + portfolio_value) > 0 else 0
                })

        # Create liability breakdown
        liability_breakdown = []
        for liability_name, liability_value in liabilities.items():
            liability_breakdown.append({
                'name': liability_name,
                'value': liability_value,
                'percentage': (liability_value / total_liabilities * 100) if total_liabilities > 0 else 0
            })

        # Create recommendations
        recommendations = []

        # Add recommendation if debt-to-equity ratio is high
        if debt_to_equity_ratio > 0.8:
            recommendations.append({
                'title': 'High Debt-to-Equity Ratio',
                'description': f'Your debt-to-equity ratio is {debt_to_equity_ratio:.2f}, which is considered high.',
                'action': 'Consider reducing your debt or increasing your equity.',
                'priority': 'high'
            })

        # Add recommendation if assets are concentrated
        if asset_breakdown and asset_breakdown[0]['percentage'] > 70:
            recommendations.append({
                'title': 'Asset Concentration',
                'description': f'Your {asset_breakdown[0]["name"]} represents {asset_breakdown[0]["percentage"]:.2f}% of your total assets.',
                'action': 'Consider diversifying your assets to reduce risk.',
                'priority': 'medium'
            })

        return {
            'total_assets': total_assets,
            'total_liabilities': total_liabilities,
            'net_worth': net_worth,
            'debt_to_equity_ratio': debt_to_equity_ratio,
            'asset_breakdown': asset_breakdown,
            'liability_breakdown': liability_breakdown,
            'recommendations': recommendations
        }

    def _analyze_income_and_expenses(self, merged_document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze income and expenses from the merged document.

        Args:
            merged_document: Merged document

        Returns:
            Analysis of income and expenses
        """
        # Extract financial data
        financial_data = merged_document.get('financial_data', {})

        # Extract income statement data
        income_statement = financial_data.get('income_statement', {})
        revenues = income_statement.get('revenues', {})
        expenses = income_statement.get('expenses', {})
        income_summary = income_statement.get('summary', {})

        # Extract bank statements data
        bank_statements = financial_data.get('bank_statements', {})
        bank_summary = bank_statements.get('summary', {})

        # Extract salary data
        salary = financial_data.get('salary', {})
        salary_summary = salary.get('summary', {})

        # Calculate values
        total_income = income_summary.get('total_revenue', 0) if income_summary else salary_summary.get('average_gross', 0) * 12 if salary_summary else 0
        total_expenses = income_summary.get('total_expenses', 0) if income_summary else bank_summary.get('total_debits', 0) if bank_summary else 0
        net_income = total_income - total_expenses
        monthly_cash_flow = net_income / 12

        # Create income breakdown
        income_breakdown = []
        for income_name, income_value in revenues.items():
            income_breakdown.append({
                'name': income_name,
                'value': income_value,
                'percentage': (income_value / total_income * 100) if total_income > 0 else 0
            })

        # If no income breakdown and salary data is available, add salary
        if not income_breakdown and salary_summary:
            gross_salary = salary_summary.get('average_gross', 0) * 12
            income_breakdown.append({
                'name': 'Salary',
                'value': gross_salary,
                'percentage': 100
            })

        # Create expense breakdown
        expense_breakdown = []
        for expense_name, expense_value in expenses.items():
            expense_breakdown.append({
                'name': expense_name,
                'value': expense_value,
                'percentage': (expense_value / total_expenses * 100) if total_expenses > 0 else 0
            })

        # Create recommendations
        recommendations = []

        # Add recommendation if cash flow is negative
        if monthly_cash_flow < 0:
            recommendations.append({
                'title': 'Negative Cash Flow',
                'description': f'Your monthly expenses exceed your income by {abs(monthly_cash_flow):.2f}.',
                'action': 'Consider reducing expenses or increasing income to avoid accumulating debt.',
                'priority': 'high'
            })

        # Add recommendation if expense concentration is high
        if expense_breakdown and expense_breakdown[0]['percentage'] > 50:
            recommendations.append({
                'title': 'Expense Concentration',
                'description': f'Your {expense_breakdown[0]["name"]} represents {expense_breakdown[0]["percentage"]:.2f}% of your total expenses.',
                'action': 'Consider ways to reduce this expense or balance your budget.',
                'priority': 'medium'
            })

        return {
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_income': net_income,
            'monthly_cash_flow': monthly_cash_flow,
            'income_breakdown': income_breakdown,
            'expense_breakdown': expense_breakdown,
            'recommendations': recommendations
        }

    def _analyze_investments(self, merged_document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze investments from the merged document.

        Args:
            merged_document: Merged document

        Returns:
            Analysis of investments
        """
        # Extract financial data
        financial_data = merged_document.get('financial_data', {})

        # Extract portfolio data
        portfolio = financial_data.get('portfolio', {})
        securities = portfolio.get('securities', [])
        portfolio_summary = portfolio.get('summary', {})

        # Extract asset allocation data
        asset_allocation = financial_data.get('asset_allocation', {})

        # Calculate values
        total_portfolio_value = portfolio_summary.get('total_value', 0)

        # Create asset allocation breakdown
        asset_allocation_breakdown = []
        for asset_type, data in asset_allocation.items():
            asset_allocation_breakdown.append({
                'type': asset_type,
                'value': data.get('value', 0),
                'weight': data.get('weight', 0),
                'count': data.get('count', 0)
            })

        # Sort securities by return (if available) to find top performers
        top_performers = []
        if securities:
            sorted_securities = sorted(securities, key=lambda x: x.get('return', 0), reverse=True)
            top_performers = sorted_securities[:min(5, len(sorted_securities))]

        # Create recommendations
        recommendations = []

        # Add recommendation if asset allocation is unbalanced
        if asset_allocation_breakdown and asset_allocation_breakdown[0]['weight'] > 70:
            recommendations.append({
                'title': 'Unbalanced Portfolio',
                'description': f'Your {asset_allocation_breakdown[0]["type"]} allocation represents {asset_allocation_breakdown[0]["weight"]:.2f}% of your portfolio.',
                'action': 'Consider diversifying your portfolio to reduce risk.',
                'priority': 'medium'
            })

        return {
            'total_portfolio_value': total_portfolio_value,
            'asset_allocation': asset_allocation_breakdown,
            'top_performers': top_performers,
            'recommendations': recommendations
        }

    def _generate_recommendations(self, merged_document: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate recommendations from the merged document.

        Args:
            merged_document: Merged document

        Returns:
            List of recommendations
        """
        # Collect recommendations from different analyses
        all_recommendations = []

        # Add recommendations from assets and liabilities analysis
        assets_and_liabilities = self._analyze_assets_and_liabilities(merged_document)
        all_recommendations.extend(assets_and_liabilities.get('recommendations', []))

        # Add recommendations from income and expenses analysis
        income_and_expenses = self._analyze_income_and_expenses(merged_document)
        all_recommendations.extend(income_and_expenses.get('recommendations', []))

        # Add recommendations from investments analysis
        investments = self._analyze_investments(merged_document)
        all_recommendations.extend(investments.get('recommendations', []))

        # Sort recommendations by priority
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        all_recommendations.sort(key=lambda x: priority_order.get(x.get('priority', 'low'), 3))

        return all_recommendations

    def save_results(self, merged_document: Dict[str, Any], output_dir: str) -> str:
        """
        Save merged document to a file.

        Args:
            merged_document: Merged document
            output_dir: Output directory

        Returns:
            Path to the saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Save merged document to a JSON file
        output_file = os.path.join(output_dir, "merged_document.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(merged_document, f, indent=2)

        return output_file
