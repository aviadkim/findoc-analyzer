# GitHub Actions Automated Deployment Setup

This guide shows you how to set up fully automated deployment from GitHub to Google App Engine using GitHub Actions. Once configured, every push to your GitHub repository will automatically deploy to Google Cloud.

## Step 1: Generate a Google Cloud Service Account Key

First, you need to create a service account with the right permissions and generate a key:

1. Go to Google Cloud Console:
   https://console.cloud.google.com/iam-admin/serviceaccounts?project=findoc-deploy

2. Click "CREATE SERVICE ACCOUNT"

3. Enter details:
   - Name: `github-deployment`
   - Description: `Service account for GitHub Actions deployment`
   - Click "CREATE AND CONTINUE"

4. Add roles:
   - Click "ADD ANOTHER ROLE"
   - Add these roles:
     - "App Engine Admin"
     - "Cloud Build Editor"
     - "Service Account User"
     - "Storage Admin"
   - Click "CONTINUE"

5. Click "DONE"

6. Find your new service account in the list and click the three dots (⋮) at the end of the row

7. Click "Manage keys"

8. Click "ADD KEY" → "Create new key"

9. Choose "JSON" and click "CREATE"

10. Save the JSON file to your computer (it will download automatically)

## Step 2: Add the Service Account Key to GitHub Secrets

1. Go to your GitHub repository:
   https://github.com/aviadkim/findoc-analyzer

2. Click on "Settings" tab

3. Click on "Secrets and variables" → "Actions" in the left sidebar

4. Click "New repository secret"

5. Enter these details:
   - Name: `GCP_SA_KEY`
   - Value: *copy and paste the entire contents of the JSON file you downloaded*

6. Click "Add secret"

## Step 3: Push Your Code with the Workflow File

The workflow file is already set up in your code at `.github/workflows/deploy-to-gcloud.yml`. You just need to push everything to GitHub:

1. Open Command Prompt or PowerShell
2. Navigate to your project directory:
   ```
   cd C:\Users\aviad\OneDrive\Desktop\backv2-main
   ```

3. Push to GitHub:
   ```
   git init
   git add .
   git commit -m "Add GitHub Actions for automatic deployment"
   git branch -M main
   git remote add origin https://github.com/aviadkim/findoc-analyzer.git
   git push -u origin main
   ```

## Step 4: Watch the Deployment

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. You should see a workflow running
4. Once it completes successfully, your app will be deployed to:
   https://findoc-deploy.ey.r.appspot.com

## How It Works

The GitHub Actions workflow will:

1. Run every time you push to the main, master, or ui-components-only branch
2. Set up Node.js and install dependencies
3. Authenticate with Google Cloud using your service account key
4. Create necessary directories for the modern UI
5. Create modern-ui.css if it doesn't exist
6. Deploy your app to Google App Engine
7. Run basic tests to verify the deployment

## Future Deployments

For all future code changes, you just need to:

1. Make your changes locally
2. Commit them
3. Push to GitHub:
   ```
   git add .
   git commit -m "Your commit message"
   git push
   ```

The deployment will happen automatically!

## Testing the Workflow

To verify everything is working:

1. Make a small change to any file
2. Commit and push it
3. Go to the "Actions" tab on GitHub
4. Watch the workflow run
5. After it completes, check your app at https://findoc-deploy.ey.r.appspot.com

## Troubleshooting

If the workflow fails:

1. Check the workflow logs by clicking on the failed job in the Actions tab
2. Common issues:
   - Invalid service account key
   - Missing permissions
   - Errors in your application code

If you need to update the workflow:

1. Edit the file `.github/workflows/deploy-to-gcloud.yml`
2. Commit and push your changes