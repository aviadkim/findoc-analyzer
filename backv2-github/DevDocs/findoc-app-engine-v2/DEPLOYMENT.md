# FinDoc Analyzer Deployment Guide

This guide provides instructions for deploying the FinDoc Analyzer application to Google App Engine.

## Prerequisites

1. **Google Cloud SDK**: Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. **Node.js**: Install [Node.js](https://nodejs.org/) (v18 or later)
3. **Google Cloud Account**: Create a [Google Cloud account](https://cloud.google.com/) if you don't have one
4. **Google Cloud Project**: Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
5. **App Engine**: Enable the [App Engine API](https://console.cloud.google.com/apis/library/appengine.googleapis.com)
6. **Secret Manager**: Enable the [Secret Manager API](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com)

## Configuration

### 1. Set up Google Cloud SDK

```bash
# Install Google Cloud SDK (if not already installed)
# Follow instructions at https://cloud.google.com/sdk/docs/install

# Authenticate with Google Cloud
gcloud auth login

# Set the project
gcloud config set project findoc-deploy
```

### 2. Set up Secrets

```bash
# Create secrets in Secret Manager
gcloud secrets create gemini-api-key --replication-policy="automatic"
gcloud secrets create openrouter-api-key --replication-policy="automatic"

# Add versions to the secrets
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key --data-file=-
echo -n "YOUR_OPENROUTER_API_KEY" | gcloud secrets versions add openrouter-api-key --data-file=-

# Grant access to the App Engine service account
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:findoc-deploy@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding openrouter-api-key \
    --member="serviceAccount:findoc-deploy@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### 3. Configure app.yaml

The `app.yaml` file contains the configuration for the App Engine deployment. Make sure it includes:

- Runtime configuration
- Environment variables
- Secret Manager references
- Scaling configuration
- Handlers configuration

## Deployment

### Option 1: Using npm scripts

```bash
# Run pre-deployment checks
npm run predeploy

# Deploy to Google App Engine
npm run deploy

# Verify deployment
npm run verify
```

### Option 2: Using Windows Batch Script

```bash
# Run the deployment script
npm run deploy:win
```

### Option 3: Using PowerShell Script

```bash
# Run the deployment script
npm run deploy:ps
```

### Option 4: Using gcloud directly

```bash
# Deploy to Google App Engine
gcloud app deploy app.yaml --project=findoc-deploy
```

## Verification

After deployment, verify that the application is running correctly:

1. Open the application URL: https://findoc-deploy.ey.r.appspot.com
2. Check the health endpoint: https://findoc-deploy.ey.r.appspot.com/api/health
3. Test the PDF processing functionality: https://findoc-deploy.ey.r.appspot.com/test-pdf-processing.html

## Troubleshooting

### Deployment Failures

If deployment fails, check the following:

1. **Logs**: Check the logs in the Google Cloud Console
   ```bash
   gcloud app logs tail -s default
   ```

2. **Configuration**: Verify the `app.yaml` file is correct
   ```bash
   gcloud app deploy --verbosity=debug app.yaml
   ```

3. **Permissions**: Verify the service account has the necessary permissions
   ```bash
   gcloud projects get-iam-policy findoc-deploy
   ```

### Application Errors

If the application is deployed but not working correctly, check the following:

1. **Logs**: Check the logs in the Google Cloud Console
   ```bash
   gcloud app logs tail -s default
   ```

2. **Health Check**: Check the health endpoint
   ```bash
   curl https://findoc-deploy.ey.r.appspot.com/api/health
   ```

3. **Environment Variables**: Verify the environment variables are set correctly
   ```bash
   gcloud app describe
   ```

## Rollback

If you need to rollback to a previous version:

```bash
# List versions
gcloud app versions list

# Migrate traffic to a specific version
gcloud app services set-traffic default --splits=VERSION_ID=1
```

## Continuous Deployment

For continuous deployment, you can use GitHub Actions. The workflow is defined in `.github/workflows/deploy-to-gae.yml`.

To set up GitHub Actions:

1. Add the following secrets to your GitHub repository:
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_SA_KEY`: Your Google Cloud service account key (base64 encoded)

2. Push to the `main` branch to trigger the deployment workflow

## Additional Resources

- [Google App Engine Documentation](https://cloud.google.com/appengine/docs)
- [Google Cloud Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
