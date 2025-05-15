# FinDoc Analyzer UI Fix Deployment Script
# This script deploys the updated UI fix script to GitHub and Google App Engine

# Function to log messages
function Log-Message {
    param (
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Type] $Message"
}

# Function to check if a file exists
function Check-File {
    param (
        [string]$FilePath
    )
    
    if (Test-Path $FilePath) {
        Log-Message "File exists: $FilePath"
        return $true
    } else {
        Log-Message "File does not exist: $FilePath" "ERROR"
        return $false
    }
}

# Function to backup a file
function Backup-File {
    param (
        [string]$FilePath
    )
    
    $backupPath = "$FilePath.backup"
    Copy-Item -Path $FilePath -Destination $backupPath -Force
    Log-Message "Backed up file to: $backupPath"
}

# Function to deploy to GitHub
function Deploy-To-GitHub {
    param (
        [string]$SourcePath,
        [string]$DestinationPath,
        [string]$CommitMessage
    )
    
    try {
        # Copy the file to the destination
        Copy-Item -Path $SourcePath -Destination $DestinationPath -Force
        Log-Message "Copied file to: $DestinationPath"
        
        # Add the file to git
        Set-Location (Split-Path -Parent $DestinationPath)
        git add (Split-Path -Leaf $DestinationPath)
        Log-Message "Added file to git"
        
        # Commit the changes
        git commit -m $CommitMessage
        Log-Message "Committed changes with message: $CommitMessage"
        
        # Push the changes
        git push
        Log-Message "Pushed changes to GitHub"
        
        return $true
    } catch {
        Log-Message "Error deploying to GitHub: $_" "ERROR"
        return $false
    }
}

# Function to deploy to Google App Engine
function Deploy-To-GAE {
    param (
        [string]$ProjectPath,
        [string]$ProjectID
    )
    
    try {
        # Set location to project path
        Set-Location $ProjectPath
        Log-Message "Set location to: $ProjectPath"
        
        # Deploy to Google App Engine
        gcloud app deploy app.yaml --project=$ProjectID --quiet
        Log-Message "Deployed to Google App Engine project: $ProjectID"
        
        return $true
    } catch {
        Log-Message "Error deploying to Google App Engine: $_" "ERROR"
        return $false
    }
}

# Main script
Log-Message "Starting UI fix deployment..."

# Check if the updated UI fix script exists
$updatedUiFixPath = "updated-ui-fix.js"
if (-not (Check-File $updatedUiFixPath)) {
    Log-Message "Updated UI fix script not found. Exiting." "ERROR"
    exit 1
}

# Set paths
$projectRoot = "C:/Users/aviad/OneDrive/Desktop/backv2-main"
$destinationPath = "$projectRoot/public/js/ui-fix.js"

# Check if the destination directory exists
$destinationDir = Split-Path -Parent $destinationPath
if (-not (Test-Path $destinationDir)) {
    Log-Message "Creating directory: $destinationDir"
    New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
}

# Backup the existing UI fix script if it exists
if (Test-Path $destinationPath) {
    Backup-File $destinationPath
}

# Deploy to GitHub
Log-Message "Deploying to GitHub..."
$githubSuccess = Deploy-To-GitHub -SourcePath $updatedUiFixPath -DestinationPath $destinationPath -CommitMessage "Fix UI issues and API key configuration"

if (-not $githubSuccess) {
    Log-Message "Failed to deploy to GitHub. Exiting." "ERROR"
    exit 1
}

# Deploy to Google App Engine
Log-Message "Deploying to Google App Engine..."
$gaeSuccess = Deploy-To-GAE -ProjectPath $projectRoot -ProjectID "findoc-deploy"

if (-not $gaeSuccess) {
    Log-Message "Failed to deploy to Google App Engine. Exiting." "ERROR"
    exit 1
}

Log-Message "Deployment completed successfully!"
