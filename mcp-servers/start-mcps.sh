#!/bin/bash
echo "Starting MCP servers..."

# Start Firecrawl MCP
cd "$(dirname "$0")/firecrawl-mcp-server" && node dist/index.js --config ../firecrawl-config.json &
FIRECRAWL_PID=$!

# Start Context7 MCP
cd "$(dirname "$0")/context7" && node dist/index.js --config ../context7-config.json &
CONTEXT7_PID=$!

# Start Playwright MCP
cd "$(dirname "$0")/playwright-mcp" && node cli.js --config ../playwright-config.json &
PLAYWRIGHT_PID=$!

echo "MCP servers started successfully!"
echo "Firecrawl MCP running on port 8081 (PID: $FIRECRAWL_PID)"
echo "Context7 MCP running on port 8082 (PID: $CONTEXT7_PID)"
echo "Playwright MCP running on port 8083 (PID: $PLAYWRIGHT_PID)"

# Write PIDs to file for later cleanup
echo "$FIRECRAWL_PID $CONTEXT7_PID $PLAYWRIGHT_PID" > "$(dirname "$0")/mcp-pids.txt"

wait