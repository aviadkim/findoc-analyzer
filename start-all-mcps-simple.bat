@echo off
echo ===================================================
echo Starting All MCPs (No API Keys Required)
echo ===================================================
echo.

set GLOBAL_MCP_DIR=C:\Users\aviad\.mcp-servers
set LOG_DIR=%TEMP%\mcp-logs
mkdir %LOG_DIR% 2>nul

REM List of MCPs that don't require API keys
set NO_API_MCPS=github-mcp.js memory-mcp.js sqlite-mcp.js git_mcp.py filesystem-mcp.js fetch-mcp.js postgresql-mcp.js redis-mcp.js sequential-thinking-mcp.js puppeteer-mcp.js time-mcp.js docker-mcp.js kubernetes-mcp.js vscode-mcp.js typescript-mcp.js prettier-mcp.js jest-mcp.js eslint-mcp.js langchain-mcp.js qdrant_mcp.py semgrep_mcp.py context7-mcp.js playwright-mcp.js

echo Starting MCPs that don't require API keys...
echo.

for %%m in (%NO_API_MCPS%) do (
    set MCP_NAME=%%~nm
    set MCP_EXT=%%~xm
    
    echo Starting !MCP_NAME! MCP...
    
    if "!MCP_EXT!"==".js" (
        start "!MCP_NAME! MCP" cmd /c "node %GLOBAL_MCP_DIR%\js\%%m > %LOG_DIR%\!MCP_NAME!.log 2>&1"
    ) else if "!MCP_EXT!"==".py" (
        start "!MCP_NAME! MCP" cmd /c "python -m !MCP_NAME! > %LOG_DIR%\!MCP_NAME!.log 2>&1"
    ) else if "!MCP_EXT!"==".ts" (
        start "!MCP_NAME! MCP" cmd /c "ts-node %GLOBAL_MCP_DIR%\ts\%%m > %LOG_DIR%\!MCP_NAME!.log 2>&1"
    )
    
    timeout /t 1 > nul
)

echo.
echo ===================================================
echo All No-API MCPs Started!
echo ===================================================
echo.
echo MCP logs are being saved to: %LOG_DIR%
echo.
echo Note: The following MCPs require API keys and were not started:
echo - Brave Search MCP (requires BRAVE_API_KEY)
echo - Supabase MCP (requires access token)
echo - Firecrawl MCP (requires FIRECRAWL_API_KEY)
echo - OpenAI MCP (requires OPENAI_API_KEY)
echo - Perplexity MCP (requires PERPLEXITY_API_KEY)
echo - Pinecone MCP (requires PINECONE_API_KEY)
echo.
echo Press any key to exit...
pause > nul
