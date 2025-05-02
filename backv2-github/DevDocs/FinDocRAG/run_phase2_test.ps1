# Run Phase 2 test

# Set the path to the Python executable
$pythonPath = "python"

# Set the path to the PDF file
$pdfPath = "src/uploads/1ca9a290_messos.pdf"

# Set the output directory
$outputDir = "src/reports"

# Create the output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Set USE_MOCK_API environment variable for testing without API keys
$env:USE_MOCK_API = "True"
Write-Host "Using mock API for testing without API keys."

# Run the Phase 2 test
Write-Host "Running Phase 2 test..."
& $pythonPath "test_phase2.py" $pdfPath --output-dir $outputDir --test all

Write-Host "Phase 2 test completed."
