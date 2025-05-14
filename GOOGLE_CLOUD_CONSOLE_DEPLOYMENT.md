# Deploying FinDoc Analyzer to Google Cloud Console

This guide provides step-by-step instructions for deploying the FinDoc Analyzer application to Google Cloud using the Google Cloud Console.

## Prerequisites

- A Google Cloud account with billing enabled
- The FinDoc Analyzer repository on GitHub
- Google Cloud project with the necessary APIs enabled (Cloud Run, Cloud Build, Artifact Registry)

## Deployment Steps

### 1. Go to the Google Cloud Console

Open your browser and navigate to [Google Cloud Console](https://console.cloud.google.com/).

### 2. Select Your Project

Select the "findoc-deploy" project from the project dropdown at the top of the page.

### 3. Navigate to Cloud Run

In the navigation menu, go to "Cloud Run" under the "Serverless" section.

### 4. Create a New Service

Click the "CREATE SERVICE" button at the top of the page.

### 5. Configure the Service

#### Source and Authentication

- Select "Continuously deploy from a repository"
- Click "SET UP WITH CLOUD BUILD"
- Connect to your GitHub repository (aviadkim/backv2)
- Select the "main" branch
- Click "NEXT"

#### Build Configuration

- Build Type: Dockerfile
- Dockerfile location: Dockerfile
- Click "NEXT"

#### Service Configuration

- Service name: findoc-analyzer
- Region: europe-west3 (Frankfurt)
- CPU allocation and pricing: CPU is only allocated during request processing
- Minimum number of instances: 0
- Maximum number of instances: 10
- Memory: 2 GiB
- CPU: 2
- Request timeout: 300 seconds
- Ingress: Allow all traffic
- Authentication: Allow unauthenticated invocations

#### Environment Variables

Add the following environment variables:
- NODE_ENV: production
- UPLOAD_FOLDER: /app/uploads
- TEMP_FOLDER: /app/temp
- RESULTS_FOLDER: /app/results
- PYTHONPATH: /usr/local/lib/python3/site-packages

#### Secrets

Add the following secrets:
- DEEPSEEK_API_KEY: deepseek-api-key:latest
- SUPABASE_URL: supabase-url:latest
- SUPABASE_KEY: supabase-key:latest
- SUPABASE_SERVICE_KEY: supabase-service-key:latest

### 6. Create the Service

Click the "CREATE" button at the bottom of the page.

### 7. Monitor the Deployment

The deployment process will start automatically. You can monitor the progress in the Cloud Build logs.

### 8. Access the Application

Once the deployment is complete, you can access the application using the URL provided in the Cloud Run service details.

## Troubleshooting

### Build Failures

If the build fails, check the Cloud Build logs for details. Common issues include:

- Missing dependencies
- Errors in the Dockerfile
- Insufficient permissions

### Runtime Errors

If the application fails to start or crashes, check the Cloud Run logs for details. Common issues include:

- Missing environment variables
- Incorrect secret values
- Insufficient memory or CPU

## Next Steps

After successful deployment, you should:

1. Run the tests against the deployed application
2. Set up continuous integration with GitHub Actions
3. Configure monitoring and alerts
4. Set up custom domains if needed
