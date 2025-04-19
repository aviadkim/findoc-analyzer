"""
Test script for the FinancialReportGeneratorAgent.
"""
import os
import sys
import json
import argparse
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the agent
from DevDocs.backend.agents.financial_report_generator_agent import FinancialReportGeneratorAgent

# Import test document creation functions
from DevDocs.test_document_integration_agent import (
    create_test_portfolio_documents,
    create_test_financial_statements,
    create_test_transactions
)

def create_test_template():
    """
    Create a test template for the report.
    
    Returns:
        Test template
    """
    return {
        'text': """
Portfolio Summary Report
=======================

Total Value: {total_value}
Total Securities: {total_securities}

Asset Allocation:
-----------------
{asset_allocation}

Top Holdings:
-------------
{top_holdings}
""",
        'json': {
            'report_type': 'portfolio_summary',
            'summary': {
                'total_value': 0,
                'total_securities': 0
            },
            'asset_allocation': {},
            'top_holdings': []
        },
        'html': """
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
    {asset_allocation}
    
    <h2>Top Holdings</h2>
    {top_holdings}
</body>
</html>
"""
    }

def test_financial_report_generator_agent():
    """
    Test the FinancialReportGeneratorAgent with various inputs.
    """
    logger.info("Testing FinancialReportGeneratorAgent")
    
    # Create output directory
    output_dir = Path("agent_test_results")
    output_dir.mkdir(exist_ok=True)
    
    # Initialize the agent
    agent = FinancialReportGeneratorAgent()
    
    # Create test data
    portfolio_docs = create_test_portfolio_documents()
    statement_docs = create_test_financial_statements()
    transaction_docs = create_test_transactions()
    template = create_test_template()
    
    # Test 1: Generate portfolio summary report in text format
    logger.info("Test 1: Generate portfolio summary report in text format")
    
    task1 = {
        "data": portfolio_docs[0],
        "report_type": "summary",
        "format": "text"
    }
    
    result1 = agent.process(task1)
    
    # Save the result
    with open(output_dir / "financial_report_text_result.json", "w", encoding="utf-8") as f:
        json.dump(result1, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 1 result saved to {output_dir / 'financial_report_text_result.json'}")
    
    # Test 2: Generate portfolio summary report in JSON format
    logger.info("Test 2: Generate portfolio summary report in JSON format")
    
    task2 = {
        "data": portfolio_docs[0],
        "report_type": "summary",
        "format": "json"
    }
    
    result2 = agent.process(task2)
    
    # Save the result
    with open(output_dir / "financial_report_json_result.json", "w", encoding="utf-8") as f:
        json.dump(result2, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 2 result saved to {output_dir / 'financial_report_json_result.json'}")
    
    # Test 3: Generate portfolio summary report in HTML format
    logger.info("Test 3: Generate portfolio summary report in HTML format")
    
    task3 = {
        "data": portfolio_docs[0],
        "report_type": "summary",
        "format": "html"
    }
    
    result3 = agent.process(task3)
    
    # Save the result
    with open(output_dir / "financial_report_html_result.json", "w", encoding="utf-8") as f:
        json.dump(result3, f, ensure_ascii=False, indent=2)
    
    # Save the HTML report
    if result3['status'] == 'success':
        with open(output_dir / "financial_report.html", "w", encoding="utf-8") as f:
            f.write(result3['report'])
    
    logger.info(f"Test 3 result saved to {output_dir / 'financial_report_html_result.json'}")
    
    # Test 4: Generate portfolio summary report with template
    logger.info("Test 4: Generate portfolio summary report with template")
    
    task4 = {
        "data": portfolio_docs[0],
        "report_type": "summary",
        "format": "text",
        "template": template
    }
    
    result4 = agent.process(task4)
    
    # Save the result
    with open(output_dir / "financial_report_template_result.json", "w", encoding="utf-8") as f:
        json.dump(result4, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 4 result saved to {output_dir / 'financial_report_template_result.json'}")
    
    # Test 5: Generate financial statement report
    logger.info("Test 5: Generate financial statement report")
    
    task5 = {
        "data": statement_docs[0],
        "report_type": "summary",
        "format": "text"
    }
    
    result5 = agent.process(task5)
    
    # Save the result
    with open(output_dir / "financial_statement_report_result.json", "w", encoding="utf-8") as f:
        json.dump(result5, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 5 result saved to {output_dir / 'financial_statement_report_result.json'}")
    
    # Print summary
    logger.info("FinancialReportGeneratorAgent tests completed")
    logger.info(f"Results saved to {output_dir}")
    
    return {
        'status': 'success',
        'test1_result': result1['status'] == 'success',
        'test2_result': result2['status'] == 'success',
        'test3_result': result3['status'] == 'success',
        'test4_result': result4['status'] == 'success',
        'test5_result': result5['status'] == 'success',
        'output_dir': str(output_dir)
    }

if __name__ == "__main__":
    test_financial_report_generator_agent()
