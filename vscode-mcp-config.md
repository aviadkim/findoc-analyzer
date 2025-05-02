# VSCode MCP Configuration for Augment

To use the VSCode MCP with Augment, follow these steps:

## Step 1: Install the BifrostMCP VSCode Extension

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "BifrostMCP"
4. Install the "Bifrost MCP" extension by Connor Hallman

## Step 2: Start the BifrostMCP Server

1. Open VSCode
2. Press Ctrl+Shift+P to open the command palette
3. Type "Bifrost MCP: Start Server" and select it
4. The server will start on port 8008 by default

## Step 3: Configure Augment to Use the BifrostMCP Server

Add the following configuration to Augment:

```
Name: VSCode MCP
Command: npx -y supergateway --sse http://localhost:8008/sse
Environment Variables: No environment variables set
```

## Step 4: Test the VSCode MCP

1. Open a project in VSCode
2. Start the BifrostMCP server
3. Open Augment
4. Ask Augment to perform code navigation or analysis tasks

## Benefits of VSCode MCP

The VSCode MCP provides the following capabilities to Augment:

- **Code Navigation**: Find references, definitions, implementations, and more
- **Symbol Search**: Search for symbols across your workspace
- **Code Analysis**: Get semantic tokens, document symbols, and type information
- **Smart Selection**: Use semantic selection ranges for intelligent code selection
- **Code Actions**: Access refactoring suggestions and quick fixes

## Troubleshooting

If you encounter issues:

1. Make sure VSCode is running
2. Verify that the BifrostMCP server is running (check the VSCode status bar)
3. Ensure port 8008 is not being used by another application
4. Restart VSCode and the BifrostMCP server
