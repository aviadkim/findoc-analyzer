#!/bin/bash
# Script to run the full suite of PDF processing tests

echo "FinDoc PDF Processing Test Suite"
echo "==============================="
echo ""

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if node is installed
if ! command_exists node; then
  echo "Error: Node.js is not installed. Please install Node.js to continue."
  exit 1
fi

# Check if necessary directories exist
if [ ! -d "services" ]; then
  echo "Error: services directory not found. Make sure you're in the project root."
  exit 1
fi

if [ ! -d "test-pdfs" ]; then
  echo "Error: test-pdfs directory not found. Creating..."
  mkdir -p test-pdfs
fi

if [ ! -d "pdf-test-results" ]; then
  echo "Creating pdf-test-results directory..."
  mkdir -p pdf-test-results
fi

# Check for required Node.js modules
echo "Checking Node.js dependencies..."
required_modules=("fs" "path" "util" "stream" "axios")
missing_modules=()

for module in "${required_modules[@]}"; do
  if ! node -e "try { require('$module'); } catch(e) { process.exit(1); }"; then
    missing_modules+=("$module")
  fi
done

if [ ${#missing_modules[@]} -gt 0 ]; then
  echo "Installing missing Node.js modules: ${missing_modules[*]}"
  npm install ${missing_modules[*]}
fi

# Start MCPs
echo "Starting MCP services..."
npx @modelcontextprotocol/server-sequential-thinking > ./mcp-logs/sequential-thinking.log 2>&1 &
SEQUENTIAL_PID=$!
echo $SEQUENTIAL_PID > ./mcp-logs/sequential-thinking.pid
echo "Started Sequential Thinking MCP with PID $SEQUENTIAL_PID"

npx @modelcontextprotocol/brave-search-mcp > ./mcp-logs/brave-search.log 2>&1 &
BRAVE_PID=$!
echo $BRAVE_PID > ./mcp-logs/brave-search.pid
echo "Started Brave Search MCP with PID $BRAVE_PID"

# Function to run a test with timeout
run_test_with_timeout() {
  local test_script=$1
  local timeout=$2
  local test_name=$3
  
  echo ""
  echo "Running $test_name..."
  echo "------------------------------"
  
  timeout $timeout node $test_script
  local exit_code=$?
  
  if [ $exit_code -eq 124 ]; then
    echo "⚠️ $test_name timed out after $timeout seconds"
    return 1
  elif [ $exit_code -ne 0 ]; then
    echo "❌ $test_name failed with exit code $exit_code"
    return 1
  else
    echo "✅ $test_name completed successfully"
    return 0
  fi
}

# Run the simple test first
run_test_with_timeout "test-pdf-simple.js" 120 "Simple PDF Test"
SIMPLE_TEST_RESULT=$?

# Run optimized test if simple test passed
if [ $SIMPLE_TEST_RESULT -eq 0 ]; then
  run_test_with_timeout "test-pdf-optimized.js" 300 "Optimized PDF Test"
  OPTIMIZED_TEST_RESULT=$?
else
  echo "Skipping optimized test because simple test failed"
  OPTIMIZED_TEST_RESULT=1
fi

# Start the PDF processing server
echo ""
echo "Starting PDF Processing Server for 30 seconds..."
echo "------------------------------"
node pdf-processing-server-optimized.js &
SERVER_PID=$!

# Wait 5 seconds for server to start
sleep 5

# Run a quick curl test to see if server is responsive
if command_exists curl; then
  echo "Testing server with curl..."
  curl -s http://localhost:8080/ > /dev/null
  CURL_RESULT=$?
  
  if [ $CURL_RESULT -eq 0 ]; then
    echo "✅ Server is running and responding at http://localhost:8080"
  else
    echo "❌ Server is not responding"
  fi
else
  echo "curl not found, skipping server test"
fi

# Keep server running for a short while for manual testing
echo "Server is running. Open http://localhost:8080 in your browser to test."
echo "Server will stop automatically in 30 seconds."
sleep 30

# Kill the server
kill $SERVER_PID
echo "Server stopped."

# Kill the MCPs
kill $SEQUENTIAL_PID
kill $BRAVE_PID
echo "MCP services stopped."

# Print summary
echo ""
echo "Test Summary"
echo "============"
echo "Simple PDF Test: $([ $SIMPLE_TEST_RESULT -eq 0 ] && echo "PASSED" || echo "FAILED")"
echo "Optimized PDF Test: $([ $OPTIMIZED_TEST_RESULT -eq 0 ] && echo "PASSED" || echo "FAILED")"
echo "PDF Processing Server: $([ $CURL_RESULT -eq 0 ] && echo "PASSED" || echo "FAILED")"
echo ""
echo "Results are available in the 'pdf-test-results' directory."
echo ""
echo "For more information, see the documentation files:"
echo "- README-PDF-PROCESSING.md - Overview of the system"
echo "- PDF-PROCESSING-GUIDE.md - Detailed guide"
echo "- PDF-PROCESSING-FINAL.md - Implementation status"
echo "- PDF-PROCESSING-SUMMARY.md - Testing summary"