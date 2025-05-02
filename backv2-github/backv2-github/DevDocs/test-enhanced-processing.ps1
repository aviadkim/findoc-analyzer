# Test the enhanced processing system
# This script tests the enhanced processing system by running a series of tests

param (
    [Parameter(Mandatory=$false)]
    [switch]$SkipSetup,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBackendTests,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipFrontendTests,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipEndToEndTests
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Set the current directory to the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Define paths
$backendPath = Join-Path $scriptDir "backend"
$frontendPath = Join-Path $scriptDir "frontend"
$enhancedProcessingPath = Join-Path $scriptDir "FinDocRAG"
$testDocumentsPath = Join-Path $scriptDir "test_documents"

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

# Function to make an HTTP request
function Invoke-HttpRequest {
    param (
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    $params = @{
        Method = $Method
        Uri = $Url
        Headers = $Headers
        UseBasicParsing = $true
    }
    
    if ($Body) {
        $params.Body = $Body
    }
    
    try {
        $response = Invoke-WebRequest @params
        return @{
            StatusCode = $response.StatusCode
            Content = $response.Content
        }
    }
    catch {
        return @{
            StatusCode = $_.Exception.Response.StatusCode.value__
            Content = $_.Exception.Message
        }
    }
}

# Function to run a test
function Run-Test {
    param (
        [string]$Name,
        [scriptblock]$Test
    )
    
    Write-Host "Running test: $Name"
    try {
        & $Test
        Write-Host "Test passed: $Name" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Test failed: $Name" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Setup testing environment
if (-not $SkipSetup) {
    Write-Host "Setting up testing environment..." -ForegroundColor Cyan
    
    # Install dependencies
    Write-Host "Installing dependencies..."
    & "$scriptDir\install-dependencies.ps1"
    
    # Create test documents
    Write-Host "Creating test documents..."
    & "$scriptDir\create-test-documents.ps1"
}

# Start the backend server
$backendPort = 5000
if (Test-PortInUse -Port $backendPort) {
    Write-Host "Port $backendPort is in use. Killing the process..."
    Kill-ProcessOnPort -Port $backendPort
}

Write-Host "Starting backend server..."
$backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $backendPath && npm start" -NoNewWindow -PassThru

# Wait for the backend to start
Write-Host "Waiting for backend to start..."
Start-Sleep -Seconds 5

# Test backend API
if (-not $SkipBackendTests) {
    Write-Host "Testing backend API..." -ForegroundColor Cyan
    
    $testsPassed = 0
    $testsFailed = 0
    
    # Test 1: Test the enhanced processing API endpoint
    $test1 = Run-Test -Name "Test enhanced processing API endpoint" -Test {
        $response = Invoke-HttpRequest -Method "GET" -Url "http://localhost:5000/api/health"
        if ($response.StatusCode -ne 200) {
            throw "Expected status code 200, got $($response.StatusCode)"
        }
    }
    
    if ($test1) { $testsPassed++ } else { $testsFailed++ }
    
    # Test 2: Test document upload
    $test2 = Run-Test -Name "Test document upload" -Test {
        $testDocumentPath = Join-Path $testDocumentsPath "messos_portfolio.pdf"
        if (-not (Test-Path $testDocumentPath)) {
            throw "Test document not found: $testDocumentPath"
        }
        
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"messos_portfolio.pdf`"",
            "Content-Type: application/pdf",
            "",
            [System.IO.File]::ReadAllText($testDocumentPath),
            "--$boundary--",
            ""
        )
        
        $body = $bodyLines -join $LF
        
        $headers = @{
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }
        
        $response = Invoke-HttpRequest -Method "POST" -Url "http://localhost:5000/api/financial/enhanced-processing" -Headers $headers -Body $body
        
        if ($response.StatusCode -ne 202) {
            throw "Expected status code 202, got $($response.StatusCode)"
        }
    }
    
    if ($test2) { $testsPassed++ } else { $testsFailed++ }
    
    # Display test results
    Write-Host "Backend API tests completed: $testsPassed passed, $testsFailed failed" -ForegroundColor Cyan
}

# Start the frontend server
$frontendPort = 3002
if (Test-PortInUse -Port $frontendPort) {
    Write-Host "Port $frontendPort is in use. Killing the process..."
    Kill-ProcessOnPort -Port $frontendPort
}

Write-Host "Starting frontend server..."
$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $frontendPath && npm start" -NoNewWindow -PassThru

# Wait for the frontend to start
Write-Host "Waiting for frontend to start..."
Start-Sleep -Seconds 5

# Test frontend integration
if (-not $SkipFrontendTests) {
    Write-Host "Testing frontend integration..." -ForegroundColor Cyan
    
    # Open the browser
    Write-Host "Opening browser..."
    Start-Process "http://localhost:3002/enhanced-processing"
    
    # Wait for user to test the frontend
    Write-Host "Please test the frontend manually and press Enter when done..."
    Read-Host
}

# End-to-end testing
if (-not $SkipEndToEndTests) {
    Write-Host "Running end-to-end tests..." -ForegroundColor Cyan
    
    # Open the browser
    Write-Host "Opening browser..."
    Start-Process "http://localhost:3002/enhanced-processing"
    
    # Instructions for manual testing
    Write-Host "Please perform the following tests manually:"
    Write-Host "1. Upload a test document (test_documents/messos_portfolio.pdf)"
    Write-Host "2. Verify that the document is processed successfully"
    Write-Host "3. Verify that the securities are extracted correctly"
    Write-Host "4. Verify that the Harp security value is 1,502,850 USD"
    Write-Host "5. Try downloading the results"
    Write-Host "6. Try uploading a different document (test_documents/goldman_portfolio.pdf)"
    
    # Wait for user to complete the tests
    Write-Host "Press Enter when you have completed the tests..."
    Read-Host
}

# Clean up
Write-Host "Cleaning up..." -ForegroundColor Cyan

# Stop the backend server
if ($backendProcess -and -not $backendProcess.HasExited) {
    Write-Host "Stopping backend server..."
    Stop-Process -Id $backendProcess.Id -Force
}

# Stop the frontend server
if ($frontendProcess -and -not $frontendProcess.HasExited) {
    Write-Host "Stopping frontend server..."
    Stop-Process -Id $frontendProcess.Id -Force
}

Write-Host "Testing completed!" -ForegroundColor Cyan
