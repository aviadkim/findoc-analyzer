# Deploying to Google Cloud Console

This guide explains how to deploy the FinDoc Analyzer application directly from the Google Cloud Console without using the command line.

## Prerequisites

1. A Google Cloud account with billing enabled
2. Your service account key (already set up)
3. Docker Desktop (for building images locally)

## Step 1: Set Up Your Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're using the project "devdoc-456420"
3. Enable the following APIs:
   - Cloud Run API
   - Container Registry API
   - Cloud Build API
   - Cloud Storage API

## Step 2: Create a Cloud Storage Bucket

1. Go to [Cloud Storage](https://console.cloud.google.com/storage/browser)
2. Click "CREATE BUCKET"
3. Name: "devdoc-456420-documents"
4. Location: "us-central1"
5. Default storage class: "Standard"
6. Access control: "Uniform"
7. Click "CREATE"

## Step 3: Build and Push Docker Images

You'll need to build and push the Docker images. Since Docker Desktop isn't running, you can use Cloud Build to build the images directly in the cloud:

1. Go to [Cloud Build](https://console.cloud.google.com/cloud-build)
2. Click "CREATE TRIGGER"
3. Name: "build-findoc-backend"
4. Event: "Push to a branch"
5. Repository: Connect to your GitHub repository
6. Branch: "docker-deployment"
7. Configuration: "Cloud Build configuration file (yaml or json)"
8. Location: "Repository"
9. Cloud Build configuration file location: "cloudbuild.yaml"
10. Click "CREATE"

Repeat for the frontend and agent services.

## Step 4: Create a Cloud Build Configuration File

Create a file named `cloudbuild.yaml` in your repository:

```yaml
steps:
  # Build the backend image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/findoc-backend', '-f', 'Dockerfile.backend', '.']
  
  # Build the frontend image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/findoc-frontend', '-f', 'Dockerfile.frontend', '.']
  
  # Build the agent image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/findoc-agent', '-f', 'Dockerfile.agent', '.']

images:
  - 'gcr.io/$PROJECT_ID/findoc-backend'
  - 'gcr.io/$PROJECT_ID/findoc-frontend'
  - 'gcr.io/$PROJECT_ID/findoc-agent'
```

## Step 5: Deploy to Cloud Run

### Deploy the Backend Service

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click "CREATE SERVICE"
3. Select "Deploy one revision from an existing container image"
4. Container image URL: "gcr.io/devdoc-456420/findoc-backend"
5. Service name: "findoc-backend"
6. Region: "us-central1"
7. CPU allocation and pricing: "CPU is only allocated during request processing"
8. Autoscaling: Min instances: 0, Max instances: 10
9. Ingress: "Allow all traffic"
10. Authentication: "Allow unauthenticated invocations"
11. Click "CONTAINER, VARIABLES & SECRETS, CONNECTIONS, SECURITY"
12. Set environment variables:
    - GEMINI_API_KEY: "sk-or-v1-a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9"
    - STORAGE_BUCKET: "devdoc-456420-documents"
13. Memory: 2 GiB
14. CPU: 1
15. Request timeout: 300 seconds
16. Click "CREATE"

### Deploy the Agent Service

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click "CREATE SERVICE"
3. Select "Deploy one revision from an existing container image"
4. Container image URL: "gcr.io/devdoc-456420/findoc-agent"
5. Service name: "findoc-agent"
6. Region: "us-central1"
7. CPU allocation and pricing: "CPU is only allocated during request processing"
8. Autoscaling: Min instances: 0, Max instances: 10
9. Ingress: "Allow internal traffic only"
10. Authentication: "Require authentication"
11. Click "CONTAINER, VARIABLES & SECRETS, CONNECTIONS, SECURITY"
12. Set environment variables:
    - GEMINI_API_KEY: "sk-or-v1-a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9a0f9"
    - STORAGE_BUCKET: "devdoc-456420-documents"
    - BACKEND_URL: (URL of the backend service)
13. Memory: 2 GiB
14. CPU: 1
15. Request timeout: 600 seconds
16. Click "CREATE"

### Deploy the Frontend Service

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click "CREATE SERVICE"
3. Select "Deploy one revision from an existing container image"
4. Container image URL: "gcr.io/devdoc-456420/findoc-frontend"
5. Service name: "findoc-frontend"
6. Region: "us-central1"
7. CPU allocation and pricing: "CPU is only allocated during request processing"
8. Autoscaling: Min instances: 0, Max instances: 10
9. Ingress: "Allow all traffic"
10. Authentication: "Allow unauthenticated invocations"
11. Click "CONTAINER, VARIABLES & SECRETS, CONNECTIONS, SECURITY"
12. Set environment variables:
    - NEXT_PUBLIC_API_URL: (URL of the backend service)
13. Memory: 1 GiB
14. Click "CREATE"

## Step 6: Configure Service-to-Service Authentication

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click on the "findoc-agent" service
3. Go to the "PERMISSIONS" tab
4. Note the service account used by the agent service
5. Go back to the Cloud Run services list
6. Click on the "findoc-backend" service
7. Go to the "PERMISSIONS" tab
8. Click "ADD PRINCIPAL"
9. Principal: (Service account used by the agent service)
10. Role: "Cloud Run Invoker"
11. Click "SAVE"

## Step 7: Access Your Application

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click on the "findoc-frontend" service
3. Click on the URL at the top of the page
4. Your application is now running in Google Cloud!

## Troubleshooting

If you encounter issues:

1. Check the logs in the Cloud Run console
2. Verify that all environment variables are set correctly
3. Make sure the services can communicate with each other
4. Check that the Docker images were built correctly
