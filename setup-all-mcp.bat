@echo off
echo ===================================================
echo Setting up ALL MCP Servers for Augment
echo ===================================================
echo.

REM Create main MCP directory if it doesn't exist
echo Creating MCP directory structure...
mkdir "C:\Users\aviad\Documents\MCP" 2>nul
cd "C:\Users\aviad\Documents\MCP"
echo.

REM Create a configuration file for Augment
echo Creating Augment MCP configuration file...
echo {> "augment-mcp-config.json"
echo   "mcpServers": {>> "augment-mcp-config.json"
echo     "braveSearch": {>> "augment-mcp-config.json"
echo       "command": "cmd",>> "augment-mcp-config.json"
echo       "args": ["/c", "npx", "-y", "brave-search-mcp"],>> "augment-mcp-config.json"
echo       "env": {>> "augment-mcp-config.json"
echo         "BRAVE_API_KEY": "BSAN7HoBWjJOUG-zXVN8rkIGXpbsRtq">> "augment-mcp-config.json"
echo       }>> "augment-mcp-config.json"
echo     },>> "augment-mcp-config.json"
echo     "github": {>> "augment-mcp-config.json"
echo       "command": "cmd",>> "augment-mcp-config.json"
echo       "args": ["/c", "npx", "-y", "github-mcp"],>> "augment-mcp-config.json"
echo       "env": {>> "augment-mcp-config.json"
echo         "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN">> "augment-mcp-config.json"
echo       }>> "augment-mcp-config.json"
echo     },>> "augment-mcp-config.json"
echo     "sqlite": {>> "augment-mcp-config.json"
echo       "command": "cmd",>> "augment-mcp-config.json"
echo       "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-sqlite", "--db-path", "C:\\Users\\aviad\\test.db"]>> "augment-mcp-config.json"
echo     },>> "augment-mcp-config.json"
echo     "magic": {>> "augment-mcp-config.json"
echo       "command": "cmd",>> "augment-mcp-config.json"
echo       "args": ["/c", "npx", "-y", "@21st-dev/magic@latest"]>> "augment-mcp-config.json"
echo     },>> "augment-mcp-config.json"
echo     "supabase": {>> "augment-mcp-config.json"
echo       "command": "cmd",>> "augment-mcp-config.json"
echo       "args": ["/c", "npx", "-y", "@supabase/mcp-server-supabase@latest", "--access-token", "YOUR_SUPABASE_TOKEN"]>> "augment-mcp-config.json"
echo     },>> "augment-mcp-config.json"
echo     "browserTools": {>> "augment-mcp-config.json"
echo       "command": "cmd",>> "augment-mcp-config.json"
echo       "args": ["/c", "npx", "-y", "@agentdeskai/browser-tools-mcp@latest"]>> "augment-mcp-config.json"
echo     },>> "augment-mcp-config.json"
echo     "firecrawl": {>> "augment-mcp-config.json"
echo       "command": "cmd",>> "augment-mcp-config.json"
echo       "args": ["/c", "npx", "-y", "firecrawl-mcp"],>> "augment-mcp-config.json"
echo       "env": {>> "augment-mcp-config.json"
echo         "FIRECRAWL_API_KEY": "fc-857417811665460e92716b92e08ec398">> "augment-mcp-config.json"
echo       }>> "augment-mcp-config.json"
echo     },>> "augment-mcp-config.json"
echo     "puppeteer": {>> "augment-mcp-config.json"
echo       "command": "cmd",>> "augment-mcp-config.json"
echo       "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-puppeteer"]>> "augment-mcp-config.json"
echo     }>> "augment-mcp-config.json"
echo   }>> "augment-mcp-config.json"
echo }>> "augment-mcp-config.json"
echo Configuration file created.
echo.

REM Create a batch file to start all MCP servers
echo Creating batch file to start all MCP servers...
echo @echo off> "start-all-mcp.bat"
echo echo Starting all MCP servers...>> "start-all-mcp.bat"
echo echo.>> "start-all-mcp.bat"
echo.>> "start-all-mcp.bat"
echo echo Starting Brave Search MCP...>> "start-all-mcp.bat"
echo start "Brave Search MCP" cmd /c "set BRAVE_API_KEY=YOUR_BRAVE_API_KEY && npx -y brave-search-mcp">> "start-all-mcp.bat"
echo.>> "start-all-mcp.bat"
echo echo Starting GitHub MCP...>> "start-all-mcp.bat"
echo start "GitHub MCP" cmd /c "set GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN && npx -y github-mcp">> "start-all-mcp.bat"
echo.>> "start-all-mcp.bat"
echo echo Starting SQLite MCP...>> "start-all-mcp.bat"
echo start "SQLite MCP" cmd /c "npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db">> "start-all-mcp.bat"
echo.>> "start-all-mcp.bat"
echo echo Starting Magic MCP...>> "start-all-mcp.bat"
echo start "Magic MCP" cmd /c "npx -y @21st-dev/magic@latest">> "start-all-mcp.bat"
echo.>> "start-all-mcp.bat"
echo echo Starting Supabase MCP...>> "start-all-mcp.bat"
echo start "Supabase MCP" cmd /c "npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN">> "start-all-mcp.bat"
echo.>> "start-all-mcp.bat"
echo echo Starting Browser Tools MCP...>> "start-all-mcp.bat"
echo start "Browser Tools MCP" cmd /c "npx -y @agentdeskai/browser-tools-mcp@latest">> "start-all-mcp.bat"
echo.>> "start-all-mcp.bat"
echo echo Starting Firecrawl MCP...>> "start-all-mcp.bat"
echo start "Firecrawl MCP" cmd /c "set FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY && npx -y firecrawl-mcp">> "start-all-mcp.bat"
echo.>> "start-all-mcp.bat"
echo echo Starting Puppeteer MCP...>> "start-all-mcp.bat"
echo start "Puppeteer MCP" cmd /c "npx -y @modelcontextprotocol/server-puppeteer">> "start-all-mcp.bat"
echo.>> "start-all-mcp.bat"
echo echo.>> "start-all-mcp.bat"
echo echo All MCP servers have been started in separate windows.>> "start-all-mcp.bat"
echo echo.>> "start-all-mcp.bat"
echo echo Press any key to exit...>> "start-all-mcp.bat"
echo pause ^> nul>> "start-all-mcp.bat"
echo Batch file created.
echo.

REM Create a README file with instructions
echo Creating README file with instructions...
echo # MCP Servers for Augment> "README.md"
echo.>> "README.md"
echo This directory contains configuration and startup scripts for MCP servers to use with Augment.>> "README.md"
echo.>> "README.md"
echo ## Files>> "README.md"
echo.>> "README.md"
echo - `augment-mcp-config.json`: Configuration file for Augment>> "README.md"
echo - `start-all-mcp.bat`: Batch file to start all MCP servers>> "README.md"
echo.>> "README.md"
echo ## How to Use>> "README.md"
echo.>> "README.md"
echo ### Option 1: Configure Augment to Start MCP Servers Automatically>> "README.md"
echo.>> "README.md"
echo 1. Open Augment>> "README.md"
echo 2. Go to Settings >> "README.md"
echo 3. Navigate to the MCP section>> "README.md"
echo 4. Copy the contents of `augment-mcp-config.json` into the Augment MCP configuration>> "README.md"
echo.>> "README.md"
echo ### Option 2: Start MCP Servers Manually>> "README.md"
echo.>> "README.md"
echo 1. Run `start-all-mcp.bat` to start all MCP servers>> "README.md"
echo 2. Configure Augment to connect to the running servers (they run on ports 3000-3008)>> "README.md"
echo.>> "README.md"
echo ## Available MCP Servers>> "README.md"
echo.>> "README.md"
echo - Brave Search MCP (Port 3000)>> "README.md"
echo - GitHub MCP (Port 3001)>> "README.md"
echo - SQLite MCP (Port 3002)>> "README.md"
echo - Magic MCP (Port 3003)>> "README.md"
echo - Supabase MCP (Port 3004)>> "README.md"
echo - Browser Tools MCP (Port 3005)>> "README.md"
echo - Firecrawl MCP (Port 3006)>> "README.md"
echo - Puppeteer MCP (Port 3007)>> "README.md"
echo README file created.
echo.

echo ===================================================
echo Setup Complete!
echo ===================================================
echo.
echo All MCP servers have been configured.
echo.
echo To start all MCP servers:
echo   Run "C:\Users\aviad\Documents\MCP\start-all-mcp.bat"
echo.
echo To configure Augment:
echo   1. Open Augment
echo   2. Go to Settings
echo   3. Navigate to the MCP section
echo   4. Copy the contents of "C:\Users\aviad\Documents\MCP\augment-mcp-config.json"
echo      into the Augment MCP configuration
echo.
echo Press any key to exit...
pause > nul
