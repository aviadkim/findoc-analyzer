# Install MCP servers using MCP Hub
# This script installs and starts MCP servers using the MCP Hub tool

Write-Host "Installing MCP servers using MCP Hub..." -ForegroundColor Green

# Install MCP Hub if not already installed
try {
    $mcpHubVersion = mcp-hub --version 2>&1
    Write-Host "MCP Hub is already installed: $mcpHubVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing MCP Hub..." -ForegroundColor Yellow
    npm install -g mcp-hub
}

# Create directory for MCP Hub configuration
$mcpHubDir = "$env:USERPROFILE\.mcp-hub"
if (-not (Test-Path $mcpHubDir)) {
    New-Item -ItemType Directory -Path $mcpHubDir | Out-Null
    Write-Host "Created MCP Hub directory: $mcpHubDir" -ForegroundColor Yellow
}

# Create MCP Hub configuration file
$mcpHubConfig = @{
    servers = @(
        @{
            name = "puppeteer"
            package = "@modelcontextprotocol/server-puppeteer"
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-puppeteer")
        },
        @{
            name = "playwright"
            package = "@playwright/mcp"
            command = "npx"
            args = @("-y", "@playwright/mcp", "--browser", "chromium")
        },
        @{
            name = "memory"
            package = "@modelcontextprotocol/server-memory"
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-memory")
        },
        @{
            name = "github"
            package = "github-mcp"
            command = "npx"
            args = @("-y", "github-mcp")
        },
        @{
            name = "supabase"
            package = "@supabase/mcp-server-supabase"
            command = "npx"
            args = @("-y", "@supabase/mcp-server-supabase")
        },
        @{
            name = "magic"
            package = "@21st-dev/magic"
            command = "npx"
            args = @("-y", "@21st-dev/magic")
        },
        @{
            name = "brave-search"
            package = "brave-search-mcp"
            command = "npx"
            args = @("-y", "brave-search-mcp")
        },
        @{
            name = "fetch"
            package = "@modelcontextprotocol/server-fetch"
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-fetch")
        }
    )
}

$mcpHubConfigJson = ConvertTo-Json $mcpHubConfig -Depth 10
$mcpHubConfigJson | Out-File -FilePath "$mcpHubDir\config.json" -Encoding utf8

Write-Host "MCP Hub configuration file created: $mcpHubDir\config.json" -ForegroundColor Green

# Install all servers
Write-Host "Installing all MCP servers..." -ForegroundColor Cyan
mcp-hub install all

# Start all servers
Write-Host "Starting all MCP servers..." -ForegroundColor Cyan
mcp-hub start all

# Create MCP configuration file for Augment
Write-Host "Creating MCP configuration file for Augment..." -ForegroundColor Cyan

$mcpConfig = @{
    mcpServers = @{
        puppeteer = @{
            command = "mcp-hub"
            args = @("run", "puppeteer")
        }
        playwright = @{
            command = "mcp-hub"
            args = @("run", "playwright")
        }
        memory = @{
            command = "mcp-hub"
            args = @("run", "memory")
        }
        github = @{
            command = "mcp-hub"
            args = @("run", "github")
        }
        supabase = @{
            command = "mcp-hub"
            args = @("run", "supabase")
        }
        magic = @{
            command = "mcp-hub"
            args = @("run", "magic")
        }
        brave = @{
            command = "mcp-hub"
            args = @("run", "brave-search")
        }
        fetch = @{
            command = "mcp-hub"
            args = @("run", "fetch")
        }
    }
}

$mcpConfigJson = ConvertTo-Json $mcpConfig -Depth 10
$mcpConfigJson | Out-File -FilePath "augment-mcp-config.json" -Encoding utf8

Write-Host "MCP configuration file created: augment-mcp-config.json" -ForegroundColor Green

# Summary
Write-Host "MCP Server Setup Summary:" -ForegroundColor Cyan
Write-Host "Installed and started the following MCP servers:" -ForegroundColor Green
Write-Host "- Puppeteer" -ForegroundColor Green
Write-Host "- Playwright" -ForegroundColor Green
Write-Host "- Memory" -ForegroundColor Green
Write-Host "- GitHub" -ForegroundColor Green
Write-Host "- Supabase" -ForegroundColor Green
Write-Host "- Magic (21st.dev)" -ForegroundColor Green
Write-Host "- Brave Search" -ForegroundColor Green
Write-Host "- Fetch" -ForegroundColor Green

Write-Host "All available MCP servers have been installed and started!" -ForegroundColor Green
Write-Host "The MCP configuration file has been created at: augment-mcp-config.json" -ForegroundColor Yellow
Write-Host "Your FinDoc Analyzer app is now ready for development with MCP servers!" -ForegroundColor Green
