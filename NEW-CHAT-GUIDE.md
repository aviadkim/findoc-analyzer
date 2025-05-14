# Guide for Continuing Development in a New Chat

This guide provides instructions for continuing development of the FinDoc Analyzer project in a new chat with an AI assistant.

## Step 1: Start All MCP Servers

Run the following script to start all MCP servers:

```bash
.\start-all-augment-mcps.ps1
```

This script will start all the necessary MCP servers for development, including:
- Filesystem MCP
- Sequential Thinking MCP
- Redis MCP
- Puppeteer MCP
- Playwright MCP
- Memory MCP
- GitHub MCP
- Fetch MCP
- Brave MCP
- Magic MCP
- Supabase MCP
- TaskMaster MCP
- And many more...

## Step 2: Share Development Context

Share the `FINDOC-DEVELOPMENT-CONTEXT.md` file with the AI assistant. This file contains comprehensive information about the project, its current state, and how to continue development.

You can do this by saying:

```
I'm continuing development of the FinDoc Analyzer project. Here's the development context:

[Copy and paste the contents of FINDOC-DEVELOPMENT-CONTEXT.md here]
```

## Step 3: Specify the Task

Clearly specify which issue you want to address or which feature you want to implement. For example:

```
I want to fix the Google Login Button issue. Currently, the button is present but clicking it results in an error.
```

or

```
I want to implement the Process Button on the Upload Page. Currently, this button is missing.
```

## Step 4: Run the Application

If you want to run the application with all MCP servers, use the following script:

```bash
.\run-findoc-with-all-mcps.ps1
```

This script will start all MCP servers and then run the FinDoc Analyzer application.

## Step 5: Test the Changes

After making changes, test them using the appropriate testing scripts:

```bash
node test-ui-components.js  # For testing UI components
node test-ui-issues.js      # For identifying UI issues
node test-agents.js         # For testing agent functionality
```

## Step 6: Deploy the Changes

If you want to deploy the changes to Google Cloud Run, use the following commands:

```bash
# Build the Docker image
docker build -t findoc-app .

# Tag the Docker image
docker tag findoc-app gcr.io/findoc-deploy/backv2-app:latest

# Configure Docker for Google Cloud
gcloud auth configure-docker

# Push the Docker image
docker push gcr.io/findoc-deploy/backv2-app:latest

# Deploy to Google Cloud Run
gcloud run deploy backv2-app --image gcr.io/findoc-deploy/backv2-app:latest --platform managed --region me-west1 --allow-unauthenticated
```

## Conclusion

By following these steps, you can continue development of the FinDoc Analyzer project in a new chat with an AI assistant. The AI assistant will have the necessary context to help you address issues and implement new features.
