#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="findoc-rag"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Google Cloud SDK (gcloud) is not installed. Please install it from https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker from https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Get the directory containing this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Get the parent directory (src/google_agents_integration)
PARENT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Set the project
echo -e "${BLUE}Setting Google Cloud project to $PROJECT_ID...${NC}"
gcloud config set project $PROJECT_ID

# Build the Docker image
echo -e "${BLUE}Building Docker image...${NC}"
docker build -t $IMAGE_NAME -f $PARENT_DIR/docker/Dockerfile.prod $PARENT_DIR

# Push the image to Google Container Registry
echo -e "${BLUE}Pushing image to Google Container Registry...${NC}"
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo -e "${BLUE}Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --memory 2Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
    --service-account="findoc-rag-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --allow-unauthenticated

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${BLUE}Your service is available at: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')${NC}"
