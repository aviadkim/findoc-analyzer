# Run Deploy Fixes
Write-Host "Running Deploy Fixes..." -ForegroundColor Green

# Step 1: Install required packages
Write-Host "`n=== Step 1: Installing required packages ===" -ForegroundColor Cyan
npm install archiver

# Step 2: Run the deploy fixes script
Write-Host "`n=== Step 2: Running deploy fixes script ===" -ForegroundColor Cyan
node deploy-fixes.js

Write-Host "`nDeploy fixes completed." -ForegroundColor Green
