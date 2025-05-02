"""
Combined test script for Week 4 agents.
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

def run_tests(api_key=None):
    """
    Run all tests for Week 4 agents.
    
    Args:
        api_key: OpenRouter API key
    """
    logger.info("Running Week 4 tests")
    
    # Create output directory
    output_dir = Path("agent_test_results")
    output_dir.mkdir(exist_ok=True)
    
    # Create a summary file
    summary = {
        'timestamp': time.strftime("%Y-%m-%d %H:%M:%S"),
        'tests': {}
    }
    
    # Test 1: DocumentIntegrationAgent
    logger.info("Test 1: DocumentIntegrationAgent")
    try:
        from DevDocs.test_document_integration_agent import test_document_integration_agent
        document_integration_result = test_document_integration_agent(api_key=api_key)
        summary['tests']['document_integration_agent'] = document_integration_result
        logger.info("DocumentIntegrationAgent test completed successfully")
    except Exception as e:
        logger.error(f"Error running DocumentIntegrationAgent test: {str(e)}")
        summary['tests']['document_integration_agent'] = {
            'status': 'error',
            'error': str(e)
        }
    
    # Test 2: QueryEngineAgent
    logger.info("Test 2: QueryEngineAgent")
    try:
        from DevDocs.test_query_engine_agent import test_query_engine_agent
        query_engine_result = test_query_engine_agent(api_key=api_key)
        summary['tests']['query_engine_agent'] = query_engine_result
        logger.info("QueryEngineAgent test completed successfully")
    except Exception as e:
        logger.error(f"Error running QueryEngineAgent test: {str(e)}")
        summary['tests']['query_engine_agent'] = {
            'status': 'error',
            'error': str(e)
        }
    
    # Save the summary
    with open(output_dir / "week4_test_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Week 4 tests completed. Summary saved to {output_dir / 'week4_test_summary.json'}")
    
    return summary

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Week 4 tests")
    parser.add_argument("--api_key", help="OpenRouter API key")
    args = parser.parse_args()
    
    # Get API key from environment variable if not provided
    api_key = args.api_key or os.environ.get("OPENROUTER_API_KEY")
    
    if not api_key:
        logger.warning("No OpenRouter API key provided. Some tests may fail.")
    
    run_tests(api_key=api_key)
