@echo off
echo ===================================================
echo Setting up Browser Tools MCP Server
echo ===================================================
echo.

echo Browser Tools MCP server doesn't require any special setup.
echo It will be installed and run directly using npx.
echo.

echo ===================================================
echo Browser Tools MCP Server Setup Complete!
echo ===================================================
echo.
echo To configure Augment to use this server:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Add a new MCP server with:
echo    - Name: Browser Tools MCP
echo    - Command: cmd /c npx -y @agentdeskai/browser-tools-mcp@latest
echo.
echo To test the server, you can run:
echo npx -y @agentdeskai/browser-tools-mcp@latest
echo.
echo Press any key to exit...
pause > nul
