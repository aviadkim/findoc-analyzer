# Claude Desktop MCP Setup Guide

This guide provides step-by-step instructions for setting up Claude Desktop with all the necessary Model Context Protocol (MCP) servers for the FinDoc Analyzer project.

## Step 1: Install Claude Desktop

If you haven't already, download and install Claude Desktop from the official Anthropic website.

## Step 2: Configure MCP Servers in Claude Desktop

Claude Desktop uses a configuration file to manage MCP servers. The configuration file should be placed at:

- **Windows**: `%APPDATA%\Claude Desktop\mcp-config.json`
- **macOS**: `~/Library/Application Support/Claude Desktop/mcp-config.json`
- **Linux**: `~/.config/Claude Desktop/mcp-config.json`

### Option 1: Copy the Configuration File

1. Copy the `claude-desktop-mcp-config.json` file we've created
2. Navigate to the appropriate directory for your operating system
3. Rename the file to `mcp-config.json` and place it in the directory

### Option 2: Create the Configuration File Manually

1. Navigate to the appropriate directory for your operating system
2. Create a new file named `mcp-config.json`
3. Copy and paste the following content into the file:

```json
{
  "mcpServers": {
    "brave": {
      "command": "node",
      "args": ["C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\brave-search-mcp.js"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    },
    "sqlite": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-sqlite", "--db-path", "C:\\Users\\aviad\\test.db"]
    },
    "magic": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@21st-dev/magic@latest"]
    },
    "supabase": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@supabase/mcp-server-supabase@latest", "--access-token", "sbp_cdcfec9d48c88f29d0e7c24a36cc450104b35055"]
    },
    "browserTools": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@agentdeskai/browser-tools-mcp@latest"]
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"]
    },
    "puppeteer": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-puppeteer"]
    },
    "git": {
      "command": "python",
      "args": ["-m", "mcp_server_git"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    },
    "vscode": {
      "command": "node",
      "args": ["C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\vscode-mcp.js"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"]
    },
    "redis": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-redis"]
    },
    "sequentialthinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequentialthinking"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "qdrant": {
      "command": "python",
      "args": ["C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\qdrant_mcp.py"]
    },
    "langchain": {
      "command": "node",
      "args": ["C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\langchain-mcp.js"]
    },
    "semgrep": {
      "command": "python",
      "args": ["-m", "semgrep_mcp"]
    },
    "eslint": {
      "command": "node",
      "args": ["C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\eslint-mcp.js"]
    },
    "typescript": {
      "command": "node",
      "args": ["C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\typescript-mcp.js"]
    },
    "prettier": {
      "command": "node",
      "args": ["C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\prettier-mcp.js"]
    },
    "jest": {
      "command": "node",
      "args": ["C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\jest-mcp.js"]
    },
    "docker": {
      "command": "node",
      "args": ["C:\\Users\\aviad\\OneDrive\\Desktop\\MCP\\mcp-packages\\custom-mcps\\docker-mcp.js"]
    },
    "kubernetes": {
      "command": "npx",
      "args": ["-y", "kubernetes-mcp"]
    },
    "time": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-time"]
    },
    "taskmaster": {
      "command": "npx",
      "args": ["-y", "@mcpso/taskmaster"]
    }
  }
}
```

## Step 3: Install Required MCP Packages

Some MCP servers require specific packages to be installed. Run the following commands to install the necessary packages:

```bash
# Install npm packages
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-sqlite
npm install -g @21st-dev/magic
npm install -g @supabase/mcp-server-supabase
npm install -g @agentdeskai/browser-tools-mcp
npm install -g firecrawl-mcp
npm install -g @modelcontextprotocol/server-puppeteer
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-fetch
npm install -g @modelcontextprotocol/server-postgres
npm install -g @modelcontextprotocol/server-redis
npm install -g @modelcontextprotocol/server-sequentialthinking
npm install -g @modelcontextprotocol/server-memory
npm install -g kubernetes-mcp
npm install -g @modelcontextprotocol/server-time
npm install -g @mcpso/taskmaster

# Install Python packages
pip install mcp-server-git
pip install semgrep-mcp
```

## Step 4: Start Claude Desktop

1. Start Claude Desktop
2. Claude Desktop will automatically start the MCP servers as needed

## Step 5: Verify MCP Servers

To verify that the MCP servers are working correctly in Claude Desktop:

1. Open Claude Desktop
2. Start a new chat
3. Ask Claude to use one of the MCP servers, for example:
   ```
   Can you use the GitHub MCP to list my repositories?
   ```
4. Claude should be able to use the MCP server and respond accordingly

## Step 6: Share Development Context with Claude Desktop

To continue development of the FinDoc Analyzer project in Claude Desktop, share the development context:

1. Open the `FINDOC-DEVELOPMENT-CONTEXT.md` file
2. Copy the contents of the file
3. Paste the contents into a new chat in Claude Desktop
4. Specify which issue you want to address or which feature you want to implement

## Troubleshooting

If you encounter issues with MCP servers in Claude Desktop:

1. Check that the configuration file is correctly placed and formatted
2. Verify that all required packages are installed
3. Check the Claude Desktop logs for error messages
4. Restart Claude Desktop
5. If a specific MCP server is not working, try running it manually to see if there are any errors

## Conclusion

By following these steps, you should have successfully set up Claude Desktop with all the necessary MCP servers for the FinDoc Analyzer project. You can now use Claude Desktop to continue development of the project with the full power of MCP servers.
