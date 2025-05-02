@echo off
echo ===================================================
echo Copying MCP Setup Files to MCP Folder
echo ===================================================
echo.

echo Creating MCP directories if they don't exist...
mkdir "C:\Users\aviad\OneDrive\Desktop\MCP" 2>nul
mkdir "C:\Users\aviad\OneDrive\Desktop\MCP\config" 2>nul
mkdir "C:\Users\aviad\OneDrive\Desktop\MCP\docs" 2>nul
echo Directories created.
echo.

echo Copying installation script...
copy /Y "install-dev-mcp-servers.bat" "C:\Users\aviad\OneDrive\Desktop\MCP\install-dev-mcp-servers.bat"
echo Installation script copied.
echo.

echo Copying documentation...
copy /Y "DEV-MCP-SETUP-README.md" "C:\Users\aviad\OneDrive\Desktop\MCP\docs\README.md"
copy /Y "mcp-api-keys-guide.md" "C:\Users\aviad\OneDrive\Desktop\MCP\docs\API-KEYS-GUIDE.md"
echo Documentation copied.
echo.

echo Copying API key cleaning script...
copy /Y "clean-api-keys.bat" "C:\Users\aviad\OneDrive\Desktop\MCP\clean-api-keys.bat"
echo API key cleaning script copied.
echo.

echo ===================================================
echo Copy Complete!
echo ===================================================
echo.
echo All files have been copied to your MCP folder.
echo.
echo To install the MCP servers:
echo 1. Navigate to "C:\Users\aviad\OneDrive\Desktop\MCP"
echo 2. Run "install-dev-mcp-servers.bat"
echo.
echo Press any key to exit...
pause > nul
