@echo off
echo ===================================================
echo Fixing Git MCP
echo ===================================================
echo.

set LOG_FILE=fix-git-mcp.log
echo Fixing Git MCP > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

echo Checking if Git is installed...
echo Checking if Git is installed... >> %LOG_FILE%
git --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Git is not installed or not in PATH.
    echo [WARNING] Git is not installed or not in PATH. >> %LOG_FILE%
    echo Please install Git from https://git-scm.com/downloads
    echo Please install Git from https://git-scm.com/downloads >> %LOG_FILE%
) else (
    echo [SUCCESS] Git is installed.
    echo [SUCCESS] Git is installed. >> %LOG_FILE%
    echo Creating improved Git MCP wrapper...
    echo Creating improved Git MCP wrapper... >> %LOG_FILE%
    
    REM Create an improved wrapper script for Git MCP
    echo @echo off > git-mcp-wrapper-improved.bat
    echo setlocal enabledelayedexpansion >> git-mcp-wrapper-improved.bat
    echo. >> git-mcp-wrapper-improved.bat
    echo set REPO_PATH=%%1 >> git-mcp-wrapper-improved.bat
    echo if "%%REPO_PATH%%"=="." set REPO_PATH=%%CD%% >> git-mcp-wrapper-improved.bat
    echo. >> git-mcp-wrapper-improved.bat
    echo echo Git MCP Wrapper >> git-mcp-wrapper-improved.bat
    echo echo Repository Path: !REPO_PATH! >> git-mcp-wrapper-improved.bat
    echo echo. >> git-mcp-wrapper-improved.bat
    echo. >> git-mcp-wrapper-improved.bat
    echo python -m git_mcp --repo-path="!REPO_PATH!" %%2 %%3 %%4 %%5 %%6 %%7 %%8 %%9 >> git-mcp-wrapper-improved.bat
    
    echo [SUCCESS] Created improved Git MCP wrapper script: git-mcp-wrapper-improved.bat
    echo [SUCCESS] Created improved Git MCP wrapper script: git-mcp-wrapper-improved.bat >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo ===================================================
echo Fix Complete!
echo ===================================================
echo.
echo Check %LOG_FILE% for details.
echo.
echo Next Steps:
echo 1. Use git-mcp-wrapper-improved.bat instead of git-mcp-wrapper.bat
echo 2. Update start-all-no-api-mcps.bat to use the improved wrapper
echo.
echo Press any key to exit...
pause > nul
