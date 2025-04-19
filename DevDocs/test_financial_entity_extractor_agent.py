"""
Test script for the FinancialEntityExtractorAgent.
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
from DevDocs.backend.agents.financial_entity_extractor_agent_fixed import FinancialEntityExtractorAgent

# Import test document creation functions
from DevDocs.test_document_integration_agent import (
    create_test_portfolio_documents,
    create_test_financial_statements,
    create_test_transactions
)

def create_test_text():
    """
    Create test text with financial entities.
    
    Returns:
        Test text
    """
    return """
Financial Report - Q2 2023

Apple Inc. (AAPL) reported strong earnings for the second quarter of 2023. 
The company's revenue reached $97.28 billion, up 8.6% year-over-year. 
Net income was $24.16 billion, resulting in earnings per share of $1.52.

Key holdings in our portfolio include:
- Apple Inc. (ISIN: US0378331005) - 100 shares at $150.00, total value: $15,000.00
- Microsoft Corp. (CUSIP: 594918104) - 50 shares at $250.00, total value: $12,500.00
- Amazon.com Inc. (ISIN: US0231351067) - 25 shares at $300.00, total value: $7,500.00

The portfolio's total value as of 2023-06-30 is $35,000.00, with a year-to-date return of 12.5%.

Recent transactions:
- 2023-04-15: Purchased 20 shares of TSLA at $180.00
- 2023-05-22: Sold 10 shares of MSFT at $260.00

Asset allocation:
- Equities: 65%
- Bonds: 25%
- Cash: 10%

The S&P 500 index rose 14.2% during the same period, while the NASDAQ gained 30.1%.
"""

def test_financial_entity_extractor_agent(api_key=None):
    """
    Test the FinancialEntityExtractorAgent with various inputs.
    
    Args:
        api_key: OpenRouter API key
    """
    logger.info("Testing FinancialEntityExtractorAgent")
    
    # Create output directory
    output_dir = Path("agent_test_results")
    output_dir.mkdir(exist_ok=True)
    
    # Initialize the agent
    agent = FinancialEntityExtractorAgent(api_key=api_key)
    
    # Test 1: Extract entities from text with regex
    logger.info("Test 1: Extract entities from text with regex")
    test_text = create_test_text()
    
    task1 = {
        "text": test_text,
        "use_ai": False
    }
    
    result1 = agent.process(task1)
    
    # Save the result
    with open(output_dir / "financial_entity_extractor_regex_result.json", "w", encoding="utf-8") as f:
        json.dump(result1, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 1 result saved to {output_dir / 'financial_entity_extractor_regex_result.json'}")
    
    # Test 2: Extract entities from text with AI
    if api_key:
        logger.info("Test 2: Extract entities from text with AI")
        
        task2 = {
            "text": test_text,
            "use_ai": True
        }
        
        result2 = agent.process(task2)
        
        # Save the result
        with open(output_dir / "financial_entity_extractor_ai_result.json", "w", encoding="utf-8") as f:
            json.dump(result2, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Test 2 result saved to {output_dir / 'financial_entity_extractor_ai_result.json'}")
    else:
        logger.warning("Skipping AI extraction test due to missing API key")
        result2 = {"status": "skipped"}
    
    # Test 3: Extract specific entity types
    logger.info("Test 3: Extract specific entity types")
    
    task3 = {
        "text": test_text,
        "entity_types": ["isins", "dates", "percentages"],
        "use_ai": False
    }
    
    result3 = agent.process(task3)
    
    # Save the result
    with open(output_dir / "financial_entity_extractor_specific_result.json", "w", encoding="utf-8") as f:
        json.dump(result3, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 3 result saved to {output_dir / 'financial_entity_extractor_specific_result.json'}")
    
    # Test 4: Extract entities from portfolio document
    logger.info("Test 4: Extract entities from portfolio document")
    portfolio_docs = create_test_portfolio_documents()
    
    task4 = {
        "document": portfolio_docs[0],
        "use_ai": False
    }
    
    result4 = agent.process(task4)
    
    # Save the result
    with open(output_dir / "financial_entity_extractor_portfolio_result.json", "w", encoding="utf-8") as f:
        json.dump(result4, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 4 result saved to {output_dir / 'financial_entity_extractor_portfolio_result.json'}")
    
    # Test 5: Classify entities
    logger.info("Test 5: Classify entities")
    
    entities = result1['entities']
    classified_entities = agent.classify_entities(entities)
    
    # Save the result
    with open(output_dir / "financial_entity_extractor_classified_result.json", "w", encoding="utf-8") as f:
        json.dump(classified_entities, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 5 result saved to {output_dir / 'financial_entity_extractor_classified_result.json'}")
    
    # Print summary
    logger.info("FinancialEntityExtractorAgent tests completed")
    logger.info(f"Results saved to {output_dir}")
    
    return {
        'status': 'success',
        'test1_result': result1['status'] == 'success',
        'test2_result': result2['status'] == 'success' or result2['status'] == 'skipped',
        'test3_result': result3['status'] == 'success',
        'test4_result': result4['status'] == 'success',
        'test5_result': len(classified_entities) > 0,
        'output_dir': str(output_dir)
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the FinancialEntityExtractorAgent")
    parser.add_argument("--api_key", help="OpenRouter API key")
    args = parser.parse_args()
    
    # Get API key from environment variable if not provided
    api_key = args.api_key or os.environ.get("OPENROUTER_API_KEY")
    
    test_financial_entity_extractor_agent(api_key=api_key)
