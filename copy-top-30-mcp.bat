@echo off
echo ===================================================
echo Copying MCP Files to MCP Folder
echo ===================================================
echo.

echo Creating MCP directories if they don't exist...
mkdir "C:\Users\aviad\OneDrive\Desktop\MCP" 2>nul
mkdir "C:\Users\aviad\OneDrive\Desktop\MCP\config" 2>nul
echo Directories created.
echo.

echo Copying installation script...
copy /Y "install-top-30-mcp-servers.bat" "C:\Users\aviad\OneDrive\Desktop\MCP\install-top-30-mcp-servers.bat"
echo Installation script copied.
echo.

echo Copying configuration file...
copy /Y "top-30-mcp-config.json" "C:\Users\aviad\OneDrive\Desktop\MCP\config\top-30-mcp-config.json"
echo Configuration file copied.
echo.

echo ===================================================
echo Copy Complete!
echo ===================================================
echo.
echo All files have been copied to your MCP folder.
echo.
echo To install the MCP servers:
echo 1. Navigate to "C:\Users\aviad\OneDrive\Desktop\MCP"
echo 2. Run "install-top-30-mcp-servers.bat"
echo.
echo To configure Augment:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Copy the contents of "C:\Users\aviad\OneDrive\Desktop\MCP\config\top-30-mcp-config.json"
echo    into the Augment MCP configuration
echo.
echo Press any key to exit...
pause > nul
