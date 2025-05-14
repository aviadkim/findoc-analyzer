#!/bin/bash
# Run FinDoc Analyzer with MCPs enabled
# This script starts the MCP servers and runs the application with MCP integration

set -e  # Exit on error

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting FinDoc Analyzer with MCP integration ===${NC}"

# Check if MCPs are already running
MCP_RUNNING=false
if [ -d "mcp-logs" ]; then
  for pid_file in mcp-logs/*.pid; do
    if [ -f "$pid_file" ]; then
      PID=$(cat "$pid_file")
      SERVER_NAME=$(basename "$pid_file" | sed 's/\.pid$//')
      
      if ps -p $PID > /dev/null; then
        echo -e "${GREEN}$SERVER_NAME MCP is already running (PID: $PID)${NC}"
        MCP_RUNNING=true
      else
        echo -e "${YELLOW}$SERVER_NAME MCP has a stale PID file, cleaning up...${NC}"
        rm "$pid_file"
      fi
    fi
  done
fi

# Start MCPs if not already running
if [ "$MCP_RUNNING" = false ]; then
  echo -e "${YELLOW}Starting MCP servers...${NC}"
  ./start-essential-mcps.sh
  
  # Wait a moment for MCPs to initialize
  echo -e "${YELLOW}Waiting for MCPs to initialize...${NC}"
  sleep 3
else
  echo -e "${GREEN}Some MCPs are already running. Continuing...${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating default .env file...${NC}"
  cp .env.example .env || echo -e "${RED}No .env.example file found. Please create a .env file manually.${NC}"
fi

# Set MCP environment variables
export USE_MCP=true
export MCP_DEBUG=true

# Test MCP functionality
echo -e "${YELLOW}Testing MCP functionality...${NC}"
node test-mcps-simple.js

# Run document processor test with MCP
echo -e "${YELLOW}Running document processor test with MCP...${NC}"
node test-mcp-document-processor.js

# Check if server.js exists
if [ -f "server.js" ]; then
  # Start the server with MCP enabled
  echo -e "${GREEN}Starting FinDoc Analyzer server with MCP integration...${NC}"
  echo -e "${YELLOW}Server will be available at http://localhost:3000${NC}"
  echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
  
  # Run the server
  USE_MCP=true node server.js
else
  echo -e "${RED}server.js not found. Cannot start the server.${NC}"
  echo -e "${YELLOW}You can try:${NC}"
  echo -e "1. Running document tests only: ${BLUE}node test-mcp-document-processor.js${NC}"
  echo -e "2. Creating a server.js file with: ${BLUE}npm init${NC}"
fi

# Note: The server will keep running in the foreground
# When the user stops the server with Ctrl+C, 
# we don't need to stop the MCPs automatically
# They can run ./stop-mcps.sh if needed