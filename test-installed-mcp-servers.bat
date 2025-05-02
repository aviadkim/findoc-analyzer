@echo off
echo ===================================================
echo Testing Installed MCP Servers
echo ===================================================
echo.

set LOG_FILE=mcp-test-results.log
echo MCP Server Test Results > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Function to test an MCP server
:test_mcp
echo Testing %~1...
echo Testing %~1... >> %LOG_FILE%
timeout /t 1 /nobreak > nul
start /b /wait cmd /c "%~2 --help > temp_output.txt 2>&1 || echo Failed > temp_status.txt"
if exist temp_status.txt (
    echo [FAILED] %~1 is not working correctly.
    echo [FAILED] %~1 is not working correctly. >> %LOG_FILE%
    del temp_status.txt
) else (
    echo [SUCCESS] %~1 is working correctly.
    echo [SUCCESS] %~1 is working correctly. >> %LOG_FILE%
)
if exist temp_output.txt del temp_output.txt
echo. >> %LOG_FILE%
goto :eof

REM Test all installed MCP servers
call :test_mcp "Brave Search MCP" "npx -y brave-search-mcp"
call :test_mcp "GitHub MCP" "npx -y github-mcp"
call :test_mcp "SQLite MCP" "npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db"
call :test_mcp "Magic MCP" "npx -y @21st-dev/magic@latest"
call :test_mcp "Supabase MCP" "npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN"
call :test_mcp "Browser Tools MCP" "npx -y @agentdeskai/browser-tools-mcp@latest"
call :test_mcp "Firecrawl MCP" "npx -y firecrawl-mcp"
call :test_mcp "Puppeteer MCP" "npx -y @modelcontextprotocol/server-puppeteer"
call :test_mcp "Git MCP" "python -m mcp_server_git"
call :test_mcp "Filesystem MCP" "npx -y @modelcontextprotocol/server-filesystem"
call :test_mcp "VSCode MCP" "npx -y vscode-mcp"
call :test_mcp "Fetch MCP" "npx -y @modelcontextprotocol/server-fetch"
call :test_mcp "PostgreSQL MCP" "npx -y @modelcontextprotocol/server-postgres"
call :test_mcp "Redis MCP" "npx -y @modelcontextprotocol/server-redis"
call :test_mcp "Sequential Thinking MCP" "npx -y @modelcontextprotocol/server-sequentialthinking"
call :test_mcp "Memory MCP" "npx -y @modelcontextprotocol/server-memory"
call :test_mcp "Qdrant MCP" "python -m qdrant_mcp"
call :test_mcp "Langchain MCP" "npx -y langchain-mcp"
call :test_mcp "Semgrep MCP" "python -m semgrep_mcp"
call :test_mcp "ESLint MCP" "npx -y eslint-mcp"
call :test_mcp "TypeScript MCP" "npx -y typescript-mcp"
call :test_mcp "Prettier MCP" "npx -y prettier-mcp"
call :test_mcp "Jest MCP" "npx -y jest-mcp"
call :test_mcp "Docker MCP" "npx -y docker-mcp"
call :test_mcp "Kubernetes MCP" "npx -y kubernetes-mcp"
call :test_mcp "Time MCP" "npx -y @modelcontextprotocol/server-time"

echo.
echo ===================================================
echo Testing Complete!
echo ===================================================
echo.
echo Test results have been saved to %LOG_FILE%
echo.
echo Press any key to exit...
pause > nul
