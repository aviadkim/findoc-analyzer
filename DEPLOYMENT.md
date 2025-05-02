# FinDoc Analyzer Deployment Guide

This document provides instructions for deploying the FinDoc Analyzer application to Google App Engine and Docker.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [Docker](https://www.docker.com/get-started) (for containerized deployment)
- [Docker Compose](https://docs.docker.com/compose/install/) (for local containerized development)

## Deployment Options

FinDoc Analyzer can be deployed in several ways:

1. **Local Development**: Run the application locally for development and testing
2. **Docker Containerization**: Run the application in a Docker container
3. **Google App Engine**: Deploy the application to Google App Engine

## 1. Local Development

To run the application locally for development:

```bash
# Install dependencies
npm install

# Start the application
npm start
```

The application will be available at http://localhost:8080.

## 2. Docker Containerization

To run the application in a Docker container:

```bash
# Build the Docker image
docker build -t findoc-analyzer .

# Run the container
docker run -p 8080:8080 findoc-analyzer
```

Alternatively, you can use Docker Compose:

```bash
# Start the application with Docker Compose
docker-compose up -d

# Stop the application
docker-compose down
```

The application will be available at http://localhost:8080.

## 3. Google App Engine Deployment

To deploy the application to Google App Engine:

### Manual Deployment

```bash
# Install dependencies
npm install

# Deploy to Google App Engine
gcloud app deploy app.yaml
```

### Using the Deployment Script

We provide a PowerShell script for easy deployment:

```powershell
# Run the deployment script
.\deploy.ps1
```

The script will:
1. Check if Google Cloud SDK is installed
2. Verify authentication
3. Check if the project exists
4. Create app.yaml if it doesn't exist
5. Install dependencies
6. Build the application
7. Deploy to Google App Engine

## Configuration

### Environment Variables

The application can be configured using the following environment variables:

- `NODE_ENV`: Environment mode (development, production)
- `PORT`: Port to listen on (default: 8080)
- `UPLOAD_FOLDER`: Directory for uploaded files
- `TEMP_FOLDER`: Directory for temporary files
- `RESULTS_FOLDER`: Directory for processing results

### app.yaml Configuration

For Google App Engine deployment, the app.yaml file should contain:

```yaml
runtime: nodejs18
service: default

env_variables:
  NODE_ENV: "production"
  UPLOAD_FOLDER: "/tmp/uploads"
  TEMP_FOLDER: "/tmp/temp"
  RESULTS_FOLDER: "/tmp/results"

handlers:
  - url: /.*
    script: auto
    secure: always
```

## Monitoring and Logging

### Google App Engine

To view logs in Google App Engine:

```bash
# View logs
gcloud app logs tail -s default
```

To monitor the application:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to App Engine > Dashboard

### Docker

To view logs in Docker:

```bash
# View logs
docker logs <container-id>

# Or with Docker Compose
docker-compose logs
```

## Troubleshooting

### Common Issues

1. **Application fails to start**
   - Check if all dependencies are installed
   - Verify environment variables are set correctly
   - Check if required directories exist and are writable

2. **File upload fails**
   - Check if upload directory exists and is writable
   - Verify file size limits in the application

3. **Document processing fails**
   - Check if all processing dependencies are installed
   - Verify temp and results directories exist and are writable

### Getting Help

If you encounter issues not covered in this guide, please:

1. Check the application logs for error messages
2. Consult the [Google App Engine documentation](https://cloud.google.com/appengine/docs)
3. Consult the [Docker documentation](https://docs.docker.com/)
4. Contact the development team for assistance
