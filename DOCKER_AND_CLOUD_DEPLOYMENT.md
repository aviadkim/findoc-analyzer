# Docker and Google Cloud Deployment Guide

This guide explains how to run the FinDoc Analyzer application using Docker and how to deploy it to Google Cloud.

## Prerequisites

- Docker Desktop installed
- Google Cloud SDK installed (for cloud deployment)
- A Google Cloud account (for cloud deployment)
- A Gemini API key

## Running Locally with Docker

### Option 1: Using the PowerShell Script

The easiest way to run the application locally with Docker is to use the provided PowerShell script:

```powershell
.\run-with-docker.ps1
```

This script will:
1. Prompt for your Gemini API key
2. Create necessary directories
3. Create test documents if they don't exist
4. Build and start the Docker containers
5. Open your browser to the application

### Option 2: Using Docker Compose Directly

If you prefer to use Docker Compose directly:

1. Set your Gemini API key as an environment variable:
   ```powershell
   $env:GEMINI_API_KEY = "your-gemini-api-key"
   ```

2. Build and start the containers:
   ```powershell
   docker-compose up --build -d
   ```

3. Access the application at http://localhost:3002

4. To stop the containers:
   ```powershell
   docker-compose down
   ```

## Deploying to Google Cloud

### Option 1: Using the PowerShell Script

The easiest way to deploy to Google Cloud is to use the provided PowerShell script:

```powershell
.\deploy-to-gcloud.ps1
```

This script will:
1. Prompt for your Gemini API key if not set
2. Build and push Docker images to Google Container Registry
3. Create a Cloud Storage bucket for document storage
4. Deploy the backend, frontend, and agent services to Cloud Run
5. Configure service-to-service authentication
6. Display the URLs for the deployed services

### Option 2: Manual Deployment

If you prefer to deploy manually:

1. Set your Google Cloud project ID:
   ```powershell
   $PROJECT_ID = "your-project-id"
   ```

2. Set your Gemini API key:
   ```powershell
   $env:GEMINI_API_KEY = "your-gemini-api-key"
   ```

3. Configure Docker to use Google Cloud credentials:
   ```powershell
   gcloud auth configure-docker
   ```

4. Build and push the Docker images:
   ```powershell
   docker build -t gcr.io/$PROJECT_ID/findoc-backend -f Dockerfile.backend .
   docker push gcr.io/$PROJECT_ID/findoc-backend
   
   docker build -t gcr.io/$PROJECT_ID/findoc-frontend -f Dockerfile.frontend .
   docker push gcr.io/$PROJECT_ID/findoc-frontend
   
   docker build -t gcr.io/$PROJECT_ID/findoc-agent -f Dockerfile.agent .
   docker push gcr.io/$PROJECT_ID/findoc-agent
   ```

5. Create a Cloud Storage bucket:
   ```powershell
   gcloud storage buckets create gs://$PROJECT_ID-documents --location=us-central1 --uniform-bucket-level-access
   ```

6. Deploy the services to Cloud Run:
   ```powershell
   gcloud run deploy findoc-backend \
       --image gcr.io/$PROJECT_ID/findoc-backend \
       --platform managed \
       --region us-central1 \
       --allow-unauthenticated \
       --memory 2Gi \
       --cpu 1 \
       --timeout 300s \
       --set-env-vars "GEMINI_API_KEY=$env:GEMINI_API_KEY,STORAGE_BUCKET=$PROJECT_ID-documents"
   
   $BACKEND_URL = gcloud run services describe findoc-backend --platform managed --region us-central1 --format 'value(status.url)'
   
   gcloud run deploy findoc-agent \
       --image gcr.io/$PROJECT_ID/findoc-agent \
       --platform managed \
       --region us-central1 \
       --no-allow-unauthenticated \
       --memory 2Gi \
       --cpu 1 \
       --timeout 600s \
       --set-env-vars "GEMINI_API_KEY=$env:GEMINI_API_KEY,STORAGE_BUCKET=$PROJECT_ID-documents,BACKEND_URL=$BACKEND_URL"
   
   gcloud run deploy findoc-frontend \
       --image gcr.io/$PROJECT_ID/findoc-frontend \
       --platform managed \
       --region us-central1 \
       --allow-unauthenticated \
       --memory 1Gi \
       --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL"
   ```

7. Configure service-to-service authentication:
   ```powershell
   $AGENT_SERVICE_ACCOUNT = gcloud run services describe findoc-agent --platform managed --region us-central1 --format 'value(spec.template.spec.serviceAccountName)'
   
   gcloud run services add-iam-policy-binding findoc-backend \
       --platform managed \
       --region us-central1 \
       --member="serviceAccount:$AGENT_SERVICE_ACCOUNT" \
       --role="roles/run.invoker"
   ```

## Architecture

The application consists of three main components:

1. **Frontend**: A Next.js web application that provides the user interface
2. **Backend**: A Python API server that handles document processing and API requests
3. **Agent Service**: A Python service that runs the multi-agent system for enhanced document processing

In the Docker setup, these components run as separate containers that communicate with each other over a Docker network.

In the Google Cloud setup, these components run as separate Cloud Run services that communicate with each other over HTTPS.

## Environment Variables

The following environment variables are used:

- `GEMINI_API_KEY`: Your Gemini API key for AI capabilities
- `STORAGE_BUCKET`: (Cloud only) The name of the Cloud Storage bucket for document storage
- `BACKEND_URL`: The URL of the backend service
- `NEXT_PUBLIC_API_URL`: The URL of the backend API (for the frontend)

## Testing

To test the application:

1. Access the frontend at http://localhost:3002 (local) or the deployed URL (cloud)
2. Upload a financial document (test documents are available in the test_documents directory)
3. Process the document and view the results
4. Use the chat interface to ask questions about the document

## Troubleshooting

### Docker Issues

- **Container fails to start**: Check the logs with `docker-compose logs`
- **Frontend can't connect to backend**: Make sure the backend container is running and the NEXT_PUBLIC_API_URL is set correctly
- **Missing dependencies**: Make sure the Dockerfiles include all necessary dependencies

### Google Cloud Issues

- **Deployment fails**: Check the Cloud Build logs in the Google Cloud Console
- **Services can't communicate**: Make sure the service-to-service authentication is configured correctly
- **Memory or CPU limits**: Increase the memory or CPU limits if the services are running out of resources
