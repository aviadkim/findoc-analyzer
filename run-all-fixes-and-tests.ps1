# Master Script to Run All Fixes and Tests
Write-Host "Running All Fixes and Tests for FinDoc Analyzer..." -ForegroundColor Green

# Step 1: Run initial test to identify issues
Write-Host "`n=== Step 1: Running initial test to identify issues ===" -ForegroundColor Cyan
node simple-test.js

# Step 2: Fix Google login 404 issue
Write-Host "`n=== Step 2: Fixing Google login 404 issue ===" -ForegroundColor Cyan
node fix-google-login-simple.js

# Step 3: Fix document chat functionality
Write-Host "`n=== Step 3: Fixing document chat functionality ===" -ForegroundColor Cyan
node fix-document-chat-simple.js

# Step 4: Run test again to verify fixes
Write-Host "`n=== Step 4: Running test again to verify fixes ===" -ForegroundColor Cyan
node simple-test.js

Write-Host "`nAll fixes and tests completed." -ForegroundColor Green
