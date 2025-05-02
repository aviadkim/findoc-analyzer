@echo off
echo ===================================================
echo Setting up SQLite MCP Server
echo ===================================================
echo.

REM Create test database directory if it doesn't exist
echo Creating test database...
echo .quit | sqlite3 "C:\Users\aviad\test.db"
echo Test database created.
echo.

echo ===================================================
echo SQLite MCP Server Setup Complete!
echo ===================================================
echo.
echo To configure Augment to use this server:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Add a new MCP server with:
echo    - Name: SQLite MCP
echo    - Command: cmd /c npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db
echo.
echo To test the server, you can run:
echo npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db
echo.
echo Press any key to exit...
pause > nul
