@echo off
echo ===================================================
echo Starting All MCPs for Augment
echo ===================================================
echo.

set LOG_DIR=%TEMP%\mcp-logs
mkdir %LOG_DIR% 2>nul

REM Kill any existing MCP processes
echo Stopping any existing MCP processes...
taskkill /fi "windowtitle eq *MCP*" /f >nul 2>&1

REM Start all MCPs based on Augment configuration
echo Starting GitHub MCP...
start "GitHub MCP" cmd /c "npx -y @modelcontextprotocol/server-github > %LOG_DIR%\github-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Memory MCP...
start "Memory MCP" cmd /c "npx -y @modelcontextprotocol/server-memory > %LOG_DIR%\memory-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Filesystem MCP...
start "Filesystem MCP" cmd /c "npx -y @modelcontextprotocol/server-filesystem > %LOG_DIR%\filesystem-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Fetch MCP...
start "Fetch MCP" cmd /c "npx -y @modelcontextprotocol/server-fetch > %LOG_DIR%\fetch-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Time MCP...
start "Time MCP" cmd /c "npx -y @modelcontextprotocol/server-time > %LOG_DIR%\time-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Sequential Thinking MCP...
start "Sequential Thinking MCP" cmd /c "npx -y @modelcontextprotocol/server-sequential-thinking > %LOG_DIR%\sequential-thinking-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Git MCP...
start "Git MCP" cmd /c "python -m mcp_server_git > %LOG_DIR%\git_mcp.log 2>&1"
timeout /t 1 > nul

echo Starting TypeScript MCP...
start "TypeScript MCP" cmd /c "node C:\Users\aviad\OneDrive\Desktop\MCP\mcp-packages\custom-mcps\typescript-mcp.js > %LOG_DIR%\typescript-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting ESLint MCP...
start "ESLint MCP" cmd /c "node C:\Users\aviad\OneDrive\Desktop\MCP\mcp-packages\custom-mcps\eslint-mcp.js > %LOG_DIR%\eslint-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Prettier MCP...
start "Prettier MCP" cmd /c "node C:\Users\aviad\OneDrive\Desktop\MCP\mcp-packages\custom-mcps\prettier-mcp.js > %LOG_DIR%\prettier-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Jest MCP...
start "Jest MCP" cmd /c "node C:\Users\aviad\OneDrive\Desktop\MCP\mcp-packages\custom-mcps\jest-mcp.js > %LOG_DIR%\jest-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Puppeteer MCP...
start "Puppeteer MCP" cmd /c "npx -y @modelcontextprotocol/server-puppeteer > %LOG_DIR%\puppeteer-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Docker MCP...
start "Docker MCP" cmd /c "node C:\Users\aviad\OneDrive\Desktop\MCP\mcp-packages\custom-mcps\docker-mcp.js > %LOG_DIR%\docker-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Kubernetes MCP...
start "Kubernetes MCP" cmd /c "npx -y kubernetes-mcp > %LOG_DIR%\kubernetes-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting VSCode MCP...
start "VSCode MCP" cmd /c "node C:\Users\aviad\OneDrive\Desktop\MCP\mcp-packages\custom-mcps\vscode-mcp.js > %LOG_DIR%\vscode-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting SQLite MCP...
start "SQLite MCP" cmd /c "npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db > %LOG_DIR%\sqlite-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting PostgreSQL MCP...
start "PostgreSQL MCP" cmd /c "npx -y @modelcontextprotocol/server-postgres > %LOG_DIR%\postgresql-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Redis MCP...
start "Redis MCP" cmd /c "npx -y @modelcontextprotocol/server-redis > %LOG_DIR%\redis-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Langchain MCP...
start "Langchain MCP" cmd /c "node C:\Users\aviad\OneDrive\Desktop\MCP\mcp-packages\custom-mcps\langchain-mcp.js > %LOG_DIR%\langchain-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Qdrant MCP...
start "Qdrant MCP" cmd /c "python C:\Users\aviad\OneDrive\Desktop\MCP\mcp-packages\custom-mcps\qdrant_mcp.py > %LOG_DIR%\qdrant_mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Semgrep MCP...
start "Semgrep MCP" cmd /c "python -m semgrep_mcp > %LOG_DIR%\semgrep_mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Brave Search MCP...
start "Brave Search MCP" cmd /c "node C:\Users\aviad\OneDrive\Desktop\MCP\mcp-packages\custom-mcps\brave-search-mcp.js > %LOG_DIR%\brave-search-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Magic MCP...
start "Magic MCP" cmd /c "npx -y @21st-dev/magic@latest > %LOG_DIR%\magic-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Browser Tools MCP...
start "Browser Tools MCP" cmd /c "npx -y @agentdeskai/browser-tools-mcp@latest > %LOG_DIR%\browser-tools-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Firecrawl MCP...
start "Firecrawl MCP" cmd /c "npx -y firecrawl-mcp > %LOG_DIR%\firecrawl-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Context7 MCP...
start "Context7 MCP" cmd /c "npx -y @upstash/context7-mcp > %LOG_DIR%\context7-mcp.log 2>&1"
timeout /t 1 > nul

echo.
echo ===================================================
echo All Augment MCPs Started!
echo ===================================================
echo.
echo MCP logs are being saved to: %LOG_DIR%
echo.
echo The following MCPs have been started:
echo.
echo Essential MCPs:
echo - GitHub MCP (for GitHub repository operations)
echo - Memory MCP (for storing and retrieving information)
echo - Filesystem MCP (for file operations)
echo - Fetch MCP (for making HTTP requests)
echo - Time MCP (for time-related operations)
echo - Sequential Thinking MCP (for breaking down complex problems)
echo - Git MCP (for Git operations)
echo.
echo Dependency MCPs:
echo - TypeScript MCP (for TypeScript operations)
echo - ESLint MCP (for linting)
echo - Prettier MCP (for code formatting)
echo - Jest MCP (for testing)
echo - Puppeteer MCP (for browser automation)
echo - Docker MCP (for Docker operations)
echo - Kubernetes MCP (for Kubernetes operations)
echo - VSCode MCP (for VSCode operations)
echo - SQLite MCP (for SQLite database operations)
echo - PostgreSQL MCP (for PostgreSQL database operations)
echo - Redis MCP (for Redis operations)
echo - Langchain MCP (for AI workflows)
echo - Qdrant MCP (for vector database operations)
echo - Semgrep MCP (for code security analysis)
echo - Brave Search MCP (for web search)
echo - Magic MCP (for UI components)
echo - Browser Tools MCP (for browser automation)
echo - Firecrawl MCP (for web crawling)
echo - Context7 MCP (for up-to-date documentation and code examples)
echo.
echo Note: Some MCPs may not start if the required dependencies are not installed.
echo Check the logs in %LOG_DIR% for details.
echo.
echo Press any key to exit...
pause > nul
