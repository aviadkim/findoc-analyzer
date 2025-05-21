@echo off
:: FinDoc Analyzer QA Fixes
:: This script applies all QA fixes to the FinDoc Analyzer application.

echo ===================================================
echo           FinDoc Analyzer QA Fixes
echo ===================================================

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Run the apply-qa-fixes.js script
echo Applying QA fixes...
node apply-qa-fixes.js

if %ERRORLEVEL% neq 0 (
    echo Error: Failed to apply QA fixes.
    exit /b 1
)

echo ===================================================
echo QA fixes applied successfully!
echo Please restart your server to apply the changes.
echo ===================================================

:: Prompt to restart the server
set /p restart="Do you want to restart the server now? (y/n): "
if /i "%restart%"=="y" (
    echo Restarting server...
    
    :: Check if server is running
    tasklist /fi "imagename eq node.exe" | find "node.exe" >nul
    if %ERRORLEVEL% equ 0 (
        :: Kill existing Node.js processes
        echo Stopping existing Node.js processes...
        taskkill /f /im node.exe >nul 2>&1
    )
    
    :: Start the server
    echo Starting server...
    start cmd /k "node server.js"
    
    echo Server restarted successfully!
) else (
    echo Please restart the server manually to apply the changes.
)

pause
