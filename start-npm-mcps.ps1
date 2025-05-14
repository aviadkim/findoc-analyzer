# Improved MCP Startup Script for FinDoc Analyzer
# This script installs and starts all necessary MCP servers using npm directly

Write-Host "Starting improved MCP setup for FinDoc Analyzer..." -ForegroundColor Green

# Create directory for logs
$logDir = "mcp-logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
    Write-Host "Created log directory: $logDir" -ForegroundColor Yellow
}

# Function to install and start an NPM MCP server
function Start-NpmMcpServer {
    param (
        [string]$packageName,
        [string]$serverName,
        [string]$installCommand,
        [string]$runCommand
    )
    
    Write-Host "Setting up $serverName MCP server..." -ForegroundColor Cyan
    
    try {
        # Install the package
        Write-Host "Installing $packageName..." -ForegroundColor Yellow
        Invoke-Expression $installCommand
        
        # Start the server in a new PowerShell window
        Write-Host "Starting $serverName MCP server..." -ForegroundColor Green
        $startCommand = "Start-Process powershell -ArgumentList '-NoExit', '-Command', '$runCommand' -WindowStyle Normal"
        Invoke-Expression $startCommand
        
        Write-Host "$serverName MCP server started successfully." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error setting up $serverName MCP server: $_" -ForegroundColor Red
        return $false
    }
}

# Array to track successful server starts
$successfulServers = @()

# 1. Start Puppeteer MCP
$puppeteerSuccess = Start-NpmMcpServer -packageName "puppeteer-mcp" -serverName "Puppeteer" `
    -installCommand "npm install -g puppeteer" `
    -runCommand "npx -y @modelcontextprotocol/server-puppeteer"

if ($puppeteerSuccess) {
    $successfulServers += "Puppeteer"
}

# 2. Start Playwright MCP
$playwrightSuccess = Start-NpmMcpServer -packageName "playwright-mcp" -serverName "Playwright" `
    -installCommand "npm install -g @playwright/test" `
    -runCommand "npx -y @playwright/mcp --browser chromium"

if ($playwrightSuccess) {
    $successfulServers += "Playwright"
}

# 3. Try alternative for TaskMaster MCP
$taskmasterSuccess = Start-NpmMcpServer -packageName "taskmaster-mcp" -serverName "TaskMaster" `
    -installCommand "npm install -g @mcpso/taskmaster" `
    -runCommand "npx -y @mcpso/taskmaster"

if (-not $taskmasterSuccess) {
    # Try alternative package
    $taskmasterSuccess = Start-NpmMcpServer -packageName "taskmaster-mcp" -serverName "TaskMaster" `
        -installCommand "npm install -g @mcp/taskmaster" `
        -runCommand "npx -y @mcp/taskmaster"
}

if ($taskmasterSuccess) {
    $successfulServers += "TaskMaster"
}

# 4. Try alternative for Context7 MCP
$context7Success = Start-NpmMcpServer -packageName "context7-mcp" -serverName "Context7" `
    -installCommand "npm install -g @mcpso/context7" `
    -runCommand "npx -y @mcpso/context7"

if (-not $context7Success) {
    # Try alternative package
    $context7Success = Start-NpmMcpServer -packageName "context7-mcp" -serverName "Context7" `
        -installCommand "npm install -g @mcp/context7" `
        -runCommand "npx -y @mcp/context7"
}

if ($context7Success) {
    $successfulServers += "Context7"
}

# 5. Try Sequential Thinking MCP
$sequentialSuccess = Start-NpmMcpServer -packageName "sequential-thinking-mcp" -serverName "SequentialThinking" `
    -installCommand "npm install -g @mcpso/sequential-thinking" `
    -runCommand "npx -y @mcpso/sequential-thinking"

if (-not $sequentialSuccess) {
    # Try alternative package
    $sequentialSuccess = Start-NpmMcpServer -packageName "sequential-thinking-mcp" -serverName "SequentialThinking" `
        -installCommand "npm install -g @mcp/sequential-thinking" `
        -runCommand "npx -y @mcp/sequential-thinking"
}

if ($sequentialSuccess) {
    $successfulServers += "SequentialThinking"
}

# 6. Try Memory MCP
$memorySuccess = Start-NpmMcpServer -packageName "memory-mcp" -serverName "Memory" `
    -installCommand "npm install -g @modelcontextprotocol/server-memory" `
    -runCommand "npx -y @modelcontextprotocol/server-memory"

if ($memorySuccess) {
    $successfulServers += "Memory"
}

# 7. Try GitHub MCP
$githubSuccess = Start-NpmMcpServer -packageName "github-mcp" -serverName "GitHub" `
    -installCommand "npm install -g github-mcp" `
    -runCommand "npx -y github-mcp"

if ($githubSuccess) {
    $successfulServers += "GitHub"
}

# 8. Try Supabase MCP
$supabaseSuccess = Start-NpmMcpServer -packageName "supabase-mcp" -serverName "Supabase" `
    -installCommand "npm install -g @supabase/mcp-server-supabase" `
    -runCommand "npx -y @supabase/mcp-server-supabase"

if ($supabaseSuccess) {
    $successfulServers += "Supabase"
}

# 9. Try Magic MCP (21st.dev)
$magicSuccess = Start-NpmMcpServer -packageName "magic-mcp" -serverName "Magic" `
    -installCommand "npm install -g @21st-dev/magic" `
    -runCommand "npx -y @21st-dev/magic"

if ($magicSuccess) {
    $successfulServers += "Magic"
}

# Create MCP configuration file for Augment
Write-Host "Creating MCP configuration file for Augment..." -ForegroundColor Cyan

$mcpConfig = @{
    mcpServers = @{}
}

# Add successful servers to the configuration
if ($successfulServers -contains "Puppeteer") {
    $mcpConfig.mcpServers.puppeteer = @{
        command = "npx"
        args = @("-y", "@modelcontextprotocol/server-puppeteer")
    }
}

if ($successfulServers -contains "Playwright") {
    $mcpConfig.mcpServers.playwright = @{
        command = "npx"
        args = @("-y", "@playwright/mcp", "--browser", "chromium")
    }
}

if ($successfulServers -contains "TaskMaster") {
    $mcpConfig.mcpServers.taskmaster = @{
        command = "npx"
        args = @("-y", "@mcpso/taskmaster")
    }
}

if ($successfulServers -contains "Context7") {
    $mcpConfig.mcpServers.context7 = @{
        command = "npx"
        args = @("-y", "@mcpso/context7")
    }
}

if ($successfulServers -contains "SequentialThinking") {
    $mcpConfig.mcpServers.sequentialthinking = @{
        command = "npx"
        args = @("-y", "@mcpso/sequential-thinking")
    }
}

if ($successfulServers -contains "Memory") {
    $mcpConfig.mcpServers.memory = @{
        command = "npx"
        args = @("-y", "@modelcontextprotocol/server-memory")
    }
}

if ($successfulServers -contains "GitHub") {
    $mcpConfig.mcpServers.github = @{
        command = "npx"
        args = @("-y", "github-mcp")
    }
}

if ($successfulServers -contains "Supabase") {
    $mcpConfig.mcpServers.supabase = @{
        command = "npx"
        args = @("-y", "@supabase/mcp-server-supabase")
    }
}

if ($successfulServers -contains "Magic") {
    $mcpConfig.mcpServers.magic = @{
        command = "npx"
        args = @("-y", "@21st-dev/magic")
    }
}

$mcpConfigJson = ConvertTo-Json $mcpConfig -Depth 10
$mcpConfigJson | Out-File -FilePath "augment-mcp-config.json" -Encoding utf8

Write-Host "MCP configuration file created: augment-mcp-config.json" -ForegroundColor Green

# Summary
Write-Host "MCP Server Setup Summary:" -ForegroundColor Cyan
Write-Host "Successfully started servers:" -ForegroundColor Green
foreach ($server in $successfulServers) {
    Write-Host "- $server" -ForegroundColor Green
}

if ($successfulServers.Count -lt 9) {
    Write-Host "Failed to start servers:" -ForegroundColor Red
    $failedServers = @("Puppeteer", "Playwright", "TaskMaster", "Context7", "SequentialThinking", "Memory", "GitHub", "Supabase", "Magic") | Where-Object { $successfulServers -notcontains $_ }
    foreach ($server in $failedServers) {
        Write-Host "- $server" -ForegroundColor Red
    }
}

Write-Host "All available MCP servers have been started!" -ForegroundColor Green
Write-Host "The MCP configuration file has been created at: augment-mcp-config.json" -ForegroundColor Yellow
Write-Host "Your FinDoc Analyzer app is now ready for development with MCP servers!" -ForegroundColor Green
