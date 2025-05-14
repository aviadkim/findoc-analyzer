#!/usr/bin/env python3
"""
DocumentComparisonAgent for FinDoc Analyzer
This agent handles comparing multiple financial documents to identify differences and changes.
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
import difflib
import copy
from typing import Dict, List, Any, Optional, Tuple, Union, Set

class DocumentComparisonAgent:
    """
    Agent that compares multiple financial documents to identify differences and changes.
    """
    
    def __init__(self):
        """Initialize the DocumentComparisonAgent"""
        self.name = "DocumentComparisonAgent"
        self.version = "1.0.0"
        
        # Load the comparison configuration
        self.comparison_config = self._load_comparison_config()
    
    def _load_comparison_config(self) -> Dict[str, Any]:
        """
        Load comparison configuration.
        
        Returns:
            Dictionary with comparison configuration
        """
        # Default configuration
        return {
            'key_fields': {
                'securities': ['isin', 'ticker', 'name'],
                'transactions': ['date', 'security_id', 'transaction_id'],
                'positions': ['isin', 'security_id']
            },
            'numeric_fields': [
                'value', 'quantity', 'price', 'amount', 'weight', 'return', 
                'yield', 'expense_ratio', 'dividend', 'interest', 'fee'
            ],
            'date_fields': [
                'date', 'settlement_date', 'trade_date', 'ex_date', 'maturity_date'
            ],
            'significant_percent_change': 5.0,
            'significant_absolute_change': 1000.0
        }
    
    def compare_documents(self, documents: List[Dict[str, Any]], 
                        comparison_type: str = 'comprehensive') -> Dict[str, Any]:
        """
        Compare multiple financial documents.
        
        Args:
            documents: List of documents to compare
            comparison_type: Type of comparison to perform (comprehensive, securities, positions, transactions)
            
        Returns:
            Dictionary with comparison results
        """
        if len(documents) < 2:
            return {
                'status': 'error',
                'message': "At least two documents are required for comparison"
            }
        
        try:
            # Sort documents by date if available
            sorted_docs = self._sort_documents_by_date(documents)
            
            # Determine document types
            doc_types = [self._determine_document_type(doc) for doc in sorted_docs]
            
            # Check if documents are comparable
            if len(set(doc_types)) > 1 and comparison_type == 'comprehensive':
                return {
                    'status': 'warning',
                    'message': "Documents appear to be of different types. Results may be limited.",
                    'document_types': doc_types
                }
            
            # Perform the appropriate comparison
            if comparison_type == 'securities' or 'securities' in comparison_type:
                securities_comparison = self._compare_securities(sorted_docs)
            else:
                securities_comparison = None
                
            if comparison_type == 'positions' or 'positions' in comparison_type:
                positions_comparison = self._compare_positions(sorted_docs)
            else:
                positions_comparison = None
                
            if comparison_type == 'transactions' or 'transactions' in comparison_type:
                transactions_comparison = self._compare_transactions(sorted_docs)
            else:
                transactions_comparison = None
                
            if comparison_type == 'summary' or comparison_type == 'comprehensive':
                summary_comparison = self._compare_summary_data(sorted_docs)
            else:
                summary_comparison = None
            
            # Create the comparison result
            result = {
                'status': 'success',
                'comparison_type': comparison_type,
                'document_count': len(sorted_docs),
                'document_types': doc_types,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # Add comparison results
            if securities_comparison:
                result['securities_comparison'] = securities_comparison
                
            if positions_comparison:
                result['positions_comparison'] = positions_comparison
                
            if transactions_comparison:
                result['transactions_comparison'] = transactions_comparison
                
            if summary_comparison:
                result['summary_comparison'] = summary_comparison
            
            # Add overall changes
            result['overall_changes'] = self._calculate_overall_changes(
                securities_comparison, 
                positions_comparison,
                transactions_comparison,
                summary_comparison
            )
            
            return result
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f"Comparison failed: {str(e)}"
            }
    
    def _sort_documents_by_date(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sort documents by date, if available.
        
        Args:
            documents: List of documents to sort
            
        Returns:
            Sorted list of documents
        """
        def get_document_date(doc):
            # Try different paths to find a date field
            date_value = None
            
            # Check metadata
            metadata = doc.get('metadata', {})
            for date_field in ['date', 'report_date', 'statement_date', 'as_of_date', 'valuation_date']:
                if date_field in metadata:
                    date_value = metadata[date_field]
                    break
            
            # Check summary
            if not date_value and 'summary' in doc:
                summary = doc['summary']
                for date_field in ['date', 'report_date', 'statement_date', 'as_of_date']:
                    if date_field in summary:
                        date_value = summary[date_field]
                        break
            
            # Parse date if found
            if date_value:
                if isinstance(date_value, str):
                    try:
                        # Try different date formats
                        for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y%m%d']:
                            try:
                                return datetime.strptime(date_value, fmt)
                            except ValueError:
                                continue
                    except:
                        pass
                elif isinstance(date_value, datetime):
                    return date_value
            
            # Default if no date found - use a default date
            return datetime(1900, 1, 1)
        
        # Sort documents by the extracted date
        return sorted(documents, key=get_document_date)
    
    def _determine_document_type(self, document: Dict[str, Any]) -> str:
        """
        Determine the type of financial document.
        
        Args:
            document: Document to analyze
            
        Returns:
            Document type (portfolio_statement, transaction_history, security_report, etc.)
        """
        # Check if document type is explicitly specified
        if 'metadata' in document and 'document_type' in document['metadata']:
            return document['metadata']['document_type']
        
        # Check for key sections to infer document type
        if 'transactions' in document and len(document.get('transactions', [])) > 0:
            return 'transaction_history'
        
        if 'securities' in document and len(document.get('securities', [])) > 0:
            return 'portfolio_statement'
        
        if 'positions' in document and len(document.get('positions', [])) > 0:
            return 'position_statement'
        
        if 'security' in document or 'security_data' in document:
            return 'security_report'
        
        # Default type if unable to determine
        return 'unknown'
    
    def _compare_securities(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compare securities across documents.
        
        Args:
            documents: List of documents to compare
            
        Returns:
            Dictionary with securities comparison results
        """
        if len(documents) < 2:
            return None
        
        # Extract securities from each document
        all_securities = []
        for i, doc in enumerate(documents):
            securities = doc.get('securities', [])
            if not securities:
                all_securities.append([])
                continue
            
            # Add document index to each security
            for security in securities:
                security['_doc_index'] = i
            
            all_securities.append(securities)
        
        # Check if any securities were found
        if all(not securities for securities in all_securities):
            return {
                'status': 'warning',
                'message': "No securities found in documents"
            }
        
        # Identify all unique securities
        unique_securities = self._identify_unique_securities(all_securities)
        
        # Compare securities across documents
        comparison_results = []
        
        for sec_id, security_group in unique_securities.items():
            # Skip if security only appears in one document
            if len(security_group) < 2:
                continue
            
            # Find changes between consecutive documents
            for i in range(len(security_group) - 1):
                old_sec = security_group[i]
                new_sec = security_group[i + 1]
                
                old_doc_index = old_sec.pop('_doc_index')
                new_doc_index = new_sec.pop('_doc_index')
                
                # Compare the securities
                changes = self._compare_security_attributes(old_sec, new_sec)
                
                if changes['has_changes']:
                    comparison_results.append({
                        'security_id': sec_id,
                        'security_name': old_sec.get('name', '') or new_sec.get('name', ''),
                        'old_document_index': old_doc_index,
                        'new_document_index': new_doc_index,
                        'changes': changes['changes']
                    })
        
        # Find added and removed securities
        added_securities = []
        removed_securities = []
        
        for sec_id, security_group in unique_securities.items():
            # Get list of document indices this security appears in
            doc_indices = [sec.get('_doc_index') for sec in security_group]
            
            # Check for missing documents (gaps in sequence)
            for i in range(len(documents) - 1):
                if i in doc_indices and i + 1 not in doc_indices:
                    # Security removed in next document
                    security = next(sec for sec in security_group if sec.get('_doc_index') == i)
                    security.pop('_doc_index', None)
                    removed_securities.append({
                        'security_id': sec_id,
                        'security_name': security.get('name', ''),
                        'document_index': i,
                        'next_document_index': i + 1,
                        'security_data': security
                    })
                
                if i not in doc_indices and i + 1 in doc_indices:
                    # Security added in next document
                    security = next(sec for sec in security_group if sec.get('_doc_index') == i + 1)
                    security.pop('_doc_index', None)
                    added_securities.append({
                        'security_id': sec_id,
                        'security_name': security.get('name', ''),
                        'document_index': i + 1,
                        'previous_document_index': i,
                        'security_data': security
                    })
        
        # Calculate statistics
        total_securities = len(unique_securities)
        securities_with_changes = len({result['security_id'] for result in comparison_results})
        
        return {
            'status': 'success',
            'total_unique_securities': total_securities,
            'securities_with_changes': securities_with_changes,
            'added_securities': added_securities,
            'removed_securities': removed_securities,
            'changes': comparison_results
        }
    
    def _identify_unique_securities(self, all_securities: List[List[Dict[str, Any]]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Identify unique securities across all documents.
        
        Args:
            all_securities: List of securities lists from each document
            
        Returns:
            Dictionary mapping unique security IDs to all instances of that security
        """
        # Get key fields for securities
        key_fields = self.comparison_config['key_fields']['securities']
        
        # Dictionary to store unique securities
        unique_securities = {}
        
        # Process securities from each document
        for doc_securities in all_securities:
            for security in doc_securities:
                # Generate a unique identifier for the security
                sec_id = self._generate_security_id(security, key_fields)
                
                if sec_id in unique_securities:
                    unique_securities[sec_id].append(security)
                else:
                    unique_securities[sec_id] = [security]
        
        return unique_securities
    
    def _generate_security_id(self, security: Dict[str, Any], key_fields: List[str]) -> str:
        """
        Generate a unique identifier for a security.
        
        Args:
            security: Security data
            key_fields: List of key fields to use for identification
            
        Returns:
            Unique identifier string
        """
        # Try each key field in order
        for field in key_fields:
            if field in security and security[field]:
                value = str(security[field]).strip().lower()
                if value:
                    return f"{field}:{value}"
        
        # Fallback to using all available key fields
        id_parts = []
        for field in key_fields:
            if field in security and security[field]:
                id_parts.append(f"{field}:{security[field]}")
        
        if id_parts:
            return "|".join(id_parts)
        
        # Last resort - use all fields
        return str(hash(frozenset(security.items())))
    
    def _compare_security_attributes(self, old_security: Dict[str, Any], 
                                   new_security: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compare attributes of two security objects.
        
        Args:
            old_security: Old security data
            new_security: New security data
            
        Returns:
            Dictionary with comparison results
        """
        changes = []
        numeric_fields = set(self.comparison_config['numeric_fields'])
        date_fields = set(self.comparison_config['date_fields'])
        
        # Combine all keys from both securities
        all_keys = set(old_security.keys()) | set(new_security.keys())
        
        # Exclude internal fields
        skip_fields = {'_doc_index'}
        all_keys = all_keys - skip_fields
        
        for key in sorted(all_keys):
            old_value = old_security.get(key)
            new_value = new_security.get(key)
            
            # Skip if both values are None or the key doesn't exist in one security
            if old_value is None and new_value is None:
                continue
            
            # Check if the field was added or removed
            if key not in old_security:
                changes.append({
                    'field': key,
                    'change_type': 'added',
                    'new_value': new_value
                })
                continue
                
            if key not in new_security:
                changes.append({
                    'field': key,
                    'change_type': 'removed',
                    'old_value': old_value
                })
                continue
            
            # Check if values are different
            if old_value != new_value:
                change = {
                    'field': key,
                    'change_type': 'changed',
                    'old_value': old_value,
                    'new_value': new_value
                }
                
                # Add additional information for numeric fields
                if key in numeric_fields and isinstance(old_value, (int, float)) and isinstance(new_value, (int, float)):
                    absolute_change = new_value - old_value
                    
                    if old_value != 0:
                        percent_change = (absolute_change / old_value) * 100
                    else:
                        percent_change = float('inf') if absolute_change > 0 else float('-inf') if absolute_change < 0 else 0
                    
                    change['absolute_change'] = absolute_change
                    change['percent_change'] = percent_change
                    
                    # Determine if the change is significant
                    significant_percent = self.comparison_config['significant_percent_change']
                    significant_absolute = self.comparison_config['significant_absolute_change']
                    
                    change['is_significant'] = (
                        abs(percent_change) >= significant_percent or 
                        abs(absolute_change) >= significant_absolute
                    )
                    
                changes.append(change)
        
        return {
            'has_changes': len(changes) > 0,
            'changes': changes
        }
    
    def _compare_positions(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compare positions across documents.
        
        Args:
            documents: List of documents to compare
            
        Returns:
            Dictionary with positions comparison results
        """
        # Extract positions from each document
        all_positions = []
        for i, doc in enumerate(documents):
            positions = []
            
            # Check for dedicated positions section
            if 'positions' in doc and doc['positions']:
                positions = doc['positions']
            # Alternatively, use securities as positions
            elif 'securities' in doc and doc['securities']:
                positions = doc['securities']
            
            # Add document index to each position
            for position in positions:
                position['_doc_index'] = i
            
            all_positions.append(positions)
        
        # Check if any positions were found
        if all(not positions for positions in all_positions):
            return {
                'status': 'warning',
                'message': "No positions found in documents"
            }
        
        # Identify unique positions
        unique_positions = self._identify_unique_positions(all_positions)
        
        # Compare positions across documents
        comparison_results = []
        
        for pos_id, position_group in unique_positions.items():
            # Skip if position only appears in one document
            if len(position_group) < 2:
                continue
            
            # Find changes between consecutive documents
            for i in range(len(position_group) - 1):
                old_pos = position_group[i]
                new_pos = position_group[i + 1]
                
                old_doc_index = old_pos.pop('_doc_index')
                new_doc_index = new_pos.pop('_doc_index')
                
                # Compare the positions
                changes = self._compare_position_attributes(old_pos, new_pos)
                
                if changes['has_changes']:
                    comparison_results.append({
                        'position_id': pos_id,
                        'security_name': old_pos.get('name', '') or new_pos.get('name', ''),
                        'old_document_index': old_doc_index,
                        'new_document_index': new_doc_index,
                        'changes': changes['changes']
                    })
        
        # Find added and removed positions
        added_positions = []
        removed_positions = []
        
        for pos_id, position_group in unique_positions.items():
            # Get list of document indices this position appears in
            doc_indices = [pos.get('_doc_index') for pos in position_group]
            
            # Check for missing documents (gaps in sequence)
            for i in range(len(documents) - 1):
                if i in doc_indices and i + 1 not in doc_indices:
                    # Position removed in next document
                    position = next(pos for pos in position_group if pos.get('_doc_index') == i)
                    position.pop('_doc_index', None)
                    removed_positions.append({
                        'position_id': pos_id,
                        'security_name': position.get('name', ''),
                        'document_index': i,
                        'next_document_index': i + 1,
                        'position_data': position
                    })
                
                if i not in doc_indices and i + 1 in doc_indices:
                    # Position added in next document
                    position = next(pos for pos in position_group if pos.get('_doc_index') == i + 1)
                    position.pop('_doc_index', None)
                    added_positions.append({
                        'position_id': pos_id,
                        'security_name': position.get('name', ''),
                        'document_index': i + 1,
                        'previous_document_index': i,
                        'position_data': position
                    })
        
        # Calculate statistics
        total_positions = len(unique_positions)
        positions_with_changes = len({result['position_id'] for result in comparison_results})
        
        return {
            'status': 'success',
            'total_unique_positions': total_positions,
            'positions_with_changes': positions_with_changes,
            'added_positions': added_positions,
            'removed_positions': removed_positions,
            'changes': comparison_results
        }
    
    def _identify_unique_positions(self, all_positions: List[List[Dict[str, Any]]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Identify unique positions across all documents.
        
        Args:
            all_positions: List of positions lists from each document
            
        Returns:
            Dictionary mapping unique position IDs to all instances of that position
        """
        # Get key fields for positions
        key_fields = self.comparison_config['key_fields']['positions']
        
        # Dictionary to store unique positions
        unique_positions = {}
        
        # Process positions from each document
        for doc_positions in all_positions:
            for position in doc_positions:
                # Generate a unique identifier for the position
                pos_id = self._generate_security_id(position, key_fields)
                
                if pos_id in unique_positions:
                    unique_positions[pos_id].append(position)
                else:
                    unique_positions[pos_id] = [position]
        
        return unique_positions
    
    def _compare_position_attributes(self, old_position: Dict[str, Any], 
                                   new_position: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compare attributes of two position objects.
        
        Args:
            old_position: Old position data
            new_position: New position data
            
        Returns:
            Dictionary with comparison results
        """
        # This uses the same comparison logic as for securities
        return self._compare_security_attributes(old_position, new_position)
    
    def _compare_transactions(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compare transactions across documents.
        
        Args:
            documents: List of documents to compare
            
        Returns:
            Dictionary with transactions comparison results
        """
        # Extract transactions from each document
        all_transactions = []
        for i, doc in enumerate(documents):
            transactions = doc.get('transactions', [])
            
            # Add document index to each transaction
            for transaction in transactions:
                transaction['_doc_index'] = i
            
            all_transactions.append(transactions)
        
        # Check if any transactions were found
        if all(not transactions for transactions in all_transactions):
            return {
                'status': 'warning',
                'message': "No transactions found in documents"
            }
        
        # Identify unique transactions
        unique_transactions = self._identify_unique_transactions(all_transactions)
        
        # Count new transactions in each document
        new_transactions_by_doc = {}
        for i in range(1, len(documents)):
            new_transactions = []
            for trans_id, transaction_group in unique_transactions.items():
                # Check if this transaction only appears in the current document
                doc_indices = [t.get('_doc_index') for t in transaction_group]
                if i in doc_indices and all(idx > i-1 for idx in doc_indices):
                    # This is a new transaction
                    transaction = next(t for t in transaction_group if t.get('_doc_index') == i)
                    transaction_copy = copy.deepcopy(transaction)
                    transaction_copy.pop('_doc_index', None)
                    new_transactions.append({
                        'transaction_id': trans_id,
                        'document_index': i,
                        'transaction_data': transaction_copy
                    })
            
            new_transactions_by_doc[i] = new_transactions
        
        # Group transactions by type if available
        transactions_by_type = {}
        for trans_id, transaction_group in unique_transactions.items():
            for transaction in transaction_group:
                trans_type = transaction.get('type', 'unknown')
                if trans_type not in transactions_by_type:
                    transactions_by_type[trans_type] = []
                
                transactions_by_type[trans_type].append(transaction)
        
        # Calculate statistics
        total_transactions = len(unique_transactions)
        total_new_transactions = sum(len(transactions) for transactions in new_transactions_by_doc.values())
        
        return {
            'status': 'success',
            'total_unique_transactions': total_transactions,
            'total_new_transactions': total_new_transactions,
            'new_transactions_by_document': new_transactions_by_doc,
            'transactions_by_type': {k: len(v) for k, v in transactions_by_type.items()}
        }
    
    def _identify_unique_transactions(self, all_transactions: List[List[Dict[str, Any]]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Identify unique transactions across all documents.
        
        Args:
            all_transactions: List of transactions lists from each document
            
        Returns:
            Dictionary mapping unique transaction IDs to all instances of that transaction
        """
        # Get key fields for transactions
        key_fields = self.comparison_config['key_fields']['transactions']
        
        # Dictionary to store unique transactions
        unique_transactions = {}
        
        # Process transactions from each document
        for doc_transactions in all_transactions:
            for transaction in doc_transactions:
                # Check if transaction has a specific ID
                if 'transaction_id' in transaction and transaction['transaction_id']:
                    trans_id = f"id:{transaction['transaction_id']}"
                else:
                    # Generate an ID based on key fields
                    trans_parts = []
                    for field in key_fields:
                        if field in transaction and transaction[field]:
                            value = str(transaction[field])
                            trans_parts.append(f"{field}:{value}")
                    
                    if trans_parts:
                        trans_id = "|".join(trans_parts)
                    else:
                        # Last resort - use hash of all fields
                        trans_id = str(hash(frozenset(transaction.items())))
                
                if trans_id in unique_transactions:
                    unique_transactions[trans_id].append(transaction)
                else:
                    unique_transactions[trans_id] = [transaction]
        
        return unique_transactions
    
    def _compare_summary_data(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compare summary data across documents.
        
        Args:
            documents: List of documents to compare
            
        Returns:
            Dictionary with summary comparison results
        """
        if len(documents) < 2:
            return None
        
        # Extract summary data from each document
        summaries = []
        for i, doc in enumerate(documents):
            summary = doc.get('summary', {})
            if not summary:
                summaries.append({})
                continue
            
            # Add document index
            summary['_doc_index'] = i
            summaries.append(summary)
        
        # Check if any summaries were found
        if all(not summary for summary in summaries):
            return {
                'status': 'warning',
                'message': "No summary data found in documents"
            }
        
        # Compare summaries across documents
        comparison_results = []
        
        # Find changes between consecutive documents with summaries
        for i in range(len(documents) - 1):
            old_summary = summaries[i]
            new_summary = summaries[i + 1]
            
            # Skip if either summary is empty
            if not old_summary or not new_summary:
                continue
            
            old_doc_index = old_summary.pop('_doc_index')
            new_doc_index = new_summary.pop('_doc_index')
            
            # Compare the summaries
            changes = self._compare_summary_attributes(old_summary, new_summary)
            
            if changes['has_changes']:
                comparison_results.append({
                    'old_document_index': old_doc_index,
                    'new_document_index': new_doc_index,
                    'changes': changes['changes']
                })
        
        # Calculate key metrics changes across all documents
        key_metrics_changes = self._calculate_key_metrics_changes(summaries)
        
        return {
            'status': 'success',
            'summary_changes': comparison_results,
            'key_metrics_changes': key_metrics_changes
        }
    
    def _compare_summary_attributes(self, old_summary: Dict[str, Any], 
                                  new_summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compare attributes of two summary objects.
        
        Args:
            old_summary: Old summary data
            new_summary: New summary data
            
        Returns:
            Dictionary with comparison results
        """
        # This uses the same comparison logic as for securities
        return self._compare_security_attributes(old_summary, new_summary)
    
    def _calculate_key_metrics_changes(self, summaries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate changes in key metrics across all documents.
        
        Args:
            summaries: List of summary data from each document
            
        Returns:
            Dictionary with key metrics changes
        """
        # Define key metrics to track
        key_metrics = ['total_value', 'total_securities', 'yield', 'return']
        
        # Dictionary to store metric values across documents
        metrics_by_doc = {}
        
        # Extract metrics from each summary
        for i, summary in enumerate(summaries):
            if not summary:
                continue
                
            doc_metrics = {}
            for metric in key_metrics:
                if metric in summary:
                    doc_metrics[metric] = summary[metric]
            
            if doc_metrics:
                metrics_by_doc[i] = doc_metrics
        
        # Calculate changes for each metric
        metric_changes = {}
        
        for metric in key_metrics:
            # Collect values for this metric across documents
            values = []
            for i in sorted(metrics_by_doc.keys()):
                if metric in metrics_by_doc[i]:
                    values.append((i, metrics_by_doc[i][metric]))
            
            # Calculate changes if we have at least two values
            if len(values) >= 2:
                changes = []
                
                for i in range(len(values) - 1):
                    old_doc_index, old_value = values[i]
                    new_doc_index, new_value = values[i + 1]
                    
                    # Skip if values are not numeric
                    if not isinstance(old_value, (int, float)) or not isinstance(new_value, (int, float)):
                        continue
                    
                    absolute_change = new_value - old_value
                    
                    if old_value != 0:
                        percent_change = (absolute_change / old_value) * 100
                    else:
                        percent_change = float('inf') if absolute_change > 0 else float('-inf') if absolute_change < 0 else 0
                    
                    # Determine if the change is significant
                    significant_percent = self.comparison_config['significant_percent_change']
                    significant_absolute = self.comparison_config['significant_absolute_change']
                    
                    is_significant = (
                        abs(percent_change) >= significant_percent or 
                        abs(absolute_change) >= significant_absolute
                    )
                    
                    changes.append({
                        'old_document_index': old_doc_index,
                        'new_document_index': new_doc_index,
                        'old_value': old_value,
                        'new_value': new_value,
                        'absolute_change': absolute_change,
                        'percent_change': percent_change,
                        'is_significant': is_significant
                    })
                
                if changes:
                    metric_changes[metric] = changes
        
        return metric_changes
    
    def _calculate_overall_changes(self, securities_comparison: Optional[Dict[str, Any]],
                                positions_comparison: Optional[Dict[str, Any]],
                                transactions_comparison: Optional[Dict[str, Any]],
                                summary_comparison: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate overall changes across all comparison types.
        
        Args:
            securities_comparison: Securities comparison results
            positions_comparison: Positions comparison results
            transactions_comparison: Transactions comparison results
            summary_comparison: Summary comparison results
            
        Returns:
            Dictionary with overall changes
        """
        overall_changes = {
            'total_changes': 0,
            'significant_changes': 0,
            'added_items': 0,
            'removed_items': 0,
            'changed_items': 0,
            'change_types': {}
        }
        
        # Count securities changes
        if securities_comparison and securities_comparison.get('status') == 'success':
            added = len(securities_comparison.get('added_securities', []))
            removed = len(securities_comparison.get('removed_securities', []))
            changed = securities_comparison.get('securities_with_changes', 0)
            
            overall_changes['added_items'] += added
            overall_changes['removed_items'] += removed
            overall_changes['changed_items'] += changed
            overall_changes['total_changes'] += added + removed + changed
            
            overall_changes['change_types']['securities'] = {
                'added': added,
                'removed': removed,
                'changed': changed
            }
        
        # Count positions changes
        if positions_comparison and positions_comparison.get('status') == 'success':
            added = len(positions_comparison.get('added_positions', []))
            removed = len(positions_comparison.get('removed_positions', []))
            changed = positions_comparison.get('positions_with_changes', 0)
            
            overall_changes['added_items'] += added
            overall_changes['removed_items'] += removed
            overall_changes['changed_items'] += changed
            overall_changes['total_changes'] += added + removed + changed
            
            overall_changes['change_types']['positions'] = {
                'added': added,
                'removed': removed,
                'changed': changed
            }
        
        # Count transactions changes
        if transactions_comparison and transactions_comparison.get('status') == 'success':
            new_transactions = transactions_comparison.get('total_new_transactions', 0)
            overall_changes['added_items'] += new_transactions
            overall_changes['total_changes'] += new_transactions
            
            overall_changes['change_types']['transactions'] = {
                'added': new_transactions,
                'removed': 0,  # Transactions are typically not removed
                'changed': 0   # Transactions are typically not changed
            }
        
        # Count significant summary changes
        if summary_comparison and summary_comparison.get('status') == 'success':
            key_metrics = summary_comparison.get('key_metrics_changes', {})
            
            significant_changes = 0
            for metric, changes in key_metrics.items():
                for change in changes:
                    if change.get('is_significant', False):
                        significant_changes += 1
            
            overall_changes['significant_changes'] += significant_changes
        
        return overall_changes
    
    def generate_report(self, comparison_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a comprehensive report based on comparison results.
        
        Args:
            comparison_result: Result from compare_documents method
            
        Returns:
            Dictionary with formatted report
        """
        if comparison_result.get('status') != 'success':
            return {
                'status': 'error',
                'message': "Cannot generate report from unsuccessful comparison",
                'original_error': comparison_result.get('message', 'Unknown error')
            }
        
        # Extract key information
        doc_count = comparison_result.get('document_count', 0)
        doc_types = comparison_result.get('document_types', [])
        overall_changes = comparison_result.get('overall_changes', {})
        
        securities_comparison = comparison_result.get('securities_comparison')
        positions_comparison = comparison_result.get('positions_comparison')
        transactions_comparison = comparison_result.get('transactions_comparison')
        summary_comparison = comparison_result.get('summary_comparison')
        
        # Generate the report title and overview
        report = {
            'title': f"Document Comparison Report ({doc_count} Documents)",
            'date': datetime.now().strftime('%Y-%m-%d'),
            'overview': {
                'document_count': doc_count,
                'document_types': doc_types,
                'total_changes': overall_changes.get('total_changes', 0),
                'significant_changes': overall_changes.get('significant_changes', 0),
                'added_items': overall_changes.get('added_items', 0),
                'removed_items': overall_changes.get('removed_items', 0),
                'changed_items': overall_changes.get('changed_items', 0)
            },
            'sections': []
        }
        
        # Add securities section if available
        if securities_comparison and securities_comparison.get('status') == 'success':
            securities_section = {
                'title': 'Securities Comparison',
                'content': {
                    'total_securities': securities_comparison.get('total_unique_securities', 0),
                    'securities_with_changes': securities_comparison.get('securities_with_changes', 0),
                    'added_securities': len(securities_comparison.get('added_securities', [])),
                    'removed_securities': len(securities_comparison.get('removed_securities', []))
                },
                'highlights': []
            }
            
            # Add highlights for significant changes
            significant_changes = []
            
            for change_result in securities_comparison.get('changes', []):
                for change in change_result.get('changes', []):
                    if change.get('is_significant', False) and change.get('change_type') == 'changed':
                        significant_changes.append({
                            'security_name': change_result.get('security_name', ''),
                            'field': change.get('field', ''),
                            'old_value': change.get('old_value'),
                            'new_value': change.get('new_value'),
                            'percent_change': change.get('percent_change')
                        })
            
            # Sort significant changes by absolute percent change
            significant_changes.sort(key=lambda x: abs(x.get('percent_change', 0)), reverse=True)
            
            # Add top significant changes to highlights
            securities_section['highlights'] = significant_changes[:5]  # Top 5 changes
            
            report['sections'].append(securities_section)
        
        # Add positions section if available
        if positions_comparison and positions_comparison.get('status') == 'success':
            positions_section = {
                'title': 'Positions Comparison',
                'content': {
                    'total_positions': positions_comparison.get('total_unique_positions', 0),
                    'positions_with_changes': positions_comparison.get('positions_with_changes', 0),
                    'added_positions': len(positions_comparison.get('added_positions', [])),
                    'removed_positions': len(positions_comparison.get('removed_positions', []))
                },
                'highlights': []
            }
            
            # Add highlights for significant changes
            significant_changes = []
            
            for change_result in positions_comparison.get('changes', []):
                for change in change_result.get('changes', []):
                    if change.get('is_significant', False) and change.get('change_type') == 'changed':
                        significant_changes.append({
                            'security_name': change_result.get('security_name', ''),
                            'field': change.get('field', ''),
                            'old_value': change.get('old_value'),
                            'new_value': change.get('new_value'),
                            'percent_change': change.get('percent_change')
                        })
            
            # Sort significant changes by absolute percent change
            significant_changes.sort(key=lambda x: abs(x.get('percent_change', 0)), reverse=True)
            
            # Add top significant changes to highlights
            positions_section['highlights'] = significant_changes[:5]  # Top 5 changes
            
            report['sections'].append(positions_section)
        
        # Add transactions section if available
        if transactions_comparison and transactions_comparison.get('status') == 'success':
            transactions_section = {
                'title': 'Transactions Comparison',
                'content': {
                    'total_transactions': transactions_comparison.get('total_unique_transactions', 0),
                    'new_transactions': transactions_comparison.get('total_new_transactions', 0),
                    'transactions_by_type': transactions_comparison.get('transactions_by_type', {})
                },
                'highlights': []
            }
            
            # Add highlights for new transactions
            new_transactions_by_doc = transactions_comparison.get('new_transactions_by_document', {})
            
            for doc_idx, transactions in new_transactions_by_doc.items():
                if transactions:
                    transactions_section['highlights'].append({
                        'document_index': doc_idx,
                        'new_transaction_count': len(transactions),
                        'sample_transactions': transactions[:3]  # Sample of new transactions
                    })
            
            report['sections'].append(transactions_section)
        
        # Add summary section if available
        if summary_comparison and summary_comparison.get('status') == 'success':
            summary_section = {
                'title': 'Summary Comparison',
                'content': {
                    'summary_changes_count': len(summary_comparison.get('summary_changes', []))
                },
                'highlights': []
            }
            
            # Add highlights for key metrics changes
            key_metrics_changes = summary_comparison.get('key_metrics_changes', {})
            
            for metric, changes in key_metrics_changes.items():
                for change in changes:
                    if change.get('is_significant', False):
                        summary_section['highlights'].append({
                            'metric': metric,
                            'old_value': change.get('old_value'),
                            'new_value': change.get('new_value'),
                            'percent_change': change.get('percent_change'),
                            'old_document_index': change.get('old_document_index'),
                            'new_document_index': change.get('new_document_index')
                        })
            
            report['sections'].append(summary_section)
        
        # Add overall conclusion
        report['conclusion'] = self._generate_conclusion(overall_changes, report['sections'])
        
        return {
            'status': 'success',
            'report': report
        }
    
    def _generate_conclusion(self, overall_changes: Dict[str, Any], 
                           sections: List[Dict[str, Any]]) -> str:
        """
        Generate a conclusion based on comparison results.
        
        Args:
            overall_changes: Overall changes dictionary
            sections: Report sections
            
        Returns:
            Conclusion string
        """
        total_changes = overall_changes.get('total_changes', 0)
        significant_changes = overall_changes.get('significant_changes', 0)
        
        if total_changes == 0:
            return "No significant changes were detected between the documents."
        
        if significant_changes == 0:
            return f"A total of {total_changes} changes were detected, but none were deemed significant."
        
        conclusion = f"The comparison found {total_changes} changes across the documents, with {significant_changes} significant changes identified. "
        
        # Add details based on sections
        highlights = []
        
        for section in sections:
            title = section.get('title', '')
            section_highlights = section.get('highlights', [])
            
            if section_highlights:
                highlights.append(f"{title} showed notable changes")
        
        if highlights:
            conclusion += "Key areas of change include: " + ", ".join(highlights) + "."
        
        return conclusion
    
    def print_info(self) -> Dict[str, Any]:
        """
        Print information about the DocumentComparisonAgent.
        
        Returns:
            Dictionary with agent information
        """
        return {
            'name': self.name,
            'version': self.version,
            'description': 'Agent that compares multiple financial documents to identify differences and changes',
            'capabilities': [
                'Compare securities across documents',
                'Compare positions across documents',
                'Compare transactions across documents',
                'Compare summary data across documents',
                'Identify added, removed, and changed items',
                'Detect significant changes in numeric values',
                'Generate comprehensive comparison reports'
            ]
        }

# Demo code
if __name__ == "__main__":
    # Create an instance of the agent
    comparison_agent = DocumentComparisonAgent()
    
    # Print agent information
    print(json.dumps(comparison_agent.print_info(), indent=2))
    
    # Sample documents for testing
    doc1 = {
        'metadata': {
            'document_type': 'portfolio_statement',
            'date': '2025-01-15'
        },
        'securities': [
            {'name': 'US Large Cap Fund', 'isin': 'US1234567890', 'value': 50000},
            {'name': 'Global Bond Fund', 'isin': 'US0987654321', 'value': 30000}
        ],
        'summary': {
            'total_value': 80000,
            'total_securities': 2
        }
    }
    
    doc2 = {
        'metadata': {
            'document_type': 'portfolio_statement',
            'date': '2025-02-15'
        },
        'securities': [
            {'name': 'US Large Cap Fund', 'isin': 'US1234567890', 'value': 52000},
            {'name': 'Global Bond Fund', 'isin': 'US0987654321', 'value': 29000},
            {'name': 'Tech ETF', 'isin': 'US5555555555', 'value': 20000}
        ],
        'summary': {
            'total_value': 101000,
            'total_securities': 3
        }
    }
    
    # Compare documents
    comparison_result = comparison_agent.compare_documents([doc1, doc2])
    
    # Generate report
    report_result = comparison_agent.generate_report(comparison_result)
    
    # Print report
    if report_result['status'] == 'success':
        print("\nDocument Comparison Report:")
        report = report_result['report']
        print(f"Title: {report['title']}")
        print(f"Date: {report['date']}")
        print("\nOverview:")
        for key, value in report['overview'].items():
            print(f"  {key}: {value}")
        
        print("\nSections:")
        for section in report['sections']:
            print(f"\n  {section['title']}:")
            for key, value in section['content'].items():
                print(f"    {key}: {value}")
            
            if section['highlights']:
                print("    Highlights:")
                for highlight in section['highlights']:
                    print(f"      - {highlight}")
        
        print(f"\nConclusion: {report['conclusion']}")
    else:
        print(f"Error: {report_result['message']}")
