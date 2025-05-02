# Run the layout analyzer test

Write-Host "===================================================="
Write-Host "  Testing Layout Analysis"
Write-Host "===================================================="
Write-Host ""
Write-Host "This test demonstrates the layout analysis capabilities"
Write-Host "using the LayoutAnalyzer."
Write-Host ""

# Find the messos PDF
$pdfPath = ""
if (Test-Path "messos.pdf") {
    $pdfPath = "messos.pdf"
} elseif (Test-Path "src\uploads") {
    $files = Get-ChildItem "src\uploads" -Filter "*messos*.pdf"
    if ($files.Count -gt 0) {
        $pdfPath = $files[0].FullName
    }
}

if ($pdfPath -eq "") {
    Write-Host "Could not find messos PDF file."
    exit 1
}

Write-Host "PDF file: $pdfPath"
Write-Host ""
Write-Host "Running test..."

# Run the test
python test_layout_analyzer.py --pdf $pdfPath

Write-Host ""
Write-Host "Test completed successfully!"
Write-Host ""
Write-Host "Layout analysis results saved to:"
Write-Host "$($pdfPath -replace '\.pdf$', '_layout_analysis.json')"
