# FinDoc Analyzer Deployment Script
# This script builds and deploys the FinDoc Analyzer application to Google App Engine

# Set error action preference
$ErrorActionPreference = "Stop"

# Configuration
$projectId = "findoc-deploy"
$region = "europe-west3"
$service = "default"

# Display banner
Write-Host "====================================="
Write-Host "FinDoc Analyzer Deployment Script"
Write-Host "====================================="
Write-Host ""

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version
    Write-Host "✅ Google Cloud SDK is installed"
} catch {
    Write-Host "❌ Google Cloud SDK is not installed. Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Check if user is logged in
try {
    $account = gcloud auth list --filter=status:ACTIVE --format="value(account)"
    if ($account) {
        Write-Host "✅ Logged in as $account"
    } else {
        Write-Host "❌ Not logged in to Google Cloud. Please run 'gcloud auth login'"
        exit 1
    }
} catch {
    Write-Host "❌ Error checking authentication status. Please run 'gcloud auth login'"
    exit 1
}

# Check if project exists
try {
    $project = gcloud projects describe $projectId --format="value(projectId)"
    if ($project -eq $projectId) {
        Write-Host "✅ Project $projectId exists"
    } else {
        Write-Host "❌ Project $projectId does not exist. Please create it in the Google Cloud Console"
        exit 1
    }
} catch {
    Write-Host "❌ Error checking project status. Please check if project $projectId exists"
    exit 1
}

# Set project
Write-Host "Setting project to $projectId..."
gcloud config set project $projectId

# Check if app.yaml exists
if (Test-Path "app.yaml") {
    Write-Host "✅ app.yaml exists"
} else {
    Write-Host "❌ app.yaml does not exist. Creating it..."
    
    # Create app.yaml
    @"
runtime: nodejs18
service: $service

env_variables:
  NODE_ENV: "production"
  UPLOAD_FOLDER: "/tmp/uploads"
  TEMP_FOLDER: "/tmp/temp"
  RESULTS_FOLDER: "/tmp/results"

handlers:
  - url: /.*
    script: auto
    secure: always
"@ | Out-File -FilePath "app.yaml" -Encoding utf8
    
    Write-Host "✅ app.yaml created"
}

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Build the application
Write-Host "Building the application..."
npm run build

# Deploy to Google App Engine
Write-Host "Deploying to Google App Engine..."
gcloud app deploy app.yaml --quiet

# Display success message
Write-Host ""
Write-Host "====================================="
Write-Host "Deployment completed successfully!"
Write-Host "====================================="
Write-Host ""
Write-Host "Your application is now available at: https://$service-dot-$projectId.$region.r.appspot.com"
Write-Host ""
