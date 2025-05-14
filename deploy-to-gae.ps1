# FinDoc Analyzer Deployment Script for Google App Engine
# This script deploys the FinDoc Analyzer application to Google App Engine

# Set error action preference
$ErrorActionPreference = "Stop"

# Configuration
$appYamlPath = "app.yaml"
$projectRoot = "C:/Users/aviad/OneDrive/Desktop/backv2-main"
$modernUiEnabled = $true

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
    # Create necessary directories if they don't exist
    if ($modernUiEnabled) {
        Write-ColoredOutput "Setting up Modern UI..." "Yellow"
        $directories = @("public", "public/css", "public/js", "public/images")
        foreach ($dir in $directories) {
            if (-not (Test-Path "$projectRoot/$dir")) {
                New-Item -ItemType Directory -Path "$projectRoot/$dir" -Force | Out-Null
                Write-ColoredOutput "Created directory: $dir" "Green"
            }
        }

        # Create modern-ui.css if it doesn't exist
        if (-not (Test-Path "$projectRoot/public/css/modern-ui.css")) {
            Write-ColoredOutput "Creating modern-ui.css..." "Yellow"
            @"
/* FinDoc Analyzer - Modern UI CSS */
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --accent-color: #e74c3c;
  --background-color: #f8f9fa;
  --text-color: #333;
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  color: var(--text-color);
}

/* Modern App Layout */
.app-layout {
  display: flex;
  min-height: 100vh;
}

/* Modern Sidebar */
.sidebar {
  width: 280px;
  background-color: var(--secondary-color);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

/* Modern Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: white;
  box-shadow: var(--box-shadow);
}

/* Modern Login Page */
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
}

/* Modern Upload Page */
.upload-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
"@ | Out-File -FilePath "$projectRoot/public/css/modern-ui.css" -Encoding utf8
            Write-ColoredOutput "Created modern-ui.css" "Green"
        }
    }

    # Add any other build steps here if needed
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
