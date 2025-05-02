@echo off
echo ===================================================
echo Copying MCP Test Files to MCP Folder
echo ===================================================
echo.

set MCP_FOLDER=C:\Users\aviad\OneDrive\Desktop\MCP

echo Creating directories if they don't exist...
mkdir "%MCP_FOLDER%" 2>nul
mkdir "%MCP_FOLDER%\logs" 2>nul
echo Directories created.
echo.

echo Copying scripts...
copy /Y "test-mcp-servers.bat" "%MCP_FOLDER%\test-mcp-servers.bat"
copy /Y "fix-mcp-servers.bat" "%MCP_FOLDER%\fix-mcp-servers.bat"
echo Scripts copied.
echo.

echo ===================================================
echo Copy Complete!
echo ===================================================
echo.
echo All files have been copied to your MCP folder.
echo.
echo To test your MCP servers:
echo 1. Navigate to "%MCP_FOLDER%"
echo 2. Run "test-mcp-servers.bat"
echo.
echo If you find issues with any MCP servers:
echo 1. Navigate to "%MCP_FOLDER%"
echo 2. Run "fix-mcp-servers.bat"
echo 3. Run "test-mcp-servers.bat" again to verify the fixes
echo.
echo Press any key to exit...
pause > nul
