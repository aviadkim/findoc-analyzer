# Deploy UI Components to Google Cloud Run
Write-Host "Deploying UI Components to Google Cloud Run..." -ForegroundColor Green

# Set variables
$PROJECT_ID = "findoc-deploy"
$REGION = "me-west1"
$SERVICE_NAME = "backv2-app"
$IMAGE_TAG = "ui-fixed-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME`:$IMAGE_TAG"

# Step 1: Build Docker image with UI components
Write-Host "Step 1: Building Docker image with UI components..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Build Docker image
Write-Host "Building Docker image: $IMAGE_NAME" -ForegroundColor Cyan
docker build -t $IMAGE_NAME .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building Docker image. Exiting." -ForegroundColor Red
    exit 1
}

# Step 2: Configure Docker for Google Cloud
Write-Host "Step 2: Configuring Docker for Google Cloud..." -ForegroundColor Cyan
gcloud auth configure-docker

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error configuring Docker for Google Cloud. Exiting." -ForegroundColor Red
    exit 1
}

# Step 3: Push Docker image to Google Container Registry
Write-Host "Step 3: Pushing Docker image to Google Container Registry..." -ForegroundColor Cyan
docker push $IMAGE_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error pushing Docker image to Google Container Registry. Exiting." -ForegroundColor Red
    exit 1
}

# Step 4: Deploy to Google Cloud Run
Write-Host "Step 4: Deploying to Google Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --memory 1Gi `
    --cpu 1 `
    --port 8080

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error deploying to Google Cloud Run. Exiting." -ForegroundColor Red
    exit 1
}

# Step 5: Get the deployed URL
Write-Host "Step 5: Getting deployed URL..." -ForegroundColor Cyan
$deployedUrl = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format="value(status.url)"
Write-Host "Deployed URL: $deployedUrl" -ForegroundColor Green

# Step 6: Run tests against the deployed URL
Write-Host "Step 6: Running tests against the deployed URL..." -ForegroundColor Cyan
$env:TEST_URL = $deployedUrl

# Run dashboard test
Write-Host "Running dashboard test..." -ForegroundColor Cyan
node tasks/testing/test-dashboard.js

# Run documents test
Write-Host "Running documents test..." -ForegroundColor Cyan
node tasks/testing/test-documents.js

Write-Host "Deployment and testing completed." -ForegroundColor Green
