# Run FinDoc Analyzer with Scan1 functionality
# This script starts both the backend and frontend servers

Write-Host "Starting FinDoc Analyzer with Scan1 functionality..." -ForegroundColor Green

# Set environment variables
$env:GEMINI_API_KEY = "AIzaSyDhbGC0_7BEbGRVBujzDPZC9TYWjBJCIf4"
$env:PORT = 3002
$env:NODE_ENV = "development"
$env:SUPABASE_URL = "https://dnjnsotemnfrjlotgved.supabase.co"
$env:SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam5zb3RlbW5mcmpsb3RndmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0MzQ4NjcsImV4cCI6MTk5ODAxMDg2N30.t2oGhMPXxeY9jrQq5E7VDfGt2Vf_AgeStBjQfqfcBjY"

# Create a new directory for logs if it doesn't exist
if (-not (Test-Path -Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Start the backend server
Write-Host "Starting backend server..." -ForegroundColor Cyan
$backendPath = ".\backv2-github\DevDocs\findoc-app-engine-v2"
$backendProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backendPath -PassThru -RedirectStandardOutput "logs\backend.log" -RedirectStandardError "logs\backend-error.log" -NoNewWindow

# Wait for the backend to start
Start-Sleep -Seconds 3

# Start the frontend server
Write-Host "Starting frontend server..." -ForegroundColor Cyan
$frontendPath = ".\backv2-github\DevDocs\findoc-app-engine-v2\public"
$frontendProcess = Start-Process -FilePath "http-server" -ArgumentList "-p 3000" -WorkingDirectory $frontendPath -PassThru -RedirectStandardOutput "logs\frontend.log" -RedirectStandardError "logs\frontend-error.log" -NoNewWindow

# Open the application in the default browser
Start-Sleep -Seconds 2
Write-Host "Opening application in browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

# Display information
Write-Host ""
Write-Host "FinDoc Analyzer with Scan1 is running!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3002" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Red

# Wait for user to press Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Stop the processes when the script is interrupted
    if ($backendProcess -ne $null) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($frontendProcess -ne $null) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }

    Write-Host "Servers stopped." -ForegroundColor Green
}
