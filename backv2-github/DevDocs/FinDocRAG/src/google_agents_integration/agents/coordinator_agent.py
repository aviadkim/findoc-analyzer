"""
Coordinator Agent using Google's Agent Development Kit (ADK).

This agent is responsible for orchestrating the specialized agents.
"""
import os
import logging
import json
from typing import Dict, List, Any, Optional

from google.adk.agents import Agent

# Import specialized agents
from document_processor_agent import document_processor_agent
from financial_analyst_agent import financial_analyst_agent
from query_agent import query_agent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the coordinator agent
coordinator_agent = Agent(
    name="coordinator",
    model="gemini-2.0-flash",
    instruction="""
    You are a financial document assistant coordinator. Your job is to orchestrate specialized agents to process and analyze financial documents and answer user queries.
    
    You have access to the following specialized agents:
    1. Document Processor: Extracts text, tables, and financial data from documents
    2. Financial Analyst: Analyzes financial data and provides insights
    3. Query Agent: Answers questions about financial documents
    
    For each user request:
    1. Determine which specialized agent(s) to use
    2. Route the request to the appropriate agent(s)
    3. Aggregate and present the results to the user
    
    Be helpful, clear, and concise in your responses. Always provide accurate information based on the document content.
    """,
    description="Coordinates document processing, financial analysis, and query tasks.",
    sub_agents=[
        document_processor_agent,
        financial_analyst_agent,
        query_agent
    ]
)

def process_document(document_path: str) -> Dict[str, Any]:
    """
    Process a document using the coordinator agent.
    
    Args:
        document_path: Path to the document
        
    Returns:
        Processed document data
    """
    logger.info(f"Processing document: {document_path}")
    
    # Step 1: Process the document with the document processor agent
    document_data = document_processor_agent.tools[0].function(document_path)
    
    # Step 2: Extract financial data
    financial_data = document_processor_agent.tools[2].function(document_data)
    
    # Add financial data to document data
    document_data["financial_data"] = financial_data
    
    # Step 3: Analyze the portfolio
    portfolio_analysis = financial_analyst_agent.tools[0].function(financial_data)
    
    # Add portfolio analysis to document data
    document_data["portfolio_analysis"] = portfolio_analysis
    
    # Step 4: Evaluate securities
    security_evaluations = []
    for security in financial_data.get("securities", []):
        evaluation = financial_analyst_agent.tools[1].function(security)
        security_evaluations.append(evaluation)
    
    # Add security evaluations to document data
    document_data["security_evaluations"] = security_evaluations
    
    return document_data

def answer_query(query: str, document_data: Dict[str, Any]) -> str:
    """
    Answer a query using the coordinator agent.
    
    Args:
        query: User query
        document_data: Processed document data
        
    Returns:
        Answer to the query
    """
    logger.info(f"Answering query: {query}")
    
    # Use the query agent to answer the question
    answer = query_agent.tools[1].function(query, document_data)
    
    return answer

def handle_request(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle a user request using the coordinator agent.
    
    Args:
        request: User request
        
    Returns:
        Response to the request
    """
    logger.info(f"Handling request: {request}")
    
    request_type = request.get("type", "")
    
    if request_type == "process_document":
        # Process a document
        document_path = request.get("document_path", "")
        if not document_path:
            return {"error": "No document path provided"}
        
        document_data = process_document(document_path)
        
        return {
            "status": "success",
            "document_data": document_data
        }
    
    elif request_type == "query":
        # Answer a query
        query = request.get("query", "")
        document_data = request.get("document_data", {})
        
        if not query:
            return {"error": "No query provided"}
        
        if not document_data:
            return {"error": "No document data provided"}
        
        answer = answer_query(query, document_data)
        
        return {
            "status": "success",
            "query": query,
            "answer": answer
        }
    
    else:
        return {"error": f"Unknown request type: {request_type}"}

if __name__ == "__main__":
    # Example usage
    import sys
    import json
    
    if len(sys.argv) < 2:
        print("Usage: python coordinator_agent.py <request_json>")
        sys.exit(1)
    
    request_path = sys.argv[1]
    
    # Load request
    with open(request_path, "r") as f:
        request = json.load(f)
    
    # Handle request
    response = handle_request(request)
    
    # Print results
    print("\n=== Response ===")
    print(json.dumps(response, indent=2))
