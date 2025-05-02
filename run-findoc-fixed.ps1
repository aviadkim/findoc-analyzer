# FinDoc Analyzer Startup Script
# This script starts both the backend and frontend servers for the FinDoc Analyzer application

# Define colors for console output
$BLUE = [char]27 + "[34m"
$GREEN = [char]27 + "[32m"
$RED = [char]27 + "[31m"
$NC = [char]27 + "[0m"  # No Color

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int]$port
    )
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        return $connections.Count -gt 0
    } catch {
        return $false
    }
}

# Function to wait for a service to be ready
function Wait-ForService {
    param (
        [int]$port,
        [string]$service
    )
    
    $maxAttempts = 30
    $attempt = 0
    $delay = 2
    
    Write-Host "${BLUE}Waiting for $service to be ready...${NC}"
    
    while ($attempt -lt $maxAttempts) {
        try {
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $result = $tcpClient.BeginConnect("localhost", $port, $null, $null)
            $success = $result.AsyncWaitHandle.WaitOne(1000, $false)
            $tcpClient.Close()
            
            if ($success) {
                Write-Host "${GREEN}$service is ready!${NC}"
                return $true
            }
        } catch {
            # Ignore errors and continue trying
        }
        
        $attempt++
        Start-Sleep -Seconds $delay
    }
    
    Write-Host "${RED}Timed out waiting for $service to be ready${NC}"
    return $false
}

# Stop any existing Node.js and Python processes
Write-Host "${BLUE}Stopping any existing Node.js and Python processes...${NC}"
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force

# Check if ports are in use
if (Test-PortInUse -port 3002) {
    Write-Host "${BLUE}Port 3002 in use, killing process...${NC}"
    $process = Get-Process -Id (Get-NetTCPConnection -LocalPort 3002).OwningProcess
    Stop-Process -Id $process.Id -Force
}

if (Test-PortInUse -port 24125) {
    Write-Host "${BLUE}Port 24125 in use, killing process...${NC}"
    $process = Get-Process -Id (Get-NetTCPConnection -LocalPort 24125).OwningProcess
    Stop-Process -Id $process.Id -Force
}

# Create a log directory
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Set the root directory
$ROOT_DIR = Get-Location

# Install Python backend dependencies
Write-Host "${BLUE}Installing Python backend dependencies...${NC}"
if (Test-Path "DevDocs\backend\requirements.txt") {
    Set-Location "DevDocs\backend"
    if (-not (Test-Path "venv")) {
        python -m venv venv
    }
    & .\venv\Scripts\Activate.ps1
    python -m pip install -r requirements.txt
    deactivate
    Set-Location $ROOT_DIR
} else {
    Write-Host "${RED}Error: requirements.txt not found in DevDocs\backend directory${NC}"
    exit 1
}

# Install frontend dependencies
Write-Host "${BLUE}Installing frontend dependencies...${NC}"
if (Test-Path "DevDocs\frontend\package.json") {
    Set-Location "DevDocs\frontend"
    npm install
    Set-Location $ROOT_DIR
} else {
    Write-Host "${RED}Error: package.json not found in DevDocs\frontend directory${NC}"
    exit 1
}

# Start Flask backend
Write-Host "${BLUE}Starting Flask backend...${NC}"
$backendJob = Start-Job -ScriptBlock {
    Set-Location "$using:ROOT_DIR\DevDocs\backend"
    & .\venv\Scripts\Activate.ps1
    python app.py
}

# Start Next.js frontend
Write-Host "${BLUE}Starting Next.js frontend...${NC}"
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:ROOT_DIR\DevDocs\frontend"
    $env:PORT = 3002
    npm run dev
}

# Wait for services to be ready
$backendReady = Wait-ForService -port 24125 -service "Backend"
$frontendReady = Wait-ForService -port 3002 -service "Frontend"

if ($backendReady -and $frontendReady) {
    Write-Host "${GREEN}All services are running!${NC}"
    Write-Host "${BLUE}Backend:${NC} http://localhost:24125"
    Write-Host "${BLUE}Frontend:${NC} http://localhost:3002"
    
    # Open the frontend in the default browser
    Start-Process "http://localhost:3002"
    
    Write-Host "${BLUE}Press Ctrl+C to stop all services${NC}"
    
    try {
        # Keep the script running until Ctrl+C is pressed
        while ($true) {
            Start-Sleep -Seconds 1
        }
    } finally {
        # Clean up when Ctrl+C is pressed
        Write-Host "${BLUE}Stopping services...${NC}"
        Stop-Job -Job $backendJob
        Stop-Job -Job $frontendJob
        Remove-Job -Job $backendJob
        Remove-Job -Job $frontendJob
        
        # Stop any remaining processes
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
        
        Write-Host "${GREEN}All services stopped${NC}"
    }
} else {
    Write-Host "${RED}Failed to start all services${NC}"
    
    # Clean up
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
    
    exit 1
}
