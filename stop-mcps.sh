#!/bin/bash
# Stop MCP servers

# Check if pid files exist
if [ -d mcp-logs ]; then
  for pid_file in mcp-logs/*.pid; do
    if [ -f "$pid_file" ]; then
      PID=$(cat "$pid_file")
      SERVER_NAME=$(basename "$pid_file" | sed 's/\.pid$//')
      
      echo "Stopping $SERVER_NAME MCP (PID: $PID)..."
      kill $PID 2>/dev/null || echo "Process not running"
      rm "$pid_file"
    fi
  done
else
  echo "No MCP logs directory found"
fi

echo "All MCP servers stopped"
