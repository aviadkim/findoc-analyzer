# Run Docling Integration with Scan1
Write-Host "Running Docling Integration with Scan1..." -ForegroundColor Green

# Step 1: Install required Node.js packages
Write-Host "`n=== Step 1: Installing required Node.js packages ===" -ForegroundColor Cyan
npm install uuid

# Step 2: Run the Docling integration test
Write-Host "`n=== Step 2: Running Docling integration test ===" -ForegroundColor Cyan
node test-docling-integration.js

# Step 3: Integrate Docling with Scan1
Write-Host "`n=== Step 3: Integrating Docling with Scan1 ===" -ForegroundColor Cyan
node integrate-docling-with-scan1.js

# Step 4: Restart the application
Write-Host "`n=== Step 4: Restarting the application ===" -ForegroundColor Cyan
Write-Host "Please restart the application to apply the changes." -ForegroundColor Yellow

Write-Host "`nDocling integration completed." -ForegroundColor Green
