@echo off
echo ===================================================
echo MCP Server Fixes
echo ===================================================
echo.

set LOG_FILE=mcp-fix-results.txt
echo MCP Server Fix Results > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Function to install an MCP server
:install_mcp
echo.
echo ===================================================
echo Installing: %~1
echo Package: %~2
echo ===================================================
echo.
echo Installing: %~1 >> %LOG_FILE%
echo Package: %~2 >> %LOG_FILE%

if "%~3"=="npm" (
    echo Installing npm package...
    echo Installing npm package... >> %LOG_FILE%
    call npm install -g %~2
    if !ERRORLEVEL! EQU 0 (
        echo [SUCCESS] %~1 installed successfully.
        echo [SUCCESS] %~1 installed successfully. >> %LOG_FILE%
    ) else (
        echo [FAILED] Failed to install %~1.
        echo [FAILED] Failed to install %~1. >> %LOG_FILE%
    )
) else if "%~3"=="python" (
    echo Installing Python package...
    echo Installing Python package... >> %LOG_FILE%
    call pip install %~2
    if !ERRORLEVEL! EQU 0 (
        echo [SUCCESS] %~1 installed successfully.
        echo [SUCCESS] %~1 installed successfully. >> %LOG_FILE%
    ) else (
        echo [FAILED] Failed to install %~1.
        echo [FAILED] Failed to install %~1. >> %LOG_FILE%
    )
)

echo. >> %LOG_FILE%
goto :eof

echo Installing all MCP servers...
echo.

REM Install npm packages
call :install_mcp "Brave Search MCP" "brave-search-mcp" "npm"
call :install_mcp "GitHub MCP" "github-mcp" "npm"
call :install_mcp "GitHub MCP (alternative)" "@modelcontextprotocol/server-github" "npm"
call :install_mcp "SQLite MCP" "@modelcontextprotocol/server-sqlite" "npm"
call :install_mcp "Magic MCP" "@21st-dev/magic@latest" "npm"
call :install_mcp "Supabase MCP" "@supabase/mcp-server-supabase@latest" "npm"
call :install_mcp "Browser Tools MCP" "@agentdeskai/browser-tools-mcp@latest" "npm"
call :install_mcp "Firecrawl MCP" "firecrawl-mcp" "npm"
call :install_mcp "Puppeteer MCP" "@modelcontextprotocol/server-puppeteer" "npm"
call :install_mcp "Filesystem MCP" "@modelcontextprotocol/server-filesystem" "npm"
call :install_mcp "VSCode MCP" "vscode-mcp" "npm"
call :install_mcp "Fetch MCP" "@modelcontextprotocol/server-fetch" "npm"
call :install_mcp "PostgreSQL MCP" "@modelcontextprotocol/server-postgres" "npm"
call :install_mcp "Redis MCP" "@modelcontextprotocol/server-redis" "npm"
call :install_mcp "Sequential Thinking MCP" "@modelcontextprotocol/server-sequentialthinking" "npm"
call :install_mcp "Memory MCP" "@modelcontextprotocol/server-memory" "npm"
call :install_mcp "Langchain MCP" "langchain-mcp" "npm"
call :install_mcp "ESLint MCP" "eslint-mcp" "npm"
call :install_mcp "TypeScript MCP" "typescript-mcp" "npm"
call :install_mcp "Prettier MCP" "prettier-mcp" "npm"
call :install_mcp "Jest MCP" "jest-mcp" "npm"
call :install_mcp "Docker MCP" "docker-mcp" "npm"
call :install_mcp "Kubernetes MCP" "kubernetes-mcp" "npm"
call :install_mcp "Time MCP" "@modelcontextprotocol/server-time" "npm"

REM Install Python packages
call :install_mcp "Git MCP" "mcp-server-git" "python"
call :install_mcp "Qdrant MCP" "qdrant-mcp" "python"
call :install_mcp "Semgrep MCP" "semgrep-mcp" "python"

echo.
echo ===================================================
echo Installation Complete!
echo ===================================================
echo.
echo Installation results have been saved to %LOG_FILE%
echo.
echo Now run test-mcp-servers.bat to test if the installations fixed the issues.
echo.
echo Press any key to exit...
pause > nul
