# Google Cloud Integration for FinDoc Analyzer

This guide explains how to integrate FinDoc Analyzer with Google Cloud Platform securely, without exposing sensitive information in GitHub.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Security Overview](#security-overview)
3. [Local Setup](#local-setup)
4. [Docker Setup](#docker-setup)
5. [Google Cloud Deployment](#google-cloud-deployment)
6. [MCP Integration](#mcp-integration)
7. [GitHub Actions CI/CD](#github-actions-cicd)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have:

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- [Git](https://git-scm.com/downloads) installed
- [Node.js](https://nodejs.org/) installed
- [Python 3.9+](https://www.python.org/downloads/) installed
- A Google Cloud account with billing enabled
- A Gemini API key

## Security Overview

Our security approach follows these principles:

1. **No Credentials in Code**: We never store credentials, API keys, or secrets in the code repository.
2. **Environment Variables**: We use environment variables for sensitive information.
3. **Secure Storage**: We store credentials in secure locations outside the repository.
4. **Gitignore**: We use `.gitignore` to prevent accidental commits of sensitive files.
5. **GitHub Secrets**: For CI/CD, we use GitHub Secrets to store sensitive information.

## Local Setup

### Step 1: Secure Configuration

Run the secure configuration script:

```powershell
.\setup-gcloud-secure.ps1
```

This script will:
1. Create a secure directory for credentials
2. Prompt for your service account key
3. Create a `.env` file with your configuration
4. Set up Google Cloud authentication

### Step 2: Run Locally

To run the application locally with Docker:

```powershell
.\run-with-docker.ps1
```

This will start the application using Docker Compose with your secure configuration.

## Docker Setup

Our Docker setup consists of three services:

1. **Backend**: Python API server for document processing
2. **Frontend**: Next.js web application
3. **Agent Service**: Python service for the multi-agent system

To test the Docker setup:

```powershell
.\test-docker-setup.ps1
```

## Google Cloud Deployment

### Step 1: Set Up GitHub Secrets

Before deploying to Google Cloud, set up GitHub Secrets as described in [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md).

### Step 2: Deploy to Google Cloud

To deploy to Google Cloud:

```powershell
.\deploy-to-gcloud.ps1
```

This script will:
1. Build and push Docker images to Google Container Registry
2. Create a Cloud Storage bucket for document storage
3. Deploy the services to Cloud Run
4. Configure service-to-service authentication

## MCP Integration

We integrate with Google Cloud using Model Context Protocol (MCP) servers:

### Step 1: Run with Google Cloud MCP

To run the application with Google Cloud MCP integration:

```powershell
.\run-with-gcloud-mcp.ps1
```

This script will:
1. Clone the Google Cloud MCP repositories
2. Install dependencies
3. Create MCP configuration
4. Start the MCP server
5. Start the application with Docker

### Step 2: Use Natural Language with Google Cloud

With the MCP integration, you can use natural language to:
- Deploy services
- Manage resources
- Monitor performance
- Troubleshoot issues

## GitHub Actions CI/CD

Our GitHub Actions workflow automates testing and deployment:

1. **Build and Test**: Builds Docker images and runs tests
2. **Deploy**: Deploys to Google Cloud Run (only on main and docker-deployment branches)

The workflow uses GitHub Secrets for secure authentication.

## Troubleshooting

### Common Issues

#### Authentication Issues

If you encounter authentication issues:

```powershell
# Verify authentication
gcloud auth list

# Re-authenticate
gcloud auth login

# Activate service account
gcloud auth activate-service-account --key-file=path/to/key.json
```

#### Docker Issues

If Docker containers fail to start:

```powershell
# Check logs
docker-compose logs

# Rebuild containers
docker-compose build --no-cache
```

#### Google Cloud Deployment Issues

If deployment fails:

1. Check the Cloud Build logs in the Google Cloud Console
2. Verify API enablement
3. Check service account permissions

### Getting Help

If you need help, check:
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Security Reminders

- **Never** commit credentials to Git
- **Always** use environment variables or GitHub Secrets
- **Regularly** rotate service account keys
- **Monitor** Google Cloud audit logs for suspicious activity
