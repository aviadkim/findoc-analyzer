"""
Test script for the fixed ISINExtractorAgent.
"""
import os
import sys
import argparse
import json

# Add the parent directory to the path so we can import the backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from DevDocs.backend.agents.isin_extractor_agent import ISINExtractorAgent

def test_isin_extractor(text_file=None):
    """Test the ISINExtractorAgent."""
    print("\n=== Testing ISINExtractorAgent ===")
    
    # Create the agent
    agent = ISINExtractorAgent()
    
    # Get the text to process
    if text_file:
        try:
            with open(text_file, 'r', encoding='utf-8') as f:
                text = f.read()
        except Exception as e:
            print(f"Error reading file: {e}")
            return False
    else:
        # Use a sample text with ISINs
        text = """
        Portfolio Statement
        
        Security Name: Apple Inc.
        ISIN: US0378331005
        Quantity: 100
        Price: $150.25
        Value: $15,025.00
        
        Security Name: Microsoft Corporation
        ISIN: US5949181045
        Quantity: 50
        Price: $300.50
        Value: $15,025.00
        
        Security Name: Amazon.com Inc.
        ISIN: US0231351067
        Quantity: 25
        Price: $130.75
        Value: $3,268.75
        
        Security Name: Invalid ISIN
        ISIN: XX1234567890
        Quantity: 10
        """
    
    # Test basic ISIN extraction
    print("\nTesting basic ISIN extraction...")
    isins = agent.extract_isins(text)
    print(f"Extracted {len(isins)} ISINs:")
    for isin in isins:
        print(f"- {isin}")
    
    # Test ISIN validation
    print("\nTesting ISIN validation...")
    valid_isins = agent.extract_and_validate_isins(text)
    print(f"Validated {len(valid_isins)} ISINs:")
    for isin in valid_isins:
        print(f"- {isin}")
    
    # Test ISIN extraction with context
    print("\nTesting ISIN extraction with context...")
    isins_with_context = agent.find_isins_with_context(text)
    print(f"Extracted {len(isins_with_context)} ISINs with context:")
    for i, item in enumerate(isins_with_context[:3]):  # Show first 3 for brevity
        print(f"- {item['isin']} at position {item['position']}")
        print(f"  Before: '{item['before_context'][-30:]}' After: '{item['after_context'][:30]}'")
    
    # Test securities extraction
    print("\nTesting securities extraction...")
    securities = agent.extract_securities_with_isins(text)
    print(f"Extracted {len(securities)} securities:")
    for security in securities:
        print(f"- {security['name']} (ISIN: {security['isin']}, Country: {security['metadata']['country_name']})")
    
    # Test the agent's process method
    print("\nTesting agent's process method...")
    result = agent.process({
        'text': text,
        'validate': True,
        'include_metadata': True
    })
    
    if result['status'] == 'success':
        print("ISIN extraction successful!")
        print(f"Extracted {result['count']} ISINs")
        
        # Save the results to a file
        with open('isin_extraction_results.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
        print("Saved results to isin_extraction_results.json")
        
        return True
    else:
        print(f"Error: {result.get('message', 'Unknown error')}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the ISINExtractorAgent")
    parser.add_argument("--text", help="Path to a text file with ISINs")
    args = parser.parse_args()
    
    test_isin_extractor(args.text)
