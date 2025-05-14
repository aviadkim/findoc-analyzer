# Deploy FinDoc Analyzer with UI Fixes to Google Cloud Run

Write-Host "===================================================
Deploying FinDoc Analyzer with UI Fixes to Google Cloud Run
===================================================" -ForegroundColor Green

# Set variables
$PROJECT_ID = "findoc-deploy"  # Replace with your Google Cloud project ID
$IMAGE_NAME = "gcr.io/$PROJECT_ID/backv2-app-ui-fixed"
$SERVICE_NAME = "backv2-app-ui-fixed"
$REGION = "me-west1"  # Replace with your preferred region

# Step 0: Inject UI fixes into HTML files
Write-Host "Step 0: Injecting UI fixes into HTML files..." -ForegroundColor Cyan
node inject-ui-fixes.js

# Step 1: Build the Docker image
Write-Host "Step 1: Building Docker image..." -ForegroundColor Cyan
docker build -t $IMAGE_NAME .

# Step 2: Configure Docker to use Google Cloud credentials
Write-Host "Step 2: Configuring Docker to use Google Cloud credentials..." -ForegroundColor Cyan
gcloud auth configure-docker

# Step 3: Push the Docker image to Google Container Registry
Write-Host "Step 3: Pushing Docker image to Google Container Registry..." -ForegroundColor Cyan
docker push $IMAGE_NAME

# Step 4: Deploy to Google Cloud Run
Write-Host "Step 4: Deploying to Google Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 2Gi `
  --cpu 2 `
  --set-env-vars="NODE_ENV=production,UPLOAD_FOLDER=/app/uploads,TEMP_FOLDER=/app/temp,RESULTS_FOLDER=/app/results,PYTHONPATH=/usr/local/lib/python3/site-packages" `
  --update-secrets="DEEPSEEK_API_KEY=deepseek-api-key:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_KEY=supabase-key:latest,SUPABASE_SERVICE_KEY=supabase-service-key:latest"

# Step 5: Get the URL of the deployed application
Write-Host "Step 5: Getting the URL of the deployed application..." -ForegroundColor Cyan
$url = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
Write-Host "Application deployed successfully!" -ForegroundColor Green
Write-Host "You can access the application at: $url" -ForegroundColor Green

# Step 6: Open the application in the default browser
Write-Host "Step 6: Opening the application in the default browser..." -ForegroundColor Cyan
Start-Process $url

# Step 7: Run validation tests against the deployed application
Write-Host "Step 7: Running validation tests against the deployed application..." -ForegroundColor Cyan
$env:DEPLOYED_URL = $url
node test-deployed-ui-validation.js

Write-Host "===================================================
Deployment Complete!
===================================================" -ForegroundColor Green
