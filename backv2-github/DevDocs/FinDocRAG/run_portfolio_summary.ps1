# Run the portfolio summary extractor

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

# Set the output file path
$outputPath = Join-Path -Path $outputDir -ChildPath "portfolio_summary.json"

# Run the portfolio summary extractor
Write-Host "Extracting portfolio summary..."
& $pythonPath "portfolio_summary_extractor.py" $pdfPath --output $outputPath --debug

Write-Host "Portfolio summary extraction completed."
