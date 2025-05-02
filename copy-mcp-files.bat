@echo off
echo ===================================================
echo Copying MCP Files to MCP Folder
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
copy /Y "test-all-mcp-servers.bat" "%MCP_FOLDER%\test-all-mcp-servers.bat"
copy /Y "start-all-mcp-servers-with-logs.bat" "%MCP_FOLDER%\start-all-mcp-servers.bat"
copy /Y "stop-all-mcp.bat" "%MCP_FOLDER%\stop-all-mcp.bat"
echo Scripts copied.
echo.

echo Copying documentation...
copy /Y "MCP-GUIDE-FOR-AI-ASSISTANTS.md" "%DOCS_FOLDER%\MCP-GUIDE-FOR-AI-ASSISTANTS.md"
echo Documentation copied.
echo.

echo ===================================================
echo Copy Complete!
echo ===================================================
echo.
echo All files have been copied to your MCP folder.
echo.
echo To test MCP servers:
echo 1. Navigate to "%MCP_FOLDER%"
echo 2. Run "test-all-mcp-servers.bat"
echo.
echo To start all MCP servers:
echo 1. Navigate to "%MCP_FOLDER%"
echo 2. Run "start-all-mcp-servers.bat"
echo.
echo To stop all MCP servers:
echo 1. Navigate to "%MCP_FOLDER%"
echo 2. Run "stop-all-mcp.bat"
echo.
echo Press any key to exit...
pause > nul
