# FinDoc Analyzer CI/CD Pipeline Documentation

This document provides an overview of the CI/CD pipeline for the FinDoc Analyzer project, explaining how code flows from development to production.

## Table of Contents

1. [Overview](#overview)
2. [Development Workflow](#development-workflow)
3. [GitHub Actions Workflows](#github-actions-workflows)
4. [Docker Containerization](#docker-containerization)
5. [Environments](#environments)
6. [Google Cloud Deployment](#google-cloud-deployment)
7. [Testing Strategy](#testing-strategy)
8. [Security Scanning](#security-scanning)
9. [Maintenance Procedures](#maintenance-procedures)
10. [Troubleshooting](#troubleshooting)

## Overview

The FinDoc Analyzer CI/CD pipeline follows a modern GitOps approach, where:

- Code is developed in feature branches
- Pull requests trigger automated testing
- Merges to main branch trigger deployments
- Infrastructure is managed as code
- Containers are the deployment unit

## Development Workflow

1. **Branch Creation**: Create a feature branch from `main` (e.g., `feature/document-processing`, `bugfix/login-flow`, etc.)
2. **Local Development**: Develop and test changes locally
3. **Commit Changes**: Follow commit message conventions (see [Commit Message Guidelines](#commit-message-guidelines))
4. **Create Pull Request**: Open a PR against the `main` branch
5. **Automated Testing**: GitHub Actions runs tests, linting, and security scans on the PR
6. **Code Review**: Team members review code and approve changes
7. **Merge**: After approval and passing tests, code is merged to `main`
8. **Automated Deployment**: Merges to `main` trigger automatic deployment to staging environment
9. **Production Deployment**: After verification in staging, manual approval deploys to production

### Commit Message Guidelines

Follow this format for commit messages:
```
<type>(<scope>): <short summary>

<optional body>

<optional footer>
```

Types include:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Test additions or corrections
- `build`: Changes to build process or tools
- `ci`: Changes to CI/CD configuration
- `chore`: Other changes that don't modify src or test files

Example:
```
feat(document-processing): add PDF parsing for financial statements

Implement PDF text extraction with support for tabular data.
Uses OCR for low-quality scans and machine learning for layout detection.

Closes #123
```

## GitHub Actions Workflows

The following workflows are defined:

1. **Enhanced CI (`enhanced-ci.yml`)**: Runs on pull requests and pushes to main
   - Linting (ESLint)
   - Unit & integration tests
   - Browser tests (Playwright)
   - Docker image build
   - Security scanning

2. **Deploy to Cloud Run (`deploy-cloud-run.yml`)**: Runs on pushes to main or manual dispatch
   - Builds production Docker image
   - Pushes to Google Container Registry
   - Deploys to Google Cloud Run
   - Performs post-deployment validation
   - Cleans up old images

### Running Workflows Locally

You can use [act](https://github.com/nektos/act) to run GitHub Actions workflows locally:

```bash
# Install act (requires Docker)
brew install act

# Run the CI workflow
act -j lint
act -j test
act -j build

# Run the deployment workflow (dry run)
act -j build workflow_dispatch --dryrun
```

## Docker Containerization

### Image Structure

The application uses a multi-stage Docker build to minimize image size and improve security:

1. **Build Stage**: Compiles code, installs dependencies
2. **Test Stage**: Runs tests and security scans
3. **Runtime Stage**: Minimal production image with only necessary components

### Key Docker Files

- `Dockerfile.production`: Optimized for production deployment
- `docker-compose.dev.yml`: For local development with all services
- `docker-compose.yml`: Standard configuration for production-like testing

### Local Development with Docker

```bash
# Start all services for development
docker-compose -f docker-compose.dev.yml up

# Start only specific services
docker-compose -f docker-compose.dev.yml up findoc-analyzer api-gateway-mcp

# Run tests inside container
docker-compose -f docker-compose.dev.yml run --rm testing-service
```

### Image Optimization

Our Docker images are optimized for:
- Minimal size (uses multi-stage builds)
- Security (non-root user, minimal dependencies)
- Performance (optimized dependency installation)
- Monitoring (health checks, readiness probes)

## Environments

### Local Development

- Development machine or container
- Features: hot reload, dev tools, debugging
- Configuration: `.env.development`

### Staging

- Google Cloud Run environment
- Features: simulates production, test data
- Configuration: `.env.staging` + secrets management
- URL: `https://staging-findoc-deploy.ey.r.appspot.com`

### Production

- Google Cloud Run environment
- Features: optimized, scaled, monitored
- Configuration: `.env.production` + secrets management
- URL: `https://findoc-deploy.ey.r.appspot.com`

## Google Cloud Deployment

### Infrastructure Components

- **Google Cloud Run**: Serverless container execution
- **Google Container Registry**: Docker image storage
- **Google Secret Manager**: Secrets and environment variables
- **Google Cloud Storage**: File storage
- **Google Cloud Monitoring**: Application monitoring

### Deployment Architecture

```
GitHub Actions -> GCR Image -> Cloud Run Service -> Cloud Storage
                                   ↓
                            Secret Manager
                            Cloud Monitoring
```

### Environment Variables

Environment variables are managed in a hierarchical manner:
1. Default values in code
2. Environment-specific `.env` files
3. Cloud Run environment variables
4. Secret Manager for sensitive information

## Testing Strategy

### Unit Tests

- Framework: Jest
- Coverage requirement: 80%
- Location: `tests/unit/`
- Command: `npm run test:unit`

### Integration Tests

- Framework: Jest with supertest
- Location: `tests/integration/`
- Command: `npm run test:integration`

### End-to-End Tests

- Framework: Playwright
- Browsers: Chrome, Firefox, Safari, Mobile
- Location: `tests/e2e/`
- Command: `npm run test:e2e`

### Performance Tests

- Tools: Lighthouse CI, k6
- Thresholds: < 1.5s TTI, < 3s full load
- Command: `npm run test:performance`

## Security Scanning

The following security practices are integrated into the pipeline:

### Dependency Scanning

- npm audit runs on each build
- Automatic dependency updates with security checks

### Code Scanning

- ESLint security plugin for static analysis
- Semgrep for advanced pattern matching

### Container Scanning

- Trivy scans images for vulnerabilities
- Checks base images, OS packages, and application dependencies

### Secrets Management

- Pre-commit hooks to prevent secret leakage
- GitHub Actions secrets for credential management
- Secret Manager for runtime secrets

## Maintenance Procedures

### Dependency Updates

Run the dependency update script to safely update packages:

```bash
node scripts/update-dependencies.js
```

This script:
- Creates backups of dependency files
- Updates dependencies incrementally
- Runs tests after updates
- Generates a report of changes

### Docker Cleanup

Regularly clean up Docker resources:

```bash
# Standard cleanup
./scripts/docker-cleanup.sh

# Dry run to see what would be removed
./scripts/docker-cleanup.sh --dry-run

# Full cleanup including volumes (use with caution)
./scripts/docker-cleanup.sh --prune-volumes --delete-all-unused
```

### Log Rotation

Log rotation is configured in Cloud Run. For local logs, use:

```bash
# Analyze logs for errors
node scripts/analyze-logs.js

# Archive old logs
node scripts/archive-logs.js
```

## Troubleshooting

### Common CI/CD Issues

1. **Failed Tests**: Check test logs for specific failures. Most common causes:
   - Environment configuration differences
   - Flaky tests (retries enabled)
   - Timeout issues (increase timeout in workflow)

2. **Docker Build Failures**: Check build logs for:
   - Dependency issues
   - Network problems
   - Disk space on runner

3. **Deployment Failures**:
   - Check IAM permissions
   - Validate service account access
   - Verify resource quotas

### Recovery Procedures

1. **Rollback to Previous Version**:
   ```bash
   # Manual rollback
   gcloud run services update-traffic findoc-analyzer-production --to-revisions=REVISION_ID=100
   ```

2. **Force Rebuild Without Code Changes**:
   ```bash
   # Trigger workflow manually in GitHub Actions UI
   # Or create an empty commit
   git commit --allow-empty -m "chore: trigger rebuild"
   git push
   ```

3. **Enable Emergency Access**:
   ```bash
   # Contact admin to request temporary elevated permissions
   # Document all emergency access in incident log
   ```

## Contact Information

For questions about the CI/CD pipeline, contact:

- CI/CD Maintainer: `devops@example.com`
- Engineering Lead: `engineering@example.com`
- On-call Support: `#devops-support` (Slack)