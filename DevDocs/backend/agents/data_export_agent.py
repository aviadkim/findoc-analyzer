#!/usr/bin/env python3
"""
DataExportAgent for FinDoc Analyzer
This agent handles exporting financial data to various formats.
"""

import os
import json
import csv
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
import base64
import io
from typing import Dict, List, Any, Optional, Tuple, Union, BinaryIO

class DataExportAgent:
    """
    Agent that handles exporting financial data to various formats.
    """
    
    def __init__(self):
        """Initialize the DataExportAgent"""
        self.name = "DataExportAgent"
        self.version = "1.0.0"
        self.supported_formats = ['json', 'csv', 'excel', 'pdf', 'html']
        
        # Create exports directory if it doesn't exist
        self.export_dir = "exports"
        Path(self.export_dir).mkdir(exist_ok=True)
    
    def export_data(self, data: Dict[str, Any], format_type: str, 
                   filename: Optional[str] = None, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Export data to the specified format.
        
        Args:
            data: Data to export
            format_type: Format to export to ('json', 'csv', 'excel', 'pdf', 'html')
            filename: Optional filename (default is auto-generated)
            options: Optional export options
        
        Returns:
            Dictionary with export result
        """
        if format_type.lower() not in self.supported_formats:
            return {
                'status': 'error',
                'message': f"Unsupported format: {format_type}. Supported formats: {', '.join(self.supported_formats)}"
            }
        
        if not options:
            options = {}
        
        # Generate default filename if not provided
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"export_{timestamp}.{self._get_extension(format_type)}"
        elif not Path(filename).suffix:
            # Add extension if not provided
            filename = f"{filename}.{self._get_extension(format_type)}"
        
        # Ensure file has correct extension
        if not filename.endswith(f".{self._get_extension(format_type)}"):
            filename = f"{filename}.{self._get_extension(format_type)}"
        
        # Create full path
        file_path = os.path.join(self.export_dir, filename)
        
        try:
            # Call the appropriate export method
            if format_type.lower() == 'json':
                export_result = self._export_json(data, file_path, options)
            elif format_type.lower() == 'csv':
                export_result = self._export_csv(data, file_path, options)
            elif format_type.lower() == 'excel':
                export_result = self._export_excel(data, file_path, options)
            elif format_type.lower() == 'pdf':
                export_result = self._export_pdf(data, file_path, options)
            elif format_type.lower() == 'html':
                export_result = self._export_html(data, file_path, options)
            
            # Add metadata to result
            export_result['file_path'] = file_path
            export_result['file_size'] = os.path.getsize(file_path)
            export_result['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            return export_result
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f"Export failed: {str(e)}",
                'format': format_type,
                'filename': filename
            }
    
    def _get_extension(self, format_type: str) -> str:
        """
        Get the file extension for the specified format.
        
        Args:
            format_type: Format type
        
        Returns:
            File extension
        """
        extension_map = {
            'json': 'json',
            'csv': 'csv',
            'excel': 'xlsx',
            'pdf': 'pdf',
            'html': 'html'
        }
        
        return extension_map.get(format_type.lower(), format_type.lower())
    
    def _export_json(self, data: Dict[str, Any], file_path: str, 
                    options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Export data to JSON format.
        
        Args:
            data: Data to export
            file_path: Path to save file
            options: Export options
        
        Returns:
            Dictionary with export result
        """
        # Get export options
        indent = options.get('indent', 2)
        ensure_ascii = options.get('ensure_ascii', False)
        
        # Convert any unsupported types
        processed_data = self._prepare_data_for_json(data)
        
        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(processed_data, f, indent=indent, ensure_ascii=ensure_ascii)
        
        return {
            'status': 'success',
            'format': 'json',
            'message': f"Data exported to JSON successfully"
        }
    
    def _prepare_data_for_json(self, data: Any) -> Any:
        """
        Prepare data for JSON serialization by converting unsupported types.
        
        Args:
            data: Data to prepare
        
        Returns:
            Prepared data
        """
        if isinstance(data, dict):
            return {k: self._prepare_data_for_json(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self._prepare_data_for_json(item) for item in data]
        elif isinstance(data, (pd.DataFrame, pd.Series)):
            return self._prepare_data_for_json(data.to_dict())
        elif isinstance(data, np.ndarray):
            return self._prepare_data_for_json(data.tolist())
        elif isinstance(data, (np.int64, np.int32, np.float64, np.float32)):
            return data.item()
        elif isinstance(data, datetime):
            return data.isoformat()
        elif isinstance(data, (bytes, bytearray)):
            return base64.b64encode(data).decode('utf-8')
        else:
            return data
    
    def _export_csv(self, data: Dict[str, Any], file_path: str, 
                   options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Export data to CSV format.
        
        Args:
            data: Data to export
            file_path: Path to save file
            options: Export options
        
        Returns:
            Dictionary with export result
        """
        # Get export options
        delimiter = options.get('delimiter', ',')
        quotechar = options.get('quotechar', '"')
        encoding = options.get('encoding', 'utf-8')
        
        # Handle different data types
        try:
            # Case 1: Data is already a DataFrame
            if isinstance(data, pd.DataFrame):
                df = data
            
            # Case 2: Data is a list of dictionaries (e.g., securities)
            elif isinstance(data, list) and all(isinstance(item, dict) for item in data):
                df = pd.DataFrame(data)
            
            # Case 3: Data is a dictionary with 'securities' or similar key
            elif isinstance(data, dict):
                # Try common keys for tabular data
                for key in ['securities', 'data', 'records', 'items', 'transactions']:
                    if key in data and isinstance(data[key], list) and data[key]:
                        df = pd.DataFrame(data[key])
                        break
                else:
                    # If no suitable key found, try flattening the dictionary
                    flat_data = self._flatten_dict(data)
                    df = pd.DataFrame([flat_data])
            
            else:
                return {
                    'status': 'error',
                    'message': "Data format not suitable for CSV export"
                }
            
            # Export to CSV
            df.to_csv(file_path, index=False, sep=delimiter, quotechar=quotechar, encoding=encoding)
            
            return {
                'status': 'success',
                'format': 'csv',
                'message': f"Data exported to CSV successfully",
                'row_count': len(df),
                'column_count': len(df.columns)
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f"CSV export failed: {str(e)}"
            }
    
    def _flatten_dict(self, d: Dict[str, Any], parent_key: str = '', 
                     sep: str = '_') -> Dict[str, Any]:
        """
        Flatten a nested dictionary.
        
        Args:
            d: Dictionary to flatten
            parent_key: Parent key prefix
            sep: Separator for nested keys
        
        Returns:
            Flattened dictionary
        """
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep).items())
            elif isinstance(v, (list, tuple)) and all(isinstance(item, dict) for item in v):
                # For lists of dictionaries, create entries like key_0_subkey, key_1_subkey
                for i, item in enumerate(v):
                    if isinstance(item, dict):
                        items.extend(self._flatten_dict(item, f"{new_key}{sep}{i}", sep).items())
            else:
                # Convert non-primitive types to string
                if isinstance(v, (list, tuple, set)):
                    v = str(v)
                items.append((new_key, v))
        
        return dict(items)
    
    def _export_excel(self, data: Dict[str, Any], file_path: str, 
                     options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Export data to Excel format.
        
        Args:
            data: Data to export
            file_path: Path to save file
            options: Export options
        
        Returns:
            Dictionary with export result
        """
        try:
            # Create Excel writer
            with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
                
                # Case 1: Data is already a DataFrame
                if isinstance(data, pd.DataFrame):
                    data.to_excel(writer, sheet_name='Data', index=False)
                
                # Case 2: Data is a dictionary of DataFrames or lists (multiple sheets)
                elif isinstance(data, dict) and any(isinstance(v, (pd.DataFrame, list)) for v in data.values()):
                    sheets_created = 0
                    
                    for key, value in data.items():
                        sheet_name = str(key)[:31]  # Excel sheet names are limited to 31 chars
                        
                        if isinstance(value, pd.DataFrame):
                            value.to_excel(writer, sheet_name=sheet_name, index=False)
                            sheets_created += 1
                        elif isinstance(value, list) and all(isinstance(item, dict) for item in value):
                            pd.DataFrame(value).to_excel(writer, sheet_name=sheet_name, index=False)
                            sheets_created += 1
                    
                    if sheets_created == 0:
                        raise ValueError("No valid data found for Excel export")
                
                # Case 3: Data is a list of dictionaries
                elif isinstance(data, list) and all(isinstance(item, dict) for item in data):
                    pd.DataFrame(data).to_excel(writer, sheet_name='Data', index=False)
                
                # Case 4: Complex nested dictionary
                else:
                    # Try common keys for tabular data
                    sheets_created = 0
                    
                    for key in ['securities', 'data', 'records', 'items', 'transactions', 'analysis']:
                        if key in data and isinstance(data[key], (list, pd.DataFrame)):
                            sheet_name = str(key)[:31]
                            
                            if isinstance(data[key], pd.DataFrame):
                                data[key].to_excel(writer, sheet_name=sheet_name, index=False)
                            else:
                                pd.DataFrame(data[key]).to_excel(writer, sheet_name=sheet_name, index=False)
                            
                            sheets_created += 1
                    
                    # Add a summary sheet if there's metadata
                    if 'metadata' in data and isinstance(data['metadata'], dict):
                        summary_df = pd.DataFrame([self._flatten_dict(data['metadata'])])
                        summary_df.to_excel(writer, sheet_name='Summary', index=False)
                        sheets_created += 1
                    
                    if sheets_created == 0:
                        # If no suitable keys found, flatten the entire dictionary
                        flat_data = self._flatten_dict(data)
                        pd.DataFrame([flat_data]).to_excel(writer, sheet_name='Data', index=False)
            
            return {
                'status': 'success',
                'format': 'excel',
                'message': f"Data exported to Excel successfully"
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f"Excel export failed: {str(e)}"
            }
    
    def _export_pdf(self, data: Dict[str, Any], file_path: str, 
                   options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Export data to PDF format.
        
        Args:
            data: Data to export
            file_path: Path to save file
            options: Export options
        
        Returns:
            Dictionary with export result
        """
        try:
            # Try to import required packages
            try:
                from reportlab.lib import colors
                from reportlab.lib.pagesizes import letter, A4
                from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
                from reportlab.lib.styles import getSampleStyleSheet
            except ImportError:
                return {
                    'status': 'error',
                    'message': "PDF export requires reportlab package. Please install it with 'pip install reportlab'."
                }
            
            # Get export options
            page_size = options.get('page_size', 'letter')
            title = options.get('title', 'Financial Data Export')
            
            # Set page size
            if page_size.lower() == 'a4':
                page_size = A4
            else:
                page_size = letter
            
            # Create the PDF document
            doc = SimpleDocTemplate(file_path, pagesize=page_size)
            styles = getSampleStyleSheet()
            elements = []
            
            # Add title
            elements.append(Paragraph(title, styles['Title']))
            elements.append(Spacer(1, 12))
            
            # Add timestamp
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            elements.append(Paragraph(f"Generated: {timestamp}", styles['Normal']))
            elements.append(Spacer(1, 12))
            
            # Process different data types
            if isinstance(data, pd.DataFrame):
                # Convert DataFrame to table
                df = data
                table_data = [df.columns.tolist()] + df.values.tolist()
                self._add_table_to_pdf(elements, table_data, styles)
                
            elif isinstance(data, list) and all(isinstance(item, dict) for item in data):
                # Convert list of dictionaries to DataFrame, then to table
                df = pd.DataFrame(data)
                table_data = [df.columns.tolist()] + df.values.tolist()
                self._add_table_to_pdf(elements, table_data, styles)
                
            elif isinstance(data, dict):
                # Process dictionary data
                for key, value in data.items():
                    # Add section header
                    elements.append(Paragraph(key, styles['Heading2']))
                    elements.append(Spacer(1, 6))
                    
                    if isinstance(value, pd.DataFrame):
                        # Add DataFrame as table
                        table_data = [value.columns.tolist()] + value.values.tolist()
                        self._add_table_to_pdf(elements, table_data, styles)
                        
                    elif isinstance(value, list) and all(isinstance(item, dict) for item in value):
                        # Add list of dictionaries as table
                        df = pd.DataFrame(value)
                        table_data = [df.columns.tolist()] + df.values.tolist()
                        self._add_table_to_pdf(elements, table_data, styles)
                        
                    elif isinstance(value, dict):
                        # Add dictionary as key-value table
                        table_data = [['Key', 'Value']]
                        for k, v in value.items():
                            # Convert complex values to string
                            if isinstance(v, (dict, list, set)):
                                v = str(v)
                            table_data.append([k, v])
                        self._add_table_to_pdf(elements, table_data, styles)
                        
                    else:
                        # Add simple value as text
                        elements.append(Paragraph(f"{key}: {value}", styles['Normal']))
                    
                    elements.append(Spacer(1, 12))
            
            # Add disclaimer
            elements.append(Spacer(1, 24))
            elements.append(Paragraph("Disclaimer: This report is for informational purposes only.", 
                                      styles['Italic']))
            
            # Build the PDF
            doc.build(elements)
            
            return {
                'status': 'success',
                'format': 'pdf',
                'message': "Data exported to PDF successfully"
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f"PDF export failed: {str(e)}"
            }
    
    def _add_table_to_pdf(self, elements: List, table_data: List, styles: Any) -> None:
        """
        Add a table to PDF elements.
        
        Args:
            elements: List of PDF elements
            table_data: Table data
            styles: PDF styles
        """
        from reportlab.lib import colors
        from reportlab.platypus import Table, TableStyle, Spacer
        
        # Clean data (convert objects to strings)
        for i, row in enumerate(table_data):
            for j, cell in enumerate(row):
                if isinstance(cell, (dict, list, set, np.ndarray)):
                    table_data[i][j] = str(cell)
                elif pd.isna(cell):
                    table_data[i][j] = ""
        
        # Create the table
        table = Table(table_data)
        
        # Add style
        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ])
        table.setStyle(style)
        
        # Add table to elements
        elements.append(table)
        elements.append(Spacer(1, 12))
    
    def _export_html(self, data: Dict[str, Any], file_path: str, 
                    options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Export data to HTML format.
        
        Args:
            data: Data to export
            file_path: Path to save file
            options: Export options
        
        Returns:
            Dictionary with export result
        """
        try:
            # Get export options
            title = options.get('title', 'Financial Data Export')
            include_styles = options.get('include_styles', True)
            include_charts = options.get('include_charts', False)
            
            # Create HTML content
            html_content = [
                '<!DOCTYPE html>',
                '<html>',
                '<head>',
                f'  <title>{title}</title>',
                '  <meta charset="UTF-8">',
            ]
            
            # Add styles if requested
            if include_styles:
                html_content.extend([
                    '  <style>',
                    '    body { font-family: Arial, sans-serif; margin: 20px; }',
                    '    h1 { color: #2c3e50; }',
                    '    h2 { color: #34495e; margin-top: 20px; }',
                    '    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }',
                    '    th { background-color: #34495e; color: white; text-align: left; padding: 8px; }',
                    '    td { border: 1px solid #ddd; padding: 8px; }',
                    '    tr:nth-child(even) { background-color: #f2f2f2; }',
                    '    .timestamp { color: #7f8c8d; font-style: italic; margin-bottom: 20px; }',
                    '    .disclaimer { color: #7f8c8d; font-style: italic; margin-top: 30px; font-size: 0.9em; }',
                    '  </style>',
                ])
            
            # Add charts library if requested
            if include_charts:
                html_content.extend([
                    '  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>',
                ])
            
            # Close head and start body
            html_content.extend([
                '</head>',
                '<body>',
                f'  <h1>{title}</h1>',
                f'  <p class="timestamp">Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>',
            ])
            
            # Process different data types
            if isinstance(data, pd.DataFrame):
                # Convert DataFrame to HTML table
                html_content.append(self._dataframe_to_html_table(data))
                
            elif isinstance(data, list) and all(isinstance(item, dict) for item in data):
                # Convert list of dictionaries to DataFrame, then to HTML table
                df = pd.DataFrame(data)
                html_content.append(self._dataframe_to_html_table(df))
                
            elif isinstance(data, dict):
                # Process dictionary data
                for key, value in data.items():
                    html_content.append(f'  <h2>{key}</h2>')
                    
                    if isinstance(value, pd.DataFrame):
                        # Add DataFrame as HTML table
                        html_content.append(self._dataframe_to_html_table(value))
                        
                    elif isinstance(value, list) and all(isinstance(item, dict) for item in value):
                        # Add list of dictionaries as HTML table
                        df = pd.DataFrame(value)
                        html_content.append(self._dataframe_to_html_table(df))
                        
                    elif isinstance(value, dict):
                        # Add dictionary as key-value HTML table
                        html_content.append('  <table>')
                        html_content.append('    <tr><th>Key</th><th>Value</th></tr>')
                        
                        for k, v in value.items():
                            # Convert complex values to string
                            if isinstance(v, (dict, list, set)):
                                v = str(v)
                            html_content.append(f'    <tr><td>{k}</td><td>{v}</td></tr>')
                        
                        html_content.append('  </table>')
                        
                    else:
                        # Add simple value as text
                        html_content.append(f'  <p>{key}: {value}</p>')
            
            # Add disclaimer and close HTML
            html_content.extend([
                '  <p class="disclaimer">Disclaimer: This report is for informational purposes only.</p>',
                '</body>',
                '</html>',
            ])
            
            # Write to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(html_content))
            
            return {
                'status': 'success',
                'format': 'html',
                'message': "Data exported to HTML successfully"
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f"HTML export failed: {str(e)}"
            }
    
    def _dataframe_to_html_table(self, df: pd.DataFrame) -> str:
        """
        Convert DataFrame to HTML table.
        
        Args:
            df: DataFrame to convert
        
        Returns:
            HTML table string
        """
        html_table = ['  <table>']
        
        # Add header
        html_table.append('    <tr>')
        for col in df.columns:
            html_table.append(f'      <th>{col}</th>')
        html_table.append('    </tr>')
        
        # Add rows
        for _, row in df.iterrows():
            html_table.append('    <tr>')
            for val in row:
                # Handle different value types
                if pd.isna(val):
                    cell_value = ''
                elif isinstance(val, (dict, list, set)):
                    cell_value = str(val)
                else:
                    cell_value = val
                html_table.append(f'      <td>{cell_value}</td>')
            html_table.append('    </tr>')
        
        html_table.append('  </table>')
        return '\n'.join(html_table)
    
    def export_portfolio(self, portfolio_data: Dict[str, Any], format_type: str, 
                        filename: Optional[str] = None, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Export portfolio data with specialized formatting.
        
        Args:
            portfolio_data: Portfolio data
            format_type: Format to export to
            filename: Optional filename
            options: Optional export options
        
        Returns:
            Dictionary with export result
        """
        # Set default options
        if not options:
            options = {}
        
        # Set portfolio-specific options
        if 'title' not in options:
            options['title'] = 'Portfolio Summary'
        
        # Generate default filename if not provided
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"portfolio_{timestamp}"
        
        # Extract relevant portfolio data
        export_data = {
            'metadata': portfolio_data.get('metadata', {}),
            'summary': portfolio_data.get('summary', {}),
            'securities': portfolio_data.get('securities', [])
        }
        
        # Add analysis if available
        if 'analysis' in portfolio_data:
            export_data['analysis'] = portfolio_data['analysis']
        
        # Export the data
        return self.export_data(export_data, format_type, filename, options)
    
    def export_analysis(self, analysis_data: Dict[str, Any], format_type: str, 
                       filename: Optional[str] = None, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Export analysis data with specialized formatting.
        
        Args:
            analysis_data: Analysis data
            format_type: Format to export to
            filename: Optional filename
            options: Optional export options
        
        Returns:
            Dictionary with export result
        """
        # Set default options
        if not options:
            options = {}
        
        # Set analysis-specific options
        if 'title' not in options:
            options['title'] = 'Financial Analysis Report'
        
        # Generate default filename if not provided
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"analysis_{timestamp}"
        
        # Export the data
        return self.export_data(analysis_data, format_type, filename, options)
    
    def print_info(self) -> Dict[str, Any]:
        """
        Print information about the DataExportAgent.
        
        Returns:
            Dictionary with agent information
        """
        return {
            'name': self.name,
            'version': self.version,
            'description': 'Agent that handles exporting financial data to various formats',
            'supported_formats': self.supported_formats,
            'capabilities': [
                'Export data to JSON, CSV, Excel, PDF, and HTML formats',
                'Specialized export for portfolio data',
                'Specialized export for analysis data',
                'Support for various export options'
            ]
        }

# Demo code
if __name__ == "__main__":
    # Create an instance of the agent
    export_agent = DataExportAgent()
    
    # Print agent information
    print(json.dumps(export_agent.print_info(), indent=2))
    
    # Sample data for testing
    sample_data = {
        'metadata': {
            'date': '2025-05-08',
            'account': '123456789',
            'report_type': 'portfolio_summary'
        },
        'securities': [
            {'name': 'US Large Cap Fund', 'isin': 'US1234567890', 'value': 50000, 'currency': 'USD', 'weight': 0.5},
            {'name': 'Global Bond Fund', 'isin': 'US0987654321', 'value': 30000, 'currency': 'USD', 'weight': 0.3},
            {'name': 'Emerging Markets ETF', 'isin': 'US5555555555', 'value': 20000, 'currency': 'USD', 'weight': 0.2}
        ],
        'summary': {
            'total_value': 100000,
            'currency': 'USD',
            'asset_allocation': {
                'equity': 70,
                'fixed_income': 30
            }
        }
    }
    
    # Export to different formats
    json_result = export_agent.export_data(sample_data, 'json')
    csv_result = export_agent.export_data(sample_data, 'csv')
    excel_result = export_agent.export_data(sample_data, 'excel')
    
    # Print results
    print("\nExport Results:")
    for result in [json_result, csv_result, excel_result]:
        print(f"- {result['format']}: {result['message']} ({result['file_path']})")
