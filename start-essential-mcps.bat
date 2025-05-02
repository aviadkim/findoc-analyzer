@echo off
echo ===================================================
echo Starting Essential MCPs (No API Keys Required)
echo ===================================================
echo.

set GLOBAL_MCP_DIR=C:\Users\aviad\.mcp-servers
set LOG_DIR=%TEMP%\mcp-logs
mkdir %LOG_DIR% 2>nul

REM List of essential MCPs that don't require API keys or additional dependencies
set ESSENTIAL_MCPS=github-mcp.js memory-mcp.js filesystem-mcp.js fetch-mcp.js time-mcp.js sequential-thinking-mcp.js

echo Starting essential JavaScript MCPs...
for %%m in (%ESSENTIAL_MCPS%) do (
    echo Starting %%~nm MCP...
    start "%%~nm MCP" cmd /c "node %GLOBAL_MCP_DIR%\js\%%m > %LOG_DIR%\%%~nm.log 2>&1"
    timeout /t 1 > nul
)

echo Starting Git MCP with wrapper...
start "Git MCP" cmd /c "git-mcp-wrapper.bat . > %LOG_DIR%\git_mcp.log 2>&1"
timeout /t 1 > nul

echo.
echo ===================================================
echo Essential MCPs Started!
echo ===================================================
echo.
echo MCP logs are being saved to: %LOG_DIR%
echo.
echo The following essential MCPs have been started:
echo - GitHub MCP (for GitHub repository operations)
echo - Memory MCP (for storing and retrieving information)
echo - Filesystem MCP (for file operations)
echo - Fetch MCP (for making HTTP requests)
echo - Time MCP (for time-related operations)
echo - Sequential Thinking MCP (for breaking down complex problems)
echo - Git MCP (for Git operations)
echo.
echo Note: The following MCPs require additional dependencies and were not started:
echo - SQLite MCP (requires SQLite to be installed)
echo - PostgreSQL MCP (requires PostgreSQL to be installed)
echo - Redis MCP (requires Redis to be installed)
echo - Docker MCP (requires Docker to be installed)
echo - Kubernetes MCP (requires kubectl to be installed)
echo - TypeScript MCP (requires TypeScript to be installed)
echo - ESLint MCP (requires ESLint to be installed)
echo - Prettier MCP (requires Prettier to be installed)
echo - Jest MCP (requires Jest to be installed)
echo - VSCode MCP (requires VSCode to be installed)
echo - Puppeteer MCP (requires Puppeteer to be installed)
echo - Playwright MCP (requires Playwright to be installed)
echo - Qdrant MCP (requires Qdrant client to be installed)
echo - Langchain MCP (requires Langchain to be installed)
echo.
echo Note: The following MCPs require API keys and were not started:
echo - Magic MCP (requires API key)
echo - Supabase MCP (requires access token)
echo - Firecrawl MCP (requires API key)
echo - Brave Search MCP (requires API key)
echo - OpenAI MCP (requires API key)
echo - Perplexity MCP (requires API key)
echo - Pinecone MCP (requires API key)
echo.
echo Press any key to exit...
pause > nul
