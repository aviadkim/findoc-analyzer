@echo off
echo ===================================================
echo Starting Working MCP Servers
echo ===================================================
echo.

REM Create a log directory if it doesn't exist
mkdir logs 2>nul

REM Get current date and time for log files
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

REM Function to start an MCP server
:start_mcp
echo Starting %~1...
start "%~1" cmd /c "%~2 > logs\%~1_%timestamp%.log 2>&1"
timeout /t 1 /nobreak > nul
goto :eof

REM Start working MCP servers
call :start_mcp "GitHub_MCP" "npx -y @modelcontextprotocol/server-github"
call :start_mcp "Memory_MCP" "npx -y @modelcontextprotocol/server-memory"

REM Start Brave Search MCP with API key if available
if defined BRAVE_API_KEY (
    call :start_mcp "Brave_Search_MCP" "npx -y brave-search-mcp"
) else (
    echo Skipping Brave Search MCP - BRAVE_API_KEY not set
)

echo.
echo ===================================================
echo Working MCP servers started!
echo ===================================================
echo.
echo Each MCP server is running in its own window.
echo Log files are being saved to the logs directory.
echo.
echo To stop all MCP servers, you can:
echo 1. Close each terminal window manually
echo 2. Run stop-all-mcp.bat
echo 3. Use Task Manager to end all cmd.exe processes
echo.
echo Press any key to exit...
pause > nul
