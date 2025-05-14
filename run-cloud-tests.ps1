# Run Comprehensive Tests on Cloud Deployment
Write-Host "===================================================
Running Comprehensive Tests on Cloud Deployment
===================================================" -ForegroundColor Green

# Step 1: Set the cloud URL
$CLOUD_URL = "https://backv2-app-brfi73d4ra-zf.a.run.app"
Write-Host "Testing cloud deployment at: $CLOUD_URL" -ForegroundColor Yellow

# Step 2: Test Google login
Write-Host "`n=== Step 2: Testing Google login ===" -ForegroundColor Cyan
node test-google-login.js $CLOUD_URL

# Step 3: Test document chat
Write-Host "`n=== Step 3: Testing document chat ===" -ForegroundColor Cyan
node test-document-chat.js $CLOUD_URL

# Step 4: Test document processing
Write-Host "`n=== Step 4: Testing document processing ===" -ForegroundColor Cyan
node test-document-processing.js $CLOUD_URL

Write-Host "`nCloud tests completed." -ForegroundColor Green
