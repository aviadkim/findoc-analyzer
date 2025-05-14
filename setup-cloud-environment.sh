#!/bin/bash
# Setup Google Cloud Environment for FinDoc Analyzer SaaS
# This script sets up all necessary Google Cloud resources for deployment
# Including Secret Manager secrets for API keys

# Exit immediately if a command exits with a non-zero status
set -e

# Default values
PROJECT_ID=$(gcloud config get-value project)
REGION="me-west1"  # Default region
SERVICE_NAME="findoc-analyzer"
DEBUG=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print usage information
function print_usage() {
  echo -e "${BLUE}Usage:${NC} $0 [OPTIONS]"
  echo "Sets up Google Cloud resources for FinDoc Analyzer SaaS"
  echo
  echo -e "${BLUE}Options:${NC}"
  echo "  -p, --project-id PROJECT_ID    Google Cloud project ID (default: current project)"
  echo "  -r, --region REGION            Region for deployment (default: me-west1)"
  echo "  -s, --service-name NAME        Service name (default: findoc-analyzer)"
  echo "  -d, --debug                    Enable debug output"
  echo "  -h, --help                     Display this help message"
}

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -p|--project-id)
      PROJECT_ID="$2"
      shift 2
      ;;
    -r|--region)
      REGION="$2"
      shift 2
      ;;
    -s|--service-name)
      SERVICE_NAME="$2"
      shift 2
      ;;
    -d|--debug)
      DEBUG=true
      shift
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo -e "${RED}Error:${NC} Unknown option: $1"
      print_usage
      exit 1
      ;;
  esac
done

# Debug information
if [ "$DEBUG" = true ]; then
  echo -e "${YELLOW}Debug:${NC} PROJECT_ID=$PROJECT_ID"
  echo -e "${YELLOW}Debug:${NC} REGION=$REGION"
  echo -e "${YELLOW}Debug:${NC} SERVICE_NAME=$SERVICE_NAME"
fi

echo -e "${BLUE}Setting up Google Cloud resources for FinDoc Analyzer SaaS${NC}"
echo -e "${BLUE}Project ID:${NC} $PROJECT_ID"
echo -e "${BLUE}Region:${NC} $REGION"
echo -e "${BLUE}Service Name:${NC} $SERVICE_NAME"
echo

# Check if gcloud is available
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error:${NC} gcloud CLI is not installed or not in PATH"
  echo "Please install the Google Cloud SDK from https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check if current user is authenticated with gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
  echo -e "${RED}Error:${NC} Not authenticated with gcloud"
  echo "Please run 'gcloud auth login' to authenticate"
  exit 1
fi

# Check if the project exists and is accessible
if ! gcloud projects describe "$PROJECT_ID" &> /dev/null; then
  echo -e "${RED}Error:${NC} Project $PROJECT_ID does not exist or is not accessible"
  echo "Please check the project ID and your permissions"
  exit 1
fi

# Set the project
echo -e "${GREEN}Setting project to $PROJECT_ID...${NC}"
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo -e "${GREEN}Enabling required APIs...${NC}"
APIS=(
  "secretmanager.googleapis.com"
  "cloudbuild.googleapis.com"
  "containerregistry.googleapis.com"
  "run.googleapis.com"
  "cloudresourcemanager.googleapis.com"
  "iam.googleapis.com"
)

for api in "${APIS[@]}"; do
  echo -e "Enabling $api..."
  gcloud services enable "$api"
done

# Create service account
SERVICE_ACCOUNT="$SERVICE_NAME-sa"
echo -e "${GREEN}Creating service account $SERVICE_ACCOUNT...${NC}"
if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" &> /dev/null; then
  gcloud iam service-accounts create "$SERVICE_ACCOUNT" \
    --display-name="$SERVICE_NAME Service Account"
fi

# Set up roles for the service account
echo -e "${GREEN}Setting up IAM roles for service account...${NC}"
ROLES=(
  "roles/secretmanager.secretAccessor"
  "roles/run.admin"
  "roles/storage.admin"
  "roles/logging.logWriter"
)

for role in "${ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="$role"
done

# Create secrets for API keys in Secret Manager
echo -e "${GREEN}Creating secrets for API keys...${NC}"
SECRETS=(
  "gemini-api-key"
  "openai-api-key"
  "openrouter-api-key"
  "anthropic-api-key"
)

for secret in "${SECRETS[@]}"; do
  # Check if secret already exists
  if ! gcloud secrets describe "$secret" &> /dev/null; then
    echo -e "Creating secret $secret..."
    gcloud secrets create "$secret" \
      --replication-policy="automatic"
    
    # For demonstration, add a placeholder value
    # In a real scenario, you would prompt for actual API keys or read from a secure file
    echo "placeholder-$secret-value" | gcloud secrets versions add "$secret" --data-file=-
    
    echo -e "${YELLOW}Note:${NC} Secret $secret created with placeholder value."
    echo -e "${YELLOW}      Update with real API key using:${NC}"
    echo -e "       gcloud secrets versions add $secret --data-file=/path/to/file/containing/key"
  else
    echo -e "Secret $secret already exists."
  fi
done

# Grant service account access to secrets
echo -e "${GREEN}Granting service account access to secrets...${NC}"
for secret in "${SECRETS[@]}"; do
  gcloud secrets add-iam-policy-binding "$secret" \
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done

echo
echo -e "${GREEN}Google Cloud environment setup complete!${NC}"
echo
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update API key secrets with real values:"
for secret in "${SECRETS[@]}"; do
  echo "   gcloud secrets versions add $secret --data-file=/path/to/file/containing/key"
done
echo
echo "2. Deploy the application:"
echo "   gcloud builds submit --config=cloudbuild.yaml"
echo
echo "3. View the deployed application:"
echo "   https://$SERVICE_NAME-$PROJECT_ID.a.run.app"
echo

exit 0