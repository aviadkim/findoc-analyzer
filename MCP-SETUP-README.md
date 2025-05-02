# MCP Servers Setup for Augment

This directory contains setup scripts for various MCP (Model Context Protocol) servers to use with Augment.

## Available Setup Scripts

1. `setup-brave-mcp.bat` - Sets up the Brave Search MCP server
2. `setup-github-mcp.bat` - Sets up the GitHub MCP server
3. `setup-sqlite-mcp.bat` - Sets up the SQLite MCP server
4. `setup-magic-mcp.bat` - Sets up the Magic MCP server
5. `setup-supabase-mcp.bat` - Sets up the Supabase MCP server
6. `setup-browser-tools-mcp.bat` - Sets up the Browser Tools MCP server
7. `setup-firecrawl-mcp.bat` - Sets up the Firecrawl MCP server
8. `setup-puppeteer-mcp.bat` - Sets up the Puppeteer MCP server

## How to Use

### Option 1: Set Up Individual MCP Servers

Run the specific setup script for the MCP server you want to set up. For example:

```
setup-brave-mcp.bat
```

### Option 2: Set Up All MCP Servers

Run the master setup script to set up all MCP servers:

```
setup-all-mcp.bat
```

## MCP Server Configurations for Augment

After running the setup scripts, you need to configure Augment to use these MCP servers. Here are the configurations for each server:

### 1. Brave Search MCP

- **Name**: Brave Search MCP
- **Command**: `node C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server\run-brave-search.js`
- **Environment Variables**: None (API key is hardcoded in the script)

### 2. GitHub MCP

- **Name**: GitHub MCP
- **Command**: `cmd /c node C:\Users\aviad\OneDrive\Desktop\MCP\github\run-github.js`
- **Environment Variables**:
  - **GITHUB_PERSONAL_ACCESS_TOKEN**: `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`

### 3. SQLite MCP

- **Name**: SQLite MCP
- **Command**: `cmd /c npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db`
- **Environment Variables**: None

### 4. Magic MCP

- **Name**: Magic MCP
- **Command**: `cmd /c npx -y @21st-dev/magic@latest`
- **Environment Variables**: None

### 5. Supabase MCP

- **Name**: Supabase MCP
- **Command**: `cmd /c npx -y @supabase/mcp-server-supabase@latest --access-token sbp_cdcfec9d48c88f29d0e7c24a36cc450104b35055`
- **Environment Variables**: None

### 6. Browser Tools MCP

- **Name**: Browser Tools MCP
- **Command**: `cmd /c npx -y @agentdeskai/browser-tools-mcp@latest`
- **Environment Variables**: None

### 7. Firecrawl MCP

- **Name**: Firecrawl MCP
- **Command**: `cmd /c set FIRECRAWL_API_KEY=fc-857417811665460e92716b92e08ec398 && npx -y firecrawl-mcp`
- **Environment Variables**: None (API key is included in the command)

### 8. Puppeteer MCP

- **Name**: Puppeteer MCP
- **Command**: `cmd /c npx -y @modelcontextprotocol/server-puppeteer`
- **Environment Variables**: None

## Testing the MCP Servers

To test if an MCP server is working correctly, you can run the command specified in its configuration and then try using it with Augment.

For example, to test the Brave Search MCP server:

1. Run: `node C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server\run-brave-search.js`
2. In Augment, ask: "Search for 'artificial intelligence' using Brave"

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed
2. Check that the paths in the commands are correct
3. Verify that the API keys are valid
4. Check the console output for any error messages

## Notes

- Some MCP servers require API keys to function properly
- The setup scripts install the necessary dependencies for each MCP server
- The MCP servers run on different ports (3000-3007) to avoid conflicts
