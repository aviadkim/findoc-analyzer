@echo off
echo ===================================================
echo    Setting up GitHub to Google Cloud Integration
echo ===================================================
echo.
echo This script will help you set up the initial connection.
echo.
echo STEP 1: You'll need to create a GitHub repository
echo 1. Go to GitHub.com and create a new repository
echo 2. Note your repository URL
echo.
echo STEP 2: Initialize Git and push your code
echo.
PowerShell -ExecutionPolicy Bypass -Command "Start-Process https://github.com/new"
echo.
echo After creating the repository, press any key to continue...
pause > nul
echo.
echo Enter your GitHub repository URL (https://github.com/username/repo):
set /p REPO_URL=

echo.
echo Initializing Git repository...
git init
git add .
git commit -m "Initial commit with UI fixes"
git branch -M main
git remote add origin %REPO_URL%
git push -u origin main

echo.
echo STEP 3: Connect to Google Cloud Build
echo.
PowerShell -ExecutionPolicy Bypass -Command "Start-Process https://console.cloud.google.com/cloud-build/triggers"
echo.
echo Follow these steps in the Google Cloud Console:
echo 1. Click "Connect Repository"
echo 2. Select GitHub and authenticate
echo 3. Select your repository
echo 4. Click "Create Trigger"
echo 5. Set it to deploy on push to main branch
echo 6. Point to cloudbuild.yaml
echo.
echo After setting up the trigger, press any key to exit...
pause > nul

echo ===================================================
echo    Setup Complete\! Your deployment flow is ready.
echo ===================================================
EOF < /dev/null
