@echo off
echo ===================================================
echo MCP Server Testing and Installation
echo ===================================================
echo.

set LOG_FILE=mcp-test-results.log
echo MCP Server Test Results > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a directory for logs
mkdir logs 2>nul

REM Function to test and install an MCP server
:test_and_install_mcp
echo Testing %~1...
echo Testing %~1... >> %LOG_FILE%
timeout /t 1 /nobreak > nul

REM Try to run the MCP server with --help flag
start /b /wait cmd /c "%~2 --help > temp_output.txt 2>&1 || echo Failed > temp_status.txt"

REM Check if the test failed
if exist temp_status.txt (
    echo [FAILED] %~1 is not working correctly.
    echo [FAILED] %~1 is not working correctly. >> %LOG_FILE%
    
    REM Try to install the package
    echo Attempting to install %~1...
    echo Attempting to install %~1... >> %LOG_FILE%
    
    REM Extract package name from command
    set "cmd=%~2"
    set "pkg="
    
    REM Handle different command formats
    echo %cmd% | findstr /C:"npx -y" > nul
    if not errorlevel 1 (
        for /f "tokens=3" %%i in ("%cmd%") do set "pkg=%%i"
        if "!pkg:~0,1!"=="@" (
            for /f "tokens=3,4" %%i in ("%cmd%") do set "pkg=%%i %%j"
        )
        echo Installing package: !pkg!
        call npm install -g !pkg! >> %LOG_FILE% 2>&1
    )
    
    echo %cmd% | findstr /C:"python -m" > nul
    if not errorlevel 1 (
        for /f "tokens=3" %%i in ("%cmd%") do set "pkg=%%i"
        echo Installing Python package: !pkg!
        call pip install !pkg! >> %LOG_FILE% 2>&1
    )
    
    REM Test again after installation
    start /b /wait cmd /c "%~2 --help > temp_output.txt 2>&1 || echo Failed > temp_status2.txt"
    if exist temp_status2.txt (
        echo [STILL FAILED] %~1 could not be installed or has other issues.
        echo [STILL FAILED] %~1 could not be installed or has other issues. >> %LOG_FILE%
        del temp_status2.txt
    ) else (
        echo [FIXED] %~1 has been installed and is now working.
        echo [FIXED] %~1 has been installed and is now working. >> %LOG_FILE%
    )
    
    del temp_status.txt
) else (
    echo [SUCCESS] %~1 is working correctly.
    echo [SUCCESS] %~1 is working correctly. >> %LOG_FILE%
)

if exist temp_output.txt del temp_output.txt
echo. >> %LOG_FILE%
goto :eof

echo Testing and installing all MCP servers...
echo.

REM Test and install all MCP servers
call :test_and_install_mcp "Brave Search MCP" "npx -y brave-search-mcp"
call :test_and_install_mcp "GitHub MCP" "npx -y github-mcp"
call :test_and_install_mcp "SQLite MCP" "npx -y @modelcontextprotocol/server-sqlite"
call :test_and_install_mcp "Magic MCP" "npx -y @21st-dev/magic@latest"
call :test_and_install_mcp "Supabase MCP" "npx -y @supabase/mcp-server-supabase@latest"
call :test_and_install_mcp "Browser Tools MCP" "npx -y @agentdeskai/browser-tools-mcp@latest"
call :test_and_install_mcp "Firecrawl MCP" "npx -y firecrawl-mcp"
call :test_and_install_mcp "Puppeteer MCP" "npx -y @modelcontextprotocol/server-puppeteer"
call :test_and_install_mcp "Git MCP" "python -m mcp_server_git"
call :test_and_install_mcp "Filesystem MCP" "npx -y @modelcontextprotocol/server-filesystem"
call :test_and_install_mcp "VSCode MCP" "npx -y vscode-mcp"
call :test_and_install_mcp "Fetch MCP" "npx -y @modelcontextprotocol/server-fetch"
call :test_and_install_mcp "PostgreSQL MCP" "npx -y @modelcontextprotocol/server-postgres"
call :test_and_install_mcp "Redis MCP" "npx -y @modelcontextprotocol/server-redis"
call :test_and_install_mcp "Sequential Thinking MCP" "npx -y @modelcontextprotocol/server-sequentialthinking"
call :test_and_install_mcp "Memory MCP" "npx -y @modelcontextprotocol/server-memory"
call :test_and_install_mcp "Qdrant MCP" "python -m qdrant_mcp"
call :test_and_install_mcp "Langchain MCP" "npx -y langchain-mcp"
call :test_and_install_mcp "Semgrep MCP" "python -m semgrep_mcp"
call :test_and_install_mcp "ESLint MCP" "npx -y eslint-mcp"
call :test_and_install_mcp "TypeScript MCP" "npx -y typescript-mcp"
call :test_and_install_mcp "Prettier MCP" "npx -y prettier-mcp"
call :test_and_install_mcp "Jest MCP" "npx -y jest-mcp"
call :test_and_install_mcp "Docker MCP" "npx -y docker-mcp"
call :test_and_install_mcp "Kubernetes MCP" "npx -y kubernetes-mcp"
call :test_and_install_mcp "Time MCP" "npx -y @modelcontextprotocol/server-time"

echo.
echo ===================================================
echo Testing and Installation Complete!
echo ===================================================
echo.
echo Test results have been saved to %LOG_FILE%
echo.
echo Press any key to exit...
pause > nul
