# FinDoc Analyzer UI Components Update Deployment Script
# This script deploys the updated UI components to Google Cloud Run

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-ui-components-update-$timestamp.log"
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
Log-Message "Starting UI components update deployment..."

# Check if files exist
Log-Message "Checking if files exist..."

$files = @(
    "public/js/chat-button.js",
    "public/js/process-button.js",
    "public/js/agent-cards.js",
    "public/js/document-list.js",
    "public/js/analytics-dashboard.js",
    "public/js/document-details.js",
    "public/js/html-injector-simple.js",
    "middleware/html-injector-middleware.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Log-Message "File exists: $file"
    } else {
        Log-Message "File does not exist: $file"
        exit 1
    }
}

# Deploy to Google Cloud Run
Log-Message "Deploying to Google Cloud Run..."
Log-Message "Running: gcloud run deploy $serviceName --source . --region $region"

try {
    gcloud run deploy $serviceName --source . --region $region
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
Log-Message "UI components update deployment complete!"
Log-Message "Service: $serviceName"
Log-Message "Region: $region"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the UI components, visit the deployed application at:"
Write-Host "$deployedUrl"
Write-Host ""
Write-Host "Check the following pages to see the new UI components:"
Write-Host "1. Documents page: $deployedUrl/documents-new"
Write-Host "2. Analytics page: $deployedUrl/analytics-new"
Write-Host "3. Document Details page: $deployedUrl/document-details.html"
Write-Host ""
