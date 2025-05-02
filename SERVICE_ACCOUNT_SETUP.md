# Setting Up a User-Managed Service Account for Cloud Build

This guide explains how to set up a user-managed service account for Cloud Build, which is required by your organization policy.

## Step 1: Create a User-Managed Service Account

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "CREATE SERVICE ACCOUNT"
3. Name: "findoc-deployer"
4. Description: "Service account for deploying FinDoc Analyzer"
5. Click "CREATE AND CONTINUE"
6. Add the following roles:
   - Cloud Build Editor
   - Cloud Run Admin
   - Service Account User
   - Storage Admin
7. Click "CONTINUE"
8. Click "DONE"

## Step 2: Create a Logs Bucket

1. Go to [Cloud Storage](https://console.cloud.google.com/storage/browser)
2. Click "CREATE BUCKET"
3. Name: "devdoc-456420-build-logs"
4. Location: "us-central1"
5. Default storage class: "Standard"
6. Access control: "Uniform"
7. Click "CREATE"

## Step 3: Update Cloud Build Trigger

1. Go to [Cloud Build > Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Edit your "deploy-findoc" trigger
3. Under "Advanced", select the "findoc-deployer" service account
4. Click "UPDATE"

## Step 4: Run the Trigger

1. Go to [Cloud Build > Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Find your "deploy-findoc" trigger
3. Click "RUN TRIGGER"
4. Select the branch "master"
5. Click "RUN"

## Troubleshooting

If you encounter issues:

1. Check that the service account has all the necessary permissions
2. Verify that the logs bucket exists and is accessible
3. Check the Cloud Build logs for any errors
4. Make sure the service account is in the same project as your build trigger
