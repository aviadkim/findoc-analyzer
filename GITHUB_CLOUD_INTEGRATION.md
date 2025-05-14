# GitHub to Google Cloud Integration Guide

This guide will help you set up automatic deployment from GitHub to Google Cloud App Engine without needing to use the CLI directly.

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click "New" to create a new repository
3. Name it "findoc-analyzer" or any name you prefer
4. Make it private if you want to keep the code secure
5. Click "Create repository"

## Step 2: Push Code to GitHub

Run these commands in your project directory (or use GitHub Desktop):

```bash
git init
git add .
git commit -m "Initial commit with UI fixes"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/findoc-analyzer.git
git push -u origin main
```

## Step 3: Connect GitHub to Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "Cloud Build" > "Triggers"
3. Click "Connect Repository"
4. Select GitHub as the source
5. Authenticate with GitHub when prompted
6. Select your repository
7. Click "Connect"

## Step 4: Create Deployment Trigger

1. Click "Create Trigger"
2. Enter a name like "Deploy to App Engine"
3. Set source to your GitHub repository
4. Set the event to "Push to branch"
5. Set the branch to "^main$"
6. Under "Configuration", select "Cloud Build configuration file (yaml or json)"
7. Make sure it points to "cloudbuild.yaml" in the repository
8. Click "Create"

## Step 5: Test the Integration

1. Make a small change to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Test automatic deployment"
   git push
   ```
3. Go to Google Cloud Console > Cloud Build > History
4. You should see a new build running
5. Once complete, your app will be deployed to App Engine

## Step 6: Access Your App

Once deployed, access your app at:
```
https://findoc-deploy.ey.r.appspot.com
```

## Troubleshooting

If the build fails, check the build logs in Google Cloud Console for details on what went wrong.

Common issues:
- Missing permissions - Make sure Cloud Build has App Engine Admin role
- Invalid configuration - Check cloudbuild.yaml for syntax errors
- Deployment errors - Check app.yaml for configuration issues

## Grant Required Permissions

Cloud Build needs permission to deploy to App Engine:

1. Go to Google Cloud Console > IAM & Admin
2. Find the Cloud Build service account (ends with @cloudbuild.gserviceaccount.com)
3. Click the pencil icon to edit
4. Add the "App Engine Admin" role
5. Click "Save"

This setup provides a complete flow from GitHub to Google Cloud without requiring direct CLI usage.
EOF < /dev/null
