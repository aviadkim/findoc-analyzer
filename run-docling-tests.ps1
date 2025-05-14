# Run Docling Integration Tests
Write-Host "===================================================
Running Docling Integration Tests
===================================================" -ForegroundColor Green

# Step 1: Install required packages
Write-Host "`n=== Step 1: Installing required packages ===" -ForegroundColor Cyan
npm install axios form-data

# Step 2: Run the local tests
Write-Host "`n=== Step 2: Running local tests ===" -ForegroundColor Cyan
node test-docling-integration.js

# Step 3: Run the cloud tests
Write-Host "`n=== Step 3: Running cloud tests ===" -ForegroundColor Cyan
node test-docling-integration.js https://backv2-app-brfi73d4ra-zf.a.run.app

Write-Host "`nDocling integration tests completed." -ForegroundColor Green
