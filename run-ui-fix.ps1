# FinDoc Analyzer UI Fix PowerShell Script
Write-Host "FinDoc Analyzer UI Fix" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Create directories if they don't exist
if (-not (Test-Path "tests\results")) {
    New-Item -ItemType Directory -Path "tests\results" | Out-Null
    Write-Host "Created tests\results directory." -ForegroundColor Cyan
}

# Run the UI test
Write-Host "`n=== Running UI Test ===" -ForegroundColor Green
try {
    & node "tests\simple-ui-test.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "UI test completed successfully." -ForegroundColor Green
    } else {
        Write-Host "UI test failed with exit code $LASTEXITCODE." -ForegroundColor Red
    }
} catch {
    Write-Host "Error running UI test: $_" -ForegroundColor Red
}

# Add UI fix script to HTML pages
Write-Host "`n=== Adding UI Fix Script to HTML Pages ===" -ForegroundColor Green
try {
    & node "scripts\add-ui-fix.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "UI fix script added successfully." -ForegroundColor Green
    } else {
        Write-Host "Adding UI fix script failed with exit code $LASTEXITCODE." -ForegroundColor Red
    }
} catch {
    Write-Host "Error adding UI fix script: $_" -ForegroundColor Red
}

# Open the test report
Write-Host "`n=== Opening Test Report ===" -ForegroundColor Green
$reportPath = "tests\results\ui-test-report.html"
if (Test-Path $reportPath) {
    Start-Process $reportPath
    Write-Host "Test report opened." -ForegroundColor Green
} else {
    Write-Host "Test report not found at $reportPath" -ForegroundColor Red
}

Write-Host "`nUI Fix completed. Check the test report for details." -ForegroundColor Green
