Write-Host "===================================================
Starting FinDoc Analyzer with FinDocRAG (Simple)
==================================================="

# Start the FinDocRAG backend in a new window
Write-Host "Starting FinDocRAG backend..."
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File .\run-findoc-rag-simple.ps1"

# Wait for the backend to start
Write-Host "Waiting for backend to start..."
Start-Sleep -Seconds 5

# Start the FinDoc Analyzer frontend
Write-Host "Starting FinDoc Analyzer frontend..."
powershell -ExecutionPolicy Bypass -File .\run-findoc-simple.ps1
