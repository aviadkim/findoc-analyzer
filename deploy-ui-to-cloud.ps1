# Deploy UI Components to Google Cloud
# This script deploys the UI components to Google Cloud Run

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-ui-to-cloud-$timestamp.log"
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
Log-Message "Starting UI components deployment to Google Cloud..."

# Create directories if they don't exist
Log-Message "Creating directories..."
if (-not (Test-Path "public/js/ui-components")) {
    New-Item -ItemType Directory -Path "public/js/ui-components" -Force | Out-Null
    Log-Message "Created UI components directory"
}

if (-not (Test-Path "routes")) {
    New-Item -ItemType Directory -Path "routes" -Force | Out-Null
    Log-Message "Created routes directory"
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
Log-Message "UI components deployment to Google Cloud complete!"
Log-Message "Service: $serviceName"
Log-Message "Region: $region"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the UI components, visit the deployed application at:"
Write-Host "$deployedUrl/ui-components-test"
Write-Host ""
Write-Host "You can also use the HTML injector bookmarklet at:"
Write-Host "$deployedUrl/html-injector-bookmarklet"
Write-Host ""
