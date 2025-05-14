# FinDoc Analyzer: MCP Setup Guide

This guide provides comprehensive instructions for setting up and running the FinDoc Analyzer application with Model Context Protocol (MCP) servers.

## Overview

The FinDoc Analyzer application requires several MCP servers to enable AI agents to interact with various components of the system. This guide provides multiple methods for setting up these servers to ensure you have a robust development environment.

## Prerequisites

- Node.js 16 or higher
- npm 7 or higher
- Git (for version control)
- Docker (optional, but recommended for some MCP servers)

## Quick Start

For the quickest setup, run the master script that tries multiple methods to ensure all MCP servers are running:

```bash
.\setup-all-mcps.ps1
```

This script will:
1. Try using Docker for core MCP servers (Filesystem, Sequential Thinking, Redis)
2. Try using the mcp-get tool for additional servers
3. Try using npm directly for remaining servers
4. Clone from GitHub as a last resort

## Alternative Setup Methods

If you prefer a specific setup method, you can use one of the following scripts:

### 1. Using npm directly

```bash
.\start-npm-mcps.ps1
```

This script installs and starts MCP servers using npm directly.

### 2. Using mcp-get tool

```bash
.\install-with-mcp-get.ps1
```

This script installs and starts MCP servers using the mcp-get tool.

### 3. Using MCP Hub

```bash
.\install-with-mcp-hub.ps1
```

This script installs and starts MCP servers using the MCP Hub tool.

### 4. Cloning from GitHub

```bash
.\install-from-github.ps1
```

This script clones and installs MCP servers directly from the official GitHub repositories.

## MCP Servers

The following MCP servers are used by the FinDoc Analyzer application:

### Core MCP Servers
- **Filesystem MCP**: For file operations and document access
- **Sequential Thinking MCP**: For step-by-step reasoning and problem-solving
- **Redis MCP**: For caching and message passing

### Additional MCP Servers
- **Puppeteer MCP**: For UI testing and browser automation
- **Playwright MCP**: For comprehensive UI testing
- **Memory MCP**: For persistent memory and knowledge graph
- **GitHub MCP**: For GitHub integration
- **Fetch MCP**: For fetching web content
- **Brave MCP**: For web search
- **Magic MCP (21st.dev)**: For UI component generation
- **Supabase MCP**: For database integration

## Verifying MCP Servers

To verify that the MCP servers are running correctly, you can use the following commands:

### Docker MCP Servers

```bash
docker ps | findstr mcp
```

### npm MCP Servers

```bash
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Select-String "mcp"
```

## Using MCP Servers with Augment

The setup scripts create an MCP configuration file for Augment at:

```
augment-mcp-config.json
```

This file contains the configuration for all running MCP servers and can be used with Augment to enable AI agents to interact with the FinDoc Analyzer application.

## Troubleshooting

### Docker Issues

If you encounter issues with Docker MCP servers, try the following:

1. Check if Docker is running:
   ```bash
   docker info
   ```

2. Check if the MCP servers are running:
   ```bash
   docker ps | findstr mcp
   ```

3. Restart the MCP servers:
   ```bash
   docker restart mcp-filesystem mcp-sequentialthinking mcp-redis
   ```

### npm Issues

If you encounter issues with npm MCP servers, try the following:

1. Check if the MCP servers are installed:
   ```bash
   npm list -g | findstr mcp
   ```

2. Reinstall the MCP servers:
   ```bash
   npm uninstall -g @modelcontextprotocol/server-puppeteer
   npm install -g @modelcontextprotocol/server-puppeteer
   ```

### GitHub Issues

If you encounter issues with GitHub MCP servers, try the following:

1. Check if the repositories are cloned:
   ```bash
   dir mcp-servers
   ```

2. Pull the latest changes:
   ```bash
   cd mcp-servers\servers
   git pull
   cd ..
   ```

## Running the FinDoc Analyzer Application

Once the MCP servers are running, you can run the FinDoc Analyzer application:

```bash
npm run start
```

The application will be available at http://localhost:8080.

## Conclusion

By following this guide, you should have successfully set up the necessary MCP servers for the FinDoc Analyzer application. These servers enable AI agents to interact with various components of the system, providing a powerful and flexible development environment.
