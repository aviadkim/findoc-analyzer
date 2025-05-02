"""
Generate a comprehensive report from extracted securities.
"""

import os
import sys
import json
import logging
import argparse
from typing import List, Dict, Any
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_report(securities_path: str, output_dir: str, output_format: str = "json"):
    """
    Generate a comprehensive report from extracted securities.

    Args:
        securities_path: Path to the securities JSON file
        output_dir: Directory to save the report
        output_format: Output format (json, csv, excel, pdf)
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Load securities
    with open(securities_path, 'r', encoding='utf-8') as f:
        securities = json.load(f)

    # Create a DataFrame
    df = pd.DataFrame(securities)

    # Clean up data
    df = clean_data(df)

    # Generate summary statistics
    summary = generate_summary(df)

    # Save report
    report_path = os.path.join(output_dir, f"securities_report.{output_format}")
    
    if output_format == "json":
        # Save as JSON
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
    elif output_format == "csv":
        # Save as CSV
        df.to_csv(report_path, index=False)
    elif output_format == "excel":
        # Save as Excel
        with pd.ExcelWriter(report_path) as writer:
            df.to_excel(writer, sheet_name="Securities", index=False)
            pd.DataFrame([summary]).to_excel(writer, sheet_name="Summary", index=False)
    elif output_format == "pdf":
        # Save as PDF
        generate_pdf_report(df, summary, report_path)
    else:
        logger.error(f"Unsupported output format: {output_format}")
        return

    logger.info(f"Report saved to {report_path}")

    # Print summary
    print_summary(summary)

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean up the data.

    Args:
        df: DataFrame with securities data

    Returns:
        Cleaned DataFrame
    """
    # Convert numeric columns to float
    numeric_columns = ['nominal_value', 'price', 'acquisition_price', 'actual_value', 'weight', 'asset_class_weight']
    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Fill missing values
    df = df.fillna({
        'description': 'Unknown',
        'currency': 'Unknown',
        'is_valid_isin': False
    })

    return df

def generate_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate summary statistics.

    Args:
        df: DataFrame with securities data

    Returns:
        Dictionary with summary statistics
    """
    summary = {
        "total_securities": len(df),
        "valid_isins": int(df['is_valid_isin'].sum()),
        "invalid_isins": int((~df['is_valid_isin']).sum()),
        "total_value": df['actual_value'].sum() if 'actual_value' in df.columns else None,
        "asset_classes": {},
        "currencies": {},
        "securities": []
    }

    # Group by asset class
    if 'asset_class_weight' in df.columns:
        asset_classes = df.groupby('asset_class_weight').agg({
            'actual_value': 'sum',
            'isin': 'count'
        }).reset_index()
        
        for _, row in asset_classes.iterrows():
            asset_class = row['asset_class_weight']
            if pd.notna(asset_class):
                summary["asset_classes"][str(asset_class)] = {
                    "count": int(row['isin']),
                    "value": float(row['actual_value']) if pd.notna(row['actual_value']) else None
                }

    # Group by currency
    if 'currency' in df.columns:
        currencies = df.groupby('currency').agg({
            'actual_value': 'sum',
            'isin': 'count'
        }).reset_index()
        
        for _, row in currencies.iterrows():
            currency = row['currency']
            if pd.notna(currency):
                summary["currencies"][str(currency)] = {
                    "count": int(row['isin']),
                    "value": float(row['actual_value']) if pd.notna(row['actual_value']) else None
                }

    # Add securities
    for _, row in df.iterrows():
        security = {
            "isin": row['isin'],
            "description": row['description'] if pd.notna(row['description']) else None,
            "nominal_value": float(row['nominal_value']) if 'nominal_value' in row and pd.notna(row['nominal_value']) else None,
            "price": float(row['price']) if 'price' in row and pd.notna(row['price']) else None,
            "acquisition_price": float(row['acquisition_price']) if 'acquisition_price' in row and pd.notna(row['acquisition_price']) else None,
            "actual_value": float(row['actual_value']) if 'actual_value' in row and pd.notna(row['actual_value']) else None,
            "currency": row['currency'] if 'currency' in row and pd.notna(row['currency']) else None,
            "weight": float(row['weight']) if 'weight' in row and pd.notna(row['weight']) else None,
            "asset_class_weight": float(row['asset_class_weight']) if 'asset_class_weight' in row and pd.notna(row['asset_class_weight']) else None,
            "is_valid_isin": bool(row['is_valid_isin'])
        }
        
        summary["securities"].append(security)

    return summary

def print_summary(summary: Dict[str, Any]) -> None:
    """
    Print summary statistics.

    Args:
        summary: Dictionary with summary statistics
    """
    print("\nSecurities Report Summary:")
    print(f"Total Securities: {summary['total_securities']}")
    print(f"Valid ISINs: {summary['valid_isins']}")
    print(f"Invalid ISINs: {summary['invalid_isins']}")
    
    if summary['total_value'] is not None:
        print(f"Total Value: {summary['total_value']:,.2f}")
    
    print("\nAsset Classes:")
    for asset_class, data in summary['asset_classes'].items():
        value_str = f"{data['value']:,.2f}" if data['value'] is not None else "N/A"
        print(f"  {asset_class}: {data['count']} securities, Value: {value_str}")
    
    print("\nCurrencies:")
    for currency, data in summary['currencies'].items():
        value_str = f"{data['value']:,.2f}" if data['value'] is not None else "N/A"
        print(f"  {currency}: {data['count']} securities, Value: {value_str}")
    
    print("\nTop 5 Securities by Value:")
    top_securities = sorted(
        [s for s in summary['securities'] if s['actual_value'] is not None],
        key=lambda x: x['actual_value'],
        reverse=True
    )[:5]
    
    for i, security in enumerate(top_securities):
        print(f"  {i+1}. {security['isin']} - {security['description']}: {security['actual_value']:,.2f} {security['currency'] or ''}")

def generate_pdf_report(df: pd.DataFrame, summary: Dict[str, Any], output_path: str) -> None:
    """
    Generate a PDF report.

    Args:
        df: DataFrame with securities data
        summary: Dictionary with summary statistics
        output_path: Path to save the PDF report
    """
    with PdfPages(output_path) as pdf:
        # Create a figure for the summary
        plt.figure(figsize=(12, 8))
        plt.title("Securities Report Summary", fontsize=16)
        plt.axis('off')
        
        summary_text = f"""
        Total Securities: {summary['total_securities']}
        Valid ISINs: {summary['valid_isins']}
        Invalid ISINs: {summary['invalid_isins']}
        Total Value: {summary['total_value']:,.2f} if {summary['total_value'] is not None} else "N/A"
        
        Asset Classes:
        {chr(10).join([f'  {asset_class}: {data["count"]} securities, Value: {data["value"]:,.2f} if {data["value"] is not None} else "N/A"' for asset_class, data in summary['asset_classes'].items()])}
        
        Currencies:
        {chr(10).join([f'  {currency}: {data["count"]} securities, Value: {data["value"]:,.2f} if {data["value"] is not None} else "N/A"' for currency, data in summary['currencies'].items()])}
        """
        
        plt.text(0.1, 0.9, summary_text, fontsize=12, verticalalignment='top')
        pdf.savefig()
        plt.close()
        
        # Create a figure for asset allocation
        if summary['asset_classes']:
            plt.figure(figsize=(10, 8))
            plt.title("Asset Allocation", fontsize=16)
            
            # Extract asset classes and values
            asset_classes = []
            values = []
            
            for asset_class, data in summary['asset_classes'].items():
                if data['value'] is not None:
                    asset_classes.append(asset_class)
                    values.append(data['value'])
            
            if values:
                plt.pie(values, labels=asset_classes, autopct='%1.1f%%')
                plt.axis('equal')
                pdf.savefig()
                plt.close()
        
        # Create a figure for currency allocation
        if summary['currencies']:
            plt.figure(figsize=(10, 8))
            plt.title("Currency Allocation", fontsize=16)
            
            # Extract currencies and values
            currencies = []
            values = []
            
            for currency, data in summary['currencies'].items():
                if data['value'] is not None:
                    currencies.append(currency)
                    values.append(data['value'])
            
            if values:
                plt.pie(values, labels=currencies, autopct='%1.1f%%')
                plt.axis('equal')
                pdf.savefig()
                plt.close()
        
        # Create a table for the top securities
        plt.figure(figsize=(12, 8))
        plt.title("Top Securities by Value", fontsize=16)
        plt.axis('off')
        
        top_securities = sorted(
            [s for s in summary['securities'] if s['actual_value'] is not None],
            key=lambda x: x['actual_value'],
            reverse=True
        )[:10]
        
        if top_securities:
            table_data = []
            for security in top_securities:
                table_data.append([
                    security['isin'],
                    security['description'] or 'N/A',
                    f"{security['nominal_value']:,.2f}" if security['nominal_value'] is not None else 'N/A',
                    f"{security['price']:,.2f}" if security['price'] is not None else 'N/A',
                    f"{security['actual_value']:,.2f}" if security['actual_value'] is not None else 'N/A',
                    security['currency'] or 'N/A'
                ])
            
            plt.table(
                cellText=table_data,
                colLabels=['ISIN', 'Description', 'Nominal Value', 'Price', 'Actual Value', 'Currency'],
                loc='center',
                cellLoc='center',
                colWidths=[0.15, 0.3, 0.15, 0.1, 0.15, 0.1]
            )
            
            pdf.savefig()
            plt.close()

def main():
    """
    Main function.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Generate a comprehensive report from extracted securities.')
    parser.add_argument('securities_path', help='Path to the securities JSON file')
    parser.add_argument('--output-dir', default='src/reports', help='Directory to save the report')
    parser.add_argument('--format', choices=['json', 'csv', 'excel', 'pdf'], default='json', help='Output format')

    args = parser.parse_args()

    # Generate report
    generate_report(args.securities_path, args.output_dir, args.format)

if __name__ == "__main__":
    main()
