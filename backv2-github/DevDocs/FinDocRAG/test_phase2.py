"""
Test script for Phase 2 improvements.

This script tests the agent framework and multi-agent collaboration.
"""

import os
import sys
import json
import logging
import argparse
from typing import List, Dict, Any
import pandas as pd

# Import our modules
from agent_framework import Agent, DocumentClassifierAgent, PortfolioStatementAgent, A2AServer
from securities_extraction_agent import SecuritiesExtractionAgent, TableUnderstandingAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_document_classifier(document_path: str, output_dir: str):
    """
    Test the document classifier agent.

    Args:
        document_path: Path to the document
        output_dir: Directory to save the output
    """
    logger.info("Testing document classifier agent...")
    
    # Create agent
    agent = DocumentClassifierAgent(debug=True)
    
    # Process document
    result = agent.process(document_path)
    
    # Save result
    output_path = os.path.join(output_dir, f"{os.path.basename(document_path).split('.')[0]}_document_classification.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Document type: {result['document_type']} (confidence: {result['confidence']})")
    logger.info(f"Document classification result saved to {output_path}")
    
    return result

def test_portfolio_statement_agent(document_path: str, output_dir: str):
    """
    Test the portfolio statement agent.

    Args:
        document_path: Path to the document
        output_dir: Directory to save the output
    """
    logger.info("Testing portfolio statement agent...")
    
    # Create agent
    agent = PortfolioStatementAgent(debug=True)
    
    # Process document
    result = agent.process(document_path)
    
    # Save result
    output_path = os.path.join(output_dir, f"{os.path.basename(document_path).split('.')[0]}_portfolio_statement.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Extracted {result['securities_count']} securities")
    logger.info(f"Portfolio statement result saved to {output_path}")
    
    return result

def test_securities_extraction_agent(document_path: str, output_dir: str):
    """
    Test the securities extraction agent.

    Args:
        document_path: Path to the document
        output_dir: Directory to save the output
    """
    logger.info("Testing securities extraction agent...")
    
    # Create agent
    agent = SecuritiesExtractionAgent(debug=True)
    
    # Process document
    result = agent.process(document_path)
    
    # Save result
    output_path = os.path.join(output_dir, f"{os.path.basename(document_path).split('.')[0]}_securities_extraction.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Extracted {result['securities_count']} securities")
    logger.info(f"Securities extraction result saved to {output_path}")
    
    return result

def test_table_understanding_agent(document_path: str, output_dir: str):
    """
    Test the table understanding agent.

    Args:
        document_path: Path to the document
        output_dir: Directory to save the output
    """
    logger.info("Testing table understanding agent...")
    
    # Create agent
    agent = TableUnderstandingAgent(debug=True)
    
    # Process document
    result = agent.process(document_path)
    
    # Save result
    output_path = os.path.join(output_dir, f"{os.path.basename(document_path).split('.')[0]}_table_understanding.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Analyzed {result['structures_count']} table structures")
    logger.info(f"Table understanding result saved to {output_path}")
    
    return result

def test_a2a_server(document_path: str, output_dir: str):
    """
    Test the A2A server with multiple agents.

    Args:
        document_path: Path to the document
        output_dir: Directory to save the output
    """
    logger.info("Testing A2A server with multiple agents...")
    
    # Create A2A server
    server = A2AServer(debug=True)
    
    # Create agents
    document_classifier = DocumentClassifierAgent(debug=True)
    portfolio_agent = PortfolioStatementAgent(debug=True)
    securities_agent = SecuritiesExtractionAgent(debug=True)
    table_agent = TableUnderstandingAgent(debug=True)
    
    # Register agents
    server.register_agent(document_classifier)
    server.register_agent(portfolio_agent)
    server.register_agent(securities_agent)
    server.register_agent(table_agent)
    
    # Create task for document classification
    classification_task_id = server.create_task(
        document_classifier.agent_id,
        "process_document",
        {"document_path": document_path}
    )
    
    # Execute classification task
    classification_result = server.execute_task(classification_task_id)
    logger.info(f"Document Classification: {classification_result['document_type']} (confidence: {classification_result['confidence']})")
    
    # Create task for document processing based on classification
    if classification_result["document_type"] == "portfolio_statement":
        # Create task for portfolio statement processing
        portfolio_task_id = server.create_task(
            portfolio_agent.agent_id,
            "process_document",
            {"document_path": document_path}
        )
        
        # Execute portfolio statement task
        portfolio_result = server.execute_task(portfolio_task_id)
        logger.info(f"Portfolio Statement: Extracted {portfolio_result['securities_count']} securities")
        
        # Create task for securities extraction
        securities_task_id = server.create_task(
            securities_agent.agent_id,
            "process_document",
            {"document_path": document_path}
        )
        
        # Execute securities extraction task
        securities_result = server.execute_task(securities_task_id)
        logger.info(f"Securities Extraction: Extracted {securities_result['securities_count']} securities")
        
        # Create task for table understanding
        table_task_id = server.create_task(
            table_agent.agent_id,
            "process_document",
            {"document_path": document_path}
        )
        
        # Execute table understanding task
        table_result = server.execute_task(table_task_id)
        logger.info(f"Table Understanding: Analyzed {table_result['structures_count']} table structures")
        
        # Combine results
        combined_result = {
            "document_type": classification_result["document_type"],
            "confidence": classification_result["confidence"],
            "portfolio_summary": portfolio_result.get("portfolio_summary", {}),
            "securities": securities_result.get("securities", []),
            "table_structures": table_result.get("table_structures", [])
        }
        
        # Save combined result
        output_path = os.path.join(output_dir, f"{os.path.basename(document_path).split('.')[0]}_a2a_combined.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(combined_result, f, indent=2, ensure_ascii=False)
        
        logger.info(f"A2A combined result saved to {output_path}")
        
        return combined_result
    else:
        logger.info(f"Document type not supported for processing: {classification_result['document_type']}")
        return classification_result

def main():
    """
    Main function.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test Phase 2 improvements.')
    parser.add_argument('document_path', help='Path to the document to process')
    parser.add_argument('--output-dir', default='src/reports', help='Directory to save the output')
    parser.add_argument('--test', choices=['all', 'classifier', 'portfolio', 'securities', 'table', 'a2a'], default='all', help='Test to run')
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Run tests
    if args.test in ['all', 'classifier']:
        classification_result = test_document_classifier(args.document_path, args.output_dir)
    
    if args.test in ['all', 'portfolio']:
        portfolio_result = test_portfolio_statement_agent(args.document_path, args.output_dir)
    
    if args.test in ['all', 'securities']:
        securities_result = test_securities_extraction_agent(args.document_path, args.output_dir)
    
    if args.test in ['all', 'table']:
        table_result = test_table_understanding_agent(args.document_path, args.output_dir)
    
    if args.test in ['all', 'a2a']:
        a2a_result = test_a2a_server(args.document_path, args.output_dir)
    
    # Print summary
    print("\nPhase 2 Testing Summary:")
    if args.test in ['all', 'classifier']:
        print(f"Document Classification: {classification_result['document_type']} (confidence: {classification_result['confidence']})")
    
    if args.test in ['all', 'portfolio']:
        print(f"Portfolio Statement: Extracted {portfolio_result['securities_count']} securities")
    
    if args.test in ['all', 'securities']:
        print(f"Securities Extraction: Extracted {securities_result['securities_count']} securities")
    
    if args.test in ['all', 'table']:
        print(f"Table Understanding: Analyzed {table_result['structures_count']} table structures")
    
    if args.test in ['all', 'a2a']:
        if isinstance(a2a_result, dict) and 'securities' in a2a_result:
            print(f"A2A Combined: Extracted {len(a2a_result['securities'])} securities")
            
            # Print securities details
            print("\nExtracted Securities:")
            for i, security in enumerate(a2a_result['securities'][:5]):  # Show first 5 securities
                print(f"\nSecurity {i+1}:")
                print(f"  ISIN: {security.get('isin', 'Unknown')}")
                print(f"  Description: {security.get('description', 'Unknown')}")
                print(f"  Nominal Value: {security.get('nominal_value', 'Unknown')}")
                print(f"  Price: {security.get('price', 'Unknown')}")
                print(f"  Acquisition Price: {security.get('acquisition_price', 'Unknown')}")
                print(f"  Actual Value: {security.get('actual_value', 'Unknown')}")
                print(f"  Currency: {security.get('currency', 'Unknown')}")
                print(f"  Weight: {security.get('weight', 'Unknown')}%")
            
            if len(a2a_result['securities']) > 5:
                print(f"\n... and {len(a2a_result['securities']) - 5} more securities")

if __name__ == "__main__":
    main()
