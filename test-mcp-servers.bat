@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo MCP Server Testing
echo ===================================================
echo.

set LOG_FILE=mcp-test-results.txt
echo MCP Server Test Results > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a directory for logs
mkdir logs 2>nul

REM Function to test an MCP server
:test_mcp
echo.
echo ===================================================
echo Testing: %~1
echo Command: %~2
echo ===================================================
echo.
echo Testing: %~1 >> %LOG_FILE%
echo Command: %~2 >> %LOG_FILE%

REM Run the command with a timeout
start /b cmd /c "%~2 > logs\%~1.log 2>&1"
set PID=!ERRORLEVEL!
timeout /t 5 /nobreak > nul
tasklist | find "node.exe" > nul
if !ERRORLEVEL! EQU 0 (
    echo [SUCCESS] %~1 started successfully.
    echo [SUCCESS] %~1 started successfully. >> %LOG_FILE%
    taskkill /F /PID !PID! > nul 2>&1
) else (
    echo [FAILED] %~1 failed to start.
    echo [FAILED] %~1 failed to start. >> %LOG_FILE%
    echo Check logs\%~1.log for details.
    echo Check logs\%~1.log for details. >> %LOG_FILE%
)

echo. >> %LOG_FILE%
goto :eof

echo Testing all MCP servers one by one...
echo.

REM Test each MCP server with the exact command from Augment configuration
call :test_mcp "Brave_Search_MCP" "npx -y brave-search-mcp"
call :test_mcp "GitHub_MCP" "npx -y github-mcp"
call :test_mcp "SQLite_MCP" "cmd /c npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db"
call :test_mcp "Magic_MCP" "cmd /c npx -y @21st-dev/magic@latest"
call :test_mcp "Supabase_MCP" "cmd /c npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN"
call :test_mcp "Browser_Tools_MCP" "cmd /c npx -y @agentdeskai/browser-tools-mcp@latest"
call :test_mcp "Firecrawl_MCP" "npx -y firecrawl-mcp"
call :test_mcp "Puppeteer_MCP" "cmd /c npx -y @modelcontextprotocol/server-puppeteer"
call :test_mcp "Git_MCP" "python -m mcp_server_git"
call :test_mcp "Filesystem_MCP" "npx -y @modelcontextprotocol/server-filesystem"
call :test_mcp "VSCode_MCP" "npx -y vscode-mcp"
call :test_mcp "Fetch_MCP" "npx -y @modelcontextprotocol/server-fetch"
call :test_mcp "PostgreSQL_MCP" "npx -y @modelcontextprotocol/server-postgres"
call :test_mcp "Redis_MCP" "npx -y @modelcontextprotocol/server-redis"
call :test_mcp "Sequential_Thinking_MCP" "npx -y @modelcontextprotocol/server-sequentialthinking"
call :test_mcp "Memory_MCP" "npx -y @modelcontextprotocol/server-memory"
call :test_mcp "Qdrant_MCP" "python -m qdrant_mcp"
call :test_mcp "Langchain_MCP" "npx -y langchain-mcp"
call :test_mcp "Semgrep_MCP" "python -m semgrep_mcp"
call :test_mcp "ESLint_MCP" "npx -y eslint-mcp"
call :test_mcp "TypeScript_MCP" "npx -y typescript-mcp"
call :test_mcp "Prettier_MCP" "npx -y prettier-mcp"
call :test_mcp "Jest_MCP" "npx -y jest-mcp"
call :test_mcp "Docker_MCP" "npx -y docker-mcp"
call :test_mcp "Kubernetes_MCP" "npx -y kubernetes-mcp"
call :test_mcp "Time_MCP" "npx -y @modelcontextprotocol/server-time"

echo.
echo ===================================================
echo Testing Complete!
echo ===================================================
echo.
echo Test results have been saved to %LOG_FILE%
echo Detailed logs for each MCP server are in the logs directory.
echo.
echo Press any key to view the test results...
pause > nul
type %LOG_FILE%
echo.
echo Press any key to exit...
pause > nul
