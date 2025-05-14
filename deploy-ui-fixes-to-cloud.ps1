# FinDoc Analyzer UI Fixes Deployment Script
# This script deploys the UI fixes directly to Google Cloud Run

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-ui-fixes-$timestamp.log"
$region = "me-west1"
$serviceName = "backv2-app"
$projectId = "findoc-deploy"
$imageName = "gcr.io/$projectId/backv2-app-ui-fixed"

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
Log-Message "Starting UI fixes deployment to Google Cloud Run..."

# Step 1: Inject UI fixes into HTML files
Log-Message "Step 1: Injecting UI fixes into HTML files..."
node inject-ui-fixes.js

# Step 2: Check if UI components files exist
Log-Message "Step 2: Checking UI components files..."
if (-not (Test-Path "public/js/ui-fixes.js")) {
    Log-Message "Error: UI fixes file not found: public/js/ui-fixes.js"
    exit 1
}
if (-not (Test-Path "public/css/ui-fixes.css")) {
    Log-Message "Error: UI fixes CSS file not found: public/css/ui-fixes.css"
    exit 1
}

# Step 3: Build the Docker image
Log-Message "Step 3: Building Docker image..."
docker build -t $imageName .

# Step 4: Configure Docker to use Google Cloud credentials
Log-Message "Step 4: Configuring Docker to use Google Cloud credentials..."
gcloud auth configure-docker

# Step 5: Push the Docker image to Google Container Registry
Log-Message "Step 5: Pushing Docker image to Google Container Registry..."
docker push $imageName

# Step 6: Deploy to Google Cloud Run
Log-Message "Step 6: Deploying to Google Cloud Run..."
Log-Message "Running: gcloud run deploy $serviceName --image $imageName --region $region --allow-unauthenticated"

try {
    gcloud run deploy $serviceName --image $imageName --region $region --allow-unauthenticated
    Log-Message "Deployment successful!"
} catch {
    Log-Message "Error deploying to Google Cloud Run: $_"
    exit 1
}

# Step 7: Get the deployed URL
Log-Message "Step 7: Getting deployed URL..."
$deployedUrl = gcloud run services describe $serviceName --region $region --format="value(status.url)"
Log-Message "Deployed URL: $deployedUrl"

# Step 8: Run validation tests against the deployed application
Log-Message "Step 8: Running validation tests against the deployed application..."
$env:DEPLOYED_URL = $deployedUrl
node test-deployed-ui-validation.js

# Deployment complete
Log-Message "UI fixes deployment complete!"
Log-Message "Service: $serviceName"
Log-Message "Region: $region"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the UI fixes, visit the deployed application at:"
Write-Host "$deployedUrl"
Write-Host ""
Write-Host "Check the test results to verify that all UI components are working correctly."
Write-Host ""
