# MCP Servers Setup for Development

This guide provides comprehensive instructions for setting up and using Model Context Protocol (MCP) servers for development with Augment.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Available MCP Servers](#available-mcp-servers)
5. [API Keys](#api-keys)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Introduction

Model Context Protocol (MCP) servers enhance AI assistants like Augment by providing them with tools to interact with various services and perform specific tasks. This setup includes a curated selection of MCP servers specifically chosen to improve development workflows.

## Installation

### Prerequisites

- Node.js and npm
- Python 3.8+ and pip
- Git

### Installation Steps

1. **Run the installation script**:
   ```
   install-dev-mcp-servers.bat
   ```

   This script will:
   - Create necessary directories
   - Install all MCP servers
   - Create a configuration file for Augment

2. **Verify installation**:
   After installation, you should have:
   - MCP servers installed globally
   - A configuration file at `C:\Users\aviad\OneDrive\Desktop\MCP\config\dev-mcp-config.json`

## Configuration

To configure Augment to use these MCP servers:

1. Open Augment
2. Go to Settings
3. Navigate to the MCP section
4. Copy the contents of `C:\Users\aviad\OneDrive\Desktop\MCP\config\dev-mcp-config.json` into the Augment MCP configuration
5. Save the configuration

## Available MCP Servers

The installation includes the following categories of MCP servers:

### Core Development Tools
- **GitHub MCP**: Repository management, file operations, and GitHub API integration
- **GitLab MCP**: GitLab API integration for project management
- **SQLite MCP**: Lightweight database interaction with business intelligence capabilities
- **PostgreSQL MCP**: Schema inspection and read-only database access
- **Puppeteer MCP**: Browser automation for testing web applications

### Code Quality & Security
- **Semgrep MCP**: Security-focused static analysis tool
- **Codacy MCP**: API integration for code quality metrics

### AI-Specific Enhancements
- **Sequential Thinking MCP**: Dynamic problem-solving through thought sequences
- **Memory MCP**: Persistent knowledge graph system
- **Qdrant MCP**: Vector search engine for semantic code retrieval

### Workflow Automation
- **Zapier MCP**: Connect to 8,000+ apps for workflow automation

### Data & API Tools
- **Firecrawl MCP**: Web scraping API for documentation retrieval
- **Stripe MCP**: Payment API integration
- **AWS MCP**: Boto3-powered cloud resource management

### Specialized Development
- **Neo4j MCP**: Graph database integration
- **Elasticsearch MCP**: Full-text and semantic search
- **Docker MCP**: Secure containerized code execution

### Web & UI Development
- **Magic MCP (21st.dev)**: Create crafted UI components
- **Browser Tools MCP**: Browser interaction tools
- **Brave Search MCP**: Web search capabilities

## API Keys

Some MCP servers require API keys to function properly. See the `mcp-api-keys-guide.md` file for detailed instructions on obtaining and configuring API keys.

The following API keys are already configured:
- Brave Search API Key
- GitHub Personal Access Token
- Firecrawl API Key
- Supabase Access Token

## Testing

To test if an MCP server is working correctly:

1. Start Augment
2. Ask a question that would require the MCP server to function
3. Check if Augment can successfully use the MCP server

Example test queries:
- GitHub MCP: "Show me the latest commits in my repository"
- Brave Search MCP: "Search for information about React hooks"
- Magic MCP: "Create a login form component"

## Troubleshooting

If you encounter issues with any MCP server:

1. **Check installation**:
   ```
   npm list -g | grep mcp
   pip list | grep mcp
   ```

2. **Verify API keys**:
   Make sure any required API keys are correctly configured in Augment.

3. **Check logs**:
   Look for error messages in the Augment logs.

4. **Reinstall specific server**:
   ```
   npm uninstall -g [package-name]
   npm install -g [package-name]
   ```

5. **Update configuration**:
   Make sure the configuration in Augment matches the installed servers.

6. **Network issues**:
   Some MCP servers require internet access. Make sure your network allows the necessary connections.

## Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Augment Documentation](https://www.augment.co/docs)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)

## Support

If you need help with MCP servers, you can:
- Check the documentation for each specific MCP server
- Visit the MCP community on [GitHub Discussions](https://github.com/orgs/modelcontextprotocol/discussions)
- Ask for help in the [MCP Discord Server](https://discord.gg/jHEGxQu2a5)
