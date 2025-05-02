# FinDoc Analyzer Direct Server Script
# This script starts a simple Express server that serves the FinDoc UI directly

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
    Write-Host "${BLUE}Port 3002 in use, attempting to kill process...${NC}"
    try {
        $process = Get-Process -Id (Get-NetTCPConnection -LocalPort 3002).OwningProcess
        Stop-Process -Id $process.Id -Force
    } catch {
        Write-Host "${RED}Could not kill process on port 3002. Please close it manually.${NC}"
    }
}

# Set the root directory
$ROOT_DIR = Get-Location

# Install Express if not already installed
Write-Host "${BLUE}Installing Express...${NC}"
Set-Location "backv2-github\DevDocs\frontend"
npm install express

# Start the direct server
Write-Host "${BLUE}Starting FinDoc Analyzer direct server...${NC}"
$serverJob = Start-Job -ScriptBlock {
    Set-Location "$using:ROOT_DIR\backv2-github\DevDocs\frontend"
    node server-direct.js
}

# Wait for server to be ready
$serverReady = Wait-ForService -port 3002 -service "FinDoc Server"

if ($serverReady) {
    Write-Host "${GREEN}FinDoc Analyzer is running!${NC}"
    Write-Host "${BLUE}Server:${NC} http://localhost:3002"
    
    # Open the application in the default browser
    Start-Process "http://localhost:3002"
    
    Write-Host "${BLUE}Press Ctrl+C to stop the server${NC}"
    
    try {
        # Keep the script running until Ctrl+C is pressed
        while ($true) {
            Start-Sleep -Seconds 1
        }
    } finally {
        # Clean up when Ctrl+C is pressed
        Write-Host "${BLUE}Stopping server...${NC}"
        Stop-Job -Job $serverJob
        Remove-Job -Job $serverJob
        
        # Stop any remaining processes
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        
        Write-Host "${GREEN}Server stopped${NC}"
    }
} else {
    Write-Host "${RED}Failed to start server${NC}"
    
    # Clean up
    Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
    
    exit 1
}

# Return to the root directory
Set-Location $ROOT_DIR
