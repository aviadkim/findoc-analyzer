# FinDoc Analyzer - Google Cloud App Engine Deployment Script
# This script deploys the FinDoc Analyzer application to Google App Engine

# Configuration
$projectId = "findoc-deploy"
$region = "europe-west3"
$serviceName = "findoc-analyzer"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deployment-log-$timestamp.txt"

# Function to log messages
function Log-Message {
    param (
        [string]$message
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $message"
    
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

# Function to run a command and log the output
function Run-Command {
    param (
        [string]$command,
        [string]$description
    )
    
    Log-Message "Running: $description"
    Log-Message "Command: $command"
    
    try {
        $output = Invoke-Expression $command
        Log-Message "Command completed successfully"
        return $output
    }
    catch {
        Log-Message "Error executing command: $_"
        throw $_
    }
}

# Step 1: Verify Google Cloud CLI is installed
Log-Message "Step 1: Verifying Google Cloud CLI installation..."
try {
    $gcloudVersion = Run-Command -command "gcloud --version" -description "Check gcloud version"
    Log-Message "Google Cloud CLI is installed: $gcloudVersion"
}
catch {
    Log-Message "Error: Google Cloud CLI is not installed or not in PATH"
    exit 1
}

# Step 2: Authenticate with Google Cloud
Log-Message "Step 2: Authenticating with Google Cloud..."
try {
    # Check if already authenticated
    $authList = Run-Command -command "gcloud auth list" -description "Check authentication status"
    
    if ($authList -match "ACTIVE") {
        Log-Message "Already authenticated with Google Cloud"
    }
    else {
        Run-Command -command "gcloud auth login" -description "Login to Google Cloud"
        Log-Message "Successfully authenticated with Google Cloud"
    }
}
catch {
    Log-Message "Error authenticating with Google Cloud: $_"
    exit 1
}

# Step 3: Set Google Cloud project
Log-Message "Step 3: Setting Google Cloud project to $projectId..."
try {
    Run-Command -command "gcloud config set project $projectId" -description "Set Google Cloud project"
    Log-Message "Successfully set Google Cloud project to $projectId"
}
catch {
    Log-Message "Error setting Google Cloud project: $_"
    exit 1
}

# Step 4: Create build directory
$buildDir = ".\build-$timestamp"
Log-Message "Step 4: Creating build directory at $buildDir..."
try {
    if (Test-Path $buildDir) {
        Remove-Item -Path $buildDir -Recurse -Force
    }
    
    New-Item -Path $buildDir -ItemType Directory | Out-Null
    Log-Message "Successfully created build directory"
}
catch {
    Log-Message "Error creating build directory: $_"
    exit 1
}

# Step 5: Copy files to build directory
Log-Message "Step 5: Copying files to build directory..."
try {
    # Copy server files
    Copy-Item -Path "server*.js" -Destination $buildDir -Recurse
    Copy-Item -Path "agent-manager.js" -Destination $buildDir -Recurse
    Copy-Item -Path "api-key-manager.js" -Destination $buildDir -Recurse
    
    # Copy directories
    $directories = @("services", "routes", "controllers", "models", "utils", "middleware", "public", "views")
    foreach ($dir in $directories) {
        if (Test-Path $dir) {
            Copy-Item -Path $dir -Destination $buildDir -Recurse
        }
    }
    
    # Copy package files
    Copy-Item -Path "package.json" -Destination $buildDir
    if (Test-Path "package-lock.json") {
        Copy-Item -Path "package-lock.json" -Destination $buildDir
    }
    
    Log-Message "Successfully copied files to build directory"
}
catch {
    Log-Message "Error copying files to build directory: $_"
    exit 1
}

# Step 6: Create app.yaml for App Engine deployment
Log-Message "Step 6: Creating app.yaml for App Engine deployment..."
try {
    $appYamlContent = @"
runtime: nodejs16
service: default
instance_class: F2
automatic_scaling:
  min_instances: 1
  max_instances: 10
  min_idle_instances: 1
  max_idle_instances: 2
  min_pending_latency: 30ms
  max_pending_latency: 300ms
  target_cpu_utilization: 0.65
  target_throughput_utilization: 0.65
env_variables:
  NODE_ENV: "production"
"@
    
    Set-Content -Path "$buildDir\app.yaml" -Value $appYamlContent
    Log-Message "Successfully created app.yaml"
}
catch {
    Log-Message "Error creating app.yaml: $_"
    exit 1
}

# Step 7: Install dependencies in build directory
Log-Message "Step 7: Installing dependencies in build directory..."
try {
    Set-Location -Path $buildDir
    Run-Command -command "npm install --production" -description "Install production dependencies"
    Set-Location -Path ".."
    Log-Message "Successfully installed dependencies"
}
catch {
    Log-Message "Error installing dependencies: $_"
    Set-Location -Path ".."
    exit 1
}

# Step 8: Deploy to Google App Engine
Log-Message "Step 8: Deploying to Google App Engine..."
try {
    Set-Location -Path $buildDir
    Run-Command -command "gcloud app deploy app.yaml --quiet" -description "Deploy to Google App Engine"
    Set-Location -Path ".."
    Log-Message "Successfully deployed to Google App Engine"
}
catch {
    Log-Message "Error deploying to Google App Engine: $_"
    Set-Location -Path ".."
    exit 1
}

# Step 9: Verify deployment
Log-Message "Step 9: Verifying deployment..."
try {
    $deployedUrl = Run-Command -command "gcloud app describe --format=`"value(defaultHostname)`"" -description "Get deployed URL"
    $deployedUrl = "https://$deployedUrl"
    Log-Message "Deployed URL: $deployedUrl"
    
    # Check if the application is running
    Log-Message "Checking if the application is running..."
    $response = Invoke-WebRequest -Uri "$deployedUrl/api/health" -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Log-Message "Application is running successfully"
    }
    else {
        Log-Message "Application health check failed with status: $($response.StatusCode)"
    }
}
catch {
    Log-Message "Error verifying deployment: $_"
}

# Step 10: Clean up
Log-Message "Step 10: Cleaning up..."
try {
    # Remove build directory
    if (Test-Path $buildDir) {
        Remove-Item -Path $buildDir -Recurse -Force
    }
    
    Log-Message "Successfully cleaned up"
}
catch {
    Log-Message "Error cleaning up: $_"
}

Log-Message "Deployment completed!"
Log-Message "Deployed URL: $deployedUrl"
