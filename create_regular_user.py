"""
Create Regular User

This script creates a regular user account.
"""

import requests
import json
import sys
import uuid

# API URL
API_URL = "https://findoc-deploy.ey.r.appspot.com/api"

# User credentials
USER = {
    'name': 'Test User',
    'email': f'test_{uuid.uuid4().hex[:8]}@example.com',
    'password': 'Password123!',
    'organization': 'Test Organization'
}

def create_regular_user():
    """
    Create a regular user account.
    """
    print(f"Creating regular user with email: {USER['email']}")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/register",
            json=USER,
            headers={
                'Content-Type': 'application/json'
            }
        )
        
        print(f"Status code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                print("\nUser created successfully!")
                print(f"Email: {USER['email']}")
                print(f"Password: {USER['password']}")
                
                # Save credentials to file
                with open('test_user_credentials.json', 'w') as f:
                    json.dump({
                        'email': USER['email'],
                        'password': USER['password']
                    }, f, indent=2)
                
                print("Credentials saved to test_user_credentials.json")
                return True
            else:
                print(f"\nFailed to create user: {data.get('error')}")
                return False
        except:
            print(f"Response (not JSON): {response.text[:200]}...")
            return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = create_regular_user()
    sys.exit(0 if success else 1)
