@echo off
echo ===================================================
echo Setting up Augment MCP Configuration
echo ===================================================
echo.

REM Create the .augment directory if it doesn't exist
if not exist "%USERPROFILE%\.augment" (
    echo Creating .augment directory...
    mkdir "%USERPROFILE%\.augment"
)

REM Create the MCP configuration file
echo Creating MCP configuration file...
echo {> "%USERPROFILE%\.augment\mcp-config.json"
echo   "mcps": [>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "GitHub MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-github",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Memory MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-memory",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Filesystem MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-filesystem",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Fetch MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-fetch",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Time MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-time",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Sequential Thinking MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-sequentialthinking",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Git MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "python -m mcp_server_git",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "TypeScript MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "node C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\typescript-mcp.js",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "ESLint MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "node C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\eslint-mcp.js",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Prettier MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "node C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\prettier-mcp.js",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Jest MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "node C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\jest-mcp.js",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Puppeteer MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-puppeteer",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Docker MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "node C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\docker-mcp.js",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Kubernetes MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y kubernetes-mcp",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "VSCode MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "node C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\vscode-mcp.js",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "SQLite MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-sqlite --db-path C:\\Users\\aviad\\test.db",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "PostgreSQL MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-postgres",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Redis MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-redis",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Langchain MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "node C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\langchain-mcp.js",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Qdrant MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "python C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\qdrant_mcp.py",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Semgrep MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "python -m semgrep_mcp",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Brave Search MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "node C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\brave-search-mcp.js",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Magic MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @21st-dev/magic@latest",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Browser Tools MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @agentdeskai/browser-tools-mcp@latest",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Firecrawl MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y firecrawl-mcp",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Supabase MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @supabase/mcp-server-supabase@latest --access-token sbp_cdcfec9d48c88f29d0e7c24a36cc450104b35055",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     }>> "%USERPROFILE%\.augment\mcp-config.json"
echo   ]>> "%USERPROFILE%\.augment\mcp-config.json"
echo }>> "%USERPROFILE%\.augment\mcp-config.json"

echo.
echo ===================================================
echo Augment MCP Configuration Setup Complete!
echo ===================================================
echo.
echo The MCP configuration has been saved to: %USERPROFILE%\.augment\mcp-config.json
echo.
echo Next Steps:
echo 1. Run start-augment-mcps.bat to start all MCPs
echo 2. Restart Augment to use the new MCP configuration
echo.
echo Press any key to exit...
pause > nul
