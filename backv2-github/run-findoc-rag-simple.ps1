Write-Host "===================================================
Starting FinDocRAG Backend (Simple)
==================================================="

# Define directories
$uploadsDir = Join-Path $PSScriptRoot "uploads"
$tempDir = Join-Path $PSScriptRoot "temp"
$resultsDir = Join-Path $PSScriptRoot "results"

# Create directories if they don't exist
if (-not (Test-Path $uploadsDir)) {
    New-Item -ItemType Directory -Path $uploadsDir -Force | Out-Null
    Write-Host "Created uploads directory"
}

if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    Write-Host "Created temp directory"
}

if (-not (Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null
    Write-Host "Created results directory"
}

# Set environment variables
$env:UPLOAD_FOLDER = $uploadsDir
$env:TEMP_FOLDER = $tempDir
$env:RESULTS_FOLDER = $resultsDir

# Check if GEMINI_API_KEY is set
if (-not $env:GEMINI_API_KEY) {
    Write-Host "WARNING: GEMINI_API_KEY environment variable is not set."
    Write-Host "Please set it using: `$env:GEMINI_API_KEY='your-api-key-here'"
    
    # Use the default key for development (not recommended for production)
    $env:GEMINI_API_KEY = "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"
    Write-Host "Using default API key for development. DO NOT USE IN PRODUCTION."
}

# Start the backend
Write-Host "Starting FinDocRAG backend..."
Write-Host "API will be available at http://localhost:5000"
Write-Host "Press Ctrl+C to stop the server"
Write-Host "==================================================="

# Run the backend
python backv2-github/DevDocs/FinDocRAG/src/app.py
