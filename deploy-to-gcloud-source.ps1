# Deploy FinDoc Analyzer to Google Cloud using source code

# Set variables
$PROJECT_ID = "findoc-deploy"
$REGION = "europe-west3"
$SERVICE_NAME = "findoc-analyzer"

# Deploy to Google Cloud Run
Write-Host "Deploying to Google Cloud Run from source code..."
gcloud run deploy $SERVICE_NAME `
  --source . `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 2Gi `
  --cpu 2 `
  --set-env-vars="NODE_ENV=production,UPLOAD_FOLDER=/app/uploads,TEMP_FOLDER=/app/temp,RESULTS_FOLDER=/app/results,PYTHONPATH=/usr/local/lib/python3/site-packages" `
  --update-secrets="DEEPSEEK_API_KEY=deepseek-api-key:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_KEY=supabase-key:latest,SUPABASE_SERVICE_KEY=supabase-service-key:latest"

Write-Host "Deployment completed!"
Write-Host "Your application is available at: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')"
