# Simplified Google Cloud Setup Script
# This script sets up Google Cloud configuration with minimal user input

# Set error action preference
$ErrorActionPreference = "Stop"

# Create a secure directory for credentials
$credentialsDir = Join-Path $PSScriptRoot ".credentials"
if (-not (Test-Path -Path $credentialsDir)) {
    New-Item -ItemType Directory -Path $credentialsDir | Out-Null
    Write-Host "Created directory: $credentialsDir"
}

# Path to service account key file
$serviceAccountKeyPath = Join-Path $credentialsDir "service-account-key.json"

# Create a template service account key file
$templateKeyContent = @"
{
  "type": "service_account",
  "project_id": "findoc-analyzer",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "YOUR_PRIVATE_KEY",
  "client_email": "findoc-deployer@findoc-analyzer.iam.gserviceaccount.com",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "YOUR_CERT_URL",
  "universe_domain": "googleapis.com"
}
"@

# Write the template key file
Set-Content -Path $serviceAccountKeyPath -Value $templateKeyContent
Write-Host "Created template service account key at: $serviceAccountKeyPath"
Write-Host "IMPORTANT: Replace this template with your actual service account key!"

# Path to .env file
$envFilePath = Join-Path $PSScriptRoot ".env"

# Create .env file
$envContent = @"
# Google Cloud configuration
GOOGLE_PROJECT_ID=findoc-analyzer
GOOGLE_APPLICATION_CREDENTIALS=$serviceAccountKeyPath

# API keys
GEMINI_API_KEY=your-gemini-api-key

# Other configuration
STORAGE_BUCKET=findoc-analyzer-documents
"@

Set-Content -Path $envFilePath -Value $envContent
Write-Host "Created .env file at: $envFilePath"
Write-Host "IMPORTANT: Update the .env file with your actual values!"

# Display success message
Write-Host ""
Write-Host "Google Cloud configuration template created successfully!"
Write-Host "You need to:"
Write-Host "1. Replace the template service account key with your actual key"
Write-Host "2. Update the .env file with your actual values"
Write-Host ""
Write-Host "IMPORTANT: Never commit the .credentials directory or .env file to Git!"
Write-Host "           They are already in .gitignore, but always double-check."
Write-Host ""
Write-Host "To deploy to Google Cloud, run: .\deploy-to-gcloud.ps1"
