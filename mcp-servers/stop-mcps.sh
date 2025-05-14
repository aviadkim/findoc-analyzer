#!/bin/bash
echo "Stopping MCP servers..."

if [ -f "$(dirname "$0")/mcp-pids.txt" ]; then
  while read -r pid; do
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "Stopping MCP with PID: $pid"
      kill "$pid"
    fi
  done < "$(dirname "$0")/mcp-pids.txt"
  rm "$(dirname "$0")/mcp-pids.txt"
  echo "All MCP servers stopped"
else
  echo "No PID file found. MCP servers might not be running."
fi