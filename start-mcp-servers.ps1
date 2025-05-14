# Start MCP servers for FinDoc Analyzer testing

Write-Host "Starting MCP servers for FinDoc Analyzer testing..." -ForegroundColor Green

# Create directory for logs
$logDir = "mcp-logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
    Write-Host "Created log directory: $logDir" -ForegroundColor Yellow
}

# Start Playwright MCP
Write-Host "Starting Playwright MCP..." -ForegroundColor Cyan
Start-Process -FilePath "npx" -ArgumentList "@playwright/mcp@latest", "--browser", "chromium" -NoNewWindow -RedirectStandardOutput "$logDir\playwright-mcp.log" -RedirectStandardError "$logDir\playwright-mcp-error.log"

# Start Puppeteer MCP
Write-Host "Starting Puppeteer MCP..." -ForegroundColor Cyan
Start-Process -FilePath "npx" -ArgumentList "-y", "@modelcontextprotocol/server-puppeteer" -NoNewWindow -RedirectStandardOutput "$logDir\puppeteer-mcp.log" -RedirectStandardError "$logDir\puppeteer-mcp-error.log"

# Start TaskMaster AI MCP
Write-Host "Starting TaskMaster AI MCP..." -ForegroundColor Cyan
Start-Process -FilePath "npx" -ArgumentList "-y", "@modelcontextprotocol/server-taskmaster" -NoNewWindow -RedirectStandardOutput "$logDir\taskmaster-mcp.log" -RedirectStandardError "$logDir\taskmaster-mcp-error.log"

# Start Context7 MCP
Write-Host "Starting Context7 MCP..." -ForegroundColor Cyan
Start-Process -FilePath "npx" -ArgumentList "-y", "@modelcontextprotocol/server-context7" -NoNewWindow -RedirectStandardOutput "$logDir\context7-mcp.log" -RedirectStandardError "$logDir\context7-mcp-error.log"

# Wait for servers to start
Write-Host "Waiting for MCP servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if servers are running
Write-Host "Checking if MCP servers are running..." -ForegroundColor Cyan
docker ps | Select-String "mcp"

Write-Host "MCP servers started successfully!" -ForegroundColor Green
Write-Host "You can check the logs in the $logDir directory." -ForegroundColor Yellow
