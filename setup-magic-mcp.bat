@echo off
echo ===================================================
echo Setting up Magic MCP Server
echo ===================================================
echo.

echo Magic MCP server doesn't require any special setup.
echo It will be installed and run directly using npx.
echo.

echo ===================================================
echo Magic MCP Server Setup Complete!
echo ===================================================
echo.
echo To configure Augment to use this server:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Add a new MCP server with:
echo    - Name: Magic MCP
echo    - Command: cmd /c npx -y @21st-dev/magic@latest
echo.
echo To test the server, you can run:
echo npx -y @21st-dev/magic@latest
echo.
echo Press any key to exit...
pause > nul
