# Install and run MCP servers using npm

Write-Host "Installing and running MCP servers using npm..." -ForegroundColor Green

# Install MCP servers
Write-Host "Installing MCP servers..." -ForegroundColor Cyan
npm install -g @modelcontextprotocol/server-taskmaster
npm install -g @modelcontextprotocol/server-context7
npm install -g @modelcontextprotocol/server-playwright
npm install -g @modelcontextprotocol/server-puppeteer

# Create directory for logs
$logDir = "mcp-logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
    Write-Host "Created log directory: $logDir" -ForegroundColor Yellow
}

# Start MCP servers
Write-Host "Starting MCP servers..." -ForegroundColor Cyan

# Start TaskMaster AI MCP
Start-Process -FilePath "npx" -ArgumentList "@modelcontextprotocol/server-taskmaster" -NoNewWindow -RedirectStandardOutput "$logDir\taskmaster-mcp.log" -RedirectStandardError "$logDir\taskmaster-mcp-error.log"

# Start Context7 MCP
Start-Process -FilePath "npx" -ArgumentList "@modelcontextprotocol/server-context7" -NoNewWindow -RedirectStandardOutput "$logDir\context7-mcp.log" -RedirectStandardError "$logDir\context7-mcp-error.log"

# Start Playwright MCP
Start-Process -FilePath "npx" -ArgumentList "@modelcontextprotocol/server-playwright" -NoNewWindow -RedirectStandardOutput "$logDir\playwright-mcp.log" -RedirectStandardError "$logDir\playwright-mcp-error.log"

# Start Puppeteer MCP
Start-Process -FilePath "npx" -ArgumentList "@modelcontextprotocol/server-puppeteer" -NoNewWindow -RedirectStandardOutput "$logDir\puppeteer-mcp.log" -RedirectStandardError "$logDir\puppeteer-mcp-error.log"

Write-Host "MCP servers started successfully!" -ForegroundColor Green
Write-Host "You can check the logs in the $logDir directory." -ForegroundColor Yellow
