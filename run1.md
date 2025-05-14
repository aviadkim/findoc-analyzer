# FinDoc Analyzer: Complete Guide

This document provides a comprehensive guide to the FinDoc Analyzer application, including how to run it locally, deploy it to Google Cloud, and understand its structure and tools.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Running Locally](#running-locally)
4. [Deploying to Google Cloud](#deploying-to-google-cloud)
5. [MCP Tools](#mcp-tools)
6. [Troubleshooting](#troubleshooting)

## Project Overview

FinDoc Analyzer (also known as FinDocRAG) is a SaaS application for financial document processing and analysis. It processes financial documents (PDF/Excel/CSV), stores data in databases, answers questions, builds tables, and performs analysis with financial data.

The system uses a multi-agent architecture:
- Document Analyzer
- Table Understanding
- Securities Extractor
- Financial Reasoner

The application extracts and displays financial information such as ISIN, quantity, average acquisition price, valuation, and percentage in assets from documents.

## Project Structure

The project is organized as follows:

```
backv2/
├── DevDocs/                  # Documentation and backend code
│   ├── backend/              # Backend server code
│   └── frontend/             # Frontend UI code
├── FinDocRAG/                # Financial Document RAG implementation
├── public/                   # Static assets
├── routes/                   # API routes
├── services/                 # Service implementations
├── src/                      # Source code
├── uploads/                  # Uploaded files directory
├── temp/                     # Temporary files directory
├── results/                  # Results directory
├── server.js                 # Main server file
├── server-simple.js          # Simplified server implementation
├── package.json              # Node.js dependencies
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
├── cloudbuild.yaml           # Google Cloud Build configuration
└── app.yaml                  # Google App Engine configuration
```

Key files:
- `server.js` / `server-simple.js`: Main application entry points
- `Dockerfile`: Docker container configuration
- `cloudbuild.yaml`: Google Cloud Build deployment configuration
- `docker-compose.yml`: Local Docker deployment configuration

## Running Locally

There are several ways to run the application locally:

### Method 1: Direct Node.js

```powershell
# Run the backend only
powershell -ExecutionPolicy Bypass -File .\run-findoc-simple.ps1

# Run both frontend and backend
powershell -ExecutionPolicy Bypass -File .\run-findoc-fixed.ps1
```

### Method 2: Using Docker

```powershell
# Run with Docker Compose
powershell -ExecutionPolicy Bypass -File .\run-docker.ps1
```

The `run-docker.ps1` script:
1. Creates necessary directories (uploads, temp, results)
2. Builds and starts the Docker containers
3. Opens the application in your default browser
4. Displays the logs

When running locally, the application is accessible at:
- http://localhost:8080

### Method 3: Using FinDoc RAG

```powershell
# Run FinDoc RAG backend
powershell -ExecutionPolicy Bypass -File .\run-findoc-rag.ps1

# Run FinDoc with RAG (frontend and backend)
powershell -ExecutionPolicy Bypass -File .\run-findoc-with-rag.ps1
```

## Deploying to Google Cloud

### Method 1: Using Cloud Build (Recommended)

1. Ensure you have the Google Cloud SDK installed and configured:
   ```powershell
   gcloud --version
   gcloud auth login
   gcloud config set project findoc-deploy
   ```

2. Deploy using the deployment script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\deploy-to-cloud.ps1
   ```

   This script:
   - Checks if Google Cloud SDK is installed
   - Ensures you're logged in to Google Cloud
   - Sets the project to findoc-deploy
   - Submits the build to Cloud Build
   - Gets the URL of the deployed application
   - Opens the application in your browser

3. The deployed application will be available at:
   - https://backv2-app-326324779592.me-west1.run.app

### Method 2: Manual Deployment

1. Build the Docker image:
   ```powershell
   docker build -t gcr.io/findoc-deploy/backv2:latest .
   ```

2. Push the image to Google Container Registry:
   ```powershell
   docker push gcr.io/findoc-deploy/backv2:latest
   ```

3. Deploy to Cloud Run:
   ```powershell
   gcloud run deploy backv2-app --image gcr.io/findoc-deploy/backv2:latest --platform managed --region me-west1 --allow-unauthenticated
   ```

### Method 3: Using App Engine

1. Navigate to the DevDocs directory:
   ```powershell
   cd DevDocs
   ```

2. Deploy to App Engine:
   ```powershell
   gcloud app deploy app.yaml
   ```

## MCP Tools

The project uses several Model Context Protocol (MCP) tools for development and testing:

### Primary MCPs

1. **Sequential Thinking MCP**
   - Used for breaking down complex tasks into smaller, more manageable subtasks
   - Configuration: `sequential-thinking-mcp.json`

2. **TaskMaster AI MCP**
   - Used for AI-driven development and task tracking
   - Configuration: `taskmaster-mcp.json`

3. **Context7 MCP**
   - Provides up-to-date documentation and code examples
   - Configuration: `context7-mcp.json`

4. **Docker MCP**
   - Used for Docker-related operations
   - Helps with building and running Docker containers

### Starting MCPs

```powershell
# Start all MCPs
powershell -ExecutionPolicy Bypass -File .\start-all-mcps.bat

# Start specific MCPs
powershell -ExecutionPolicy Bypass -File .\start-selected-mcps.bat
```

## Troubleshooting

### Common Issues

1. **Navigation Issues**
   - Problem: Pages don't load when clicking links in the sidebar
   - Solution: Check the routing configuration in `server.js` and ensure all routes are properly defined

2. **PDF Processing Issues**
   - Problem: PDF processing not working
   - Solution: Ensure the scan1 module is properly integrated and the necessary Python dependencies are installed

3. **Authentication Errors**
   - Problem: 401 authentication errors
   - Solution: Check API key configuration and ensure the correct keys are set in the environment variables

4. **Docker Issues**
   - Problem: Docker containers not starting
   - Solution: Ensure Docker Desktop is running and the necessary ports are available

5. **Deployment Issues**
   - Problem: Cloud Build fails
   - Solution: Check the Cloud Build logs for specific errors and ensure the Dockerfile is properly configured

### Logs and Debugging

1. **Local Logs**
   - Server logs: Console output when running the application
   - Docker logs: `docker-compose logs -f`

2. **Cloud Logs**
   - Cloud Run logs: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=backv2-app" --limit 50`
   - Cloud Build logs: `gcloud builds log BUILD_ID`

## Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Google Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
