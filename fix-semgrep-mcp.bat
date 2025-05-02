@echo off
echo ===================================================
echo Fixing Semgrep MCP
echo ===================================================
echo.

set LOG_FILE=fix-semgrep-mcp.log
echo Fixing Semgrep MCP > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

echo Installing Semgrep...
echo Installing Semgrep... >> %LOG_FILE%
pip install semgrep >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install Semgrep.
    echo [FAILED] Failed to install Semgrep. >> %LOG_FILE%
    echo Please install Semgrep manually: pip install semgrep
    echo Please install Semgrep manually: pip install semgrep >> %LOG_FILE%
) else (
    echo [SUCCESS] Semgrep installed.
    echo [SUCCESS] Semgrep installed. >> %LOG_FILE%
    
    REM Add Python Scripts to PATH
    echo Adding Python Scripts to PATH...
    echo Adding Python Scripts to PATH... >> %LOG_FILE%
    for /f "tokens=*" %%a in ('python -c "import site; print(site.USER_BASE)"') do set USER_BASE=%%a
    set PYTHON_SCRIPTS=%USER_BASE%\Scripts
    echo Python Scripts directory: %PYTHON_SCRIPTS% >> %LOG_FILE%
    
    setx PATH "%PATH%;%PYTHON_SCRIPTS%" >> %LOG_FILE% 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Failed to add Python Scripts to PATH.
        echo [WARNING] Failed to add Python Scripts to PATH. >> %LOG_FILE%
        echo Please add %PYTHON_SCRIPTS% to your PATH manually.
        echo Please add %PYTHON_SCRIPTS% to your PATH manually. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] Python Scripts added to PATH.
        echo [SUCCESS] Python Scripts added to PATH. >> %LOG_FILE%
    )
)
echo. >> %LOG_FILE%

echo ===================================================
echo Fix Complete!
echo ===================================================
echo.
echo Check %LOG_FILE% for details.
echo.
echo Next Steps:
echo 1. Restart your command prompt to apply PATH changes
echo 2. Run start-all-no-api-mcps.bat to start all MCPs
echo.
echo Press any key to exit...
pause > nul
