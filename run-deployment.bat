@echo off
echo Starting Modern UI Deployment...
echo.
PowerShell -ExecutionPolicy Bypass -File deploy-modern-ui.ps1
echo.
echo If the script has completed, your application should be deployed to:
echo https://findoc-deploy.ey.r.appspot.com
echo.
pause
EOL < /dev/null
