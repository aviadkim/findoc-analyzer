"""
Document Integration Agent for combining data from multiple document sources.
"""
import os
import json
import logging
from typing import Dict, List, Any, Optional, Union
from .base_agent import BaseAgent

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DocumentIntegrationAgent(BaseAgent):
    """Agent for integrating data from multiple document sources."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize the document integration agent.

        Args:
            api_key: OpenRouter API key (optional)
            **kwargs: Additional parameters for the base agent
        """
        super().__init__(name="Document Integration Agent")
        self.api_key = api_key
        self.description = "I integrate data from multiple document sources into a unified view."

    def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task to integrate document data.

        Args:
            task: Task dictionary with the following keys:
                - documents: List of document data to integrate
                - integration_type: Type of integration to perform (optional)
                - output_format: Format of the output (optional)

        Returns:
            Dictionary with integrated document data
        """
        # Get the documents
        if 'documents' not in task:
            return {
                'status': 'error',
                'message': 'No documents provided'
            }

        documents = task['documents']
        if not documents:
            return {
                'status': 'error',
                'message': 'Empty documents list'
            }

        # Get integration options
        integration_type = task.get('integration_type', 'comprehensive')
        output_format = task.get('output_format', 'json')

        # Integrate the documents
        integrated_data = self.integrate_documents(documents, integration_type)

        # Format the output
        if output_format == 'json':
            result = {
                'status': 'success',
                'integrated_data': integrated_data
            }
        elif output_format == 'text':
            result = {
                'status': 'success',
                'integrated_text': self.convert_to_text(integrated_data)
            }
        else:
            result = {
                'status': 'error',
                'message': f'Unsupported output format: {output_format}'
            }

        return result

    def integrate_documents(self, documents: List[Dict[str, Any]], integration_type: str) -> Dict[str, Any]:
        """
        Integrate multiple documents.

        Args:
            documents: List of document data to integrate
            integration_type: Type of integration to perform

        Returns:
            Integrated document data
        """
        # Check document types
        document_types = [doc.get('type', 'unknown') for doc in documents]
        
        # Choose integration strategy based on document types
        if all(doc_type == 'financial_statement' for doc_type in document_types):
            return self._integrate_financial_statements(documents, integration_type)
        elif all(doc_type == 'portfolio' for doc_type in document_types):
            return self._integrate_portfolios(documents, integration_type)
        elif all(doc_type == 'transaction' for doc_type in document_types):
            return self._integrate_transactions(documents, integration_type)
        else:
            # Generic integration for mixed document types
            return self._integrate_generic(documents, integration_type)

    def _integrate_financial_statements(self, documents: List[Dict[str, Any]], integration_type: str) -> Dict[str, Any]:
        """
        Integrate financial statements.

        Args:
            documents: List of financial statement data
            integration_type: Type of integration to perform

        Returns:
            Integrated financial statement data
        """
        # Initialize integrated data
        integrated_data = {
            'type': 'financial_statement',
            'metadata': {
                'source_documents': len(documents),
                'integration_type': integration_type
            },
            'statements': {}
        }

        # Extract statement types from all documents
        statement_types = set()
        for doc in documents:
            if 'statements' in doc:
                statement_types.update(doc['statements'].keys())

        # Integrate each statement type
        for statement_type in statement_types:
            statements = [doc.get('statements', {}).get(statement_type, {}) for doc in documents if statement_type in doc.get('statements', {})]
            
            if statements:
                if integration_type == 'comprehensive':
                    # Merge all data points
                    integrated_data['statements'][statement_type] = self._merge_statements(statements)
                elif integration_type == 'latest':
                    # Use the latest statement
                    integrated_data['statements'][statement_type] = statements[-1]
                elif integration_type == 'average':
                    # Calculate average values
                    integrated_data['statements'][statement_type] = self._average_statements(statements)

        return integrated_data

    def _integrate_portfolios(self, documents: List[Dict[str, Any]], integration_type: str) -> Dict[str, Any]:
        """
        Integrate portfolio data.

        Args:
            documents: List of portfolio data
            integration_type: Type of integration to perform

        Returns:
            Integrated portfolio data
        """
        # Initialize integrated data
        integrated_data = {
            'type': 'portfolio',
            'metadata': {
                'source_documents': len(documents),
                'integration_type': integration_type
            },
            'portfolio': {
                'securities': [],
                'summary': {}
            }
        }

        # Collect all securities
        all_securities = []
        for doc in documents:
            if 'portfolio' in doc and 'securities' in doc['portfolio']:
                all_securities.extend(doc['portfolio']['securities'])

        # Integrate securities based on integration type
        if integration_type == 'comprehensive':
            # Merge securities by ISIN
            securities_by_isin = {}
            for security in all_securities:
                isin = security.get('isin')
                if isin:
                    if isin in securities_by_isin:
                        # Update existing security
                        securities_by_isin[isin] = self._merge_securities(securities_by_isin[isin], security)
                    else:
                        # Add new security
                        securities_by_isin[isin] = security
            
            integrated_data['portfolio']['securities'] = list(securities_by_isin.values())
        elif integration_type == 'latest':
            # Use the latest portfolio
            latest_doc = documents[-1]
            if 'portfolio' in latest_doc and 'securities' in latest_doc['portfolio']:
                integrated_data['portfolio']['securities'] = latest_doc['portfolio']['securities']
        elif integration_type == 'union':
            # Include all securities
            integrated_data['portfolio']['securities'] = all_securities

        # Calculate summary
        total_value = sum(security.get('value', 0) for security in integrated_data['portfolio']['securities'])
        integrated_data['portfolio']['summary'] = {
            'total_value': total_value,
            'total_securities': len(integrated_data['portfolio']['securities'])
        }

        return integrated_data

    def _integrate_transactions(self, documents: List[Dict[str, Any]], integration_type: str) -> Dict[str, Any]:
        """
        Integrate transaction data.

        Args:
            documents: List of transaction data
            integration_type: Type of integration to perform

        Returns:
            Integrated transaction data
        """
        # Initialize integrated data
        integrated_data = {
            'type': 'transaction',
            'metadata': {
                'source_documents': len(documents),
                'integration_type': integration_type
            },
            'transactions': []
        }

        # Collect all transactions
        all_transactions = []
        for doc in documents:
            if 'transactions' in doc:
                all_transactions.extend(doc['transactions'])

        # Sort transactions by date
        all_transactions.sort(key=lambda t: t.get('date', ''))

        # Integrate transactions based on integration type
        if integration_type == 'comprehensive':
            # Include all transactions
            integrated_data['transactions'] = all_transactions
        elif integration_type == 'latest':
            # Use the latest transactions
            latest_doc = documents[-1]
            if 'transactions' in latest_doc:
                integrated_data['transactions'] = latest_doc['transactions']
        elif integration_type == 'summary':
            # Group transactions by type
            transactions_by_type = {}
            for transaction in all_transactions:
                transaction_type = transaction.get('type', 'unknown')
                if transaction_type not in transactions_by_type:
                    transactions_by_type[transaction_type] = []
                transactions_by_type[transaction_type].append(transaction)
            
            # Create summary for each type
            for transaction_type, transactions in transactions_by_type.items():
                total_value = sum(transaction.get('value', 0) for transaction in transactions)
                integrated_data['transactions'].append({
                    'type': transaction_type,
                    'count': len(transactions),
                    'total_value': total_value
                })

        return integrated_data

    def _integrate_generic(self, documents: List[Dict[str, Any]], integration_type: str) -> Dict[str, Any]:
        """
        Generic integration for mixed document types.

        Args:
            documents: List of document data
            integration_type: Type of integration to perform

        Returns:
            Integrated document data
        """
        # Initialize integrated data
        integrated_data = {
            'type': 'mixed',
            'metadata': {
                'source_documents': len(documents),
                'integration_type': integration_type
            },
            'documents': []
        }

        # Group documents by type
        documents_by_type = {}
        for doc in documents:
            doc_type = doc.get('type', 'unknown')
            if doc_type not in documents_by_type:
                documents_by_type[doc_type] = []
            documents_by_type[doc_type].append(doc)

        # Integrate each document type
        for doc_type, docs in documents_by_type.items():
            if doc_type == 'financial_statement':
                integrated_data[doc_type] = self._integrate_financial_statements(docs, integration_type)
            elif doc_type == 'portfolio':
                integrated_data[doc_type] = self._integrate_portfolios(docs, integration_type)
            elif doc_type == 'transaction':
                integrated_data[doc_type] = self._integrate_transactions(docs, integration_type)
            else:
                # For unknown types, just include all documents
                integrated_data['documents'].extend(docs)

        return integrated_data

    def _merge_statements(self, statements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Merge financial statements.

        Args:
            statements: List of financial statements

        Returns:
            Merged financial statement
        """
        if not statements:
            return {}

        # Initialize with the first statement
        merged = statements[0].copy()

        # Merge with other statements
        for statement in statements[1:]:
            for key, value in statement.items():
                if key not in merged:
                    # Add new key
                    merged[key] = value
                elif isinstance(value, dict) and isinstance(merged[key], dict):
                    # Recursively merge dictionaries
                    merged[key] = self._merge_dicts(merged[key], value)
                elif isinstance(value, list) and isinstance(merged[key], list):
                    # Merge lists
                    merged[key] = merged[key] + [item for item in value if item not in merged[key]]
                elif isinstance(value, (int, float)) and isinstance(merged[key], (int, float)):
                    # Sum numeric values
                    merged[key] = merged[key] + value
                else:
                    # Keep the original value
                    pass

        return merged

    def _merge_dicts(self, dict1: Dict[str, Any], dict2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Recursively merge dictionaries.

        Args:
            dict1: First dictionary
            dict2: Second dictionary

        Returns:
            Merged dictionary
        """
        merged = dict1.copy()

        for key, value in dict2.items():
            if key not in merged:
                # Add new key
                merged[key] = value
            elif isinstance(value, dict) and isinstance(merged[key], dict):
                # Recursively merge dictionaries
                merged[key] = self._merge_dicts(merged[key], value)
            elif isinstance(value, list) and isinstance(merged[key], list):
                # Merge lists
                merged[key] = merged[key] + [item for item in value if item not in merged[key]]
            elif isinstance(value, (int, float)) and isinstance(merged[key], (int, float)):
                # Sum numeric values
                merged[key] = merged[key] + value
            else:
                # Keep the original value
                pass

        return merged

    def _average_statements(self, statements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate average values for financial statements.

        Args:
            statements: List of financial statements

        Returns:
            Financial statement with average values
        """
        if not statements:
            return {}

        # Merge statements
        merged = self._merge_statements(statements)

        # Calculate averages for numeric values
        for key, value in merged.items():
            if isinstance(value, (int, float)):
                merged[key] = value / len(statements)
            elif isinstance(value, dict):
                merged[key] = self._average_dict_values(value, len(statements))

        return merged

    def _average_dict_values(self, data: Dict[str, Any], count: int) -> Dict[str, Any]:
        """
        Calculate average values for dictionary values.

        Args:
            data: Dictionary with values to average
            count: Number of statements

        Returns:
            Dictionary with average values
        """
        averaged = {}

        for key, value in data.items():
            if isinstance(value, (int, float)):
                averaged[key] = value / count
            elif isinstance(value, dict):
                averaged[key] = self._average_dict_values(value, count)
            else:
                averaged[key] = value

        return averaged

    def _merge_securities(self, security1: Dict[str, Any], security2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merge two securities.

        Args:
            security1: First security
            security2: Second security

        Returns:
            Merged security
        """
        merged = security1.copy()

        # Update with values from security2
        for key, value in security2.items():
            if key not in merged:
                # Add new key
                merged[key] = value
            elif key == 'quantity' and isinstance(value, (int, float)) and isinstance(merged[key], (int, float)):
                # Sum quantities
                merged[key] = merged[key] + value
            elif key == 'value' and isinstance(value, (int, float)) and isinstance(merged[key], (int, float)):
                # Sum values
                merged[key] = merged[key] + value
            elif key == 'price' and isinstance(value, (int, float)) and isinstance(merged[key], (int, float)):
                # Use the latest price
                merged[key] = value
            elif key == 'weight' and isinstance(value, (int, float)) and isinstance(merged[key], (int, float)):
                # Recalculate weight later
                pass
            else:
                # Keep the original value
                pass

        return merged

    def convert_to_text(self, data: Dict[str, Any]) -> str:
        """
        Convert integrated data to text format.

        Args:
            data: Integrated data

        Returns:
            Text representation of the integrated data
        """
        if data.get('type') == 'portfolio':
            return self._portfolio_to_text(data)
        elif data.get('type') == 'financial_statement':
            return self._financial_statement_to_text(data)
        elif data.get('type') == 'transaction':
            return self._transactions_to_text(data)
        else:
            # Generic conversion
            return json.dumps(data, indent=2)

    def _portfolio_to_text(self, data: Dict[str, Any]) -> str:
        """
        Convert portfolio data to text.

        Args:
            data: Portfolio data

        Returns:
            Text representation of the portfolio
        """
        text = "Portfolio Summary\n"
        text += "================\n\n"

        # Add summary
        summary = data.get('portfolio', {}).get('summary', {})
        text += f"Total Value: {summary.get('total_value', 0):,.2f}\n"
        text += f"Total Securities: {summary.get('total_securities', 0)}\n\n"

        # Add securities
        text += "Securities\n"
        text += "----------\n\n"

        securities = data.get('portfolio', {}).get('securities', [])
        for security in securities:
            text += f"ISIN: {security.get('isin', 'N/A')}\n"
            text += f"Name: {security.get('name', 'N/A')}\n"
            text += f"Quantity: {security.get('quantity', 0):,.2f}\n"
            text += f"Price: {security.get('price', 0):,.2f}\n"
            text += f"Value: {security.get('value', 0):,.2f}\n"
            text += f"Weight: {security.get('weight', 0):,.2f}%\n\n"

        return text

    def _financial_statement_to_text(self, data: Dict[str, Any]) -> str:
        """
        Convert financial statement data to text.

        Args:
            data: Financial statement data

        Returns:
            Text representation of the financial statement
        """
        text = "Financial Statements\n"
        text += "===================\n\n"

        # Add statements
        statements = data.get('statements', {})
        for statement_type, statement in statements.items():
            text += f"{statement_type.upper()}\n"
            text += f"{'-' * len(statement_type)}\n\n"

            # Add statement items
            for key, value in statement.items():
                if isinstance(value, dict):
                    text += f"{key}:\n"
                    for subkey, subvalue in value.items():
                        text += f"  {subkey}: {subvalue:,.2f}\n"
                else:
                    text += f"{key}: {value:,.2f}\n"

            text += "\n"

        return text

    def _transactions_to_text(self, data: Dict[str, Any]) -> str:
        """
        Convert transaction data to text.

        Args:
            data: Transaction data

        Returns:
            Text representation of the transactions
        """
        text = "Transactions\n"
        text += "============\n\n"

        # Add transactions
        transactions = data.get('transactions', [])
        for transaction in transactions:
            text += f"Date: {transaction.get('date', 'N/A')}\n"
            text += f"Type: {transaction.get('type', 'N/A')}\n"
            text += f"Security: {transaction.get('security', 'N/A')}\n"
            text += f"ISIN: {transaction.get('isin', 'N/A')}\n"
            text += f"Quantity: {transaction.get('quantity', 0):,.2f}\n"
            text += f"Price: {transaction.get('price', 0):,.2f}\n"
            text += f"Value: {transaction.get('value', 0):,.2f}\n\n"

        return text

    def save_results(self, integrated_data: Dict[str, Any], output_path: str) -> str:
        """
        Save integrated data to a file.

        Args:
            integrated_data: Integrated data
            output_path: Output file path

        Returns:
            Path to the saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(integrated_data, f, indent=2)

        return output_path
