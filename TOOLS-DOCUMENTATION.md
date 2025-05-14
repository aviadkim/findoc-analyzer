# FinDoc Analyzer Tools Documentation

## Overview

This document provides comprehensive documentation of the tools used in the FinDoc Analyzer project, including GitHub, Supabase, Confluence, Notion, Linear, and MCP servers.

## GitHub

### Repository Information

- **Main Repository**: [aviadkim/backv2](https://github.com/aviadkim/backv2)
- **Deployment Repository**: [aviadkim/findoc-cloud-deploy](https://github.com/aviadkim/findoc-cloud-deploy)
- **Web Repository**: [aviadkim/findoc-web](https://github.com/aviadkim/findoc-web)

### Deployment Process

We used GitHub to store the code and Docker/Google Cloud CLI to deploy the application:

1. **Build Docker Image**:
   ```bash
   docker build -t findoc-app .
   ```

2. **Tag Docker Image for Google Cloud Registry**:
   ```bash
   docker tag findoc-app gcr.io/findoc-deploy/backv2-app:latest
   ```

3. **Configure Docker for Google Cloud**:
   ```bash
   gcloud auth configure-docker
   ```

4. **Push Docker Image to Google Cloud Registry**:
   ```bash
   docker push gcr.io/findoc-deploy/backv2-app:latest
   ```

5. **Deploy to Google Cloud Run**:
   ```bash
   gcloud run deploy backv2-app --image gcr.io/findoc-deploy/backv2-app:latest --platform managed --region me-west1 --allow-unauthenticated
   ```

### Deployment URL

The application is deployed at [https://backv2-app-326324779592.me-west1.run.app](https://backv2-app-326324779592.me-west1.run.app).

## Supabase

### Project Information

- **Project ID**: dnjnsotemnfrjlotgved
- **Organization ID**: fbcvnvatoxfnbxpdjdhf
- **Project Name**: aviadkim's Project
- **Region**: eu-central-1
- **Database Host**: db.dnjnsotemnfrjlotgved.supabase.co
- **Database Version**: 15.8.1.073

### Database Schema

The Supabase database schema includes the following tables:

1. **users**: Stores user information
2. **documents**: Stores document information
3. **document_data**: Stores document data
4. **document_metadata**: Stores document metadata
5. **document_processing**: Stores document processing information
6. **api_keys**: Stores API keys for different services
7. **tenants**: Stores tenant information for multi-tenant support
8. **tenant_api_keys**: Stores API keys for each tenant

### Row Level Security (RLS) Policies

The database uses Row Level Security (RLS) policies to ensure data isolation between tenants:

1. **users_tenant_isolation**: Users can only access their own data
2. **documents_tenant_isolation**: Users can only access documents belonging to their tenant
3. **api_keys_tenant_isolation**: Users can only access API keys belonging to their tenant

## MCP Servers

### MCP Servers Used

1. **Playwright MCP**: Used for UI testing with Playwright
2. **Puppeteer MCP**: Used for UI testing with Puppeteer
3. **TaskMaster AI MCP**: Used for task management and orchestration
4. **Context7 MCP**: Used for context-aware code generation
5. **Sequential Thinking MCP**: Used for step-by-step reasoning
6. **Redis MCP**: Used for caching and message passing
7. **Filesystem MCP**: Used for file system operations

### Starting MCP Servers

To start the MCP servers, run the following command:

```bash
./start-mcp-servers.ps1
```

This script starts the following MCP servers:

1. Playwright MCP
2. Puppeteer MCP
3. TaskMaster AI MCP
4. Context7 MCP

### MCP Configuration

The MCP configuration is stored in the `mcp-config/mcp.json` file:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser",
        "chromium"
      ]
    },
    "puppeteer": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ]
    }
  }
}
```

## UI Components Implementation

We implemented all 91 missing UI components identified by the MCP validation tools:

### Document Chat Components
- Document Selector
- Document Chat Container
- Document Chat Input
- Document Chat Send Button
- Document Chat Messages

### Document Processing Components
- Process Document Button
- Reprocess Document Button
- Download Document Button
- Processing Status Indicator
- Processing Progress Bar

### Authentication Components
- Login Form
- Register Form
- Google Login Button
- Auth Error Display

### Agent Components
- Agent Cards
- Agent Status Indicators
- Agent Action Buttons

## Testing Framework

We created a comprehensive testing framework that includes:

### UI Testing with Puppeteer

We created a UI testing script (`test-ui-components.js`) that uses Puppeteer to test the UI components on the deployed application.

### Agent Testing

We created an agent testing script (`test-agents.js`) that tests the agent functionality, including API key management, agent status, document processing, and document chat.

### Test Results

The test results are saved in the `test-agents-results` directory and screenshots are saved in the `test-screenshots` directory.

## Identified Issues

We identified several issues that need to be fixed:

1. **Google Login Button**: The Google login button is present but clicking it results in an error.
2. **Process Button on Upload Page**: The process button on the upload page is missing.
3. **Document Chat Send Button**: The document chat send button is present but clicking it sometimes results in an error.
4. **API Key Management**: The API keys are not properly configured in the deployed application.
5. **Agent Status**: Some agents are not active in the deployed application.
6. **Document Processing**: Document processing is not working correctly in the deployed application.
7. **Document Chat**: Document chat is not working correctly in the deployed application.

## Next Steps

1. **Fix Google Login**: Implement proper Google OAuth integration.
2. **Fix Process Button**: Add the process button to the upload page.
3. **Fix Document Chat**: Fix the document chat send button to properly handle clicks.
4. **Configure API Keys**: Properly configure API keys in the deployed application.
5. **Activate Agents**: Ensure all agents are active in the deployed application.
6. **Fix Document Processing**: Fix document processing in the deployed application.
7. **Fix Document Chat**: Fix document chat in the deployed application.
8. **Comprehensive Testing**: Conduct comprehensive testing of all functionality.
