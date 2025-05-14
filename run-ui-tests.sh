#!/bin/bash
echo "Starting UI tests with MCP servers..."

echo "1. Starting MCP servers"
./mcp-servers/start-mcps.sh &
MCP_PID=$!

echo "2. Waiting for servers to initialize (10 seconds)"
sleep 10

echo "3. Running Firecrawl UI test"
node firecrawl-mcp-ui-test.js

echo "4. Running Playwright UI test"
node playwright-mcp-ui-test.js

echo "5. Stopping MCP servers"
kill $MCP_PID
./mcp-servers/stop-mcps.sh

echo "Tests completed! Check the test results folders."