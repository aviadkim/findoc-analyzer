# FinDoc Analyzer MCP Quick Start Guide

This guide explains how to use Model Context Protocol (MCP) servers to dramatically enhance the FinDoc Analyzer project's development, testing, and functionality.

## What are MCPs?

Model Context Protocol (MCP) servers extend the capabilities of AI assistants like Claude, allowing them to use external tools and services. For the FinDoc Analyzer project, MCPs provide powerful capabilities including:

- Web search and research
- Browser automation for testing
- File system access for document processing
- Database interactions
- Enhanced reasoning and memory

## Installation

### Quick Install (All MCPs)

Run the comprehensive installation script:

```bash
# Make the script executable
chmod +x install-comprehensive-mcps.sh

# Run the installation
./install-comprehensive-mcps.sh
```

This will install all useful MCPs and create configuration files.

### Selective Installation

If you prefer to install only specific MCPs:

```bash
# Essential MCPs for FinDoc development
npm install -g @modelcontextprotocol/server-github brave-search-mcp @supabase/mcp-server-supabase @modelcontextprotocol/server-puppeteer @21st-dev/magic @modelcontextprotocol/server-sequentialthinking @modelcontextprotocol/server-filesystem
```

## Starting MCP Servers

To start all MCP servers:

```bash
# On Linux/Mac
./start-all-mcps.sh

# On Windows
start-all-mcps.bat
```

## Testing MCP Functionality

Test if your MCPs are working correctly:

```bash
# Run the MCP test script
node test-mcp-functionality.js
```

## Using MCPs in Development

### MCP Integration Service

The `McpIntegration` class provides a unified interface to all MCP servers:

```javascript
const McpIntegration = require('./services/mcp-integration');

// Initialize
const mcpIntegration = new McpIntegration({ debug: true });

// Example: Web search
const searchResults = await mcpIntegration.search('ISIN code US0378331005 company', { 
  type: 'web', 
  count: 3 
});

// Example: Memory storage
await mcpIntegration.memorize('portfolio_data', portfolioData);
const storedData = await mcpIntegration.recall('portfolio_data');

// Example: Sequential thinking for complex problems
const thinkingResult = await mcpIntegration.think(
  'How to extract ISIN codes from financial documents?',
  { maxSteps: 3 }
);
```

### Enhanced Document Extraction

The `EnhancedExtraction` class uses MCPs to improve document processing:

```javascript
const EnhancedExtraction = require('./services/enhanced-extraction');
const McpIntegration = require('./services/mcp-integration');

// Initialize
const mcpIntegration = new McpIntegration();
const enhancedExtraction = new EnhancedExtraction({ 
  mcpIntegration,
  debug: true 
});

// Extract financial entities with AI assistance
const entities = await enhancedExtraction.extractFinancialEntities(documentText);

// Extract tables from documents
const tables = await enhancedExtraction.extractFinancialTables(pdfPath);
```

## Key MCPs for FinDoc Development

| MCP | Purpose | Key Features |
|-----|---------|--------------|
| Brave Search | Research | Web search for financial data and techniques |
| GitHub | Code Management | Repository interaction, PR management |
| Puppeteer/Playwright | Testing | Browser automation for UI testing |
| Sequential Thinking | Reasoning | Enhanced problem-solving for complex financial analysis |
| Memory | Data Retention | Store and recall data between sessions |
| FileSystem | File Operations | Process PDF documents and other files |
| Supabase | Database | Interact with PostgreSQL database |
| Magic | Code Generation | AI-enhanced coding assistance |

## Demo Script

Run the demo script to see MCPs in action:

```bash
node demo-mcp-services.js
```

This demo showcases:
- Synthetic data generation
- Memory storage and retrieval
- AI-powered portfolio analysis
- Financial news search

## Troubleshooting

If you encounter issues:

1. **MCP Not Responding**: Check if the MCP server is running with `ps aux | grep mcp`
2. **Installation Issues**: Try installing globally with `npm install -g <mcp-package>`
3. **Permission Denied**: Run installation scripts with administrator privileges
4. **Timeout Errors**: Increase the timeout in options: `{ timeout: 60000 }`

## Further Resources

- [MCP GitHub Repository](https://github.com/modelcontextprotocol/server)
- [Brave Search MCP Documentation](https://github.com/mikechao/brave-search-mcp)
- [Sequential Thinking MCP Documentation](https://github.com/modelcontextprotocol/server-sequentialthinking)