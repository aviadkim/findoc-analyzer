# Comprehensive MCP Startup Script for FinDoc Analyzer
# This script checks for and starts all necessary MCP servers

Write-Host "Starting comprehensive MCP setup for FinDoc Analyzer..." -ForegroundColor Green

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
    Write-Host "Docker is running. Proceeding with Docker MCP setup..." -ForegroundColor Green
} catch {
    Write-Host "Error checking Docker status: $_" -ForegroundColor Red
    Write-Host "Please make sure Docker is installed and running." -ForegroundColor Red
    exit 1
}

# Function to check if a Docker container is running
function Test-DockerContainer {
    param (
        [string]$containerName
    )
    
    $container = docker ps --filter "name=$containerName" --format "{{.Names}}" 2>&1
    return $container -eq $containerName
}

# Function to start a Docker container if it's not already running
function Start-DockerContainer {
    param (
        [string]$imageName,
        [string]$containerName,
        [string]$ports = ""
    )
    
    # Check if container is already running
    if (Test-DockerContainer -containerName $containerName) {
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
            docker run -d --name $containerName $ports $imageName
        } else {
            docker run -d --name $containerName $imageName
        }
    }
}

# Function to install and start an NPM MCP server
function Start-NpmMcpServer {
    param (
        [string]$packageName,
        [string]$serverName,
        [string]$command,
        [string]$args = ""
    )
    
    Write-Host "Starting $serverName MCP server..." -ForegroundColor Cyan
    
    # Check if the package is installed
    $packageInstalled = npm list -g $packageName 2>&1
    if ($packageInstalled -match "empty") {
        Write-Host "Installing $packageName globally..." -ForegroundColor Yellow
        npm install -g $packageName
    }
    
    # Start the server
    if ($args) {
        Start-Process -FilePath $command -ArgumentList $args -NoNewWindow -RedirectStandardOutput "$logDir\$serverName.log" -RedirectStandardError "$logDir\$serverName-error.log"
    } else {
        Start-Process -FilePath $command -NoNewWindow -RedirectStandardOutput "$logDir\$serverName.log" -RedirectStandardError "$logDir\$serverName-error.log"
    }
    
    Write-Host "$serverName MCP server started." -ForegroundColor Green
}

# 1. Start Docker-based MCP servers
Write-Host "Starting Docker-based MCP servers..." -ForegroundColor Cyan

# Check if images exist, pull if not
$requiredImages = @("mcp/filesystem", "mcp/sequentialthinking", "mcp/redis")
foreach ($image in $requiredImages) {
    $imageExists = docker images $image --format "{{.Repository}}" 2>&1
    if ($imageExists -ne $image) {
        Write-Host "Pulling $image image..." -ForegroundColor Yellow
        docker pull $image
    }
}

# Start Filesystem MCP
Start-DockerContainer -imageName "mcp/filesystem" -containerName "mcp-filesystem"

# Start Sequential Thinking MCP
Start-DockerContainer -imageName "mcp/sequentialthinking" -containerName "mcp-sequentialthinking"

# Start Redis MCP
Start-DockerContainer -imageName "mcp/redis" -containerName "mcp-redis" -ports "-p 6379:6379"

# 2. Start NPM-based MCP servers
Write-Host "Starting NPM-based MCP servers..." -ForegroundColor Cyan

# Start Puppeteer MCP
Start-NpmMcpServer -packageName "@modelcontextprotocol/server-puppeteer" -serverName "puppeteer" -command "npx" -args "-y @modelcontextprotocol/server-puppeteer"

# Start Playwright MCP
Start-NpmMcpServer -packageName "@playwright/mcp" -serverName "playwright" -command "npx" -args "-y @playwright/mcp --browser chromium"

# Start TaskMaster MCP (if available)
Start-NpmMcpServer -packageName "@modelcontextprotocol/server-taskmaster" -serverName "taskmaster" -command "npx" -args "-y @modelcontextprotocol/server-taskmaster"

# Start Context7 MCP (if available)
Start-NpmMcpServer -packageName "@modelcontextprotocol/server-context7" -serverName "context7" -command "npx" -args "-y @modelcontextprotocol/server-context7"

# 3. Create MCP configuration file for Augment
Write-Host "Creating MCP configuration file for Augment..." -ForegroundColor Cyan

$mcpConfig = @{
    mcpServers = @{
        filesystem = @{
            command = "docker"
            args = @("run", "--rm", "-i", "mcp/filesystem")
        }
        sequentialthinking = @{
            command = "docker"
            args = @("run", "--rm", "-i", "mcp/sequentialthinking")
        }
        redis = @{
            command = "docker"
            args = @("run", "--rm", "-i", "mcp/redis")
        }
        puppeteer = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-puppeteer")
        }
        playwright = @{
            command = "npx"
            args = @("-y", "@playwright/mcp", "--browser", "chromium")
        }
        taskmaster = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-taskmaster")
        }
        context7 = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-context7")
        }
    }
}

$mcpConfigJson = ConvertTo-Json $mcpConfig -Depth 10
$mcpConfigJson | Out-File -FilePath "augment-mcp-config.json" -Encoding utf8

Write-Host "MCP configuration file created: augment-mcp-config.json" -ForegroundColor Green

# 4. Verify MCP servers
Write-Host "Verifying MCP servers..." -ForegroundColor Cyan

# Check Docker MCP servers
$dockerMcps = docker ps | Select-String "mcp"
Write-Host "Docker MCP servers:" -ForegroundColor Yellow
$dockerMcps

# Check NPM MCP servers
$npmMcps = Get-Process | Where-Object { $_.ProcessName -match "node" } | Select-String "mcp"
Write-Host "NPM MCP servers:" -ForegroundColor Yellow
$npmMcps

Write-Host "All MCP servers have been started successfully!" -ForegroundColor Green
Write-Host "You can check the logs in the $logDir directory." -ForegroundColor Yellow
Write-Host "The MCP configuration file has been created at: augment-mcp-config.json" -ForegroundColor Yellow
Write-Host "Your FinDoc Analyzer app is now ready for development with all MCP servers!" -ForegroundColor Green
