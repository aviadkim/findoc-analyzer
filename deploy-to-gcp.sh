#!/bin/bash

# FinDoc Analyzer Google Cloud Deployment Script
# This script deploys the FinDoc Analyzer application to Google Cloud Platform
# using Cloud Run and other GCP services.

set -e

# Configuration
PROJECT_ID="findoc-analyzer"
REGION="us-central1"
SERVICE_NAME="findoc-app"
PROCESSOR_SERVICE_NAME="findoc-processor"
CHATBOT_SERVICE_NAME="findoc-chatbot"
BLOOMBERG_SERVICE_NAME="findoc-bloomberg"
CONTAINER_REGISTRY="gcr.io"
DB_INSTANCE_NAME="findoc-db-instance"
REDIS_INSTANCE_NAME="findoc-redis-instance"
BUCKET_NAME="findoc-documents"
NETWORK_NAME="findoc-network"
SUBNET_NAME="findoc-subnet"
VPC_CONNECTOR_NAME="findoc-vpc-connector"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Display script banner
echo -e "${GREEN}"
echo "======================================================"
echo "   FinDoc Analyzer - Google Cloud Deployment"
echo "======================================================"
echo -e "${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI not found. Please install the Google Cloud SDK.${NC}"
    exit 1
fi

# Check if logged in
echo -e "${YELLOW}Checking gcloud authentication...${NC}"
gcloud auth list --filter=status:ACTIVE --format="value(account)" || {
    echo -e "${RED}Error: Not logged into gcloud. Please run 'gcloud auth login' first.${NC}"
    exit 1
}

# Set project
echo -e "${YELLOW}Setting GCP project to $PROJECT_ID...${NC}"
gcloud config set project $PROJECT_ID

# Check if project exists, if not create it
gcloud projects describe $PROJECT_ID &> /dev/null || {
    echo -e "${YELLOW}Project $PROJECT_ID does not exist. Creating...${NC}"
    gcloud projects create $PROJECT_ID
    gcloud billing projects link $PROJECT_ID --billing-account=$(gcloud billing accounts list --format="value(ACCOUNT_ID)" | head -1)
}

# Enable required APIs
echo -e "${YELLOW}Enabling required Google Cloud APIs...${NC}"
declare -a APIS=(
    "cloudbuild.googleapis.com"
    "run.googleapis.com"
    "artifactregistry.googleapis.com"
    "containerregistry.googleapis.com"
    "sqladmin.googleapis.com"
    "redis.googleapis.com"
    "storage.googleapis.com"
    "secretmanager.googleapis.com"
    "vpcaccess.googleapis.com"
    "compute.googleapis.com"
    "servicenetworking.googleapis.com"
    "cloudmonitoring.googleapis.com"
    "logging.googleapis.com"
)

for api in "${APIS[@]}"; do
    echo -e "Enabling $api..."
    gcloud services enable $api
done

# Create VPC network for private services
echo -e "${YELLOW}Setting up networking...${NC}"
if ! gcloud compute networks describe $NETWORK_NAME &> /dev/null; then
    echo -e "Creating VPC network: $NETWORK_NAME..."
    gcloud compute networks create $NETWORK_NAME --subnet-mode=custom
    
    echo -e "Creating subnet: $SUBNET_NAME..."
    gcloud compute networks subnets create $SUBNET_NAME \
        --network=$NETWORK_NAME \
        --region=$REGION \
        --range=10.0.0.0/24
        
    echo -e "Setting up VPC peering for private service access..."
    gcloud compute addresses create google-managed-services-$NETWORK_NAME \
        --global \
        --purpose=VPC_PEERING \
        --prefix-length=16 \
        --network=$NETWORK_NAME
        
    gcloud services vpc-peerings connect \
        --service=servicenetworking.googleapis.com \
        --ranges=google-managed-services-$NETWORK_NAME \
        --network=$NETWORK_NAME
else
    echo -e "VPC network $NETWORK_NAME already exists."
fi

# Create VPC connector for Cloud Run
if ! gcloud compute networks vpc-access connectors describe $VPC_CONNECTOR_NAME --region=$REGION &> /dev/null; then
    echo -e "Creating VPC connector for Cloud Run..."
    gcloud compute networks vpc-access connectors create $VPC_CONNECTOR_NAME \
        --region=$REGION \
        --network=$NETWORK_NAME \
        --range=10.8.0.0/28
else
    echo -e "VPC connector $VPC_CONNECTOR_NAME already exists."
fi

# Create Cloud Storage bucket
echo -e "${YELLOW}Setting up Cloud Storage...${NC}"
if ! gsutil ls -b gs://$BUCKET_NAME &> /dev/null; then
    echo -e "Creating Cloud Storage bucket: $BUCKET_NAME..."
    gsutil mb -l $REGION gs://$BUCKET_NAME
    gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
else
    echo -e "Bucket $BUCKET_NAME already exists."
fi

# Create Secrets
echo -e "${YELLOW}Setting up Secret Manager secrets...${NC}"
declare -a SECRETS=(
    "db-password"
    "redis-password"
    "jwt-secret"
    "session-secret"
    "openai-api-key"
    "anthropic-api-key"
    "bloomberg-api-key"
)

for secret in "${SECRETS[@]}"; do
    if ! gcloud secrets describe $secret &> /dev/null; then
        echo -e "Creating secret: $secret..."
        echo "placeholder-value-please-update" | gcloud secrets create $secret --data-file=-
    else
        echo -e "Secret $secret already exists."
    fi
done

# Create Cloud SQL PostgreSQL instance
echo -e "${YELLOW}Setting up Cloud SQL...${NC}"
if ! gcloud sql instances describe $DB_INSTANCE_NAME &> /dev/null; then
    echo -e "Creating Cloud SQL instance: $DB_INSTANCE_NAME..."
    gcloud sql instances create $DB_INSTANCE_NAME \
        --tier=db-g1-small \
        --region=$REGION \
        --database-version=POSTGRES_15 \
        --storage-type=SSD \
        --storage-size=10GB \
        --availability-type=zonal \
        --network=$NETWORK_NAME \
        --no-assign-ip
    
    # Create database
    gcloud sql databases create findoc --instance=$DB_INSTANCE_NAME
    
    # Create user (password is stored in Secret Manager)
    echo -e "Creating database user..."
    DB_PASSWORD=$(gcloud secrets versions access latest --secret=db-password)
    gcloud sql users create findocuser --instance=$DB_INSTANCE_NAME --password=$DB_PASSWORD
else
    echo -e "Cloud SQL instance $DB_INSTANCE_NAME already exists."
fi

# Create Redis instance
echo -e "${YELLOW}Setting up Redis...${NC}"
if ! gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION &> /dev/null; then
    echo -e "Creating Redis instance: $REDIS_INSTANCE_NAME..."
    gcloud redis instances create $REDIS_INSTANCE_NAME \
        --size=1 \
        --region=$REGION \
        --zone=$REGION-a \
        --network=$NETWORK_NAME \
        --tier=standard \
        --redis-version=redis_7_0
else
    echo -e "Redis instance $REDIS_INSTANCE_NAME already exists."
fi

# Build and push Docker images
echo -e "${YELLOW}Building and pushing Docker images...${NC}"

build_and_push() {
    local dockerfile=$1
    local service_name=$2
    
    echo -e "Building and pushing $service_name from $dockerfile..."
    gcloud builds submit --tag $CONTAINER_REGISTRY/$PROJECT_ID/$service_name:latest --dockerfile=$dockerfile .
}

build_and_push "Dockerfile.frontend" "findoc-frontend"
build_and_push "Dockerfile.backend" "findoc-backend"
build_and_push "Dockerfile.processor" "findoc-processor"
build_and_push "Dockerfile.chatbot" "findoc-chatbot"
build_and_push "Dockerfile.bloomberg" "findoc-bloomberg"

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying services to Cloud Run...${NC}"

# Get database and Redis connection info
DB_HOST=$(gcloud sql instances describe $DB_INSTANCE_NAME --format="value(ipAddresses.ipAddress)")
REDIS_HOST=$(gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION --format="value(host)")
REDIS_PORT=$(gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION --format="value(port)")

# Deploy backend service
echo -e "Deploying backend service..."
gcloud run deploy $SERVICE_NAME \
    --image=$CONTAINER_REGISTRY/$PROJECT_ID/findoc-backend:latest \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --memory=1Gi \
    --cpu=1 \
    --min-instances=1 \
    --max-instances=5 \
    --vpc-connector=$VPC_CONNECTOR_NAME \
    --set-env-vars="NODE_ENV=production,DB_HOST=$DB_HOST,DB_PORT=5432,DB_NAME=findoc,DB_USER=findocuser,REDIS_HOST=$REDIS_HOST,REDIS_PORT=$REDIS_PORT,STORAGE_BUCKET=$BUCKET_NAME" \
    --set-secrets="DB_PASSWORD=db-password:latest,REDIS_PASSWORD=redis-password:latest,JWT_SECRET=jwt-secret:latest,SESSION_SECRET=session-secret:latest,OPENAI_API_KEY=openai-api-key:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest,BLOOMBERG_API_KEY=bloomberg-api-key:latest"

# Deploy document processor service
echo -e "Deploying document processor service..."
gcloud run deploy $PROCESSOR_SERVICE_NAME \
    --image=$CONTAINER_REGISTRY/$PROJECT_ID/findoc-processor:latest \
    --region=$REGION \
    --platform=managed \
    --memory=2Gi \
    --cpu=2 \
    --min-instances=1 \
    --max-instances=5 \
    --vpc-connector=$VPC_CONNECTOR_NAME \
    --set-env-vars="NODE_ENV=production,DB_HOST=$DB_HOST,DB_PORT=5432,DB_NAME=findoc,DB_USER=findocuser,REDIS_HOST=$REDIS_HOST,REDIS_PORT=$REDIS_PORT,STORAGE_BUCKET=$BUCKET_NAME,CONCURRENCY=2" \
    --set-secrets="DB_PASSWORD=db-password:latest,REDIS_PASSWORD=redis-password:latest,OPENAI_API_KEY=openai-api-key:latest"

# Deploy chatbot service
echo -e "Deploying chatbot service..."
gcloud run deploy $CHATBOT_SERVICE_NAME \
    --image=$CONTAINER_REGISTRY/$PROJECT_ID/findoc-chatbot:latest \
    --region=$REGION \
    --platform=managed \
    --memory=1Gi \
    --cpu=1 \
    --min-instances=1 \
    --max-instances=5 \
    --vpc-connector=$VPC_CONNECTOR_NAME \
    --set-env-vars="NODE_ENV=production,DB_HOST=$DB_HOST,DB_PORT=5432,DB_NAME=findoc,DB_USER=findocuser,REDIS_HOST=$REDIS_HOST,REDIS_PORT=$REDIS_PORT,MODEL=gpt-4-turbo,FALLBACK_MODEL=claude-3-haiku" \
    --set-secrets="DB_PASSWORD=db-password:latest,REDIS_PASSWORD=redis-password:latest,OPENAI_API_KEY=openai-api-key:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest"

# Deploy Bloomberg service
echo -e "Deploying Bloomberg service..."
gcloud run deploy $BLOOMBERG_SERVICE_NAME \
    --image=$CONTAINER_REGISTRY/$PROJECT_ID/findoc-bloomberg:latest \
    --region=$REGION \
    --platform=managed \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=1 \
    --max-instances=3 \
    --vpc-connector=$VPC_CONNECTOR_NAME \
    --set-env-vars="NODE_ENV=production,REDIS_HOST=$REDIS_HOST,REDIS_PORT=$REDIS_PORT,CACHE_TTL=300" \
    --set-secrets="REDIS_PASSWORD=redis-password:latest,BLOOMBERG_API_KEY=bloomberg-api-key:latest"

# Deploy frontend (with backend URL as env var)
echo -e "Deploying frontend service..."
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
gcloud run deploy findoc-frontend \
    --image=$CONTAINER_REGISTRY/$PROJECT_ID/findoc-frontend:latest \
    --region=$REGION \
    --platform=managed \
    --allow-unauthenticated \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=1 \
    --max-instances=3 \
    --set-env-vars="API_URL=$BACKEND_URL"

# Set up load balancer and SSL (optional)
# This section would set up a load balancer with SSL certificates
# We're skipping this for now, but can be added if needed

echo -e "${GREEN}======================================================"
echo "   FinDoc Analyzer Deployment Complete!"
echo "======================================================${NC}"

# Get service URLs
FRONTEND_URL=$(gcloud run services describe findoc-frontend --region=$REGION --format="value(status.url)")
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo -e "${GREEN}Frontend URL: $FRONTEND_URL${NC}"
echo -e "${GREEN}Backend API URL: $BACKEND_URL${NC}"
echo -e "${YELLOW}Remember to update the secret values in Secret Manager with real credentials!${NC}"
echo -e "${YELLOW}For production, consider setting up a custom domain and SSL certificates.${NC}"