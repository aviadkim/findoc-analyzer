@echo off
echo Setting up MCP servers...
echo.

REM Create directories if they don't exist
echo Creating directories...
mkdir "C:\Users\aviad\Documents\Cline\MCP\brave-search" 2>nul
mkdir "C:\Users\aviad\Documents\Cline\MCP\github" 2>nul
echo Directories created.
echo.

REM Copy files
echo Copying MCP server scripts...
copy /Y "run-brave-search.js" "C:\Users\aviad\Documents\Cline\MCP\brave-search\run-brave-search.js"
copy /Y "run-github.js" "C:\Users\aviad\Documents\Cline\MCP\github\run-github.js"
echo Files copied.
echo.

REM Install dependencies
echo Installing dependencies...
cd "C:\Users\aviad\Documents\Cline\MCP\brave-search"
call npm init -y
call npm install @modelcontextprotocol/server node-fetch@2
echo Brave Search MCP dependencies installed.
echo.

cd "C:\Users\aviad\Documents\Cline\MCP\github"
call npm init -y
call npm install @modelcontextprotocol/server @octokit/rest
echo GitHub MCP dependencies installed.
echo.

echo MCP servers setup complete!
echo.
echo To start the Brave Search MCP server:
echo set BRAVE_API_KEY=YOUR_BRAVE_API_KEY ^&^& node C:\Users\aviad\Documents\Cline\MCP\brave-search\run-brave-search.js
echo.
echo To start the GitHub MCP server:
echo set GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN ^&^& node C:\Users\aviad\Documents\Cline\MCP\github\run-github.js
echo.
echo Press any key to exit...
pause > nul
