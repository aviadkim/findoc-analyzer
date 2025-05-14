# Deploy to Docker Script
Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Starting deployment to Docker..." -ForegroundColor Green

# Step 1: Build Docker image
Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Step 1: Building Docker image..." -ForegroundColor Cyan
docker build -t findoc-analyzer:latest .

# Check if the build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Error building Docker image. Exiting." -ForegroundColor Red
    exit 1
}

# Step 2: Stop and remove existing container if it exists
Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Step 2: Stopping and removing existing container..." -ForegroundColor Cyan
docker stop findoc-analyzer 2>$null
docker rm findoc-analyzer 2>$null

# Step 3: Run the container
Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Step 3: Running the container..." -ForegroundColor Cyan
docker run -d --name findoc-analyzer -p 3002:3000 findoc-analyzer:latest

# Check if the container is running
$containerRunning = docker ps -f "name=findoc-analyzer" --format "{{.Names}}" | Select-String -Pattern "findoc-analyzer"

if ($containerRunning) {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Container is running successfully." -ForegroundColor Green
    
    # Get container IP
    $containerIP = docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' findoc-analyzer
    
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Container IP: $containerIP" -ForegroundColor Green
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Application is available at: http://localhost:3002" -ForegroundColor Green
    
    # Open the application in the default browser
    Start-Process "http://localhost:3002"
} else {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Error: Container is not running." -ForegroundColor Red
    
    # Show container logs
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Container logs:" -ForegroundColor Yellow
    docker logs findoc-analyzer
}

Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Deployment to Docker completed." -ForegroundColor Green
