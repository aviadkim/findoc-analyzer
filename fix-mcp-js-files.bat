@echo off
echo ===================================================
echo Fixing MCP JavaScript Files
echo ===================================================
echo.

set MCP_DIR=C:\Users\aviad\OneDrive\Desktop\MCP\mcp-packages\custom-mcps
set LOG_FILE=fix-mcp-js-files.log
echo MCP JavaScript Files Fix > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

echo Fixing JavaScript files in %MCP_DIR%...
echo Fixing JavaScript files in %MCP_DIR%... >> %LOG_FILE%

for %%f in (%MCP_DIR%\*.js) do (
    echo Checking %%f...
    echo Checking %%f... >> %LOG_FILE%
    
    powershell -Command "(Get-Content '%%f') | ForEach-Object { $_ -replace '^#/usr/bin/env node', '#!/usr/bin/env node' } | Set-Content '%%f'" >> %LOG_FILE% 2>&1
    
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to fix %%f.
        echo [FAILED] Failed to fix %%f. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] Fixed %%f.
        echo [SUCCESS] Fixed %%f. >> %LOG_FILE%
    )
    echo. >> %LOG_FILE%
)

echo.
echo ===================================================
echo Fix Complete!
echo ===================================================
echo.
echo Fix results have been saved to %LOG_FILE%
echo.
echo Next Steps:
echo 1. Run start-augment-mcps.bat to start all MCPs
echo 2. Restart Augment to use the fixed MCPs
echo.
echo Press any key to exit...
pause > nul
