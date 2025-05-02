@echo off
echo ===================================================
echo Starting All Installed MCP Servers
echo ===================================================
echo.

REM Create a log directory if it doesn't exist
mkdir logs 2>nul

REM Get current date and time for log files
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

REM Function to start an MCP server
:start_mcp
echo Starting %~1...
start "%~1" cmd /c "%~2 > logs\%~1_%timestamp%.log 2>&1"
timeout /t 1 /nobreak > nul
goto :eof

REM Start all installed MCP servers with exact configurations
call :start_mcp "Brave_Search_MCP" "npx -y brave-search-mcp"
call :start_mcp "GitHub_MCP" "npx -y github-mcp"
call :start_mcp "SQLite_MCP" "cmd /c npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db"
call :start_mcp "Magic_MCP" "cmd /c npx -y @21st-dev/magic@latest"
call :start_mcp "Supabase_MCP" "cmd /c npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN"
call :start_mcp "Browser_Tools_MCP" "cmd /c npx -y @agentdeskai/browser-tools-mcp@latest"
call :start_mcp "Firecrawl_MCP" "npx -y firecrawl-mcp"
call :start_mcp "Puppeteer_MCP" "cmd /c npx -y @modelcontextprotocol/server-puppeteer"
call :start_mcp "Git_MCP" "python -m mcp_server_git"
call :start_mcp "Filesystem_MCP" "npx -y @modelcontextprotocol/server-filesystem"
call :start_mcp "VSCode_MCP" "npx -y vscode-mcp"
call :start_mcp "Fetch_MCP" "npx -y @modelcontextprotocol/server-fetch"
call :start_mcp "PostgreSQL_MCP" "npx -y @modelcontextprotocol/server-postgres"
call :start_mcp "Redis_MCP" "npx -y @modelcontextprotocol/server-redis"
call :start_mcp "Sequential_Thinking_MCP" "npx -y @modelcontextprotocol/server-sequentialthinking"
call :start_mcp "Memory_MCP" "npx -y @modelcontextprotocol/server-memory"
call :start_mcp "Qdrant_MCP" "python -m qdrant_mcp"
call :start_mcp "Langchain_MCP" "npx -y langchain-mcp"
call :start_mcp "Semgrep_MCP" "python -m semgrep_mcp"
call :start_mcp "ESLint_MCP" "npx -y eslint-mcp"
call :start_mcp "TypeScript_MCP" "npx -y typescript-mcp"
call :start_mcp "Prettier_MCP" "npx -y prettier-mcp"
call :start_mcp "Jest_MCP" "npx -y jest-mcp"
call :start_mcp "Docker_MCP" "npx -y docker-mcp"
call :start_mcp "Kubernetes_MCP" "npx -y kubernetes-mcp"
call :start_mcp "Time_MCP" "npx -y @modelcontextprotocol/server-time"

echo.
echo ===================================================
echo All MCP servers started!
echo ===================================================
echo.
echo Each MCP server is running in its own window.
echo Log files are being saved to the logs directory.
echo.
echo To stop all MCP servers, you can:
echo 1. Close each terminal window manually
echo 2. Run stop-all-mcp.bat
echo 3. Use Task Manager to end all cmd.exe processes
echo.
echo Press any key to exit...
pause > nul
