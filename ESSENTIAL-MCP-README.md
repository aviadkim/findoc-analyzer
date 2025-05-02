# Essential MCP Setup for Financial SaaS Project

This guide provides instructions for setting up and using essential MCPs (Model Context Protocol servers) for your financial SaaS project without requiring any API keys or additional dependencies.

## Essential MCPs

These MCPs don't require API keys or additional dependencies:

| MCP Name | Purpose | Description |
|----------|---------|-------------|
| GitHub | Code repository | Interacts with GitHub repositories, issues, and PRs |
| Memory | Information storage | Stores and retrieves information for the AI |
| Filesystem | File operations | Reads and writes files on your system |
| Fetch | API requests | Makes HTTP requests to APIs |
| Time | Time operations | Provides time-related functions |
| Sequential Thinking | Problem solving | Helps break down complex problems |
| Git | Version control | Interacts with Git repositories |

## Project-Specific MCPs

These MCPs are specific to your financial SaaS project and are located in the `mcp-servers` directory:

### Document Processing MCPs

| MCP Name | Purpose | Description |
|----------|---------|-------------|
| PDF Parser | PDF processing | Extract data from PDF financial documents |

### Financial Analysis MCPs

| MCP Name | Purpose | Description |
|----------|---------|-------------|
| Financial Analytics | Financial calculations | Perform financial calculations and analysis |

### Agent Orchestration MCPs

| MCP Name | Purpose | Description |
|----------|---------|-------------|
| Workflow | Process automation | Manage automated workflows |

## Setup Instructions

### Step 1: Fix MCP Issues

Run the `fix-mcps.bat` script to fix any issues with the global MCPs:

```
fix-mcps.bat
```

This script will:
- Fix Git MCP path issues by creating a wrapper script
- Install Semgrep for the Semgrep MCP
- Create a configuration file for the Magic MCP
- Create a test database for the SQLite MCP

### Step 2: Check MCP Dependencies

Run the `check-mcp-dependencies.bat` script to check if all the required dependencies for the MCPs are installed:

```
check-mcp-dependencies.bat
```

This script will check if the following dependencies are installed:
- Docker
- Kubernetes (kubectl)
- PostgreSQL
- Redis
- TypeScript
- ESLint
- Prettier
- Jest
- VSCode
- Qdrant client
- Langchain
- Puppeteer
- Playwright

### Step 3: Start Essential MCPs

Run the `start-essential-mcps.bat` script to start the essential MCPs that don't require API keys or additional dependencies:

```
start-essential-mcps.bat
```

This script will start the following MCPs:
- GitHub MCP
- Memory MCP
- Filesystem MCP
- Fetch MCP
- Time MCP
- Sequential Thinking MCP
- Git MCP

### Step 4: Configure Augment

Run the `configure-augment-for-project.bat` script to configure Augment to use all the MCPs:

```
configure-augment-for-project.bat
```

This script will create a configuration file for Augment that includes all the MCPs.

### Step 5: Set Up Project-Specific MCPs

Run the `setup-project-mcps.bat` script to set up the project-specific MCPs:

```
setup-project-mcps.bat
```

This script will:
- Create the PDF Parser MCP
- Create the Financial Analytics MCP
- Create the Workflow MCP
- Create a script to start all the project-specific MCPs

### Step 6: Start Project-Specific MCPs

Run the `mcp-servers\start-project-mcps.bat` script to start all the project-specific MCPs:

```
mcp-servers\start-project-mcps.bat
```

This script will start all the project-specific MCPs.

## Using MCPs in Your Code

### Using Essential MCPs

```javascript
// Example of using the GitHub MCP
const github = require('@modelcontextprotocol/client-github');
const client = new github.GitHubClient();

// Example of using the Memory MCP
const memory = require('@modelcontextprotocol/client-memory');
const memoryClient = new memory.MemoryClient();

// Example of using the Filesystem MCP
const filesystem = require('@modelcontextprotocol/client-filesystem');
const filesystemClient = new filesystem.FilesystemClient();
```

### Using Project-Specific MCPs

```javascript
// Example of using the PDF Parser MCP
const pdfParser = require('./mcp-servers/document-processing/pdf-parser-mcp');
const pdfClient = new pdfParser.PDFParserClient();

// Example of using the Financial Analytics MCP
const financialAnalytics = require('./mcp-servers/financial-analysis/financial-analytics-mcp');
const financialClient = new financialAnalytics.FinancialAnalyticsClient();

// Example of using the Workflow MCP
const workflow = require('./mcp-servers/agent-orchestration/workflow-mcp');
const workflowClient = new workflow.WorkflowClient();
```

## Troubleshooting

If you encounter issues with any of the MCPs:

1. Check the logs in `%TEMP%\mcp-logs` for global MCPs or `%TEMP%\project-mcp-logs` for project-specific MCPs
2. Make sure the required dependencies are installed
3. Restart the MCPs
4. Restart Augment

## Next Steps

After setting up the MCPs, you can:

1. Implement your financial SaaS project using the MCPs
2. Create additional project-specific MCPs as needed
3. Configure client access to your MCPs
