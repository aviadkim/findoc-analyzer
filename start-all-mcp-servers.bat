@echo off
echo ===================================================
echo Starting All MCP Servers
echo ===================================================
echo.

echo Starting GitHub MCP...
start "GitHub MCP" cmd /c "npx -y @modelcontextprotocol/server-github"

echo Starting Brave Search MCP...
start "Brave Search MCP" cmd /c "npx -y brave-search-mcp"

echo Starting Magic MCP...
start "Magic MCP" cmd /c "npx -y @21st-dev/magic@latest"

echo Starting SQLite MCP...
start "SQLite MCP" cmd /c "npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db"

echo Starting Puppeteer MCP...
start "Puppeteer MCP" cmd /c "npx -y @modelcontextprotocol/server-puppeteer"

echo Starting Sequential Thinking MCP...
start "Sequential Thinking MCP" cmd /c "npx -y @modelcontextprotocol/server-sequentialthinking"

echo Starting Memory MCP...
start "Memory MCP" cmd /c "npx -y @modelcontextprotocol/server-memory"

echo Starting Firecrawl MCP...
start "Firecrawl MCP" cmd /c "npx -y firecrawl-mcp"

echo Starting Supabase MCP...
start "Supabase MCP" cmd /c "npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN"

echo.
echo ===================================================
echo All MCP servers started!
echo ===================================================
echo.
echo To stop all MCP servers, close their terminal windows.
echo.
echo Press any key to exit...
pause > nul
