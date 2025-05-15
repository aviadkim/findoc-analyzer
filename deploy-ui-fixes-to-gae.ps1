# Deploy UI Fixes to Google App Engine
# This script extracts the UI fixes from the zip file and deploys them to Google App Engine

# Set error action preference to stop on error
$ErrorActionPreference = "Stop"

# Create a timestamp for the deployment
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-ui-fixes-$timestamp.log"

# Function to log messages
function Log-Message {
    param (
        [string]$message
    )
    
    Write-Host $message
    Add-Content -Path $logFile -Value $message
}

# Start logging
Log-Message "Starting deployment of UI fixes to Google App Engine at $(Get-Date)"
Log-Message "Creating temporary directory for deployment..."

# Create a temporary directory for the deployment
$tempDir = "ui-fixes-deploy-$timestamp"
New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    # Extract the zip file to the temporary directory
    Log-Message "Extracting UI fixes from zip file..."
    Expand-Archive -Path "findoc-ui-fixes.zip" -DestinationPath $tempDir -Force
    
    # Check if the extraction was successful
    if (-not (Test-Path "$tempDir/server-enhanced.js")) {
        throw "Failed to extract server-enhanced.js from zip file"
    }
    
    Log-Message "Files extracted successfully"
    
    # Copy server-enhanced.js to server.js
    Log-Message "Copying server-enhanced.js to server.js..."
    Copy-Item -Path "$tempDir/server-enhanced.js" -Destination "$tempDir/server.js" -Force
    
    # Create directories if they don't exist
    Log-Message "Creating directories..."
    New-Item -ItemType Directory -Path "$tempDir/middleware" -Force | Out-Null
    New-Item -ItemType Directory -Path "$tempDir/public/css" -Force | Out-Null
    New-Item -ItemType Directory -Path "$tempDir/public/js" -Force | Out-Null
    
    # Ensure all files are in the correct locations
    Log-Message "Ensuring all files are in the correct locations..."
    
    # Check middleware files
    if (Test-Path "$tempDir/enhanced-simple-injector.js") {
        Move-Item -Path "$tempDir/enhanced-simple-injector.js" -Destination "$tempDir/middleware/" -Force
    }
    
    if (Test-Path "$tempDir/ui-components-validator.js") {
        Move-Item -Path "$tempDir/ui-components-validator.js" -Destination "$tempDir/middleware/" -Force
    }
    
    # Check CSS files
    if (Test-Path "$tempDir/critical-ui-components.css") {
        Move-Item -Path "$tempDir/critical-ui-components.css" -Destination "$tempDir/public/css/" -Force
    }
    
    if (Test-Path "$tempDir/agent-cards.css") {
        Move-Item -Path "$tempDir/agent-cards.css" -Destination "$tempDir/public/css/" -Force
    }
    
    # Check JS files
    if (Test-Path "$tempDir/document-chat-fix.js") {
        Move-Item -Path "$tempDir/document-chat-fix.js" -Destination "$tempDir/public/js/" -Force
    }
    
    if (Test-Path "$tempDir/login.js") {
        Move-Item -Path "$tempDir/login.js" -Destination "$tempDir/public/js/" -Force
    }
    
    if (Test-Path "$tempDir/process-button-fix.js") {
        Move-Item -Path "$tempDir/process-button-fix.js" -Destination "$tempDir/public/js/" -Force
    }
    
    if (Test-Path "$tempDir/ui-components-bundle.js") {
        Move-Item -Path "$tempDir/ui-components-bundle.js" -Destination "$tempDir/public/js/" -Force
    }
    
    # Check HTML files
    if (Test-Path "$tempDir/index.html") {
        Move-Item -Path "$tempDir/index.html" -Destination "$tempDir/public/" -Force
    }
    
    if (Test-Path "$tempDir/login.html") {
        Move-Item -Path "$tempDir/login.html" -Destination "$tempDir/public/" -Force
    }
    
    if (Test-Path "$tempDir/document-chat.html") {
        Move-Item -Path "$tempDir/document-chat.html" -Destination "$tempDir/public/" -Force
    }
    
    if (Test-Path "$tempDir/documents-new.html") {
        Move-Item -Path "$tempDir/documents-new.html" -Destination "$tempDir/public/" -Force
    }
    
    if (Test-Path "$tempDir/upload-form.html") {
        Move-Item -Path "$tempDir/upload-form.html" -Destination "$tempDir/public/" -Force
    }
    
    if (Test-Path "$tempDir/test.html") {
        Move-Item -Path "$tempDir/test.html" -Destination "$tempDir/public/" -Force
    }
    
    # Deploy to Google App Engine
    Log-Message "Preparing to deploy to Google App Engine..."
    Set-Location $tempDir
    
    # Check if gcloud is installed
    $gcloudInstalled = $null -ne (Get-Command "gcloud" -ErrorAction SilentlyContinue)
    
    if (-not $gcloudInstalled) {
        throw "gcloud is not installed or not in the PATH. Please install Google Cloud SDK and try again."
    }
    
    # Verify authentication
    Log-Message "Verifying gcloud authentication..."
    $authStatus = gcloud auth list --format="value(account)" 2>&1
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrEmpty($authStatus)) {
        Log-Message "Not logged in to gcloud. Attempting to login..."
        gcloud auth login
        if ($LASTEXITCODE -ne 0) {
            throw "Authentication failed. Please try again manually with 'gcloud auth login'"
        }
        Log-Message "Authentication successful!"
    } else {
        Log-Message "Already authenticated with gcloud as: $authStatus"
    }
    
    # Verify project
    Log-Message "Checking project configuration..."
    $projectId = gcloud config get-value project 2>&1
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrEmpty($projectId)) {
        Log-Message "No project set. Please enter project ID."
        $projectId = Read-Host "Enter project ID"
        if ([string]::IsNullOrEmpty($projectId)) {
            throw "No project ID provided. Deployment cannot continue."
        }
        gcloud config set project $projectId
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to set project ID. Please verify that the project ID is valid."
        }
        Log-Message "Project ID set to $projectId"
    } else {
        Log-Message "Using project: $projectId"
    }
    
    # Verify project exists and you have access
    Log-Message "Verifying project access..."
    $projectAccess = gcloud projects describe $projectId 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to access project $projectId. Please verify the project exists and you have necessary permissions."
    }
    Log-Message "Project access verified"
    
    # Check if App Engine API is enabled
    Log-Message "Checking if App Engine API is enabled..."
    $apiEnabled = gcloud services list --enabled --project=$projectId 2>&1 | Select-String "appengine.googleapis.com"
    if (-not $apiEnabled) {
        Log-Message "App Engine API not enabled. Enabling..."
        gcloud services enable appengine.googleapis.com --project=$projectId
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to enable App Engine API. Please enable it manually in the Google Cloud Console."
        }
        Log-Message "App Engine API enabled successfully"
    } else {
        Log-Message "App Engine API already enabled"
    }
    
    # Check for existing App Engine application
    Log-Message "Checking for existing App Engine application..."
    $appExists = gcloud app describe --project=$projectId 2>&1
    if ($LASTEXITCODE -ne 0) {
        Log-Message "No App Engine application found in project $projectId."
        $createApp = Read-Host "Would you like to create a new App Engine application? (y/n)"
        if ($createApp -eq "y" -or $createApp -eq "Y") {
            Log-Message "Creating new App Engine application in region europe-west3..."
            gcloud app create --project=$projectId --region=europe-west3
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to create App Engine application. Please create it manually in the Google Cloud Console."
            }
            Log-Message "App Engine application created successfully"
        } else {
            throw "Cannot deploy without an App Engine application. Deployment cancelled."
        }
    } else {
        Log-Message "Existing App Engine application found"
    }
    
    # Deploy to Google App Engine
    Log-Message "Running gcloud app deploy (this may take several minutes)..."
    
    # Start time measurement
    $startTime = Get-Date
    Log-Message "Deployment started at: $startTime"
    
    # Show deployment progress
    $deployJob = Start-Job -ScriptBlock {
        param($projectId)
        gcloud app deploy app.yaml --quiet --project=$projectId
        return $LASTEXITCODE
    } -ArgumentList $projectId
    
    # Display a spinner while waiting
    $spinner = @('|', '/', '-', '\')
    $spinnerPos = 0
    while($deployJob.State -eq 'Running') {
        Write-Host "`rDeploying $($spinner[$spinnerPos])" -NoNewline
        Start-Sleep -Milliseconds 200
        $spinnerPos = ($spinnerPos + 1) % 4
        
        # After 30 seconds, start showing elapsed time
        $elapsedTime = (Get-Date) - $startTime
        if ($elapsedTime.TotalSeconds -gt 30) {
            Write-Host "`rDeploying $($spinner[$spinnerPos]) [Elapsed: $($elapsedTime.ToString('mm\:ss'))]" -NoNewline
        }
    }
    Write-Host "`r                                                     " -NoNewline
    
    # Get deployment results
    $deployResult = Receive-Job -Job $deployJob
    Remove-Job -Job $deployJob
    
    # Log the full output
    Log-Message "Deployment output: $deployResult"
    
    # Check if the deployment was successful
    if ($deployResult -ne 0) {
        # Calculate elapsed time
        $endTime = Get-Date
        $duration = ($endTime - $startTime)
        
        Log-Message "Deployment failed after $($duration.ToString('mm\:ss'))"
        throw "Deployment failed with exit code $deployResult. Check the Google Cloud Console for details."
    }
    
    # Calculate elapsed time
    $endTime = Get-Date
    $duration = ($endTime - $startTime)
    
    Log-Message "Deployment completed successfully at $(Get-Date)"
    Log-Message "Deployment duration: $($duration.ToString('mm\:ss'))"
    Log-Message "The application is now available at https://$projectId.appspot.com"
    
    # Verify application is accessible
    Log-Message "Verifying application availability..."
    try {
        $request = [System.Net.WebRequest]::Create("https://$projectId.appspot.com")
        $request.Timeout = 30000 # 30 seconds
        $response = $request.GetResponse()
        $httpStatus = [int]$response.StatusCode
        $response.Close()
        
        if ($httpStatus -eq 200 -or $httpStatus -eq 302) {
            Log-Message "Application is responding correctly (HTTP Status: $httpStatus)"
        } else {
            Log-Message "Application returned unexpected status code: $httpStatus. It may still be starting up."
        }
    } catch {
        Log-Message "Warning: Unable to verify application availability. The application may still be starting up."
        Log-Message "Error details: $_"
    }
    
    # Return to the original directory
    Set-Location ..
    
    # Clean up
    Log-Message "Cleaning up..."
    Remove-Item -Path $tempDir -Recurse -Force
    
    Log-Message "Deployment completed successfully"
} catch {
    Log-Message "Error: $_"
    Log-Message "Deployment failed"
    
    # Return to the original directory
    Set-Location ..
    
    # Exit with error
    exit 1
}
