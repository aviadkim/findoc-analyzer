#!/bin/bash
# Deploy to Google App Engine with actual gcloud command

set -e  # Exit on error

# Set terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Google App Engine deployment process...${NC}"

# Verify that gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: Google Cloud SDK (gcloud) is not installed.${NC}"
    echo "Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verify that the user is logged in
echo -e "${YELLOW}Verifying gcloud authentication...${NC}"
ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || echo "")
if [ -z "$ACCOUNT" ]; then
    echo -e "${RED}Error: Not logged into gcloud.${NC}"
    echo "Please login using: gcloud auth login"
    exit 1
fi
echo -e "${GREEN}Authenticated as: $ACCOUNT${NC}"

# Verify that a project is set
echo -e "${YELLOW}Verifying gcloud project configuration...${NC}"
PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
if [ -z "$PROJECT" ] || [ "$PROJECT" = "(unset)" ]; then
    echo -e "${RED}Error: No project selected.${NC}"
    echo "Please set a project using: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi
echo -e "${GREEN}Using project: $PROJECT${NC}"

# Check if the app exists in the project
echo -e "${YELLOW}Checking if application already exists...${NC}"
if gcloud app describe --project=$PROJECT &> /dev/null; then
    echo -e "${GREEN}App exists in project $PROJECT${NC}"
else
    echo -e "${YELLOW}Creating new App Engine application in region us-central...${NC}"
    gcloud app create --project=$PROJECT --region=us-central
fi

# Deploy the app
echo -e "${YELLOW}Deploying application to Google App Engine...${NC}"
gcloud app deploy app.yaml --project=$PROJECT --quiet

# Get the deployed app URL
APP_URL=$(gcloud app describe --project=$PROJECT --format="value(defaultHostname)" 2>/dev/null)
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Your application is running at: https://$APP_URL"

# Run tests
echo -e "${YELLOW}Running tests on the deployed application...${NC}"
echo -e "To test your deployed application, run:"
echo -e "node test-gae-deployment.js https://$APP_URL"

echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "Your application should now have all the required UI components working correctly."
echo -e "Check the application at: https://$APP_URL"