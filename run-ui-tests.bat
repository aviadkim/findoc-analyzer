@echo off
echo Starting UI tests with MCP servers...

echo 1. Starting MCP servers
call mcp-servers\start-mcps.bat

echo 2. Waiting for servers to initialize (10 seconds)
timeout /t 10

echo 3. Running Firecrawl UI test
node firecrawl-mcp-ui-test.js

echo 4. Running Playwright UI test
node playwright-mcp-ui-test.js

echo 5. Stopping MCP servers
call mcp-servers\stop-mcps.bat

echo Tests completed! Check the test results folders.