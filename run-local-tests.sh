#!/bin/bash
# Run local tests for FinDoc Analyzer SaaS
# This script runs a series of tests to validate the application

# Exit immediately if a command exits with a non-zero status
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
function check_requirements() {
  echo -e "${BLUE}Checking requirements...${NC}"
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Error:${NC} Node.js is not installed"
    exit 1
  fi
  
  # Check npm
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error:${NC} npm is not installed"
    exit 1
  fi
  
  echo -e "${GREEN}All requirements are met.${NC}"
}

# Run the health check test
function test_health_check() {
  echo -e "${BLUE}Running health check test...${NC}"
  
  # Start the server in the background
  node server.js &
  SERVER_PID=$!
  
  # Wait for the server to start
  sleep 3
  
  # Test the health check endpoint
  RESPONSE=$(curl -s http://localhost:8080/api/health)
  
  # Kill the server
  kill $SERVER_PID
  
  # Check the response
  if echo "$RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}Health check test passed.${NC}"
  else
    echo -e "${RED}Health check test failed.${NC}"
    echo "Response: $RESPONSE"
    exit 1
  fi
}

# Test API key management
function test_api_key_management() {
  echo -e "${BLUE}Testing API key management...${NC}"
  
  # Start the server in the background
  NODE_ENV=development node server.js &
  SERVER_PID=$!
  
  # Wait for the server to start
  sleep 3
  
  # Test storing an API key
  echo -e "Testing store API key..."
  STORE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/keys/gemini \
    -H "Content-Type: application/json" \
    -d '{"apiKey": "gemini_testkeyabcdefghijklmnopqrstuvwxyz1234567890"}')
  
  # Test getting API key status
  echo -e "Testing get API key status..."
  STATUS_RESPONSE=$(curl -s http://localhost:8080/api/keys/status/gemini)
  
  # Test deleting API key
  echo -e "Testing delete API key..."
  DELETE_RESPONSE=$(curl -s -X DELETE http://localhost:8080/api/keys/gemini)
  
  # Kill the server
  kill $SERVER_PID
  
  # Check the responses
  if echo "$STORE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}API key store test passed.${NC}"
  else
    echo -e "${RED}API key store test failed.${NC}"
    echo "Response: $STORE_RESPONSE"
    exit 1
  fi
  
  if echo "$STATUS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}API key status test passed.${NC}"
  else
    echo -e "${RED}API key status test failed.${NC}"
    echo "Response: $STATUS_RESPONSE"
    exit 1
  fi
  
  if echo "$DELETE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}API key delete test passed.${NC}"
  else
    echo -e "${RED}API key delete test failed.${NC}"
    echo "Response: $DELETE_RESPONSE"
    exit 1
  fi
}

# Test document processing
function test_document_processing() {
  echo -e "${BLUE}Testing document processing...${NC}"
  
  # Create a test directory for uploads
  mkdir -p test_uploads
  
  # Create a simple PDF for testing
  echo -e "Creating test PDF..."
  echo "%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 6 0 R >>
endobj
4 0 obj
<< /Font << /F1 5 0 R >> >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length 44 >>
stream
BT /F1 24 Tf 100 700 Td (Test Document) Tj ET
endstream
endobj
xref
0 7
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000118 00000 n
0000000217 00000 n
0000000258 00000 n
0000000326 00000 n
trailer << /Size 7 /Root 1 0 R >>
startxref
420
%%EOF" > test_uploads/test.pdf
  
  # Start the server in the background
  NODE_ENV=development UPLOAD_FOLDER=./test_uploads node server.js &
  SERVER_PID=$!
  
  # Wait for the server to start
  sleep 3
  
  # Upload the test PDF
  echo -e "Uploading test PDF..."
  UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:8080/api/documents \
    -H "Content-Type: application/json" \
    -d '{"fileName": "test.pdf", "documentType": "pdf"}')
  
  # Extract document ID from the response
  DOC_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  
  if [ -z "$DOC_ID" ]; then
    echo -e "${RED}Document upload failed. Could not get document ID.${NC}"
    kill $SERVER_PID
    exit 1
  fi
  
  # Process the document
  echo -e "Processing document..."
  PROCESS_RESPONSE=$(curl -s -X POST http://localhost:8080/api/documents/process \
    -H "Content-Type: application/json" \
    -d "{\"documentId\": \"$DOC_ID\"}")
  
  # Get document status
  echo -e "Getting document status..."
  sleep 2  # Wait for processing to start
  STATUS_RESPONSE=$(curl -s http://localhost:8080/api/documents/$DOC_ID/status)
  
  # Kill the server
  kill $SERVER_PID
  
  # Clean up
  rm -rf test_uploads
  
  # Check the responses
  if echo "$UPLOAD_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}Document upload test passed.${NC}"
  else
    echo -e "${RED}Document upload test failed.${NC}"
    echo "Response: $UPLOAD_RESPONSE"
    exit 1
  fi
  
  if echo "$PROCESS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}Document processing test passed.${NC}"
  else
    echo -e "${RED}Document processing test failed.${NC}"
    echo "Response: $PROCESS_RESPONSE"
    exit 1
  fi
  
  if echo "$STATUS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}Document status test passed.${NC}"
  else
    echo -e "${RED}Document status test failed.${NC}"
    echo "Response: $STATUS_RESPONSE"
    exit 1
  fi
}

# Main function
function main() {
  echo -e "${BLUE}Running local tests for FinDoc Analyzer SaaS${NC}"
  echo
  
  # Check requirements
  check_requirements
  
  # Run tests
  test_health_check
  test_api_key_management
  test_document_processing
  
  echo
  echo -e "${GREEN}All tests passed!${NC}"
}

# Run the main function
main

exit 0