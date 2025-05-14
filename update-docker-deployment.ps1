# Update Docker Deployment with Fixes
Write-Host "===================================================
Updating Docker Deployment with Fixes
===================================================" -ForegroundColor Green

# Step 1: Ensure we have the fixes zip file
Write-Host "`n=== Step 1: Checking for fixes zip file ===" -ForegroundColor Cyan
if (-not (Test-Path -Path "findoc-fixes.zip")) {
    Write-Host "Fixes zip file not found. Creating it now..." -ForegroundColor Yellow
    npm install archiver
    node deploy-fixes.js
} else {
    Write-Host "Fixes zip file found." -ForegroundColor Green
}

# Step 2: Extract the fixes
Write-Host "`n=== Step 2: Extracting fixes ===" -ForegroundColor Cyan
if (-not (Test-Path -Path "fixes-temp")) {
    New-Item -ItemType Directory -Path "fixes-temp" -Force | Out-Null
}
Expand-Archive -Path "findoc-fixes.zip" -DestinationPath "fixes-temp" -Force
Write-Host "Fixes extracted to fixes-temp directory." -ForegroundColor Green

# Step 3: Copy the fixes to the appropriate locations
Write-Host "`n=== Step 3: Copying fixes to appropriate locations ===" -ForegroundColor Cyan

# Copy public files
if (Test-Path -Path "fixes-temp/public") {
    Write-Host "Copying public files..." -ForegroundColor Yellow
    Copy-Item -Path "fixes-temp/public/*" -Destination "public/" -Recurse -Force
    Write-Host "Public files copied." -ForegroundColor Green
}

# Copy server.js
if (Test-Path -Path "fixes-temp/server.js") {
    Write-Host "Copying server.js..." -ForegroundColor Yellow
    Copy-Item -Path "fixes-temp/server.js" -Destination "server.js" -Force
    Write-Host "server.js copied." -ForegroundColor Green
}

# Step 4: Build and run Docker container
Write-Host "`n=== Step 4: Building and running Docker container ===" -ForegroundColor Cyan
docker-compose build
docker-compose up -d

Write-Host "`nDocker container updated and running. You can access the application at http://localhost:8080" -ForegroundColor Green

# Step 5: Clean up
Write-Host "`n=== Step 5: Cleaning up ===" -ForegroundColor Cyan
Remove-Item -Path "fixes-temp" -Recurse -Force
Write-Host "Temporary files cleaned up." -ForegroundColor Green

Write-Host "===================================================
Docker Deployment Update Complete!
===================================================" -ForegroundColor Green
