# FinDoc Analyzer Frontend-Only Startup Script
# This script starts only the frontend server for the FinDoc Analyzer application

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

# Stop any existing Node.js processes
Write-Host "${BLUE}Stopping any existing Node.js processes...${NC}"
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Check if port is in use
if (Test-PortInUse -port 3002) {
    Write-Host "${BLUE}Port 3002 in use, killing process...${NC}"
    $process = Get-Process -Id (Get-NetTCPConnection -LocalPort 3002).OwningProcess
    Stop-Process -Id $process.Id -Force
}

# Set the root directory
$ROOT_DIR = Get-Location

# Install frontend dependencies
Write-Host "${BLUE}Installing frontend dependencies...${NC}"
if (Test-Path "backv2-github\DevDocs\frontend\package.json") {
    Set-Location "backv2-github\DevDocs\frontend"
    npm install
    
    # Start Next.js frontend
    Write-Host "${BLUE}Starting Next.js frontend...${NC}"
    $env:PORT = 3002
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location "$using:ROOT_DIR\backv2-github\DevDocs\frontend"
        node server-ui.js
    }
    
    # Wait for frontend to be ready
    $frontendReady = Wait-ForService -port 3002 -service "Frontend"
    
    if ($frontendReady) {
        Write-Host "${GREEN}Frontend is running!${NC}"
        Write-Host "${BLUE}Frontend:${NC} http://localhost:3002"
        
        # Open the frontend in the default browser
        Start-Process "http://localhost:3002"
        
        Write-Host "${BLUE}Press Ctrl+C to stop the frontend${NC}"
        
        try {
            # Keep the script running until Ctrl+C is pressed
            while ($true) {
                Start-Sleep -Seconds 1
            }
        } finally {
            # Clean up when Ctrl+C is pressed
            Write-Host "${BLUE}Stopping frontend...${NC}"
            Stop-Job -Job $frontendJob
            Remove-Job -Job $frontendJob
            
            # Stop any remaining processes
            Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
            
            Write-Host "${GREEN}Frontend stopped${NC}"
        }
    } else {
        Write-Host "${RED}Failed to start frontend${NC}"
        
        # Clean up
        Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
        Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
        
        exit 1
    }
    
    # Return to the root directory
    Set-Location $ROOT_DIR
} else {
    Write-Host "${RED}Error: package.json not found in backv2-github\DevDocs\frontend directory${NC}"
    exit 1
}
