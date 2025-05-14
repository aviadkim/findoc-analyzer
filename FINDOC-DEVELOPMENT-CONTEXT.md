# FinDoc Analyzer: Development Context

This document provides comprehensive context about the FinDoc Analyzer project, its current state, and how to continue development. This information should be shared with AI assistants in future chats to ensure continuity.

## Project Overview

FinDoc Analyzer is a SaaS application for financial document processing and analysis. It processes financial documents (PDF/Excel/CSV), stores data in databases, answers questions, builds tables, creates reports, analyzes portfolio holdings, and performs analysis with financial data.

The system uses a multi-agent architecture (Document Analyzer, Table Understanding, Securities Extractor, Financial Reasoner, Bloomberg Agent) for comprehensive document analysis.

## Current State

The application has been deployed to Google Cloud Run and is accessible at: https://backv2-app-326324779592.me-west1.run.app

We have implemented all 91 missing UI components identified by MCP validation tools, including:
- Document Chat Components (selector, container, input, send button, messages)
- Document Processing Components (process/reprocess buttons, status indicators)
- Authentication Components (login form, register form, Google login button)
- Agent Components (agent cards, status indicators, action buttons)

## Repository Structure

- **Backend**: Located in `DevDocs/backend/`
- **Frontend**: Located in `DevDocs/frontend/`
- **Main UI Components**: `FinDocLayout.js` and `FinDocUI.js`
- **Routes**: `findoc_rag_routes.py` for backend routes and `findoc-rag.js` for frontend components

## MCP Servers Setup

The project uses numerous MCP servers for development and testing. These can be started using the `start-all-augment-mcps.ps1` script, which reads the configuration from `augment-full-mcp-config.json`.

Key MCP servers include:
- **Filesystem MCP**: For file operations and document access
- **Sequential Thinking MCP**: For step-by-step reasoning and problem-solving
- **Redis MCP**: For caching and message passing
- **Puppeteer MCP**: For UI testing and browser automation
- **Playwright MCP**: For comprehensive UI testing
- **Memory MCP**: For persistent memory and knowledge graph
- **GitHub MCP**: For GitHub integration
- **Fetch MCP**: For fetching web content
- **Brave MCP**: For web search
- **Magic MCP (21st.dev)**: For UI component generation
- **Supabase MCP**: For database integration
- **TaskMaster MCP**: For task management and orchestration

## Running the Application

### Local Development

1. Start all MCP servers:
   ```bash
   .\start-all-augment-mcps.ps1
   ```

2. Run the application:
   ```bash
   npm run start
   ```

3. Access the application at http://localhost:8080

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t findoc-app .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 8080:8080 --name findoc-app-container findoc-app
   ```

### Google Cloud Run Deployment

1. Tag the Docker image:
   ```bash
   docker tag findoc-app gcr.io/findoc-deploy/backv2-app:latest
   ```

2. Configure Docker for Google Cloud:
   ```bash
   gcloud auth configure-docker
   ```

3. Push the Docker image:
   ```bash
   docker push gcr.io/findoc-deploy/backv2-app:latest
   ```

4. Deploy to Google Cloud Run:
   ```bash
   gcloud run deploy backv2-app --image gcr.io/findoc-deploy/backv2-app:latest --platform managed --region me-west1 --allow-unauthenticated
   ```

## Known Issues

1. **Google Login Button**: The Google login button is present but clicking it results in an error
2. **Process Button on Upload Page**: The process button on the upload page is missing
3. **Document Chat Send Button**: The document chat send button is present but clicking it sometimes results in an error
4. **API Key Management**: The API keys are not properly configured in the deployed application
5. **Agent Status**: Some agents are not active in the deployed application
6. **Document Processing**: Document processing is not working correctly in the deployed application
7. **Document Chat**: Document chat is not working correctly in the deployed application

## Next Steps

1. **Fix Google Login**: Implement proper Google OAuth integration
2. **Fix Process Button**: Add the process button to the upload page
3. **Fix Document Chat**: Fix the document chat send button to properly handle clicks
4. **Configure API Keys**: Properly configure API keys in the deployed application
5. **Activate Agents**: Ensure all agents are active in the deployed application
6. **Fix Document Processing**: Fix document processing functionality
7. **Fix Document Chat**: Fix document chat functionality
8. **Comprehensive Testing**: Conduct comprehensive testing of all functionality

## Documentation

The following documentation files provide additional context:

1. **FINDOC-DEPLOYMENT-DOCUMENTATION.md**: Detailed documentation of the deployment process
2. **TOOLS-DOCUMENTATION.md**: Documentation of the tools used in the project
3. **UI-TESTING-SUMMARY.md**: Summary of UI testing results
4. **DEPLOYMENT-SUMMARY.md**: Summary of the deployment process
5. **COMPREHENSIVE-SUMMARY.md**: Comprehensive summary of the entire project
6. **MCP-SETUP-GUIDE.md**: Guide for setting up MCP servers
7. **FINDOC-DEPLOYMENT-AND-MCP-SUMMARY.md**: Summary of deployment and MCP setup
8. **FINDOC-DEVELOPMENT-CONTEXT.md**: This document, providing development context

## Scripts

The following scripts automate various tasks:

1. **start-all-augment-mcps.ps1**: Script to start all MCP servers
2. **run-mcp-validation.ps1**: Script to run the MCP validation tools
3. **test-ui-components.js**: Script to test UI components
4. **test-ui-issues.js**: Script to identify UI issues
5. **test-agents.js**: Script to test agent functionality
6. **deploy-to-cloud.ps1**: Script to deploy the application to Google Cloud Run

## How to Continue Development

To continue development in a new chat:

1. Share this document (`FINDOC-DEVELOPMENT-CONTEXT.md`) with the AI assistant
2. Start all MCP servers using the `start-all-augment-mcps.ps1` script
3. Specify which issue you want to address or which feature you want to implement
4. The AI assistant will have the necessary context to continue development from where we left off

## Conclusion

The FinDoc Analyzer project has made significant progress with the deployment to Google Cloud Run and the implementation of all UI components. The next steps are to address the identified issues and continue improving the application.
