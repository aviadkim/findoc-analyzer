# FinDoc Analyzer UI Components Deployment Script
# This script deploys the UI components to Google Cloud Run

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-ui-components-$timestamp.log"
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
Log-Message "Starting UI components deployment..."

# Install dependencies
Log-Message "Installing dependencies..."
npm install

# Check if files exist
Log-Message "Checking if files exist..."

$files = @(
    "public/js/permanent-ui-fix.js",
    "middleware/ui-fix-middleware.js",
    "routes/ui-api-routes.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Log-Message "File exists: $file"
    } else {
        Log-Message "File does not exist: $file"
        exit 1
    }
}

# Create directories if they don't exist
Log-Message "Creating directories..."
if (-not (Test-Path "middleware")) {
    New-Item -ItemType Directory -Path "middleware" | Out-Null
    Log-Message "Created middleware directory"
}

if (-not (Test-Path "scripts")) {
    New-Item -ItemType Directory -Path "scripts" | Out-Null
    Log-Message "Created scripts directory"
}

if (-not (Test-Path "public/js/ui-components")) {
    New-Item -ItemType Directory -Path "public/js/ui-components" -Force | Out-Null
    Log-Message "Created UI components directory"
}

if (-not (Test-Path "tests")) {
    New-Item -ItemType Directory -Path "tests" | Out-Null
    Log-Message "Created tests directory"
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

# Run UI validation test
Log-Message "Running UI validation test..."
npm run test:ui

# Deployment complete
Log-Message "UI components deployment complete!"
Log-Message "Service: $serviceName"
Log-Message "Region: $region"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the UI components, visit the deployed application at:"
Write-Host "$deployedUrl"
Write-Host ""
Write-Host "Check the UI validation test results in the tests/ui-validation-results directory."
Write-Host ""
