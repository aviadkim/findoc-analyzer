Write-Host "===================================================
Building and Running FinDoc Analyzer with Docker
==================================================="

# Create directories for Docker volumes
if (-not (Test-Path ".\uploads")) {
    New-Item -ItemType Directory -Path ".\uploads" -Force | Out-Null
    Write-Host "Created uploads directory"
}

if (-not (Test-Path ".\temp")) {
    New-Item -ItemType Directory -Path ".\temp" -Force | Out-Null
    Write-Host "Created temp directory"
}

if (-not (Test-Path ".\results")) {
    New-Item -ItemType Directory -Path ".\results" -Force | Out-Null
    Write-Host "Created results directory"
}

# Build and run the Docker containers
Write-Host "Building and starting Docker containers..."
docker-compose up --build -d

Write-Host "
===================================================
Docker Containers Started!
===================================================

The FinDoc Analyzer is now running in Docker containers:

- Frontend: http://localhost:3002
- Backend API: http://localhost:5000

To stop the containers, run:
docker-compose down

To view logs, run:
docker-compose logs -f

Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
