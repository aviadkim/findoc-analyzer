import requests
import json
import time

# Base URL for the API
BASE_URL = "https://findoc-deploy.ey.r.appspot.com/api"

def test_endpoint(endpoint, method="GET", data=None, files=None):
    """Test an API endpoint and return the response"""
    url = f"{BASE_URL}/{endpoint}"
    print(f"\nTesting {method} {url}")
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            if files:
                response = requests.post(url, files=files, data=data)
            else:
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

def test_upload_document(file_path):
    """Test uploading a document"""
    print(f"\n=== Testing Document Upload with {file_path} ===")
    with open(file_path, "rb") as file:
        files = {"file": file}
        return test_endpoint("documents", method="POST", files=files)

def test_process_document(document_id, options):
    """Test processing a document"""
    print(f"\n=== Testing Document Processing for ID {document_id} ===")
    return test_endpoint(f"documents/{document_id}/scan1", method="POST", data=options)

def test_get_document(document_id):
    """Test getting a document"""
    print(f"\n=== Testing Get Document for ID {document_id} ===")
    return test_endpoint(f"documents/{document_id}")

def test_document_processing_flow(file_path, options):
    """Test the complete document processing flow"""
    print(f"\n=== Testing Complete Document Processing Flow with {file_path} ===")
    
    # Step 1: Upload document
    upload_response = test_upload_document(file_path)
    if not upload_response or not upload_response.get("success"):
        print("Upload failed, cannot continue")
        return
    
    document_id = upload_response.get("data", {}).get("id")
    if not document_id:
        print("No document ID returned, cannot continue")
        return
    
    print(f"Document uploaded successfully with ID: {document_id}")
    
    # Step 2: Process document
    process_response = test_process_document(document_id, options)
    if not process_response or not process_response.get("success"):
        print("Processing initiation failed")
        return
    
    print("Processing initiated successfully")
    
    # Step 3: Poll for status
    max_polls = 30
    poll_interval = 5
    
    for i in range(max_polls):
        print(f"\nPolling for status ({i+1}/{max_polls})...")
        status_response = test_get_document(document_id)
        
        if not status_response or not status_response.get("success"):
            print("Failed to get status")
            continue
        
        status = status_response.get("data", {}).get("status")
        print(f"Current status: {status}")
        
        if status == "processed":
            print("Processing completed successfully!")
            return status_response
        elif status == "error":
            print("Processing failed with error")
            return status_response
        
        print(f"Waiting {poll_interval} seconds before next poll...")
        time.sleep(poll_interval)
    
    print("Polling timed out")
    return None

def main():
    """Main function to run the tests"""
    print("=== API Endpoint Testing ===")
    
    # Test API key verification
    test_verify_openrouter()
    test_verify_gemini()
    
    # Test API usage
    test_api_usage()
    
    # Test document processing flow
    file_path = "C:/Users/aviad/OneDrive/Desktop/backv2-main/test_pdfs/investment_statement.pdf"
    options = {
        "agents": ["Document Analyzer", "Table Understanding", "Securities Extractor", "Financial Reasoner"],
        "tableExtraction": True,
        "isinDetection": True,
        "securityInfo": True,
        "portfolioAnalysis": True,
        "ocrScanned": True,
        "outputFormat": "json"
    }
    
    test_document_processing_flow(file_path, options)

if __name__ == "__main__":
    main()
