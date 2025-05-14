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

# Deploy to Google App Engine
Write-Host "${BLUE}Deploying to Google App Engine...${NC}"
try {
    gcloud app deploy app.yaml --quiet --project=$PROJECT_ID --version=$VERSION
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment failed"
    }
    Write-Host "${GREEN}Deployment initiated successfully!${NC}"
}
catch {
    Write-Host "${RED}Error: Deployment failed.${NC}"
    exit 1
}

# Verify deployment
Write-Host "${BLUE}Waiting for deployment to complete...${NC}"
Start-Sleep -Seconds 60

# Get the deployed URL
$appUrl = "https://$PROJECT_ID.ey.r.appspot.com"
Write-Host "${GREEN}Deployment completed!${NC}"
Write-Host "${BLUE}Your application is available at:${NC} $appUrl"

# Open the application in the default browser
Write-Host "${BLUE}Opening the application in the default browser...${NC}"
Start-Process $appUrl

Write-Host "${YELLOW}====================================================${NC}"
Write-Host "${GREEN}Modern UI Deployment Completed!${NC}"
Write-Host "${YELLOW}====================================================${NC}"
