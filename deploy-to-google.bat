@echo off
echo Deploying to Google App Engine...

:: Navigate to the project directory
cd /d %~dp0backv2-github\DevDocs

:: Deploy to Google App Engine
gcloud app deploy app.yaml

echo Deployment completed!
