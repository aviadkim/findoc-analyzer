# Run FinDoc with Enhanced Processing
# This script starts both the backend and frontend servers with enhanced processing capabilities

# Set error action preference
$ErrorActionPreference = "Stop"

# Define paths
$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"
$enhancedProcessingPath = Join-Path $PSScriptRoot "FinDocRAG"

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    $connections = netstat -ano | Select-String -Pattern "TCP.*:$Port.*LISTENING"
    return $connections.Count -gt 0
}

# Function to kill a process using a specific port
function Kill-ProcessOnPort {
    param (
        [int]$Port
    )
    
    $connections = netstat -ano | Select-String -Pattern "TCP.*:$Port.*LISTENING"
    if ($connections.Count -gt 0) {
        $processId = $connections[0].ToString().Split(' ')[-1]
        Write-Host "Killing process with ID $processId using port $Port"
        Stop-Process -Id $processId -Force
    }
}

# Check if ports are in use and kill processes if needed
$backendPort = 5000
$frontendPort = 3002

if (Test-PortInUse -Port $backendPort) {
    Write-Host "Port $backendPort is in use. Killing the process..."
    Kill-ProcessOnPort -Port $backendPort
}

if (Test-PortInUse -Port $frontendPort) {
    Write-Host "Port $frontendPort is in use. Killing the process..."
    Kill-ProcessOnPort -Port $frontendPort
}

# Install dependencies if needed
Write-Host "Checking dependencies..."

# Check if Python dependencies are installed
$pythonDeps = @("pandas", "numpy", "tabulate", "pymupdf", "fpdf", "google-generativeai")
foreach ($dep in $pythonDeps) {
    $installed = python -c "import $dep" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Installing Python dependency: $dep"
        python -m pip install $dep
    }
}

# Check if Node.js dependencies are installed
if (-not (Test-Path (Join-Path $backendPath "node_modules"))) {
    Write-Host "Installing backend dependencies..."
    Push-Location $backendPath
    npm install
    Pop-Location
}

if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    Write-Host "Installing frontend dependencies..."
    Push-Location $frontendPath
    npm install
    Pop-Location
}

# Create enhanced output directory if it doesn't exist
$enhancedOutputPath = Join-Path $backendPath "enhanced_output"
if (-not (Test-Path $enhancedOutputPath)) {
    New-Item -ItemType Directory -Path $enhancedOutputPath | Out-Null
    Write-Host "Created enhanced output directory: $enhancedOutputPath"
}

# Create uploads directory if it doesn't exist
$uploadsPath = Join-Path $backendPath "uploads"
if (-not (Test-Path $uploadsPath)) {
    New-Item -ItemType Directory -Path $uploadsPath | Out-Null
    Write-Host "Created uploads directory: $uploadsPath"
}

# Start the backend server
Write-Host "Starting backend server..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $backendPath && npm start" -NoNewWindow

# Wait for the backend to start
Write-Host "Waiting for backend to start..."
Start-Sleep -Seconds 5

# Start the frontend server
Write-Host "Starting frontend server..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $frontendPath && npm start" -NoNewWindow

# Wait for the frontend to start
Write-Host "Waiting for frontend to start..."
Start-Sleep -Seconds 5

# Open the browser
Write-Host "Opening browser..."
Start-Process "http://localhost:3002/enhanced-processing"

# Display information
Write-Host ""
Write-Host "FinDoc with Enhanced Processing is now running!"
Write-Host "Backend server: http://localhost:5000"
Write-Host "Frontend server: http://localhost:3002"
Write-Host "Enhanced Processing page: http://localhost:3002/enhanced-processing"
Write-Host ""
Write-Host "Press Ctrl+C to stop the servers"

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # Clean up when the script is interrupted
    Write-Host "Stopping servers..."
    Kill-ProcessOnPort -Port $backendPort
    Kill-ProcessOnPort -Port $frontendPort
}
