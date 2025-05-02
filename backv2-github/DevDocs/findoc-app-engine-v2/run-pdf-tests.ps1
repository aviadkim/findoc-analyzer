# PDF Processing Tests Script

Write-Host "FinDoc Analyzer - PDF Processing Tests" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Create test directories if they don't exist
if (-not (Test-Path "test_pdfs")) {
    New-Item -ItemType Directory -Path "test_pdfs" | Out-Null
    Write-Host "Created test_pdfs directory" -ForegroundColor Green
}

if (-not (Test-Path "test_results")) {
    New-Item -ItemType Directory -Path "test_results" | Out-Null
    Write-Host "Created test_results directory" -ForegroundColor Green
}

# Step 1: Generate test PDFs
Write-Host "`nStep 1: Generating test PDFs..." -ForegroundColor Cyan
try {
    node generate-test-pdfs.js
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to generate test PDFs"
    }
    Write-Host "Test PDFs generated successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error: Failed to generate test PDFs." -ForegroundColor Red
    Write-Host "Error details: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Run the tests
Write-Host "`nStep 2: Running tests..." -ForegroundColor Cyan
try {
    node run-tests.js
    if ($LASTEXITCODE -ne 0) {
        throw "Tests failed"
    }
    Write-Host "Tests completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error: Tests failed." -ForegroundColor Red
    Write-Host "Error details: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Generate HTML report
Write-Host "`nStep 3: Generating HTML report..." -ForegroundColor Cyan
try {
    node generate-html-report.js
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to generate HTML report"
    }
    Write-Host "HTML report generated successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error: Failed to generate HTML report." -ForegroundColor Red
    Write-Host "Error details: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Open the report in the browser
Write-Host "`nStep 4: Opening report in browser..." -ForegroundColor Cyan
try {
    Start-Process "test_results/report.html"
    Write-Host "Report opened in browser!" -ForegroundColor Green
}
catch {
    Write-Host "Error: Failed to open report in browser." -ForegroundColor Red
    Write-Host "Error details: $_" -ForegroundColor Red
    Write-Host "You can manually open the report at: test_results/report.html" -ForegroundColor Yellow
}

Write-Host "`nAll tests completed!" -ForegroundColor Green
Write-Host "Results are available in the test_results directory." -ForegroundColor Cyan
