@echo off
echo Setting up Brave Search MCP server...
echo.

REM Create directory if it doesn't exist
echo Creating directory...
mkdir "C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server" 2>nul
echo Directory created.
echo.

REM Copy the script file
echo Copying Brave Search MCP script...
copy /Y "brave-search-script.js" "C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server\run-brave-search.js"
echo Script copied.
echo.

REM Install dependencies
echo Installing dependencies...
cd "C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server"
call npm init -y
call npm install @modelcontextprotocol/server node-fetch@2
echo Dependencies installed.
echo.

echo ===================================================
echo Setup Complete!
echo ===================================================
echo.
echo The Brave Search MCP server has been set up at:
echo C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server\run-brave-search.js
echo.
echo Your Augment configuration is already set to use this server.
echo.
echo To test the server, you can run:
echo node C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server\run-brave-search.js
echo.
echo Then in Augment, you can try searching with Brave by asking:
echo "Search for something using Brave"
echo.
echo Press any key to exit...
pause > nul
