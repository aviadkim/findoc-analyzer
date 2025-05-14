# Deploy Fixed Version to Google Cloud Run with Document Processing and Bloomberg Agent

# Set variables
$PROJECT_ID = "findoc-deploy"
$SERVICE_NAME = "backv2-app"
$REGION = "me-west1"

# Install dependencies
Write-Host "Installing dependencies..."
npm install express-fileupload@1.4.3
npm install pdfjs-dist@2.16.105
npm install axios@1.9.0

# Create necessary directories
Write-Host "Creating necessary directories..."
if (!(Test-Path -Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads"
}
if (!(Test-Path -Path "temp")) {
    New-Item -ItemType Directory -Path "temp"
}
if (!(Test-Path -Path "results")) {
    New-Item -ItemType Directory -Path "results"
}
if (!(Test-Path -Path "mock-data")) {
    New-Item -ItemType Directory -Path "mock-data"
}
if (!(Test-Path -Path "mock-secrets")) {
    New-Item -ItemType Directory -Path "mock-secrets"
}

# Create a test document for testing
Write-Host "Creating test document..."
$testDocContent = "This is a test document for FinDoc Analyzer.

It contains some sample text that can be processed by the document analyzer.

Here are some securities with ISINs:
- Apple Inc. (ISIN: US0378331005)
- Microsoft Corp. (ISIN: US5949181045)
- Amazon.com Inc. (ISIN: US0231351067)

This document was created on $(Get-Date -Format "yyyy-MM-dd")."

$testDocPath = "test-document.pdf"
Set-Content -Path $testDocPath -Value $testDocContent

# Submit the build to Google Cloud Build
Write-Host "Submitting build to Google Cloud Build..."
gcloud builds submit --project=$PROJECT_ID --config=cloudbuild.yaml

# Wait for the deployment to complete
Write-Host "Waiting for deployment to complete..."
Start-Sleep -Seconds 60

# Get the URL of the deployed application
$URL = gcloud run services describe $SERVICE_NAME --project=$PROJECT_ID --region $REGION --format="value(status.url)"

Write-Host "Application deployed at: $URL"

# Run the test script
Write-Host "Running tests against the deployed application..."
$env:BASE_URL = $URL
node test-deployed-app-comprehensive.js

Write-Host "All done!"
