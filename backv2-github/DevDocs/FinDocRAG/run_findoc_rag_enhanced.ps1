# PowerShell script to run the FinDocRAG system with the enhanced securities extractor and A2A agents

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

# Start the FinDocRAG backend
Write-Host "Starting FinDocRAG backend on port $backendPort..."
$backendEnv = @{
    "PORT" = $backendPort
    "FLASK_APP" = "src/app.py"
    "FLASK_ENV" = "development"
    "FLASK_DEBUG" = "1"
    "GEMINI_API_KEY" = $env:GEMINI_API_KEY
}
$backendProcess = Start-ProcessAsync -FilePath "python" -Arguments $backendPath -WorkingDirectory $scriptPath -EnvironmentVariables $backendEnv

# Start the A2A server
Write-Host "Starting A2A server on port $a2aPort..."
$a2aEnv = @{
    "PORT" = $a2aPort
    "GEMINI_API_KEY" = $env:GEMINI_API_KEY
}
$a2aProcess = Start-ProcessAsync -FilePath "python" -Arguments $a2aServerPath -WorkingDirectory $scriptPath -EnvironmentVariables $a2aEnv

# Wait for the servers to start
Write-Host "Waiting for the servers to start..."
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

Write-Host "FinDocRAG backend is running on port $backendPort"
Write-Host "A2A server is running on port $a2aPort"
Write-Host "Press Ctrl+C to stop the servers"

# Wait for the user to press Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # Stop the servers
    Write-Host "Stopping servers..."
    
    if (-not $backendProcess.HasExited) {
        $backendProcess.Kill()
    }
    
    if (-not $a2aProcess.HasExited) {
        $a2aProcess.Kill()
    }
    
    Write-Host "Servers stopped"
}
