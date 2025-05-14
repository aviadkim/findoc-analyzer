# Run FinDoc Analyzer with all MCP servers
# This script starts all MCP servers and then runs the FinDoc Analyzer application

Write-Host "Starting FinDoc Analyzer with all MCP servers..." -ForegroundColor Green

# Step 1: Start all MCP servers
Write-Host "Step 1: Starting all MCP servers..." -ForegroundColor Cyan
& .\start-all-augment-mcps.ps1

# Step 2: Wait for MCP servers to initialize
Write-Host "Step 2: Waiting for MCP servers to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Step 3: Run the FinDoc Analyzer application
Write-Host "Step 3: Running the FinDoc Analyzer application..." -ForegroundColor Cyan
npm run start

Write-Host "FinDoc Analyzer is now running with all MCP servers!" -ForegroundColor Green
Write-Host "Access the application at http://localhost:8080" -ForegroundColor Yellow
