# Run FinDoc with Gemini API Integration
# This script starts the app with Gemini API integration for enhanced document processing

# Set error action preference
$ErrorActionPreference = "Stop"

# Define paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptDir "backend"
$frontendPath = Join-Path $scriptDir "frontend"
$finDocRagPath = Join-Path $scriptDir "FinDocRAG"

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

# Prompt for Gemini API key
$geminiApiKey = Read-Host -Prompt "Enter your Gemini API key (press Enter to use the default key)"

# Use default key if none provided
if ([string]::IsNullOrWhiteSpace($geminiApiKey)) {
    $geminiApiKey = "sk-or-v1-a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9"
    Write-Host "Using default API key (this is a placeholder and won't work for real API calls)"
}

# Set environment variable for the Gemini API key
$env:GEMINI_API_KEY = $geminiApiKey
Write-Host "Gemini API key set in environment variable GEMINI_API_KEY"

# Create configuration file for the agent system
$configPath = Join-Path $finDocRagPath "agent_system/config.json"
$config = @{
    "api_keys" = @{
        "gemini" = $geminiApiKey
    }
    "model_settings" = @{
        "document_analyzer" = @{
            "model" = "gemini-1.5-pro"
        }
        "table_understanding" = @{
            "model" = "gemini-1.5-pro"
        }
        "securities_extractor" = @{
            "model" = "gemini-1.5-pro"
        }
        "financial_reasoner" = @{
            "model" = "gemini-1.5-pro"
        }
    }
}

# Create directory if it doesn't exist
$configDir = Split-Path -Parent $configPath
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Save configuration to file
$config | ConvertTo-Json -Depth 10 | Set-Content -Path $configPath
Write-Host "Created configuration file: $configPath"

# Start the backend server
Write-Host "Starting backend server..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $backendPath && set GEMINI_API_KEY=$geminiApiKey && node server.js" -NoNewWindow

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
Start-Process "http://localhost:3002/enhanced-integration"

# Display information
Write-Host ""
Write-Host "FinDoc with Gemini API Integration is now running!"
Write-Host "Backend server: http://localhost:5000"
Write-Host "Frontend server: http://localhost:3002"
Write-Host ""
Write-Host "Enhanced Integration page: http://localhost:3002/enhanced-integration"
Write-Host ""
Write-Host "The system is using the Gemini API for:"
Write-Host "1. Document analysis and classification"
Write-Host "2. Table understanding and extraction"
Write-Host "3. Securities information extraction"
Write-Host "4. Financial reasoning and validation"
Write-Host ""
Write-Host "To test the system:"
Write-Host "1. Go to http://localhost:3002/enhanced-integration"
Write-Host "2. Upload a financial document (test documents are available in the test_documents directory)"
Write-Host "3. Process the document and view the results"
Write-Host "4. Ask questions about the document in the chat interface"
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
