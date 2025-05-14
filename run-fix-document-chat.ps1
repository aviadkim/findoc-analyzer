# Run Fix for Document Chat Functionality
Write-Host "Running Fix for Document Chat Functionality..." -ForegroundColor Green

# Run the fix script
Write-Host "`n=== Running fix script ===" -ForegroundColor Cyan
node fix-document-chat-simple.js

Write-Host "`nDocument chat fix completed." -ForegroundColor Green
