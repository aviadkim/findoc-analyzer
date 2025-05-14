# Deploy to GitHub and Google App Engine
# This script deploys the UI fixes to GitHub and then to Google App Engine

# Set error action preference to stop on error
$ErrorActionPreference = "Stop"

# Create a timestamp for the deployment
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-github-gae-$timestamp.log"

# Function to log messages
function Log-Message {
    param (
        [string]$message
    )
    
    Write-Host $message
    Add-Content -Path $logFile -Value $message
}

# Start logging
Log-Message "Starting deployment to GitHub and Google App Engine at $(Get-Date)"

# GitHub repository details
$githubOwner = "aviadkim"
$githubRepo = "findoc-analyzer"
$githubBranch = "ui-component-fixes"

# Google Cloud project details
$gcpProject = "findoc-deploy"
$gcpService = "default"
$gcpRegion = "europe-west3"

try {
    # Check if git is installed
    $gitInstalled = $null -ne (Get-Command "git" -ErrorAction SilentlyContinue)
    
    if (-not $gitInstalled) {
        throw "Git is not installed or not in the PATH"
    }
    
    # Check if gcloud is installed
    $gcloudInstalled = $null -ne (Get-Command "gcloud" -ErrorAction SilentlyContinue)
    
    if (-not $gcloudInstalled) {
        throw "gcloud is not installed or not in the PATH"
    }
    
    # Clone the repository
    Log-Message "Cloning the repository..."
    git clone "https://github.com/$githubOwner/$githubRepo.git" "temp-$githubRepo"
    
    # Change to the repository directory
    Set-Location "temp-$githubRepo"
    
    # Create a new branch
    Log-Message "Creating a new branch: $githubBranch..."
    git checkout -b $githubBranch
    
    # Copy files to the repository
    Log-Message "Copying files to the repository..."
    
    # Create directories if they don't exist
    New-Item -ItemType Directory -Path "middleware" -Force | Out-Null
    New-Item -ItemType Directory -Path "public/css" -Force | Out-Null
    New-Item -ItemType Directory -Path "public/js" -Force | Out-Null
    New-Item -ItemType Directory -Path "routes" -Force | Out-Null
    
    # Copy server files
    Copy-Item "../server-enhanced.js" -Destination "." -Force
    Copy-Item "../server.js" -Destination "." -Force
    
    # Copy middleware files
    Copy-Item "../middleware/enhanced-simple-injector.js" -Destination "middleware/" -Force
    Copy-Item "../middleware/ui-components-validator.js" -Destination "middleware/" -Force
    
    # Copy CSS files
    Copy-Item "../public/css/critical-ui-components.css" -Destination "public/css/" -Force
    Copy-Item "../public/css/agent-cards.css" -Destination "public/css/" -Force
    
    # Copy JS files
    Copy-Item "../public/js/document-chat-fix.js" -Destination "public/js/" -Force
    Copy-Item "../public/js/login.js" -Destination "public/js/" -Force
    Copy-Item "../public/js/process-button-fix.js" -Destination "public/js/" -Force
    Copy-Item "../public/js/ui-components-bundle.js" -Destination "public/js/" -Force
    
    # Copy route files
    Copy-Item "../routes/document-processing-routes.js" -Destination "routes/" -Force
    Copy-Item "../routes/deepseek-routes.js" -Destination "routes/" -Force
    Copy-Item "../routes/multi-document-routes.js" -Destination "routes/" -Force
    Copy-Item "../routes/supabase-routes.js" -Destination "routes/" -Force
    Copy-Item "../routes/enhanced-pdf-routes.js" -Destination "routes/" -Force
    Copy-Item "../routes/data-visualization-routes.js" -Destination "routes/" -Force
    Copy-Item "../routes/export-routes.js" -Destination "routes/" -Force
    Copy-Item "../routes/batch-processing-routes.js" -Destination "routes/" -Force
    Copy-Item "../routes/chat-api-routes.js" -Destination "routes/" -Force
    
    # Copy configuration files
    Copy-Item "../app.yaml" -Destination "." -Force
    Copy-Item "../package.json" -Destination "." -Force
    
    # Copy GitHub workflow files
    New-Item -ItemType Directory -Path ".github/workflows" -Force | Out-Null
    Copy-Item "../.github/workflows/deploy-to-gae.yml" -Destination ".github/workflows/" -Force
    
    # Copy cloudbuild.yaml
    Copy-Item "../cloudbuild.yaml" -Destination "." -Force
    
    # Copy README.md
    Copy-Item "../README.md" -Destination "." -Force
    
    # Add files to git
    Log-Message "Adding files to git..."
    git add .
    
    # Commit changes
    Log-Message "Committing changes..."
    git commit -m "Add UI component fixes"
    
    # Push to GitHub
    Log-Message "Pushing to GitHub..."
    git push -u origin $githubBranch
    
    # Create a pull request
    Log-Message "Creating a pull request..."
    $prTitle = "UI Component Fixes"
    $prBody = "This PR adds UI component fixes to address the 91 missing UI elements identified in previous testing."
    
    # Use GitHub CLI if available, otherwise use curl
    $ghInstalled = $null -ne (Get-Command "gh" -ErrorAction SilentlyContinue)
    
    if ($ghInstalled) {
        gh pr create --title $prTitle --body $prBody --base main --head $githubBranch
    } else {
        # Use curl or Invoke-WebRequest to create a PR
        Log-Message "GitHub CLI not found. Please create a PR manually."
    }
    
    # Deploy to Google App Engine
    Log-Message "Deploying to Google App Engine..."
    
    # Set the Google Cloud project
    gcloud config set project $gcpProject
    
    # Deploy to App Engine
    gcloud app deploy app.yaml --quiet
    
    # Get the deployed URL
    $deployedUrl = gcloud app describe --format="value(defaultHostname)"
    Log-Message "Deployed to: https://$deployedUrl"
    
    # Verify deployment
    Log-Message "Verifying deployment..."
    $response = Invoke-WebRequest -Uri "https://$deployedUrl/api/health" -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Log-Message "Deployment verification successful!"
    } else {
        Log-Message "Deployment verification failed!"
    }
    
    # Return to the original directory
    Set-Location ..
    
    # Clean up
    Log-Message "Cleaning up..."
    Remove-Item -Path "temp-$githubRepo" -Recurse -Force
    
    Log-Message "Deployment completed successfully at $(Get-Date)"
    Log-Message "The application is now available at https://$deployedUrl"
} catch {
    Log-Message "Error: $_"
    Log-Message "Deployment failed"
    
    # Return to the original directory
    Set-Location ..
    
    # Exit with error
    exit 1
}
