"""
Financial Data Validator Agent using Google's Agent Development Kit (ADK).

This agent is responsible for validating and enhancing financial data extracted from documents.
"""
import os
import logging
import json
import re
from typing import Dict, List, Any, Optional

from google.adk.agents import Agent
from google.adk.tools import Tool

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define tool functions
def validate_securities(securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Validate and enhance securities information.
    
    Args:
        securities: List of securities to validate
        
    Returns:
        Validated and enhanced securities
    """
    logger.info(f"Validating {len(securities)} securities")
    
    try:
        validated_securities = []
        
        for security in securities:
            # Ensure required fields
            if 'isin' not in security:
                logger.warning(f"Security missing ISIN: {security}")
                continue
            
            # Validate ISIN
            isin = security['isin']
            if not is_valid_isin(isin):
                logger.warning(f"Invalid ISIN: {isin}")
                continue
            
            # Clean up values
            cleaned_security = clean_security_values(security)
            
            # Add to validated securities
            validated_securities.append(cleaned_security)
        
        return validated_securities
    except Exception as e:
        logger.error(f"Error validating securities: {str(e)}")
        return securities

def is_valid_isin(isin: str) -> bool:
    """
    Validate an ISIN number.
    
    Args:
        isin: ISIN to validate
        
    Returns:
        True if valid, False otherwise
    """
    # Check length
    if len(isin) != 12:
        return False
    
    # Check format: 2 letters followed by 9 alphanumeric characters and a check digit
    if not re.match(r'^[A-Z]{2}[A-Z0-9]{9}[0-9]$', isin):
        return False
    
    # Check digit validation
    try:
        # Convert letters to numbers (A=10, B=11, ..., Z=35)
        values = []
        for char in isin[:-1]:  # Exclude check digit
            if char.isdigit():
                values.append(int(char))
            else:
                values.append(ord(char) - ord('A') + 10)
        
        # Double every second digit from right to left
        for i in range(len(values)-1, -1, -2):
            values[i] *= 2
            if values[i] > 9:
                values[i] = values[i] % 10 + values[i] // 10
        
        # Sum all digits
        total = sum(values)
        
        # Check digit is the amount needed to reach the next multiple of 10
        check_digit = (10 - (total % 10)) % 10
        
        return check_digit == int(isin[-1])
    except Exception:
        return False

def clean_security_values(security: Dict[str, Any]) -> Dict[str, Any]:
    """
    Clean up security values.
    
    Args:
        security: Security to clean
        
    Returns:
        Cleaned security
    """
    cleaned = security.copy()
    
    # Clean up numeric values
    for field in ['nominal', 'value', 'price', 'quantity']:
        if field in cleaned and cleaned[field]:
            # Remove thousands separators and convert to float
            value = str(cleaned[field])
            value = value.replace("'", "").replace(",", "")
            try:
                cleaned[field] = float(value)
            except ValueError:
                # Keep original value if conversion fails
                pass
    
    # Clean up text fields
    for field in ['description', 'name', 'type']:
        if field in cleaned and cleaned[field]:
            # Remove extra whitespace
            cleaned[field] = re.sub(r'\s+', ' ', str(cleaned[field])).strip()
    
    # Normalize security type
    if 'type' in cleaned and cleaned['type']:
        type_lower = str(cleaned['type']).lower()
        if 'bond' in type_lower:
            if 'zero' in type_lower:
                cleaned['type'] = 'Zero Bond'
            elif 'structured' in type_lower:
                cleaned['type'] = 'Structured Bond'
            else:
                cleaned['type'] = 'Bond'
        elif 'stock' in type_lower or 'equity' in type_lower or 'share' in type_lower:
            cleaned['type'] = 'Equity'
        elif 'fund' in type_lower:
            cleaned['type'] = 'Fund'
        elif 'etf' in type_lower:
            cleaned['type'] = 'ETF'
        elif 'option' in type_lower:
            cleaned['type'] = 'Option'
        elif 'future' in type_lower:
            cleaned['type'] = 'Future'
        elif 'warrant' in type_lower:
            cleaned['type'] = 'Warrant'
    
    return cleaned

def validate_portfolio_summary(summary: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and enhance portfolio summary information.
    
    Args:
        summary: Portfolio summary to validate
        
    Returns:
        Validated and enhanced portfolio summary
    """
    logger.info("Validating portfolio summary")
    
    try:
        validated_summary = summary.copy()
        
        # Clean up total value
        if 'total_value' in validated_summary and validated_summary['total_value']:
            value = str(validated_summary['total_value'])
            value = value.replace("'", "").replace(",", "")
            try:
                validated_summary['total_value'] = float(value)
            except ValueError:
                # Keep original value if conversion fails
                pass
        
        # Validate currency
        if 'valuation_currency' in validated_summary and validated_summary['valuation_currency']:
            currency = str(validated_summary['valuation_currency']).upper()
            if currency not in ['USD', 'EUR', 'GBP', 'CHF', 'JPY']:
                logger.warning(f"Unusual currency: {currency}")
        
        # Validate date format
        if 'valuation_date' in validated_summary and validated_summary['valuation_date']:
            date = str(validated_summary['valuation_date'])
            # Check if date is in DD.MM.YYYY format
            if re.match(r'\d{2}\.\d{2}\.\d{4}', date):
                # Convert to ISO format (YYYY-MM-DD)
                try:
                    day, month, year = date.split('.')
                    validated_summary['valuation_date_iso'] = f"{year}-{month}-{day}"
                except ValueError:
                    # Keep original value if conversion fails
                    pass
        
        return validated_summary
    except Exception as e:
        logger.error(f"Error validating portfolio summary: {str(e)}")
        return summary

def validate_asset_allocation(asset_allocation: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and enhance asset allocation information.
    
    Args:
        asset_allocation: Asset allocation to validate
        
    Returns:
        Validated and enhanced asset allocation
    """
    logger.info("Validating asset allocation")
    
    try:
        validated_allocation = {}
        
        # Process each asset class
        for asset_class, data in asset_allocation.items():
            if not data:
                continue
            
            validated_data = {}
            
            # Clean up value
            if 'value' in data and data['value']:
                value = str(data['value'])
                value = value.replace("'", "").replace(",", "")
                try:
                    if '%' in value:
                        # Value is a percentage
                        validated_data['percentage'] = float(value.replace('%', ''))
                    else:
                        # Value is an amount
                        validated_data['value'] = float(value)
                except ValueError:
                    # Keep original value if conversion fails
                    validated_data['value'] = data['value']
            
            # Clean up percentage
            if 'percentage' in data and data['percentage']:
                percentage = str(data['percentage'])
                percentage = percentage.replace('%', '')
                try:
                    validated_data['percentage'] = float(percentage)
                except ValueError:
                    # Keep original value if conversion fails
                    validated_data['percentage'] = data['percentage']
            
            validated_allocation[asset_class] = validated_data
        
        # Validate total percentage
        total_percentage = sum(data.get('percentage', 0) for data in validated_allocation.values())
        if total_percentage > 0 and abs(total_percentage - 100) > 1:
            logger.warning(f"Asset allocation percentages do not sum to 100%: {total_percentage}%")
        
        return validated_allocation
    except Exception as e:
        logger.error(f"Error validating asset allocation: {str(e)}")
        return asset_allocation

def enrich_securities_with_external_data(securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Enrich securities with external data.
    
    Args:
        securities: List of securities to enrich
        
    Returns:
        Enriched securities
    """
    logger.info(f"Enriching {len(securities)} securities with external data")
    
    # In a real implementation, this would call external APIs to get additional data
    # For now, we'll just add some mock data
    
    enriched_securities = []
    
    for security in securities:
        enriched = security.copy()
        
        # Add mock sector and industry data
        if 'type' in security:
            if security['type'] in ['Bond', 'Zero Bond', 'Structured Bond']:
                enriched['asset_class'] = 'Fixed Income'
                enriched['sector'] = 'Finance'
                enriched['risk_level'] = 'Low to Medium'
            elif security['type'] in ['Equity', 'Stock']:
                enriched['asset_class'] = 'Equity'
                enriched['sector'] = 'Technology'
                enriched['risk_level'] = 'Medium to High'
            elif security['type'] in ['Fund', 'ETF']:
                enriched['asset_class'] = 'Funds'
                enriched['sector'] = 'Mixed'
                enriched['risk_level'] = 'Medium'
        
        enriched_securities.append(enriched)
    
    return enriched_securities

# Create the financial data validator agent
financial_data_validator_agent = Agent(
    name="financial_data_validator",
    model="gemini-2.0-pro",
    instruction="""
    You are a financial data validation expert. Your job is to validate and enhance financial data extracted from documents.
    
    For each set of financial data:
    1. Validate securities using the validate_securities tool
    2. Validate portfolio summary using the validate_portfolio_summary tool
    3. Validate asset allocation using the validate_asset_allocation tool
    4. Enrich securities with external data using the enrich_securities_with_external_data tool
    
    Be thorough and precise in your validation. Pay special attention to:
    - ISIN validation
    - Numeric value cleaning (removing thousands separators, etc.)
    - Date format standardization
    - Security type normalization
    - Percentage validation
    
    Always provide accurate information based on the document content.
    """,
    description="Validates and enhances financial data extracted from documents.",
    tools=[
        Tool(
            name="validate_securities",
            description="Validate and enhance securities information",
            function=validate_securities
        ),
        Tool(
            name="validate_portfolio_summary",
            description="Validate and enhance portfolio summary information",
            function=validate_portfolio_summary
        ),
        Tool(
            name="validate_asset_allocation",
            description="Validate and enhance asset allocation information",
            function=validate_asset_allocation
        ),
        Tool(
            name="enrich_securities_with_external_data",
            description="Enrich securities with external data",
            function=enrich_securities_with_external_data
        )
    ]
)

def validate_financial_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and enhance financial data.
    
    Args:
        data: Financial data to validate
        
    Returns:
        Validated and enhanced financial data
    """
    logger.info("Validating financial data")
    
    validated_data = data.copy()
    
    # Validate securities
    if 'securities' in data:
        validated_data['securities'] = financial_data_validator_agent.tools[0].function(data['securities'])
        
        # Enrich securities with external data
        validated_data['securities'] = financial_data_validator_agent.tools[3].function(validated_data['securities'])
    
    # Validate portfolio summary
    if 'portfolio_summary' in data:
        validated_data['portfolio_summary'] = financial_data_validator_agent.tools[1].function(data['portfolio_summary'])
    
    # Validate asset allocation
    if 'asset_allocation' in data:
        validated_data['asset_allocation'] = financial_data_validator_agent.tools[2].function(data['asset_allocation'])
    
    return validated_data

if __name__ == "__main__":
    # Test the agent
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python financial_data_validator_agent.py <data_path>")
        sys.exit(1)
    
    data_path = sys.argv[1]
    
    # Load data
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Validate data
    validated_data = validate_financial_data(data)
    
    # Save validated data
    output_path = f"{os.path.splitext(data_path)[0]}_validated.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(validated_data, f, indent=2, ensure_ascii=False)
    
    print(f"Validated data saved to {output_path}")
