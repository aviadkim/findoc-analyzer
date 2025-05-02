#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Google Cloud SDK (gcloud) is not installed. Please install it from https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

# Ask for project ID
read -p "Enter your Google Cloud project ID: " PROJECT_ID

# Set the project
echo -e "${BLUE}Setting Google Cloud project to $PROJECT_ID...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${BLUE}Enabling required APIs...${NC}"
gcloud services enable generativeai.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Create service account
echo -e "${BLUE}Creating service account...${NC}"
SERVICE_ACCOUNT="findoc-rag-sa"
gcloud iam service-accounts create $SERVICE_ACCOUNT \
    --display-name="FinDoc RAG Service Account"

# Grant permissions to the service account
echo -e "${BLUE}Granting permissions to the service account...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/monitoring.metricWriter"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# Create storage bucket
echo -e "${BLUE}Creating storage bucket...${NC}"
BUCKET_NAME="$PROJECT_ID-findoc-rag"
gcloud storage buckets create gs://$BUCKET_NAME --location=us-central1

# Create secret for Gemini API key
echo -e "${BLUE}Creating secret for Gemini API key...${NC}"
read -p "Enter your Gemini API key: " GEMINI_API_KEY
echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-

# Grant access to the secret
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Download service account key
echo -e "${BLUE}Downloading service account key...${NC}"
gcloud iam service-accounts keys create google-credentials.json \
    --iam-account=$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com

echo -e "${GREEN}Google Cloud setup complete!${NC}"
echo -e "${BLUE}Service account key saved to google-credentials.json${NC}"
echo -e "${BLUE}Please move this file to the docker directory for local development${NC}"
echo -e "${BLUE}or use it to set up GitHub Actions secrets for CI/CD${NC}"
