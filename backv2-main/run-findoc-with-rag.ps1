# FinDoc Analyzer with FinDocRAG Startup Script
# This script starts both the FinDoc Analyzer frontend and the FinDocRAG backend

Write-Host "Starting FinDoc Analyzer with FinDocRAG..." -ForegroundColor Cyan

# Stop any existing Node.js and Python processes
Write-Host "Stopping any existing Node.js and Python processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Set the working directories
$frontendDir = Join-Path $PSScriptRoot "backv2-github\DevDocs\frontend"
$finDocRagDir = Join-Path $PSScriptRoot "backv2-github\DevDocs\FinDocRAG"

# Check if the directories exist
if (-not (Test-Path $frontendDir)) {
    Write-Host "Error: Frontend directory not found at $frontendDir" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the correct location." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $finDocRagDir)) {
    Write-Host "Error: FinDocRAG directory not found at $finDocRagDir" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the correct location." -ForegroundColor Red
    exit 1
}

# Start the FinDocRAG backend in a new PowerShell window
Write-Host "Starting FinDocRAG backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$finDocRagDir\run-findoc-rag.ps1`""

# Wait for the FinDocRAG backend to start
Write-Host "Waiting for FinDocRAG backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Change to the frontend directory
Set-Location $frontendDir

# Check if node_modules exists, if not, install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
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

# Stop the FinDocRAG backend when the frontend is stopped
Write-Host "Stopping FinDocRAG backend..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "FinDoc Analyzer with FinDocRAG has been stopped." -ForegroundColor Cyan
