import requests
import json
import os
import time
import sys

# Base URL for the API
BASE_URL = "https://findoc-deploy.ey.r.appspot.com/api"

# Test files directory
TEST_FILES_DIR = os.path.dirname(os.path.abspath(__file__))

# List of test files
TEST_FILES = [
    "goldman_portfolio.pdf",
    "investment_statement.pdf",
    "messos_portfolio.pdf",
    "sample_portfolio.pdf",
    "simple_account_statement.pdf"
]

# Agent configurations to test
AGENT_CONFIGS = [
    {
        "name": "All Agents with OCR",
        "agents": ["Document Analyzer", "Table Understanding", "Securities Extractor", "Financial Reasoner"],
        "tableExtraction": True,
        "isinDetection": True,
        "securityInfo": True,
        "portfolioAnalysis": True,
        "ocrScanned": True,
        "outputFormat": "json"
    },
    {
        "name": "Document Analyzer Only",
        "agents": ["Document Analyzer"],
        "tableExtraction": True,
        "isinDetection": False,
        "securityInfo": False,
        "portfolioAnalysis": False,
        "ocrScanned": True,
        "outputFormat": "json"
    },
    {
        "name": "Securities Extraction Only",
        "agents": ["Securities Extractor"],
        "tableExtraction": True,
        "isinDetection": True,
        "securityInfo": True,
        "portfolioAnalysis": False,
        "ocrScanned": True,
        "outputFormat": "json"
    }
]

def upload_document(file_path):
    """Upload a document to the API"""
    print(f"Uploading {os.path.basename(file_path)}...")
    
    url = f"{BASE_URL}/documents/upload"
    
    with open(file_path, "rb") as file:
        files = {"file": file}
        response = requests.post(url, files=files)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            document_id = data.get("data", {}).get("id")
            print(f"Upload successful. Document ID: {document_id}")
            return document_id
        else:
            print(f"Upload failed: {data.get('error')}")
            return None
    else:
        print(f"Upload failed with status code {response.status_code}")
        return None

def process_document(document_id, config):
    """Process a document with the given configuration"""
    print(f"Processing document {document_id} with config: {config['name']}...")
    
    url = f"{BASE_URL}/documents/scan1/{document_id}"
    
    # Extract the configuration parameters
    payload = {
        "agents": config["agents"],
        "tableExtraction": config["tableExtraction"],
        "isinDetection": config["isinDetection"],
        "securityInfo": config["securityInfo"],
        "portfolioAnalysis": config["portfolioAnalysis"],
        "ocrScanned": config["ocrScanned"],
        "outputFormat": config["outputFormat"]
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            print(f"Processing initiated successfully.")
            return True
        else:
            print(f"Processing failed: {data.get('error')}")
            return False
    else:
        print(f"Processing failed with status code {response.status_code}")
        return False

def check_document_status(document_id):
    """Check the status of a document"""
    url = f"{BASE_URL}/documents/{document_id}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            status = data.get("data", {}).get("status")
            print(f"Document status: {status}")
            return status
        else:
            print(f"Failed to get document status: {data.get('error')}")
            return None
    else:
        print(f"Failed to get document status with status code {response.status_code}")
        return None

def wait_for_processing(document_id, max_wait_time=300):
    """Wait for document processing to complete"""
    print(f"Waiting for document {document_id} to be processed...")
    
    start_time = time.time()
    while time.time() - start_time < max_wait_time:
        status = check_document_status(document_id)
        
        if status == "processed":
            print(f"Document {document_id} processed successfully.")
            return True
        elif status == "error":
            print(f"Document {document_id} processing failed.")
            return False
        
        print(f"Document {document_id} is still being processed. Waiting...")
        time.sleep(10)
    
    print(f"Timed out waiting for document {document_id} to be processed.")
    return False

def get_document_results(document_id):
    """Get the processing results for a document"""
    url = f"{BASE_URL}/documents/{document_id}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            document = data.get("data", {})
            metadata = document.get("metadata", {})
            
            print(f"Document Type: {metadata.get('document_type', 'Unknown')}")
            print(f"Processing Method: {metadata.get('processing_method', 'Unknown')}")
            
            securities = metadata.get("securities", [])
            print(f"Securities Found: {len(securities)}")
            
            for i, security in enumerate(securities[:5]):  # Show first 5 securities
                print(f"  {i+1}. {security.get('name', 'Unknown')} (ISIN: {security.get('isin', 'Unknown')})")
                print(f"     Value: {security.get('value', 'Unknown')} {security.get('currency', '')}")
                print(f"     Weight: {security.get('weight', 'Unknown')}%")
            
            if len(securities) > 5:
                print(f"  ... and {len(securities) - 5} more securities")
            
            return metadata
        else:
            print(f"Failed to get document results: {data.get('error')}")
            return None
    else:
        print(f"Failed to get document results with status code {response.status_code}")
        return None

def run_test(file_name, config):
    """Run a test with a specific file and configuration"""
    print("\n" + "="*80)
    print(f"Testing {file_name} with {config['name']}")
    print("="*80)
    
    file_path = os.path.join(TEST_FILES_DIR, file_name)
    
    # Upload the document
    document_id = upload_document(file_path)
    if not document_id:
        return None
    
    # Process the document
    if not process_document(document_id, config):
        return None
    
    # Wait for processing to complete
    if not wait_for_processing(document_id):
        return None
    
    # Get the results
    results = get_document_results(document_id)
    
    return results

def main():
    """Main function to run the tests"""
    print("Starting document processing tests...")
    
    # Get the file to test from command line arguments
    if len(sys.argv) > 1:
        file_index = int(sys.argv[1])
        if file_index < 0 or file_index >= len(TEST_FILES):
            print(f"Invalid file index. Must be between 0 and {len(TEST_FILES) - 1}")
            return
        
        test_files = [TEST_FILES[file_index]]
    else:
        test_files = TEST_FILES
    
    # Get the config to test from command line arguments
    if len(sys.argv) > 2:
        config_index = int(sys.argv[2])
        if config_index < 0 or config_index >= len(AGENT_CONFIGS):
            print(f"Invalid config index. Must be between 0 and {len(AGENT_CONFIGS) - 1}")
            return
        
        configs = [AGENT_CONFIGS[config_index]]
    else:
        configs = AGENT_CONFIGS
    
    # Run the tests
    results = {}
    for file_name in test_files:
        file_results = {}
        for config in configs:
            result = run_test(file_name, config)
            file_results[config["name"]] = result
        results[file_name] = file_results
    
    # Save the results to a file
    with open("test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("\nTests completed. Results saved to test_results.json")

if __name__ == "__main__":
    main()
