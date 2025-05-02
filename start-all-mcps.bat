@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Starting All MCP Servers
echo ===================================================
echo.

REM Create a directory for logs if it doesn't exist
mkdir logs 2>nul

REM Function to start an MCP server
:start_mcp
echo Starting %~1...
start "MCP: %~1" cmd /c "%~2 > logs\%~1.log 2>&1"
echo [SUCCESS] Started %~1.
goto :eof

echo Starting MCP servers...
echo.

REM Start npm-based MCP servers
call :start_mcp "Memory MCP" "npx -y @modelcontextprotocol/server-memory"
call :start_mcp "GitHub MCP" "npx -y @modelcontextprotocol/server-github"
call :start_mcp "Filesystem MCP" "npx -y @modelcontextprotocol/server-filesystem"
call :start_mcp "PostgreSQL MCP" "npx -y @modelcontextprotocol/server-postgres"
call :start_mcp "Redis MCP" "npx -y @modelcontextprotocol/server-redis"
call :start_mcp "Sequential Thinking MCP" "npx -y @modelcontextprotocol/server-sequentialthinking"
call :start_mcp "Puppeteer MCP" "npx -y @modelcontextprotocol/server-puppeteer"
call :start_mcp "Fetch MCP" "npx -y @modelcontextprotocol/server-fetch"
call :start_mcp "Time MCP" "npx -y @modelcontextprotocol/server-time"
call :start_mcp "Magic MCP" "npx -y @21st-dev/magic@latest"
call :start_mcp "Supabase MCP" "npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN"
call :start_mcp "Browser Tools MCP" "npx -y @agentdeskai/browser-tools-mcp@latest"
call :start_mcp "Firecrawl MCP" "set FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY && npx -y firecrawl-mcp"
call :start_mcp "VSCode MCP" "npx -y vscode-mcp"
call :start_mcp "Langchain MCP" "npx -y langchain-mcp"
call :start_mcp "ESLint MCP" "npx -y eslint-mcp"
call :start_mcp "TypeScript MCP" "npx -y typescript-mcp"
call :start_mcp "Prettier MCP" "npx -y prettier-mcp"
call :start_mcp "Jest MCP" "npx -y jest-mcp"
call :start_mcp "Docker MCP" "npx -y docker-mcp"
call :start_mcp "Kubernetes MCP" "npx -y kubernetes-mcp"

REM Start Python-based MCP servers
call :start_mcp "SQLite MCP" "C:\Users\aviad\AppData\Roaming\Python\Python313\Scripts\mcp-server-sqlite.exe --db-path C:\Users\aviad\test.db"
call :start_mcp "Git MCP" "python -m mcp_server_git"
call :start_mcp "Qdrant MCP" "python -m qdrant_mcp"
call :start_mcp "Semgrep MCP" "python -m semgrep_mcp"

REM Start Brave Search MCP
call :start_mcp "Brave Search MCP" "cd C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server && set BRAVE_API_KEY=YOUR_BRAVE_API_KEY && node build/index.js"

echo.
echo ===================================================
echo All MCP Servers Started!
echo ===================================================
echo.
echo All MCP servers have been started in separate windows.
echo Logs are being written to the logs directory.
echo.
echo Press any key to exit...
pause > nul
