"""
Test Authentication API

This script tests the authentication API endpoints.
"""

import requests
import json

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

def test_create_test_user():
    """
    Test creating a test user.
    """
    print("=== Testing Create Test User ===")
    
    try:
        response = requests.post(f"{API_URL}/auth/test-user")
        
        print(f"Status code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                print("\nTest user created successfully!")
                print(f"Email: {data.get('data', {}).get('email')}")
                print(f"Password: {data.get('data', {}).get('password')}")
                return data.get('data', {})
            else:
                print("\nFailed to create test user")
                return None
        except:
            print(f"Response (not JSON): {response.text[:200]}...")
            return None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def test_login(email, password):
    """
    Test logging in with the test user.
    """
    print("\n=== Testing Login ===")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={
                'email': email,
                'password': password
            }
        )
        
        print(f"Status code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                print("\nLogin successful!")
                print(f"Token: {data.get('data', {}).get('token')[:20]}...")
                return data.get('data', {}).get('token')
            else:
                print("\nLogin failed")
                return None
        except:
            print(f"Response (not JSON): {response.text[:200]}...")
            return None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def test_get_current_user(token):
    """
    Test getting the current user.
    """
    print("\n=== Testing Get Current User ===")
    
    try:
        response = requests.get(
            f"{API_URL}/auth/me",
            headers={
                'Authorization': f"Bearer {token}"
            }
        )
        
        print(f"Status code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                print("\nGet current user successful!")
                return data.get('data', {})
            else:
                print("\nGet current user failed")
                return None
        except:
            print(f"Response (not JSON): {response.text[:200]}...")
            return None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def main():
    """
    Main function.
    """
    # Test creating a test user
    test_user = test_create_test_user()
    
    if not test_user:
        print("Failed to create test user, cannot proceed with testing")
        return
    
    # Test logging in
    token = test_login(test_user.get('email'), test_user.get('password'))
    
    if not token:
        print("Failed to login, cannot proceed with testing")
        return
    
    # Test getting the current user
    current_user = test_get_current_user(token)
    
    if not current_user:
        print("Failed to get current user")
        return
    
    print("\n=== Test Summary ===")
    print("All tests passed successfully!")
    print(f"Test user email: {test_user.get('email')}")
    print(f"Test user password: {test_user.get('password')}")
    print(f"Authentication token: {token[:20]}...")

if __name__ == "__main__":
    main()
