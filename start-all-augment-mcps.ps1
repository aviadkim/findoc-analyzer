# Comprehensive script to start all MCP servers for FinDoc Analyzer
# This script reads the augment-full-mcp-config.json file and starts all MCP servers

Write-Host "Starting all MCP servers for FinDoc Analyzer..." -ForegroundColor Green

# Create directory for logs
$logDir = "mcp-logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
    Write-Host "Created log directory: $logDir" -ForegroundColor Yellow
}

# Read the MCP configuration file
$mcpConfigPath = "augment-full-mcp-config.json"
if (-not (Test-Path $mcpConfigPath)) {
    Write-Host "MCP configuration file not found: $mcpConfigPath" -ForegroundColor Red
    exit 1
}

$mcpConfig = Get-Content $mcpConfigPath -Raw | ConvertFrom-Json
$mcpServers = $mcpConfig.mcpServers

# Track which servers are successfully started
$startedServers = @{}

# Function to start an MCP server
function Start-McpServer {
    param (
        [string]$serverName,
        [string]$command,
        [array]$args
    )
    
    Write-Host "Starting $serverName MCP server..." -ForegroundColor Cyan
    
    try {
        # Convert args array to string
        $argsString = $args -join " "
        
        # Start the server in a new PowerShell window
        $startCommand = "$command $argsString"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $startCommand -WindowStyle Normal
        
        Write-Host "$serverName MCP server started successfully." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error starting $serverName MCP server" -ForegroundColor Red
        return $false
    }
}

# Start each MCP server
foreach ($serverName in $mcpServers.PSObject.Properties.Name) {
    $server = $mcpServers.$serverName
    $success = Start-McpServer -serverName $serverName -command $server.command -args $server.args
    if ($success) {
        $startedServers[$serverName] = $true
    }
}

# Summary
Write-Host "MCP Server Startup Summary:" -ForegroundColor Cyan
Write-Host "Successfully started servers:" -ForegroundColor Green
foreach ($serverName in $startedServers.Keys) {
    Write-Host "- $serverName" -ForegroundColor Green
}

if ($startedServers.Count -lt $mcpServers.PSObject.Properties.Count) {
    Write-Host "Failed to start servers:" -ForegroundColor Red
    $failedServers = $mcpServers.PSObject.Properties.Name | Where-Object { -not $startedServers.ContainsKey($_) }
    foreach ($server in $failedServers) {
        Write-Host "- $server" -ForegroundColor Red
    }
}

Write-Host "All available MCP servers have been started!" -ForegroundColor Green
Write-Host "You can check the logs in the $logDir directory." -ForegroundColor Yellow
Write-Host "Your FinDoc Analyzer app is now ready for development with MCP servers!" -ForegroundColor Green
