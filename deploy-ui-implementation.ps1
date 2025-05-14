# FinDoc Analyzer UI Implementation Deployment Script
# This script deploys the UI implementation to Google Cloud Run

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-ui-implementation-$timestamp.log"
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
Log-Message "Starting UI implementation deployment..."

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
Log-Message "UI implementation deployment complete!"
Log-Message "Service: $serviceName"
Log-Message "Region: $region"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the UI implementation, visit the deployed application at:"
Write-Host "$deployedUrl"
Write-Host ""
Write-Host "Check the following pages to verify all 91 UI elements are present:"
Write-Host "1. Home page: $deployedUrl"
Write-Host "2. Upload page: $deployedUrl/upload"
Write-Host "3. Documents page: $deployedUrl/documents-new"
Write-Host "4. Analytics page: $deployedUrl/analytics-new"
Write-Host "5. Document details page: $deployedUrl/document-details.html"
Write-Host "6. Document chat page: $deployedUrl/document-chat"
Write-Host "7. Document comparison page: $deployedUrl/document-comparison"
Write-Host "8. Test page: $deployedUrl/test"
Write-Host ""
