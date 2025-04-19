"""
Test script for the DocumentIntegrationAgent.
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
from DevDocs.backend.agents.document_integration_agent_fixed import DocumentIntegrationAgent

def create_test_portfolio_documents():
    """
    Create test portfolio documents.
    
    Returns:
        List of portfolio documents
    """
    # Portfolio 1
    portfolio1 = {
        "type": "portfolio",
        "metadata": {
            "date": "2023-01-01",
            "client": "Test Client",
            "account": "12345"
        },
        "portfolio": {
            "securities": [
                {
                    "isin": "US0378331005",
                    "name": "Apple Inc.",
                    "quantity": 100,
                    "price": 150.00,
                    "value": 15000.00,
                    "weight": 30.0
                },
                {
                    "isin": "US5949181045",
                    "name": "Microsoft Corp.",
                    "quantity": 50,
                    "price": 250.00,
                    "value": 12500.00,
                    "weight": 25.0
                },
                {
                    "isin": "US0231351067",
                    "name": "Amazon.com Inc.",
                    "quantity": 25,
                    "price": 300.00,
                    "value": 7500.00,
                    "weight": 15.0
                }
            ],
            "summary": {
                "total_value": 35000.00,
                "total_securities": 3
            }
        }
    }
    
    # Portfolio 2
    portfolio2 = {
        "type": "portfolio",
        "metadata": {
            "date": "2023-02-01",
            "client": "Test Client",
            "account": "12345"
        },
        "portfolio": {
            "securities": [
                {
                    "isin": "US0378331005",
                    "name": "Apple Inc.",
                    "quantity": 120,
                    "price": 160.00,
                    "value": 19200.00,
                    "weight": 32.0
                },
                {
                    "isin": "US5949181045",
                    "name": "Microsoft Corp.",
                    "quantity": 60,
                    "price": 260.00,
                    "value": 15600.00,
                    "weight": 26.0
                },
                {
                    "isin": "US0231351067",
                    "name": "Amazon.com Inc.",
                    "quantity": 30,
                    "price": 320.00,
                    "value": 9600.00,
                    "weight": 16.0
                },
                {
                    "isin": "US88160R1014",
                    "name": "Tesla Inc.",
                    "quantity": 40,
                    "price": 200.00,
                    "value": 8000.00,
                    "weight": 13.0
                }
            ],
            "summary": {
                "total_value": 52400.00,
                "total_securities": 4
            }
        }
    }
    
    return [portfolio1, portfolio2]

def create_test_financial_statements():
    """
    Create test financial statement documents.
    
    Returns:
        List of financial statement documents
    """
    # Financial Statement 1
    statement1 = {
        "type": "financial_statement",
        "metadata": {
            "date": "2023-01-01",
            "company": "Test Company",
            "period": "Q1 2023"
        },
        "statements": {
            "income_statement": {
                "revenue": 100000.00,
                "expenses": 80000.00,
                "net_income": 20000.00
            },
            "balance_sheet": {
                "assets": {
                    "current_assets": 50000.00,
                    "non_current_assets": 150000.00,
                    "total_assets": 200000.00
                },
                "liabilities": {
                    "current_liabilities": 30000.00,
                    "non_current_liabilities": 70000.00,
                    "total_liabilities": 100000.00
                },
                "equity": 100000.00
            }
        }
    }
    
    # Financial Statement 2
    statement2 = {
        "type": "financial_statement",
        "metadata": {
            "date": "2023-04-01",
            "company": "Test Company",
            "period": "Q2 2023"
        },
        "statements": {
            "income_statement": {
                "revenue": 120000.00,
                "expenses": 90000.00,
                "net_income": 30000.00
            },
            "balance_sheet": {
                "assets": {
                    "current_assets": 60000.00,
                    "non_current_assets": 160000.00,
                    "total_assets": 220000.00
                },
                "liabilities": {
                    "current_liabilities": 35000.00,
                    "non_current_liabilities": 65000.00,
                    "total_liabilities": 100000.00
                },
                "equity": 120000.00
            }
        }
    }
    
    return [statement1, statement2]

def create_test_transactions():
    """
    Create test transaction documents.
    
    Returns:
        List of transaction documents
    """
    # Transactions 1
    transactions1 = {
        "type": "transaction",
        "metadata": {
            "date": "2023-01-01",
            "account": "12345"
        },
        "transactions": [
            {
                "date": "2023-01-01",
                "type": "buy",
                "security": "Apple Inc.",
                "isin": "US0378331005",
                "quantity": 100,
                "price": 150.00,
                "value": 15000.00
            },
            {
                "date": "2023-01-02",
                "type": "buy",
                "security": "Microsoft Corp.",
                "isin": "US5949181045",
                "quantity": 50,
                "price": 250.00,
                "value": 12500.00
            }
        ]
    }
    
    # Transactions 2
    transactions2 = {
        "type": "transaction",
        "metadata": {
            "date": "2023-02-01",
            "account": "12345"
        },
        "transactions": [
            {
                "date": "2023-02-01",
                "type": "buy",
                "security": "Amazon.com Inc.",
                "isin": "US0231351067",
                "quantity": 25,
                "price": 300.00,
                "value": 7500.00
            },
            {
                "date": "2023-02-02",
                "type": "sell",
                "security": "Microsoft Corp.",
                "isin": "US5949181045",
                "quantity": 10,
                "price": 260.00,
                "value": 2600.00
            }
        ]
    }
    
    return [transactions1, transactions2]

def test_document_integration_agent(api_key=None):
    """
    Test the DocumentIntegrationAgent with various inputs.
    
    Args:
        api_key: OpenRouter API key (optional)
    """
    logger.info("Testing DocumentIntegrationAgent")
    
    # Create output directory
    output_dir = Path("agent_test_results")
    output_dir.mkdir(exist_ok=True)
    
    # Initialize the agent
    agent = DocumentIntegrationAgent(api_key=api_key)
    
    # Test 1: Integrate portfolio documents
    logger.info("Test 1: Integrating portfolio documents")
    portfolio_docs = create_test_portfolio_documents()
    
    portfolio_task = {
        "documents": portfolio_docs,
        "integration_type": "comprehensive",
        "output_format": "json"
    }
    
    portfolio_result = agent.process(portfolio_task)
    
    # Save the result
    with open(output_dir / "document_integration_portfolio_result.json", "w", encoding="utf-8") as f:
        json.dump(portfolio_result, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 1 result saved to {output_dir / 'document_integration_portfolio_result.json'}")
    
    # Test 2: Integrate financial statement documents
    logger.info("Test 2: Integrating financial statement documents")
    statement_docs = create_test_financial_statements()
    
    statement_task = {
        "documents": statement_docs,
        "integration_type": "comprehensive",
        "output_format": "json"
    }
    
    statement_result = agent.process(statement_task)
    
    # Save the result
    with open(output_dir / "document_integration_statement_result.json", "w", encoding="utf-8") as f:
        json.dump(statement_result, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 2 result saved to {output_dir / 'document_integration_statement_result.json'}")
    
    # Test 3: Integrate transaction documents
    logger.info("Test 3: Integrating transaction documents")
    transaction_docs = create_test_transactions()
    
    transaction_task = {
        "documents": transaction_docs,
        "integration_type": "comprehensive",
        "output_format": "json"
    }
    
    transaction_result = agent.process(transaction_task)
    
    # Save the result
    with open(output_dir / "document_integration_transaction_result.json", "w", encoding="utf-8") as f:
        json.dump(transaction_result, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 3 result saved to {output_dir / 'document_integration_transaction_result.json'}")
    
    # Test 4: Integrate mixed documents
    logger.info("Test 4: Integrating mixed documents")
    mixed_docs = portfolio_docs + statement_docs + transaction_docs
    
    mixed_task = {
        "documents": mixed_docs,
        "integration_type": "comprehensive",
        "output_format": "json"
    }
    
    mixed_result = agent.process(mixed_task)
    
    # Save the result
    with open(output_dir / "document_integration_mixed_result.json", "w", encoding="utf-8") as f:
        json.dump(mixed_result, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 4 result saved to {output_dir / 'document_integration_mixed_result.json'}")
    
    # Test 5: Text output format
    logger.info("Test 5: Text output format")
    text_task = {
        "documents": portfolio_docs,
        "integration_type": "comprehensive",
        "output_format": "text"
    }
    
    text_result = agent.process(text_task)
    
    # Save the result
    with open(output_dir / "document_integration_text_result.json", "w", encoding="utf-8") as f:
        json.dump(text_result, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Test 5 result saved to {output_dir / 'document_integration_text_result.json'}")
    
    # Print summary
    logger.info("DocumentIntegrationAgent tests completed")
    logger.info(f"Results saved to {output_dir}")
    
    return {
        'status': 'success',
        'test1_result': portfolio_result['status'] == 'success',
        'test2_result': statement_result['status'] == 'success',
        'test3_result': transaction_result['status'] == 'success',
        'test4_result': mixed_result['status'] == 'success',
        'test5_result': text_result['status'] == 'success',
        'output_dir': str(output_dir)
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the DocumentIntegrationAgent")
    parser.add_argument("--api_key", help="OpenRouter API key (optional)")
    args = parser.parse_args()
    
    # Get API key from environment variable if not provided
    api_key = args.api_key or os.environ.get("OPENROUTER_API_KEY")
    
    test_document_integration_agent(api_key=api_key)
