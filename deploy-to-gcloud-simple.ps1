# Simplified Google Cloud Deployment Script
# This script guides you through deploying to Google Cloud

# Set error action preference
$ErrorActionPreference = "Stop"

# Load environment variables from .env file
$envFilePath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFilePath) {
    Get-Content $envFilePath | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "Loaded environment variable: $key"
        }
    }
}

# Check for required environment variables
$requiredVars = @("GOOGLE_PROJECT_ID", "GOOGLE_APPLICATION_CREDENTIALS", "GEMINI_API_KEY")
$missingVars = @()
foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "Error: The following required environment variables are not set:"
    foreach ($var in $missingVars) {
        Write-Host "  - $var"
    }
    Write-Host "Please update your .env file and try again."
    exit 1
}

# Set variables
$PROJECT_ID = $env:GOOGLE_PROJECT_ID
$BACKEND_SERVICE = "findoc-backend"
$FRONTEND_SERVICE = "findoc-frontend"
$AGENT_SERVICE = "findoc-agent"
$REGION = "us-central1"

# Display deployment instructions
Write-Host "====================================================="
Write-Host "Google Cloud Deployment Instructions"
Write-Host "====================================================="
Write-Host ""
Write-Host "Since the Google Cloud SDK is not installed, here are the steps to deploy manually:"
Write-Host ""
Write-Host "1. Install the Google Cloud SDK:"
Write-Host "   - Run the install-gcloud-sdk.ps1 script"
Write-Host "   - Follow the installation wizard"
Write-Host "   - Restart your terminal"
Write-Host ""
Write-Host "2. Authenticate with Google Cloud:"
Write-Host "   gcloud auth login"
Write-Host ""
Write-Host "3. Set your project:"
Write-Host "   gcloud config set project $PROJECT_ID"
Write-Host ""
Write-Host "4. Enable required APIs:"
Write-Host "   gcloud services enable run.googleapis.com"
Write-Host "   gcloud services enable containerregistry.googleapis.com"
Write-Host "   gcloud services enable cloudbuild.googleapis.com"
Write-Host "   gcloud services enable storage.googleapis.com"
Write-Host ""
Write-Host "5. Create a Cloud Storage bucket:"
Write-Host "   gcloud storage buckets create gs://$PROJECT_ID-documents --location=$REGION"
Write-Host ""
Write-Host "6. Build and push Docker images:"
Write-Host "   docker build -t gcr.io/$PROJECT_ID/findoc-backend -f Dockerfile.backend ."
Write-Host "   docker push gcr.io/$PROJECT_ID/findoc-backend"
Write-Host ""
Write-Host "   docker build -t gcr.io/$PROJECT_ID/findoc-frontend -f Dockerfile.frontend ."
Write-Host "   docker push gcr.io/$PROJECT_ID/findoc-frontend"
Write-Host ""
Write-Host "   docker build -t gcr.io/$PROJECT_ID/findoc-agent -f Dockerfile.agent ."
Write-Host "   docker push gcr.io/$PROJECT_ID/findoc-agent"
Write-Host ""
Write-Host "7. Deploy backend to Cloud Run:"
Write-Host "   gcloud run deploy $BACKEND_SERVICE \"
Write-Host "       --image gcr.io/$PROJECT_ID/findoc-backend \"
Write-Host "       --platform managed \"
Write-Host "       --region $REGION \"
Write-Host "       --allow-unauthenticated \"
Write-Host "       --memory 2Gi \"
Write-Host "       --cpu 1 \"
Write-Host "       --timeout 300s \"
Write-Host "       --set-env-vars \"GEMINI_API_KEY=$env:GEMINI_API_KEY,STORAGE_BUCKET=$PROJECT_ID-documents\""
Write-Host ""
Write-Host "8. Get the backend URL:"
Write-Host "   $BACKEND_URL = gcloud run services describe $BACKEND_SERVICE --platform managed --region $REGION --format 'value(status.url)'"
Write-Host ""
Write-Host "9. Deploy agent service to Cloud Run:"
Write-Host "   gcloud run deploy $AGENT_SERVICE \"
Write-Host "       --image gcr.io/$PROJECT_ID/findoc-agent \"
Write-Host "       --platform managed \"
Write-Host "       --region $REGION \"
Write-Host "       --no-allow-unauthenticated \"
Write-Host "       --memory 2Gi \"
Write-Host "       --cpu 1 \"
Write-Host "       --timeout 600s \"
Write-Host "       --set-env-vars \"GEMINI_API_KEY=$env:GEMINI_API_KEY,STORAGE_BUCKET=$PROJECT_ID-documents,BACKEND_URL=\$BACKEND_URL\""
Write-Host ""
Write-Host "10. Deploy frontend to Cloud Run:"
Write-Host "    gcloud run deploy $FRONTEND_SERVICE \"
Write-Host "        --image gcr.io/$PROJECT_ID/findoc-frontend \"
Write-Host "        --platform managed \"
Write-Host "        --region $REGION \"
Write-Host "        --allow-unauthenticated \"
Write-Host "        --memory 1Gi \"
Write-Host "        --set-env-vars \"NEXT_PUBLIC_API_URL=\$BACKEND_URL\""
Write-Host ""
Write-Host "11. Get the frontend URL:"
Write-Host "    $FRONTEND_URL = gcloud run services describe $FRONTEND_SERVICE --platform managed --region $REGION --format 'value(status.url)'"
Write-Host ""
Write-Host "12. Configure service-to-service authentication:"
Write-Host "    $AGENT_SERVICE_ACCOUNT = gcloud run services describe $AGENT_SERVICE --platform managed --region $REGION --format 'value(spec.template.spec.serviceAccountName)'"
Write-Host "    gcloud run services add-iam-policy-binding $BACKEND_SERVICE \"
Write-Host "        --platform managed \"
Write-Host "        --region $REGION \"
Write-Host "        --member=\"serviceAccount:\$AGENT_SERVICE_ACCOUNT\" \"
Write-Host "        --role=\"roles/run.invoker\""
Write-Host ""
Write-Host "After completing these steps, your application will be deployed to Google Cloud Run."
Write-Host "You can access it at the frontend URL provided in step 11."
Write-Host ""
Write-Host "Would you like to install the Google Cloud SDK now? (y/n)"
$installSdk = Read-Host
if ($installSdk -eq "y") {
    & .\install-gcloud-sdk.ps1
}
