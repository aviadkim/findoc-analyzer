# Google Cloud Deployment Guide for FinDoc Analyzer

This guide provides detailed instructions for deploying the FinDoc Analyzer application to Google Cloud Platform.

## Prerequisites

Before deploying, ensure you have the following:

1. **Google Cloud SDK** installed and configured
2. **Node.js** installed (version 18 or higher)
3. Access to the Google Cloud project `findoc-deploy`
4. Proper permissions to deploy to Google App Engine or Cloud Run

## Authentication and Setup

### Step 1: Install Google Cloud SDK

If not already installed, download and install the Google Cloud SDK from:
https://cloud.google.com/sdk/docs/install

### Step 2: Authenticate with Google Cloud

```bash
gcloud auth login
```

Follow the prompts to authenticate with your Google account that has access to the `findoc-deploy` project.

### Step 3: Set the Project

```bash
gcloud config set project findoc-deploy
```

### Step 4: Enable Required APIs

```bash
gcloud services enable appengine.googleapis.com cloudbuild.googleapis.com run.googleapis.com secretmanager.googleapis.com
```

## Deployment Options

### Option 1: Deploy to Google App Engine

#### Using the Deployment Script

The easiest way to deploy is using the provided PowerShell script:

```powershell
npm run deploy:modern-ui
```

or directly:

```powershell
.\deploy-modern-ui.ps1
```

#### Manual Deployment

1. Ensure all files are in the correct directories
2. Deploy using gcloud:

```bash
gcloud app deploy app.yaml --project=findoc-deploy --version=modern-ui-v1
```

### Option 2: Deploy to Google Cloud Run

#### Using the Deployment Script

```powershell
.\deploy-to-gcloud.ps1
```

#### Manual Deployment

1. Build the Docker image:

```bash
docker build -t gcr.io/findoc-deploy/findoc-analyzer:latest .
```

2. Push the image to Google Container Registry:

```bash
docker push gcr.io/findoc-deploy/findoc-analyzer:latest
```

3. Deploy to Cloud Run:

```bash
gcloud run deploy findoc-analyzer \
  --image gcr.io/findoc-deploy/findoc-analyzer:latest \
  --platform managed \
  --region europe-west3 \
  --allow-unauthenticated
```

## Secret Management

### API Keys and Sensitive Information

All API keys and sensitive information should be stored in Google Cloud Secret Manager:

1. Create a secret:

```bash
echo -n "your-api-key" | gcloud secrets create API_KEY_NAME --data-file=-
```

2. Grant access to the secret:

```bash
gcloud secrets add-iam-policy-binding API_KEY_NAME \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

3. Reference the secret in app.yaml:

```yaml
env_variables:
  API_KEY: "sm://projects/findoc-deploy/secrets/API_KEY_NAME/versions/latest"
```

## Important Credentials and Configuration

### Supabase Configuration

- **Supabase URL**: `https://dnjnsotemnfrjlotgved.supabase.co`
- **Supabase Key**: The key is stored in Google Cloud Secret Manager as `supabase-key`

### API Keys

The following API keys are stored in Google Cloud Secret Manager:

- **Gemini API Key**: `gemini-api-key`
- **OpenRouter API Key**: `openrouter-api-key`
- **DeepSeek API Key**: `deepseek-api-key`

### Service Accounts

The application uses the default service account for the `findoc-deploy` project:
`findoc-deploy@appspot.gserviceaccount.com`

## Monitoring and Troubleshooting

### Viewing Logs

```bash
# App Engine logs
gcloud app logs tail

# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=findoc-analyzer" --limit=50
```

### Checking Application Status

```bash
# App Engine status
gcloud app describe

# Cloud Run status
gcloud run services describe findoc-analyzer --region=europe-west3
```

## Deployment Verification

After deployment, verify that the application is running correctly:

1. Open the application URL:
   - App Engine: `https://findoc-deploy.ey.r.appspot.com`
   - Cloud Run: The URL will be displayed after deployment

2. Check the health endpoint:
   - `/api/health`

3. Test the login functionality:
   - `/login.html`

4. Test the upload functionality:
   - `/upload.html`

## Rollback Procedures

If the deployment fails or introduces issues:

### App Engine Rollback

```bash
gcloud app versions list
gcloud app services set-traffic default --splits=PREVIOUS_VERSION_ID=1
```

### Cloud Run Rollback

```bash
gcloud run services update-traffic findoc-analyzer --to-revisions=PREVIOUS_REVISION=100 --region=europe-west3
```

## Additional Resources

- [Google App Engine Documentation](https://cloud.google.com/appengine/docs)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Google Cloud Build](https://cloud.google.com/build/docs)
