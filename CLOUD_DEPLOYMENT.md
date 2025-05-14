# FinDoc Analyzer Cloud Deployment Guide

This guide explains how to deploy the FinDoc Analyzer application to Google Cloud Run using Docker.

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
docker-compose up --build
```

Visit http://localhost:8080 to verify that the application is running correctly.

### 3. Deploy to Google Cloud Run using Cloud Build

```bash
# Set your Google Cloud project ID
gcloud config set project YOUR_PROJECT_ID

# Submit the build to Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

This will:
1. Build the Docker image
2. Push it to Google Container Registry
3. Deploy it to Google Cloud Run

### 4. Access the deployed application

Once the deployment is complete, you can access the application at the URL provided in the Cloud Build output.

```bash
# Get the URL of the deployed application
gcloud run services describe findoc-analyzer --platform managed --region europe-west3 --format 'value(status.url)'
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
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=findoc-analyzer" --limit 50
```

### Checking the container status

```bash
# Check the status of the deployed container
gcloud run services describe findoc-analyzer --platform managed --region europe-west3
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
