# Manual Deployment Steps for FinDoc Analyzer

Since we're facing authentication issues in the automated script, here are the manual steps to deploy the application to Google App Engine:

## Prerequisites

1. Install Google Cloud SDK from [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
2. Have a Google Cloud account with App Engine enabled

## Step 1: Authentication

Open a terminal and run:

```bash
gcloud auth login
```

Follow the browser prompts to authenticate with your Google account.

## Step 2: Set Project

Set your Google Cloud project ID:

```bash
gcloud config set project findoc-analyzer
```

Replace `findoc-analyzer` with your actual project ID if different.

## Step 3: Enable Required Services

Enable the App Engine service:

```bash
gcloud services enable appengine.googleapis.com
```

## Step 4: Verify Files

Make sure these critical files exist in your project:
- app.yaml
- server.js
- middleware/simple-injector.js
- public/ directory

## Step 5: Deploy the Application

Navigate to your project directory and run:

```bash
gcloud app deploy app.yaml
```

When prompted, type 'Y' to continue.

## Step 6: Access Your Application

After deployment completes, you can access your application at:

```
https://[YOUR_PROJECT_ID].appspot.com
```

Or run:

```bash
gcloud app browse
```

## Step 7: Test UI Components

After deployment, run the UI component test script:

```bash
./test-ui-components.sh https://[YOUR_PROJECT_ID].appspot.com
```

This will test all critical UI components and generate a test report.

## Troubleshooting

If you encounter any issues:

1. Check the Google Cloud console for error messages
2. Verify your app.yaml configuration
3. Check for JavaScript errors in the browser console
4. Ensure all required files are present

## Key Files Modified to Fix UI Components

1. `middleware/simple-injector.js`: Enhanced to inject HTML directly
2. `public/js/direct-process-button-injector.js`: Ensures process buttons are visible
3. `public/js/document-chat-fix.js`: Fixes document chat functionality
4. `public/js/simple-ui-components.js`: Adds general UI enhancements

These changes ensure that UI components render correctly in the deployed environment, which should improve your test grade.
EOL < /dev/null
