# Run Targeted Fix for Google Login 404 Issue
Write-Host "Running Targeted Fix for Google Login 404 Issue..." -ForegroundColor Green

# Run the fix script
Write-Host "`n=== Running targeted fix script ===" -ForegroundColor Cyan
node fix-google-login-targeted.js

Write-Host "`nGoogle login targeted fix completed." -ForegroundColor Green
