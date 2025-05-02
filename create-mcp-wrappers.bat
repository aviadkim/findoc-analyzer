@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Creating MCP Wrapper Scripts
echo ===================================================
echo.

REM Create a directory for wrapper scripts if it doesn't exist
mkdir wrappers 2>nul

REM Function to create a wrapper script for an npm-based MCP
:create_npm_wrapper
echo Creating wrapper for %~1...
(
    echo @echo off
    echo echo Starting %~1...
    echo %~2
    echo echo %~1 is running. Press Ctrl+C to stop.
    echo pause
) > wrappers\%~1.bat
echo [SUCCESS] Created wrapper for %~1.
goto :eof

REM Function to create a wrapper script for a Python-based MCP
:create_python_wrapper
echo Creating wrapper for %~1...
(
    echo @echo off
    echo echo Starting %~1...
    echo %~2
    echo echo %~1 is running. Press Ctrl+C to stop.
    echo pause
) > wrappers\%~1.bat
echo [SUCCESS] Created wrapper for %~1.
goto :eof

echo Creating wrapper scripts for MCP servers...
echo.

REM Create wrappers for npm-based MCP servers
call :create_npm_wrapper "vscode-mcp" "npx -y vscode-mcp"
call :create_npm_wrapper "langchain-mcp" "npx -y langchain-mcp"
call :create_npm_wrapper "eslint-mcp" "npx -y eslint-mcp"
call :create_npm_wrapper "typescript-mcp" "npx -y typescript-mcp"
call :create_npm_wrapper "prettier-mcp" "npx -y prettier-mcp"
call :create_npm_wrapper "jest-mcp" "npx -y jest-mcp"
call :create_npm_wrapper "docker-mcp" "npx -y docker-mcp"
call :create_npm_wrapper "kubernetes-mcp" "npx -y kubernetes-mcp"

REM Create wrappers for Python-based MCP servers
call :create_python_wrapper "qdrant-mcp" "python -m qdrant_mcp"
call :create_python_wrapper "semgrep-mcp" "python -m semgrep_mcp"

REM Create wrappers for existing MCP servers
call :create_npm_wrapper "memory-mcp" "npx -y @modelcontextprotocol/server-memory"
call :create_npm_wrapper "github-mcp" "npx -y @modelcontextprotocol/server-github"
call :create_python_wrapper "sqlite-mcp" "C:\Users\aviad\AppData\Roaming\Python\Python313\Scripts\mcp-server-sqlite.exe --db-path C:\Users\aviad\test.db"
call :create_npm_wrapper "brave-search-mcp" "set BRAVE_API_KEY=YOUR_BRAVE_API_KEY && npx -y brave-search-mcp"
call :create_python_wrapper "git-mcp" "python -m mcp_server_git"
call :create_npm_wrapper "filesystem-mcp" "npx -y @modelcontextprotocol/server-filesystem"
call :create_npm_wrapper "postgres-mcp" "npx -y @modelcontextprotocol/server-postgres"
call :create_npm_wrapper "redis-mcp" "npx -y @modelcontextprotocol/server-redis"
call :create_npm_wrapper "sequentialthinking-mcp" "npx -y @modelcontextprotocol/server-sequentialthinking"
call :create_npm_wrapper "puppeteer-mcp" "npx -y @modelcontextprotocol/server-puppeteer"
call :create_npm_wrapper "fetch-mcp" "npx -y @modelcontextprotocol/server-fetch"
call :create_npm_wrapper "time-mcp" "npx -y @modelcontextprotocol/server-time"
call :create_npm_wrapper "magic-mcp" "npx -y @21st-dev/magic@latest"
call :create_npm_wrapper "supabase-mcp" "npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN"
call :create_npm_wrapper "browser-tools-mcp" "npx -y @agentdeskai/browser-tools-mcp@latest"
call :create_npm_wrapper "firecrawl-mcp" "set FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY && npx -y firecrawl-mcp"

echo.
echo ===================================================
echo Wrapper Script Creation Complete!
echo ===================================================
echo.
echo Wrapper scripts have been created in the wrappers directory.
echo.
echo Press any key to exit...
pause > nul
