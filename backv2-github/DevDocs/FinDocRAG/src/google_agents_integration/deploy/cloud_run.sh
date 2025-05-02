#!/bin/bash

# Script to deploy the FinDocRAG application to Google Cloud Run

# Set variables
PROJECT_ID="findoc-rag"
REGION="us-central1"
SERVICE_NAME="findoc-rag"
IMAGE_NAME="findoc-rag"

# Build the Docker image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME:latest -f ../Dockerfile.prod ..

# Push the image to Google Container Registry
echo "Pushing image to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:latest

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=${GEMINI_API_KEY}"

echo "Deployment complete!"
echo "Your application is available at: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')"
