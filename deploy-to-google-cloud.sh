#!/bin/bash

# Deploy FinDoc Analyzer to Google Cloud Run

# Set variables
PROJECT_ID="findoc-analyzer"
REGION="us-central1"
SERVICE_NAME="findoc-analyzer"
IMAGE_NAME="findoc-analyzer"

# Print setup info
echo "Deploying FinDoc Analyzer to Google Cloud Run"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service Name: $SERVICE_NAME"

# Build the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME .

# Tag the image for Google Container Registry
echo "Tagging image for Google Container Registry..."
docker tag $IMAGE_NAME gcr.io/$PROJECT_ID/$IMAGE_NAME

# Push the image to Google Container Registry
echo "Pushing image to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8081 \
  --set-env-vars="NODE_ENV=production,MCP_ENABLED=true,AUGMENT_ENABLED=true"

echo "Deployment completed!"
echo "Your application should be available at: https://$SERVICE_NAME-<hash>.$REGION.run.app"