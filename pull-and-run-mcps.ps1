# Pull and run MCP servers for FinDoc Analyzer testing

Write-Host "Pulling and running MCP servers for FinDoc Analyzer testing..." -ForegroundColor Green

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

Write-Host "Docker is running. Proceeding with MCP setup..." -ForegroundColor Green

# Pull MCP images
Write-Host "Pulling MCP images..." -ForegroundColor Cyan
docker pull modelcontextprotocol/taskmaster:latest
docker pull modelcontextprotocol/context7:latest
docker pull modelcontextprotocol/playwright:latest
docker pull modelcontextprotocol/puppeteer:latest

# Run TaskMaster AI MCP
Write-Host "Running TaskMaster AI MCP..." -ForegroundColor Cyan
docker run -d --name mcp-taskmaster-ai modelcontextprotocol/taskmaster:latest

# Run Context7 MCP
Write-Host "Running Context7 MCP..." -ForegroundColor Cyan
docker run -d --name mcp-context7 modelcontextprotocol/context7:latest

# Run Playwright MCP
Write-Host "Running Playwright MCP..." -ForegroundColor Cyan
docker run -d --name mcp-playwright modelcontextprotocol/playwright:latest

# Run Puppeteer MCP
Write-Host "Running Puppeteer MCP..." -ForegroundColor Cyan
docker run -d --name mcp-puppeteer modelcontextprotocol/puppeteer:latest

# Wait for servers to start
Write-Host "Waiting for MCP servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if servers are running
Write-Host "Checking if MCP servers are running..." -ForegroundColor Cyan
docker ps

Write-Host "MCP servers started successfully!" -ForegroundColor Green
Write-Host "You can check the logs using 'docker logs <container-name>'." -ForegroundColor Yellow
