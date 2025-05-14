# FinDoc Analyzer Deployment Guide (Updated)

This guide explains how to deploy the updated FinDoc Analyzer application to Google Cloud Run.

## Prerequisites

1. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and configured
2. [Docker](https://docs.docker.com/get-docker/) installed
3. [Git](https://git-scm.com/downloads) installed
4. A Google Cloud project with billing enabled

## Deployment Steps

### 1. Prepare the updated code

Make sure all the fixes have been implemented and tested locally:

```bash
# Start the local server
node server-simple.js

# Test the application locally
# Open http://localhost:8080 in your browser
```

### 2. Build and test the Docker image locally

```bash
# Build and run the Docker container locally
powershell -ExecutionPolicy Bypass -File .\run-docker.ps1
```

Visit http://localhost:8080 to verify that the application is running correctly.

### 3. Update the cloudbuild.yaml file

Make sure the cloudbuild.yaml file is up to date:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/findoc-deploy/backv2:latest', '.']
  
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/findoc-deploy/backv2:latest']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'backv2-app'
      - '--image'
      - 'gcr.io/findoc-deploy/backv2:latest'
      - '--region'
      - 'me-west1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--memory'
      - '1Gi'
      - '--cpu'
      - '1'
      - '--set-env-vars'
      - 'NODE_ENV=production,USE_MOCK_API=true'

images:
  - 'gcr.io/findoc-deploy/backv2:latest'

timeout: 1800s
```

### 4. Deploy to Google Cloud Run

```bash
# Deploy to Google Cloud Run
powershell -ExecutionPolicy Bypass -File .\deploy-to-cloud.ps1
```

This script will:
1. Set the Google Cloud project to findoc-deploy
2. Submit the build to Cloud Build
3. Deploy the application to Google Cloud Run
4. Get the URL of the deployed application
5. Open the application in your browser

### 5. Verify the deployment

Visit the URL provided by the deployment script to verify that the application is running correctly.

### 6. Test the deployed application

Run the test scripts against the deployed application:

```bash
# Test basic functionality
node basic-test.js

# Test document upload
node upload-test.js

# Test document chat
node chat-test.js
```

### 7. Troubleshooting

If you encounter any issues with the deployment, check the following:

#### Viewing logs

```bash
# View the logs of the deployed application
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=backv2-app" --limit 50
```

#### Checking the container status

```bash
# Check the status of the deployed container
gcloud run services describe backv2-app --platform managed --region me-west1
```

#### Redeploying the application

If you need to redeploy the application with updated code:

```bash
# Submit the build to Cloud Build again
gcloud builds submit --config cloudbuild.yaml
```

## Important Files

### server-simple.js

This is the main server file that handles API requests and serves the frontend. Make sure this file is up to date with all the fixes.

### public/document-chat.html

This file contains the document chat interface. Make sure it has the fixes for the duplicate variable declaration and document selection issues.

### public/upload-form.html

This file contains the upload form. Make sure it has the fixes for the upload area and document type select issues.

## Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Google Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Docker Documentation](https://docs.docker.com/)
