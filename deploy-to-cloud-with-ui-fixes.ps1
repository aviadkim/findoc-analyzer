# Deploy to Google Cloud Run with UI Fixes
Write-Host "===================================================
Deploying FinDoc Analyzer with UI Fixes to Google Cloud Run
==================================================="

# Step 1: Inject UI fixes into Docker container
Write-Host "Step 1: Injecting UI fixes into Docker container..."
node scripts/inject-ui-components.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error injecting UI fixes into Docker container. Exiting." -ForegroundColor Red
    exit 1
}

# Step 2: Tag the Docker image for Google Cloud
Write-Host "Step 2: Tagging Docker image for Google Cloud..."
$projectId = "findoc-deploy"
$imageName = "findoc-analyzer-ui-fixed"
$imageTag = Get-Date -Format "yyyyMMdd-HHmmss"
$fullImageName = "gcr.io/${projectId}/${imageName}:${imageTag}"

docker tag findoc-app-container-new $fullImageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error tagging Docker image. Exiting." -ForegroundColor Red
    exit 1
}

# Step 3: Push the Docker image to Google Container Registry
Write-Host "Step 3: Pushing Docker image to Google Container Registry..."
docker push $fullImageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error pushing Docker image to Google Container Registry. Exiting." -ForegroundColor Red
    exit 1
}

# Step 4: Deploy to Google Cloud Run
Write-Host "Step 4: Deploying to Google Cloud Run..."
gcloud run deploy findoc-analyzer-ui-fixed `
    --image $fullImageName `
    --platform managed `
    --region europe-west3 `
    --allow-unauthenticated `
    --memory 1Gi `
    --cpu 1 `
    --port 8080 `
    --project $projectId

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error deploying to Google Cloud Run. Exiting." -ForegroundColor Red
    exit 1
}

# Step 5: Get the deployed URL
Write-Host "Step 5: Getting deployed URL..."
$deployedUrl = gcloud run services describe findoc-analyzer-ui-fixed --platform managed --region europe-west3 --project $projectId --format="value(status.url)"

# Step 6: Run UI tests against the deployed URL
Write-Host "Step 6: Running UI tests against the deployed URL..."
$env:TEST_URL = $deployedUrl
node tests/cloud-ui-check.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: UI tests failed against the deployed URL." -ForegroundColor Yellow
}

# Deployment complete
Write-Host "===================================================
Deployment Complete!
==================================================="
Write-Host "The FinDoc Analyzer with UI fixes is now deployed to Google Cloud Run."
Write-Host "URL: $deployedUrl"
Write-Host ""
Write-Host "To verify the UI fixes, visit the deployed application and check that all UI components are present."
Write-Host ""
Write-Host "To run UI tests against the deployed URL, run:"
Write-Host "TEST_URL=$deployedUrl node tests/cloud-ui-check.js"
