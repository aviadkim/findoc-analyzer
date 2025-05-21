#\!/bin/bash
# Cloud Run Deployment Script for FinDoc Analyzer
# This script builds and deploys the application to Google Cloud Run

set -e  # Exit on any error

# Configuration
PROJECT_ID="findoc-deploy"
SERVICE_NAME="findoc-analyzer"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:$(date +%Y%m%d-%H%M%S)"
MAX_INSTANCES=10
MEMORY="1Gi"
CPU="1"
TIMEOUT="300s"

echo "===== FinDoc Analyzer Deployment Script ====="
echo "Project ID: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "Image: $IMAGE_NAME"
echo "===========================================" 

# Check if gcloud is installed
if \! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed
if \! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install it first."
    exit 1
fi

# Check authentication
echo "Checking gcloud authentication..."
if \! gcloud auth print-identity-token &> /dev/null; then
    echo "Not authenticated with gcloud. Please run 'gcloud auth login' first."
    exit 1
fi

# Verify project configuration
echo "Configuring gcloud project..."
gcloud config set project $PROJECT_ID

# Build the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME .

# Push the Docker image to Google Container Registry
echo "Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE_NAME \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --memory=$MEMORY \
  --cpu=$CPU \
  --timeout=$TIMEOUT \
  --max-instances=$MAX_INSTANCES \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="PORT=8080"

# Get the deployed URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform=managed --region=$REGION --format='value(status.url)')

echo "===========================================" 
echo "Deployment Completed\!"
echo "Service URL: $SERVICE_URL"
echo "===========================================" 

# Run quick verification tests
echo "Running verification tests..."
curl -s $SERVICE_URL/api/health

echo "=== Deployment and Verification Complete ==="
