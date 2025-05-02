# Run the comprehensive report generator

# Set the path to the Python executable
$pythonPath = "python"

# Set the paths to the input files
$securitiesPath = "src/reports/securities_report.json"
$summaryPath = "src/reports/portfolio_summary.json"

# Set the output directory
$outputDir = "src/reports"

# Create the output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Run the comprehensive report generator
Write-Host "Generating comprehensive report..."
& $pythonPath "generate_comprehensive_report.py" $securitiesPath $summaryPath --output-dir $outputDir --format "json"

Write-Host "Comprehensive report generated."
