"""
Create Test User Direct

This script creates a test user directly using the API.
"""

import requests
import json
import sys

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

def create_test_user():
    """
    Create a test user directly.
    """
    print("Creating test user...")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/test-user",
            headers={
                'Content-Type': 'application/json'
            }
        )
        
        print(f"Status code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                print("\nTest user created successfully!")
                print(f"Email: {data.get('data', {}).get('email')}")
                print(f"Password: {data.get('data', {}).get('password')}")
                return True
            else:
                print(f"\nFailed to create test user: {data.get('error')}")
                return False
        except:
            print(f"Response (not JSON): {response.text[:200]}...")
            return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = create_test_user()
    sys.exit(0 if success else 1)
