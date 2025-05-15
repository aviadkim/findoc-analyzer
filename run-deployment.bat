@echo off
setlocal enabledelayedexpansion

REM Set colors for console output
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "RESET=[0m"

cls
echo %YELLOW%====================================================%RESET%
echo %YELLOW%    FinDoc Analyzer - Modern UI Deployment%RESET%
echo %YELLOW%====================================================%RESET%
echo.

REM Get timestamp for logging
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,8%-%dt:~8,6%"
set "LOG_FILE=deployment-log-%TIMESTAMP%.txt"

REM Start logging
echo Deployment started at %TIME% on %DATE% > "%LOG_FILE%"
echo Environment: >> "%LOG_FILE%"
echo   - Windows version: %OS% >> "%LOG_FILE%"
echo   - Current directory: %CD% >> "%LOG_FILE%"

REM Create a function for logging
:log
    set "message=%~1"
    set "type=%~2"
    if "%type%"=="" set "type=INFO"
    
    echo [%TIME%] %type%: %message%
    echo [%TIME%] %type%: %message% >> "%LOG_FILE%"
    goto :eof

REM Check prerequisites
call :log "Checking prerequisites..." "INFO"

REM Check if PowerShell is available
where powershell >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :log "PowerShell is not available or not in PATH" "ERROR"
    call :log "Please install PowerShell to continue" "ERROR"
    echo %RED%ERROR: PowerShell is required but not found!%RESET%
    pause
    exit /b 1
)

REM Check if PowerShell script exists
if not exist deploy-modern-ui.ps1 (
    call :log "deploy-modern-ui.ps1 not found" "ERROR"
    echo %RED%ERROR: deploy-modern-ui.ps1 not found!%RESET%
    echo Please make sure you are in the correct directory.
    echo.
    pause
    exit /b 1
)

REM Check if the deployment files exist
if not exist app.yaml (
    call :log "app.yaml not found" "ERROR"
    echo %RED%ERROR: app.yaml not found!%RESET%
    echo This file is required for Google App Engine deployment.
    echo.
    pause
    exit /b 1
)

REM Check if server.js exists
if not exist server.js (
    if exist server-enhanced.js (
        call :log "server.js not found, but server-enhanced.js exists" "WARNING"
        echo %YELLOW%WARNING: server.js not found, but server-enhanced.js exists.%RESET%
        echo The deployment script will copy server-enhanced.js to server.js.
        echo.
    ) else (
        call :log "Neither server.js nor server-enhanced.js found" "ERROR"
        echo %RED%ERROR: Neither server.js nor server-enhanced.js found!%RESET%
        echo At least one of these files is required for deployment.
        echo.
        pause
        exit /b 1
    )
)

REM Check if Google Cloud SDK is installed
where gcloud >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :log "Google Cloud SDK (gcloud) not found" "WARNING"
    echo %YELLOW%WARNING: Google Cloud SDK (gcloud) not found in PATH!%RESET%
    echo The deployment may fail if Google Cloud SDK is not installed.
    echo You can download it from: https://cloud.google.com/sdk/docs/install
    echo.
    choice /C YN /M "Do you want to continue anyway?"
    if !ERRORLEVEL! NEQ 1 (
        call :log "User cancelled deployment due to missing Google Cloud SDK" "INFO"
        echo Deployment cancelled.
        pause
        exit /b 0
    )
)

REM All checks passed, start deployment
call :log "Starting deployment process..." "INFO"
echo %BLUE%Starting deployment process...%RESET%
echo.

REM Run the PowerShell script with bypass execution policy and capture start time
set "START_TIME=%TIME%"
call :log "Running deploy-modern-ui.ps1" "INFO"
echo %BLUE%Running PowerShell deployment script...%RESET%
PowerShell -ExecutionPolicy Bypass -File deploy-modern-ui.ps1

if %ERRORLEVEL% NEQ 0 (
    REM Deployment failed
    call :log "PowerShell deployment script failed with error code %ERRORLEVEL%" "ERROR"
    echo.
    echo %RED%ERROR: Deployment failed! Check the logs above for details.%RESET%
    echo.
    echo Detailed logs have been saved to: %LOG_FILE%
    echo.
    echo %YELLOW%Troubleshooting tips:%RESET%
    echo 1. Check your Google Cloud credentials
    echo 2. Verify that the project ID is correct
    echo 3. Make sure App Engine API is enabled for your project
    echo 4. Check your internet connection
    echo.
    pause
    exit /b 1
) else (
    REM Deployment succeeded
    set "END_TIME=%TIME%"
    
    REM Calculate duration (simplified, doesn't handle midnight crossing)
    for /F "tokens=1-4 delims=:.," %%a in ("%START_TIME%") do (
        set /A "start=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100"
    )
    for /F "tokens=1-4 delims=:.," %%a in ("%END_TIME%") do (
        set /A "end=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100"
    )
    set /A "duration=(end-start)/100"
    set /A "minutes=duration/60"
    set /A "seconds=duration%%60"
    
    call :log "Deployment completed successfully in %minutes% minutes and %seconds% seconds" "INFO"
    
    echo.
    echo %YELLOW%====================================================%RESET%
    echo %GREEN%Deployment process completed successfully!%RESET%
    echo %YELLOW%====================================================%RESET%
    echo.
    echo Your application should be deployed to:
    echo %BLUE%https://findoc-deploy.ey.r.appspot.com%RESET%
    echo.
    echo You can verify the deployment in the Google Cloud Console:
    echo %BLUE%https://console.cloud.google.com/appengine?project=findoc-deploy%RESET%
    echo.
    echo Deployment duration: %GREEN%%minutes% minutes and %seconds% seconds%RESET%
    echo Deployment log: %LOG_FILE%
    echo %YELLOW%====================================================%RESET%
    echo.
    pause
    exit /b 0
)

endlocal
