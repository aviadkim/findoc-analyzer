# Test Docker Setup
# This script tests the Docker setup by building and running the containers

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

# Set a test Gemini API key
$env:GEMINI_API_KEY = "test-api-key"

# Create necessary directories
$directories = @("uploads", "temp", "results", "enhanced_output", "test_documents")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
}

# Create a simple test file
$testFilePath = Join-Path "test_documents" "test.txt"
Set-Content -Path $testFilePath -Value "This is a test file."
Write-Host "Created test file: $testFilePath"

# Build the Docker images
Write-Host "Building Docker images..."
docker-compose build

# Check if the build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed. Please check the error messages above."
    exit 1
}

# Start the containers
Write-Host "Starting containers..."
docker-compose up -d

# Check if the containers are running
$runningContainers = docker-compose ps --services --filter "status=running"
if (-not $runningContainers) {
    Write-Host "Containers failed to start. Please check the logs with 'docker-compose logs'."
    docker-compose down
    exit 1
}

# Wait for the services to start
Write-Host "Waiting for services to start..."
Start-Sleep -Seconds 10

# Test the backend API
try {
    Write-Host "Testing backend API..."
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "Backend API is working!"
    }
    else {
        Write-Host "Backend API returned status code $($response.StatusCode)."
    }
}
catch {
    Write-Host "Failed to connect to backend API: $_"
}

# Test the frontend
try {
    Write-Host "Testing frontend..."
    $response = Invoke-WebRequest -Uri "http://localhost:3002" -Method GET -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend is working!"
    }
    else {
        Write-Host "Frontend returned status code $($response.StatusCode)."
    }
}
catch {
    Write-Host "Failed to connect to frontend: $_"
}

# Stop the containers
Write-Host "Stopping containers..."
docker-compose down

# Display summary
Write-Host ""
Write-Host "Docker Setup Test Summary"
Write-Host "------------------------"
Write-Host "Docker is installed and working correctly."
Write-Host "Docker Compose is installed and working correctly."
Write-Host "The Docker images were built successfully."
Write-Host "The containers were started successfully."
Write-Host ""
Write-Host "To run the application with Docker, use:"
Write-Host ".\run-with-docker.ps1"
Write-Host ""
Write-Host "To deploy to Google Cloud, use:"
Write-Host ".\deploy-to-gcloud.ps1"
