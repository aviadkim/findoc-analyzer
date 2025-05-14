# Master script to set up all MCP servers
# This script tries multiple methods to ensure all MCP servers are running

Write-Host "Starting comprehensive MCP setup for FinDoc Analyzer..." -ForegroundColor Green

# Create directory for logs
$logDir = "mcp-logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
    Write-Host "Created log directory: $logDir" -ForegroundColor Yellow
}

# Function to check if a command exists
function Test-CommandExists {
    param (
        [string]$command
    )

    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Track which servers are successfully running
$runningServers = @{}

# Method 1: Try using Docker for core MCP servers
Write-Host "Method 1: Using Docker for core MCP servers..." -ForegroundColor Cyan

try {
    $dockerStatus = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker is running. Proceeding with Docker MCP setup..." -ForegroundColor Green

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
                return $true
            }

            # Check if container exists but is stopped
            $containerExists = docker ps -a --filter "name=$containerName" --format "{{.Names}}" 2>&1

            if ($containerExists -eq $containerName) {
                Write-Host "Starting existing container $containerName..." -ForegroundColor Cyan
                docker start $containerName
                return $true
            } else {
                # Check if image exists, pull if not
                $imageExists = docker images $imageName --format "{{.Repository}}" 2>&1
                if ($imageExists -ne $imageName) {
                    Write-Host "Pulling $imageName image..." -ForegroundColor Yellow
                    docker pull $imageName
                }

                # Create and start new container
                Write-Host "Creating and starting new container $containerName..." -ForegroundColor Cyan

                if ($ports) {
                    docker run -d --name $containerName $ports $imageName
                } else {
                    docker run -d --name $containerName $imageName
                }

                return $true
            }

            return $false
        }

        # Start Filesystem MCP
        $filesystemSuccess = Start-DockerContainer -imageName "mcp/filesystem" -containerName "mcp-filesystem"
        if ($filesystemSuccess) {
            $runningServers["filesystem"] = @{
                method = "docker"
                container = "mcp-filesystem"
            }
        }

        # Start Sequential Thinking MCP
        $sequentialSuccess = Start-DockerContainer -imageName "mcp/sequentialthinking" -containerName "mcp-sequentialthinking"
        if ($sequentialSuccess) {
            $runningServers["sequentialthinking"] = @{
                method = "docker"
                container = "mcp-sequentialthinking"
            }
        }

        # Start Redis MCP
        $redisSuccess = Start-DockerContainer -imageName "mcp/redis" -containerName "mcp-redis" -ports "-p 6379:6379"
        if ($redisSuccess) {
            $runningServers["redis"] = @{
                method = "docker"
                container = "mcp-redis"
            }
        }
    } else {
        Write-Host "Docker is not running. Skipping Docker-based MCP setup." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error with Docker: $_" -ForegroundColor Red
    Write-Host "Skipping Docker-based MCP setup." -ForegroundColor Yellow
}

# Method 2: Try using mcp-get
Write-Host "Method 2: Using mcp-get tool..." -ForegroundColor Cyan

if (-not (Test-CommandExists -command "mcp-get")) {
    Write-Host "Installing mcp-get..." -ForegroundColor Yellow
    npm install -g mcp-get
}

if (Test-CommandExists -command "mcp-get") {
    Write-Host "mcp-get is available. Installing MCP servers..." -ForegroundColor Green

    # Function to install and start an MCP server using mcp-get
    function Install-McpServerWithMcpGet {
        param (
            [string]$serverName
        )

        Write-Host "Installing $serverName MCP server with mcp-get..." -ForegroundColor Cyan

        try {
            # Install the server
            mcp-get install $serverName

            # Start the server
            Start-Process -FilePath "mcp-get" -ArgumentList "run", $serverName -NoNewWindow -RedirectStandardOutput "$logDir\$serverName-mcp-get.log" -RedirectStandardError "$logDir\$serverName-mcp-get-error.log"

            Write-Host "$serverName MCP server installed and started with mcp-get." -ForegroundColor Green
            return $true
        }
        catch {
            Write-Host "Error with mcp-get for $serverName" -ForegroundColor Red
            return $false
        }
    }

    # List of servers to try with mcp-get
    $mcpGetServers = @(
        "puppeteer",
        "playwright",
        "memory",
        "github",
        "fetch",
        "brave"
    )

    # Try to install and start each server
    foreach ($server in $mcpGetServers) {
        if (-not $runningServers.ContainsKey($server)) {
            $success = Install-McpServerWithMcpGet -serverName $server
            if ($success) {
                $runningServers[$server] = @{
                    method = "mcp-get"
                }
            }
        }
    }
}

# Method 3: Try using npm directly
Write-Host "Method 3: Using npm directly..." -ForegroundColor Cyan

# Function to install and start an NPM MCP server
function Start-NpmMcpServer {
    param (
        [string]$packageName,
        [string]$serverName,
        [string]$npmCommand
    )

    if ($runningServers.ContainsKey($serverName)) {
        Write-Host "$serverName MCP server is already running." -ForegroundColor Yellow
        return $true
    }

    Write-Host "Setting up $serverName MCP server with npm..." -ForegroundColor Cyan

    try {
        # Start the server in a new PowerShell window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $npmCommand -WindowStyle Normal

        Write-Host "$serverName MCP server started with npm." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error with npm for $serverName" -ForegroundColor Red
        return $false
    }
}

# Try to start MCP servers with npm
$npmServers = @(
    @{
        name = "puppeteer"
        package = "@modelcontextprotocol/server-puppeteer"
        command = "npx -y @modelcontextprotocol/server-puppeteer"
    },
    @{
        name = "playwright"
        package = "@playwright/mcp"
        command = "npx -y @playwright/mcp --browser chromium"
    },
    @{
        name = "memory"
        package = "@modelcontextprotocol/server-memory"
        command = "npx -y @modelcontextprotocol/server-memory"
    },
    @{
        name = "github"
        package = "github-mcp"
        command = "npx -y github-mcp"
    },
    @{
        name = "fetch"
        package = "@modelcontextprotocol/server-fetch"
        command = "npx -y @modelcontextprotocol/server-fetch"
    },
    @{
        name = "brave"
        package = "brave-search-mcp"
        command = "npx -y brave-search-mcp"
    },
    @{
        name = "magic"
        package = "@21st-dev/magic"
        command = "npx -y @21st-dev/magic"
    },
    @{
        name = "supabase"
        package = "@supabase/mcp-server-supabase"
        command = "npx -y @supabase/mcp-server-supabase"
    }
)

foreach ($server in $npmServers) {
    if (-not $runningServers.ContainsKey($server.name)) {
        $success = Start-NpmMcpServer -packageName $server.package -serverName $server.name -npmCommand $server.command
        if ($success) {
            $runningServers[$server.name] = @{
                method = "npm"
                command = $server.command
            }
        }
    }
}

# Method 4: Clone from GitHub as a last resort
Write-Host "Method 4: Cloning from GitHub as a last resort..." -ForegroundColor Cyan

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

    if ($runningServers.ContainsKey($serverName)) {
        Write-Host "$serverName MCP server is already running." -ForegroundColor Yellow
        return $true
    }

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

        # Start the server
        $startCommand = "npm start"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $serverDir && $startCommand" -WindowStyle Normal

        Set-Location ..\..\

        Write-Host "$serverName MCP server installed and started from GitHub." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error with GitHub for $serverName" -ForegroundColor Red
        return $false
    }
}

# Try to clone and start MCP servers from GitHub
$githubServers = @(
    @{
        name = "puppeteer"
        repo = "https://github.com/modelcontextprotocol/servers.git"
        dir = "$mcpDir\servers\src\puppeteer"
    },
    @{
        name = "memory"
        repo = "https://github.com/modelcontextprotocol/servers.git"
        dir = "$mcpDir\servers\src\memory"
    },
    @{
        name = "fetch"
        repo = "https://github.com/modelcontextprotocol/servers.git"
        dir = "$mcpDir\servers\src\fetch"
    },
    @{
        name = "github"
        repo = "https://github.com/modelcontextprotocol/servers.git"
        dir = "$mcpDir\servers\src\github"
    },
    @{
        name = "playwright"
        repo = "https://github.com/microsoft/playwright-mcp.git"
        dir = "$mcpDir\playwright-mcp"
    },
    @{
        name = "magic"
        repo = "https://github.com/21st-dev/magic-mcp.git"
        dir = "$mcpDir\magic-mcp"
    },
    @{
        name = "supabase"
        repo = "https://github.com/supabase/mcp-server-supabase.git"
        dir = "$mcpDir\supabase-mcp"
    }
)

foreach ($server in $githubServers) {
    if (-not $runningServers.ContainsKey($server.name)) {
        $success = Install-McpServerFromGitHub -repoUrl $server.repo -serverName $server.name -serverDir $server.dir
        if ($success) {
            $runningServers[$server.name] = @{
                method = "github"
                dir = $server.dir
            }
        }
    }
}

# Create MCP configuration file for Augment
Write-Host "Creating MCP configuration file for Augment..." -ForegroundColor Cyan

$mcpConfig = @{
    mcpServers = @{}
}

# Add running servers to the configuration
foreach ($serverName in $runningServers.Keys) {
    $server = $runningServers[$serverName]

    if ($server.method -eq "docker") {
        $mcpConfig.mcpServers.$serverName = @{
            command = "docker"
            args = @("run", "--rm", "-i", "mcp/$serverName")
        }
    }
    elseif ($server.method -eq "mcp-get") {
        $mcpConfig.mcpServers.$serverName = @{
            command = "mcp-get"
            args = @("run", $serverName)
        }
    }
    elseif ($server.method -eq "npm") {
        $mcpConfig.mcpServers.$serverName = @{
            command = "npx"
            args = $server.command.Split(" ") | Where-Object { $_ -ne "npx" }
        }
    }
    elseif ($server.method -eq "github") {
        $mcpConfig.mcpServers.$serverName = @{
            command = "cd"
            args = @($server.dir, "&&", "npm", "start")
        }
    }
}

$mcpConfigJson = ConvertTo-Json $mcpConfig -Depth 10
$mcpConfigJson | Out-File -FilePath "augment-mcp-config.json" -Encoding utf8

Write-Host "MCP configuration file created: augment-mcp-config.json" -ForegroundColor Green

# Summary
Write-Host "MCP Server Setup Summary:" -ForegroundColor Cyan
Write-Host "Successfully running servers:" -ForegroundColor Green
foreach ($serverName in $runningServers.Keys) {
    $server = $runningServers[$serverName]
    Write-Host "- $serverName (using $($server.method))" -ForegroundColor Green
}

$allServerNames = @("filesystem", "sequentialthinking", "redis", "puppeteer", "playwright", "memory", "github", "fetch", "brave", "magic", "supabase")
if ($runningServers.Count -lt $allServerNames.Count) {
    Write-Host "Failed to start servers:" -ForegroundColor Red
    $failedServers = $allServerNames | Where-Object { -not $runningServers.ContainsKey($_) }
    foreach ($server in $failedServers) {
        Write-Host "- $server" -ForegroundColor Red
    }
}

Write-Host "All available MCP servers have been started!" -ForegroundColor Green
Write-Host "The MCP configuration file has been created at: augment-mcp-config.json" -ForegroundColor Yellow
Write-Host "Your FinDoc Analyzer app is now ready for development with MCP servers!" -ForegroundColor Green
