"""
Query Agent using Google's Agent Development Kit (ADK).

This agent is responsible for handling natural language queries about financial documents.
"""
import os
import logging
import json
from typing import Dict, List, Any, Optional
import re

from google.adk.agents import Agent
from google.adk.tools import Tool

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define tool functions
def search_documents(query: str, document_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Search for information in processed documents.
    
    Args:
        query: Search query
        document_data: Document data containing text, tables, and financial data
        
    Returns:
        Dictionary containing search results
    """
    logger.info(f"Searching documents for: {query}")
    
    # Extract text and financial data
    full_text = document_data.get("full_text", "")
    tables = document_data.get("tables", [])
    financial_data = document_data.get("financial_data", {})
    
    # Normalize query
    query_lower = query.lower()
    
    # Check for specific query types
    results = {
        "query": query,
        "matches": [],
        "tables": [],
        "financial_data": {},
        "answer": ""
    }
    
    # Check for ISIN queries
    if "isin" in query_lower:
        # Extract ISINs from query
        isin_pattern = r'[A-Z]{2}[A-Z0-9]{10}'
        query_isins = re.findall(isin_pattern, query)
        
        if query_isins:
            # Search for specific ISINs
            for isin in query_isins:
                if isin in financial_data.get("isins", []):
                    # Find security with this ISIN
                    for security in financial_data.get("securities", []):
                        if security.get("identifier") == isin:
                            results["financial_data"]["security"] = security
                            break
        else:
            # General ISIN query
            results["financial_data"]["isins"] = financial_data.get("isins", [])
    
    # Check for total value queries
    if "total" in query_lower and ("value" in query_lower or "worth" in query_lower):
        results["financial_data"]["total_value"] = financial_data.get("total_value", 0)
        results["financial_data"]["currency"] = financial_data.get("currency", "USD")
    
    # Check for asset allocation queries
    if "asset" in query_lower and ("allocation" in query_lower or "distribution" in query_lower):
        results["financial_data"]["asset_allocation"] = financial_data.get("asset_allocation", {})
    
    # Check for security queries
    if "securities" in query_lower or "holdings" in query_lower or "positions" in query_lower:
        results["financial_data"]["securities"] = financial_data.get("securities", [])
    
    # Check for table queries
    if "table" in query_lower:
        results["tables"] = tables
    
    # Full text search
    query_terms = query_lower.split()
    for term in query_terms:
        if len(term) > 3:  # Skip short terms
            # Search in full text
            term_matches = []
            start_pos = 0
            while True:
                pos = full_text.lower().find(term, start_pos)
                if pos == -1:
                    break
                
                # Get context (50 characters before and after)
                context_start = max(0, pos - 50)
                context_end = min(len(full_text), pos + len(term) + 50)
                context = full_text[context_start:context_end]
                
                term_matches.append({
                    "term": term,
                    "position": pos,
                    "context": context
                })
                
                start_pos = pos + len(term)
            
            results["matches"].extend(term_matches)
    
    # Generate answer based on results
    answer = generate_answer(query, results)
    results["answer"] = answer
    
    return results

def generate_answer(query: str, results: Dict[str, Any]) -> str:
    """
    Generate an answer based on search results.
    
    Args:
        query: Search query
        results: Search results
        
    Returns:
        Generated answer
    """
    # Check if we have any results
    if not results["matches"] and not results["tables"] and not results["financial_data"]:
        return "I couldn't find any information related to your query in the document."
    
    # Generate answer based on query type
    query_lower = query.lower()
    
    # ISIN queries
    if "isin" in query_lower:
        if "security" in results["financial_data"]:
            security = results["financial_data"]["security"]
            return f"I found information about the security with ISIN {security.get('identifier')}. " \
                   f"It's {security.get('name', 'unnamed')}, with a quantity of {security.get('quantity')} " \
                   f"and a value of {security.get('value')}."
        elif "isins" in results["financial_data"]:
            isins = results["financial_data"]["isins"]
            if isins:
                return f"I found {len(isins)} ISINs in the document: {', '.join(isins[:5])}" + \
                       (f" and {len(isins) - 5} more." if len(isins) > 5 else ".")
            else:
                return "I couldn't find any ISINs in the document."
    
    # Total value queries
    if "total" in query_lower and ("value" in query_lower or "worth" in query_lower):
        if "total_value" in results["financial_data"]:
            total_value = results["financial_data"]["total_value"]
            currency = results["financial_data"]["currency"]
            return f"The total portfolio value is {total_value} {currency}."
    
    # Asset allocation queries
    if "asset" in query_lower and ("allocation" in query_lower or "distribution" in query_lower):
        if "asset_allocation" in results["financial_data"]:
            asset_allocation = results["financial_data"]["asset_allocation"]
            if asset_allocation:
                allocation_text = ", ".join([f"{asset}: {pct}%" for asset, pct in asset_allocation.items()])
                return f"The asset allocation is as follows: {allocation_text}"
            else:
                return "I couldn't find asset allocation information in the document."
    
    # Security queries
    if "securities" in query_lower or "holdings" in query_lower or "positions" in query_lower:
        if "securities" in results["financial_data"]:
            securities = results["financial_data"]["securities"]
            if securities:
                security_count = len(securities)
                security_text = ", ".join([f"{s.get('name', 'unnamed')} ({s.get('identifier', 'unknown')})" 
                                          for s in securities[:3]])
                return f"The portfolio contains {security_count} securities. " + \
                       f"Some examples include: {security_text}" + \
                       (f" and {security_count - 3} more." if security_count > 3 else ".")
            else:
                return "I couldn't find any securities in the document."
    
    # Table queries
    if "table" in query_lower and results["tables"]:
        table_count = len(results["tables"])
        return f"I found {table_count} tables in the document. " + \
               f"They contain information about {', '.join([t.get('table_id', f'Table {i+1}') for i, t in enumerate(results['tables'][:3])])}" + \
               (f" and {table_count - 3} more." if table_count > 3 else ".")
    
    # General text search
    if results["matches"]:
        match_count = len(results["matches"])
        unique_terms = set(match["term"] for match in results["matches"])
        
        return f"I found {match_count} matches for your query terms ({', '.join(unique_terms)}) in the document. " + \
               f"Here's some context from the first match: \"{results['matches'][0]['context']}\""
    
    return "I found some information in the document, but I'm not sure how to interpret it in relation to your query."

def answer_question(query: str, document_data: Dict[str, Any]) -> str:
    """
    Answer a question about a document.
    
    Args:
        query: Question to answer
        document_data: Document data containing text, tables, and financial data
        
    Returns:
        Answer to the question
    """
    logger.info(f"Answering question: {query}")
    
    # Search for information
    search_results = search_documents(query, document_data)
    
    # Return the answer
    return search_results["answer"]

# Define tools
document_search_tool = Tool(
    name="document_search",
    description="Search for information in processed documents",
    function=search_documents
)

question_answering_tool = Tool(
    name="question_answering",
    description="Answer questions about financial documents",
    function=answer_question
)

# Create the query agent
query_agent = Agent(
    name="query_agent",
    model="gemini-2.0-flash",
    instruction="""
    You are a financial document query assistant. Your job is to answer questions about financial documents.
    
    For each question:
    1. Search for relevant information using the document_search tool
    2. Generate a clear and concise answer using the question_answering tool
    
    Be precise and factual in your answers. Only provide information that is present in the document.
    If you don't know the answer, say so clearly.
    
    When discussing financial data:
    - Be specific about numbers, currencies, and percentages
    - Provide context for financial terms
    - Highlight important insights when relevant
    """,
    description="Answers questions about financial documents using the processed data.",
    tools=[document_search_tool, question_answering_tool]
)

if __name__ == "__main__":
    # Example usage
    import sys
    import json
    
    if len(sys.argv) < 3:
        print("Usage: python query_agent.py <document_data_json> <query>")
        sys.exit(1)
    
    document_data_path = sys.argv[1]
    query = sys.argv[2]
    
    # Load document data
    with open(document_data_path, "r") as f:
        document_data = json.load(f)
    
    # Answer the question
    answer = answer_question(query, document_data)
    
    # Print results
    print("\n=== Query Results ===")
    print(f"Query: {query}")
    print(f"Answer: {answer}")
