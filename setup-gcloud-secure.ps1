# Secure Google Cloud Setup Script
# This script securely sets up Google Cloud configuration without exposing credentials

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to check if a file exists
function Test-FileExists {
    param (
        [string]$Path
    )
    return Test-Path -Path $Path
}

# Function to create a directory if it doesn't exist
function Ensure-DirectoryExists {
    param (
        [string]$Path
    )
    if (-not (Test-Path -Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
        Write-Host "Created directory: $Path"
    }
}

# Create a secure directory for credentials
$credentialsDir = Join-Path $PSScriptRoot ".credentials"
Ensure-DirectoryExists -Path $credentialsDir

# Path to service account key file
$serviceAccountKeyPath = Join-Path $credentialsDir "service-account-key.json"

# Check if service account key exists
if (-not (Test-FileExists -Path $serviceAccountKeyPath)) {
    # Prompt for service account key
    Write-Host "Service account key not found at: $serviceAccountKeyPath"
    Write-Host "You need to create a service account key in the Google Cloud Console."
    Write-Host "1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts"
    Write-Host "2. Create a new service account or select an existing one"
    Write-Host "3. Create a new key (JSON format)"
    Write-Host "4. Download the key file"
    
    $keyFilePath = Read-Host -Prompt "Enter the path to the downloaded key file"
    
    if (-not (Test-FileExists -Path $keyFilePath)) {
        Write-Host "Key file not found at: $keyFilePath"
        exit 1
    }
    
    # Copy the key file to the secure location
    Copy-Item -Path $keyFilePath -Destination $serviceAccountKeyPath
    Write-Host "Service account key copied to: $serviceAccountKeyPath"
    
    # Suggest deleting the original key file
    Write-Host "For security, consider deleting the original key file at: $keyFilePath"
    $deleteOriginal = Read-Host -Prompt "Delete original key file? (y/n)"
    if ($deleteOriginal -eq "y") {
        Remove-Item -Path $keyFilePath
        Write-Host "Original key file deleted"
    }
}

# Path to .env file
$envFilePath = Join-Path $PSScriptRoot ".env"

# Check if .env file exists
if (-not (Test-FileExists -Path $envFilePath)) {
    # Create .env file
    $projectId = Read-Host -Prompt "Enter your Google Cloud project ID"
    $geminiApiKey = Read-Host -Prompt "Enter your Gemini API key"
    
    $envContent = @"
# Google Cloud configuration
GOOGLE_PROJECT_ID=$projectId
GOOGLE_APPLICATION_CREDENTIALS=$serviceAccountKeyPath

# API keys
GEMINI_API_KEY=$geminiApiKey

# Other configuration
STORAGE_BUCKET=${projectId}-documents
"@
    
    Set-Content -Path $envFilePath -Value $envContent
    Write-Host "Created .env file at: $envFilePath"
}

# Set environment variables
$env:GOOGLE_APPLICATION_CREDENTIALS = $serviceAccountKeyPath
$env:GOOGLE_CLOUD_PROJECT = (Get-Content -Path $serviceAccountKeyPath | ConvertFrom-Json).project_id

# Verify gcloud installation
try {
    $gcloudVersion = gcloud --version
    Write-Host "Google Cloud SDK is installed: $($gcloudVersion[0])"
}
catch {
    Write-Host "Google Cloud SDK is not installed. Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Authenticate with gcloud
Write-Host "Authenticating with Google Cloud..."
gcloud auth activate-service-account --key-file=$serviceAccountKeyPath

# Set default project
$projectId = (Get-Content -Path $serviceAccountKeyPath | ConvertFrom-Json).project_id
gcloud config set project $projectId
Write-Host "Default project set to: $projectId"

# Display success message
Write-Host ""
Write-Host "Google Cloud configuration completed successfully!"
Write-Host "Your credentials are securely stored in: $credentialsDir"
Write-Host "Environment variables are configured in: $envFilePath"
Write-Host ""
Write-Host "IMPORTANT: Never commit the .credentials directory or .env file to Git!"
Write-Host "           They are already in .gitignore, but always double-check."
Write-Host ""
Write-Host "To deploy to Google Cloud, run: .\deploy-to-gcloud.ps1"
