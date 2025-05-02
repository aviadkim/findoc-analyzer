"""
Test API Directly

This script tests the API directly to see if we can access it without authentication.
"""

import requests
import json

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

def test_api_endpoint(endpoint, method="GET", data=None):
    """
    Test an API endpoint.
    
    Args:
        endpoint: API endpoint
        method: HTTP method
        data: Request data
        
    Returns:
        Response data
    """
    url = f"{API_URL}/{endpoint}"
    print(f"Testing {method} {url}")
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        else:
            print(f"Unsupported method: {method}")
            return None
        
        print(f"Status code: {response.status_code}")
        
        try:
            json_response = response.json()
            print(f"Response: {json.dumps(json_response, indent=2)}")
            return json_response
        except:
            print(f"Response (not JSON): {response.text[:200]}...")
            return response.text
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def main():
    """
    Main function.
    """
    print("=== Testing API Endpoints ===")
    
    # Test API status
    print("\n=== Testing API Status ===")
    test_api_endpoint("status")
    
    # Test OpenRouter API key verification
    print("\n=== Testing OpenRouter API Key Verification ===")
    test_api_endpoint("documents/scan1/verify-openrouter")
    
    # Test Gemini API key verification
    print("\n=== Testing Gemini API Key Verification ===")
    test_api_endpoint("documents/scan1/verify-gemini")
    
    # Test API usage
    print("\n=== Testing API Usage ===")
    test_api_endpoint("documents/scan1/api-usage")
    
    # Test asking a question
    print("\n=== Testing Ask Question ===")
    test_api_endpoint("documents/scan1/ask", method="POST", data={
        "question": "What is the meaning of life?",
        "context": "This is a test question about financial documents."
    })

if __name__ == "__main__":
    main()
