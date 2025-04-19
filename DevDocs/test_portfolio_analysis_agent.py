"""
Test script for the PortfolioAnalysisAgent.
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
from DevDocs.backend.agents.portfolio_analysis_agent import PortfolioAnalysisAgent

# Import test document creation functions
from DevDocs.test_document_integration_agent import create_test_portfolio_documents

def create_test_benchmark():
    """
    Create a test benchmark for portfolio analysis.
    
    Returns:
        Test benchmark
    """
    return {
        "name": "Test Benchmark",
        "allocation": {
            "Equity": 60.0,
            "Fixed Income": 30.0,
            "Cash": 10.0
        },
        "historical_returns": [0.01, 0.02, 0.03, 0.02, 0.01]
    }

def test_portfolio_analysis_agent():
    """
    Test the PortfolioAnalysisAgent with various inputs.
    """
    logger.info("Testing PortfolioAnalysisAgent")
    
    # Create output directory
    output_dir = Path("agent_test_results")
    output_dir.mkdir(exist_ok=True)
    
    # Initialize the agent
    agent = PortfolioAnalysisAgent()
    
    # Create test data
    portfolio_docs = create_test_portfolio_documents()
    benchmark = create_test_benchmark()
    
    # Test 1: Comprehensive portfolio analysis
    logger.info("Test 1: Comprehensive portfolio analysis")
    
    task1 = {
        "portfolio": portfolio_docs[0],
        "analysis_type": "comprehensive"
    }
    
    result1 = agent.process(task1)
    
    # Save the result
    with open(output_dir / "portfolio_analysis_comprehensive_result.json", "w", encoding="utf-8") as f:
        json.dump(result1, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 1 result saved to {output_dir / 'portfolio_analysis_comprehensive_result.json'}")
    
    # Test 2: Risk analysis
    logger.info("Test 2: Risk analysis")
    
    task2 = {
        "portfolio": portfolio_docs[0],
        "analysis_type": "risk"
    }
    
    result2 = agent.process(task2)
    
    # Save the result
    with open(output_dir / "portfolio_analysis_risk_result.json", "w", encoding="utf-8") as f:
        json.dump(result2, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 2 result saved to {output_dir / 'portfolio_analysis_risk_result.json'}")
    
    # Test 3: Performance analysis
    logger.info("Test 3: Performance analysis")
    
    task3 = {
        "portfolio": portfolio_docs[0],
        "analysis_type": "performance"
    }
    
    result3 = agent.process(task3)
    
    # Save the result
    with open(output_dir / "portfolio_analysis_performance_result.json", "w", encoding="utf-8") as f:
        json.dump(result3, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 3 result saved to {output_dir / 'portfolio_analysis_performance_result.json'}")
    
    # Test 4: Allocation analysis
    logger.info("Test 4: Allocation analysis")
    
    task4 = {
        "portfolio": portfolio_docs[0],
        "analysis_type": "allocation"
    }
    
    result4 = agent.process(task4)
    
    # Save the result
    with open(output_dir / "portfolio_analysis_allocation_result.json", "w", encoding="utf-8") as f:
        json.dump(result4, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 4 result saved to {output_dir / 'portfolio_analysis_allocation_result.json'}")
    
    # Test 5: Analysis with benchmark
    logger.info("Test 5: Analysis with benchmark")
    
    task5 = {
        "portfolio": portfolio_docs[0],
        "analysis_type": "comprehensive",
        "benchmark": benchmark
    }
    
    result5 = agent.process(task5)
    
    # Save the result
    with open(output_dir / "portfolio_analysis_benchmark_result.json", "w", encoding="utf-8") as f:
        json.dump(result5, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 5 result saved to {output_dir / 'portfolio_analysis_benchmark_result.json'}")
    
    # Print summary
    logger.info("PortfolioAnalysisAgent tests completed")
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
    test_portfolio_analysis_agent()
