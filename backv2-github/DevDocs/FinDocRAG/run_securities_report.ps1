# Run the grid analyzer and generate a securities report

# Set the path to the Python executable
$pythonPath = "python"

# Set the path to the PDF file
$pdfPath = "src/uploads/1ca9a290_messos.pdf"

# Set the output directory for grid analysis
$gridOutputDir = "src/uploads"

# Set the output directory for the report
$reportOutputDir = "src/reports"

# Create the output directories if they don't exist
if (-not (Test-Path $gridOutputDir)) {
    New-Item -ItemType Directory -Path $gridOutputDir -Force | Out-Null
}

if (-not (Test-Path $reportOutputDir)) {
    New-Item -ItemType Directory -Path $reportOutputDir -Force | Out-Null
}

# Run the grid analyzer
Write-Host "Running grid analyzer..."
& $pythonPath "test_grid_analyzer.py" $pdfPath --output-dir $gridOutputDir --debug

# Get the securities JSON file
$securitiesPath = Join-Path -Path $gridOutputDir -ChildPath "1ca9a290_messos_securities.json"

# Generate the report
Write-Host "Generating securities report..."
& $pythonPath "generate_securities_report.py" $securitiesPath --output-dir $reportOutputDir --format "json"

Write-Host "Securities report generated."
