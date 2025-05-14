# Set Up Cloud Build for Automatic Deployment

Now that your code is on GitHub, follow these steps to set up automatic deployment from GitHub to Google App Engine using Google Cloud Build.

## Step 1: Connect Your Repository to Cloud Build

1. Go to the Cloud Build triggers page:
   [https://console.cloud.google.com/cloud-build/triggers/connect?project=findoc-deploy](https://console.cloud.google.com/cloud-build/triggers/connect?project=findoc-deploy)

2. Click on "GitHub" as the source

3. Follow the authentication steps to connect your GitHub account to Google Cloud

4. Select your repository: `aviadkim/findoc-analyzer`

5. Click "Connect"

## Step 2: Create a Build Trigger

1. Once connected, click "Create Trigger"

2. Fill in the following:
   - **Name**: FindDoc UI Deployment
   - **Description**: Automatically deploy UI fixes to App Engine
   - **Event**: Push to a branch
   - **Branch**: `^main$` (This means only the main branch)
   - **Configuration**: Cloud Build configuration file (yaml or json)
   - **Location**: Repository
   - **Cloud Build configuration file location**: `cloudbuild.yaml`

3. Click "Create"

## Step 3: Grant Permissions

Cloud Build needs permission to deploy to App Engine:

1. Go to IAM & Admin page:
   [https://console.cloud.google.com/iam-admin/iam?project=findoc-deploy](https://console.cloud.google.com/iam-admin/iam?project=findoc-deploy)

2. Find the Cloud Build service account (should look like: `[PROJECT-NUMBER]@cloudbuild.gserviceaccount.com`)

3. Click the pencil icon to edit permissions

4. Click "Add another role"

5. Search for "App Engine Admin" and select it

6. Click "Save"

## Step 4: Trigger a Build (Testing the Setup)

1. Make a small change to any file in your repository

2. Commit and push:
   ```
   git add .
   git commit -m "Test automatic deployment"
   git push
   ```

3. Go to the Cloud Build history page:
   [https://console.cloud.google.com/cloud-build/builds?project=findoc-deploy](https://console.cloud.google.com/cloud-build/builds?project=findoc-deploy)

4. You should see a build starting automatically

5. Once the build completes successfully, your application will be deployed to:
   [https://findoc-deploy.ey.r.appspot.com](https://findoc-deploy.ey.r.appspot.com)

## Troubleshooting

If your build fails, look at the build logs for error details. Common issues:

1. **Permission errors**: Make sure Cloud Build has App Engine Admin role
2. **Configuration errors**: Verify your cloudbuild.yaml and app.yaml are correctly formatted
3. **Build timeouts**: For large projects, you might need to increase the timeout in cloudbuild.yaml

## What's Next?

With this setup complete, your workflow is now:

1. Make changes to your code locally
2. Commit and push to GitHub
3. Cloud Build automatically detects the changes and deploys to App Engine
4. Your deployed application is updated with the UI fixes

This allows you to deploy without directly using the Google Cloud CLI, as everything happens through GitHub and the Google Cloud web console\!
EOF < /dev/null
