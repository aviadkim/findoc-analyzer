@echo off
echo ===================================================
echo Listing and Copying MCP Files
echo ===================================================
echo.

set MCP_FOLDER=C:\Users\aviad\OneDrive\Desktop\MCP
set DEST_FOLDER=C:\Users\aviad\OneDrive\Desktop\backv2-main\mcp-files
set LOG_FILE=mcp-files-list.log

echo Listing MCP Files > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create destination folder
if not exist "%DEST_FOLDER%" mkdir "%DEST_FOLDER%"

REM List MCP folder contents
echo Listing MCP folder contents...
echo Listing MCP folder contents... >> %LOG_FILE%
dir "%MCP_FOLDER%" /b >> %LOG_FILE%
echo. >> %LOG_FILE%

REM List subdirectories
echo Listing subdirectories...
echo Listing subdirectories... >> %LOG_FILE%
for /d %%d in ("%MCP_FOLDER%\*") do (
    echo Directory: %%~nxd >> %LOG_FILE%
    dir "%%d" /b >> %LOG_FILE%
    echo. >> %LOG_FILE%
)

echo.
echo ===================================================
echo Listing Complete!
echo ===================================================
echo.
echo MCP folder contents have been listed in:
echo %LOG_FILE%
echo.
echo Press any key to continue to copying files...
pause > nul

echo.
echo ===================================================
echo Copying Important MCP Files
echo ===================================================
echo.

REM Copy important files
echo Copying important files...

REM Copy configuration files
if exist "%MCP_FOLDER%\*.json" (
    echo Copying JSON configuration files...
    xcopy /Y "%MCP_FOLDER%\*.json" "%DEST_FOLDER%\"
)

REM Copy batch files
if exist "%MCP_FOLDER%\*.bat" (
    echo Copying batch files...
    xcopy /Y "%MCP_FOLDER%\*.bat" "%DEST_FOLDER%\"
)

REM Copy markdown files
if exist "%MCP_FOLDER%\*.md" (
    echo Copying markdown files...
    xcopy /Y "%MCP_FOLDER%\*.md" "%DEST_FOLDER%\"
)

REM Copy JavaScript files
if exist "%MCP_FOLDER%\*.js" (
    echo Copying JavaScript files...
    xcopy /Y "%MCP_FOLDER%\*.js" "%DEST_FOLDER%\"
)

REM Copy brave-search-server folder if it exists
if exist "%MCP_FOLDER%\brave-search-server" (
    echo Copying brave-search-server folder...
    xcopy /Y /E /I "%MCP_FOLDER%\brave-search-server" "%DEST_FOLDER%\brave-search-server"
)

REM Copy mcp-packages folder if it exists
if exist "%MCP_FOLDER%\mcp-packages" (
    echo Copying mcp-packages folder...
    xcopy /Y /E /I "%MCP_FOLDER%\mcp-packages" "%DEST_FOLDER%\mcp-packages"
)

echo.
echo ===================================================
echo Copy Complete!
echo ===================================================
echo.
echo Important MCP files have been copied to:
echo %DEST_FOLDER%
echo.
echo Press any key to exit...
pause > nul
