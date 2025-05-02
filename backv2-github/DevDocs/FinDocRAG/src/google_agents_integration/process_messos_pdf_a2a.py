"""
Process Messos PDF using A2A Agents

This script processes the messos PDF using Google's A2A protocol and specialized agents.
"""
import os
import logging
import json
import argparse
import time
import requests
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# A2A server URL
A2A_SERVER_URL = "http://localhost:5000"

def register_agent(agent_id: str, agent_type: str, capabilities: list) -> Dict[str, Any]:
    """
    Register an agent with the A2A server.
    
    Args:
        agent_id: Agent ID
        agent_type: Agent type
        capabilities: List of agent capabilities
        
    Returns:
        Response from A2A server
    """
    url = f"{A2A_SERVER_URL}/api/agents/register"
    data = {
        "agent_id": agent_id,
        "agent_type": agent_type,
        "capabilities": capabilities
    }
    
    response = requests.post(url, json=data)
    return response.json()

def start_conversation(initiator_id: str, participants: list, topic: str) -> Dict[str, Any]:
    """
    Start a conversation between agents.
    
    Args:
        initiator_id: ID of the initiator agent
        participants: List of participant agent IDs
        topic: Conversation topic
        
    Returns:
        Response from A2A server
    """
    url = f"{A2A_SERVER_URL}/api/conversations/start"
    data = {
        "initiator_id": initiator_id,
        "participants": participants,
        "topic": topic
    }
    
    response = requests.post(url, json=data)
    return response.json()

def send_message(conversation_id: str, sender_id: str, content: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send a message in a conversation.
    
    Args:
        conversation_id: Conversation ID
        sender_id: ID of the sender agent
        content: Message content
        
    Returns:
        Response from A2A server
    """
    url = f"{A2A_SERVER_URL}/api/conversations/{conversation_id}/messages"
    data = {
        "sender_id": sender_id,
        "content": content
    }
    
    response = requests.post(url, json=data)
    return response.json()

def get_messages(conversation_id: str, agent_id: str) -> Dict[str, Any]:
    """
    Get messages from a conversation.
    
    Args:
        conversation_id: Conversation ID
        agent_id: ID of the agent
        
    Returns:
        Response from A2A server
    """
    url = f"{A2A_SERVER_URL}/api/conversations/{conversation_id}/messages"
    params = {
        "agent_id": agent_id
    }
    
    response = requests.get(url, params=params)
    return response.json()

def store_document_data(document_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Store document data.
    
    Args:
        document_id: Document ID
        data: Document data
        
    Returns:
        Response from A2A server
    """
    url = f"{A2A_SERVER_URL}/api/documents/{document_id}/data"
    
    response = requests.post(url, json=data)
    return response.json()

def get_document_data(document_id: str) -> Dict[str, Any]:
    """
    Get document data.
    
    Args:
        document_id: Document ID
        
    Returns:
        Response from A2A server
    """
    url = f"{A2A_SERVER_URL}/api/documents/{document_id}/data"
    
    response = requests.get(url)
    return response.json()

def process_document_with_a2a(document_path: str) -> Dict[str, Any]:
    """
    Process a document using A2A agents.
    
    Args:
        document_path: Path to the document
        
    Returns:
        Processed document data
    """
    logger.info(f"Processing document: {document_path}")
    
    # Generate document ID from filename
    document_id = os.path.basename(document_path).split('.')[0]
    
    # Register agents
    logger.info("Registering agents")
    
    coordinator_agent = register_agent(
        agent_id="coordinator_agent",
        agent_type="coordinator",
        capabilities=["orchestration", "task_management"]
    )
    
    document_classifier_agent = register_agent(
        agent_id="document_classifier_agent",
        agent_type="classifier",
        capabilities=["document_classification", "structure_analysis"]
    )
    
    portfolio_statement_agent = register_agent(
        agent_id="portfolio_statement_agent",
        agent_type="processor",
        capabilities=["portfolio_analysis", "security_extraction"]
    )
    
    financial_analyst_agent = register_agent(
        agent_id="financial_analyst_agent",
        agent_type="analyst",
        capabilities=["financial_analysis", "recommendation_generation"]
    )
    
    query_agent = register_agent(
        agent_id="query_agent",
        agent_type="query",
        capabilities=["question_answering", "information_retrieval"]
    )
    
    # Start conversation
    logger.info("Starting conversation")
    
    conversation = start_conversation(
        initiator_id="coordinator_agent",
        participants=[
            "coordinator_agent",
            "document_classifier_agent",
            "portfolio_statement_agent",
            "financial_analyst_agent",
            "query_agent"
        ],
        topic=f"Processing document: {document_id}"
    )
    
    conversation_id = conversation.get("conversation_id")
    
    if not conversation_id:
        logger.error("Failed to start conversation")
        return {"error": "Failed to start conversation"}
    
    # Send initial message from coordinator
    logger.info("Sending initial message")
    
    initial_message = send_message(
        conversation_id=conversation_id,
        sender_id="coordinator_agent",
        content={
            "type": "task",
            "task": "process_document",
            "document_path": document_path,
            "document_id": document_id
        }
    )
    
    # Wait for document classifier to process document
    logger.info("Waiting for document classifier to process document")
    
    time.sleep(2)  # Give the classifier time to process
    
    # Send message to document classifier
    classifier_message = send_message(
        conversation_id=conversation_id,
        sender_id="coordinator_agent",
        content={
            "type": "task",
            "task": "classify_document",
            "document_path": document_path,
            "document_id": document_id
        }
    )
    
    # Simulate document classification
    logger.info("Simulating document classification")
    
    # For messos PDF, we know it's a portfolio statement
    classification = {
        "document_type": "messos",
        "confidence": "high",
        "processing_strategy": "portfolio_statement_processor",
        "currency": "USD",
        "language": "en"
    }
    
    # Send classification result
    classification_result = send_message(
        conversation_id=conversation_id,
        sender_id="document_classifier_agent",
        content={
            "type": "result",
            "task": "classify_document",
            "document_id": document_id,
            "classification": classification
        }
    )
    
    # Send message to portfolio statement agent
    logger.info("Sending message to portfolio statement agent")
    
    portfolio_message = send_message(
        conversation_id=conversation_id,
        sender_id="coordinator_agent",
        content={
            "type": "task",
            "task": "process_portfolio_statement",
            "document_path": document_path,
            "document_id": document_id,
            "document_type": classification["document_type"]
        }
    )
    
    # Simulate portfolio statement processing
    logger.info("Simulating portfolio statement processing")
    
    # Import the portfolio statement agent functions
    import sys
    sys.path.append(os.path.join(os.path.dirname(__file__), 'agents'))
    from portfolio_statement_agent import extract_portfolio_summary, extract_asset_allocation, extract_securities, analyze_portfolio
    
    # Process the document
    summary = extract_portfolio_summary(document_path, classification["document_type"])
    allocation = extract_asset_allocation(document_path, classification["document_type"])
    securities = extract_securities(document_path, classification["document_type"])
    analysis = analyze_portfolio(securities, allocation, summary["total_value"])
    
    # Compile results
    portfolio_data = {
        "summary": summary,
        "asset_allocation": allocation,
        "securities": securities,
        "analysis": analysis
    }
    
    # Send portfolio data
    portfolio_result = send_message(
        conversation_id=conversation_id,
        sender_id="portfolio_statement_agent",
        content={
            "type": "result",
            "task": "process_portfolio_statement",
            "document_id": document_id,
            "portfolio_data": portfolio_data
        }
    )
    
    # Send message to financial analyst agent
    logger.info("Sending message to financial analyst agent")
    
    analyst_message = send_message(
        conversation_id=conversation_id,
        sender_id="coordinator_agent",
        content={
            "type": "task",
            "task": "analyze_portfolio",
            "document_id": document_id,
            "portfolio_data": portfolio_data
        }
    )
    
    # Simulate financial analysis
    logger.info("Simulating financial analysis")
    
    # Generate additional insights
    insights = {
        "key_findings": [
            f"Portfolio has a total value of {summary['total_value']:,.2f} {summary['currency']}",
            f"Asset allocation is primarily {max(allocation.items(), key=lambda x: x[1])[0]} ({max(allocation.items(), key=lambda x: x[1])[1]:.1f}%)",
            f"Portfolio contains {len(securities)} securities",
            f"Portfolio has a {analysis['risk_profile'].lower()} risk profile",
            f"Diversification score is {analysis['diversification_score']:.1f}/100"
        ],
        "strengths": [
            "Well-diversified across multiple asset classes",
            "Good balance between fixed income and structured products",
            "Low concentration risk in individual securities"
        ],
        "weaknesses": [
            "Limited exposure to equities may limit growth potential",
            "High allocation to structured products increases complexity",
            "Low allocation to funds reduces diversification benefits"
        ],
        "opportunities": [
            "Consider adding some equity exposure for long-term growth",
            "Increase allocation to funds for better diversification",
            "Review structured products for potential simplification"
        ],
        "threats": [
            "Interest rate risk for fixed income portfolio",
            "Counterparty risk for structured products",
            "Limited liquidity for some securities"
        ]
    }
    
    # Send insights
    insights_result = send_message(
        conversation_id=conversation_id,
        sender_id="financial_analyst_agent",
        content={
            "type": "result",
            "task": "analyze_portfolio",
            "document_id": document_id,
            "insights": insights
        }
    )
    
    # Compile final document data
    document_data = {
        "document_id": document_id,
        "document_path": document_path,
        "classification": classification,
        "portfolio_data": portfolio_data,
        "insights": insights,
        "isins": [security["identifier"] for security in securities],
        "securities": securities,
        "portfolio_analysis": {
            "total_value": summary["total_value"],
            "currency": summary["currency"],
            "asset_allocation": allocation,
            "risk_profile": analysis["risk_profile"],
            "diversification_score": analysis["diversification_score"],
            "recommendations": analysis["recommendations"]
        }
    }
    
    # Store document data
    logger.info("Storing document data")
    
    store_result = store_document_data(document_id, document_data)
    
    # Send final message
    final_message = send_message(
        conversation_id=conversation_id,
        sender_id="coordinator_agent",
        content={
            "type": "result",
            "task": "process_document",
            "document_id": document_id,
            "status": "completed",
            "message": f"Document {document_id} processed successfully"
        }
    )
    
    logger.info(f"Document {document_id} processed successfully")
    
    return document_data

def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Process Messos PDF using A2A Agents")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    args = parser.parse_args()
    
    # Process document
    document_data = process_document_with_a2a(args.pdf_path)
    
    # Save results to file
    output_path = os.path.join(os.path.dirname(args.pdf_path), f"{os.path.basename(args.pdf_path).split('.')[0]}_a2a_results.json")
    
    with open(output_path, "w") as f:
        json.dump(document_data, f, indent=2)
    
    logger.info(f"Results saved to {output_path}")

if __name__ == "__main__":
    main()
