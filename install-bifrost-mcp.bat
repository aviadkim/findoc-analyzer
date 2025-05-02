@echo off
echo ===================================================
echo Installing BifrostMCP VSCode Extension
echo ===================================================
echo.

set LOG_FILE=bifrost-mcp-installation.log
echo BifrostMCP Installation Log > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a directory for logs if it doesn't exist
mkdir logs 2>nul

echo Installing BifrostMCP VSCode Extension...
call code --install-extension ConnorHallman.bifrost-mcp
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install BifrostMCP VSCode Extension.
    echo [FAILED] Failed to install BifrostMCP VSCode Extension. >> %LOG_FILE%
    echo Error code: %ERRORLEVEL% >> %LOG_FILE%
) else (
    echo [SUCCESS] BifrostMCP VSCode Extension installed successfully.
    echo [SUCCESS] BifrostMCP VSCode Extension installed successfully. >> %LOG_FILE%
)

echo.
echo ===================================================
echo Installation Complete!
echo ===================================================
echo.
echo Installation results have been saved to %LOG_FILE%
echo.
echo Press any key to exit...
pause > nul
