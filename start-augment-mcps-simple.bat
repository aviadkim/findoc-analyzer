@echo off
echo ===================================================
echo Starting Essential MCPs for Augment
echo ===================================================
echo.

set LOG_DIR=%TEMP%\mcp-logs
mkdir %LOG_DIR% 2>nul

REM Kill any existing MCP processes
echo Stopping any existing MCP processes...
taskkill /fi "windowtitle eq *MCP*" /f >nul 2>&1

REM Start essential MCPs
echo Starting GitHub MCP...
start "GitHub MCP" cmd /c "npx -y github-mcp > %LOG_DIR%\github-mcp.log 2>&1"
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
start "Sequential Thinking MCP" cmd /c "npx -y @modelcontextprotocol/server-sequentialthinking > %LOG_DIR%\sequential-thinking-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Git MCP...
start "Git MCP" cmd /c "python -m git_mcp > %LOG_DIR%\git_mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Puppeteer MCP...
start "Puppeteer MCP" cmd /c "npx -y @modelcontextprotocol/server-puppeteer > %LOG_DIR%\puppeteer-mcp.log 2>&1"
timeout /t 1 > nul

echo Starting SQLite MCP...
start "SQLite MCP" cmd /c "npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db > %LOG_DIR%\sqlite-mcp.log 2>&1"
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

echo Starting Semgrep MCP...
start "Semgrep MCP" cmd /c "python -m semgrep_mcp > %LOG_DIR%\semgrep_mcp.log 2>&1"
timeout /t 1 > nul

echo.
echo ===================================================
echo Essential Augment MCPs Started!
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
echo - Puppeteer MCP (for browser automation)
echo - SQLite MCP (for SQLite database operations)
echo - Magic MCP (for UI components)
echo - Browser Tools MCP (for browser automation)
echo - Firecrawl MCP (for web crawling)
echo - Semgrep MCP (for code security analysis)
echo.
echo Note: Some MCPs may not start if the required dependencies are not installed.
echo Check the logs in %LOG_DIR% for details.
echo.
echo Press any key to exit...
pause > nul
