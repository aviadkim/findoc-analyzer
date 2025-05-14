# FinDoc Analyzer Run Script with UI Fixes
# This script runs the application with the UI fixes

Write-Host "Starting FinDoc Analyzer with UI fixes..." -ForegroundColor Green

# Step 1: Inject UI fixes into HTML files
Write-Host "Step 1: Injecting UI fixes into HTML files..." -ForegroundColor Cyan
node inject-ui-fixes.js

# Step 2: Run the existing run script
Write-Host "Step 2: Running the application..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File .\run-findoc-simple.ps1" -WindowStyle Minimized

# Step 3: Wait for the application to start
Write-Host "Step 3: Waiting for the application to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Step 4: Run the UI fixes test
Write-Host "Step 4: Running UI fixes test..." -ForegroundColor Cyan
node test-ui-fixes.js

# Step 5: Open the test results
Write-Host "Step 5: Opening test results..." -ForegroundColor Cyan
Start-Process "test-ui-fixes-results\test-results.html"

Write-Host "FinDoc Analyzer is running at http://localhost:3002" -ForegroundColor Cyan
Write-Host "UI fixes have been applied. All missing elements should now be present." -ForegroundColor Yellow
Write-Host "Check the test results for validation." -ForegroundColor Yellow
