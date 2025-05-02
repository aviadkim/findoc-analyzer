@echo off
echo ===================================================
echo Installing Top 15 MCP Servers for Coding
echo ===================================================
echo.

echo Creating MCP directories...
mkdir "C:\Users\aviad\OneDrive\Desktop\MCP\config" 2>nul
echo Directories created.
echo.

echo Installing Brave Search MCP...
call npm install -g brave-search-mcp

echo Installing GitHub MCP...
call npm install -g @modelcontextprotocol/server-github

echo Installing Git MCP...
call pip install mcp-server-git

echo Installing Filesystem MCP...
call npm install -g @modelcontextprotocol/server-filesystem

echo Installing Magic MCP...
call npm install -g @21st-dev/magic@latest

echo Installing Fetch MCP...
call npm install -g @modelcontextprotocol/server-fetch

echo Installing SQLite MCP...
call npm install -g @modelcontextprotocol/server-sqlite

echo Installing PostgreSQL MCP...
call npm install -g @modelcontextprotocol/server-postgres

echo Installing Memory MCP...
call npm install -g @modelcontextprotocol/server-memory

echo Installing Puppeteer MCP...
call npm install -g @modelcontextprotocol/server-puppeteer

echo Installing Sequential Thinking MCP...
call npm install -g @modelcontextprotocol/server-sequentialthinking

echo Installing OpenAPI MCP...
call npm install -g openapi-mcp-server

echo Installing Browser Tools MCP...
call npm install -g @agentdeskai/browser-tools-mcp@latest

echo Installing Redis MCP...
call npm install -g @modelcontextprotocol/server-redis

echo Installing Supabase MCP...
call npm install -g @supabase/mcp-server-supabase@latest

echo.
echo Creating Augment configuration file...
(
echo {
echo   "mcpServers": {
echo     "braveSearch": {
echo       "command": "npx",
echo       "args": ["-y", "brave-search-mcp"],
echo       "env": {
echo         "BRAVE_API_KEY": "BSAN7HoBWjJOUG-zXVN8rkIGXpbsRtq"
echo       }
echo     },
echo     "github": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-github"],
echo       "env": {
echo         "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN"
echo       }
echo     },
echo     "git": {
echo       "command": "python",
echo       "args": ["-m", "mcp_server_git"]
echo     },
echo     "filesystem": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-filesystem"]
echo     },
echo     "magic": {
echo       "command": "npx",
echo       "args": ["-y", "@21st-dev/magic@latest"]
echo     },
echo     "fetch": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-fetch"]
echo     },
echo     "sqlite": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "C:\\Users\\aviad\\test.db"]
echo     },
echo     "postgres": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-postgres"]
echo     },
echo     "memory": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-memory"]
echo     },
echo     "puppeteer": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
echo     },
echo     "sequentialThinking": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-sequentialthinking"]
echo     },
echo     "openapi": {
echo       "command": "npx",
echo       "args": ["-y", "openapi-mcp-server"]
echo     },
echo     "browserTools": {
echo       "command": "npx",
echo       "args": ["-y", "@agentdeskai/browser-tools-mcp@latest"]
echo     },
echo     "redis": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-redis"]
echo     },
echo     "supabase": {
echo       "command": "npx",
echo       "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "YOUR_SUPABASE_TOKEN"]
echo     }
echo   }
echo }
) > "C:\Users\aviad\OneDrive\Desktop\MCP\config\top-mcp-config.json"
echo Configuration file created.
echo.

echo ===================================================
echo Installation Complete!
echo ===================================================
echo.
echo To configure Augment:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Copy the contents of "C:\Users\aviad\OneDrive\Desktop\MCP\config\top-mcp-config.json"
echo    into the Augment MCP configuration
echo.
echo Press any key to exit...
pause > nul
