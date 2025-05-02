"""
Test script for the QueryEngineAgent.
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
from DevDocs.backend.agents.query_engine_agent_fixed import QueryEngineAgent

# Import test document creation functions
from DevDocs.test_document_integration_agent import (
    create_test_portfolio_documents,
    create_test_financial_statements,
    create_test_transactions
)

def test_query_engine_agent(api_key=None):
    """
    Test the QueryEngineAgent with various inputs.
    
    Args:
        api_key: OpenRouter API key
    """
    logger.info("Testing QueryEngineAgent")
    
    # Check if API key is available
    if not api_key:
        logger.error("No API key provided. QueryEngineAgent tests will fail.")
        return {
            'status': 'error',
            'message': 'No API key provided'
        }
    
    # Create output directory
    output_dir = Path("agent_test_results")
    output_dir.mkdir(exist_ok=True)
    
    # Initialize the agent
    agent = QueryEngineAgent(api_key=api_key)
    
    # Create test documents
    portfolio_docs = create_test_portfolio_documents()
    statement_docs = create_test_financial_statements()
    transaction_docs = create_test_transactions()
    
    # Combine all documents
    all_docs = portfolio_docs + statement_docs + transaction_docs
    
    # Test 1: Simple portfolio question
    logger.info("Test 1: Simple portfolio question")
    question1 = "What is the total value of the portfolio?"
    
    task1 = {
        "question": question1,
        "documents": portfolio_docs,
        "format": "text"
    }
    
    result1 = agent.process(task1)
    
    # Save the result
    with open(output_dir / "query_engine_portfolio_result.json", "w", encoding="utf-8") as f:
        json.dump(result1, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 1 result saved to {output_dir / 'query_engine_portfolio_result.json'}")
    
    # Test 2: Financial statement question
    logger.info("Test 2: Financial statement question")
    question2 = "What was the net income in Q2 2023?"
    
    task2 = {
        "question": question2,
        "documents": statement_docs,
        "format": "text"
    }
    
    result2 = agent.process(task2)
    
    # Save the result
    with open(output_dir / "query_engine_statement_result.json", "w", encoding="utf-8") as f:
        json.dump(result2, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 2 result saved to {output_dir / 'query_engine_statement_result.json'}")
    
    # Test 3: Transaction question
    logger.info("Test 3: Transaction question")
    question3 = "What transactions were made in January 2023?"
    
    task3 = {
        "question": question3,
        "documents": transaction_docs,
        "format": "text"
    }
    
    result3 = agent.process(task3)
    
    # Save the result
    with open(output_dir / "query_engine_transaction_result.json", "w", encoding="utf-8") as f:
        json.dump(result3, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 3 result saved to {output_dir / 'query_engine_transaction_result.json'}")
    
    # Test 4: Complex question across all documents
    logger.info("Test 4: Complex question across all documents")
    question4 = "How did the portfolio change between January and February 2023, and how does it relate to the financial statements?"
    
    task4 = {
        "question": question4,
        "documents": all_docs,
        "format": "text"
    }
    
    result4 = agent.process(task4)
    
    # Save the result
    with open(output_dir / "query_engine_complex_result.json", "w", encoding="utf-8") as f:
        json.dump(result4, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 4 result saved to {output_dir / 'query_engine_complex_result.json'}")
    
    # Test 5: JSON output format
    logger.info("Test 5: JSON output format")
    question5 = "What is the total value of Apple Inc. shares in the portfolio?"
    
    task5 = {
        "question": question5,
        "documents": portfolio_docs,
        "format": "json"
    }
    
    result5 = agent.process(task5)
    
    # Save the result
    with open(output_dir / "query_engine_json_result.json", "w", encoding="utf-8") as f:
        json.dump(result5, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 5 result saved to {output_dir / 'query_engine_json_result.json'}")
    
    # Print summary
    logger.info("QueryEngineAgent tests completed")
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
    parser = argparse.ArgumentParser(description="Test the QueryEngineAgent")
    parser.add_argument("--api_key", help="OpenRouter API key")
    args = parser.parse_args()
    
    # Get API key from environment variable if not provided
    api_key = args.api_key or os.environ.get("OPENROUTER_API_KEY")
    
    if not api_key:
        logger.error("No API key provided. Please provide an API key with --api_key or set the OPENROUTER_API_KEY environment variable.")
        sys.exit(1)
    
    test_query_engine_agent(api_key=api_key)
