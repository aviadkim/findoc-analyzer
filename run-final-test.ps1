# Run Final Test for FinDoc Analyzer
Write-Host "Running Final Test for FinDoc Analyzer..." -ForegroundColor Green

# Step 1: Run the targeted Google login fix
Write-Host "`n=== Step 1: Running targeted Google login fix ===" -ForegroundColor Cyan
node fix-google-login-targeted.js

# Step 2: Install required packages if not already installed
Write-Host "`n=== Step 2: Installing required packages ===" -ForegroundColor Cyan
npm install express playwright

# Step 3: Run the final test
Write-Host "`n=== Step 3: Running final test ===" -ForegroundColor Cyan
node final-test.js

Write-Host "`nFinal test completed." -ForegroundColor Green
