# Updating Augment MCP Configuration

Based on our testing and installation of MCP servers, here are the recommended updates to your Augment configuration:

## Docker MCP

If you successfully installed Docker MCP from GitHub:

```
Name: Docker MCP
Command: npx -y docker-mcp
Environment Variables: No environment variables set
```

## Kubernetes MCP

If you successfully installed Kubernetes MCP from GitHub:

```
Name: Kubernetes MCP
Command: npx -y kubernetes-mcp
Environment Variables: No environment variables set
```

## ESLint MCP

If you successfully installed ESLint MCP from GitHub:

```
Name: ESLint MCP
Command: npx -y eslint-mcp
Environment Variables: No environment variables set
```

## TypeScript MCP

If you successfully installed TypeScript MCP from GitHub:

```
Name: TypeScript MCP
Command: npx -y typescript-mcp
Environment Variables: No environment variables set
```

## Prettier MCP

If you successfully installed Prettier MCP from GitHub:

```
Name: Prettier MCP
Command: npx -y prettier-mcp
Environment Variables: No environment variables set
```

## Jest MCP

If you successfully installed Jest MCP from GitHub:

```
Name: Jest MCP
Command: npx -y jest-mcp
Environment Variables: No environment variables set
```

## VSCode MCP

If you successfully installed VSCode MCP from GitHub:

```
Name: VSCode MCP
Command: npx -y vscode-mcp
Environment Variables: No environment variables set
```

## Langchain MCP

If you successfully installed Langchain MCP:

```
Name: Langchain MCP
Command: npx -y langchain-mcp
Environment Variables: No environment variables set
```

## Qdrant MCP

If you successfully installed Qdrant MCP:

```
Name: Qdrant MCP
Command: python -m qdrant_mcp
Environment Variables: No environment variables set
```

## Semgrep MCP

If you successfully installed Semgrep MCP:

```
Name: Semgrep MCP
Command: python -m semgrep_mcp
Environment Variables: No environment variables set
```

## Important Notes

1. Only update the configuration for MCPs that were successfully installed.
2. If an MCP was installed with a different package name than what's configured in Augment, update the command accordingly.
3. After updating the configuration, restart Augment for the changes to take effect.
4. Test each MCP individually to ensure it's working correctly.

## Testing MCPs

To test if an MCP is working correctly:

1. Start the MCP server using the command in the configuration.
2. Check if the server starts without errors.
3. Try using the MCP's functionality in Augment.

If you encounter any issues, check the installation logs for error messages and troubleshooting information.
