@echo off
echo ===================================================
echo Copying Team MCP Files to MCP Folder
echo ===================================================
echo.

set MCP_FOLDER=C:\Users\aviad\OneDrive\Desktop\MCP
set DOCS_FOLDER=%MCP_FOLDER%\docs

echo Creating directories if they don't exist...
mkdir "%MCP_FOLDER%" 2>nul
mkdir "%MCP_FOLDER%\logs" 2>nul
mkdir "%DOCS_FOLDER%" 2>nul
echo Directories created.
echo.

echo Copying scripts...
copy /Y "test-and-install-all-mcp.bat" "%MCP_FOLDER%\test-and-install-all-mcp.bat"
copy /Y "start-all-mcp-with-monitoring.bat" "%MCP_FOLDER%\start-all-mcp-with-monitoring.bat"
copy /Y "stop-all-mcp.bat" "%MCP_FOLDER%\stop-all-mcp.bat"
echo Scripts copied.
echo.

echo Copying documentation...
copy /Y "TEAM-DEVELOPMENT-MCP-GUIDE.md" "%DOCS_FOLDER%\TEAM-DEVELOPMENT-MCP-GUIDE.md"
echo Documentation copied.
echo.

echo ===================================================
echo Copy Complete!
echo ===================================================
echo.
echo All files have been copied to your MCP folder.
echo.
echo To test and install all MCP servers:
echo 1. Navigate to "%MCP_FOLDER%"
echo 2. Run "test-and-install-all-mcp.bat"
echo.
echo To start all MCP servers with monitoring:
echo 1. Navigate to "%MCP_FOLDER%"
echo 2. Run "start-all-mcp-with-monitoring.bat"
echo.
echo To stop all MCP servers:
echo 1. Navigate to "%MCP_FOLDER%"
echo 2. Run "stop-all-mcp.bat"
echo.
echo Press any key to exit...
pause > nul
