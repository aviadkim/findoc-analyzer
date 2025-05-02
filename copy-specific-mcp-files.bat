@echo off
echo ===================================================
echo Copying Specific MCP Files
echo ===================================================
echo.

set MCP_FOLDER=C:\Users\aviad\OneDrive\Desktop\MCP
set DEST_FOLDER=C:\Users\aviad\OneDrive\Desktop\backv2-main\important-mcp-files
set LOG_FILE=specific-mcp-files.log

echo Copying Specific MCP Files > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create destination folder
if not exist "%DEST_FOLDER%" mkdir "%DEST_FOLDER%"

REM Copy specific files
echo Copying specific files...
echo Copying specific files... >> %LOG_FILE%

REM Copy global-mcp-setup.bat if it exists
if exist "%MCP_FOLDER%\global-mcp-setup.bat" (
    echo Copying global-mcp-setup.bat...
    echo Copying global-mcp-setup.bat... >> %LOG_FILE%
    xcopy /Y "%MCP_FOLDER%\global-mcp-setup.bat" "%DEST_FOLDER%\" >> %LOG_FILE%
)

REM Copy start-all-mcps.bat if it exists
if exist "%MCP_FOLDER%\start-all-mcps.bat" (
    echo Copying start-all-mcps.bat...
    echo Copying start-all-mcps.bat... >> %LOG_FILE%
    xcopy /Y "%MCP_FOLDER%\start-all-mcps.bat" "%DEST_FOLDER%\" >> %LOG_FILE%
)

REM Copy start-all-mcps-simple.bat if it exists
if exist "%MCP_FOLDER%\start-all-mcps-simple.bat" (
    echo Copying start-all-mcps-simple.bat...
    echo Copying start-all-mcps-simple.bat... >> %LOG_FILE%
    xcopy /Y "%MCP_FOLDER%\start-all-mcps-simple.bat" "%DEST_FOLDER%\" >> %LOG_FILE%
)

REM Copy configure-augment-simple.bat if it exists
if exist "%MCP_FOLDER%\configure-augment-simple.bat" (
    echo Copying configure-augment-simple.bat...
    echo Copying configure-augment-simple.bat... >> %LOG_FILE%
    xcopy /Y "%MCP_FOLDER%\configure-augment-simple.bat" "%DEST_FOLDER%\" >> %LOG_FILE%
)

REM Copy SIMPLE-MCP-SETUP.md if it exists
if exist "%MCP_FOLDER%\SIMPLE-MCP-SETUP.md" (
    echo Copying SIMPLE-MCP-SETUP.md...
    echo Copying SIMPLE-MCP-SETUP.md... >> %LOG_FILE%
    xcopy /Y "%MCP_FOLDER%\SIMPLE-MCP-SETUP.md" "%DEST_FOLDER%\" >> %LOG_FILE%
)

REM Copy any JSON configuration files
if exist "%MCP_FOLDER%\*.json" (
    echo Copying JSON configuration files...
    echo Copying JSON configuration files... >> %LOG_FILE%
    xcopy /Y "%MCP_FOLDER%\*.json" "%DEST_FOLDER%\" >> %LOG_FILE%
)

REM Create subdirectories
mkdir "%DEST_FOLDER%\brave-search-server" 2>nul
mkdir "%DEST_FOLDER%\github-mcp" 2>nul
mkdir "%DEST_FOLDER%\mcp-packages" 2>nul
mkdir "%DEST_FOLDER%\mcp-packages\custom-mcps" 2>nul

REM Copy brave-search-server folder if it exists
if exist "%MCP_FOLDER%\brave-search-server\run-brave-search.js" (
    echo Copying brave-search-server files...
    echo Copying brave-search-server files... >> %LOG_FILE%
    xcopy /Y "%MCP_FOLDER%\brave-search-server\run-brave-search.js" "%DEST_FOLDER%\brave-search-server\" >> %LOG_FILE%
)

REM Copy github-mcp folder if it exists
if exist "%MCP_FOLDER%\github-mcp\*.js" (
    echo Copying github-mcp files...
    echo Copying github-mcp files... >> %LOG_FILE%
    xcopy /Y "%MCP_FOLDER%\github-mcp\*.js" "%DEST_FOLDER%\github-mcp\" >> %LOG_FILE%
)

REM Copy mcp-packages\custom-mcps folder if it exists
if exist "%MCP_FOLDER%\mcp-packages\custom-mcps\*.js" (
    echo Copying custom-mcps JavaScript files...
    echo Copying custom-mcps JavaScript files... >> %LOG_FILE%
    xcopy /Y "%MCP_FOLDER%\mcp-packages\custom-mcps\*.js" "%DEST_FOLDER%\mcp-packages\custom-mcps\" >> %LOG_FILE%
)

if exist "%MCP_FOLDER%\mcp-packages\custom-mcps\*.py" (
    echo Copying custom-mcps Python files...
    echo Copying custom-mcps Python files... >> %LOG_FILE%
    xcopy /Y "%MCP_FOLDER%\mcp-packages\custom-mcps\*.py" "%DEST_FOLDER%\mcp-packages\custom-mcps\" >> %LOG_FILE%
)

if exist "%MCP_FOLDER%\mcp-packages\custom-mcps\*.ts" (
    echo Copying custom-mcps TypeScript files...
    echo Copying custom-mcps TypeScript files... >> %LOG_FILE%
    xcopy /Y "%MCP_FOLDER%\mcp-packages\custom-mcps\*.ts" "%DEST_FOLDER%\mcp-packages\custom-mcps\" >> %LOG_FILE%
)

echo.
echo ===================================================
echo Copy Complete!
echo ===================================================
echo.
echo Important MCP files have been copied to:
echo %DEST_FOLDER%
echo.
echo Check %LOG_FILE% for details.
echo.
echo Press any key to exit...
pause > nul
