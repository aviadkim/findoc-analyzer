#\!/bin/bash
# Simple deployment script for Google App Engine

# Set project ID
PROJECT_ID="findoc-analyzer"

# Display information
echo "Deploying to Google App Engine..."
echo "Project: $PROJECT_ID"
echo "Directory: $(pwd)"

# Deploy the application
echo "Running: gcloud app deploy app.yaml --project=$PROJECT_ID"
gcloud app deploy app.yaml --project=$PROJECT_ID

# Check deployment status
if [ $? -eq 0 ]; then
  echo "Deployment successful\!"
  
  # Get the deployed URL
  DEPLOYED_URL=$(gcloud app describe --format="value(defaultHostname)")
  echo "Your application is available at: https://$DEPLOYED_URL"
  
  # Offer to run tests
  echo ""
  echo "Would you like to run UI tests on the deployed application? (y/n)"
  read -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./test-ui-components.sh "https://$DEPLOYED_URL"
  fi
else
  echo "Deployment failed. Please check the error messages above."
fi
