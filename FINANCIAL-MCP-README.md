# MCP Setup for Financial SaaS Project

This guide provides instructions for setting up and using MCPs (Model Context Protocol servers) for your financial SaaS project.

## Global MCPs

These MCPs are installed globally in `%USERPROFILE%\.mcp-servers` and are available to all projects:

| MCP Name | Purpose | Description |
|----------|---------|-------------|
| Brave Search | Web search | Provides web search capabilities using Brave Search API |
| GitHub | Code repository | Interacts with GitHub repositories, issues, and PRs |
| SQLite | Database | Provides SQLite database operations |
| Magic | UI generation | Generates UI components and designs |
| Supabase | Backend services | Interacts with Supabase backend services |
| Browser Tools | Browser automation | Provides browser automation capabilities |
| Firecrawl | Web crawling | Crawls websites for information |
| Puppeteer | Browser automation | Controls headless Chrome for web automation |
| Git | Version control | Interacts with Git repositories |
| Filesystem | File operations | Reads and writes files on your system |
| VSCode | Editor integration | Interacts with VS Code editor features |
| Fetch | API requests | Makes HTTP requests to APIs |
| PostgreSQL | Database | Interacts with PostgreSQL databases |
| Redis | Key-value store | Interacts with Redis key-value stores |
| Sequential Thinking | Problem solving | Helps break down complex problems |
| Memory | Information storage | Stores and retrieves information for the AI |
| Qdrant | Vector database | Interacts with Qdrant vector database |
| Langchain | AI workflows | Builds and runs LangChain workflows |
| Semgrep | Code analysis | Analyzes code for security vulnerabilities |
| ESLint | Code linting | Analyzes JavaScript/TypeScript code for issues |
| TypeScript | Type checking | Provides TypeScript language services |
| Prettier | Code formatting | Formats code according to style rules |
| Jest | Testing | Runs JavaScript/TypeScript tests |
| Docker | Containerization | Interacts with Docker containers |
| Kubernetes | Container orchestration | Manages Kubernetes clusters |
| Time | Time operations | Provides time-related functions |
| Context7 | Context management | Provides advanced context management for AI |
| Playwright | Browser automation | Modern browser automation framework |
| Perplexity | Advanced search | Provides advanced search capabilities |
| OpenAI | AI services | Direct access to OpenAI APIs |
| Pinecone | Vector database | Vector database for AI applications |

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
- Fix Git MCP path issues
- Install Semgrep for the Semgrep MCP
- Create a configuration file for the Magic MCP
- Create a test database for the SQLite MCP

### Step 2: Start Global MCPs

Run the `start-all-mcps-for-project.bat` script to start all the global MCPs:

```
start-all-mcps-for-project.bat
```

This script will start all the global MCPs that don't require API keys.

### Step 3: Configure Augment

Run the `configure-augment-for-project.bat` script to configure Augment to use all the MCPs:

```
configure-augment-for-project.bat
```

This script will create a configuration file for Augment that includes all the MCPs.

### Step 4: Set Up Project-Specific MCPs

Run the `setup-project-mcps.bat` script to set up the project-specific MCPs:

```
setup-project-mcps.bat
```

This script will:
- Create the PDF Parser MCP
- Create the Financial Analytics MCP
- Create the Workflow MCP
- Create a script to start all the project-specific MCPs

### Step 5: Start Project-Specific MCPs

Run the `mcp-servers\start-project-mcps.bat` script to start all the project-specific MCPs:

```
mcp-servers\start-project-mcps.bat
```

This script will start all the project-specific MCPs.

## Using MCPs in Your Code

### Using Global MCPs

```javascript
// Example of using the GitHub MCP
const github = require('@modelcontextprotocol/client-github');
const client = new github.GitHubClient();

// Example of using the Memory MCP
const memory = require('@modelcontextprotocol/client-memory');
const memoryClient = new memory.MemoryClient();

// Example of using the SQLite MCP
const sqlite = require('@modelcontextprotocol/client-sqlite');
const sqliteClient = new sqlite.SQLiteClient();
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
