Write-Host "Installing Python dependencies for FinDoc Analyzer..." -ForegroundColor Green

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Python is installed: $pythonVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Python is not installed. Please install Python 3.8 or higher." -ForegroundColor Red
    exit 1
}

# Install required packages
Write-Host "Installing required Python packages..." -ForegroundColor Cyan
python -m pip install --upgrade pip
python -m pip install camelot-py opencv-python PyMuPDF pandas tabula-py ghostscript

# Create necessary directories
Write-Host "Creating necessary directories..." -ForegroundColor Cyan
$tempDir = Join-Path $PSScriptRoot "temp"
$uploadsDir = Join-Path $PSScriptRoot "uploads"
$resultsDir = Join-Path $PSScriptRoot "results"

if (-not (Test-Path -Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    Write-Host "Created temp directory: $tempDir" -ForegroundColor Green
}

if (-not (Test-Path -Path $uploadsDir)) {
    New-Item -ItemType Directory -Path $uploadsDir | Out-Null
    Write-Host "Created uploads directory: $uploadsDir" -ForegroundColor Green
}

if (-not (Test-Path -Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir | Out-Null
    Write-Host "Created results directory: $resultsDir" -ForegroundColor Green
}

Write-Host "Python dependencies installation complete!" -ForegroundColor Green
