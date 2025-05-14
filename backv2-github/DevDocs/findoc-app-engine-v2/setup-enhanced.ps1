# Setup FinDoc Analyzer Enhanced Edition
# This script sets up the environment for the enhanced version

Write-Host "Setting up FinDoc Analyzer Enhanced Edition..." -ForegroundColor Cyan

# Create required directories
$requiredDirs = @(
    "uploads",
    "temp",
    "results",
    "logs",
    "test_pdfs"
)

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path -Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "Created $dir directory" -ForegroundColor Green
    } else {
        Write-Host "$dir directory already exists" -ForegroundColor Yellow
    }
}

# Copy enhanced package.json
if (Test-Path -Path "package-enhanced.json") {
    Copy-Item -Path "package-enhanced.json" -Destination "package.json" -Force
    Write-Host "Copied enhanced package.json to package.json" -ForegroundColor Green
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

# Generate test PDF
Write-Host "Generating test PDF..." -ForegroundColor Green
node create-sample-pdf.js

Write-Host "Setup complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the enhanced application:" -ForegroundColor White
Write-Host "  .\run-enhanced.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test the enhanced API:" -ForegroundColor White
Write-Host "  .\test-enhanced.ps1" -ForegroundColor Yellow
Write-Host ""
