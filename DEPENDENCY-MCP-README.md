# Dependency-Based MCP Setup for Financial SaaS Project

This guide provides instructions for setting up and using MCPs (Model Context Protocol servers) that require additional dependencies but no API keys for your financial SaaS project.

## MCPs That Require Additional Dependencies (But No API Keys)

| MCP Name | Purpose | Required Dependency |
|----------|---------|---------------------|
| Docker MCP | Containerization | Docker Desktop |
| Kubernetes MCP | Container orchestration | kubectl |
| PostgreSQL MCP | Database | PostgreSQL |
| Redis MCP | Key-value store | Redis |
| SQLite MCP | Database | SQLite |
| TypeScript MCP | Type checking | TypeScript |
| ESLint MCP | Code linting | ESLint |
| Prettier MCP | Code formatting | Prettier |
| Jest MCP | Testing | Jest |
| VSCode MCP | Editor integration | VSCode |
| Puppeteer MCP | Browser automation | Puppeteer |
| Playwright MCP | Browser automation | Playwright |
| Qdrant MCP | Vector database | Qdrant client |
| Langchain MCP | AI workflows | Langchain |
| Semgrep MCP | Code analysis | Semgrep |

## Essential MCPs (No Dependencies, No API Keys)

| MCP Name | Purpose | Description |
|----------|---------|-------------|
| GitHub MCP | Code repository | Interacts with GitHub repositories, issues, and PRs |
| Memory MCP | Information storage | Stores and retrieves information for the AI |
| Filesystem MCP | File operations | Reads and writes files on your system |
| Fetch MCP | API requests | Makes HTTP requests to APIs |
| Time MCP | Time operations | Provides time-related functions |
| Sequential Thinking MCP | Problem solving | Helps break down complex problems |
| Git MCP | Version control | Interacts with Git repositories |

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

### Step 1: Install Dependencies

Run the `install-mcp-dependencies.bat` script to install all the necessary dependencies:

```
install-mcp-dependencies.bat
```

This script will:
- Install Node.js dependencies (TypeScript, ESLint, Prettier, Jest, Puppeteer, Playwright)
- Install Python dependencies (Qdrant client, Langchain)
- Download and install SQLite
- Check for Docker, PostgreSQL, Redis, and kubectl

### Step 2: Check Dependencies

Run the `check-mcp-dependencies.bat` script to check if all the required dependencies are installed:

```
check-mcp-dependencies.bat
```

This script will check if the following dependencies are installed:
- Docker
- Kubernetes (kubectl)
- PostgreSQL
- Redis
- SQLite
- TypeScript
- ESLint
- Prettier
- Jest
- VSCode
- Puppeteer
- Playwright
- Qdrant client
- Langchain
- Semgrep

### Step 3: Fix MCP Issues

Run the `fix-mcps.bat` script to fix any issues with the global MCPs:

```
fix-mcps.bat
```

This script will:
- Fix Git MCP path issues by creating a wrapper script
- Install Semgrep for the Semgrep MCP
- Create a configuration file for the Magic MCP
- Create a test database for the SQLite MCP

### Step 4: Start MCPs

You have three options for starting MCPs:

#### Option 1: Start Essential MCPs Only

Run the `start-essential-mcps.bat` script to start only the essential MCPs that don't require API keys or additional dependencies:

```
start-essential-mcps.bat
```

#### Option 2: Start Dependency-Based MCPs Only

Run the `start-all-dependency-mcps.bat` script to start only the MCPs that require additional dependencies but no API keys:

```
start-all-dependency-mcps.bat
```

#### Option 3: Start All MCPs (No API Keys)

Run the `start-all-no-api-mcps.bat` script to start all MCPs that don't require API keys:

```
start-all-no-api-mcps.bat
```

### Step 5: Configure Augment

Run the `configure-augment-for-project.bat` script to configure Augment to use all the MCPs:

```
configure-augment-for-project.bat
```

This script will create a configuration file for Augment that includes all the MCPs.

### Step 6: Set Up Project-Specific MCPs

Run the `setup-project-mcps.bat` script to set up the project-specific MCPs:

```
setup-project-mcps.bat
```

This script will:
- Create the PDF Parser MCP
- Create the Financial Analytics MCP
- Create the Workflow MCP
- Create a script to start all the project-specific MCPs

### Step 7: Start Project-Specific MCPs

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

### Using Dependency-Based MCPs

```javascript
// Example of using the Docker MCP
const docker = require('@modelcontextprotocol/client-docker');
const dockerClient = new docker.DockerClient();

// Example of using the PostgreSQL MCP
const postgres = require('@modelcontextprotocol/client-postgres');
const postgresClient = new postgres.PostgresClient();

// Example of using the TypeScript MCP
const typescript = require('@modelcontextprotocol/client-typescript');
const typescriptClient = new typescript.TypeScriptClient();
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
