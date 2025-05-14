# Claude MCP Servers Setup Guide

## Introduction

This guide provides instructions for setting up and using the Model Context Protocol (MCP) servers with Claude. The following MCP servers have been installed:

1. **Firecrawl MCP** - For web scraping and browser automation
2. **Context7 MCP** - For context storage and retrieval
3. **Playwright MCP** - For browser automation and UI testing

## Prerequisites

- Node.js v18.0.0 or later
- npm v8.0.0 or later
- Windows, macOS, or Linux operating system

## Installation

All necessary MCP servers have been installed in the `mcp-servers` directory. The following components are included:

- Firecrawl MCP server with Puppeteer
- Context7 MCP server
- Configuration files for both servers
- Start and stop scripts for Windows and Unix-based systems

## Starting MCP Servers

### Windows

1. Open a Command Prompt
2. Navigate to the `mcp-servers` directory
3. Run the start script:
   ```
   start-mcps.bat
   ```

### macOS/Linux

1. Open a Terminal
2. Navigate to the `mcp-servers` directory
3. Make the start script executable (if not already):
   ```
   chmod +x start-mcps.sh
   ```
4. Run the start script:
   ```
   ./start-mcps.sh
   ```

## Stopping MCP Servers

### Windows

1. Open a Command Prompt
2. Navigate to the `mcp-servers` directory
3. Run the stop script:
   ```
   stop-mcps.bat
   ```

### macOS/Linux

1. Open a Terminal
2. Navigate to the `mcp-servers` directory
3. Make the stop script executable (if not already):
   ```
   chmod +x stop-mcps.sh
   ```
4. Run the stop script:
   ```
   ./stop-mcps.sh
   ```

## Testing MCP Servers

A test script has been provided to verify that both MCP servers are working correctly:

1. Start the MCP servers using the instructions above
2. Run the test script:
   ```
   node test-firecrawl.js
   ```

The test script will:
1. Test the Firecrawl MCP by scraping example.com
2. Test the Context7 MCP by storing and retrieving a test value

## MCP Server Details

### Firecrawl MCP

- **Port:** 8081
- **API Key:** `fc-857417811665460e92716b92e08ec398`
- **Configuration File:** `firecrawl-config.json`
- **Features:**
  - Web scraping with selectors
  - Javascript execution
  - Browser automation
  - Element interactions
  - Full page screenshots

### Context7 MCP

- **Port:** 8082
- **Configuration File:** `context7-config.json`
- **Features:**
  - Key-value storage
  - Context storage and retrieval
  - Buffer limiting

### Playwright MCP

- **Port:** 8083
- **Configuration File:** `playwright-config.json`
- **Features:**
  - Browser automation
  - UI testing
  - Screenshots
  - Browser context management
  - Element selection and interaction

## Using MCP Servers with Claude

When using Claude, you can use the following configuration to connect to the MCP servers:

```json
{
  "mcpConfig": {
    "firecrawl": {
      "url": "http://localhost:8081/mcp",
      "options": {
        "selectors": ["h1", "p", ".content"],
        "wait": 2000
      }
    },
    "context7": {
      "url": "http://localhost:8082/mcp"
    },
    "playwright": {
      "url": "http://localhost:8083/mcp",
      "options": {
        "headless": true,
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - If another application is using port 8081 or 8082, change the port in the respective configuration file.

2. **Puppeteer installation issues**
   - On Linux systems, Puppeteer might require additional system dependencies. See the [Puppeteer troubleshooting guide](https://pptr.dev/troubleshooting).

3. **Firecrawl API key issues**
   - If you encounter authentication errors, verify the API key in `firecrawl-config.json`.

### Checking Server Status

To check if the MCP servers are running:

```
netstat -ano | findstr 8081  # Windows
netstat -tuln | grep 8081    # Linux/macOS
```

Repeat for port 8082 to check the Context7 MCP.

## Additional Resources

- [Firecrawl Documentation](https://github.com/mendableai/firecrawl-mcp-server)
- [Context7 Documentation](https://github.com/upstash/context7)
- [MCP Core Documentation](https://github.com/modelcontextprotocol/servers)

## Support

If you encounter any issues, please:

1. Check the console output of the MCP servers for error messages
2. Review the logs in the respective server directories
3. Refer to the GitHub repositories for known issues and troubleshooting steps