@echo off
echo ===================================================
echo Testing MCP Servers in MCP Folder
echo ===================================================
echo.

cd C:\Users\aviad\OneDrive\Desktop\MCP

echo Current directory: %CD%
echo.

echo Listing MCP folder contents:
dir
echo.

echo Testing Memory MCP...
npx -y @modelcontextprotocol/server-memory --help > memory-test.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Memory MCP is working.
) else (
    echo [FAILED] Memory MCP is not working.
)

echo Testing GitHub MCP...
npx -y @modelcontextprotocol/server-github --help > github-test.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] GitHub MCP is working.
) else (
    echo [FAILED] GitHub MCP is not working.
)

echo Testing Git MCP...
python -m mcp_server_git --help > git-test.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Git MCP is working.
) else (
    echo [FAILED] Git MCP is not working.
)

echo.
echo ===================================================
echo Testing Complete!
echo ===================================================
echo.
echo Check the log files in the MCP folder for details.
echo.
echo Press any key to exit...
pause > nul
