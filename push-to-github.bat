@echo off
echo ===================================================
echo    Pushing Code to GitHub Repository
echo ===================================================
echo.
echo This script will push your code to: 
echo https://github.com/aviadkim/findoc-analyzer
echo.
echo Press any key to continue...
pause > nul

cd /d "%~dp0"

echo Initializing Git repository (if not already initialized)...
git init

echo Adding all files to git...
git add .

echo Committing changes...
git commit -m "Add UI fixes for deployment"

echo Setting main branch...
git branch -M main

echo Adding GitHub repository as origin...
git remote add origin https://github.com/aviadkim/findoc-analyzer.git
echo If origin already exists, you can ignore the error above.

echo Pushing to GitHub...
git push -u origin main

echo.
echo If the push was successful, your code is now on GitHub\!
echo Next, let's set up Google Cloud Build integration.
echo.
echo Open this URL to set up Cloud Build:
echo https://console.cloud.google.com/cloud-build/triggers/connect?project=findoc-deploy
echo.
echo Press any key to exit...
pause > nul
EOF < /dev/null
