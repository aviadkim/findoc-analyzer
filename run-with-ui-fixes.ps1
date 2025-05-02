# FinDoc Analyzer Run Script with UI Fixes
# This script runs the application with the UI fixes

Write-Host "Starting FinDoc Analyzer with UI fixes..." -ForegroundColor Green

# Run the existing run script
& .\run-findoc-simple.ps1

Write-Host "FinDoc Analyzer is running at http://localhost:8080" -ForegroundColor Cyan
Write-Host "UI fixes have been applied. All 91 missing elements should now be present." -ForegroundColor Yellow
Write-Host "Check the browser console for validation results." -ForegroundColor Yellow
