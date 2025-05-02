#!/bin/bash

# Deploy the full FinDoc application to Google App Engine

# Exit on error
set -e

# Define paths and variables
APP_DIR="$(pwd)"
DOCKERFILE_PATH="$APP_DIR/Dockerfile.full"
APP_YAML_PATH="$APP_DIR/app.yaml"

# Check if required files exist
if [ ! -f "$DOCKERFILE_PATH" ]; then
    echo "Error: Dockerfile.full not found at $DOCKERFILE_PATH"
    exit 1
fi

if [ ! -f "$APP_YAML_PATH" ]; then
    echo "Error: app.yaml not found at $APP_YAML_PATH"
    exit 1
fi

# Display deployment information
echo "====================================================="
echo "Deploying Full FinDoc Application to Google App Engine"
echo "====================================================="

# Check if Google Cloud SDK is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: Google Cloud SDK is not installed. Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
fi
echo "Google Cloud SDK is installed."

# Check if user is logged in
GCLOUD_AUTH=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
if [ -z "$GCLOUD_AUTH" ]; then
    echo "You are not logged in to Google Cloud. Please log in."
    gcloud auth login
else
    echo "Logged in as: $GCLOUD_AUTH"
fi

# Set the project
PROJECT="findoc-deploy"
echo "Setting project to: $PROJECT"
gcloud config set project $PROJECT

# Check if Gemini API key is set in Secret Manager
if ! gcloud secrets describe gemini-api-key &> /dev/null; then
    echo "Creating Gemini API key secret..."
    read -sp "Enter your Gemini API key: " API_KEY
    echo
    
    # Create the secret
    echo "$API_KEY" | gcloud secrets create gemini-api-key --data-file=-
    
    # Grant access to the App Engine service account
    gcloud secrets add-iam-policy-binding gemini-api-key --member="serviceAccount:$PROJECT@appspot.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
else
    echo "Gemini API key secret already exists."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Install additional dependencies needed for the build
npm install autoprefixer postcss tailwindcss react-markdown

# Copy Dockerfile.full to Dockerfile (required for App Engine flexible environment)
cp "$DOCKERFILE_PATH" "$APP_DIR/Dockerfile"
echo "Copied Dockerfile.full to Dockerfile"

# Deploy to App Engine
echo "Deploying to App Engine..."
gcloud app deploy "$APP_YAML_PATH" --quiet

# Check deployment status
if [ $? -eq 0 ]; then
    echo "Deployment completed successfully!"
    echo "Your application is now available at: https://$PROJECT.ey.r.appspot.com"
else
    echo "Deployment failed. Please check the logs for more information."
fi
