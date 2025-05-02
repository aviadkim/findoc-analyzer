# Simple deployment script for FinDoc Analyzer

# Navigate to the directory containing app.yaml
Set-Location "C:/Users/aviad/OneDrive/Desktop/backv2-main/DevDocs"

# Check if user is logged in to gcloud
Write-Host "Checking gcloud authentication..." -ForegroundColor Yellow
$authInfo = gcloud auth list --format="value(account)" 2>$null
if (-not $authInfo) {
    Write-Host "You are not logged in to gcloud. Please login first." -ForegroundColor Red
    gcloud auth login
}
else {
    Write-Host "Authenticated as: $authInfo" -ForegroundColor Green
}

# Get current project
$currentProject = gcloud config get-value project 2>$null
Write-Host "Current GCP project: $currentProject" -ForegroundColor Yellow

# Confirm deployment
Write-Host "You are about to deploy FinDoc Analyzer to Google App Engine in project: $currentProject" -ForegroundColor Yellow
$confirmation = Read-Host "Do you want to continue? (y/n)"
if ($confirmation -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Red
    exit 0
}

# Build the Next.js application
Write-Host "Building the Next.js application..." -ForegroundColor Yellow
try {
    # Navigate to the frontend directory
    Set-Location "C:/Users/aviad/OneDrive/Desktop/backv2-main/DevDocs/frontend"

    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
    }

    # Build the Next.js application
    npm run build

    # Return to the DevDocs directory
    Set-Location "C:/Users/aviad/OneDrive/Desktop/backv2-main/DevDocs"

    # Install server dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing server dependencies..." -ForegroundColor Yellow
        npm install express path url fs
    }

    Write-Host "Build completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error during build: $_" -ForegroundColor Red
    exit 1
}

# Deploy to Google App Engine
Write-Host "Deploying to Google App Engine..." -ForegroundColor Yellow
try {
    gcloud app deploy app.yaml --quiet
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error during deployment: $_" -ForegroundColor Red
    exit 1
}

# Get the deployed URL
$appUrl = "https://findoc-deploy.ey.r.appspot.com"
Write-Host "Application deployed to: $appUrl" -ForegroundColor Cyan

# Open the application in the default browser
Write-Host "Opening the application in your browser..." -ForegroundColor Yellow
Start-Process $appUrl

Write-Host "Deployment completed successfully!" -ForegroundColor Green
