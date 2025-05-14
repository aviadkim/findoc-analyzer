@echo off
echo ===================================================
echo    FinDoc Analyzer - Modern UI Deployment
echo ===================================================
echo.

REM Check if PowerShell script exists
if not exist deploy-modern-ui.ps1 (
    echo ERROR: deploy-modern-ui.ps1 not found!
    echo Please make sure you are in the correct directory.
    echo.
    pause
    exit /b 1
)

echo Starting deployment process...
echo.

REM Run the PowerShell script with bypass execution policy
PowerShell -ExecutionPolicy Bypass -File deploy-modern-ui.ps1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Deployment failed! Check the logs above for details.
    echo.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo Deployment process completed!
echo.
echo Your application should be deployed to:
echo https://findoc-deploy.ey.r.appspot.com
echo.
echo You can verify the deployment in the Google Cloud Console:
echo https://console.cloud.google.com/appengine?project=findoc-deploy
echo ===================================================
echo.
pause
