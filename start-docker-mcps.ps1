# Start MCP servers using Docker for FinDoc Analyzer testing

Write-Host "Starting MCP servers for FinDoc Analyzer testing..." -ForegroundColor Green

# Create directory for logs
$logDir = "mcp-logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
    Write-Host "Created log directory: $logDir" -ForegroundColor Yellow
}

# Check if Docker is running
try {
    $dockerStatus = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker is not running. Please start Docker and try again." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error checking Docker status: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Docker is running. Starting MCP servers..." -ForegroundColor Green

# Function to start a Docker container if it's not already running
function Start-DockerContainer {
    param (
        [string]$imageName,
        [string]$containerName,
        [string]$command,
        [string]$ports
    )
    
    # Check if container is already running
    $containerRunning = docker ps --filter "name=$containerName" --format "{{.Names}}" 2>&1
    
    if ($containerRunning -eq $containerName) {
        Write-Host "Container $containerName is already running." -ForegroundColor Yellow
        return
    }
    
    # Check if container exists but is stopped
    $containerExists = docker ps -a --filter "name=$containerName" --format "{{.Names}}" 2>&1
    
    if ($containerExists -eq $containerName) {
        Write-Host "Starting existing container $containerName..." -ForegroundColor Cyan
        docker start $containerName
    } else {
        # Create and start new container
        Write-Host "Creating and starting new container $containerName..." -ForegroundColor Cyan
        
        if ($ports) {
            docker run -d --name $containerName $ports $imageName $command
        } else {
            docker run -d --name $containerName $imageName $command
        }
    }
}

# Start Redis MCP
Write-Host "Starting Redis MCP..." -ForegroundColor Cyan
Start-DockerContainer -imageName "mcp/redis" -containerName "mcp-redis" -ports "-p 6379:6379"

# Start Filesystem MCP
Write-Host "Starting Filesystem MCP..." -ForegroundColor Cyan
Start-DockerContainer -imageName "mcp/filesystem" -containerName "mcp-filesystem"

# Start Sequential Thinking MCP
Write-Host "Starting Sequential Thinking MCP..." -ForegroundColor Cyan
Start-DockerContainer -imageName "mcp/sequentialthinking" -containerName "mcp-sequentialthinking"

# Start TaskMaster AI MCP
Write-Host "Starting TaskMaster AI MCP..." -ForegroundColor Cyan
Start-DockerContainer -imageName "mcp/taskmaster" -containerName "mcp-taskmaster" -ports "-p 8766:8766"

# Start Context7 MCP
Write-Host "Starting Context7 MCP..." -ForegroundColor Cyan
Start-DockerContainer -imageName "mcp/context7" -containerName "mcp-context7" -ports "-p 8767:8767"

# Start Playwright MCP
Write-Host "Starting Playwright MCP..." -ForegroundColor Cyan
Start-DockerContainer -imageName "mcp/playwright" -containerName "mcp-playwright" -ports "-p 8768:8768"

# Start Puppeteer MCP
Write-Host "Starting Puppeteer MCP..." -ForegroundColor Cyan
Start-DockerContainer -imageName "mcp/puppeteer" -containerName "mcp-puppeteer" -ports "-p 8769:8769"

# Wait for servers to start
Write-Host "Waiting for MCP servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if servers are running
Write-Host "Checking if MCP servers are running..." -ForegroundColor Cyan
docker ps | Select-String "mcp"

Write-Host "MCP servers started successfully!" -ForegroundColor Green
Write-Host "You can check the logs using 'docker logs <container-name>'." -ForegroundColor Yellow
