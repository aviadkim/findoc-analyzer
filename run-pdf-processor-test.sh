#!/bin/bash

# Run the document processor test script
echo "Running document processor test..."

# Check if a file is provided
if [ -n "$1" ]; then
  TEST_FILE="$1"
else
  # Use default messos.pdf file
  TEST_FILE="./messos.pdf"
fi

# Check if the file exists
if [ ! -f "$TEST_FILE" ]; then
  echo "Error: Test file not found: $TEST_FILE"
  echo "Please provide a valid PDF file path."
  exit 1
fi

# Run the test script
echo "Testing with file: $TEST_FILE"
node test-document-processor.js "$TEST_FILE"

# Check the result
if [ $? -eq 0 ]; then
  echo ""
  echo "Test completed successfully!"
  echo "Check test-output.json for full results."
else
  echo ""
  echo "Test failed!"
fi