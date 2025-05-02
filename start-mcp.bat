@echo off
setlocal enabledelayedexpansion

if "%~1"=="" (
    echo Usage: start-mcp.bat [mcp-name]
    echo.
    echo Available MCP names:
    echo   memory        - Memory MCP
    echo   github        - GitHub MCP
    echo   sqlite        - SQLite MCP
    echo   brave-search  - Brave Search MCP
    echo   git           - Git MCP
    echo   filesystem    - Filesystem MCP
    echo   postgres      - PostgreSQL MCP
    echo   redis         - Redis MCP
    echo   sequential    - Sequential Thinking MCP
    echo   puppeteer     - Puppeteer MCP
    echo   fetch         - Fetch MCP
    echo   time          - Time MCP
    echo   magic         - Magic MCP
    echo   supabase      - Supabase MCP
    echo   browser-tools - Browser Tools MCP
    echo   firecrawl     - Firecrawl MCP
    echo   vscode        - VSCode MCP
    echo   langchain     - Langchain MCP
    echo   qdrant        - Qdrant MCP
    echo   semgrep       - Semgrep MCP
    echo   eslint        - ESLint MCP
    echo   typescript    - TypeScript MCP
    echo   prettier      - Prettier MCP
    echo   jest          - Jest MCP
    echo   docker        - Docker MCP
    echo   kubernetes    - Kubernetes MCP
    echo.
    exit /b 1
)

REM Create a directory for logs if it doesn't exist
mkdir logs 2>nul

set MCP_NAME=%~1

echo ===================================================
echo Starting %MCP_NAME% MCP
echo ===================================================
echo.

if /i "%MCP_NAME%"=="memory" (
    echo Starting Memory MCP...
    start "Memory MCP" cmd /c "npx -y @modelcontextprotocol/server-memory > logs\memory-mcp.log 2>&1"
    echo [SUCCESS] Started Memory MCP.
) else if /i "%MCP_NAME%"=="github" (
    echo Starting GitHub MCP...
    start "GitHub MCP" cmd /c "npx -y @modelcontextprotocol/server-github > logs\github-mcp.log 2>&1"
    echo [SUCCESS] Started GitHub MCP.
) else if /i "%MCP_NAME%"=="sqlite" (
    echo Starting SQLite MCP...
    start "SQLite MCP" cmd /c "C:\Users\aviad\AppData\Roaming\Python\Python313\Scripts\mcp-server-sqlite.exe --db-path C:\Users\aviad\test.db > logs\sqlite-mcp.log 2>&1"
    echo [SUCCESS] Started SQLite MCP.
) else if /i "%MCP_NAME%"=="brave-search" (
    echo Starting Brave Search MCP...
    start "Brave Search MCP" cmd /c "cd C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server && set BRAVE_API_KEY=YOUR_BRAVE_API_KEY && node build/index.js > logs\brave-search-mcp.log 2>&1"
    echo [SUCCESS] Started Brave Search MCP.
) else if /i "%MCP_NAME%"=="git" (
    echo Starting Git MCP...
    start "Git MCP" cmd /c "python -m mcp_server_git > logs\git-mcp.log 2>&1"
    echo [SUCCESS] Started Git MCP.
) else if /i "%MCP_NAME%"=="filesystem" (
    echo Starting Filesystem MCP...
    start "Filesystem MCP" cmd /c "npx -y @modelcontextprotocol/server-filesystem > logs\filesystem-mcp.log 2>&1"
    echo [SUCCESS] Started Filesystem MCP.
) else if /i "%MCP_NAME%"=="postgres" (
    echo Starting PostgreSQL MCP...
    start "PostgreSQL MCP" cmd /c "npx -y @modelcontextprotocol/server-postgres > logs\postgres-mcp.log 2>&1"
    echo [SUCCESS] Started PostgreSQL MCP.
) else if /i "%MCP_NAME%"=="redis" (
    echo Starting Redis MCP...
    start "Redis MCP" cmd /c "npx -y @modelcontextprotocol/server-redis > logs\redis-mcp.log 2>&1"
    echo [SUCCESS] Started Redis MCP.
) else if /i "%MCP_NAME%"=="sequential" (
    echo Starting Sequential Thinking MCP...
    start "Sequential Thinking MCP" cmd /c "npx -y @modelcontextprotocol/server-sequentialthinking > logs\sequential-mcp.log 2>&1"
    echo [SUCCESS] Started Sequential Thinking MCP.
) else if /i "%MCP_NAME%"=="puppeteer" (
    echo Starting Puppeteer MCP...
    start "Puppeteer MCP" cmd /c "npx -y @modelcontextprotocol/server-puppeteer > logs\puppeteer-mcp.log 2>&1"
    echo [SUCCESS] Started Puppeteer MCP.
) else if /i "%MCP_NAME%"=="fetch" (
    echo Starting Fetch MCP...
    start "Fetch MCP" cmd /c "npx -y @modelcontextprotocol/server-fetch > logs\fetch-mcp.log 2>&1"
    echo [SUCCESS] Started Fetch MCP.
) else if /i "%MCP_NAME%"=="time" (
    echo Starting Time MCP...
    start "Time MCP" cmd /c "npx -y @modelcontextprotocol/server-time > logs\time-mcp.log 2>&1"
    echo [SUCCESS] Started Time MCP.
) else if /i "%MCP_NAME%"=="magic" (
    echo Starting Magic MCP...
    start "Magic MCP" cmd /c "npx -y @21st-dev/magic@latest > logs\magic-mcp.log 2>&1"
    echo [SUCCESS] Started Magic MCP.
) else if /i "%MCP_NAME%"=="supabase" (
    echo Starting Supabase MCP...
    start "Supabase MCP" cmd /c "npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN > logs\supabase-mcp.log 2>&1"
    echo [SUCCESS] Started Supabase MCP.
) else if /i "%MCP_NAME%"=="browser-tools" (
    echo Starting Browser Tools MCP...
    start "Browser Tools MCP" cmd /c "npx -y @agentdeskai/browser-tools-mcp@latest > logs\browser-tools-mcp.log 2>&1"
    echo [SUCCESS] Started Browser Tools MCP.
) else if /i "%MCP_NAME%"=="firecrawl" (
    echo Starting Firecrawl MCP...
    start "Firecrawl MCP" cmd /c "set FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY && npx -y firecrawl-mcp > logs\firecrawl-mcp.log 2>&1"
    echo [SUCCESS] Started Firecrawl MCP.
) else if /i "%MCP_NAME%"=="vscode" (
    echo Starting VSCode MCP...
    start "VSCode MCP" cmd /c "npx -y vscode-mcp > logs\vscode-mcp.log 2>&1"
    echo [SUCCESS] Started VSCode MCP.
) else if /i "%MCP_NAME%"=="langchain" (
    echo Starting Langchain MCP...
    start "Langchain MCP" cmd /c "npx -y langchain-mcp > logs\langchain-mcp.log 2>&1"
    echo [SUCCESS] Started Langchain MCP.
) else if /i "%MCP_NAME%"=="qdrant" (
    echo Starting Qdrant MCP...
    start "Qdrant MCP" cmd /c "python -m qdrant_mcp > logs\qdrant-mcp.log 2>&1"
    echo [SUCCESS] Started Qdrant MCP.
) else if /i "%MCP_NAME%"=="semgrep" (
    echo Starting Semgrep MCP...
    start "Semgrep MCP" cmd /c "python -m semgrep_mcp > logs\semgrep-mcp.log 2>&1"
    echo [SUCCESS] Started Semgrep MCP.
) else if /i "%MCP_NAME%"=="eslint" (
    echo Starting ESLint MCP...
    start "ESLint MCP" cmd /c "npx -y eslint-mcp > logs\eslint-mcp.log 2>&1"
    echo [SUCCESS] Started ESLint MCP.
) else if /i "%MCP_NAME%"=="typescript" (
    echo Starting TypeScript MCP...
    start "TypeScript MCP" cmd /c "npx -y typescript-mcp > logs\typescript-mcp.log 2>&1"
    echo [SUCCESS] Started TypeScript MCP.
) else if /i "%MCP_NAME%"=="prettier" (
    echo Starting Prettier MCP...
    start "Prettier MCP" cmd /c "npx -y prettier-mcp > logs\prettier-mcp.log 2>&1"
    echo [SUCCESS] Started Prettier MCP.
) else if /i "%MCP_NAME%"=="jest" (
    echo Starting Jest MCP...
    start "Jest MCP" cmd /c "npx -y jest-mcp > logs\jest-mcp.log 2>&1"
    echo [SUCCESS] Started Jest MCP.
) else if /i "%MCP_NAME%"=="docker" (
    echo Starting Docker MCP...
    start "Docker MCP" cmd /c "npx -y docker-mcp > logs\docker-mcp.log 2>&1"
    echo [SUCCESS] Started Docker MCP.
) else if /i "%MCP_NAME%"=="kubernetes" (
    echo Starting Kubernetes MCP...
    start "Kubernetes MCP" cmd /c "npx -y kubernetes-mcp > logs\kubernetes-mcp.log 2>&1"
    echo [SUCCESS] Started Kubernetes MCP.
) else (
    echo Unknown MCP name: %MCP_NAME%
    echo.
    echo Available MCP names:
    echo   memory        - Memory MCP
    echo   github        - GitHub MCP
    echo   sqlite        - SQLite MCP
    echo   brave-search  - Brave Search MCP
    echo   git           - Git MCP
    echo   filesystem    - Filesystem MCP
    echo   postgres      - PostgreSQL MCP
    echo   redis         - Redis MCP
    echo   sequential    - Sequential Thinking MCP
    echo   puppeteer     - Puppeteer MCP
    echo   fetch         - Fetch MCP
    echo   time          - Time MCP
    echo   magic         - Magic MCP
    echo   supabase      - Supabase MCP
    echo   browser-tools - Browser Tools MCP
    echo   firecrawl     - Firecrawl MCP
    echo   vscode        - VSCode MCP
    echo   langchain     - Langchain MCP
    echo   qdrant        - Qdrant MCP
    echo   semgrep       - Semgrep MCP
    echo   eslint        - ESLint MCP
    echo   typescript    - TypeScript MCP
    echo   prettier      - Prettier MCP
    echo   jest          - Jest MCP
    echo   docker        - Docker MCP
    echo   kubernetes    - Kubernetes MCP
    echo.
    exit /b 1
)

echo.
echo ===================================================
echo MCP Server Started!
echo ===================================================
echo.
echo The MCP server has been started in a separate window.
echo Logs are being written to the logs directory.
echo.
echo Press any key to exit...
pause > nul
