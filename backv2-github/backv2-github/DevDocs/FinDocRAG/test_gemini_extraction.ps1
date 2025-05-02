# PowerShell script to test the enhanced securities extraction with Gemini API

# Set the Gemini API key
$env:GEMINI_API_KEY = "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"

# Set the paths
$scriptPath = $PSScriptRoot
$testScript = Join-Path -Path $scriptPath -ChildPath "test_gemini_extraction.py"

# Find the messos PDF
$uploadsDir = Join-Path -Path $scriptPath -ChildPath "src\uploads"
$messosPdf = $null

if (Test-Path -Path $uploadsDir) {
    $messosPdf = Get-ChildItem -Path $uploadsDir -Filter "*messos*.pdf" | Select-Object -First 1 -ExpandProperty FullName
}

if (-not $messosPdf) {
    $messosPdf = Get-ChildItem -Path $scriptPath -Filter "*messos*.pdf" | Select-Object -First 1 -ExpandProperty FullName
}

if (-not $messosPdf) {
    $messosPdf = Get-ChildItem -Path (Join-Path -Path $scriptPath -ChildPath "..") -Filter "*messos*.pdf" | Select-Object -First 1 -ExpandProperty FullName
}

if (-not $messosPdf) {
    Write-Error "Could not find messos PDF file"
    exit 1
}

# Display welcome message
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Testing Enhanced Securities Extraction" -ForegroundColor Cyan
Write-Host "  with Sequential Thinking and Gemini Pro" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This test demonstrates the enhanced securities extraction capabilities" -ForegroundColor Yellow
Write-Host "using sequential thinking and Gemini Pro." -ForegroundColor Yellow
Write-Host ""
Write-Host "PDF file: $messosPdf" -ForegroundColor Green
Write-Host ""

# Run the test
Write-Host "Running test..." -ForegroundColor Cyan
python $testScript --pdf $messosPdf --api-key $env:GEMINI_API_KEY

# Check if the test was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Test completed successfully!" -ForegroundColor Green
    
    # Check if results were generated
    $resultsPath = "$($messosPdf -replace '\.pdf$', '')_gemini_extraction.json"
    if (Test-Path -Path $resultsPath) {
        Write-Host ""
        Write-Host "Results saved to:" -ForegroundColor Green
        Write-Host $resultsPath -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Test failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
