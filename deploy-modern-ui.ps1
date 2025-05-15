# FinDoc Analyzer - Modern UI Deployment Script
# This script deploys the FinDoc Analyzer Modern UI to Google App Engine

# Configuration
$PROJECT_ID = "findoc-deploy"
$REGION = "europe-west3"
$SERVICE_NAME = "default"
$VERSION = "modern-ui-v1"

# Color codes for output
$GREEN = "\033[0;32m"
$YELLOW = "\033[1;33m"
$RED = "\033[0;31m"
$BLUE = "\033[0;34m"
$NC = "\033[0m" # No Color

Write-Host "${YELLOW}====================================================${NC}"
Write-Host "${YELLOW}FinDoc Analyzer - Modern UI Deployment${NC}"
Write-Host "${YELLOW}====================================================${NC}"
Write-Host "${BLUE}Project ID:${NC} $PROJECT_ID"
Write-Host "${BLUE}Region:${NC} $REGION"
Write-Host "${BLUE}Service:${NC} $SERVICE_NAME"
Write-Host "${BLUE}Version:${NC} $VERSION"
Write-Host "${YELLOW}====================================================${NC}"

# Verify gcloud is installed
try {
    $gcloudVersion = gcloud --version | Select-Object -First 1
    Write-Host "${GREEN}Using $gcloudVersion${NC}"
}
catch {
    Write-Host "${RED}Error: gcloud CLI not found. Please install Google Cloud SDK.${NC}"
    exit 1
}

# Verify project
$currentProject = gcloud config get-value project
if ($currentProject -ne $PROJECT_ID) {
    Write-Host "${BLUE}Setting project to $PROJECT_ID...${NC}"
    gcloud config set project $PROJECT_ID
}

# Create necessary directories if they don't exist
Write-Host "${BLUE}Creating necessary directories...${NC}"
$directories = @("public", "public/css", "public/js", "public/images")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# Copy modern UI files to public directory
Write-Host "${BLUE}Copying modern UI files to public directory...${NC}"
Copy-Item -Path "public/login.html" -Destination "public/login.html" -Force
Copy-Item -Path "public/upload.html" -Destination "public/upload.html" -Force

# Create CSS directory if it doesn't exist
if (-not (Test-Path "public/css/modern-ui.css")) {
    Write-Host "${BLUE}Creating modern-ui.css...${NC}"
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
"@ | Out-File -FilePath "public/css/modern-ui.css" -Encoding utf8
}

# Verify Cloud SDK and authentication
Write-Host "${BLUE}Verifying Google Cloud SDK and authentication...${NC}"
try {
    $gcloudAuth = gcloud auth list --format="value(account)" 2>&1
    if ([string]::IsNullOrEmpty($gcloudAuth) -or $LASTEXITCODE -ne 0) {
        Write-Host "${YELLOW}Not authenticated with gcloud. Please log in...${NC}"
        gcloud auth login
        if ($LASTEXITCODE -ne 0) {
            throw "Authentication failed. Please run 'gcloud auth login' manually."
        }
    } else {
        Write-Host "${GREEN}Authenticated as: $gcloudAuth${NC}"
    }
}
catch {
    Write-Host "${RED}Error: Failed to verify authentication - $_${NC}"
    exit 1
}

# Verify project access
Write-Host "${BLUE}Verifying project access...${NC}"
try {
    gcloud projects describe $PROJECT_ID --format="value(name)" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to access project $PROJECT_ID"
    }
    Write-Host "${GREEN}Project access verified${NC}"
}
catch {
    Write-Host "${RED}Error: $_ ${NC}"
    Write-Host "${YELLOW}Please verify the project exists and you have necessary permissions.${NC}"
    exit 1
}

# Check if App Engine API is enabled
Write-Host "${BLUE}Checking if App Engine API is enabled...${NC}"
$apiEnabled = $false
try {
    $apiCheck = gcloud services list --enabled --project=$PROJECT_ID --filter="name:appengine.googleapis.com" --format="value(name)"
    $apiEnabled = -not [string]::IsNullOrEmpty($apiCheck)
}
catch {
    $apiEnabled = $false
}

if (-not $apiEnabled) {
    Write-Host "${YELLOW}App Engine API not enabled. Enabling...${NC}"
    try {
        gcloud services enable appengine.googleapis.com --project=$PROJECT_ID
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to enable App Engine API"
        }
        Write-Host "${GREEN}App Engine API enabled successfully${NC}"
    }
    catch {
        Write-Host "${RED}Error: $_${NC}"
        Write-Host "${YELLOW}Please enable the App Engine API manually in the Google Cloud Console.${NC}"
        exit 1
    }
}

# Deploy to Google App Engine
Write-Host "${BLUE}Deploying to Google App Engine...${NC}"
$startTime = Get-Date

# Create a deployment log file
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-log-$timestamp.txt"
"Deployment started at $(Get-Date)" | Out-File -FilePath $logFile -Append

try {
    # Run deployment as a background job with progress indicator
    $deployJob = Start-Job -ScriptBlock {
        param($PROJECT_ID, $VERSION, $logFile)
        
        $output = gcloud app deploy app.yaml --quiet --project=$PROJECT_ID --version=$VERSION 2>&1
        $exitCode = $LASTEXITCODE
        
        # Log the output
        $output | Out-File -FilePath $logFile -Append
        
        return @{
            ExitCode = $exitCode
            Output = $output
        }
    } -ArgumentList $PROJECT_ID, $VERSION, $logFile
    
    # Show a spinner while waiting
    $spinner = @('|', '/', '-', '\')
    $spinnerPos = 0
    
    Write-Host -NoNewline "Deploying "
    while ($deployJob.State -eq "Running") {
        Write-Host -NoNewline $spinner[$spinnerPos]
        Start-Sleep -Milliseconds 300
        Write-Host -NoNewline "`b"
        
        $spinnerPos = ($spinnerPos + 1) % 4
        
        # After 10 seconds, show elapsed time
        $elapsedTime = (Get-Date) - $startTime
        if ($elapsedTime.TotalSeconds -gt 10) {
            $elapsedFormatted = "{0:mm\:ss}" -f $elapsedTime
            Write-Host -NoNewline " [Elapsed: $elapsedFormatted]`r"
        }
    }
    
    # Get the results
    $deployResult = Receive-Job -Job $deployJob
    Remove-Job -Job $deployJob
    
    if ($deployResult.ExitCode -ne 0) {
        "Deployment failed at $(Get-Date)" | Out-File -FilePath $logFile -Append
        throw "Deployment failed with exit code $($deployResult.ExitCode). Check the log file: $logFile"
    }
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    $durationFormatted = "{0:mm\:ss}" -f $duration
    
    Write-Host "`n${GREEN}Deployment completed successfully in $durationFormatted!${NC}"
    "Deployment completed successfully at $(Get-Date)" | Out-File -FilePath $logFile -Append
    "Deployment duration: $durationFormatted" | Out-File -FilePath $logFile -Append
}
catch {
    Write-Host "${RED}Error: Deployment failed - $_${NC}"
    "Deployment error: $_" | Out-File -FilePath $logFile -Append
    
    # Show how to view logs
    Write-Host "${YELLOW}You can view application logs with:${NC}"
    Write-Host "gcloud app logs tail --project=$PROJECT_ID"
    Write-Host "${YELLOW}Check deployment log file:${NC} $logFile"
    exit 1
}

# Get the deployed URL
$appUrl = "https://$PROJECT_ID.ey.r.appspot.com"
Write-Host "${GREEN}Deployment completed!${NC}"
Write-Host "${BLUE}Your application is available at:${NC} $appUrl"

# Verify application is accessible
Write-Host "${BLUE}Verifying application availability...${NC}"
try {
    $request = [System.Net.WebRequest]::Create($appUrl)
    $request.Timeout = 30000 # 30 seconds
    $response = $request.GetResponse()
    $httpStatus = [int]$response.StatusCode
    $response.Close()
    
    if ($httpStatus -eq 200 -or $httpStatus -eq 302) {
        Write-Host "${GREEN}Application is responding correctly (HTTP Status: $httpStatus)${NC}"
    } else {
        Write-Host "${YELLOW}Application returned unexpected status code: $httpStatus. It may still be starting up.${NC}"
    }
} catch {
    Write-Host "${YELLOW}Warning: Unable to verify application availability. The application may still be starting up.${NC}"
    Write-Host "${YELLOW}Error details: $_${NC}"
}

# Open the application in the default browser
Write-Host "${BLUE}Opening the application in the default browser...${NC}"
try {
    Start-Process $appUrl
} catch {
    Write-Host "${YELLOW}Unable to open browser automatically. Please visit:${NC} $appUrl"
}

Write-Host "${YELLOW}====================================================${NC}"
Write-Host "${GREEN}Modern UI Deployment Completed!${NC}"
Write-Host "${YELLOW}====================================================${NC}"
