# Run FinDoc Analyzer Enhanced Edition
# This script starts the enhanced version of the FinDoc Analyzer application

Write-Host "Starting FinDoc Analyzer Enhanced Edition..." -ForegroundColor Cyan

# Set environment variables
$env:GEMINI_API_KEY = "AIzaSyDhbGC0_7BEbGRVBujzDPZC9TYWjBJCIf4"
$env:PORT = 8080
$env:NODE_ENV = "development"
$env:SUPABASE_URL = "https://dnjnsotemnfrjlotgved.supabase.co"
$env:SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuam5zb3RlbW5mcmpsb3RndmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0MzQ4NjcsImV4cCI6MTk5ODAxMDg2N30.t2oGhMPXxeY9jrQq5E7VDfGt2Vf_AgeStBjQfqfcBjY"

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

# Run the enhanced server
Write-Host "Starting enhanced server..." -ForegroundColor Green
node run-enhanced.js

Write-Host "Server has been stopped." -ForegroundColor Yellow
