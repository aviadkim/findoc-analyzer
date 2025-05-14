# Deploy to Google Cloud Run
Write-Host "===================================================
Deploying to Google Cloud Run
===================================================" -ForegroundColor Green

# Step 1: Ensure we have the fixes zip file
Write-Host "`n=== Step 1: Checking for fixes zip file ===" -ForegroundColor Cyan
if (-not (Test-Path -Path "findoc-fixes.zip")) {
    Write-Host "Fixes zip file not found. Creating it now..." -ForegroundColor Yellow
    npm install archiver

    # Run deployment fix script
    Write-Host "Running deployment fix script..." -ForegroundColor Yellow
    node deployment-fix.js

    # Create fixes zip
    node deploy-fixes.js
} else {
    Write-Host "Fixes zip file found." -ForegroundColor Green
}

# Step 2: Extract the fixes
Write-Host "`n=== Step 2: Extracting fixes ===" -ForegroundColor Cyan
if (-not (Test-Path -Path "fixes-temp")) {
    New-Item -ItemType Directory -Path "fixes-temp" -Force | Out-Null
}
Expand-Archive -Path "findoc-fixes.zip" -DestinationPath "fixes-temp" -Force
Write-Host "Fixes extracted to fixes-temp directory." -ForegroundColor Green

# Step 3: Copy the fixes to the appropriate locations
Write-Host "`n=== Step 3: Copying fixes to appropriate locations ===" -ForegroundColor Cyan

# Copy public files
if (Test-Path -Path "fixes-temp/public") {
    Write-Host "Copying public files..." -ForegroundColor Yellow
    Copy-Item -Path "fixes-temp/public/*" -Destination "public/" -Recurse -Force
    Write-Host "Public files copied." -ForegroundColor Green
}

# Copy server.js
if (Test-Path -Path "fixes-temp/server.js") {
    Write-Host "Copying server.js..." -ForegroundColor Yellow
    Copy-Item -Path "fixes-temp/server.js" -Destination "server.js" -Force
    Write-Host "server.js copied." -ForegroundColor Green
}

# Set variables
$PROJECT_ID = "findoc-deploy"
$SERVICE_NAME = "backv2-app"
$REGION = "me-west1"

# Step 4: Build and deploy the application
Write-Host "`n=== Step 4: Building and deploying to Google Cloud Run ===" -ForegroundColor Cyan

# Build the container image
Write-Host "Building the container image..." -ForegroundColor Yellow
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy the container image to Cloud Run
Write-Host "Deploying the container image to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated

# Step 5: Clean up
Write-Host "`n=== Step 5: Cleaning up ===" -ForegroundColor Cyan
Remove-Item -Path "fixes-temp" -Recurse -Force
Write-Host "Temporary files cleaned up." -ForegroundColor Green

# Step 6: Get the URL of the deployed application
$url = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
Write-Host "Application deployed successfully!" -ForegroundColor Green
Write-Host "You can access the application at: $url" -ForegroundColor Green

# Step 7: Run tests to verify deployment
Write-Host "`n=== Step 7: Running tests to verify deployment ===" -ForegroundColor Cyan
$env:DEPLOYMENT_URL = $url

# Run basic test
Write-Host "Running basic test..." -ForegroundColor Yellow
node test-google-login.js $url

# Run comprehensive test
Write-Host "Running comprehensive deployment test..." -ForegroundColor Yellow
npm install puppeteer
node test-deployment.js $url

Write-Host "Tests completed." -ForegroundColor Green

# Step 8: Open the application in the default browser
$openBrowser = Read-Host "Do you want to open the application in your browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process $url
}

Write-Host "===================================================
Deployment to Google Cloud Run Complete!
===================================================" -ForegroundColor Green
