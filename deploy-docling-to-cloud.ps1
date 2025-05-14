# Deploy Docling Integration to Cloud
Write-Host "===================================================
Deploying Docling Integration to Cloud
===================================================" -ForegroundColor Green

# Step 1: Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version
    Write-Host "Google Cloud SDK is installed." -ForegroundColor Green
} catch {
    Write-Host "Error: Google Cloud SDK (gcloud) is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Step 2: Check if user is logged in to gcloud
$auth = gcloud auth list --filter=status:ACTIVE --format="value(account)"
if (-not $auth) {
    Write-Host "You are not logged in to Google Cloud. Please log in:" -ForegroundColor Yellow
    gcloud auth login
}

# Step 3: Set the project to findoc-deploy
Write-Host "Setting project to findoc-deploy..." -ForegroundColor Yellow
gcloud config set project findoc-deploy
$currentProject = "findoc-deploy"
Write-Host "Project set to: $currentProject" -ForegroundColor Green

# Step 4: Create a deployment package
Write-Host "`n=== Step 4: Creating deployment package ===" -ForegroundColor Cyan
$deploymentDir = "docling-deployment"
if (Test-Path -Path $deploymentDir) {
    Remove-Item -Path $deploymentDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deploymentDir -Force | Out-Null

# Copy necessary files
Copy-Item -Path "docling-integration.js" -Destination "$deploymentDir/" -Force
Copy-Item -Path "controllers/doclingController.js" -Destination "$deploymentDir/controllers/" -Force -Recurse
Copy-Item -Path "routes/doclingRoutes.js" -Destination "$deploymentDir/routes/" -Force -Recurse
Copy-Item -Path "server.js" -Destination "$deploymentDir/" -Force

# Create app.yaml
$appYamlContent = @"
runtime: nodejs16
service: default

env_variables:
  DOCLING_API_KEY: "your-api-key"
  DOCLING_API_URL: "https://api.docling.ai"

handlers:
  - url: /.*
    script: auto
"@
Set-Content -Path "$deploymentDir/app.yaml" -Value $appYamlContent

# Create package.json if it doesn't exist
$packageJsonContent = @"
{
  "name": "findoc-analyzer",
  "version": "1.0.0",
  "description": "Financial Document Analyzer with Docling Integration",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "node test-docling-integration.js"
  },
  "dependencies": {
    "axios": "^0.24.0",
    "express": "^4.17.1",
    "form-data": "^4.0.0"
  }
}
"@
Set-Content -Path "$deploymentDir/package.json" -Value $packageJsonContent

Write-Host "Deployment package created." -ForegroundColor Green

# Step 5: Deploy to Google Cloud Run
Write-Host "`n=== Step 5: Deploying to Google Cloud Run ===" -ForegroundColor Cyan

# Set variables
$SERVICE_NAME = "backv2-app"
$REGION = "me-west1"

# Build the container image
Write-Host "Building the container image..." -ForegroundColor Yellow
gcloud builds submit --tag gcr.io/$currentProject/$SERVICE_NAME $deploymentDir

# Deploy the container image to Cloud Run
Write-Host "Deploying the container image to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
  --image gcr.io/$currentProject/$SERVICE_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated

# Step 6: Get the URL of the deployed application
$url = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
Write-Host "Application deployed successfully!" -ForegroundColor Green
Write-Host "You can access the application at: $url" -ForegroundColor Green

# Step 7: Run tests to verify deployment
Write-Host "`n=== Step 7: Running tests to verify deployment ===" -ForegroundColor Cyan
$env:DEPLOYMENT_URL = $url
node test-docling-integration.js $url
Write-Host "Tests completed." -ForegroundColor Green

# Step 8: Open the application in the default browser
$openBrowser = Read-Host "Do you want to open the application in your browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process $url
}

Write-Host "===================================================
Deployment of Docling Integration to Cloud Complete!
===================================================" -ForegroundColor Green
