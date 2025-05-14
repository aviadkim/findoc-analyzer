# Run Fix for Google Login 404 Issue
Write-Host "Running Fix for Google Login 404 Issue..." -ForegroundColor Green

# Run the fix script
Write-Host "`n=== Running fix script ===" -ForegroundColor Cyan
node fix-google-login-simple.js

Write-Host "`nGoogle login fix completed." -ForegroundColor Green
