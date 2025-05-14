# Run UI Tests PowerShell Script
Write-Host "Running UI Tests for FinDoc Analyzer..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Create results directory
if (-not (Test-Path "tests\results")) {
    New-Item -ItemType Directory -Path "tests\results" | Out-Null
    Write-Host "Created tests\results directory." -ForegroundColor Cyan
}

# Run UI tests
Write-Host "`n=== Running UI Component Tests ===" -ForegroundColor Green
try {
    & node "tests\ui\dashboard.test.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Dashboard UI test completed successfully." -ForegroundColor Green
    } else {
        Write-Host "Dashboard UI test failed with exit code $LASTEXITCODE." -ForegroundColor Red
    }
} catch {
    Write-Host "Error running Dashboard UI test: $_" -ForegroundColor Red
}

# Run functionality tests
Write-Host "`n=== Running Functionality Tests ===" -ForegroundColor Green
try {
    & node "tests\functionality\document-upload.test.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Document Upload test completed successfully." -ForegroundColor Green
    } else {
        Write-Host "Document Upload test failed with exit code $LASTEXITCODE." -ForegroundColor Red
    }
    
    & node "tests\functionality\document-chat.test.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Document Chat test completed successfully." -ForegroundColor Green
    } else {
        Write-Host "Document Chat test failed with exit code $LASTEXITCODE." -ForegroundColor Red
    }
} catch {
    Write-Host "Error running Functionality tests: $_" -ForegroundColor Red
}

# Run integration tests
Write-Host "`n=== Running Integration Tests ===" -ForegroundColor Green
try {
    & node "tests\integration\frontend-backend.test.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Frontend-Backend Integration test completed successfully." -ForegroundColor Green
    } else {
        Write-Host "Frontend-Backend Integration test failed with exit code $LASTEXITCODE." -ForegroundColor Red
    }
} catch {
    Write-Host "Error running Integration tests: $_" -ForegroundColor Red
}

# Open test results
Write-Host "`n=== Opening Test Results ===" -ForegroundColor Green
$dashboardResults = "tests\results\dashboard-ui-test-results.json"
$uploadResults = "tests\results\document-upload-test-results.json"
$chatResults = "tests\results\document-chat-test-results.json"
$integrationResults = "tests\results\frontend-backend-test-results.json"

if (Test-Path $dashboardResults) {
    Write-Host "Dashboard UI Test Results:" -ForegroundColor Cyan
    $results = Get-Content $dashboardResults | ConvertFrom-Json
    Write-Host "Found $($results.found) of $($results.total) components" -ForegroundColor Cyan
}

if (Test-Path $uploadResults) {
    Write-Host "Document Upload Test Results:" -ForegroundColor Cyan
    $results = Get-Content $uploadResults | ConvertFrom-Json
    Write-Host "Success: $($results.success)" -ForegroundColor Cyan
}

if (Test-Path $chatResults) {
    Write-Host "Document Chat Test Results:" -ForegroundColor Cyan
    $results = Get-Content $chatResults | ConvertFrom-Json
    Write-Host "Success: $($results.success)" -ForegroundColor Cyan
}

if (Test-Path $integrationResults) {
    Write-Host "Frontend-Backend Integration Test Results:" -ForegroundColor Cyan
    $results = Get-Content $integrationResults | ConvertFrom-Json
    Write-Host "Success: $($results.success)" -ForegroundColor Cyan
}

Write-Host "`nUI Tests completed. Check the test results for details." -ForegroundColor Green
