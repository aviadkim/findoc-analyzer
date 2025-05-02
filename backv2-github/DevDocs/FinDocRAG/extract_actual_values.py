"""
Script to extract actual values from the details field of each security.
"""
import os
import sys
import json
import re
from typing import Dict, Any, List

def extract_actual_values(securities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extract actual values from the details field of each security.
    
    Args:
        securities: List of securities
        
    Returns:
        List of securities with actual values
    """
    enhanced_securities = []
    
    for security in securities:
        enhanced = security.copy()
        
        # Extract actual value from details
        if 'details' in security:
            for detail in security['details']:
                # Look for patterns like "USD 200'000 ... 199'172"
                value_match = re.search(r'USD\s+(\d+\'?\d*\'?\d*)\s+.*?(\d+\'?\d*\'?\d*)\s+\d+\.\d+%', detail)
                if value_match:
                    enhanced['nominal_value'] = value_match.group(1).replace("'", "")
                    enhanced['actual_value'] = value_match.group(2).replace("'", "")
                    break
        
        enhanced_securities.append(enhanced)
    
    return enhanced_securities

def main():
    """
    Main function.
    """
    # Check command line arguments
    if len(sys.argv) < 2:
        print("Usage: python extract_actual_values.py <json_file>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    
    # Check if the JSON file exists
    if not os.path.exists(json_file):
        print(f"Error: JSON file '{json_file}' not found.")
        sys.exit(1)
    
    # Load the JSON file
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extract actual values
    if 'securities' in data:
        data['securities'] = extract_actual_values(data['securities'])
    
    # Save the enhanced JSON file
    output_file = f"{os.path.splitext(json_file)[0]}_with_values.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Enhanced JSON file saved to {output_file}")
    
    # Print summary
    print(f"\nFound {len(data['securities'])} securities")
    
    # Print first 5 securities as example
    for i, security in enumerate(data['securities'][:5]):
        print(f"\nSecurity {i+1}:")
        print(f"  ISIN: {security.get('isin', 'Unknown')}")
        print(f"  Description: {security.get('description', 'Unknown')}")
        print(f"  Type: {security.get('type', 'Unknown')}")
        print(f"  Nominal: {security.get('nominal', 'Unknown')}")
        print(f"  Nominal Value: {security.get('nominal_value', 'Unknown')}")
        print(f"  Actual Value: {security.get('actual_value', 'Unknown')}")
        print(f"  Currency: {security.get('currency', 'Unknown')}")
        print(f"  Maturity: {security.get('maturity', 'Unknown')}")
        print(f"  Coupon: {security.get('coupon', 'Unknown')}")

if __name__ == "__main__":
    main()
