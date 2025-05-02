@echo off
echo Deploying to Google App Engine...

:: Set environment variables
set PROJECT_ID=findoc-deploy
set REGION=europe-west3
set SERVICE=default

echo Project ID: %PROJECT_ID%
echo Region: %REGION%
echo Service: %SERVICE%

:: Verify gcloud is installed
where gcloud >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: gcloud CLI is not installed or not in PATH.
    echo Please install the Google Cloud SDK from https://cloud.google.com/sdk/docs/install
    exit /b 1
)

:: Verify gcloud auth
gcloud auth list --filter=status:ACTIVE --format="value(account)" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Not authenticated with gcloud.
    echo Please run 'gcloud auth login' to authenticate.
    exit /b 1
)

:: Verify project
gcloud config get-value project >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Setting project to %PROJECT_ID%...
    gcloud config set project %PROJECT_ID%
)

:: Run tests before deployment
echo Running tests before deployment...
call npm test

if %ERRORLEVEL% NEQ 0 (
    echo Error: Tests failed. Deployment aborted.
    exit /b 1
)

:: Deploy to Google App Engine
echo Deploying to Google App Engine...
gcloud app deploy app.yaml --quiet --project=%PROJECT_ID% --version=v1

if %ERRORLEVEL% NEQ 0 (
    echo Error: Deployment failed.
    exit /b 1
)

:: Verify deployment
echo Waiting for deployment to complete...
timeout /t 60 /nobreak

echo Verifying deployment...
curl -f https://findoc-deploy.ey.r.appspot.com/api/health

if %ERRORLEVEL% NEQ 0 (
    echo Error: Deployment verification failed.
    exit /b 1
)

echo Deployment completed successfully!
echo Application is available at: https://findoc-deploy.ey.r.appspot.com

exit /b 0
