# FinDoc Analyzer Deployment Guide

This guide explains how to deploy the FinDoc Analyzer application to Google Cloud Run.

## Prerequisites

1. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and configured
2. [Docker](https://docs.docker.com/get-docker/) installed
3. [Git](https://git-scm.com/downloads) installed
4. A Google Cloud project with billing enabled

## Deployment Steps

### 1. Clone the repository

```bash
git clone https://github.com/aviadkim/backv2.git
cd backv2
```

### 2. Build and test the Docker image locally

```bash
# Build and run the Docker container locally
powershell -ExecutionPolicy Bypass -File .\run-docker.ps1
```

Visit http://localhost:8080 to verify that the application is running correctly.

### 3. Deploy to Google Cloud Run

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

### 4. Verify the deployment

Visit the URL provided by the deployment script to verify that the application is running correctly.

## Deployment Files

### cloudbuild.yaml

This file defines the steps for building and deploying the application using Google Cloud Build:

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

### Dockerfile

This file defines the Docker image for the application:

```dockerfile
# Use Node.js with Python for the application
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the entire application
COPY . .

# Create directories for uploads, temp files, and results
RUN mkdir -p uploads temp results

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production
ENV USE_MOCK_API=true

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server-simple.js"]
```

### deploy-to-cloud.ps1

This script deploys the application to Google Cloud Run:

```powershell
# Deploy FinDoc Analyzer to Google Cloud Run
Write-Host "===================================================
Deploying FinDoc Analyzer to Google Cloud Run
===================================================" -ForegroundColor Green

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version
    Write-Host "Google Cloud SDK is installed." -ForegroundColor Green
} catch {
    Write-Host "Error: Google Cloud SDK (gcloud) is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Check if user is logged in to gcloud
$auth = gcloud auth list --filter=status:ACTIVE --format="value(account)"
if (-not $auth) {
    Write-Host "You are not logged in to Google Cloud. Please log in:" -ForegroundColor Yellow
    gcloud auth login
}

# Set the project to findoc-deploy
Write-Host "Setting project to findoc-deploy..." -ForegroundColor Yellow
gcloud config set project findoc-deploy
$currentProject = "findoc-deploy"
Write-Host "Project set to: $currentProject" -ForegroundColor Green

# Deploy to Cloud Run using Cloud Build
Write-Host "Deploying to Google Cloud Run using Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --config cloudbuild.yaml

# Wait for deployment to complete
Write-Host "Waiting for deployment to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Get the URL of the deployed application
$url = gcloud run services describe backv2-app --platform managed --region me-west1 --format 'value(status.url)'
Write-Host "Application deployed successfully!" -ForegroundColor Green
Write-Host "You can access the application at: $url" -ForegroundColor Green

# Open the application in the default browser
$openBrowser = Read-Host "Do you want to open the application in your browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process $url
}

Write-Host "===================================================
Deployment Complete!
===================================================" -ForegroundColor Green
```

## Environment Variables

The following environment variables are used in the deployed application:

- `NODE_ENV`: Set to `production` for the deployed application
- `PORT`: The port on which the application listens (default: 8080)
- `UPLOAD_FOLDER`: The folder where uploaded files are stored
- `TEMP_FOLDER`: The folder where temporary files are stored
- `RESULTS_FOLDER`: The folder where results are stored
- `USE_MOCK_API`: Set to `true` to use mock API responses

## Troubleshooting

### Viewing logs

```bash
# View the logs of the deployed application
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=backv2-app" --limit 50
```

### Checking the container status

```bash
# Check the status of the deployed container
gcloud run services describe backv2-app --platform managed --region me-west1
```

### Redeploying the application

If you need to redeploy the application with updated code:

```bash
# Submit the build to Cloud Build again
gcloud builds submit --config cloudbuild.yaml
```

## Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Google Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Docker Documentation](https://docs.docker.com/)
