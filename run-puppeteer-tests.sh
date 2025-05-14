#!/bin/bash
# FinDoc Analyzer Puppeteer Test Runner
# This script runs the Puppeteer tests with different configurations

# Check if node is installed
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed. Please install Node.js and try again."
  exit 1
fi

# Check if puppeteer is installed
if [ ! -d "node_modules/puppeteer" ]; then
  echo "Puppeteer is not installed. Installing puppeteer..."
  npm install puppeteer axios
fi

# Set default values
BASE_URL="http://localhost:8080"
HEADLESS="true"
CREATE_SAMPLES="true"
TEST_LOCAL="true"
TEST_CLOUD="false"
CLOUD_URL=""
SERVER_PID=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --local)
      TEST_LOCAL="true"
      TEST_CLOUD="false"
      shift
      ;;
    --cloud)
      TEST_LOCAL="false"
      TEST_CLOUD="true"
      if [[ $# -gt 1 && ! "$2" =~ ^-- ]]; then
        CLOUD_URL="$2"
        shift
      fi
      shift
      ;;
    --both)
      TEST_LOCAL="true"
      TEST_CLOUD="true"
      if [[ $# -gt 1 && ! "$2" =~ ^-- ]]; then
        CLOUD_URL="$2"
        shift
      fi
      shift
      ;;
    --headless)
      if [[ $# -gt 1 && ! "$2" =~ ^-- ]]; then
        HEADLESS="$2"
        shift
      fi
      shift
      ;;
    --no-samples)
      CREATE_SAMPLES="false"
      shift
      ;;
    --help)
      echo "FinDoc Analyzer Puppeteer Test Runner"
      echo
      echo "Usage: ./run-puppeteer-tests.sh [options]"
      echo
      echo "Options:"
      echo "  --local                 Test local deployment only (default)"
      echo "  --cloud [url]           Test cloud deployment only"
      echo "  --both [url]            Test both local and cloud deployments"
      echo "  --headless true|false   Run in headless mode (default: true)"
      echo "  --no-samples            Don't create sample documents before testing"
      echo "  --help                  Show this help message"
      echo
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information."
      exit 1
      ;;
  esac
done

# Function to clean up server process
cleanup() {
  if [ -n "$SERVER_PID" ]; then
    echo "Stopping local server..."
    kill $SERVER_PID
  fi
}

# Register cleanup function
trap cleanup EXIT

# Check if we need to create a server process
if [ "$TEST_LOCAL" = "true" ]; then
  echo "Starting local server..."
  node server.js &
  SERVER_PID=$!
  
  # Wait for server to start
  sleep 5
fi

# Run tests against local server if requested
if [ "$TEST_LOCAL" = "true" ]; then
  echo "Running tests against local server..."
  node fintest-puppeteer.js --url http://localhost:8080 --headless $HEADLESS --create-samples $CREATE_SAMPLES --results-dir ./test-results/local
fi

# Run tests against cloud server if requested
if [ "$TEST_CLOUD" = "true" ]; then
  if [ -z "$CLOUD_URL" ]; then
    echo "Cloud URL is required for cloud testing."
    echo "Usage: ./run-puppeteer-tests.sh --cloud [url]"
    if [ "$TEST_LOCAL" = "true" ]; then
      # Don't exit if we've already run local tests
      exit 0
    fi
    exit 1
  fi
  
  echo "Running tests against cloud server: $CLOUD_URL"
  node fintest-puppeteer.js --url "$CLOUD_URL" --headless $HEADLESS --create-samples $CREATE_SAMPLES --results-dir ./test-results/cloud
fi

echo "Tests completed. See test-results directory for reports."