@echo off
echo ===================================================
echo Building MCP Servers
echo ===================================================
echo.

cd C:\Users\aviad\OneDrive\Desktop\MCP\mcp-servers

echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install dependencies.
    exit /b 1
)
echo [SUCCESS] Dependencies installed.
echo.

echo Building MCP servers...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to build MCP servers.
    exit /b 1
)
echo [SUCCESS] MCP servers built.
echo.

echo Linking MCP servers...
call npm run link-all
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to link MCP servers.
    exit /b 1
)
echo [SUCCESS] MCP servers linked.
echo.

echo ===================================================
echo Build Complete!
echo ===================================================
echo.
echo All MCP servers have been built and linked.
echo.
echo Press any key to exit...
pause > nul
