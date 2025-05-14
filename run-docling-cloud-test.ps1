# Run Docling Cloud Integration Test
Write-Host "Running Docling Cloud Integration Test..." -ForegroundColor Green

# Step 1: Install required Node.js packages
Write-Host "`n=== Step 1: Installing required Node.js packages ===" -ForegroundColor Cyan
npm install axios form-data

# Step 2: Run the Docling cloud integration test
Write-Host "`n=== Step 2: Running Docling cloud integration test ===" -ForegroundColor Cyan
node test-docling-cloud.js

Write-Host "`nDocling cloud integration test completed." -ForegroundColor Green
