# Run FinDoc with Enhanced Integration
# This script starts both the backend and frontend servers with the enhanced integration

# Set error action preference
$ErrorActionPreference = "Stop"

# Define paths
$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"
$finDocRagPath = Join-Path $PSScriptRoot "FinDocRAG"

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

# Create test documents if they don't exist
$testDocumentsPath = Join-Path $PSScriptRoot "test_documents"
$messosDocumentPath = Join-Path $testDocumentsPath "messos_portfolio.pdf"

if (-not (Test-Path $messosDocumentPath)) {
    Write-Host "Creating test documents..."
    $createTestDocumentsScript = Join-Path $testDocumentsPath "create_test_document.py"
    
    # Run the Python script to create test documents
    Write-Host "Creating test documents..."
    python $createTestDocumentsScript --output-dir $testDocumentsPath --document-type "all"
}

# Set up environment variables for the Gemini API key
$env:GEMINI_API_KEY = "sk-or-v1-a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9"

# Start the backend server
Write-Host "Starting backend server..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $backendPath && node server.js" -NoNewWindow

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
Write-Host "FinDoc with Enhanced Integration is now running!"
Write-Host "Backend server: http://localhost:5000"
Write-Host "Frontend server: http://localhost:3002"
Write-Host ""
Write-Host "Enhanced Integration page: http://localhost:3002/enhanced-integration"
Write-Host ""
Write-Host "The enhanced integration includes:"
Write-Host "1. Multi-Agent System: Document Analyzer, Table Understanding, Securities Extractor, and Financial Reasoner agents"
Write-Host "2. Camelot: Enhanced table extraction from PDFs"
Write-Host "3. Table Transformer: Microsoft's deep learning model for table recognition"
Write-Host "4. ReportLab: PDF report generation"
Write-Host "5. Plotly: Interactive visualizations of financial data"
Write-Host ""
Write-Host "Test documents are available in the test_documents directory:"
Write-Host "- Messos Portfolio Statement: $messosDocumentPath"
Write-Host "- Goldman Sachs Portfolio Statement: $(Join-Path $testDocumentsPath 'goldman_portfolio.pdf')"
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
