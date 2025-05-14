# Run Scan1 Integration Test
# This script runs the scan1 integration test

Write-Host "Running scan1 integration test..." -ForegroundColor Green

# Install required packages if they don't exist
if (-not (Test-Path -Path "node_modules/uuid")) {
    Write-Host "Installing uuid package..." -ForegroundColor Yellow
    npm install uuid
}

# Run the integration test
Write-Host "Running integration test..." -ForegroundColor Yellow
node test-scan1-integration.js

# Start the server
Write-Host "Starting server for API test..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -NoNewWindow -PassThru

# Wait for the server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Run the API test
Write-Host "Running API test..." -ForegroundColor Yellow
node test-scan1.js

# Stop the server
Write-Host "Stopping server..." -ForegroundColor Yellow
Stop-Process -Id $serverProcess.Id -Force

Write-Host "Test completed." -ForegroundColor Green
