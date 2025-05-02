@echo off
echo Starting all MCP servers...
echo.

echo Starting Brave Search MCP...
start "Brave Search MCP" cmd /c "set BRAVE_API_KEY=YOUR_BRAVE_API_KEY && node C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server\build\index.js"

echo Starting GitHub MCP...
start "GitHub MCP" cmd /c "set GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN && npx -y github-mcp"

echo Starting Magic MCP...
start "Magic MCP" cmd /c "npx -y @21st-dev/magic@latest"

echo Starting Supabase MCP...
start "Supabase MCP" cmd /c "npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN"

echo Starting Browser Tools MCP...
start "Browser Tools MCP" cmd /c "npx -y @agentdeskai/browser-tools-mcp@latest"

echo Starting Firecrawl MCP...
start "Firecrawl MCP" cmd /c "set FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY && npx -y firecrawl-mcp"

echo Starting Puppeteer MCP...
start "Puppeteer MCP" cmd /c "npx -y @modelcontextprotocol/server-puppeteer"

echo.
echo All MCP servers have been started in separate windows.
echo.
echo Press any key to exit...
pause > nul
