@echo off
echo ===================================================
echo Setting up All MCP Servers using NPX
echo ===================================================
echo.

REM Create a directory to store MCP configuration
echo Creating MCP configuration directory...
mkdir "C:\Users\aviad\OneDrive\Desktop\MCP\config" 2>nul
echo Directory created.
echo.

REM Create a configuration file for Augment
echo Creating Augment MCP configuration file...
(
echo {
echo   "mcpServers": {
echo     "braveSearch": {
echo       "command": "cmd",
echo       "args": ["/c", "set", "BRAVE_API_KEY=YOUR_BRAVE_API_KEY", "&&", "node", "C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\brave-search-server\\build\\index.js"]
echo     },
echo     "github": {
echo       "command": "cmd",
echo       "args": ["/c", "set", "GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN", "&&", "npx", "-y", "github-mcp"]
echo     },
echo     "magic": {
echo       "command": "cmd",
echo       "args": ["/c", "npx", "-y", "@21st-dev/magic@latest"]
echo     },
echo     "supabase": {
echo       "command": "cmd",
echo       "args": ["/c", "npx", "-y", "@supabase/mcp-server-supabase@latest", "--access-token", "YOUR_SUPABASE_TOKEN"]
echo     },
echo     "browserTools": {
echo       "command": "cmd",
echo       "args": ["/c", "npx", "-y", "@agentdeskai/browser-tools-mcp@latest"]
echo     },
echo     "firecrawl": {
echo       "command": "cmd",
echo       "args": ["/c", "set", "FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY", "&&", "npx", "-y", "firecrawl-mcp"]
echo     },
echo     "puppeteer": {
echo       "command": "cmd",
echo       "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-puppeteer"]
echo     }
echo   }
echo }
) > "C:\Users\aviad\OneDrive\Desktop\MCP\config\augment-mcp-config.json"
echo Configuration file created.
echo.

REM Create a batch file to start all MCP servers
echo Creating batch file to start all MCP servers...
(
echo @echo off
echo echo Starting all MCP servers...
echo echo.
echo.
echo echo Starting Brave Search MCP...
echo start "Brave Search MCP" cmd /c "set BRAVE_API_KEY=YOUR_BRAVE_API_KEY && node C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server\build\index.js"
echo.
echo echo Starting GitHub MCP...
echo start "GitHub MCP" cmd /c "set GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN && npx -y github-mcp"
echo.
echo echo Starting Magic MCP...
echo start "Magic MCP" cmd /c "npx -y @21st-dev/magic@latest"
echo.
echo echo Starting Supabase MCP...
echo start "Supabase MCP" cmd /c "npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN"
echo.
echo echo Starting Browser Tools MCP...
echo start "Browser Tools MCP" cmd /c "npx -y @agentdeskai/browser-tools-mcp@latest"
echo.
echo echo Starting Firecrawl MCP...
echo start "Firecrawl MCP" cmd /c "set FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY && npx -y firecrawl-mcp"
echo.
echo echo Starting Puppeteer MCP...
echo start "Puppeteer MCP" cmd /c "npx -y @modelcontextprotocol/server-puppeteer"
echo.
echo echo.
echo echo All MCP servers have been started in separate windows.
echo echo.
echo echo Press any key to exit...
echo pause ^> nul
) > "C:\Users\aviad\OneDrive\Desktop\MCP\start-all-mcp.bat"
echo Batch file created.
echo.

REM Create a README file with instructions
echo Creating README file with instructions...
(
echo # MCP Servers for Augment
echo.
echo This directory contains configuration and startup scripts for MCP servers to use with Augment.
echo.
echo ## Files
echo.
echo - `config/augment-mcp-config.json`: Configuration file for Augment
echo - `start-all-mcp.bat`: Batch file to start all MCP servers
echo.
echo ## How to Use
echo.
echo ### Option 1: Configure Augment to Start MCP Servers Automatically
echo.
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Copy the contents of `config/augment-mcp-config.json` into the Augment MCP configuration
echo.
echo ### Option 2: Start MCP Servers Manually
echo.
echo 1. Run `start-all-mcp.bat` to start all MCP servers
echo 2. Configure Augment to connect to the running servers (they run on ports 3000-3008)
echo.
echo ## Available MCP Servers
echo.
echo - Brave Search MCP (Port 3000)
echo - GitHub MCP (Port 3001)
echo - Magic MCP (Port 3003)
echo - Supabase MCP (Port 3004)
echo - Browser Tools MCP (Port 3005)
echo - Firecrawl MCP (Port 3006)
echo - Puppeteer MCP (Port 3007)
) > "C:\Users\aviad\OneDrive\Desktop\MCP\README.md"
echo README file created.
echo.

echo ===================================================
echo Setup Complete!
echo ===================================================
echo.
echo All MCP servers have been configured.
echo.
echo To start all MCP servers:
echo   Run "C:\Users\aviad\OneDrive\Desktop\MCP\start-all-mcp.bat"
echo.
echo To configure Augment:
echo   1. Open Augment
echo   2. Go to Settings
echo   3. Navigate to the MCP section
echo   4. Copy the contents of "C:\Users\aviad\OneDrive\Desktop\MCP\config\augment-mcp-config.json"
echo      into the Augment MCP configuration
echo.
echo Press any key to exit...
pause > nul
