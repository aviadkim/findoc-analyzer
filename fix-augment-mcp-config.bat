@echo off
echo ===================================================
echo Fixing Augment MCP Configuration
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
echo       "command": "npx -y github-mcp",>> "%USERPROFILE%\.augment\mcp-config.json"
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
echo       "command": "python -m git_mcp",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "Puppeteer MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-puppeteer",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     },>> "%USERPROFILE%\.augment\mcp-config.json"
echo     {>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "name": "SQLite MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "npx -y @modelcontextprotocol/server-sqlite --db-path C:\\Users\\aviad\\test.db",>> "%USERPROFILE%\.augment\mcp-config.json"
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
echo       "name": "Semgrep MCP",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "command": "python -m semgrep_mcp",>> "%USERPROFILE%\.augment\mcp-config.json"
echo       "env": {}>> "%USERPROFILE%\.augment\mcp-config.json"
echo     }>> "%USERPROFILE%\.augment\mcp-config.json"
echo   ]>> "%USERPROFILE%\.augment\mcp-config.json"
echo }>> "%USERPROFILE%\.augment\mcp-config.json"

echo.
echo ===================================================
echo Augment MCP Configuration Fix Complete!
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
