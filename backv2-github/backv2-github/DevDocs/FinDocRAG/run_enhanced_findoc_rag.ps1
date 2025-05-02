# PowerShell script to run the enhanced FinDocRAG system with sequential thinking and A2A agents

# Set the Gemini API key
$env:GEMINI_API_KEY = "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"

# Set the ports
$backendPort = 5000
$a2aPort = 5001

# Set the paths
$scriptPath = $PSScriptRoot
$backendPath = Join-Path -Path $scriptPath -ChildPath "src\app.py"
$a2aServerPath = Join-Path -Path $scriptPath -ChildPath "src\google_agents_integration\a2a\a2a_server.py"

# Check if the paths exist
if (-not (Test-Path -Path $backendPath)) {
    Write-Error "Backend not found at $backendPath"
    exit 1
}

if (-not (Test-Path -Path $a2aServerPath)) {
    Write-Error "A2A server not found at $a2aServerPath"
    exit 1
}

# Create a function to start a process
function Start-ProcessAsync {
    param (
        [string]$FilePath,
        [string]$Arguments,
        [string]$WorkingDirectory,
        [hashtable]$EnvironmentVariables
    )
    
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = $FilePath
    $startInfo.Arguments = $Arguments
    $startInfo.WorkingDirectory = $WorkingDirectory
    $startInfo.UseShellExecute = $false
    
    # Set environment variables
    foreach ($key in $EnvironmentVariables.Keys) {
        $startInfo.EnvironmentVariables[$key] = $EnvironmentVariables[$key]
    }
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    $process.Start() | Out-Null
    
    return $process
}

# Display welcome message
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Enhanced FinDocRAG with Sequential Thinking" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This system uses sequential thinking and advanced AI to extract securities information from financial documents with high accuracy." -ForegroundColor Yellow
Write-Host ""
Write-Host "Features:" -ForegroundColor Green
Write-Host "- Sequential thinking framework for step-by-step analysis" -ForegroundColor Green
Write-Host "- Financial knowledge base with domain-specific information" -ForegroundColor Green
Write-Host "- Table understanding agent for accurate table extraction" -ForegroundColor Green
Write-Host "- Enhanced securities extraction with Gemini Pro" -ForegroundColor Green
Write-Host "- Verification system to ensure accuracy" -ForegroundColor Green
Write-Host ""

# Start the FinDocRAG backend
Write-Host "Starting FinDocRAG backend on port $backendPort..." -ForegroundColor Cyan
$backendEnv = @{
    "PORT" = $backendPort
    "FLASK_APP" = "src/app.py"
    "FLASK_ENV" = "development"
    "FLASK_DEBUG" = "1"
    "GEMINI_API_KEY" = $env:GEMINI_API_KEY
}
$backendProcess = Start-ProcessAsync -FilePath "python" -Arguments $backendPath -WorkingDirectory $scriptPath -EnvironmentVariables $backendEnv

# Start the A2A server
Write-Host "Starting A2A server with sequential thinking on port $a2aPort..." -ForegroundColor Cyan
$a2aEnv = @{
    "PORT" = $a2aPort
    "GEMINI_API_KEY" = $env:GEMINI_API_KEY
}
$a2aProcess = Start-ProcessAsync -FilePath "python" -Arguments $a2aServerPath -WorkingDirectory $scriptPath -EnvironmentVariables $a2aEnv

# Wait for the servers to start
Write-Host "Waiting for the servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Check if the servers are running
if ($backendProcess.HasExited) {
    Write-Error "FinDocRAG backend failed to start"
    exit 1
}

if ($a2aProcess.HasExited) {
    Write-Error "A2A server failed to start"
    exit 1
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Enhanced FinDocRAG is now running!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "FinDocRAG backend is running on port $backendPort" -ForegroundColor Cyan
Write-Host "A2A server is running on port $a2aPort" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can access the application at:" -ForegroundColor Yellow
Write-Host "  http://localhost:$backendPort" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Red

# Wait for the user to press Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # Stop the servers
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    
    if (-not $backendProcess.HasExited) {
        $backendProcess.Kill()
    }
    
    if (-not $a2aProcess.HasExited) {
        $a2aProcess.Kill()
    }
    
    Write-Host "Servers stopped" -ForegroundColor Green
}
