# CI/CD Pipeline Setup Documentation

## Overview

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) pipeline set up for the FinDoc project. The pipeline automates testing, building, and deployment processes to ensure code quality and streamline releases.

## CI/CD Architecture

The CI/CD pipeline consists of three main GitHub Actions workflow files:

1. **Enhanced CI/CD Pipeline** (`enhanced-ci-cd.yml`) - Primary workflow handling the complete pipeline from linting to production deployment
2. **Playwright UI Tests** (`playwright.yml`) - Dedicated workflow for comprehensive UI testing with Playwright
3. **Integration Tests** (`integration-tests.yml`) - Focused workflow for document processing integration tests

## Pipeline Stages

### Enhanced CI/CD Pipeline

The main pipeline includes the following stages:

1. **Setup** - Prepare the environment with Node.js and Python
2. **Lint** - Run ESLint for JavaScript/TypeScript and Flake8/Black for Python
3. **Security Scan** - Run NPM audit and Snyk for security vulnerabilities
4. **Unit Tests** - Execute Jest tests for frontend and Pytest for backend
5. **Frontend Build** - Build the React application
6. **Backend Tests** - Run Python tests with coverage reporting
7. **UI Tests** - Run Playwright tests for comprehensive UI testing
8. **Docker Build** - Build and push Docker images
9. **Deployment** - Deploy to different environments based on branch or manual trigger:
   - **Development** - Deploys from `develop` branch
   - **Staging** - Deploys from `main` branch
   - **Production** - Manual approval process required

### Workflow Triggers

- **Push Events** - Triggered on pushes to `main`, `develop`, and feature branches
- **Pull Requests** - Triggered on PRs to `main` and `develop`
- **Manual Dispatch** - Can be triggered manually with environment selection

## Environment Configuration

The pipeline uses GitHub Environments to manage deployment to different environments:

1. **Development** - Automatically deployed from the `develop` branch
2. **Staging** - Automatically deployed from the `main` branch
3. **Production** - Requires manual approval before deployment

## Required Secrets

The following secrets need to be configured in GitHub repository settings:

- `DOCKERHUB_USERNAME` - DockerHub username
- `DOCKERHUB_TOKEN` - DockerHub access token
- `GCP_PROJECT_ID` - Google Cloud project ID
- `GCP_SA_KEY` - Base64-encoded Google Cloud service account key
- `SLACK_WEBHOOK` - Slack webhook URL for notifications
- `SNYK_TOKEN` - Snyk token for security scanning

## Playwright UI Testing

The Playwright workflow provides extensive UI testing with the following features:

- Browser testing across Chromium, Firefox, and WebKit
- Visual regression testing
- Accessibility testing
- Mobile device emulation
- Test reports and screenshots for failures

Tests are organized in the `/tests` directory and follow the naming convention `*.spec.js` or `*.spec.ts`.

## Integration Testing

The integration testing workflow focuses on document processing and includes:

- Document upload and processing tests
- Financial data extraction testing
- ISIN extraction validation
- Table detection verification
- End-to-end document flow tests

## Test Coverage

The pipeline generates test coverage reports for:

- Frontend unit tests (Jest)
- Backend unit tests (Pytest)
- Integration tests

Coverage reports are uploaded as artifacts and can be viewed directly in GitHub Actions.

## Docker Image Management

Docker images are built and published to DockerHub with the following tags:

- `findoc:latest` - Latest build from main branch
- `findoc:<git-sha>` - Build tagged with Git commit SHA

Docker build caching is implemented to speed up builds.

## Google Cloud Run Deployment

The application is deployed to Google Cloud Run with environment-specific configurations:

- `findoc-dev` - Development environment
- `findoc-staging` - Staging environment
- `findoc-prod` - Production environment

## Notifications

The pipeline sends notifications to Slack on:

- Successful deployments
- Build failures
- Test failures

## Continuous Improvement

The CI/CD pipeline should be continuously improved based on project needs. Consider adding:

- Performance testing
- Load testing
- Static code analysis
- Dependency updates automation
- Release notes generation

## Troubleshooting

If the CI/CD pipeline fails, check:

1. GitHub Actions logs for detailed error messages
2. Test reports in the artifacts section
3. Repository secrets to ensure they are correctly configured
4. Docker image build logs for build issues
5. Google Cloud Run deployment logs for deployment failures