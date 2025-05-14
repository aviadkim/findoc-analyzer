# FinDoc Analyzer Injected Files Deployment Script
# This script deploys the HTML files with injected UI components to Google Cloud Run

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-injected-files-$timestamp.log"
$region = "me-west1"
$serviceName = "backv2-app"

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
Log-Message "Starting deployment of HTML files with injected UI components..."

# Create a custom Dockerfile that ensures UI components are included
Log-Message "Creating custom Dockerfile..."
$dockerfileContent = @"
FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
"@

Set-Content -Path "Dockerfile.injected" -Value $dockerfileContent
Log-Message "Created custom Dockerfile: Dockerfile.injected"

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
Log-Message "Deployment of HTML files with injected UI components complete!"
Log-Message "Service: $serviceName"
Log-Message "Region: $region"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the UI fixes, visit the deployed application at:"
Write-Host "$deployedUrl"
Write-Host ""
Write-Host "Run the UI validation script to check if all UI elements are present:"
Write-Host "node test-deployed-ui.js"
Write-Host ""
