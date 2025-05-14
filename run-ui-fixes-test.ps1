# Run UI Fixes Test
# This script runs the UI fixes test

Write-Host "Running UI Fixes Test..." -ForegroundColor Green

# Check if the application is running
$isRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002" -Method Head -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $isRunning = $true
    }
} catch {
    $isRunning = $false
}

# If the application is not running, start it
if (-not $isRunning) {
    Write-Host "Application is not running. Starting it..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File .\run-findoc-simple.ps1" -WindowStyle Minimized
    
    # Wait for the application to start
    Write-Host "Waiting for the application to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Run the UI fixes test
Write-Host "Running UI fixes test..." -ForegroundColor Cyan
node test-ui-fixes.js

# Open the test results
Write-Host "Opening test results..." -ForegroundColor Cyan
Start-Process "test-ui-fixes-results\test-results.html"

Write-Host "UI Fixes Test Complete!" -ForegroundColor Green
