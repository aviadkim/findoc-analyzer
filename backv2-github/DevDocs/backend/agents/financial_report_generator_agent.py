"""
Financial Report Generator Agent for generating financial reports.
"""
import os
import json
import logging
from typing import Dict, List, Any, Optional, Union
from .base_agent import BaseAgent

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FinancialReportGeneratorAgent(BaseAgent):
    """Agent for generating financial reports."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize the financial report generator agent.

        Args:
            api_key: OpenRouter API key (optional)
            **kwargs: Additional parameters for the base agent
        """
        super().__init__(name="Financial Report Generator")
        self.api_key = api_key
        self.description = "I generate financial reports from financial data."

    def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task to generate a financial report.

        Args:
            task: Task dictionary with the following keys:
                - data: Financial data to generate a report from
                - report_type: Type of report to generate (optional)
                - format: Format of the report (optional)
                - template: Template to use for the report (optional)

        Returns:
            Dictionary with the generated report
        """
        # Get the data
        if 'data' not in task:
            return {
                'status': 'error',
                'message': 'No data provided'
            }

        data = task['data']

        # Get report options
        report_type = task.get('report_type', 'summary')
        report_format = task.get('format', 'text')
        template = task.get('template', None)

        # Generate the report
        report = self.generate_report(data, report_type, report_format, template)

        return {
            'status': 'success',
            'report': report,
            'report_type': report_type,
            'format': report_format
        }

    def generate_report(
        self,
        data: Dict[str, Any],
        report_type: str = 'summary',
        report_format: str = 'text',
        template: Optional[Dict[str, Any]] = None
    ) -> Union[str, Dict[str, Any]]:
        """
        Generate a financial report.

        Args:
            data: Financial data to generate a report from
            report_type: Type of report to generate
            report_format: Format of the report
            template: Template to use for the report

        Returns:
            Generated report
        """
        # Check data type
        if 'type' in data:
            data_type = data['type']

            if data_type == 'portfolio':
                return self._generate_portfolio_report(data, report_type, report_format, template)
            elif data_type == 'financial_statement':
                return self._generate_financial_statement_report(data, report_type, report_format, template)
            elif data_type == 'transaction':
                return self._generate_transaction_report(data, report_type, report_format, template)

        # Generic report
        return self._generate_generic_report(data, report_type, report_format, template)

    def _generate_portfolio_report(
        self,
        data: Dict[str, Any],
        report_type: str,
        report_format: str,
        template: Optional[Dict[str, Any]]
    ) -> Union[str, Dict[str, Any]]:
        """
        Generate a portfolio report.

        Args:
            data: Portfolio data
            report_type: Type of report to generate
            report_format: Format of the report
            template: Template to use for the report

        Returns:
            Generated report
        """
        # Extract portfolio data
        portfolio = data.get('portfolio', {})
        securities = portfolio.get('securities', [])
        summary = portfolio.get('summary', {})

        # Generate report based on type
        if report_type == 'summary':
            return self._generate_portfolio_summary(securities, summary, report_format, template)
        elif report_type == 'detailed':
            return self._generate_portfolio_detailed(securities, summary, report_format, template)
        elif report_type == 'performance':
            return self._generate_portfolio_performance(securities, summary, report_format, template)
        else:
            # Default to summary
            return self._generate_portfolio_summary(securities, summary, report_format, template)

    def _generate_portfolio_summary(
        self,
        securities: List[Dict[str, Any]],
        summary: Dict[str, Any],
        report_format: str,
        template: Optional[Dict[str, Any]]
    ) -> Union[str, Dict[str, Any]]:
        """
        Generate a portfolio summary report.

        Args:
            securities: List of securities
            summary: Portfolio summary
            report_format: Format of the report
            template: Template to use for the report

        Returns:
            Generated report
        """
        # Calculate portfolio metrics
        total_value = summary.get('total_value', sum(security.get('value', 0) for security in securities))
        total_securities = summary.get('total_securities', len(securities))

        # Calculate asset allocation
        asset_allocation = {}
        for security in securities:
            asset_type = security.get('type', 'Unknown')
            value = security.get('value', 0)

            if asset_type in asset_allocation:
                asset_allocation[asset_type] += value
            else:
                asset_allocation[asset_type] = value

        # Calculate percentages
        asset_allocation_percentages = {}
        for asset_type, value in asset_allocation.items():
            percentage = (value / total_value) * 100 if total_value > 0 else 0
            asset_allocation_percentages[asset_type] = percentage

        # Get top holdings
        top_holdings = sorted(securities, key=lambda x: x.get('value', 0), reverse=True)[:5]

        # Generate report based on format
        if report_format == 'text':
            return self._generate_portfolio_summary_text(
                total_value,
                total_securities,
                asset_allocation_percentages,
                top_holdings,
                template
            )
        elif report_format == 'json':
            return self._generate_portfolio_summary_json(
                total_value,
                total_securities,
                asset_allocation_percentages,
                top_holdings,
                template
            )
        elif report_format == 'html':
            return self._generate_portfolio_summary_html(
                total_value,
                total_securities,
                asset_allocation_percentages,
                top_holdings,
                template
            )
        else:
            # Default to text
            return self._generate_portfolio_summary_text(
                total_value,
                total_securities,
                asset_allocation_percentages,
                top_holdings,
                template
            )

    def _generate_portfolio_summary_text(
        self,
        total_value: float,
        total_securities: int,
        asset_allocation: Dict[str, float],
        top_holdings: List[Dict[str, Any]],
        template: Optional[Dict[str, Any]]
    ) -> str:
        """
        Generate a portfolio summary report in text format.

        Args:
            total_value: Total portfolio value
            total_securities: Total number of securities
            asset_allocation: Asset allocation percentages
            top_holdings: Top holdings
            template: Template to use for the report

        Returns:
            Generated report
        """
        # Use template if provided
        if template and 'text' in template:
            # Replace placeholders in template
            report = template['text']
            report = report.replace('{total_value}', f"{total_value:,.2f}")
            report = report.replace('{total_securities}', str(total_securities))

            # Replace asset allocation placeholder
            asset_allocation_text = ""
            for asset_type, percentage in asset_allocation.items():
                asset_allocation_text += f"{asset_type}: {percentage:.2f}%\n"
            report = report.replace('{asset_allocation}', asset_allocation_text)

            # Replace top holdings placeholder
            top_holdings_text = ""
            for i, holding in enumerate(top_holdings):
                name = holding.get('name', holding.get('description', 'Unknown'))
                value = holding.get('value', 0)
                weight = holding.get('weight', 0)
                top_holdings_text += f"{i+1}. {name}: {value:,.2f} ({weight:.2f}%)\n"
            report = report.replace('{top_holdings}', top_holdings_text)

            return report

        # Generate report from scratch
        report = "Portfolio Summary Report\n"
        report += "=======================\n\n"

        report += f"Total Value: {total_value:,.2f}\n"
        report += f"Total Securities: {total_securities}\n\n"

        report += "Asset Allocation:\n"
        report += "-----------------\n"
        for asset_type, percentage in asset_allocation.items():
            report += f"{asset_type}: {percentage:.2f}%\n"
        report += "\n"

        report += "Top Holdings:\n"
        report += "-------------\n"
        for i, holding in enumerate(top_holdings):
            name = holding.get('name', holding.get('description', 'Unknown'))
            value = holding.get('value', 0)
            weight = holding.get('weight', 0)
            report += f"{i+1}. {name}: {value:,.2f} ({weight:.2f}%)\n"

        return report

    def _generate_portfolio_summary_json(
        self,
        total_value: float,
        total_securities: int,
        asset_allocation: Dict[str, float],
        top_holdings: List[Dict[str, Any]],
        template: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate a portfolio summary report in JSON format.

        Args:
            total_value: Total portfolio value
            total_securities: Total number of securities
            asset_allocation: Asset allocation percentages
            top_holdings: Top holdings
            template: Template to use for the report

        Returns:
            Generated report
        """
        # Use template if provided
        if template and 'json' in template:
            # Replace placeholders in template
            report = template['json'].copy()

            # Update summary
            if 'summary' in report:
                report['summary']['total_value'] = total_value
                report['summary']['total_securities'] = total_securities

            # Update asset allocation
            if 'asset_allocation' in report:
                report['asset_allocation'] = asset_allocation

            # Update top holdings
            if 'top_holdings' in report:
                report['top_holdings'] = [
                    {
                        'name': holding.get('name', holding.get('description', 'Unknown')),
                        'value': holding.get('value', 0),
                        'weight': holding.get('weight', 0)
                    }
                    for holding in top_holdings
                ]

            return report

        # Generate report from scratch
        return {
            'report_type': 'portfolio_summary',
            'summary': {
                'total_value': total_value,
                'total_securities': total_securities
            },
            'asset_allocation': asset_allocation,
            'top_holdings': [
                {
                    'name': holding.get('name', holding.get('description', 'Unknown')),
                    'value': holding.get('value', 0),
                    'weight': holding.get('weight', 0)
                }
                for holding in top_holdings
            ]
        }

    def _generate_portfolio_summary_html(
        self,
        total_value: float,
        total_securities: int,
        asset_allocation: Dict[str, float],
        top_holdings: List[Dict[str, Any]],
        template: Optional[Dict[str, Any]]
    ) -> str:
        """
        Generate a portfolio summary report in HTML format.

        Args:
            total_value: Total portfolio value
            total_securities: Total number of securities
            asset_allocation: Asset allocation percentages
            top_holdings: Top holdings
            template: Template to use for the report

        Returns:
            Generated report
        """
        # Use template if provided
        if template and 'html' in template:
            # Replace placeholders in template
            report = template['html']
            report = report.replace('{total_value}', f"{total_value:,.2f}")
            report = report.replace('{total_securities}', str(total_securities))

            # Replace asset allocation placeholder
            asset_allocation_html = "<table>"
            asset_allocation_html += "<tr><th>Asset Type</th><th>Percentage</th></tr>"
            for asset_type, percentage in asset_allocation.items():
                asset_allocation_html += f"<tr><td>{asset_type}</td><td>{percentage:.2f}%</td></tr>"
            asset_allocation_html += "</table>"
            report = report.replace('{asset_allocation}', asset_allocation_html)

            # Replace top holdings placeholder
            top_holdings_html = "<table>"
            top_holdings_html += "<tr><th>#</th><th>Name</th><th>Value</th><th>Weight</th></tr>"
            for i, holding in enumerate(top_holdings):
                name = holding.get('name', holding.get('description', 'Unknown'))
                value = holding.get('value', 0)
                weight = holding.get('weight', 0)
                top_holdings_html += f"<tr><td>{i+1}</td><td>{name}</td><td>{value:,.2f}</td><td>{weight:.2f}%</td></tr>"
            top_holdings_html += "</table>"
            report = report.replace('{top_holdings}', top_holdings_html)

            return report

        # Generate report from scratch
        report = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Portfolio Summary Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                h2 { color: #666; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <h1>Portfolio Summary Report</h1>

            <h2>Summary</h2>
            <p>Total Value: {total_value}</p>
            <p>Total Securities: {total_securities}</p>

            <h2>Asset Allocation</h2>
            <table>
                <tr>
                    <th>Asset Type</th>
                    <th>Percentage</th>
                </tr>
                {asset_allocation_rows}
            </table>

            <h2>Top Holdings</h2>
            <table>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Weight</th>
                </tr>
                {top_holdings_rows}
            </table>
        </body>
        </html>
        """

        # Replace placeholders
        report = report.replace('{total_value}', f"{total_value:,.2f}")
        report = report.replace('{total_securities}', str(total_securities))

        # Generate asset allocation rows
        asset_allocation_rows = ""
        for asset_type, percentage in asset_allocation.items():
            asset_allocation_rows += f"<tr><td>{asset_type}</td><td>{percentage:.2f}%</td></tr>"
        report = report.replace('{asset_allocation_rows}', asset_allocation_rows)

        # Generate top holdings rows
        top_holdings_rows = ""
        for i, holding in enumerate(top_holdings):
            name = holding.get('name', holding.get('description', 'Unknown'))
            value = holding.get('value', 0)
            weight = holding.get('weight', 0)
            top_holdings_rows += f"<tr><td>{i+1}</td><td>{name}</td><td>{value:,.2f}</td><td>{weight:.2f}%</td></tr>"
        report = report.replace('{top_holdings_rows}', top_holdings_rows)

        return report

    def _generate_portfolio_detailed(
        self,
        securities: List[Dict[str, Any]],
        summary: Dict[str, Any],
        report_format: str,
        template: Optional[Dict[str, Any]]
    ) -> Union[str, Dict[str, Any]]:
        """
        Generate a detailed portfolio report.

        Args:
            securities: List of securities
            summary: Portfolio summary
            report_format: Format of the report
            template: Template to use for the report

        Returns:
            Generated report
        """
        # This is a placeholder for a more detailed implementation
        # For now, we'll just call the summary report
        return self._generate_portfolio_summary(securities, summary, report_format, template)

    def _generate_portfolio_performance(
        self,
        securities: List[Dict[str, Any]],
        summary: Dict[str, Any],
        report_format: str,
        template: Optional[Dict[str, Any]]
    ) -> Union[str, Dict[str, Any]]:
        """
        Generate a portfolio performance report.

        Args:
            securities: List of securities
            summary: Portfolio summary
            report_format: Format of the report
            template: Template to use for the report

        Returns:
            Generated report
        """
        # This is a placeholder for a more detailed implementation
        # For now, we'll just call the summary report
        return self._generate_portfolio_summary(securities, summary, report_format, template)

    def _generate_financial_statement_report(
        self,
        data: Dict[str, Any],
        report_type: str,
        report_format: str,
        template: Optional[Dict[str, Any]]
    ) -> Union[str, Dict[str, Any]]:
        """
        Generate a financial statement report.

        Args:
            data: Financial statement data
            report_type: Type of report to generate
            report_format: Format of the report
            template: Template to use for the report

        Returns:
            Generated report
        """
        # This is a placeholder for a more detailed implementation
        return self._generate_generic_report(data, report_type, report_format, template)

    def _generate_transaction_report(
        self,
        data: Dict[str, Any],
        report_type: str,
        report_format: str,
        template: Optional[Dict[str, Any]]
    ) -> Union[str, Dict[str, Any]]:
        """
        Generate a transaction report.

        Args:
            data: Transaction data
            report_type: Type of report to generate
            report_format: Format of the report
            template: Template to use for the report

        Returns:
            Generated report
        """
        # This is a placeholder for a more detailed implementation
        return self._generate_generic_report(data, report_type, report_format, template)

    def _generate_generic_report(
        self,
        data: Dict[str, Any],
        report_type: str,
        report_format: str,
        template: Optional[Dict[str, Any]]
    ) -> Union[str, Dict[str, Any]]:
        """
        Generate a generic report.

        Args:
            data: Data to generate a report from
            report_type: Type of report to generate
            report_format: Format of the report
            template: Template to use for the report

        Returns:
            Generated report
        """
        # Generate report based on format
        if report_format == 'text':
            return json.dumps(data, indent=2)
        elif report_format == 'json':
            return data
        elif report_format == 'html':
            return f"<pre>{json.dumps(data, indent=2)}</pre>"
        else:
            # Default to text
            return json.dumps(data, indent=2)

    def save_report(self, report: Union[str, Dict[str, Any]], output_path: str, report_format: str = 'text') -> str:
        """
        Save a report to a file.

        Args:
            report: Report to save
            output_path: Output file path
            report_format: Format of the report

        Returns:
            Path to the saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save report based on format
        if report_format == 'json' and isinstance(report, dict):
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2)
        else:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(report)

        return output_path
