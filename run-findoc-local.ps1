# Run FinDoc Analyzer locally
# This script starts the backend server on port 3002

Write-Host "Starting FinDoc Analyzer locally..." -ForegroundColor Green

# Set environment variables
$env:GEMINI_API_KEY = "AIzaSyDJC5a882ruaJN2YJC6RU9J8QW9jkJKzXo"
$env:PORT = 3002
$env:NODE_ENV = "development"
$env:SUPABASE_URL = "https://dnjnsotemnfrjlotgved.supabase.co"
$env:SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam5zb3RlbW5mcmpsb3RndmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0MzQ4NjcsImV4cCI6MTk5ODAxMDg2N30.t2oGhMPXxeY9jrQq5E7VDfGt2Vf_AgeStBjQfqfcBjY"
$env:JWT_SECRET = "findoc-secret-key"
$env:UPLOAD_FOLDER = Join-Path $PSScriptRoot "uploads"
$env:TEMP_FOLDER = Join-Path $PSScriptRoot "temp"
$env:RESULTS_FOLDER = Join-Path $PSScriptRoot "results"

# Create necessary directories
$directories = @("logs", "uploads", "temp", "results")
foreach ($dir in $directories) {
    $dirPath = Join-Path $PSScriptRoot $dir
    if (-not (Test-Path -Path $dirPath)) {
        New-Item -ItemType Directory -Path $dirPath | Out-Null
        Write-Host "Created directory: $dirPath" -ForegroundColor Green
    }
}

# Change to the application directory
$appDir = Join-Path $PSScriptRoot "backv2-github\DevDocs\findoc-app-engine-v2"
Set-Location $appDir

# Check if node_modules exists
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
}

# Start the server
Write-Host "Starting server on port 3002..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run the server
node server.js
