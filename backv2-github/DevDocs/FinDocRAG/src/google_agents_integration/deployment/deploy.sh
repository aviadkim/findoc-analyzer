#!/bin/bash
# Deploy FinDocRAG to Google Cloud Run

# Exit on error
set -e

# Configuration
PROJECT_ID=${PROJECT_ID:-"findoc-rag"}
SERVICE_NAME=${SERVICE_NAME:-"findoc-rag"}
REGION=${REGION:-"us-central1"}
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Check if required environment variables are set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "Error: GEMINI_API_KEY environment variable is not set."
    echo "Please set it with: export GEMINI_API_KEY=your_gemini_api_key"
    exit 1
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install it first."
    exit 1
fi

# Get the directory containing this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Get the parent directory (src/google_agents_integration)
PARENT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Set the project
echo "Setting Google Cloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Build the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME $PARENT_DIR

# Push the image to Google Container Registry
echo "Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --memory 2Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "GEMINI_API_KEY=$GEMINI_API_KEY" \
    --allow-unauthenticated

echo "Deployment completed!"
echo "Your service is available at: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')"
