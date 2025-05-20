#!/bin/bash
set -e

echo "=== FinDoc Analyzer Container Startup ==="
echo "Starting FinDoc Analyzer on port $PORT"
echo "Environment variables:"
echo "- NODE_ENV: ${NODE_ENV:-not set}"
echo "- PORT: ${PORT:-8080 (default)}"
echo "- MCP_ENABLED: ${MCP_ENABLED:-not set}"
echo "- AUGMENT_ENABLED: ${AUGMENT_ENABLED:-not set}"
echo "- Working directory: $(pwd)"
echo "- Files in current directory: $(ls -la)"

# Ensure port is properly set
export PORT=${PORT:-8080}

# Make the script executable
chmod +x start.sh 2>/dev/null || true

echo "Starting server on port $PORT..."
echo "=== Server Logs Below ==="

# Start the application with error handling
node server.js || {
  echo "!!! APPLICATION STARTUP FAILED !!!"
  echo "Last 50 lines of logs:"
  tail -n 50 /app/logs/error.log 2>/dev/null || echo "No error logs found"
  exit 1
}