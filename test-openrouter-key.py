import requests
import json
import sys

# API key to test
OPENROUTER_API_KEY = "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"

def test_openrouter_api():
    print(f"Testing OpenRouter API with key: {OPENROUTER_API_KEY[:5]}...{OPENROUTER_API_KEY[-5:]}")
    
    try:
        # First, test if we can get the list of models
        models_response = requests.get(
            url="https://openrouter.ai/api/v1/models",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            }
        )
        
        if models_response.status_code != 200:
            print(f"Failed to get models list. Status code: {models_response.status_code}")
            print(f"Response: {models_response.text}")
            return False
        
        models_data = models_response.json()
        print(f"Successfully retrieved {len(models_data.get('data', []))} models")
        
        # Now test a simple chat completion
        chat_response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://findoc-deploy.ey.r.appspot.com",
                "X-Title": "FinDoc Analyzer"
            },
            data=json.dumps({
                "model": "deepseek/deepseek-chat-v3-0324:free",
                "messages": [
                    {
                        "role": "user",
                        "content": "What is the meaning of life? Please keep your answer very short."
                    }
                ]
            })
        )
        
        if chat_response.status_code != 200:
            print(f"Failed to get chat completion. Status code: {chat_response.status_code}")
            print(f"Response: {chat_response.text}")
            return False
        
        chat_data = chat_response.json()
        print("Chat completion successful!")
        print(f"Response: {chat_data.get('choices', [{}])[0].get('message', {}).get('content', 'No content')}")
        return True
        
    except Exception as e:
        print(f"Error testing OpenRouter API: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_openrouter_api()
    print(f"Test completed with status: {'SUCCESS' if success else 'FAILURE'}")
    sys.exit(0 if success else 1)
