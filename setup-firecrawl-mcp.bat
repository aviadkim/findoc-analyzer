@echo off
echo ===================================================
echo Setting up Firecrawl MCP Server
echo ===================================================
echo.

echo Firecrawl MCP server doesn't require any special setup.
echo It will be installed and run directly using npx.
echo.

echo ===================================================
echo Firecrawl MCP Server Setup Complete!
echo ===================================================
echo.
echo To configure Augment to use this server:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Add a new MCP server with:
echo    - Name: Firecrawl MCP
echo    - Command: cmd /c set FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY && npx -y firecrawl-mcp
echo.
echo To test the server, you can run:
echo set FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY && npx -y firecrawl-mcp
echo.
echo Press any key to exit...
pause > nul
