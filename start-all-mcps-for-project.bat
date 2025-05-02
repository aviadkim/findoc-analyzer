@echo off
echo ===================================================
echo Starting All MCPs for Project
echo ===================================================
echo.

set GLOBAL_MCP_DIR=C:\Users\aviad\.mcp-servers
set LOG_DIR=%TEMP%\mcp-logs
mkdir %LOG_DIR% 2>nul

REM List of MCPs to start
set MCP_LIST=github-mcp.js memory-mcp.js sqlite-mcp.js filesystem-mcp.js fetch-mcp.js postgresql-mcp.js redis-mcp.js sequential-thinking-mcp.js puppeteer-mcp.js time-mcp.js docker-mcp.js kubernetes-mcp.js vscode-mcp.js typescript-mcp.js prettier-mcp.js jest-mcp.js eslint-mcp.js langchain-mcp.js context7-mcp.js playwright-mcp.js

echo Starting JavaScript MCPs...
for %%m in (%MCP_LIST%) do (
    echo Starting %%~nm MCP...
    start "%%~nm MCP" cmd /c "node %GLOBAL_MCP_DIR%\js\%%m > %LOG_DIR%\%%~nm.log 2>&1"
    timeout /t 1 > nul
)

echo Starting Python MCPs...
echo Starting Git MCP...
start "Git MCP" cmd /c "python -m git_mcp > %LOG_DIR%\git_mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Qdrant MCP...
start "Qdrant MCP" cmd /c "python -m qdrant_mcp > %LOG_DIR%\qdrant_mcp.log 2>&1"
timeout /t 1 > nul

echo Starting Semgrep MCP...
start "Semgrep MCP" cmd /c "python -m semgrep_mcp > %LOG_DIR%\semgrep_mcp.log 2>&1"
timeout /t 1 > nul

echo Starting TypeScript MCPs...
echo Starting Brave Search MCP...
start "Brave Search MCP" cmd /c "ts-node %GLOBAL_MCP_DIR%\ts\brave-search-mcp.ts > %LOG_DIR%\brave-search-mcp.log 2>&1"
timeout /t 1 > nul

echo.
echo ===================================================
echo All MCPs Started!
echo ===================================================
echo.
echo MCP logs are being saved to: %LOG_DIR%
echo.
echo Note: The following MCPs require API keys and were not started:
echo - Magic MCP (requires API key from https://21st.dev/magic/console)
echo - Supabase MCP (requires access token)
echo - Firecrawl MCP (requires API key)
echo - OpenAI MCP (requires API key)
echo - Perplexity MCP (requires API key)
echo - Pinecone MCP (requires API key)
echo.
echo Press any key to exit...
pause > nul
