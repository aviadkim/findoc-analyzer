# FinDoc Analyzer Startup Script
# This script starts the FinDoc Analyzer frontend application

Write-Host "Starting FinDoc Analyzer..." -ForegroundColor Cyan

# Stop any existing Node.js processes
Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Set the working directory to the frontend directory
$frontendDir = Join-Path $PSScriptRoot "backv2-github\DevDocs\frontend"

# Check if the directory exists
if (-not (Test-Path $frontendDir)) {
    Write-Host "Error: Frontend directory not found at $frontendDir" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the correct location." -ForegroundColor Red
    exit 1
}

# Change to the frontend directory
Set-Location $frontendDir

# Check if node_modules exists, if not, install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Start the development server
Write-Host "Starting Next.js frontend..." -ForegroundColor Green
Write-Host "The application will be available at http://localhost:3002" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Start the Next.js development server on port 3002
npm run dev -- -p 3002

# Return to the original directory
Set-Location $PSScriptRoot
