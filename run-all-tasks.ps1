# Run All Tasks PowerShell Script
Write-Host "Running All Tasks for FinDoc Analyzer" -ForegroundColor Green

# Step 1: Implement UI Components
Write-Host "`n=== Step 1: Implementing UI Components ===" -ForegroundColor Cyan
& .\run-ui-task.ps1 -task "dashboard"
& .\run-ui-task.ps1 -task "documents"

# Step 2: Test UI Components
Write-Host "`n=== Step 2: Testing UI Components ===" -ForegroundColor Cyan
$env:TEST_URL = "http://localhost:8081"
node tasks/testing/test-dashboard.js

# Step 3: Deploy to Google Cloud Run
Write-Host "`n=== Step 3: Deploying to Google Cloud Run ===" -ForegroundColor Cyan
$deployResult = node tasks/deployment/deploy-to-cloud.js

# Step 4: Test Cloud Deployment
Write-Host "`n=== Step 4: Testing Cloud Deployment ===" -ForegroundColor Cyan
$deployedUrl = (Get-Content -Path "deployment-info\deployment-*.json" | ConvertFrom-Json | Select-Object -Last 1).deployedUrl
if ($deployedUrl) {
    Write-Host "Testing deployed URL: $deployedUrl" -ForegroundColor Cyan
    $env:TEST_URL = $deployedUrl
    node tasks/testing/test-dashboard.js
} else {
    Write-Host "Error: Could not find deployed URL" -ForegroundColor Red
}

# Step 5: Run Integration Tests
Write-Host "`n=== Step 5: Running Integration Tests ===" -ForegroundColor Cyan
$env:TEST_URL = "http://localhost:8081"
if (Test-Path "tasks/testing/test-integration.js") {
    node tasks/testing/test-integration.js
} else {
    Write-Host "Integration tests not found" -ForegroundColor Yellow
}

Write-Host "`nAll tasks completed." -ForegroundColor Green
