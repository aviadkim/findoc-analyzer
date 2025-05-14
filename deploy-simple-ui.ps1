# Simple UI Deployment Script for Google Cloud Run
# This script deploys the application to Google Cloud Run using gcloud CLI

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-simple-ui-$timestamp.log"
$serviceName = "backv2-app"
$region = "me-west1"

# Create log function
function Log-Message {
    param (
        [string]$message
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $message"
    
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

# Start deployment
Log-Message "Starting simple UI deployment..."

# Check if files exist
Log-Message "Checking if files exist..."

$files = @(
    "middleware/simple-injector.js",
    "public/js/simple-chat-button.js",
    "server.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Log-Message "File exists: $file"
    } else {
        Log-Message "File does not exist: $file"
        exit 1
    }
}

# Check if user is logged in to gcloud
Log-Message "Checking gcloud authentication..."
$authInfo = gcloud auth list --format="value(account)" 2>$null
if (-not $authInfo) {
    Log-Message "You are not logged in to gcloud. Please login first."
    gcloud auth login
}
else {
    Log-Message "Authenticated as: $authInfo"
}

# Get current project
$currentProject = gcloud config get-value project 2>$null
Log-Message "Current GCP project: $currentProject"

# Deploy to Google Cloud Run
Log-Message "Deploying to Google Cloud Run..."
Log-Message "Running: gcloud run deploy $serviceName --source . --region $region --allow-unauthenticated"

try {
    gcloud run deploy $serviceName --source . --region $region --allow-unauthenticated
    Log-Message "Deployment successful!"
} catch {
    Log-Message "Error deploying to Google Cloud Run: $_"
    exit 1
}

# Get the deployed URL
Log-Message "Getting deployed URL..."
$deployedUrl = gcloud run services describe $serviceName --region $region --format="value(status.url)"
Log-Message "Deployed URL: $deployedUrl"

# Deployment complete
Log-Message "Simple UI deployment complete!"
Log-Message "Service: $serviceName"
Log-Message "Region: $region"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the deployment, visit the deployed application at:"
Write-Host "$deployedUrl"
Write-Host ""
