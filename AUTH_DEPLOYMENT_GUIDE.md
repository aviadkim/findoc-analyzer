# FinDoc Analyzer Authentication System Deployment Guide

This guide walks through deploying the JWT-based authentication system for FinDoc Analyzer to Google Cloud Run.

## Overview

The authentication system has been enhanced with the following features:

1. JWT-based token authentication
2. Proper login and registration API endpoints
3. Secure token storage in localStorage
4. Backwards compatibility with existing auth methods
5. Improved error handling and user feedback
6. Google authentication integration (mock implementation)

## Deployment Options

### Option 1: Manual Deployment

1. Build the Docker container:
   ```bash
   docker build -t findoc-analyzer-auth .
   ```

2. Run container locally for testing:
   ```bash
   docker run -p 8081:8081 -e JWT_SECRET=your-secret-here findoc-analyzer-auth
   ```

3. Tag and push to Google Container Registry:
   ```bash
   docker tag findoc-analyzer-auth gcr.io/your-project-id/findoc-analyzer-auth
   docker push gcr.io/your-project-id/findoc-analyzer-auth
   ```

4. Deploy to Cloud Run:
   ```bash
   gcloud run deploy findoc-analyzer-auth \
     --image gcr.io/your-project-id/findoc-analyzer-auth \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars JWT_SECRET=your-secret-here
   ```

### Option 2: Using the Deployment Script

1. Edit `deploy-to-google-cloud.sh` to set your project ID and other configuration
2. Run the deployment script:
   ```bash
   ./deploy-to-google-cloud.sh
   ```

### Option 3: Using Cloud Build

1. Configure Google Cloud Build with your repository
2. Manually trigger a build:
   ```bash
   gcloud builds submit --config cloudbuild.auth.yaml \
     --substitutions=_JWT_SECRET=your-secret-here
   ```

3. Or, set up a trigger to automatically deploy when changes are pushed to the repository

## Environment Variables

The following environment variables should be set when deploying:

- `JWT_SECRET`: Secret key for signing and verifying JWT tokens (required)
- `JWT_EXPIRY`: Token expiry time in JWT format (optional, defaults to "24h")
- `PORT`: Server port (optional, defaults to 8081)
- `NODE_ENV`: Environment mode (optional, defaults to "development")

## Testing the Deployment

1. After deployment, navigate to your Cloud Run service URL
2. Try logging in with the demo credentials:
   - Email: demo@example.com
   - Password: password
3. Verify that you can see the JWT token in localStorage
4. Test the registration flow by creating a new account
5. Test Google authentication by clicking the "Sign in with Google" button

## Security Considerations

- In production, ensure JWT_SECRET is a long, secure random string
- Store the JWT_SECRET as a secret in Google Secret Manager
- Consider implementing token refresh mechanisms for long-lived sessions
- Add rate limiting to login/register endpoints to prevent brute force attacks
- Enable HTTPS-only communication

## Troubleshooting

- If authentication fails, check your JWT_SECRET is correctly set
- Verify the server logs for any errors during authentication
- Ensure localStorage is working in your browser
- Check for any CORS issues if making requests from a different domain