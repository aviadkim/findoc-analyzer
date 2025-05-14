# Deploy FinDoc Analyzer to Google Cloud

# Set variables
$PROJECT_ID = "findoc-deploy"
$REGION = "europe-west3"
$SERVICE_NAME = "findoc-analyzer"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Build the Docker image
Write-Host "Building Docker image..."
docker build -t $IMAGE_NAME .

# Push the image to Google Container Registry
Write-Host "Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Google Cloud Run
Write-Host "Deploying to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 2Gi `
  --cpu 2 `
  --set-env-vars="NODE_ENV=production,UPLOAD_FOLDER=/app/uploads,TEMP_FOLDER=/app/temp,RESULTS_FOLDER=/app/results,PYTHONPATH=/usr/local/lib/python3/site-packages" `
  --update-secrets="DEEPSEEK_API_KEY=deepseek-api-key:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_KEY=supabase-key:latest,SUPABASE_SERVICE_KEY=supabase-service-key:latest"

Write-Host "Deployment completed!"
Write-Host "Your application is available at: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')"
