# Run the grid analyzer test

# Set the path to the Python executable
$pythonPath = "python"

# Set the path to the test script
$testScript = "test_grid_analyzer.py"

# Set the path to the PDF file
$pdfPath = "src/uploads/1ca9a290_messos.pdf"

# Set the output directory
$outputDir = "src/uploads"

# Run the test script
Write-Host "Running grid analyzer test..."
& $pythonPath $testScript $pdfPath --output-dir $outputDir --debug

Write-Host "Grid analyzer test completed."
