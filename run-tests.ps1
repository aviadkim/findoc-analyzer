# Run Tests PowerShell Script
Write-Host "Running FinDoc Analyzer Tests..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if required directories exist
if (-not (Test-Path "tests")) {
    Write-Host "Error: tests directory not found." -ForegroundColor Red
    exit 1
}

# Create results directory if it doesn't exist
if (-not (Test-Path "tests\results")) {
    New-Item -ItemType Directory -Path "tests\results" | Out-Null
    Write-Host "Created tests\results directory." -ForegroundColor Cyan
}

# Create screenshots directory if it doesn't exist
if (-not (Test-Path "tests\screenshots")) {
    New-Item -ItemType Directory -Path "tests\screenshots" | Out-Null
    Write-Host "Created tests\screenshots directory." -ForegroundColor Cyan
}

# Function to run a test and check its result
function Run-Test {
    param (
        [string]$TestName,
        [string]$TestScript
    )
    
    Write-Host "`n=== Running $TestName Tests ===" -ForegroundColor Green
    
    try {
        & node $TestScript
        if ($LASTEXITCODE -eq 0) {
            Write-Host "$TestName tests completed successfully." -ForegroundColor Green
            return $true
        } else {
            Write-Host "$TestName tests failed with exit code $LASTEXITCODE." -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "Error running $TestName tests: $_" -ForegroundColor Red
        return $false
    }
}

# Run the tests
$basicUiSuccess = Run-Test "Basic UI" "tests\basic-ui-test.js"
$documentUploadSuccess = Run-Test "Document Upload" "tests\document-upload-test.js"
$documentChatSuccess = Run-Test "Document Chat" "tests\document-chat-test.js"

# Run all tests and generate combined report
Write-Host "`n=== Running All Tests and Generating Combined Report ===" -ForegroundColor Green
try {
    & node "tests\run-all-tests.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Combined tests completed successfully." -ForegroundColor Green
    } else {
        Write-Host "Combined tests failed with exit code $LASTEXITCODE." -ForegroundColor Red
    }
} catch {
    Write-Host "Error running combined tests: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Green
Write-Host "Basic UI Tests: $(if ($basicUiSuccess) { "Passed" } else { "Failed" })" -ForegroundColor $(if ($basicUiSuccess) { "Green" } else { "Red" })
Write-Host "Document Upload Tests: $(if ($documentUploadSuccess) { "Passed" } else { "Failed" })" -ForegroundColor $(if ($documentUploadSuccess) { "Green" } else { "Red" })
Write-Host "Document Chat Tests: $(if ($documentChatSuccess) { "Passed" } else { "Failed" })" -ForegroundColor $(if ($documentChatSuccess) { "Green" } else { "Red" })

Write-Host "`nTests completed. Check the results in the tests\results directory." -ForegroundColor Cyan

# Open the combined report if it exists
$reportPath = "tests\results\combined-test-report.html"
if (Test-Path $reportPath) {
    Write-Host "Opening combined test report..." -ForegroundColor Cyan
    Start-Process $reportPath
}
