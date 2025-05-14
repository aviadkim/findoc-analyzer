# FinDoc Analyzer Run Script with UI Validation
# This script runs the application with UI validation

Write-Host "Starting FinDoc Analyzer with UI validation..." -ForegroundColor Green

# Run the existing run script
& .\run-findoc-simple.ps1

Write-Host "FinDoc Analyzer is running at http://localhost:8080" -ForegroundColor Cyan
Write-Host "UI validation is enabled. Check the browser console for validation results." -ForegroundColor Yellow
