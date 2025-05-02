@echo off
echo ===================================================
echo Setting up GitHub MCP Server in your MCP folder
echo ===================================================
echo.

REM Create directory if it doesn't exist
echo Creating directory...
mkdir "C:\Users\aviad\OneDrive\Desktop\MCP\github-mcp" 2>nul
echo Directory created.
echo.

REM Copy the script file
echo Copying GitHub MCP script...
copy /Y "github-mcp.js" "C:\Users\aviad\OneDrive\Desktop\MCP\github-mcp\github-mcp.js"
echo Script copied.
echo.

REM Install dependencies
echo Installing dependencies...
cd "C:\Users\aviad\OneDrive\Desktop\MCP\github-mcp"
call npm init -y
call npm install @modelcontextprotocol/server @octokit/rest
echo Dependencies installed.
echo.

echo ===================================================
echo GitHub MCP Server Setup Complete!
echo ===================================================
echo.
echo The GitHub MCP server has been set up at:
echo C:\Users\aviad\OneDrive\Desktop\MCP\github-mcp\github-mcp.js
echo.
echo To configure Augment to use this server:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Add a new MCP server with:
echo    - Name: GitHub MCP
echo    - Command: cmd /c "set GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN && node C:\Users\aviad\OneDrive\Desktop\MCP\github-mcp\github-mcp.js"
echo.
echo Press any key to exit...
pause > nul
