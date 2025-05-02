"""
Test Login

This script tests logging in with the test user.
"""

import requests
import json
import sys

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

# Test user credentials
TEST_USER = {
    'email': 'test@example.com',
    'password': 'password123'
}

def test_login():
    """
    Test logging in with the test user.
    """
    print(f"Testing login with email: {TEST_USER['email']}")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json=TEST_USER,
            headers={
                'Content-Type': 'application/json'
            }
        )
        
        print(f"Status code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                print("\nLogin successful!")
                print(f"Token: {data.get('data', {}).get('token')[:20]}...")
                
                # Save token to file
                with open('test_user_token.json', 'w') as f:
                    json.dump({
                        'token': data.get('data', {}).get('token')
                    }, f, indent=2)
                
                print("Token saved to test_user_token.json")
                return True
            else:
                print(f"\nLogin failed: {data.get('error')}")
                return False
        except:
            print(f"Response (not JSON): {response.text[:200]}...")
            return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_login()
    sys.exit(0 if success else 1)
