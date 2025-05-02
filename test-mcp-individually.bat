@echo off
echo ===================================================
echo Testing MCP Servers Individually
echo ===================================================
echo.

set LOG_FILE=mcp-test-results.log
echo MCP Server Test Results > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Function to test an MCP server
:test_mcp
echo Testing %~1...
echo Testing %~1... >> %LOG_FILE%
echo Command: %~2 >> %LOG_FILE%

REM Try to run the MCP server with --help flag
cmd /c "%~2 --help > temp_output.txt 2>&1"
set EXIT_CODE=%ERRORLEVEL%

if %EXIT_CODE% NEQ 0 (
    echo [FAILED] %~1 is not working correctly. Exit code: %EXIT_CODE%
    echo [FAILED] %~1 is not working correctly. Exit code: %EXIT_CODE% >> %LOG_FILE%
    
    REM Try to install the package if it's an npm package
    if "%~3"=="npm" (
        echo Attempting to install %~4...
        echo Attempting to install %~4... >> %LOG_FILE%
        cmd /c "npm install -g %~4"
        
        REM Test again after installation
        cmd /c "%~2 --help > temp_output.txt 2>&1"
        set EXIT_CODE=%ERRORLEVEL%
        
        if %EXIT_CODE% NEQ 0 (
            echo [STILL FAILED] %~1 could not be installed or has other issues.
            echo [STILL FAILED] %~1 could not be installed or has other issues. >> %LOG_FILE%
        ) else (
            echo [FIXED] %~1 has been installed and is now working.
            echo [FIXED] %~1 has been installed and is now working. >> %LOG_FILE%
        )
    )
    
    REM Try to install the package if it's a Python package
    if "%~3"=="python" (
        echo Attempting to install %~4...
        echo Attempting to install %~4... >> %LOG_FILE%
        cmd /c "pip install %~4"
        
        REM Test again after installation
        cmd /c "%~2 --help > temp_output.txt 2>&1"
        set EXIT_CODE=%ERRORLEVEL%
        
        if %EXIT_CODE% NEQ 0 (
            echo [STILL FAILED] %~1 could not be installed or has other issues.
            echo [STILL FAILED] %~1 could not be installed or has other issues. >> %LOG_FILE%
        ) else (
            echo [FIXED] %~1 has been installed and is now working.
            echo [FIXED] %~1 has been installed and is now working. >> %LOG_FILE%
        )
    )
) else (
    echo [SUCCESS] %~1 is working correctly.
    echo [SUCCESS] %~1 is working correctly. >> %LOG_FILE%
)

if exist temp_output.txt del temp_output.txt
echo. >> %LOG_FILE%
echo. 
goto :eof

echo Testing all MCP servers individually...
echo.

REM Test each MCP server individually with proper package names
call :test_mcp "Brave Search MCP" "npx -y brave-search-mcp" "npm" "brave-search-mcp"
call :test_mcp "GitHub MCP (github-mcp)" "npx -y github-mcp" "npm" "github-mcp"
call :test_mcp "GitHub MCP (modelcontextprotocol)" "npx -y @modelcontextprotocol/server-github" "npm" "@modelcontextprotocol/server-github"
call :test_mcp "SQLite MCP" "npx -y @modelcontextprotocol/server-sqlite" "npm" "@modelcontextprotocol/server-sqlite"
call :test_mcp "Magic MCP" "npx -y @21st-dev/magic@latest" "npm" "@21st-dev/magic@latest"
call :test_mcp "Supabase MCP" "npx -y @supabase/mcp-server-supabase@latest" "npm" "@supabase/mcp-server-supabase@latest"
call :test_mcp "Browser Tools MCP" "npx -y @agentdeskai/browser-tools-mcp@latest" "npm" "@agentdeskai/browser-tools-mcp@latest"
call :test_mcp "Firecrawl MCP" "npx -y firecrawl-mcp" "npm" "firecrawl-mcp"
call :test_mcp "Puppeteer MCP" "npx -y @modelcontextprotocol/server-puppeteer" "npm" "@modelcontextprotocol/server-puppeteer"
call :test_mcp "Git MCP" "python -m mcp_server_git" "python" "mcp-server-git"
call :test_mcp "Filesystem MCP" "npx -y @modelcontextprotocol/server-filesystem" "npm" "@modelcontextprotocol/server-filesystem"
call :test_mcp "VSCode MCP" "npx -y vscode-mcp" "npm" "vscode-mcp"
call :test_mcp "Fetch MCP" "npx -y @modelcontextprotocol/server-fetch" "npm" "@modelcontextprotocol/server-fetch"
call :test_mcp "PostgreSQL MCP" "npx -y @modelcontextprotocol/server-postgres" "npm" "@modelcontextprotocol/server-postgres"
call :test_mcp "Redis MCP" "npx -y @modelcontextprotocol/server-redis" "npm" "@modelcontextprotocol/server-redis"
call :test_mcp "Sequential Thinking MCP" "npx -y @modelcontextprotocol/server-sequentialthinking" "npm" "@modelcontextprotocol/server-sequentialthinking"
call :test_mcp "Memory MCP" "npx -y @modelcontextprotocol/server-memory" "npm" "@modelcontextprotocol/server-memory"
call :test_mcp "Qdrant MCP" "python -m qdrant_mcp" "python" "qdrant-mcp"
call :test_mcp "Langchain MCP" "npx -y langchain-mcp" "npm" "langchain-mcp"
call :test_mcp "Semgrep MCP" "python -m semgrep_mcp" "python" "semgrep-mcp"
call :test_mcp "ESLint MCP" "npx -y eslint-mcp" "npm" "eslint-mcp"
call :test_mcp "TypeScript MCP" "npx -y typescript-mcp" "npm" "typescript-mcp"
call :test_mcp "Prettier MCP" "npx -y prettier-mcp" "npm" "prettier-mcp"
call :test_mcp "Jest MCP" "npx -y jest-mcp" "npm" "jest-mcp"
call :test_mcp "Docker MCP" "npx -y docker-mcp" "npm" "docker-mcp"
call :test_mcp "Kubernetes MCP" "npx -y kubernetes-mcp" "npm" "kubernetes-mcp"
call :test_mcp "Time MCP" "npx -y @modelcontextprotocol/server-time" "npm" "@modelcontextprotocol/server-time"

echo.
echo ===================================================
echo Testing Complete!
echo ===================================================
echo.
echo Test results have been saved to %LOG_FILE%
echo.
echo Press any key to exit...
pause > nul
