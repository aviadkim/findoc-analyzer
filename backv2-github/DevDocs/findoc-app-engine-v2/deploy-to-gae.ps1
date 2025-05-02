# Google App Engine Deployment Script

# Configuration
$projectId = "findoc-deploy"
$region = "europe-west3"
$service = "default"
$version = "v1"
$appUrl = "https://findoc-deploy.ey.r.appspot.com"

Write-Host "FinDoc Analyzer - Google App Engine Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Project ID: $projectId"
Write-Host "Region: $region"
Write-Host "Service: $service"
Write-Host "Version: $version"
Write-Host "App URL: $appUrl"
Write-Host "================================================" -ForegroundColor Cyan

# Verify gcloud is installed
try {
    $gcloudVersion = gcloud --version | Select-Object -First 1
    Write-Host "Using $gcloudVersion" -ForegroundColor Green
}
catch {
    Write-Host "Error: gcloud CLI is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install the Google Cloud SDK from https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Verify gcloud auth
try {
    $account = gcloud auth list --filter=status:ACTIVE --format="value(account)"
    if ([string]::IsNullOrEmpty($account)) {
        throw "No active account found"
    }
    Write-Host "Authenticated as: $account" -ForegroundColor Green
}
catch {
    Write-Host "Error: Not authenticated with gcloud." -ForegroundColor Red
    Write-Host "Please run 'gcloud auth login' to authenticate." -ForegroundColor Yellow
    exit 1
}

# Verify project
try {
    $currentProject = gcloud config get-value project
    if ($currentProject -ne $projectId) {
        Write-Host "Setting project to $projectId..." -ForegroundColor Yellow
        gcloud config set project $projectId
    }
    Write-Host "Using project: $projectId" -ForegroundColor Green
}
catch {
    Write-Host "Error: Failed to set project." -ForegroundColor Red
    exit 1
}

# Run tests before deployment
Write-Host "`nRunning tests before deployment..." -ForegroundColor Cyan
try {
    npm test
    if ($LASTEXITCODE -ne 0) {
        throw "Tests failed"
    }
    Write-Host "Tests passed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error: Tests failed. Deployment aborted." -ForegroundColor Red
    exit 1
}

# Deploy to Google App Engine
Write-Host "`nDeploying to Google App Engine..." -ForegroundColor Cyan
try {
    gcloud app deploy app.yaml --quiet --project=$projectId --version=$version
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment failed"
    }
    Write-Host "Deployment initiated successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error: Deployment failed." -ForegroundColor Red
    exit 1
}

# Verify deployment
Write-Host "`nWaiting for deployment to complete..." -ForegroundColor Cyan
Start-Sleep -Seconds 60

Write-Host "Verifying deployment..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$appUrl/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $content = $response.Content | ConvertFrom-Json
        if ($content.success -eq $true) {
            Write-Host "Deployment verification successful!" -ForegroundColor Green
            Write-Host "API Health Status: $($content.data.status)" -ForegroundColor Green
            Write-Host "API Version: $($content.data.version)" -ForegroundColor Green
            Write-Host "API Environment: $($content.data.environment)" -ForegroundColor Green
        }
        else {
            throw "API returned success=false"
        }
    }
    else {
        throw "API returned status code $($response.StatusCode)"
    }
}
catch {
    Write-Host "Error: Deployment verification failed." -ForegroundColor Red
    Write-Host "Error details: $_" -ForegroundColor Red
    Write-Host "The application may still be deploying. Please check the Google Cloud Console." -ForegroundColor Yellow
}

# Open the application in the browser
Write-Host "`nOpening application in browser..." -ForegroundColor Cyan
Start-Process $appUrl

Write-Host "`nDeployment process completed!" -ForegroundColor Green
Write-Host "Application is available at: $appUrl" -ForegroundColor Cyan
