@echo off
echo ===================================================
echo Starting MCPs That Require Dependencies (No API Keys)
echo ===================================================
echo.

set GLOBAL_MCP_DIR=C:\Users\aviad\.mcp-servers
set LOG_DIR=%TEMP%\mcp-logs
mkdir %LOG_DIR% 2>nul

REM List of MCPs that require dependencies but no API keys
set DEPENDENCY_MCPS=typescript-mcp.js eslint-mcp.js prettier-mcp.js jest-mcp.js puppeteer-mcp.js playwright-mcp.js docker-mcp.js kubernetes-mcp.js vscode-mcp.js sqlite-mcp.js postgresql-mcp.js redis-mcp.js langchain-mcp.js

echo Starting JavaScript MCPs that require dependencies...
for %%m in (%DEPENDENCY_MCPS%) do (
    echo Starting %%~nm MCP...
    start "%%~nm MCP" cmd /c "node %GLOBAL_MCP_DIR%\js\%%m > %LOG_DIR%\%%~nm.log 2>&1"
    timeout /t 1 > nul
)

echo Starting Python MCPs that require dependencies...
echo Starting Qdrant MCP...
start "Qdrant MCP" cmd /c "python -m qdrant_mcp > %LOG_DIR%\qdrant_mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Semgrep MCP...
start "Semgrep MCP" cmd /c "python -m semgrep_mcp > %LOG_DIR%\semgrep_mcp.log 2>&1"
timeout /t 1 > nul

echo.
echo ===================================================
echo All Dependency MCPs Started!
echo ===================================================
echo.
echo MCP logs are being saved to: %LOG_DIR%
echo.
echo The following MCPs that require dependencies have been started:
echo - TypeScript MCP (for TypeScript operations)
echo - ESLint MCP (for linting)
echo - Prettier MCP (for code formatting)
echo - Jest MCP (for testing)
echo - Puppeteer MCP (for browser automation)
echo - Playwright MCP (for browser automation)
echo - Docker MCP (for Docker operations)
echo - Kubernetes MCP (for Kubernetes operations)
echo - VSCode MCP (for VSCode operations)
echo - SQLite MCP (for SQLite database operations)
echo - PostgreSQL MCP (for PostgreSQL database operations)
echo - Redis MCP (for Redis operations)
echo - Langchain MCP (for AI workflows)
echo - Qdrant MCP (for vector database operations)
echo - Semgrep MCP (for code security analysis)
echo.
echo Note: Some MCPs may not start if the required dependencies are not installed.
echo Check the logs in %LOG_DIR% for details.
echo.
echo Press any key to exit...
pause > nul
