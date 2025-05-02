# Augment MCP Configuration

Based on the MCP servers in your MCP folder, here's the recommended configuration for Augment:

## Brave Search MCP

```
Name: Brave Search MCP
Command: npx -y brave-search-mcp
Environment Variables: BRAVE_API_KEY=YOUR_BRAVE_API_KEY
```

## GitHub MCP

```
Name: GitHub MCP
Command: npx -y @modelcontextprotocol/server-github
Environment Variables: No environment variables set
```

## SQLite MCP

```
Name: SQLite MCP
Command: npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db
Environment Variables: No environment variables set
```

## Magic MCP

```
Name: Magic MCP
Command: npx -y @21st-dev/magic@latest
Environment Variables: No environment variables set
```

## Supabase MCP

```
Name: Supabase MCP
Command: npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN
Environment Variables: No environment variables set
```

## Browser Tools MCP

```
Name: Browser Tools MCP
Command: npx -y @agentdeskai/browser-tools-mcp@latest
Environment Variables: No environment variables set
```

## Firecrawl MCP

```
Name: Firecrawl MCP
Command: npx -y firecrawl-mcp
Environment Variables: FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY
```

## Puppeteer MCP

```
Name: Puppeteer MCP
Command: npx -y @modelcontextprotocol/server-puppeteer
Environment Variables: No environment variables set
```

## Git MCP

```
Name: Git MCP
Command: python -m mcp_server_git
Environment Variables: No environment variables set
```

## Filesystem MCP

```
Name: Filesystem MCP
Command: npx -y @modelcontextprotocol/server-filesystem
Environment Variables: No environment variables set
```

## VSCode MCP

```
Name: VSCode MCP
Command: npx -y vscode-mcp
Environment Variables: No environment variables set
```

## Fetch MCP

```
Name: Fetch MCP
Command: npx -y @modelcontextprotocol/server-fetch
Environment Variables: No environment variables set
```

## PostgreSQL MCP

```
Name: PostgreSQL MCP
Command: npx -y @modelcontextprotocol/server-postgres
Environment Variables: No environment variables set
```

## Redis MCP

```
Name: Redis MCP
Command: npx -y @modelcontextprotocol/server-redis
Environment Variables: No environment variables set
```

## Sequential Thinking MCP

```
Name: Sequential Thinking MCP
Command: npx -y @modelcontextprotocol/server-sequentialthinking
Environment Variables: No environment variables set
```

## Memory MCP

```
Name: Memory MCP
Command: npx -y @modelcontextprotocol/server-memory
Environment Variables: No environment variables set
```

## Qdrant MCP

```
Name: Qdrant MCP
Command: python -m qdrant_mcp
Environment Variables: No environment variables set
```

## Langchain MCP

```
Name: Langchain MCP
Command: npx -y langchain-mcp
Environment Variables: No environment variables set
```

## Semgrep MCP

```
Name: Semgrep MCP
Command: python -m semgrep_mcp
Environment Variables: No environment variables set
```

## ESLint MCP

```
Name: ESLint MCP
Command: npx -y eslint-mcp
Environment Variables: No environment variables set
```

## TypeScript MCP

```
Name: TypeScript MCP
Command: npx -y typescript-mcp
Environment Variables: No environment variables set
```

## Prettier MCP

```
Name: Prettier MCP
Command: npx -y prettier-mcp
Environment Variables: No environment variables set
```

## Jest MCP

```
Name: Jest MCP
Command: npx -y jest-mcp
Environment Variables: No environment variables set
```

## Docker MCP

```
Name: Docker MCP
Command: npx -y docker-mcp
Environment Variables: No environment variables set
```

## Kubernetes MCP

```
Name: Kubernetes MCP
Command: npx -y kubernetes-mcp
Environment Variables: No environment variables set
```

## Time MCP

```
Name: Time MCP
Command: npx -y @modelcontextprotocol/server-time
Environment Variables: No environment variables set
```

## Important Notes

1. Replace `YOUR_BRAVE_API_KEY`, `YOUR_SUPABASE_TOKEN`, and `YOUR_FIRECRAWL_API_KEY` with your actual API keys.
2. Some MCP servers might not be available in the npm registry. In these cases, you'll need to build them from source or find alternative packages.
3. After updating your Augment configuration, restart Augment for the changes to take effect.
4. Test each MCP server individually to ensure it's working correctly.

## Testing MCPs

To test if an MCP is working correctly:

1. Start the MCP server using the command in the configuration.
2. Check if the server starts without errors.
3. Try using the MCP's functionality in Augment.

If you encounter any issues, check the logs for error messages and troubleshooting information.
