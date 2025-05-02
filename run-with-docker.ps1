# Run FinDoc Analyzer with Docker
# This script runs the application using Docker Compose

# Set error action preference
$ErrorActionPreference = "Stop"

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "Docker is installed: $dockerVersion"
}
catch {
    Write-Host "Docker is not installed. Please install Docker Desktop and try again."
    exit 1
}

# Check if Docker Compose is installed
try {
    $dockerComposeVersion = docker-compose --version
    Write-Host "Docker Compose is installed: $dockerComposeVersion"
}
catch {
    Write-Host "Docker Compose is not installed. Please install Docker Desktop with Docker Compose and try again."
    exit 1
}

# Prompt for Gemini API key
$geminiApiKey = Read-Host -Prompt "Enter your Gemini API key (press Enter to use the default key)"

# Use default key if none provided
if ([string]::IsNullOrWhiteSpace($geminiApiKey)) {
    $geminiApiKey = "sk-or-v1-a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9"
    Write-Host "Using default API key (this is a placeholder and won't work for real API calls)"
}

# Set environment variable for the Gemini API key
$env:GEMINI_API_KEY = $geminiApiKey
Write-Host "Gemini API key set in environment variable GEMINI_API_KEY"

# Create necessary directories
$directories = @("uploads", "temp", "results", "enhanced_output", "test_documents")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# Create test documents if they don't exist
$messosDocumentPath = Join-Path "test_documents" "messos_portfolio.pdf"
if (-not (Test-Path $messosDocumentPath)) {
    Write-Host "Creating test documents..."
    
    # Check if Python is installed
    try {
        $pythonVersion = python --version
        Write-Host "Python is installed: $pythonVersion"
        
        # Check if fpdf is installed
        try {
            python -c "import fpdf" 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Installing fpdf..."
                python -m pip install fpdf
            }
        }
        catch {
            Write-Host "Installing fpdf..."
            python -m pip install fpdf
        }
        
        # Create test documents using Python
        $createTestDocumentScript = Join-Path "test_documents" "create_test_document.py"
        if (Test-Path $createTestDocumentScript) {
            python $createTestDocumentScript --output-dir "test_documents"
        }
        else {
            Write-Host "Test document script not found. Skipping test document creation."
        }
    }
    catch {
        Write-Host "Python is not installed. Skipping test document creation."
    }
}

# Stop any running containers
Write-Host "Stopping any running containers..."
docker-compose down

# Build and start the containers
Write-Host "Building and starting containers..."
docker-compose up --build -d

# Wait for the services to start
Write-Host "Waiting for services to start..."
Start-Sleep -Seconds 10

# Get the frontend URL
$frontendUrl = "http://localhost:3002"

# Open the browser
Write-Host "Opening browser..."
Start-Process $frontendUrl

# Display information
Write-Host ""
Write-Host "FinDoc Analyzer is now running with Docker!"
Write-Host "Frontend: $frontendUrl"
Write-Host "Backend API: http://localhost:5000"
Write-Host ""
Write-Host "The application is running in Docker containers with the same functionality"
Write-Host "as your local development environment."
Write-Host ""
Write-Host "To stop the application, press Ctrl+C and then run 'docker-compose down'"
Write-Host ""
Write-Host "Press Ctrl+C to stop the script (containers will continue running)"

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Host "Script stopped. Containers are still running."
    Write-Host "To stop the containers, run 'docker-compose down'"
}
