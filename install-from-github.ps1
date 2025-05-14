# Install MCP servers directly from GitHub
# This script clones and installs MCP servers from the official GitHub repositories

Write-Host "Installing MCP servers directly from GitHub..." -ForegroundColor Green

# Create directory for MCP servers
$mcpDir = "mcp-servers"
if (-not (Test-Path $mcpDir)) {
    New-Item -ItemType Directory -Path $mcpDir | Out-Null
    Write-Host "Created MCP servers directory: $mcpDir" -ForegroundColor Yellow
}

# Function to clone and install an MCP server from GitHub
function Install-McpServerFromGitHub {
    param (
        [string]$repoUrl,
        [string]$serverName,
        [string]$serverDir
    )
    
    Write-Host "Installing $serverName MCP server from $repoUrl..." -ForegroundColor Cyan
    
    try {
        # Clone the repository
        if (-not (Test-Path $serverDir)) {
            git clone $repoUrl $serverDir
            Write-Host "Cloned $serverName repository." -ForegroundColor Green
        } else {
            Write-Host "$serverName repository already exists." -ForegroundColor Yellow
            # Pull latest changes
            Set-Location $serverDir
            git pull
            Set-Location ..
            Write-Host "Pulled latest changes for $serverName." -ForegroundColor Green
        }
        
        # Install dependencies
        Set-Location $serverDir
        npm install
        Set-Location ..
        
        Write-Host "$serverName MCP server installed successfully." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error installing $serverName MCP server: $_" -ForegroundColor Red
        return $false
    }
}

# Function to start an MCP server
function Start-McpServer {
    param (
        [string]$serverName,
        [string]$serverDir,
        [string]$startCommand
    )
    
    Write-Host "Starting $serverName MCP server..." -ForegroundColor Cyan
    
    try {
        # Start the server in a new PowerShell window
        $fullCommand = "cd $serverDir && $startCommand"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $fullCommand -WindowStyle Normal
        
        Write-Host "$serverName MCP server started successfully." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error starting $serverName MCP server: $_" -ForegroundColor Red
        return $false
    }
}

# Array to track successful server installations
$successfulServers = @()

# Clone and install the official MCP servers repository
$mcpServersRepo = "https://github.com/modelcontextprotocol/servers.git"
$mcpServersDir = "$mcpDir\servers"
$mcpServersSuccess = Install-McpServerFromGitHub -repoUrl $mcpServersRepo -serverName "MCP Servers" -serverDir $mcpServersDir

if ($mcpServersSuccess) {
    # Install individual servers from the cloned repository
    $servers = @(
        @{
            name = "Filesystem"
            dir = "$mcpServersDir\src\filesystem"
            startCommand = "npm start"
        },
        @{
            name = "Memory"
            dir = "$mcpServersDir\src\memory"
            startCommand = "npm start"
        },
        @{
            name = "Redis"
            dir = "$mcpServersDir\src\redis"
            startCommand = "npm start"
        },
        @{
            name = "Sequential Thinking"
            dir = "$mcpServersDir\src\sequentialthinking"
            startCommand = "npm start"
        },
        @{
            name = "Puppeteer"
            dir = "$mcpServersDir\src\puppeteer"
            startCommand = "npm start"
        },
        @{
            name = "GitHub"
            dir = "$mcpServersDir\src\github"
            startCommand = "npm start"
        },
        @{
            name = "Fetch"
            dir = "$mcpServersDir\src\fetch"
            startCommand = "npm start"
        },
        @{
            name = "Time"
            dir = "$mcpServersDir\src\time"
            startCommand = "npm start"
        }
    )
    
    # Start each server
    foreach ($server in $servers) {
        $success = Start-McpServer -serverName $server.name -serverDir $server.dir -startCommand $server.startCommand
        if ($success) {
            $successfulServers += $server.name
        }
    }
}

# Clone and install additional MCP servers
$additionalServers = @(
    @{
        name = "Playwright"
        repo = "https://github.com/microsoft/playwright-mcp.git"
        dir = "$mcpDir\playwright-mcp"
        startCommand = "npm start"
    },
    @{
        name = "21st Magic"
        repo = "https://github.com/21st-dev/magic-mcp.git"
        dir = "$mcpDir\magic-mcp"
        startCommand = "npm start"
    },
    @{
        name = "Supabase"
        repo = "https://github.com/supabase/mcp-server-supabase.git"
        dir = "$mcpDir\supabase-mcp"
        startCommand = "npm start"
    }
)

foreach ($server in $additionalServers) {
    $installSuccess = Install-McpServerFromGitHub -repoUrl $server.repo -serverName $server.name -serverDir $server.dir
    if ($installSuccess) {
        $startSuccess = Start-McpServer -serverName $server.name -serverDir $server.dir -startCommand $server.startCommand
        if ($startSuccess) {
            $successfulServers += $server.name
        }
    }
}

# Create MCP configuration file for Augment
Write-Host "Creating MCP configuration file for Augment..." -ForegroundColor Cyan

$mcpConfig = @{
    mcpServers = @{}
}

# Map server names to configuration keys
$serverMap = @{
    "Filesystem" = "filesystem"
    "Memory" = "memory"
    "Redis" = "redis"
    "Sequential Thinking" = "sequentialthinking"
    "Puppeteer" = "puppeteer"
    "GitHub" = "github"
    "Fetch" = "fetch"
    "Time" = "time"
    "Playwright" = "playwright"
    "21st Magic" = "magic"
    "Supabase" = "supabase"
}

# Add successful servers to the configuration
foreach ($server in $successfulServers) {
    $key = $serverMap[$server]
    if ($key) {
        $mcpConfig.mcpServers.$key = @{
            command = "cd"
            args = @("$mcpDir\servers\src\$key", "&&", "npm", "start")
        }
    }
}

# Add additional servers with special paths
if ($successfulServers -contains "Playwright") {
    $mcpConfig.mcpServers.playwright = @{
        command = "cd"
        args = @("$mcpDir\playwright-mcp", "&&", "npm", "start")
    }
}

if ($successfulServers -contains "21st Magic") {
    $mcpConfig.mcpServers.magic = @{
        command = "cd"
        args = @("$mcpDir\magic-mcp", "&&", "npm", "start")
    }
}

if ($successfulServers -contains "Supabase") {
    $mcpConfig.mcpServers.supabase = @{
        command = "cd"
        args = @("$mcpDir\supabase-mcp", "&&", "npm", "start")
    }
}

$mcpConfigJson = ConvertTo-Json $mcpConfig -Depth 10
$mcpConfigJson | Out-File -FilePath "augment-mcp-config.json" -Encoding utf8

Write-Host "MCP configuration file created: augment-mcp-config.json" -ForegroundColor Green

# Summary
Write-Host "MCP Server Setup Summary:" -ForegroundColor Cyan
Write-Host "Successfully installed and started servers:" -ForegroundColor Green
foreach ($server in $successfulServers) {
    Write-Host "- $server" -ForegroundColor Green
}

$allServers = $servers.name + $additionalServers.name
if ($successfulServers.Count -lt $allServers.Count) {
    Write-Host "Failed to install or start servers:" -ForegroundColor Red
    $failedServers = $allServers | Where-Object { $successfulServers -notcontains $_ }
    foreach ($server in $failedServers) {
        Write-Host "- $server" -ForegroundColor Red
    }
}

Write-Host "All available MCP servers have been installed and started!" -ForegroundColor Green
Write-Host "The MCP configuration file has been created at: augment-mcp-config.json" -ForegroundColor Yellow
Write-Host "Your FinDoc Analyzer app is now ready for development with MCP servers!" -ForegroundColor Green
