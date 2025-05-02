# FinDoc Analyzer Simple Frontend Startup Script
# This script starts only the frontend server without reinstalling dependencies

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

# Start Next.js frontend
Write-Host "${BLUE}Starting Next.js frontend...${NC}"
if (Test-Path "backv2-github\DevDocs\frontend\package.json") {
    Set-Location "backv2-github\DevDocs\frontend"
    $env:PORT = 3002

    # Start the server using npm run dev
    npm run dev

    # Return to the root directory
    Set-Location $ROOT_DIR
} else {
    Write-Host "${RED}Error: package.json not found in backv2-github\DevDocs\frontend directory${NC}"
    exit 1
}
