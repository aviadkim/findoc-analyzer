# FinDoc Analyzer - Run Tenant Tests
# This script runs the tenant API key tests for the FinDoc Analyzer application.

# Set environment variables
$env:GOOGLE_CLOUD_PROJECT = "findoc-deploy"
$env:SUPABASE_URL = "https://dnjnsotemnfrjlotgved.supabase.co"

# Check if API keys are set
if (-not $env:SUPABASE_SERVICE_KEY) {
    Write-Host "Warning: SUPABASE_SERVICE_KEY environment variable not set"
    Write-Host "Using mock API keys"
}

if (-not $env:OPENROUTER_PROVISIONING_KEY) {
    Write-Host "Warning: OPENROUTER_PROVISIONING_KEY environment variable not set"
    Write-Host "Using mock API keys"
}

if (-not $env:HUGGINGFACE_MASTER_TOKEN) {
    Write-Host "Warning: HUGGINGFACE_MASTER_TOKEN environment variable not set"
    Write-Host "Using mock API keys"
}

if (-not $env:GOOGLE_AI_MASTER_KEY) {
    Write-Host "Warning: GOOGLE_AI_MASTER_KEY environment variable not set"
    Write-Host "Using mock API keys"
}

# Run the tests
Write-Host "Running FinDoc Analyzer tenant API key tests..."
node test-tenant-api-keys.js

# Open the test report
if (Test-Path "test-tenant-api-keys-results\test-report.html") {
    Write-Host "Opening test report..."
    Start-Process "test-tenant-api-keys-results\test-report.html"
}
