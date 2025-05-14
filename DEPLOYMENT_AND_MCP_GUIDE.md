# FinDoc Analyzer - Deployment and MCP Improvement Guide

This guide provides comprehensive instructions for deploying the FinDoc Analyzer with modern UI to Google Cloud and using MCP tools to improve the website.

## Table of Contents
1. [Deploying to Google Cloud](#deploying-to-google-cloud)
2. [Testing the Deployment](#testing-the-deployment)
3. [MCP Tools for Website Improvement](#mcp-tools-for-website-improvement)
4. [Automated CI/CD with GitHub Actions](#automated-cicd-with-github-actions)

## Deploying to Google Cloud

### Prerequisites
- Google Cloud SDK installed and configured
- Access to the `findoc-deploy` Google Cloud project
- Node.js installed (version 18 or higher)
- Git installed

### Option 1: Manual Deployment

1. **Authenticate with Google Cloud**
   ```bash
   gcloud auth login
   gcloud config set project findoc-deploy
   ```

2. **Deploy to Google App Engine**
   ```bash
   gcloud app deploy app.yaml --project=findoc-deploy --version=modern-ui-v1
   ```

3. **Verify Deployment**
   ```bash
   gcloud app browse
   ```

### Option 2: Using the Deployment Script

1. **Run the deployment script**
   ```powershell
   .\deploy-modern-ui.ps1
   ```

   This script will:
   - Set up the Google Cloud project
   - Create necessary directories
   - Copy modern UI files to the public directory
   - Deploy to Google App Engine
   - Open the deployed application in your browser

### Option 3: Automated Deployment with GitHub Actions

1. **Set up GitHub Actions**
   - Follow the instructions in [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)
   - Add the service account key to GitHub Secrets
   - Push changes to trigger deployment

2. **Monitor Deployment**
   - Go to the GitHub Actions tab to monitor the deployment process
   - Once completed, your application will be available at https://findoc-deploy.ey.r.appspot.com

## Testing the Deployment

### Basic Testing

1. **Check the deployed URL**
   - Open https://findoc-deploy.ey.r.appspot.com in your browser
   - Verify that the modern UI is displayed

2. **Test login functionality**
   - Go to https://findoc-deploy.ey.r.appspot.com/login.html
   - Try logging in with demo credentials (demo@example.com / password)
   - Verify that you are redirected to the dashboard

3. **Test upload functionality**
   - Go to https://findoc-deploy.ey.r.appspot.com/upload.html
   - Try uploading a document
   - Verify that the document is processed correctly

### Comprehensive Testing

1. **Run the comprehensive test script**
   ```bash
   node tests/comprehensive-test.js
   ```

2. **Run the modern UI test script**
   ```bash
   node tests/modern-ui-test.js
   ```

3. **Check test results**
   - Test results will be saved to the test-results directory
   - Review the test report for any issues

## MCP Tools for Website Improvement

### 1. Magic MCP (21st.dev)

**Purpose**: UI component generation and design improvement

**How to use**:
```bash
npx -y @21st-dev/magic@latest
```

**Benefits for FinDoc Analyzer**:
- Generate high-quality UI components based on descriptions
- Create consistent styling and behavior across the application
- Ensure accessibility and best practices
- Reduce UI development time by 70-80%

**Example tasks**:
- Improve form designs
- Create responsive layouts
- Design better navigation components
- Generate themed components for a consistent look and feel

### 2. Playwright MCP

**Purpose**: Comprehensive browser automation and testing

**How to use**:
```bash
npx -y @playwright/mcp@latest --browser chromium
```

**Benefits for FinDoc Analyzer**:
- Automated UI testing across different browsers
- Verify functionality of all UI components
- Test user flows and interactions
- Generate test reports with screenshots

**Example tasks**:
- Test document upload and processing
- Verify chat functionality
- Test responsive design across different screen sizes
- Validate form submissions and error handling

### 3. Browser Tools MCP

**Purpose**: Browser automation and interaction

**How to use**:
```bash
npx -y @agentdeskai/browser-tools-mcp@latest
```

**Benefits for FinDoc Analyzer**:
- Test website functionality
- Extract data from web pages
- Automate repetitive browser tasks
- Check website compatibility

**Example tasks**:
- Test login and authentication
- Verify document processing
- Test chat interface
- Validate form submissions

### 4. Puppeteer MCP

**Purpose**: Browser automation and testing

**How to use**:
```bash
npx -y @modelcontextprotocol/server-puppeteer
```

**Benefits for FinDoc Analyzer**:
- Headless browser testing
- Performance testing
- Screenshot capture for visual regression testing
- PDF generation testing

**Example tasks**:
- Test document rendering
- Verify PDF export functionality
- Test table generation
- Validate chart rendering

### 5. Sequential Thinking MCP

**Purpose**: Step-by-step problem solving and analysis

**How to use**:
```bash
npx -y @modelcontextprotocol/server-sequentialthinking
```

**Benefits for FinDoc Analyzer**:
- Improve complex problem-solving
- Enhance debugging capabilities
- Better code organization
- More thorough testing

**Example tasks**:
- Debug complex issues
- Analyze user flows
- Optimize performance bottlenecks
- Design better algorithms

## Automated CI/CD with GitHub Actions

### Setting Up GitHub Actions

1. **Create the workflow file**
   - The workflow file is already set up at `.github/workflows/deploy-to-gcloud.yml`
   - This file defines the automated deployment process

2. **Add secrets to GitHub**
   - Go to your GitHub repository settings
   - Add the following secrets:
     - `GCP_SA_KEY`: The service account key JSON
     - `GCP_PROJECT_ID`: The Google Cloud project ID (findoc-deploy)

3. **Push changes to trigger deployment**
   ```bash
   git add .
   git commit -m "Update modern UI components"
   git push origin ui-components-only
   ```

4. **Monitor the deployment**
   - Go to the GitHub Actions tab to monitor the deployment process
   - Once completed, your application will be available at https://findoc-deploy.ey.r.appspot.com

### Continuous Testing

1. **Add testing to the workflow**
   - Update the workflow file to include testing steps
   - This ensures that all tests pass before deployment

2. **Set up test reporting**
   - Configure the workflow to generate test reports
   - This helps identify issues quickly

3. **Set up notifications**
   - Configure the workflow to send notifications on failure
   - This ensures that you are alerted when issues occur

## Conclusion

By following this guide, you can deploy the FinDoc Analyzer with modern UI to Google Cloud and use MCP tools to improve the website. The automated CI/CD pipeline with GitHub Actions ensures that your application is always up-to-date and functioning correctly.

For more detailed information, refer to the following resources:
- [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)
- [GOOGLE_CLOUD_DEPLOYMENT_GUIDE.md](GOOGLE_CLOUD_DEPLOYMENT_GUIDE.md)
- [MCP-GUIDE-FOR-AI-ASSISTANTS.md](MCP-GUIDE-FOR-AI-ASSISTANTS.md)
