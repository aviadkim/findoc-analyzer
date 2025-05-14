# FinDoc Analyzer UI Files Deployment Script
# This script deploys the UI files to the server

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-ui-files-$timestamp.log"

# Create log function
function Log-Message {
    param (
        [string]$message
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $message"
    
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

# Start deployment
Log-Message "Starting UI files deployment..."

# Check if UI components files exist
Log-Message "Checking UI components files..."
if (-not (Test-Path "public/js/ui-components.js")) {
    Log-Message "Error: UI components file not found: public/js/ui-components.js"
    exit 1
}
if (-not (Test-Path "public/js/ui-validator.js")) {
    Log-Message "Error: UI validator file not found: public/js/ui-validator.js"
    exit 1
}

# Run the application with the UI fixes
Log-Message "Running the application with the UI fixes..."
Log-Message "Running: node server.js"

try {
    # Start the server in the background
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -NoNewWindow
    Log-Message "Server started with process ID: $($serverProcess.Id)"
    
    # Wait for the server to start
    Log-Message "Waiting for the server to start..."
    Start-Sleep -Seconds 5
    
    # Open the application in the browser
    Log-Message "Opening the application in the browser..."
    Start-Process "http://localhost:8080/upload"
    
    # Wait for user to press a key to stop the server
    Log-Message "Press any key to stop the server..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Stop the server
    Log-Message "Stopping the server..."
    Stop-Process -Id $serverProcess.Id -Force
    Log-Message "Server stopped"
} catch {
    Log-Message "Error running the application: $_"
    exit 1
}

# Deployment complete
Log-Message "UI files deployment complete!"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the UI fixes, visit the application at:"
Write-Host "http://localhost:8080/upload"
Write-Host ""
Write-Host "Check the upload page to verify that the process button and chat functionality are working."
Write-Host ""
