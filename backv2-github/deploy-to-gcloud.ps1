Write-Host "===================================================
Deploying FinDoc Analyzer to Google Cloud Run
==================================================="

# Set variables
$PROJECT_ID = "findoc-analyzer"  # Replace with your Google Cloud project ID
$BACKEND_IMAGE = "gcr.io/$PROJECT_ID/findoc-backend"
$FRONTEND_IMAGE = "gcr.io/$PROJECT_ID/findoc-frontend"
$BACKEND_SERVICE = "findoc-backend"
$FRONTEND_SERVICE = "findoc-frontend"
$REGION = "us-central1"  # Replace with your preferred region

# Configure Docker to use Google Cloud credentials
Write-Host "Configuring Docker to use Google Cloud credentials..."
gcloud auth configure-docker

# Build and push backend image
Write-Host "Building and pushing backend image..."
docker build -t $BACKEND_IMAGE -f Dockerfile.backend .
docker push $BACKEND_IMAGE

# Build and push frontend image
Write-Host "Building and pushing frontend image..."
docker build -t $FRONTEND_IMAGE -f Dockerfile.frontend .
docker push $FRONTEND_IMAGE

# Deploy backend to Cloud Run
Write-Host "Deploying backend to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE `
    --image $BACKEND_IMAGE `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --memory 1Gi `
    --set-env-vars "GEMINI_API_KEY=$env:GEMINI_API_KEY"

# Get backend URL
$BACKEND_URL = gcloud run services describe $BACKEND_SERVICE --platform managed --region $REGION --format 'value(status.url)'

# Deploy frontend to Cloud Run
Write-Host "Deploying frontend to Cloud Run..."
gcloud run deploy $FRONTEND_SERVICE `
    --image $FRONTEND_IMAGE `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --memory 512Mi `
    --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL"

# Get frontend URL
$FRONTEND_URL = gcloud run services describe $FRONTEND_SERVICE --platform managed --region $REGION --format 'value(status.url)'

Write-Host "
===================================================
Deployment Complete!
===================================================

Your FinDoc Analyzer is now deployed to Google Cloud Run:

- Frontend: $FRONTEND_URL
- Backend API: $BACKEND_URL

Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
