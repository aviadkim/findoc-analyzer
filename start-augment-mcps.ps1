# Start MCP servers using Augment MCP configuration

Write-Host "Starting MCP servers using Augment MCP configuration..." -ForegroundColor Green

# Create directory for logs
$logDir = "mcp-logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
    Write-Host "Created log directory: $logDir" -ForegroundColor Yellow
}

# Install required MCP servers
Write-Host "Installing required MCP servers..." -ForegroundColor Cyan
npm install -g @modelcontextprotocol/server-taskmaster
npm install -g @modelcontextprotocol/server-context7
npm install -g @playwright/mcp
npm install -g @modelcontextprotocol/server-puppeteer

# Start TaskMaster MCP
Write-Host "Starting TaskMaster MCP..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/c", "npx", "-y", "@modelcontextprotocol/server-taskmaster" -NoNewWindow -RedirectStandardOutput "$logDir\taskmaster-mcp.log" -RedirectStandardError "$logDir\taskmaster-mcp-error.log"

# Start Context7 MCP
Write-Host "Starting Context7 MCP..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/c", "npx", "-y", "@modelcontextprotocol/server-context7" -NoNewWindow -RedirectStandardOutput "$logDir\context7-mcp.log" -RedirectStandardError "$logDir\context7-mcp-error.log"

# Start Playwright MCP
Write-Host "Starting Playwright MCP..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/c", "npx", "-y", "@playwright/mcp@latest", "--browser", "chromium" -NoNewWindow -RedirectStandardOutput "$logDir\playwright-mcp.log" -RedirectStandardError "$logDir\playwright-mcp-error.log"

# Start Puppeteer MCP
Write-Host "Starting Puppeteer MCP..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/c", "npx", "-y", "@modelcontextprotocol/server-puppeteer" -NoNewWindow -RedirectStandardOutput "$logDir\puppeteer-mcp.log" -RedirectStandardError "$logDir\puppeteer-mcp-error.log"

# Wait for servers to start
Write-Host "Waiting for MCP servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "MCP servers started successfully!" -ForegroundColor Green
Write-Host "You can check the logs in the $logDir directory." -ForegroundColor Yellow
