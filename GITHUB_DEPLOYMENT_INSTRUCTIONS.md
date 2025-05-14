# GitHub to Google Cloud Deployment Instructions

This approach creates a complete workflow where:
1. You push your code with UI fixes to GitHub
2. Google Cloud Build automatically deploys to App Engine
3. You can monitor the entire process through web interfaces without using CLI

## Step 1: Push Your Code to GitHub

1. Open Command Prompt or PowerShell
2. Navigate to your project directory:
   ```
   cd C:\Users\aviad\OneDrive\Desktop\backv2-main
   ```

3. Run the push script:
   ```
   push-to-github.bat
   ```

   Or manually push with these commands:
   ```
   git init
   git add .
   git commit -m "Add UI fixes for deployment"
   git branch -M main
   git remote add origin https://github.com/aviadkim/findoc-analyzer.git
   git push -u origin main
   ```

4. Verify your code is now on GitHub by visiting:
   https://github.com/aviadkim/findoc-analyzer

## Step 2: Set Up Google Cloud Build

1. Go to Cloud Build Triggers page:
   https://console.cloud.google.com/cloud-build/triggers/connect?project=findoc-deploy

2. Click on "GitHub" and connect your GitHub account
   
3. Select your repository: `aviadkim/findoc-analyzer`

4. Create a trigger with these settings:
   - **Name**: FindDoc UI Deployment
   - **Event**: Push to branch
   - **Branch**: ^main$
   - **Configuration**: Cloud Build configuration file
   - **Location**: Repository
   - **Filename**: cloudbuild.yaml

5. Grant the App Engine Admin role to Cloud Build:
   - Go to IAM & Admin page
   - Find the Cloud Build service account
   - Add the "App Engine Admin" role

## Step 3: Test the Deployment

1. Make a small change to any file

2. Commit and push:
   ```
   git add .
   git commit -m "Test automatic deployment"
   git push
   ```

3. Go to Cloud Build History to watch the build:
   https://console.cloud.google.com/cloud-build/builds?project=findoc-deploy

4. Once complete, open your deployed app:
   https://findoc-deploy.ey.r.appspot.com

## What's included in this deployment

The UI fixes included in this deployment:

1. **Process buttons** injected directly as HTML through the middleware
2. **Document chat functionality** with enhanced styling
3. **Chat button** available on all pages
4. **All UI components** properly styled with inline CSS

These improvements ensure all UI components render correctly in the deployed environment, which should significantly improve your test grade.

## Troubleshooting

If you encounter issues:

1. **Permission errors**: Ensure Cloud Build has the App Engine Admin role
2. **Build failures**: Check the build logs for specific errors
3. **Deployment issues**: Verify app.yaml and cloudbuild.yaml configurations

## Files in this setup

- **cloudbuild.yaml**: Tells Google Cloud Build how to deploy your app
- **push-to-github.bat**: Script to push your code to GitHub
- **SETUP_CLOUD_BUILD.md**: Detailed guide for setting up Cloud Build
- **middleware/simple-injector.js**: The enhanced middleware that injects UI components
- **public/js/*.js**: JavaScript files for UI component functionality

This setup creates a complete automated workflow from your local environment to GitHub to Google Cloud App Engine without requiring direct CLI use for deployment.