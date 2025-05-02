# Run Phase 1 test

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

# Run the Phase 1 test
Write-Host "Running Phase 1 test..."
& $pythonPath "test_phase1.py" $pdfPath --output-dir $outputDir

Write-Host "Phase 1 test completed."
