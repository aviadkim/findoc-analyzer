@echo off
echo ===================================================
echo Setting up Supabase MCP Server
echo ===================================================
echo.

echo Supabase MCP server doesn't require any special setup.
echo It will be installed and run directly using npx.
echo.

echo ===================================================
echo Supabase MCP Server Setup Complete!
echo ===================================================
echo.
echo To configure Augment to use this server:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Add a new MCP server with:
echo    - Name: Supabase MCP
echo    - Command: cmd /c npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN
echo.
echo To test the server, you can run:
echo npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN
echo.
echo Press any key to exit...
pause > nul
