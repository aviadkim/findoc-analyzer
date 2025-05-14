# Run FinDoc Analyzer with Docker Compose

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "Docker is running"
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop and try again."
    exit 1
}

# Build and start the containers
Write-Host "Building and starting the containers..."
docker-compose up --build -d

# Wait for the application to start
Write-Host "Waiting for the application to start..."
Start-Sleep -Seconds 10

# Open the application in the browser
Write-Host "Opening the application in the browser..."
Start-Process "http://localhost:8080"

Write-Host "FinDoc Analyzer is running at http://localhost:8080"
Write-Host "Press Ctrl+C to stop the application"

# Wait for user input
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Stop the containers when the user presses Ctrl+C
    Write-Host "Stopping the containers..."
    docker-compose down
}
