# PowerShell script to run the grid-based securities extraction test

# Set the paths
$scriptPath = $PSScriptRoot
$testScript = Join-Path -Path $scriptPath -ChildPath "test_grid_extraction.py"

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
Write-Host "  Testing Grid-Based Securities Extraction" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This test demonstrates the grid-based securities extraction capabilities" -ForegroundColor Yellow
Write-Host "using the GridAnalyzer and SecurityExtractor." -ForegroundColor Yellow
Write-Host ""
Write-Host "PDF file: $messosPdf" -ForegroundColor Green
Write-Host ""

# Run the test
Write-Host "Running test..." -ForegroundColor Cyan
python $testScript --pdf $messosPdf

# Check if the test was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Test completed successfully!" -ForegroundColor Green
    
    # Check if results were generated
    $gridResultsPath = "$($messosPdf -replace '\.pdf$', '')_grid_analysis.json"
    $extractorResultsPath = "$($messosPdf -replace '\.pdf$', '')_enhanced_extraction.json"
    
    if (Test-Path -Path $gridResultsPath) {
        Write-Host ""
        Write-Host "Grid analysis results saved to:" -ForegroundColor Green
        Write-Host $gridResultsPath -ForegroundColor Yellow
    }
    
    if (Test-Path -Path $extractorResultsPath) {
        Write-Host ""
        Write-Host "Security extractor results saved to:" -ForegroundColor Green
        Write-Host $extractorResultsPath -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Test failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
