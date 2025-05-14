# Deploy to Google Cloud Run with Fixed Implementation

# Set variables
$PROJECT_ID = "findoc-deploy"
$SERVICE_NAME = "backv2-app"
$REGION = "me-west1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Install dependencies
Write-Host "Installing dependencies..."
npm install express-fileupload

# Create necessary directories
Write-Host "Creating necessary directories..."
mkdir -p uploads temp results mock-data mock-secrets

# Build the Docker image
Write-Host "Building Docker image..."
docker build -t $IMAGE_NAME .

# Push the Docker image to Google Container Registry
Write-Host "Pushing Docker image to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Google Cloud Run
Write-Host "Deploying to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 1Gi `
  --cpu 1 `
  --timeout 300s `
  --concurrency 80

Write-Host "Deployment completed!"
Write-Host "Testing the deployed application..."

# Wait for the deployment to complete
Start-Sleep -Seconds 30

# Get the URL of the deployed application
$URL = gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"

Write-Host "Application deployed at: $URL"

# Run the test script
Write-Host "Running tests against the deployed application..."
$env:BASE_URL = $URL
node test-deployed-app-comprehensive.js

Write-Host "All done!"
