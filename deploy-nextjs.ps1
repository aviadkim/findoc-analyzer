# Deploy Next.js application to Google App Engine

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to display messages with color
function Write-ColorMessage {
    param (
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Display banner
Write-ColorMessage "====================================================" "Cyan"
Write-ColorMessage "  FinDoc Analyzer - Next.js Deployment to GAE" "Cyan"
Write-ColorMessage "====================================================" "Cyan"
Write-ColorMessage ""

# Check if user is logged in to gcloud
Write-ColorMessage "Checking gcloud authentication..." "Yellow"
$authInfo = gcloud auth list --format="value(account)" 2>$null
if (-not $authInfo) {
    Write-ColorMessage "You are not logged in to gcloud. Please login first." "Red"
    gcloud auth login
}
else {
    Write-ColorMessage "Authenticated as: $authInfo" "Green"
}

# Get current project
$currentProject = gcloud config get-value project 2>$null
Write-ColorMessage "Current GCP project: $currentProject" "Yellow"

# Confirm deployment
Write-ColorMessage "You are about to deploy FinDoc Analyzer to Google App Engine in project: $currentProject" "Yellow"
$confirmation = Read-Host "Do you want to continue? (y/n)"
if ($confirmation -ne "y") {
    Write-ColorMessage "Deployment cancelled." "Red"
    exit 0
}

# Navigate to the DevDocs directory
Set-Location "C:/Users/aviad/OneDrive/Desktop/backv2-main/DevDocs"

# Backup existing files
Write-ColorMessage "Backing up existing files..." "Yellow"
if (Test-Path "app.yaml") {
    Copy-Item "app.yaml" "app.yaml.bak"
}
if (Test-Path "package.json") {
    Copy-Item "package.json" "package.json.bak"
}
if (Test-Path "server.js") {
    Copy-Item "server.js" "server.js.bak"
}

# Copy new files
Write-ColorMessage "Copying new configuration files..." "Yellow"
Copy-Item "app.yaml.new" "app.yaml" -Force
Copy-Item "package.json.new" "package.json" -Force
Copy-Item "server.js.new" "server.js" -Force

# Install dependencies
Write-ColorMessage "Installing dependencies..." "Yellow"
npm install

# Build the Next.js application
Write-ColorMessage "Building the Next.js application..." "Yellow"
try {
    # Navigate to the frontend directory
    Set-Location "C:/Users/aviad/OneDrive/Desktop/backv2-main/DevDocs/frontend"
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-ColorMessage "Installing frontend dependencies..." "Yellow"
        npm install
    }
    
    # Build the Next.js application
    npm run build
    
    # Return to the DevDocs directory
    Set-Location "C:/Users/aviad/OneDrive/Desktop/backv2-main/DevDocs"
    
    Write-ColorMessage "Build completed successfully!" "Green"
}
catch {
    Write-ColorMessage "Error during build: $_" "Red"
    exit 1
}

# Deploy to Google App Engine
Write-ColorMessage "Deploying to Google App Engine..." "Yellow"
try {
    gcloud app deploy app.yaml --quiet
    Write-ColorMessage "Deployment completed successfully!" "Green"
}
catch {
    Write-ColorMessage "Error during deployment: $_" "Red"
    exit 1
}

# Get the deployed URL
$appUrl = "https://findoc-deploy.ey.r.appspot.com"
Write-ColorMessage "Application deployed to: $appUrl" "Cyan"

# Open the application in the default browser
Write-ColorMessage "Opening the application in your browser..." "Yellow"
Start-Process $appUrl

Write-ColorMessage "Deployment completed successfully!" "Green"
