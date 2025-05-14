# Install MCP servers using mcp-get tool
# This script installs and starts MCP servers using the mcp-get tool

Write-Host "Installing MCP servers using mcp-get tool..." -ForegroundColor Green

# Install mcp-get if not already installed
try {
    $mcpGetVersion = mcp-get --version 2>&1
    Write-Host "mcp-get is already installed: $mcpGetVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing mcp-get..." -ForegroundColor Yellow
    npm install -g mcp-get
}

# Function to install and start an MCP server using mcp-get
function Install-McpServer {
    param (
        [string]$serverName
    )
    
    Write-Host "Installing $serverName MCP server..." -ForegroundColor Cyan
    
    try {
        # Install the server
        mcp-get install $serverName
        Write-Host "$serverName MCP server installed successfully." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error installing $serverName MCP server: $_" -ForegroundColor Red
        return $false
    }
}

# Array to track successful server installations
$successfulServers = @()

# List of servers to install
$servers = @(
    "puppeteer",
    "playwright",
    "taskmaster",
    "context7",
    "sequentialthinking",
    "memory",
    "github",
    "supabase",
    "magic"
)

# Install each server
foreach ($server in $servers) {
    $success = Install-McpServer -serverName $server
    if ($success) {
        $successfulServers += $server
    }
}

# Start all installed servers
Write-Host "Starting all installed MCP servers..." -ForegroundColor Cyan
mcp-get start

# Create MCP configuration file for Augment
Write-Host "Creating MCP configuration file for Augment..." -ForegroundColor Cyan

$mcpConfig = @{
    mcpServers = @{}
}

# Add successful servers to the configuration
foreach ($server in $successfulServers) {
    $mcpConfig.mcpServers.$server = @{
        command = "mcp-get"
        args = @("run", $server)
    }
}

$mcpConfigJson = ConvertTo-Json $mcpConfig -Depth 10
$mcpConfigJson | Out-File -FilePath "augment-mcp-config.json" -Encoding utf8

Write-Host "MCP configuration file created: augment-mcp-config.json" -ForegroundColor Green

# Summary
Write-Host "MCP Server Setup Summary:" -ForegroundColor Cyan
Write-Host "Successfully installed servers:" -ForegroundColor Green
foreach ($server in $successfulServers) {
    Write-Host "- $server" -ForegroundColor Green
}

if ($successfulServers.Count -lt $servers.Count) {
    Write-Host "Failed to install servers:" -ForegroundColor Red
    $failedServers = $servers | Where-Object { $successfulServers -notcontains $_ }
    foreach ($server in $failedServers) {
        Write-Host "- $server" -ForegroundColor Red
    }
}

Write-Host "All available MCP servers have been installed and started!" -ForegroundColor Green
Write-Host "The MCP configuration file has been created at: augment-mcp-config.json" -ForegroundColor Yellow
Write-Host "Your FinDoc Analyzer app is now ready for development with MCP servers!" -ForegroundColor Green
