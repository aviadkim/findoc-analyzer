# Simple deployment script for Google Cloud Run

# Set variables
$SERVICE_NAME = "backv2-app"
$REGION = "me-west1"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$LOG_FILE = "deploy-log-$TIMESTAMP.txt"

# Function to log messages
function Log-Message {
    param (
        [string]$message
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $message"

    Write-Host $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage
}

# Start deployment
Log-Message "Starting deployment to Google Cloud Run..."

# Check if Dockerfile exists
if (-not (Test-Path "Dockerfile")) {
    Log-Message "ERROR: Dockerfile not found!"
    exit 1
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
Log-Message "Running: gcloud run deploy $SERVICE_NAME --source . --region $REGION --allow-unauthenticated"

try {
    gcloud run deploy $SERVICE_NAME --source . --region $REGION --allow-unauthenticated
    Log-Message "Deployment successful!"
} catch {
    Log-Message "Error deploying to Google Cloud Run: $_"
    exit 1
}

# Get the deployed URL
Log-Message "Getting deployed URL..."
$deployedUrl = gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"
Log-Message "Deployed URL: $deployedUrl"

# Deployment complete
Log-Message "Deployment complete!"
Log-Message "Service: $SERVICE_NAME"
Log-Message "Region: $REGION"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $LOG_FILE"

# Display instructions
Write-Host ""
Write-Host "To verify the deployment, visit the deployed application at:"
Write-Host "$deployedUrl"
Write-Host ""
