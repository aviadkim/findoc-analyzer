"""
Combined test script for Week 6 agents.
"""
import os
import sys
import json
import argparse
import logging
from pathlib import Path
import time

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_tests():
    """
    Run all tests for Week 6 agents.
    """
    logger.info("Running Week 6 tests")
    
    # Create output directory
    output_dir = Path("agent_test_results")
    output_dir.mkdir(exist_ok=True)
    
    # Create a summary file
    summary = {
        'timestamp': time.strftime("%Y-%m-%d %H:%M:%S"),
        'tests': {}
    }
    
    # Test 1: FinancialReportGeneratorAgent
    logger.info("Test 1: FinancialReportGeneratorAgent")
    try:
        from DevDocs.test_financial_report_generator_agent import test_financial_report_generator_agent
        report_generator_result = test_financial_report_generator_agent()
        summary['tests']['financial_report_generator_agent'] = report_generator_result
        logger.info("FinancialReportGeneratorAgent test completed successfully")
    except Exception as e:
        logger.error(f"Error running FinancialReportGeneratorAgent test: {str(e)}")
        summary['tests']['financial_report_generator_agent'] = {
            'status': 'error',
            'error': str(e)
        }
    
    # Test 2: PortfolioAnalysisAgent
    logger.info("Test 2: PortfolioAnalysisAgent")
    try:
        from DevDocs.test_portfolio_analysis_agent import test_portfolio_analysis_agent
        portfolio_analysis_result = test_portfolio_analysis_agent()
        summary['tests']['portfolio_analysis_agent'] = portfolio_analysis_result
        logger.info("PortfolioAnalysisAgent test completed successfully")
    except Exception as e:
        logger.error(f"Error running PortfolioAnalysisAgent test: {str(e)}")
        summary['tests']['portfolio_analysis_agent'] = {
            'status': 'error',
            'error': str(e)
        }
    
    # Save the summary
    with open(output_dir / "week6_test_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Week 6 tests completed. Summary saved to {output_dir / 'week6_test_summary.json'}")
    
    return summary

if __name__ == "__main__":
    run_tests()
