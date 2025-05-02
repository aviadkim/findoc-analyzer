# Run FinDoc Analyzer with Google Cloud MCP Integration
# This script runs the application with Google Cloud MCP integration

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to check if a directory exists
function Test-DirectoryExists {
    param (
        [string]$Path
    )
    return Test-Path -Path $Path -PathType Container
}

# Function to check if a repository exists
function Test-RepositoryExists {
    param (
        [string]$Path
    )
    return Test-Path -Path (Join-Path $Path ".git") -PathType Container
}

# Function to clone a repository if it doesn't exist
function Clone-Repository {
    param (
        [string]$Url,
        [string]$Path
    )
    if (-not (Test-RepositoryExists -Path $Path)) {
        Write-Host "Cloning repository: $Url to $Path"
        git clone $Url $Path
        return $true
    }
    return $false
}

# Load environment variables from .env file
$envFilePath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFilePath) {
    Get-Content $envFilePath | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "Loaded environment variable: $key"
        }
    }
}

# Check for required environment variables
$requiredVars = @("GOOGLE_PROJECT_ID", "GOOGLE_APPLICATION_CREDENTIALS", "GEMINI_API_KEY")
$missingVars = @()
foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "Error: The following required environment variables are not set:"
    foreach ($var in $missingVars) {
        Write-Host "  - $var"
    }
    Write-Host "Please run setup-gcloud-secure.ps1 first."
    exit 1
}

# Set up Google Cloud MCP repositories
$mcpDir = Join-Path $PSScriptRoot "mcp"
Ensure-DirectoryExists -Path $mcpDir

# Clone Google Cloud MCP repositories
$gcpMcpDir = Join-Path $mcpDir "gcp-mcp"
$googleCloudMcpDir = Join-Path $mcpDir "google-cloud-mcp"
$awesomeGcpCertDir = Join-Path $mcpDir "awesome-gcp-certifications"

Clone-Repository -Url "https://github.com/eniayomi/gcp-mcp" -Path $gcpMcpDir
Clone-Repository -Url "https://github.com/krzko/google-cloud-mcp" -Path $googleCloudMcpDir
Clone-Repository -Url "https://github.com/sathishvj/awesome-gcp-certifications" -Path $awesomeGcpCertDir

# Install dependencies for Google Cloud MCP
if (Test-DirectoryExists -Path $gcpMcpDir) {
    Write-Host "Installing dependencies for gcp-mcp..."
    Push-Location $gcpMcpDir
    npm install
    Pop-Location
}

if (Test-DirectoryExists -Path $googleCloudMcpDir) {
    Write-Host "Installing dependencies for google-cloud-mcp..."
    Push-Location $googleCloudMcpDir
    npm install
    Pop-Location
}

# Create MCP configuration file
$mcpConfigDir = Join-Path $PSScriptRoot ".mcp"
Ensure-DirectoryExists -Path $mcpConfigDir

$mcpConfigPath = Join-Path $mcpConfigDir "gcp-mcp-config.json"
$mcpConfig = @{
    "projectId" = $env:GOOGLE_PROJECT_ID
    "keyFilePath" = $env:GOOGLE_APPLICATION_CREDENTIALS
    "region" = "us-central1"
    "port" = 3400
}

$mcpConfig | ConvertTo-Json | Set-Content -Path $mcpConfigPath
Write-Host "Created MCP configuration file: $mcpConfigPath"

# Start Google Cloud MCP server
Write-Host "Starting Google Cloud MCP server..."
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $googleCloudMcpDir -NoNewWindow

# Wait for the MCP server to start
Write-Host "Waiting for MCP server to start..."
Start-Sleep -Seconds 5

# Run the application with Docker
Write-Host "Starting the application with Docker..."
docker-compose up -d

# Wait for the services to start
Write-Host "Waiting for services to start..."
Start-Sleep -Seconds 10

# Get the frontend URL
$frontendUrl = "http://localhost:3002"

# Open the browser
Write-Host "Opening browser..."
Start-Process $frontendUrl

# Display information
Write-Host ""
Write-Host "FinDoc Analyzer is now running with Google Cloud MCP integration!"
Write-Host "Frontend: $frontendUrl"
Write-Host "Backend API: http://localhost:5000"
Write-Host "Google Cloud MCP Server: http://localhost:3400"
Write-Host ""
Write-Host "The application is integrated with Google Cloud through the MCP server."
Write-Host "You can now use natural language to interact with Google Cloud resources."
Write-Host ""
Write-Host "To stop the application, press Ctrl+C and then run 'docker-compose down'"
Write-Host ""
Write-Host "Press Ctrl+C to stop the script (containers will continue running)"

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Host "Script stopped. Containers are still running."
    Write-Host "To stop the containers, run 'docker-compose down'"
    Write-Host "To stop the MCP server, find and terminate the Node.js process"
}
