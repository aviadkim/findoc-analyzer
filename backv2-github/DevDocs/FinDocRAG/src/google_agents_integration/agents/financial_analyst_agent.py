"""
Financial Analysis Agent using Google's Agent Development Kit (ADK).

This agent is responsible for analyzing financial data and providing insights.
"""
import os
import logging
import json
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np

from google.adk.agents import Agent
from google.adk.tools import Tool

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define tool functions
def analyze_portfolio(financial_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze portfolio composition and performance.
    
    Args:
        financial_data: Financial data extracted from documents
        
    Returns:
        Dictionary containing portfolio analysis
    """
    logger.info("Analyzing portfolio composition and performance")
    
    # Extract securities and total value
    securities = financial_data.get("securities", [])
    total_value = financial_data.get("total_value", 0)
    currency = financial_data.get("currency", "USD")
    asset_allocation = financial_data.get("asset_allocation", {})
    
    # Calculate portfolio metrics
    security_count = len(securities)
    
    # Calculate total securities value
    securities_value = 0
    for security in securities:
        value = security.get("value")
        if value is not None:
            securities_value += float(value)
    
    # Check if total value matches sum of securities
    value_match = abs(total_value - securities_value) < 0.01 if total_value > 0 else False
    
    # Calculate asset class distribution if not provided
    if not asset_allocation and securities:
        asset_classes = {}
        for security in securities:
            asset_class = determine_asset_class(security.get("name", ""))
            if asset_class not in asset_classes:
                asset_classes[asset_class] = 0
            
            value = security.get("value")
            if value is not None:
                asset_classes[asset_class] += float(value)
        
        # Convert to percentages
        if securities_value > 0:
            asset_allocation = {
                asset_class: round(value / securities_value * 100, 2)
                for asset_class, value in asset_classes.items()
            }
    
    # Calculate diversification score (0-100)
    diversification_score = calculate_diversification_score(asset_allocation)
    
    # Compile portfolio analysis
    portfolio_analysis = {
        "security_count": security_count,
        "total_value": total_value,
        "currency": currency,
        "securities_value": securities_value,
        "value_match": value_match,
        "asset_allocation": asset_allocation,
        "diversification_score": diversification_score,
        "risk_profile": determine_risk_profile(asset_allocation),
        "recommendations": generate_recommendations(asset_allocation, diversification_score)
    }
    
    return portfolio_analysis

def evaluate_security(security: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluate security valuation and metrics.
    
    Args:
        security: Security data
        
    Returns:
        Dictionary containing security evaluation
    """
    logger.info(f"Evaluating security: {security.get('name', 'Unknown')}")
    
    # Extract security data
    name = security.get("name", "Unknown")
    identifier = security.get("identifier", "")
    quantity = security.get("quantity")
    value = security.get("value")
    
    # Calculate price if possible
    price = None
    if quantity is not None and value is not None and float(quantity) > 0:
        try:
            price = float(value) / float(quantity)
        except (ValueError, ZeroDivisionError):
            price = None
    
    # Determine security type
    security_type = determine_security_type(name, identifier)
    
    # Compile security evaluation
    security_evaluation = {
        "name": name,
        "identifier": identifier,
        "security_type": security_type,
        "quantity": quantity,
        "value": value,
        "price": price,
        "asset_class": determine_asset_class(name),
        "risk_level": determine_security_risk(security_type),
        "recommendations": []
    }
    
    # Generate recommendations
    if security_type == "Bond" and "high yield" in name.lower():
        security_evaluation["recommendations"].append("Consider credit risk exposure of high yield bonds")
    
    if security_type == "ETF" and "leveraged" in name.lower():
        security_evaluation["recommendations"].append("Monitor leveraged ETF exposure due to volatility")
    
    if security_type == "Stock" and value is not None and float(value) > 10000:
        security_evaluation["recommendations"].append("Consider diversifying large single stock position")
    
    return security_evaluation

def determine_asset_class(security_name: str) -> str:
    """
    Determine the asset class of a security based on its name.
    
    Args:
        security_name: Name of the security
        
    Returns:
        Asset class
    """
    name_lower = security_name.lower()
    
    if "bond" in name_lower or "fixed income" in name_lower or "treasury" in name_lower:
        return "Bonds"
    elif "stock" in name_lower or "share" in name_lower or "equity" in name_lower:
        return "Equities"
    elif "etf" in name_lower or "exchange traded fund" in name_lower:
        if "bond" in name_lower:
            return "Bond ETFs"
        elif "stock" in name_lower or "equity" in name_lower:
            return "Equity ETFs"
        else:
            return "ETFs"
    elif "fund" in name_lower or "mutual" in name_lower:
        return "Funds"
    elif "cash" in name_lower or "money market" in name_lower:
        return "Cash"
    elif "commodity" in name_lower or "gold" in name_lower or "silver" in name_lower:
        return "Commodities"
    elif "real estate" in name_lower or "reit" in name_lower or "property" in name_lower:
        return "Real Estate"
    elif "option" in name_lower or "future" in name_lower or "swap" in name_lower:
        return "Derivatives"
    else:
        return "Other"

def determine_security_type(name: str, identifier: str) -> str:
    """
    Determine the type of a security based on its name and identifier.
    
    Args:
        name: Name of the security
        identifier: Identifier (ISIN) of the security
        
    Returns:
        Security type
    """
    name_lower = name.lower()
    
    if "bond" in name_lower or "note" in name_lower or "treasury" in name_lower:
        return "Bond"
    elif "stock" in name_lower or "share" in name_lower:
        return "Stock"
    elif "etf" in name_lower or "exchange traded fund" in name_lower:
        return "ETF"
    elif "fund" in name_lower or "mutual" in name_lower:
        return "Fund"
    elif "option" in name_lower:
        return "Option"
    elif "future" in name_lower:
        return "Future"
    elif "cash" in name_lower or "money market" in name_lower:
        return "Cash"
    elif "commodity" in name_lower or "gold" in name_lower or "silver" in name_lower:
        return "Commodity"
    elif "reit" in name_lower:
        return "REIT"
    else:
        # Try to determine from ISIN
        if identifier.startswith("US") and len(identifier) == 12:
            return "US Security"
        elif identifier.startswith("GB") and len(identifier) == 12:
            return "UK Security"
        elif identifier.startswith("DE") and len(identifier) == 12:
            return "German Security"
        else:
            return "Unknown"

def determine_security_risk(security_type: str) -> str:
    """
    Determine the risk level of a security based on its type.
    
    Args:
        security_type: Type of the security
        
    Returns:
        Risk level (Low, Medium, High)
    """
    low_risk = ["Cash", "Bond", "Money Market"]
    medium_risk = ["Fund", "ETF", "REIT", "US Security", "UK Security", "German Security"]
    high_risk = ["Stock", "Option", "Future", "Commodity", "Derivative"]
    
    if security_type in low_risk:
        return "Low"
    elif security_type in medium_risk:
        return "Medium"
    elif security_type in high_risk:
        return "High"
    else:
        return "Unknown"

def calculate_diversification_score(asset_allocation: Dict[str, float]) -> float:
    """
    Calculate a diversification score based on asset allocation.
    
    Args:
        asset_allocation: Asset allocation percentages
        
    Returns:
        Diversification score (0-100)
    """
    if not asset_allocation:
        return 0
    
    # Calculate Herfindahl-Hirschman Index (HHI)
    # HHI is the sum of squared percentages (0-10000)
    hhi = sum(pct ** 2 for pct in asset_allocation.values())
    
    # Normalize to 0-100 scale (inverted, so higher is better)
    # Perfect diversification would be 1/n for each asset class
    n = len(asset_allocation)
    min_hhi = n * (100 / n) ** 2  # Minimum possible HHI (perfect diversification)
    max_hhi = 10000  # Maximum possible HHI (no diversification)
    
    if n <= 1:
        return 0
    
    # Calculate normalized score (0-100)
    score = 100 * (max_hhi - hhi) / (max_hhi - min_hhi)
    
    return min(max(0, score), 100)  # Clamp to 0-100

def determine_risk_profile(asset_allocation: Dict[str, float]) -> str:
    """
    Determine the risk profile based on asset allocation.
    
    Args:
        asset_allocation: Asset allocation percentages
        
    Returns:
        Risk profile (Conservative, Moderate, Balanced, Growth, Aggressive)
    """
    if not asset_allocation:
        return "Unknown"
    
    # Calculate risk score based on asset classes
    risk_weights = {
        "Cash": 0,
        "Bonds": 25,
        "Bond ETFs": 25,
        "Fixed Income": 25,
        "Equities": 75,
        "Equity ETFs": 75,
        "Stocks": 75,
        "ETFs": 50,
        "Funds": 50,
        "Real Estate": 75,
        "Commodities": 75,
        "Derivatives": 100,
        "Other": 50
    }
    
    total_weight = 0
    weighted_risk = 0
    
    for asset_class, percentage in asset_allocation.items():
        weight = risk_weights.get(asset_class, 50)
        weighted_risk += weight * percentage
        total_weight += percentage
    
    if total_weight > 0:
        risk_score = weighted_risk / total_weight
    else:
        risk_score = 50
    
    # Determine risk profile
    if risk_score < 20:
        return "Conservative"
    elif risk_score < 40:
        return "Moderate"
    elif risk_score < 60:
        return "Balanced"
    elif risk_score < 80:
        return "Growth"
    else:
        return "Aggressive"

def generate_recommendations(asset_allocation: Dict[str, float], diversification_score: float) -> List[str]:
    """
    Generate recommendations based on portfolio analysis.
    
    Args:
        asset_allocation: Asset allocation percentages
        diversification_score: Diversification score
        
    Returns:
        List of recommendations
    """
    recommendations = []
    
    # Check diversification
    if diversification_score < 30:
        recommendations.append("Consider diversifying your portfolio across more asset classes")
    
    # Check asset allocation
    equities_pct = sum(asset_allocation.get(ac, 0) for ac in ["Equities", "Stocks", "Equity ETFs"])
    bonds_pct = sum(asset_allocation.get(ac, 0) for ac in ["Bonds", "Fixed Income", "Bond ETFs"])
    cash_pct = asset_allocation.get("Cash", 0)
    
    if equities_pct > 80:
        recommendations.append("Consider reducing equity exposure to manage risk")
    
    if bonds_pct < 10 and equities_pct > 50:
        recommendations.append("Consider adding bonds for stability and income")
    
    if cash_pct > 30:
        recommendations.append("Consider investing excess cash to avoid inflation erosion")
    
    if cash_pct < 5:
        recommendations.append("Consider maintaining a cash reserve for emergencies")
    
    return recommendations

# Define tools
portfolio_analyzer_tool = Tool(
    name="portfolio_analyzer",
    description="Analyze portfolio composition and performance",
    function=analyze_portfolio
)

security_evaluator_tool = Tool(
    name="security_evaluator",
    description="Evaluate security valuation and metrics",
    function=evaluate_security
)

# Create the financial analysis agent
financial_analyst_agent = Agent(
    name="financial_analyst",
    model="gemini-2.0-pro",
    instruction="""
    You are a financial analyst expert. Your job is to analyze financial data and provide insights.
    
    For each portfolio:
    1. Analyze the portfolio composition and performance using the portfolio_analyzer tool
    2. Evaluate individual securities using the security_evaluator tool
    
    Provide clear insights and actionable recommendations based on:
    - Asset allocation and diversification
    - Risk profile and exposure
    - Security-specific considerations
    
    Use plain language that clients can understand, but be precise with financial terminology when needed.
    """,
    description="Analyzes financial data to provide portfolio insights and recommendations.",
    tools=[portfolio_analyzer_tool, security_evaluator_tool]
)

if __name__ == "__main__":
    # Example usage
    import sys
    import json
    
    if len(sys.argv) < 2:
        print("Usage: python financial_analyst_agent.py <financial_data_json>")
        sys.exit(1)
    
    financial_data_path = sys.argv[1]
    
    # Load financial data
    with open(financial_data_path, "r") as f:
        financial_data = json.load(f)
    
    # Analyze portfolio
    portfolio_analysis = analyze_portfolio(financial_data)
    
    # Print results
    print("\n=== Portfolio Analysis ===")
    print(f"Security Count: {portfolio_analysis['security_count']}")
    print(f"Total Value: {portfolio_analysis['total_value']} {portfolio_analysis['currency']}")
    print(f"Diversification Score: {portfolio_analysis['diversification_score']:.2f}/100")
    print(f"Risk Profile: {portfolio_analysis['risk_profile']}")
    print("\nRecommendations:")
    for recommendation in portfolio_analysis['recommendations']:
        print(f"- {recommendation}")
    
    # Evaluate securities
    print("\n=== Security Evaluations ===")
    for security in financial_data.get("securities", [])[:3]:  # Show first 3 securities
        evaluation = evaluate_security(security)
        print(f"\n{evaluation['name']} ({evaluation['identifier']})")
        print(f"Type: {evaluation['security_type']}")
        print(f"Asset Class: {evaluation['asset_class']}")
        print(f"Risk Level: {evaluation['risk_level']}")
        if evaluation['recommendations']:
            print("Recommendations:")
            for recommendation in evaluation['recommendations']:
                print(f"- {recommendation}")
