# Run Simple Test for FinDoc Analyzer
Write-Host "Running Simple Test for FinDoc Analyzer..." -ForegroundColor Green

# Step 1: Install required packages
Write-Host "`n=== Step 1: Installing required packages ===" -ForegroundColor Cyan
npm install playwright

# Step 2: Run the simple test
Write-Host "`n=== Step 2: Running simple test ===" -ForegroundColor Cyan
node simple-test.js

Write-Host "`nSimple test completed." -ForegroundColor Green
