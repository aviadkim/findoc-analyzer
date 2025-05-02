# Deploy the full FinDoc application to Google App Engine

# Set error action preference
$ErrorActionPreference = "Stop"

# Define paths and variables
$appDir = $PSScriptRoot
$dockerfilePath = Join-Path $appDir "Dockerfile.full"
$appYamlPath = Join-Path $appDir "app.yaml"

# Check if required files exist
if (-not (Test-Path $dockerfilePath)) {
    Write-Error "Dockerfile.full not found at $dockerfilePath"
    exit 1
}

if (-not (Test-Path $appYamlPath)) {
    Write-Error "app.yaml not found at $appYamlPath"
    exit 1
}

# Display deployment information
Write-Host "=====================================================
Deploying Full FinDoc Application to Google App Engine
=====================================================
" -ForegroundColor Cyan

# Check if Google Cloud SDK is installed
$gcloudInstalled = $null -ne (Get-Command "gcloud" -ErrorAction SilentlyContinue)
if (-not $gcloudInstalled) {
    Write-Error "Google Cloud SDK is not installed. Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
}
Write-Host "Google Cloud SDK is installed." -ForegroundColor Green

# Check if user is logged in
$gcloudAuth = gcloud auth list --filter=status:ACTIVE --format="value(account)"
if ([string]::IsNullOrEmpty($gcloudAuth)) {
    Write-Host "You are not logged in to Google Cloud. Please log in." -ForegroundColor Yellow
    gcloud auth login
} else {
    Write-Host "Logged in as: $gcloudAuth" -ForegroundColor Green
}

# Set the project
$project = "findoc-deploy"
Write-Host "Setting project to: $project" -ForegroundColor Yellow
gcloud config set project $project

# Check if Gemini API key is set in Secret Manager
$secretExists = gcloud secrets describe gemini-api-key 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating Gemini API key secret..." -ForegroundColor Yellow
    $apiKey = Read-Host "Enter your Gemini API key" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKey)
    $apiKeyPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    # Create the secret
    $apiKeyPlain | gcloud secrets create gemini-api-key --data-file=-
    
    # Grant access to the App Engine service account
    gcloud secrets add-iam-policy-binding gemini-api-key --member="serviceAccount:$project@appspot.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
} else {
    Write-Host "Gemini API key secret already exists." -ForegroundColor Green
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Install additional dependencies needed for the build
npm install autoprefixer postcss tailwindcss react-markdown

# Copy Dockerfile.full to Dockerfile (required for App Engine flexible environment)
Copy-Item -Path $dockerfilePath -Destination (Join-Path $appDir "Dockerfile") -Force
Write-Host "Copied Dockerfile.full to Dockerfile" -ForegroundColor Green

# Deploy to App Engine
Write-Host "Deploying to App Engine..." -ForegroundColor Yellow
gcloud app deploy $appYamlPath --quiet

# Check deployment status
if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "Your application is now available at: https://$project.ey.r.appspot.com" -ForegroundColor Cyan
} else {
    Write-Host "Deployment failed. Please check the logs for more information." -ForegroundColor Red
}
