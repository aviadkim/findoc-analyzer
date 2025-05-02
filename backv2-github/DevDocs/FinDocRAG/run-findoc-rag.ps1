# PowerShell script to run the FinDocRAG backend

# Stop any existing Python processes
Write-Host "Stopping any existing Python processes..."
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Set environment variables
$env:GEMINI_API_KEY = "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"
$env:UPLOAD_FOLDER = "./uploads"
$env:TEMP_FOLDER = "./temp"
$env:RESULTS_FOLDER = "./results"

# Create directories if they don't exist
if (-not (Test-Path $env:UPLOAD_FOLDER)) {
    New-Item -ItemType Directory -Path $env:UPLOAD_FOLDER | Out-Null
}

if (-not (Test-Path $env:TEMP_FOLDER)) {
    New-Item -ItemType Directory -Path $env:TEMP_FOLDER | Out-Null
}

if (-not (Test-Path $env:RESULTS_FOLDER)) {
    New-Item -ItemType Directory -Path $env:RESULTS_FOLDER | Out-Null
}

# Change to the FinDocRAG directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

# Change to the src/google_agents_integration directory
if (Test-Path ".\src\google_agents_integration") {
    Set-Location -Path ".\src\google_agents_integration"
} else {
    Write-Host "Error: src/google_agents_integration directory not found."
    Write-Host "Current directory: $(Get-Location)"
    Write-Host "Available directories:"
    Get-ChildItem -Directory | ForEach-Object { Write-Host "  - $($_.Name)" }
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Using $pythonVersion"
}
catch {
    Write-Host "Python is not installed or not in the PATH. Please install Python 3.8 or higher."
    exit 1
}

# Check if requirements are installed
if (-not (Test-Path ".\.venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv

    Write-Host "Activating virtual environment..."
    .\.venv\Scripts\Activate.ps1

    Write-Host "Installing requirements..."
    pip install -r requirements.txt
}
else {
    Write-Host "Activating virtual environment..."
    .\.venv\Scripts\Activate.ps1
}

# Install only the essential packages
Write-Host "Installing essential packages..."
pip install flask flask-cors

# Run the simplified FinDocRAG backend
Write-Host "Starting FinDocRAG backend..."
python app_simple.py

# Deactivate virtual environment when done
deactivate
