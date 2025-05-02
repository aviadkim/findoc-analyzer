# Augment MCP Configuration Update

After installing the missing MCP servers, update your Augment configuration with the following settings:

## Working MCP Servers

```
Name: Memory MCP
Command: npx -y @modelcontextprotocol/server-memory
Environment Variables: No environment variables set

Name: GitHub MCP
Command: npx -y @modelcontextprotocol/server-github
Environment Variables: No environment variables set

Name: SQLite MCP
Command: C:\Users\aviad\AppData\Roaming\Python\Python313\Scripts\mcp-server-sqlite.exe --db-path C:\Users\aviad\test.db
Environment Variables: No environment variables set

Name: Brave Search MCP
Command: cd C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server && node build/index.js
Environment Variables: BRAVE_API_KEY=YOUR_BRAVE_API_KEY

Name: Git MCP
Command: python -m mcp_server_git
Environment Variables: No environment variables set

Name: Filesystem MCP
Command: npx -y @modelcontextprotocol/server-filesystem
Environment Variables: No environment variables set

Name: PostgreSQL MCP
Command: npx -y @modelcontextprotocol/server-postgres
Environment Variables: No environment variables set

Name: Redis MCP
Command: npx -y @modelcontextprotocol/server-redis
Environment Variables: No environment variables set

Name: Sequential Thinking MCP
Command: npx -y @modelcontextprotocol/server-sequentialthinking
Environment Variables: No environment variables set

Name: Puppeteer MCP
Command: npx -y @modelcontextprotocol/server-puppeteer
Environment Variables: No environment variables set

Name: Fetch MCP
Command: npx -y @modelcontextprotocol/server-fetch
Environment Variables: No environment variables set

Name: Time MCP
Command: npx -y @modelcontextprotocol/server-time
Environment Variables: No environment variables set

Name: Magic MCP
Command: npx -y @21st-dev/magic@latest
Environment Variables: No environment variables set

Name: Supabase MCP
Command: npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN
Environment Variables: No environment variables set

Name: Browser Tools MCP
Command: npx -y @agentdeskai/browser-tools-mcp@latest
Environment Variables: No environment variables set

Name: Firecrawl MCP
Command: npx -y firecrawl-mcp
Environment Variables: FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY
```

## Newly Installed MCP Servers

```
Name: VSCode MCP
Command: npx -y supergateway --sse http://localhost:8008/sse
Environment Variables: No environment variables set

Name: Docker MCP
Command: npx -y @docker/cli-mcp
Environment Variables: No environment variables set

Name: Kubernetes MCP
Command: npx -y kubernetes-mcp-server
Environment Variables: No environment variables set

Name: ESLint MCP
Command: npx -y eslint-mcp
Environment Variables: No environment variables set

Name: TypeScript MCP
Command: npx -y typescript-mcp
Environment Variables: No environment variables set

Name: Prettier MCP
Command: npx -y prettier-mcp
Environment Variables: No environment variables set

Name: Jest MCP
Command: npx -y jest-mcp
Environment Variables: No environment variables set

Name: Langchain MCP
Command: npx -y langchain-mcp
Environment Variables: No environment variables set

Name: Qdrant MCP
Command: python -m qdrant_mcp
Environment Variables: No environment variables set

Name: Semgrep MCP
Command: python -m semgrep_mcp
Environment Variables: No environment variables set
```

## Important Notes

1. For the VSCode MCP to work, you need to:
   - Install the BifrostMCP VSCode Extension
   - Start the BifrostMCP server in VSCode
   - Make sure VSCode is running when you use the VSCode MCP

2. For the Docker MCP to work, you need to:
   - Install Docker Desktop
   - Make sure Docker Desktop is running when you use the Docker MCP

3. For the Kubernetes MCP to work, you need to:
   - Install kubectl
   - Configure kubectl to connect to your Kubernetes cluster
   - Make sure kubectl is in your PATH

4. Replace `YOUR_BRAVE_API_KEY`, `YOUR_SUPABASE_TOKEN`, and `YOUR_FIRECRAWL_API_KEY` with your actual API keys.

5. After updating your Augment configuration, restart Augment for the changes to take effect.

## Testing

To test if an MCP server is working correctly:

1. Start the MCP server
2. Open Augment
3. Ask Augment to perform a task that uses the MCP server
4. Check if Augment can successfully complete the task

If you encounter any issues, check the logs for error messages and troubleshooting information.
