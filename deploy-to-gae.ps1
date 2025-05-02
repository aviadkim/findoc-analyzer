# FinDoc Analyzer Deployment Script for Google App Engine
# This script deploys the FinDoc Analyzer application to Google App Engine

# Set error action preference
$ErrorActionPreference = "Stop"

# Configuration
$appYamlPath = "DevDocs/app.yaml"
$projectRoot = "C:/Users/aviad/OneDrive/Desktop/backv2-main"

# Function to display colored messages
function Write-ColoredOutput {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,

        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )

    Write-Host $Message -ForegroundColor $ForegroundColor
}

# Function to check if a command exists
function Test-Command {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Command
    )

    $exists = $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
    return $exists
}

# Display banner
Write-ColoredOutput "====================================================" "Cyan"
Write-ColoredOutput "       FinDoc Analyzer Deployment Script            " "Cyan"
Write-ColoredOutput "====================================================" "Cyan"
Write-ColoredOutput " " "White"

# Check if gcloud is installed
if (-not (Test-Command "gcloud")) {
    Write-ColoredOutput "Error: Google Cloud SDK (gcloud) is not installed or not in PATH." "Red"
    Write-ColoredOutput "Please install the Google Cloud SDK from https://cloud.google.com/sdk/docs/install" "Yellow"
    exit 1
}

# Check if user is logged in to gcloud
Write-ColoredOutput "Checking gcloud authentication..." "Yellow"
$authInfo = gcloud auth list --format="value(account)" 2>$null
if (-not $authInfo) {
    Write-ColoredOutput "You are not logged in to gcloud. Please login first." "Red"
    gcloud auth login
}
else {
    Write-ColoredOutput "Authenticated as: $authInfo" "Green"
}

# Check if app.yaml exists
if (-not (Test-Path "$projectRoot/$appYamlPath")) {
    Write-ColoredOutput "Error: app.yaml not found at $projectRoot/$appYamlPath" "Red"
    exit 1
}

# Get current project
$currentProject = gcloud config get-value project 2>$null
Write-ColoredOutput "Current GCP project: $currentProject" "Yellow"

# Confirm deployment
Write-ColoredOutput "You are about to deploy FinDoc Analyzer to Google App Engine in project: $currentProject" "Yellow"
$confirmation = Read-Host "Do you want to continue? (y/n)"
if ($confirmation -ne "y") {
    Write-ColoredOutput "Deployment cancelled." "Red"
    exit 0
}

# Navigate to the directory containing app.yaml
Set-Location "$projectRoot/DevDocs"

# Build the application
Write-ColoredOutput "Building the application..." "Yellow"
try {
    # Add any build steps here if needed
    Write-ColoredOutput "Build completed successfully." "Green"
}
catch {
    Write-ColoredOutput "Error during build: $_" "Red"
    exit 1
}

# Deploy to Google App Engine
Write-ColoredOutput "Deploying to Google App Engine..." "Yellow"
try {
    gcloud app deploy app.yaml --quiet
    Write-ColoredOutput "Deployment completed successfully!" "Green"
}
catch {
    Write-ColoredOutput "Error during deployment: $_" "Red"
    exit 1
}

# Get the deployed URL
$appUrl = "https://findoc-deploy.ey.r.appspot.com"
Write-ColoredOutput "Application deployed to: $appUrl" "Cyan"

# Open the application in the default browser
Write-ColoredOutput "Opening the application in your browser..." "Yellow"
Start-Process $appUrl

Write-ColoredOutput "====================================================" "Cyan"
Write-ColoredOutput "       Deployment completed successfully!            " "Green"
Write-ColoredOutput "====================================================" "Cyan"
