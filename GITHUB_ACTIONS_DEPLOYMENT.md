# GitHub Actions Deployment to Google Cloud Run

This document provides instructions for setting up automated deployments to Google Cloud Run using GitHub Actions.

## Benefits of GitHub Actions Deployment

1. **One-time setup, continuous deployment** - Set it up once, then just push to GitHub
2. **No manual deployment steps** - Everything happens automatically when you commit
3. **Better error handling** - Clearer logs and error messages in GitHub Actions
4. **Version control + deployment history** - Track both code changes and deployments
5. **No dependency problems** - The build process runs in clean containers with proper dependency management

## Prerequisites

- A GitHub repository (you already have: `https://github.com/aviadkim/findoc-analyzer.git`)
- A Google Cloud project with Cloud Run enabled
- Docker installed locally (for testing builds)

## Setup Instructions

### 1. Create a Google Cloud Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Click "Create Service Account"
4. Enter a name (e.g., `github-actions-deployer`) and description
5. Click "Create and Continue"
6. Add the following roles:
   - Cloud Run Admin
   - Storage Admin
   - Service Account User
   - Artifact Registry Admin
7. Click "Done"

### 2. Create and Download a Service Account Key

1. In the Service Accounts list, find the account you just created
2. Click the three dots menu (⋮) and select "Manage keys"
3. Click "Add Key" > "Create new key"
4. Choose JSON format and click "Create"
5. Save the downloaded JSON file securely (you'll need it in the next step)

### 3. Add Secrets to Your GitHub Repository

1. Go to your GitHub repository (`https://github.com/aviadkim/findoc-analyzer`)
2. Navigate to "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add the following secrets:
   - Name: `GCP_PROJECT_ID`
   - Value: Your Google Cloud project ID (e.g., `track2-entity-recognition-2025`)
5. Click "Add secret"
6. Add another secret:
   - Name: `GCP_SA_KEY`
   - Value: The entire content of the JSON key file you downloaded (copy and paste the whole file)
7. Click "Add secret"

### 4. Configure the GitHub Actions Workflow

The workflow file has already been created at `.github/workflows/deploy-to-cloud-run-complete.yml`. This workflow will:

- Trigger on pushes to the `main` and `feature/user-feedback-analytics` branches
- Build a Docker container using `Dockerfile.cloud-run`
- Push the container to Google Container Registry
- Deploy the container to Google Cloud Run
- Create a deployment tag in Git for tracking

### 5. Push Your Code to GitHub

```bash
# Make sure you're on the right branch
git checkout feature/user-feedback-analytics

# Add all files
git add .

# Commit your changes
git commit -m "Set up GitHub Actions deployment to Cloud Run"

# Push to GitHub
git push origin feature/user-feedback-analytics
```

### 6. Monitor the Deployment

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. You should see your workflow running (if you just pushed to a trigger branch)
4. Click on the workflow run to see detailed logs and progress

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Check that your `GCP_SA_KEY` secret is correctly formatted (it should be the entire JSON file)
   - Verify that the service account has the necessary permissions

2. **Build Failures**:
   - Check the Dockerfile for errors
   - Ensure all dependencies are correctly specified

3. **Deployment Failures**:
   - Check if the service already exists in Cloud Run
   - Verify region settings
   - Check resource allocations (memory, CPU)

### Viewing Logs

- GitHub Actions logs are available in the "Actions" tab of your repository
- Cloud Run logs are available in the Google Cloud Console under "Cloud Run" > [Your Service] > "Logs"

## Additional Configuration

### Environment Variables

You can add environment variables to your Cloud Run service by modifying the `--set-env-vars` flag in the workflow file.

### Resource Allocation

You can adjust memory, CPU, and scaling settings by modifying the flags in the workflow file:

```yaml
flags: |
  --memory=1Gi
  --cpu=1
  --max-instances=5
  --min-instances=1
```

### Custom Domains

To set up a custom domain for your Cloud Run service:

1. Go to the Google Cloud Console
2. Navigate to "Cloud Run" > [Your Service]
3. Click "Domain Mappings" > "Add Mapping"
4. Follow the instructions to verify domain ownership and set up the mapping

## Conclusion

With GitHub Actions deployment set up, you now have a fully automated CI/CD pipeline for your application. Simply push your changes to the configured branches, and GitHub Actions will handle the rest!

For more information, refer to:
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Google Cloud Run documentation](https://cloud.google.com/run/docs)
