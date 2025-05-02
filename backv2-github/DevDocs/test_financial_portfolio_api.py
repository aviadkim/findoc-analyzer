"""
Test script for the financial portfolio API endpoint.
"""
import requests
import json
import sys
import os

def test_financial_portfolio_api(api_url="http://localhost:5000"):
    """Test the financial portfolio API endpoint."""
    print("\n=== Testing Financial Portfolio API ===")
    
    try:
        # Send the request
        response = requests.get(f"{api_url}/api/financial/portfolio")
        response.raise_for_status()
        
        # Print the response
        result = response.json()
        print(f"Status: {result.get('status')}")
        
        if result.get('status') != 'success':
            print(f"❌ Expected status 'success', got '{result.get('status')}'")
            return False
        
        # Check if data is present
        data = result.get('data')
        if not data:
            print("❌ No data in response")
            return False
        
        # Check required fields
        required_fields = ['totalValue', 'currency', 'totalSecurities', 'totalAssetClasses', 'assetAllocation', 'topHoldings']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            print(f"❌ Missing fields: {', '.join(missing_fields)}")
            return False
        
        # Print summary
        print("\nPortfolio Summary:")
        print(f"Total Value: {data['totalValue']} {data['currency']}")
        print(f"Total Securities: {data['totalSecurities']}")
        print(f"Total Asset Classes: {data['totalAssetClasses']}")
        
        # Print asset allocation
        print("\nAsset Allocation:")
        for asset_class, percentage in data['assetAllocation'].items():
            print(f"- {asset_class}: {percentage}")
        
        # Print top holdings
        print("\nTop Holdings:")
        for i, holding in enumerate(data['topHoldings'], 1):
            print(f"{i}. {holding['name']} ({holding['isin']}): {holding['value']} {data['currency']} ({holding['percentage']}%)")
        
        print("\n✅ Financial Portfolio API test passed!")
        return True
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    # Get API URL from command line argument or use default
    api_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    
    # Run the test
    test_financial_portfolio_api(api_url)
