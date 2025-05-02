@echo off
echo ===================================================
echo Add More MCP Servers from GitHub
echo ===================================================
echo.

set MCP_FOLDER=C:\Users\aviad\OneDrive\Desktop\MCP
set REPO_URL=https://github.com/modelcontextprotocol/servers.git
set TEMP_FOLDER=%MCP_FOLDER%\temp-mcp-servers

echo Creating temporary folder...
mkdir "%TEMP_FOLDER%" 2>nul
cd "%TEMP_FOLDER%"

echo Cloning the repository...
git clone %REPO_URL% .

echo.
echo Available MCP servers:
echo.
dir /b src

echo.
set /p SERVER_NAME=Enter the name of the MCP server you want to add (e.g., neo4j): 

if not exist "src\%SERVER_NAME%" (
    echo.
    echo Error: MCP server "%SERVER_NAME%" not found in the repository.
    echo Please check the available servers and try again.
    goto :cleanup
)

echo.
echo Installing %SERVER_NAME% MCP server...
cd "src\%SERVER_NAME%"

if exist "package.json" (
    echo Installing Node.js dependencies...
    npm install
    npm link
) else if exist "setup.py" (
    echo Installing Python dependencies...
    pip install -e .
) else (
    echo.
    echo Error: Could not determine how to install this MCP server.
    echo Please check the server's documentation for installation instructions.
    goto :cleanup
)

echo.
echo %SERVER_NAME% MCP server installed successfully!
echo.
echo To configure this MCP server in Augment:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Add a new MCP server with the following configuration:
echo    - Name: %SERVER_NAME% MCP
echo    - Command: npx -y @modelcontextprotocol/server-%SERVER_NAME%
echo    - Environment Variables: Check the server's documentation for required variables
echo.

:cleanup
echo Cleaning up...
cd "%MCP_FOLDER%"
rmdir /s /q "%TEMP_FOLDER%"

echo.
echo ===================================================
echo Done!
echo ===================================================
echo.
echo Press any key to exit...
pause > nul
