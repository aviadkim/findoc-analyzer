@echo off
echo ===================================================
echo Testing MCP Servers from Correct Location
echo ===================================================
echo.

echo Changing to MCP directory...
cd "C:\Users\aviad\OneDrive\Desktop\MCP"
echo Current directory: %CD%
echo.

echo Testing Brave Search MCP...
if exist "brave-search-server\build\index.js" (
    echo Brave Search MCP file exists!
    echo Command to use in Augment:
    echo cmd /c "set BRAVE_API_KEY=YOUR_BRAVE_API_KEY && node C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server\build\index.js"
) else (
    echo Brave Search MCP file does not exist!
)
echo.

echo Testing GitHub MCP...
if exist "github-mcp\github-mcp.js" (
    echo GitHub MCP file exists!
    echo Command to use in Augment:
    echo cmd /c "set GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN && node C:\Users\aviad\OneDrive\Desktop\MCP\github-mcp\github-mcp.js"
) else (
    echo GitHub MCP file does not exist!
    echo Alternative command to use in Augment:
    echo cmd /c "set GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN && npx -y github-mcp"
)
echo.

echo Testing NPX-based MCP servers...
echo These should work regardless of location:
echo.

echo Magic MCP:
echo cmd /c "npx -y @21st-dev/magic@latest"
echo.

echo Supabase MCP:
echo cmd /c "npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN"
echo.

echo Browser Tools MCP:
echo cmd /c "npx -y @agentdeskai/browser-tools-mcp@latest"
echo.

echo Firecrawl MCP:
echo cmd /c "set FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY && npx -y firecrawl-mcp"
echo.

echo Puppeteer MCP:
echo cmd /c "npx -y @modelcontextprotocol/server-puppeteer"
echo.

echo ===================================================
echo Testing Complete!
echo ===================================================
echo.
echo To configure Augment:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. For each MCP server, click "Add MCP Server" and fill in:
echo    - Name: (e.g., "Brave Search MCP")
echo    - Command: (the command shown above for each MCP server)
echo.
echo Press any key to exit...
pause > nul
