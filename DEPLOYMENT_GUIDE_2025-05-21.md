# FinDoc Analyzer Deployment Guide

This guide outlines the steps to deploy the FinDoc Analyzer application to Google Cloud Run using either manual deployment or GitHub Actions.

## Prerequisites

- Git
- Node.js and npm
- Docker
- Google Cloud SDK (gcloud)
- Google Cloud Platform account with:
  - Cloud Run API enabled
  - Container Registry API enabled
  - Service account with appropriate permissions

## Manual Deployment

### 1. Clone the Repository

```bash
git clone https://github.com/aviadkim/findoc-analyzer.git
cd findoc-analyzer
```

### 2. Checkout the Latest Branch

```bash
git checkout ui-modernization-2025
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Tests

```bash
node api-test.js
```

### 5. Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project findoc-deploy
```

### 6. Build and Deploy with Script

```bash
chmod +x deploy-to-cloud-run.sh
./deploy-to-cloud-run.sh
```

## GitHub Actions Deployment (Automated CI/CD)

The repository is configured with GitHub Actions for automated deployment to Google Cloud Run.

### Setting Up GitHub Actions

1. In your GitHub repository, go to Settings > Secrets > Actions
2. Add the following secrets:
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_SA_KEY`: The JSON service account key (base64-encoded)

### Triggering a Deployment

Deployments will automatically trigger when:
- Code is pushed to the `main` branch
- Code is pushed to the `ui-modernization-2025` branch
- The workflow is manually triggered from GitHub Actions tab

## Verification

After deployment, verify the application is working by:

1. Accessing the Cloud Run URL provided in the deployment output
2. Testing the API health endpoint:
   ```
   curl https://your-cloud-run-url.run.app/api/health
   ```
3. Accessing the UI routes:
   - `/` - Home page
   - `/login` - Login page
   - `/upload` - Upload page
   - `/documents` - Documents page
   - `/document-chat` - Document chat page
   - `/analytics` - Analytics page

## Recent Deployment Changes

The latest deployment includes:

1. Fixed routing to serve correct HTML files for different routes
2. Added explicit route mappings for main UI pages
3. Improved error handling and fallback mechanisms
4. Enhanced API endpoint tests

## Troubleshooting

If you encounter issues with the deployment:

1. Check the deployment logs in Google Cloud Console
2. Verify the service account permissions
3. Make sure all APIs are enabled in Google Cloud
4. Check the GitHub Actions workflow logs for errors

## Rollback Procedure

To rollback to a previous version:

1. Go to Google Cloud Console > Cloud Run
2. Select the service 
3. Click "REVISIONS" 
4. Select the previous working revision
5. Click "SET AS NEW DEFAULT"

## Contact

For deployment issues, contact the FinDoc Analyzer team at `support@example.com`.
EOF < /dev/null
