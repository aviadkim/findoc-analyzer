# Google App Engine Deployment Guide

This guide explains how to deploy the FinDoc Analyzer application to Google App Engine.

## Prerequisites

1. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
2. A Google Cloud project with App Engine enabled
3. Gemini API key

## Setup

### 1. Install Google Cloud SDK

Follow the instructions at https://cloud.google.com/sdk/docs/install to install the Google Cloud SDK.

### 2. Login to Google Cloud

```bash
gcloud auth login
```

### 3. Set the Project

```bash
gcloud config set project findoc-deploy
```

### 4. Create Gemini API Key Secret

Create a secret in Secret Manager to store your Gemini API key:

```bash
echo "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-
```

Grant access to the App Engine service account:

```bash
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:findoc-app@findoc-deploy.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## Deployment

### Option 1: Using the Deployment Script

Run the deployment script:

```bash
powershell -ExecutionPolicy Bypass -File .\deploy-to-app-engine.ps1
```

### Option 2: Manual Deployment

1. Build the application:

```bash
npm install
npm run build
```

2. Deploy to App Engine:

```bash
gcloud app deploy app.yaml
```

## Local Testing

### Using Docker

1. Build and run the Docker container:

```bash
docker-compose -f docker-compose.app-engine.yml up --build
```

2. Access the application at http://localhost:8080

## Configuration

### Environment Variables

The following environment variables are used:

- `NODE_ENV`: Set to "production" for deployment
- `PORT`: The port to run the server on (default: 8080)
- `UPLOAD_FOLDER`: Folder for uploaded files (default: /tmp/uploads)
- `TEMP_FOLDER`: Folder for temporary files (default: /tmp/temp)
- `RESULTS_FOLDER`: Folder for results (default: /tmp/results)
- `GEMINI_API_KEY`: Your Gemini API key (stored in Secret Manager)

### app.yaml

The `app.yaml` file configures the App Engine deployment:

```yaml
runtime: nodejs18
service: findoc-app
env: standard
instance_class: F2

handlers:
  # Serve static files
  - url: /static
    static_dir: frontend/public
    secure: always

  # Serve all other requests with the app
  - url: /.*
    secure: always
    script: auto

env_variables:
  NODE_ENV: "production"
  API_URL: "https://findoc-app.appspot.com"
  PORT: "8080"
  UPLOAD_FOLDER: "/tmp/uploads"
  TEMP_FOLDER: "/tmp/temp"
  RESULTS_FOLDER: "/tmp/results"

automatic_scaling:
  min_instances: 1
  max_instances: 10
  min_idle_instances: 1
  max_concurrent_requests: 50
```

## Accessing the Deployed Application

After deployment, the application will be available at:

```
https://findoc-app.appspot.com
```

## Troubleshooting

### Viewing Logs

```bash
gcloud app logs tail
```

### Checking Application Status

```bash
gcloud app describe
```

### Checking Service Status

```bash
gcloud app services list
```
