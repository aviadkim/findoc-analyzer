Write-Host "===================================================
Starting FinDocRAG Backend
==================================================="

# Set the working directory to the FinDocRAG directory
$finDocRagDir = ".\backv2-github\DevDocs\FinDocRAG\src"

# Create a virtual environment if it doesn't exist
if (-not (Test-Path ".\venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate the virtual environment
Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate.ps1

# Set environment variables
$env:UPLOAD_FOLDER = Join-Path $finDocRagDir "uploads"
$env:TEMP_FOLDER = Join-Path $finDocRagDir "temp"
$env:RESULTS_FOLDER = Join-Path $finDocRagDir "results"
$env:GEMINI_API_KEY = "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"

# Create directories if they don't exist
if (-not (Test-Path $env:UPLOAD_FOLDER)) {
    New-Item -ItemType Directory -Path $env:UPLOAD_FOLDER -Force | Out-Null
}
if (-not (Test-Path $env:TEMP_FOLDER)) {
    New-Item -ItemType Directory -Path $env:TEMP_FOLDER -Force | Out-Null
}
if (-not (Test-Path $env:RESULTS_FOLDER)) {
    New-Item -ItemType Directory -Path $env:RESULTS_FOLDER -Force | Out-Null
}

# Change to the FinDocRAG directory
Set-Location $finDocRagDir

# Run the FinDocRAG backend
Write-Host "Starting FinDocRAG backend..."
python app.py
