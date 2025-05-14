#!/bin/bash
# Start essential MCP servers

# Load environment variables
source .env

# Create logs directory
mkdir -p mcp-logs

echo "Starting Brave Search MCP..."
BRAVE_API_KEY=$BRAVE_API_KEY npx brave-search-mcp > mcp-logs/brave-search.log 2>&1 &
echo $! > mcp-logs/brave-search.pid

echo "Starting Sequential Thinking MCP..."
npx @modelcontextprotocol/server-sequential-thinking > mcp-logs/sequential-thinking.log 2>&1 &
echo $! > mcp-logs/sequential-thinking.pid

echo "MCP servers started! Check mcp-logs directory for logs."
echo "To stop servers, run: ./stop-mcps.sh"
