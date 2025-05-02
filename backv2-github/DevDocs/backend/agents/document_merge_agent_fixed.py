"""
Document Merge Agent for merging multiple financial documents.
"""
import json
import os
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

        # Merge other fields
        for key in set(data1.keys()) | set(data2.keys()):
            if key not in ['portfolio', 'asset_allocation', 'income_statement', 'balance_sheet']:
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

        # Merge other fields
        for key in set(portfolio1.keys()) | set(portfolio2.keys()):
            if key not in ['securities', 'summary']:
                if key in portfolio1 and key in portfolio2:
                    # If both documents have the field, use the one from the first document
                    merged_portfolio[key] = portfolio1[key]
                elif key in portfolio1:
                    merged_portfolio[key] = portfolio1[key]
                else:
                    merged_portfolio[key] = portfolio2[key]

        return merged_portfolio

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
        # Placeholder for income statement merging
        return income1 if income1 else income2

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
        # Placeholder for balance sheet merging
        return balance1 if balance1 else balance2

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

        # Create merged data
        merged_data = {
            'portfolio': portfolio_data,
            'asset_allocation': asset_allocation,
            'income_statement': income_statement,
            'balance_sheet': balance_sheet
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
        document_types = [metadata.get('document_type', 'unknown')]

        # Extract financial data
        financial_data = merged_document.get('financial_data', {})

        # Extract portfolio data
        portfolio = financial_data.get('portfolio', {})
        securities = portfolio.get('securities', [])
        summary = portfolio.get('summary', {})

        # Extract asset allocation data
        asset_allocation = financial_data.get('asset_allocation', {})

        # Create report
        report = {
            'report_type': 'comprehensive_financial_report',
            'report_date': metadata.get('document_date', ''),
            'client_name': metadata.get('client_name', ''),
            'client_number': metadata.get('client_number', ''),
            'valuation_currency': metadata.get('valuation_currency', 'USD'),
            'data_sources': document_types,
            'merge_date': merged_document.get('merge_date', ''),
            'summary': summary,
            'securities_count': len(securities),
            'asset_allocation': asset_allocation
        }

        return report

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
