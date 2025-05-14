# FinDoc Analyzer - Modern UI Deployment Guide

This guide provides instructions for deploying the FinDoc Analyzer Modern UI to Google App Engine.

## Prerequisites

Before deploying, ensure you have the following:

1. **Google Cloud SDK** installed and configured
2. **Node.js** installed (version 18 or higher)
3. Access to the Google Cloud project `findoc-deploy`
4. Proper permissions to deploy to Google App Engine

## Deployment Options

### Option 1: Using the Deployment Script (Recommended)

The easiest way to deploy is using the provided PowerShell script:

```powershell
.\deploy-modern-ui.ps1
```

This script will:
1. Set up the Google Cloud project
2. Create necessary directories
3. Copy modern UI files to the public directory
4. Deploy to Google App Engine
5. Open the deployed application in your browser

### Option 2: Manual Deployment

If you prefer to deploy manually:

1. Ensure all modern UI files are in the correct directories:
   - HTML files in `public/`
   - CSS files in `public/css/`
   - JavaScript files in `public/js/`
   - Images in `public/images/`

2. Deploy using gcloud:
   ```bash
   gcloud app deploy app.yaml --project=findoc-deploy --version=modern-ui-v1
   ```

## Configuration

### app.yaml

The `app.yaml` file contains the configuration for the App Engine deployment:

```yaml
runtime: nodejs18
env: standard
instance_class: F2

handlers:
  # Serve static files from /css
  - url: /css
    static_dir: public/css
    secure: always

  # Serve static files from /js
  - url: /js
    static_dir: public/js
    secure: always

  # Serve static files from /images
  - url: /images
    static_dir: public/images
    secure: always

  # Serve all other requests with the app
  - url: /.*
    secure: always
    script: auto

env_variables:
  NODE_ENV: "production"
  API_URL: "https://backv2-app-brfi73d4ra-zf.a.run.app"
  PORT: "8080"
  UPLOAD_FOLDER: "/tmp/uploads"
  TEMP_FOLDER: "/tmp/temp"
  RESULTS_FOLDER: "/tmp/results"
  SUPABASE_URL: "https://dnjnsotemnfrjlotgved.supabase.co"
  USE_MOCK_API: "false"
```

### Environment Variables

The following environment variables are used:

- `NODE_ENV`: Set to "production" for deployment
- `API_URL`: The URL of the backend API
- `PORT`: The port to run the server on (default: 8080)
- `UPLOAD_FOLDER`: Folder for uploaded files (default: /tmp/uploads)
- `TEMP_FOLDER`: Folder for temporary files (default: /tmp/temp)
- `RESULTS_FOLDER`: Folder for results (default: /tmp/results)
- `SUPABASE_URL`: The URL of the Supabase instance
- `USE_MOCK_API`: Whether to use mock API responses (default: false)

## Accessing the Deployed Application

After deployment, the application will be available at:

```
https://findoc-deploy.ey.r.appspot.com
```

## Troubleshooting

### Viewing Logs

To view logs from the deployed application:

```bash
gcloud app logs tail
```

### Checking Application Status

To check the status of the deployed application:

```bash
gcloud app describe
```

### Common Issues

1. **Deployment fails with permission error**
   - Ensure you have the necessary permissions to deploy to the project
   - Run `gcloud auth login` to authenticate

2. **Static files not loading**
   - Check that the files are in the correct directories
   - Verify the handlers in app.yaml are correctly configured

3. **Application crashes on startup**
   - Check the logs for error messages
   - Verify that all required environment variables are set

## Additional Resources

- [Google App Engine Documentation](https://cloud.google.com/appengine/docs)
- [Node.js on App Engine](https://cloud.google.com/appengine/docs/standard/nodejs)
- [Deploying to App Engine](https://cloud.google.com/appengine/docs/standard/nodejs/building-app/deploying-web-service)
