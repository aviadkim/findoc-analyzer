# Test FinDoc Analyzer Enhanced Edition
# This script tests the enhanced API endpoints

Write-Host "Starting FinDoc Analyzer Enhanced API Test..." -ForegroundColor Cyan

# Set environment variables
$env:GEMINI_API_KEY = "AIzaSyDhbGC0_7BEbGRVBujzDPZC9TYWjBJCIf4"
$env:PORT = 8080
$env:NODE_ENV = "development"
$env:SUPABASE_URL = "https://dnjnsotemnfrjlotgved.supabase.co"
$env:SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam5zb3RlbW5mcmpsb3RndmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0MzQ4NjcsImV4cCI6MTk5ODAxMDg2N30.t2oGhMPXxeY9jrQq5E7VDfGt2Vf_AgeStBjQfqfcBjY"

# Check if server is running
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "Server is already running" -ForegroundColor Green
    }
} catch {
    Write-Host "Server is not running, starting server..." -ForegroundColor Yellow
}

# Start server if not running
$serverProcess = $null
if (-not $serverRunning) {
    # Create necessary directories
    if (-not (Test-Path -Path "uploads")) {
        New-Item -ItemType Directory -Path "uploads" | Out-Null
        Write-Host "Created uploads directory" -ForegroundColor Green
    }
    if (-not (Test-Path -Path "temp")) {
        New-Item -ItemType Directory -Path "temp" | Out-Null
        Write-Host "Created temp directory" -ForegroundColor Green
    }
    if (-not (Test-Path -Path "results")) {
        New-Item -ItemType Directory -Path "results" | Out-Null
        Write-Host "Created results directory" -ForegroundColor Green
    }
    if (-not (Test-Path -Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
        Write-Host "Created logs directory" -ForegroundColor Green
    }

    # Start server in background
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "run-enhanced.js" -NoNewWindow -PassThru -RedirectStandardOutput "logs\enhanced-server.log" -RedirectStandardError "logs\enhanced-server-error.log"
    
    # Wait for server to start
    Write-Host "Waiting for server to start..." -ForegroundColor Yellow
    $ready = $false
    $tries = 0
    $maxTries = 30
    
    while (-not $ready -and $tries -lt $maxTries) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET -TimeoutSec 1
            if ($response.StatusCode -eq 200) {
                $ready = $true
                Write-Host "Server started successfully" -ForegroundColor Green
            }
        } catch {
            $tries++
            Start-Sleep -Seconds 1
        }
    }
    
    if (-not $ready) {
        Write-Host "Server failed to start within timeout period" -ForegroundColor Red
        if ($serverProcess -ne $null) {
            Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
        }
        exit 1
    }
}

# Run the test script
Write-Host "Running API tests..." -ForegroundColor Green
node test-enhanced-api.js

# If we started the server, stop it
if ($serverProcess -ne $null) {
    Write-Host "Stopping server..." -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Server stopped" -ForegroundColor Green
}

Write-Host "Test completed" -ForegroundColor Cyan
