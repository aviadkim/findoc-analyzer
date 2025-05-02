@echo off
echo.
echo ===================================================
echo ESSENTIAL MCP CONFIGURATIONS FOR AUGMENT
echo ===================================================
echo.
echo Follow these steps:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Find the MCP section
echo 4. Add each MCP server below
echo 5. Save your configuration
echo.
echo ===================================================
echo.
echo 1. GitHub MCP
echo    Name: GitHub MCP
echo    Command: npx -y @modelcontextprotocol/server-github
echo    Environment Variables: 
echo      Name: GITHUB_PERSONAL_ACCESS_TOKEN
echo      Value: YOUR_GITHUB_TOKEN
echo.
echo 2. Brave Search MCP
echo    Name: Brave Search MCP
echo    Command: npx -y brave-search-mcp
echo    Environment Variables: 
echo      Name: BRAVE_API_KEY
echo      Value: BSAN7HoBWjJOUG-zXVN8rkIGXpbsRtq
echo.
echo 3. Magic MCP
echo    Name: Magic MCP
echo    Command: npx -y @21st-dev/magic@latest
echo    No environment variables needed
echo.
echo 4. SQLite MCP
echo    Name: SQLite MCP
echo    Command: npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db
echo    No environment variables needed
echo.
echo 5. Puppeteer MCP
echo    Name: Puppeteer MCP
echo    Command: npx -y @modelcontextprotocol/server-puppeteer
echo    No environment variables needed
echo.
echo 6. Sequential Thinking MCP
echo    Name: Sequential Thinking MCP
echo    Command: npx -y @modelcontextprotocol/server-sequentialthinking
echo    No environment variables needed
echo.
echo 7. Memory MCP
echo    Name: Memory MCP
echo    Command: npx -y @modelcontextprotocol/server-memory
echo    No environment variables needed
echo.
echo 8. Firecrawl MCP
echo    Name: Firecrawl MCP
echo    Command: npx -y firecrawl-mcp
echo    Environment Variables: 
echo      Name: FIRECRAWL_API_KEY
echo      Value: fc-857417811665460e92716b92e08ec398
echo.
echo 9. Supabase MCP
echo    Name: Supabase MCP
echo    Command: npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN
echo    No environment variables needed
echo.
echo ===================================================
echo.
echo Press any key to exit...
pause > nul
