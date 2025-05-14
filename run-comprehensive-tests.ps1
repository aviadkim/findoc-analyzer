# Run Comprehensive QA Tests
Write-Host "===================================================
Running Comprehensive QA Tests
===================================================" -ForegroundColor Green

# Create test results directory if it doesn't exist
if (-not (Test-Path -Path "test-results")) {
    New-Item -ItemType Directory -Path "test-results"
}

# Step 1: Install required packages
Write-Host "`n=== Step 1: Installing required packages ===" -ForegroundColor Cyan
npm install playwright

# Step 2: Install Playwright browsers
Write-Host "`n=== Step 2: Installing Playwright browsers ===" -ForegroundColor Cyan
try {
    $playwrightVersion = npx playwright --version
    Write-Host "Playwright is installed: $playwrightVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing Playwright browsers..." -ForegroundColor Yellow
    npx playwright install chromium
}

# Step 3: Run the comprehensive tests
Write-Host "`n=== Step 3: Running comprehensive tests ===" -ForegroundColor Cyan
node comprehensive-qa-test.js

# Open the test results
Write-Host "`nTests completed. Opening test results..." -ForegroundColor Green
Invoke-Item "test-results"

Write-Host "`nComprehensive QA tests completed." -ForegroundColor Green
