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

# Wait for the application to start
Write-Host "Waiting for the application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open the application in the default browser
Write-Host "Opening the application in the default browser..." -ForegroundColor Green
Start-Process "http://localhost:8080"

Write-Host "
===================================================
Docker Containers Started!
===================================================

The FinDoc Analyzer is now running in Docker containers:

- Application: http://localhost:8080
- API Health: http://localhost:8080/api/health

To stop the containers, run:
docker-compose down

To view logs, run:
docker-compose logs -f

Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
