# FinDoc Analyzer UI Components Simple Deployment Script
# This script deploys the UI components to Google Cloud Run

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-ui-components-simple-$timestamp.log"
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
Log-Message "Starting UI components simple deployment..."

# Check if files exist
Log-Message "Checking if files exist..."

$files = @(
    "public/js/chat-button.js",
    "public/js/process-button.js",
    "public/js/agent-cards.js",
    "public/js/html-injector-simple.js",
    "middleware/html-injector-middleware.js",
    "routes/chat-api-routes.js",
    "routes/process-api-routes.js",
    "routes/agents-api-routes.js",
    "public/direct-ui-fix-bookmarklet.html"
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
Log-Message "UI components simple deployment complete!"
Log-Message "Service: $serviceName"
Log-Message "Region: $region"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the UI components, visit the deployed application at:"
Write-Host "$deployedUrl"
Write-Host ""
Write-Host "You can also use the bookmarklet to inject the UI components:"
Write-Host "1. Open the bookmarklet HTML file: $deployedUrl/direct-ui-fix-bookmarklet.html"
Write-Host "2. Drag the 'FinDoc UI Fix' link to your bookmarks bar"
Write-Host "3. Navigate to the deployed application and click the bookmarklet"
Write-Host ""
