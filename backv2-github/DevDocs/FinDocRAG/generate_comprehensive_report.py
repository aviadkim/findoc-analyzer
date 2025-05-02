"""
Generate a comprehensive financial report from extracted data.
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

def generate_report(securities_path: str, summary_path: str, output_dir: str, output_format: str = "json"):
    """
    Generate a comprehensive report from extracted data.

    Args:
        securities_path: Path to the securities JSON file
        summary_path: Path to the portfolio summary JSON file
        output_dir: Directory to save the report
        output_format: Output format (json, csv, excel, pdf)
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Load securities
    with open(securities_path, 'r', encoding='utf-8') as f:
        securities_data = json.load(f)
    
    # Load portfolio summary
    with open(summary_path, 'r', encoding='utf-8') as f:
        summary_data = json.load(f)
    
    # Create a DataFrame from securities
    securities_df = pd.DataFrame(securities_data.get("securities", []))
    
    # Clean up data
    securities_df = clean_data(securities_df)
    
    # Generate comprehensive report
    report = {
        "portfolio_summary": summary_data,
        "securities_summary": {
            "total_securities": len(securities_df),
            "valid_isins": int(securities_df['is_valid_isin'].sum()) if 'is_valid_isin' in securities_df.columns else 0,
            "invalid_isins": int((~securities_df['is_valid_isin']).sum()) if 'is_valid_isin' in securities_df.columns else 0,
            "total_value": securities_df['actual_value'].sum() if 'actual_value' in securities_df.columns else None,
        },
        "securities": securities_df.to_dict(orient="records") if not securities_df.empty else []
    }
    
    # Add asset allocation from portfolio summary if available
    if summary_data.get("asset_allocation"):
        report["asset_allocation"] = summary_data["asset_allocation"]
    else:
        # Try to calculate from securities
        report["asset_allocation"] = calculate_asset_allocation(securities_df)
    
    # Add currency allocation from portfolio summary if available
    if summary_data.get("currency_allocation"):
        report["currency_allocation"] = summary_data["currency_allocation"]
    else:
        # Try to calculate from securities
        report["currency_allocation"] = calculate_currency_allocation(securities_df)
    
    # Save report
    report_path = os.path.join(output_dir, f"comprehensive_report.{output_format}")
    
    if output_format == "json":
        # Save as JSON
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
    elif output_format == "csv":
        # Save as CSV
        securities_df.to_csv(report_path, index=False)
    elif output_format == "excel":
        # Save as Excel
        with pd.ExcelWriter(report_path) as writer:
            securities_df.to_excel(writer, sheet_name="Securities", index=False)
            
            # Create summary sheet
            summary_df = pd.DataFrame([{
                "Total Securities": report["securities_summary"]["total_securities"],
                "Valid ISINs": report["securities_summary"]["valid_isins"],
                "Invalid ISINs": report["securities_summary"]["invalid_isins"],
                "Total Value": report["securities_summary"]["total_value"]
            }])
            summary_df.to_excel(writer, sheet_name="Summary", index=False)
            
            # Create asset allocation sheet
            if report.get("asset_allocation"):
                asset_df = pd.DataFrame([
                    {"Asset Class": asset, "Percentage": pct}
                    for asset, pct in report["asset_allocation"].items()
                ])
                asset_df.to_excel(writer, sheet_name="Asset Allocation", index=False)
            
            # Create currency allocation sheet
            if report.get("currency_allocation"):
                currency_df = pd.DataFrame([
                    {"Currency": currency, "Percentage": pct}
                    for currency, pct in report["currency_allocation"].items()
                ])
                currency_df.to_excel(writer, sheet_name="Currency Allocation", index=False)
    elif output_format == "pdf":
        # Save as PDF
        generate_pdf_report(securities_df, report, report_path)
    else:
        logger.error(f"Unsupported output format: {output_format}")
        return

    logger.info(f"Report saved to {report_path}")

    # Print summary
    print_summary(report)

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean up the data.

    Args:
        df: DataFrame with securities data

    Returns:
        Cleaned DataFrame
    """
    # Skip if DataFrame is empty
    if df.empty:
        return df
    
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

def calculate_asset_allocation(df: pd.DataFrame) -> Dict[str, float]:
    """
    Calculate asset allocation from securities.

    Args:
        df: DataFrame with securities data

    Returns:
        Dictionary mapping asset classes to percentages
    """
    asset_allocation = {}
    
    # Skip if DataFrame is empty
    if df.empty:
        return asset_allocation
    
    # Check if we have asset class information
    if 'asset_class' in df.columns:
        # Group by asset class
        asset_groups = df.groupby('asset_class').agg({
            'actual_value': 'sum'
        }).reset_index()
        
        # Calculate percentages
        total_value = asset_groups['actual_value'].sum()
        if total_value > 0:
            for _, row in asset_groups.iterrows():
                asset_class = row['asset_class']
                value = row['actual_value']
                percentage = (value / total_value) * 100
                asset_allocation[asset_class] = percentage
    
    return asset_allocation

def calculate_currency_allocation(df: pd.DataFrame) -> Dict[str, float]:
    """
    Calculate currency allocation from securities.

    Args:
        df: DataFrame with securities data

    Returns:
        Dictionary mapping currencies to percentages
    """
    currency_allocation = {}
    
    # Skip if DataFrame is empty
    if df.empty:
        return currency_allocation
    
    # Check if we have currency information
    if 'currency' in df.columns:
        # Group by currency
        currency_groups = df.groupby('currency').agg({
            'actual_value': 'sum'
        }).reset_index()
        
        # Calculate percentages
        total_value = currency_groups['actual_value'].sum()
        if total_value > 0:
            for _, row in currency_groups.iterrows():
                currency = row['currency']
                value = row['actual_value']
                percentage = (value / total_value) * 100
                currency_allocation[currency] = percentage
    
    return currency_allocation

def print_summary(report: Dict[str, Any]) -> None:
    """
    Print summary of the report.

    Args:
        report: Report dictionary
    """
    print("\nComprehensive Financial Report Summary:")
    print(f"Total Securities: {report['securities_summary']['total_securities']}")
    print(f"Valid ISINs: {report['securities_summary']['valid_isins']}")
    print(f"Invalid ISINs: {report['securities_summary']['invalid_isins']}")
    
    if report['securities_summary']['total_value'] is not None:
        print(f"Total Value: {report['securities_summary']['total_value']:,.2f}")
    
    if report.get("asset_allocation"):
        print("\nAsset Allocation:")
        for asset_class, percentage in report["asset_allocation"].items():
            print(f"  {asset_class}: {percentage:.2f}%")
    
    if report.get("currency_allocation"):
        print("\nCurrency Allocation:")
        for currency, percentage in report["currency_allocation"].items():
            print(f"  {currency}: {percentage:.2f}%")
    
    if report.get("portfolio_summary", {}).get("top_positions"):
        print("\nTop Positions:")
        for i, position in enumerate(report["portfolio_summary"]["top_positions"]):
            print(f"  {i+1}. {position['isin']}: {position['value']:,.2f} {position['currency']} ({position['percentage']:.2f}%)")

def generate_pdf_report(df: pd.DataFrame, report: Dict[str, Any], output_path: str) -> None:
    """
    Generate a PDF report.

    Args:
        df: DataFrame with securities data
        report: Report dictionary
        output_path: Path to save the PDF report
    """
    with PdfPages(output_path) as pdf:
        # Create a figure for the summary
        plt.figure(figsize=(12, 8))
        plt.title("Financial Report Summary", fontsize=16)
        plt.axis('off')
        
        summary_text = f"""
        Total Securities: {report['securities_summary']['total_securities']}
        Valid ISINs: {report['securities_summary']['valid_isins']}
        Invalid ISINs: {report['securities_summary']['invalid_isins']}
        Total Value: {report['securities_summary']['total_value']:,.2f} if {report['securities_summary']['total_value'] is not None} else "N/A"
        """
        
        plt.text(0.1, 0.9, summary_text, fontsize=12, verticalalignment='top')
        pdf.savefig()
        plt.close()
        
        # Create a figure for asset allocation
        if report.get("asset_allocation"):
            plt.figure(figsize=(10, 8))
            plt.title("Asset Allocation", fontsize=16)
            
            # Extract asset classes and percentages
            asset_classes = list(report["asset_allocation"].keys())
            percentages = list(report["asset_allocation"].values())
            
            if percentages:
                plt.pie(percentages, labels=asset_classes, autopct='%1.1f%%')
                plt.axis('equal')
                pdf.savefig()
                plt.close()
        
        # Create a figure for currency allocation
        if report.get("currency_allocation"):
            plt.figure(figsize=(10, 8))
            plt.title("Currency Allocation", fontsize=16)
            
            # Extract currencies and percentages
            currencies = list(report["currency_allocation"].keys())
            percentages = list(report["currency_allocation"].values())
            
            if percentages:
                plt.pie(percentages, labels=currencies, autopct='%1.1f%%')
                plt.axis('equal')
                pdf.savefig()
                plt.close()
        
        # Create a table for the top securities
        plt.figure(figsize=(12, 8))
        plt.title("Top Securities by Value", fontsize=16)
        plt.axis('off')
        
        # Sort securities by value
        if not df.empty and 'actual_value' in df.columns:
            top_securities = df.sort_values('actual_value', ascending=False).head(10)
            
            if not top_securities.empty:
                table_data = []
                for _, security in top_securities.iterrows():
                    table_data.append([
                        security.get('isin', 'N/A'),
                        security.get('description', 'N/A'),
                        f"{security.get('nominal_value', 0):,.2f}" if pd.notna(security.get('nominal_value')) else 'N/A',
                        f"{security.get('price', 0):,.2f}" if pd.notna(security.get('price')) else 'N/A',
                        f"{security.get('actual_value', 0):,.2f}" if pd.notna(security.get('actual_value')) else 'N/A',
                        security.get('currency', 'N/A')
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
    parser = argparse.ArgumentParser(description='Generate a comprehensive financial report.')
    parser.add_argument('securities_path', help='Path to the securities JSON file')
    parser.add_argument('summary_path', help='Path to the portfolio summary JSON file')
    parser.add_argument('--output-dir', default='src/reports', help='Directory to save the report')
    parser.add_argument('--format', choices=['json', 'csv', 'excel', 'pdf'], default='json', help='Output format')

    args = parser.parse_args()

    # Generate report
    generate_report(args.securities_path, args.summary_path, args.output_dir, args.format)

if __name__ == "__main__":
    main()
