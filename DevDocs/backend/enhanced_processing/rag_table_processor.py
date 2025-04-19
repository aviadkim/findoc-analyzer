"""
RAG Table Processor - Processes tables for RAG (Retrieval Augmented Generation).

This module integrates table extraction with the RAG system to improve
question answering on financial documents.
"""
import os
import json
import logging
import tempfile
from typing import Dict, List, Any, Optional, Union
import pandas as pd
import numpy as np
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RAGTableProcessor:
    """
    Processes tables for RAG (Retrieval Augmented Generation).
    Extracts tables, converts them to structured format, and prepares them for RAG.
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "anthropic/claude-3-opus:beta",
        max_tokens: int = 4000,
        temperature: float = 0.2
    ):
        """
        Initialize the RAG Table Processor.
        
        Args:
            api_key: OpenRouter API key for AI-enhanced processing
            model: Model to use for AI-enhanced processing
            max_tokens: Maximum tokens for AI-enhanced processing
            temperature: Temperature for AI-enhanced processing
        """
        self.api_key = api_key
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        
        # Check if API key is available
        self.use_ai_enhancement = api_key is not None
        if not self.use_ai_enhancement:
            logger.warning("OpenRouter API key not provided. AI-enhanced processing will be disabled.")
    
    def process_tables(self, tables: List[Dict[str, Any]], output_dir: Optional[str] = None) -> Dict[str, Any]:
        """
        Process tables for RAG.
        
        Args:
            tables: List of tables from the table extractor
            output_dir: Output directory for saving results
            
        Returns:
            Dictionary with processed tables
        """
        logger.info(f"Processing {len(tables)} tables for RAG")
        
        # Create output directory if provided
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        # Process each table
        processed_tables = []
        for i, table in enumerate(tables):
            try:
                processed_table = self._process_table(table)
                processed_tables.append(processed_table)
            except Exception as e:
                logger.error(f"Error processing table {i}: {str(e)}")
        
        # Classify tables
        classified_tables = self._classify_tables(processed_tables)
        
        # Extract insights
        insights = self._extract_insights(classified_tables)
        
        # Prepare result
        result = {
            'tables': classified_tables,
            'count': len(classified_tables),
            'insights': insights
        }
        
        # Save result if output directory is provided
        if output_dir:
            output_path = os.path.join(output_dir, "rag_table_processor_result.json")
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Results saved to {output_path}")
        
        return result
    
    def _process_table(self, table: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a single table.
        
        Args:
            table: Table dictionary from the table extractor
            
        Returns:
            Processed table dictionary
        """
        # Create a copy of the table
        processed_table = table.copy()
        
        # Convert data to pandas DataFrame if it's not already
        if 'data' in processed_table and not isinstance(processed_table['data'], pd.DataFrame):
            if isinstance(processed_table['data'], list):
                # If it's a list of dictionaries, convert to DataFrame
                if processed_table['data'] and isinstance(processed_table['data'][0], dict):
                    df = pd.DataFrame(processed_table['data'])
                # If it's a list of lists, convert to DataFrame
                elif processed_table['data'] and isinstance(processed_table['data'][0], list):
                    if 'headers' in processed_table and processed_table['headers']:
                        df = pd.DataFrame(processed_table['data'], columns=processed_table['headers'])
                    else:
                        df = pd.DataFrame(processed_table['data'])
                else:
                    df = pd.DataFrame()
            else:
                df = pd.DataFrame()
            
            processed_table['dataframe'] = df
        elif 'data' in processed_table and isinstance(processed_table['data'], pd.DataFrame):
            processed_table['dataframe'] = processed_table['data']
        else:
            processed_table['dataframe'] = pd.DataFrame()
        
        # Clean the data
        processed_table = self._clean_table_data(processed_table)
        
        # Extract metadata
        processed_table = self._extract_table_metadata(processed_table)
        
        # Enhance with AI if enabled
        if self.use_ai_enhancement:
            processed_table = self._enhance_table_with_ai(processed_table)
        
        return processed_table
    
    def _clean_table_data(self, table: Dict[str, Any]) -> Dict[str, Any]:
        """
        Clean table data.
        
        Args:
            table: Table dictionary
            
        Returns:
            Table dictionary with cleaned data
        """
        # Get the DataFrame
        df = table.get('dataframe', pd.DataFrame())
        
        if df.empty:
            return table
        
        # Clean column names
        df.columns = [str(col).strip() for col in df.columns]
        
        # Remove empty rows and columns
        df = df.dropna(how='all')
        df = df.dropna(axis=1, how='all')
        
        # Clean cell values
        for col in df.columns:
            # Convert to string
            df[col] = df[col].astype(str)
            
            # Strip whitespace
            df[col] = df[col].str.strip()
            
            # Replace 'nan' with empty string
            df[col] = df[col].replace('nan', '')
            
            # Try to convert numeric columns
            try:
                # Check if column contains numbers
                if df[col].str.replace(',', '').str.replace('.', '').str.replace('-', '').str.isnumeric().any():
                    # Remove commas and convert to numeric
                    df[col] = df[col].str.replace(',', '')
                    df[col] = pd.to_numeric(df[col], errors='ignore')
            except Exception:
                pass
        
        # Update the DataFrame
        table['dataframe'] = df
        
        # Update the data
        table['data'] = df.to_dict(orient='records')
        
        # Update headers and rows
        table['headers'] = df.columns.tolist()
        table['rows'] = df.values.tolist()
        
        return table
    
    def _extract_table_metadata(self, table: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract metadata from the table.
        
        Args:
            table: Table dictionary
            
        Returns:
            Table dictionary with metadata
        """
        # Get the DataFrame
        df = table.get('dataframe', pd.DataFrame())
        
        if df.empty:
            return table
        
        # Extract basic metadata
        metadata = {
            'row_count': len(df),
            'column_count': len(df.columns),
            'column_names': df.columns.tolist()
        }
        
        # Extract numeric columns
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        metadata['numeric_columns'] = numeric_columns
        
        # Calculate statistics for numeric columns
        if numeric_columns:
            stats = {}
            for col in numeric_columns:
                col_stats = {
                    'min': float(df[col].min()) if not pd.isna(df[col].min()) else None,
                    'max': float(df[col].max()) if not pd.isna(df[col].max()) else None,
                    'mean': float(df[col].mean()) if not pd.isna(df[col].mean()) else None,
                    'sum': float(df[col].sum()) if not pd.isna(df[col].sum()) else None
                }
                stats[col] = col_stats
            
            metadata['statistics'] = stats
        
        # Add metadata to the table
        table['metadata'] = metadata
        
        return table
    
    def _enhance_table_with_ai(self, table: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance table with AI.
        
        Args:
            table: Table dictionary
            
        Returns:
            Table dictionary with AI-enhanced data
        """
        if not self.api_key:
            return table
        
        try:
            import requests
            
            # Get the DataFrame
            df = table.get('dataframe', pd.DataFrame())
            
            if df.empty:
                return table
            
            # Convert DataFrame to string representation
            table_str = df.to_string(index=False)
            
            # Prepare the prompt
            prompt = f"""
            You are an expert in analyzing financial tables. Below is a table extracted from a financial document.
            Please analyze this table and provide the following:
            
            1. A brief description of what this table represents
            2. The type of financial table (e.g., portfolio, asset allocation, income statement, balance sheet)
            3. Key insights from the table
            4. Any potential issues or anomalies in the data
            
            Table:
            {table_str}
            
            Return your analysis in JSON format with the following structure:
            {{
                "description": "Brief description of the table",
                "table_type": "Type of financial table",
                "key_insights": ["Insight 1", "Insight 2", ...],
                "potential_issues": ["Issue 1", "Issue 2", ...]
            }}
            """
            
            # Call the OpenRouter API
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": self.max_tokens,
                    "temperature": self.temperature,
                    "response_format": {"type": "json_object"}
                }
            )
            
            # Check if the request was successful
            if response.status_code == 200:
                result = response.json()
                analysis = json.loads(result["choices"][0]["message"]["content"])
                
                # Add analysis to the table
                table['ai_analysis'] = analysis
                
                # Update table type if available
                if 'table_type' in analysis:
                    table['table_type'] = analysis['table_type'].lower()
            else:
                logger.error(f"Error calling OpenRouter API: {response.status_code} {response.text}")
                
        except Exception as e:
            logger.error(f"Error enhancing table with AI: {str(e)}")
        
        return table
    
    def _classify_tables(self, tables: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Classify tables based on content and AI analysis.
        
        Args:
            tables: List of processed tables
            
        Returns:
            List of classified tables
        """
        for table in tables:
            # Skip if table already has a type
            if 'table_type' in table and table['table_type'] != 'unknown':
                continue
            
            # Get the DataFrame
            df = table.get('dataframe', pd.DataFrame())
            
            if df.empty:
                table['table_type'] = 'unknown'
                continue
            
            # Get column names
            column_names = [str(col).lower() for col in df.columns]
            column_str = ' '.join(column_names)
            
            # Check for portfolio table
            portfolio_keywords = ['security', 'isin', 'quantity', 'price', 'value', 'weight', '%', 'symbol', 'name']
            if any(keyword in column_str for keyword in portfolio_keywords):
                table['table_type'] = 'portfolio'
                continue
            
            # Check for asset allocation table
            asset_keywords = ['asset', 'class', 'allocation', 'weight', '%', 'value', 'type']
            if any(keyword in column_str for keyword in asset_keywords):
                table['table_type'] = 'asset_allocation'
                continue
            
            # Check for income statement table
            income_keywords = ['revenue', 'income', 'expense', 'profit', 'loss', 'ebitda', 'net']
            if any(keyword in column_str for keyword in income_keywords):
                table['table_type'] = 'income_statement'
                continue
            
            # Check for balance sheet table
            balance_keywords = ['asset', 'liability', 'equity', 'total', 'current', 'non-current']
            if any(keyword in column_str for keyword in balance_keywords):
                table['table_type'] = 'balance_sheet'
                continue
            
            # Default to unknown
            table['table_type'] = 'unknown'
        
        return tables
    
    def _extract_insights(self, tables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract insights from classified tables.
        
        Args:
            tables: List of classified tables
            
        Returns:
            Dictionary with insights
        """
        insights = {
            'portfolio': {},
            'asset_allocation': {},
            'income_statement': {},
            'balance_sheet': {},
            'summary': {}
        }
        
        # Process portfolio tables
        portfolio_tables = [table for table in tables if table.get('table_type') == 'portfolio']
        if portfolio_tables:
            portfolio_insights = self._extract_portfolio_insights(portfolio_tables)
            insights['portfolio'] = portfolio_insights
        
        # Process asset allocation tables
        asset_tables = [table for table in tables if table.get('table_type') == 'asset_allocation']
        if asset_tables:
            asset_insights = self._extract_asset_allocation_insights(asset_tables)
            insights['asset_allocation'] = asset_insights
        
        # Process income statement tables
        income_tables = [table for table in tables if table.get('table_type') == 'income_statement']
        if income_tables:
            income_insights = self._extract_income_statement_insights(income_tables)
            insights['income_statement'] = income_insights
        
        # Process balance sheet tables
        balance_tables = [table for table in tables if table.get('table_type') == 'balance_sheet']
        if balance_tables:
            balance_insights = self._extract_balance_sheet_insights(balance_tables)
            insights['balance_sheet'] = balance_insights
        
        # Generate summary insights
        summary_insights = self._generate_summary_insights(insights)
        insights['summary'] = summary_insights
        
        return insights
    
    def _extract_portfolio_insights(self, tables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract insights from portfolio tables.
        
        Args:
            tables: List of portfolio tables
            
        Returns:
            Dictionary with portfolio insights
        """
        insights = {
            'securities_count': 0,
            'total_value': 0,
            'top_holdings': [],
            'asset_classes': {},
            'currency': None
        }
        
        for table in tables:
            df = table.get('dataframe', pd.DataFrame())
            
            if df.empty:
                continue
            
            # Normalize column names
            df.columns = [str(col).lower() for col in df.columns]
            
            # Map common column names
            column_mapping = {
                'security': 'security',
                'name': 'security',
                'ticker': 'symbol',
                'symbol': 'symbol',
                'isin': 'isin',
                'price': 'price',
                'quantity': 'quantity',
                'value': 'value',
                'weight': 'weight',
                'percentage': 'weight',
                '%': 'weight',
                'type': 'type',
                'asset class': 'type',
                'asset type': 'type',
                'asset': 'type',
                'currency': 'currency'
            }
            
            # Rename columns based on mapping
            for col in df.columns:
                for key, value in column_mapping.items():
                    if key in col:
                        df = df.rename(columns={col: value})
                        break
            
            # Extract securities count
            insights['securities_count'] += len(df)
            
            # Extract total value
            if 'value' in df.columns:
                # Convert to numeric if needed
                if not pd.api.types.is_numeric_dtype(df['value']):
                    df['value'] = pd.to_numeric(df['value'].astype(str).str.replace(',', ''), errors='coerce')
                
                total_value = df['value'].sum()
                insights['total_value'] += total_value
            
            # Extract top holdings
            if 'security' in df.columns and 'value' in df.columns:
                # Sort by value
                top_df = df.sort_values('value', ascending=False).head(5)
                
                for _, row in top_df.iterrows():
                    holding = {
                        'security': row.get('security', ''),
                        'value': float(row.get('value', 0)),
                        'weight': float(row.get('weight', 0)) if 'weight' in row else 0
                    }
                    
                    if 'isin' in row:
                        holding['isin'] = row['isin']
                    
                    if 'symbol' in row:
                        holding['symbol'] = row['symbol']
                    
                    insights['top_holdings'].append(holding)
            
            # Extract asset classes
            if 'type' in df.columns and 'value' in df.columns:
                asset_classes = df.groupby('type')['value'].sum().to_dict()
                
                for asset_class, value in asset_classes.items():
                    if asset_class in insights['asset_classes']:
                        insights['asset_classes'][asset_class] += value
                    else:
                        insights['asset_classes'][asset_class] = value
            
            # Extract currency
            if 'currency' in df.columns:
                # Get the most common currency
                currency = df['currency'].mode().iloc[0] if not df['currency'].empty else None
                insights['currency'] = currency
        
        return insights
    
    def _extract_asset_allocation_insights(self, tables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract insights from asset allocation tables.
        
        Args:
            tables: List of asset allocation tables
            
        Returns:
            Dictionary with asset allocation insights
        """
        insights = {
            'asset_classes': {},
            'total_value': 0,
            'diversification_score': 0
        }
        
        for table in tables:
            df = table.get('dataframe', pd.DataFrame())
            
            if df.empty:
                continue
            
            # Normalize column names
            df.columns = [str(col).lower() for col in df.columns]
            
            # Map common column names
            column_mapping = {
                'asset class': 'asset_class',
                'asset type': 'asset_class',
                'asset': 'asset_class',
                'class': 'asset_class',
                'type': 'asset_class',
                'allocation': 'weight',
                'weight': 'weight',
                'percentage': 'weight',
                '%': 'weight',
                'value': 'value',
                'amount': 'value',
                'total': 'value'
            }
            
            # Rename columns based on mapping
            for col in df.columns:
                for key, value in column_mapping.items():
                    if key in col:
                        df = df.rename(columns={col: value})
                        break
            
            # Extract asset classes
            if 'asset_class' in df.columns:
                if 'value' in df.columns:
                    # Convert to numeric if needed
                    if not pd.api.types.is_numeric_dtype(df['value']):
                        df['value'] = pd.to_numeric(df['value'].astype(str).str.replace(',', ''), errors='coerce')
                    
                    asset_classes = df.groupby('asset_class')['value'].sum().to_dict()
                    
                    for asset_class, value in asset_classes.items():
                        if asset_class in insights['asset_classes']:
                            insights['asset_classes'][asset_class] += value
                        else:
                            insights['asset_classes'][asset_class] = value
                    
                    # Extract total value
                    total_value = df['value'].sum()
                    insights['total_value'] += total_value
                elif 'weight' in df.columns:
                    # Convert to numeric if needed
                    if not pd.api.types.is_numeric_dtype(df['weight']):
                        df['weight'] = pd.to_numeric(df['weight'].astype(str).str.replace('%', '').str.replace(',', ''), errors='coerce')
                    
                    asset_classes = df.groupby('asset_class')['weight'].sum().to_dict()
                    
                    for asset_class, weight in asset_classes.items():
                        insights['asset_classes'][asset_class] = weight
        
        # Calculate diversification score
        if insights['asset_classes']:
            # Calculate Herfindahl-Hirschman Index (HHI)
            total_value = sum(insights['asset_classes'].values())
            
            if total_value > 0:
                weights = [value / total_value for value in insights['asset_classes'].values()]
                hhi = sum(w ** 2 for w in weights)
                
                # Convert HHI to diversification score (1 - HHI)
                insights['diversification_score'] = 1 - hhi
        
        return insights
    
    def _extract_income_statement_insights(self, tables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract insights from income statement tables.
        
        Args:
            tables: List of income statement tables
            
        Returns:
            Dictionary with income statement insights
        """
        # Placeholder for income statement insights
        insights = {
            'revenue': 0,
            'expenses': 0,
            'net_income': 0,
            'profit_margin': 0
        }
        
        return insights
    
    def _extract_balance_sheet_insights(self, tables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract insights from balance sheet tables.
        
        Args:
            tables: List of balance sheet tables
            
        Returns:
            Dictionary with balance sheet insights
        """
        # Placeholder for balance sheet insights
        insights = {
            'total_assets': 0,
            'total_liabilities': 0,
            'equity': 0,
            'debt_to_equity_ratio': 0
        }
        
        return insights
    
    def _generate_summary_insights(self, insights: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate summary insights from all tables.
        
        Args:
            insights: Dictionary with insights from all tables
            
        Returns:
            Dictionary with summary insights
        """
        summary = {
            'total_value': 0,
            'asset_classes': {},
            'key_metrics': {},
            'recommendations': []
        }
        
        # Combine total value
        if 'portfolio' in insights and 'total_value' in insights['portfolio']:
            summary['total_value'] = insights['portfolio']['total_value']
        elif 'asset_allocation' in insights and 'total_value' in insights['asset_allocation']:
            summary['total_value'] = insights['asset_allocation']['total_value']
        
        # Combine asset classes
        if 'portfolio' in insights and 'asset_classes' in insights['portfolio']:
            summary['asset_classes'] = insights['portfolio']['asset_classes']
        elif 'asset_allocation' in insights and 'asset_classes' in insights['asset_allocation']:
            summary['asset_classes'] = insights['asset_allocation']['asset_classes']
        
        # Add key metrics
        if 'portfolio' in insights and 'securities_count' in insights['portfolio']:
            summary['key_metrics']['securities_count'] = insights['portfolio']['securities_count']
        
        if 'asset_allocation' in insights and 'diversification_score' in insights['asset_allocation']:
            summary['key_metrics']['diversification_score'] = insights['asset_allocation']['diversification_score']
        
        # Generate recommendations
        if summary['asset_classes']:
            # Check for diversification
            if len(summary['asset_classes']) < 3:
                summary['recommendations'].append("Consider diversifying your portfolio across more asset classes.")
            
            # Check for concentration
            max_weight = max(summary['asset_classes'].values()) / sum(summary['asset_classes'].values())
            if max_weight > 0.5:
                summary['recommendations'].append("Your portfolio is heavily concentrated in one asset class. Consider rebalancing for better risk management.")
        
        return summary
    
    def save_results(self, results: Dict[str, Any], output_path: str) -> str:
        """
        Save results to a file.
        
        Args:
            results: Results dictionary
            output_path: Output file path
            
        Returns:
            Path to the saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save results to JSON file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        return output_path
