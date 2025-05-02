import requests
import json
import time
import sys
import os

# Base URL for the API
BASE_URL = "https://findoc-deploy.ey.r.appspot.com/api"

def test_endpoint(endpoint, method="GET", data=None, files=None, headers=None):
    """Test an API endpoint and return the response"""
    url = f"{BASE_URL}/{endpoint}"
    print(f"\nTesting {method} {url}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            if files:
                response = requests.post(url, files=files, data=data, headers=headers)
            else:
                response = requests.post(url, json=data, headers=headers)
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

def test_verify_openrouter():
    """Test the OpenRouter API key verification endpoint"""
    print("\n=== Testing OpenRouter API Key Verification ===")
    return test_endpoint("documents/scan1/verify-openrouter")

def test_verify_gemini():
    """Test the Gemini API key verification endpoint"""
    print("\n=== Testing Gemini API Key Verification ===")
    return test_endpoint("documents/scan1/verify-gemini")

def test_api_usage():
    """Test the API usage endpoint"""
    print("\n=== Testing API Usage ===")
    return test_endpoint("documents/scan1/api-usage")

def test_ask_question():
    """Test asking a question about financial documents"""
    print("\n=== Testing Ask Question ===")
    data = {
        "question": "What is the meaning of life?",
        "context": "This is a test question about financial documents."
    }
    return test_endpoint("documents/scan1/ask", method="POST", data=data)

def main():
    """Main function to run the tests"""
    print("=== API Endpoint Testing ===")
    
    # Test API key verification
    openrouter_response = test_verify_openrouter()
    gemini_response = test_verify_gemini()
    
    # Test API usage
    api_usage_response = test_api_usage()
    
    # Test asking a question
    question_response = test_ask_question()
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"OpenRouter API Key: {'Valid' if openrouter_response and openrouter_response.get('data', {}).get('available') else 'Invalid'}")
    print(f"Gemini API Key: {'Valid' if gemini_response and gemini_response.get('data', {}).get('available') else 'Invalid'}")
    
    if question_response and question_response.get('success'):
        print("Question answering: Working")
        print(f"Answer: {question_response.get('data', {}).get('answer')}")
    else:
        print("Question answering: Not working")

if __name__ == "__main__":
    main()
