# Guide for Installing and Configuring Missing MCP Servers

This guide provides instructions for installing and configuring the MCP servers that were previously not working in your MCP folder.

## 1. VSCode MCP

### Installation

1. Install the BifrostMCP VSCode Extension:
   - Open VSCode
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "BifrostMCP"
   - Install the "Bifrost MCP" extension by Connor Hallman

### Configuration for Augment

```
Name: VSCode MCP
Command: npx -y supergateway --sse http://localhost:8008/sse
Environment Variables: No environment variables set
```

### Benefits for Coding

- Code navigation (find references, definitions, implementations)
- Symbol search across workspace
- Code analysis (semantic tokens, document symbols)
- Smart selection for intelligent code selection
- Code actions (refactoring suggestions, quick fixes)

## 2. Docker MCP

### Installation

```bash
npm install -g @docker/cli-mcp
```

### Configuration for Augment

```
Name: Docker MCP
Command: npx -y @docker/cli-mcp
Environment Variables: No environment variables set
```

### Benefits for Coding

- Container management (create, start, stop, remove)
- Image management (build, pull, push, remove)
- Volume management (create, list, remove)
- Network management (create, list, remove)
- Docker Compose operations

## 3. Kubernetes MCP

### Installation

```bash
npm install -g kubernetes-mcp-server
```

### Configuration for Augment

```
Name: Kubernetes MCP
Command: npx -y kubernetes-mcp-server
Environment Variables: No environment variables set
```

### Benefits for Coding

- Cluster management
- Pod management (create, list, delete)
- Deployment management
- Service management
- ConfigMap and Secret management
- Log viewing and troubleshooting

## 4. ESLint MCP

### Installation

```bash
npm install -g eslint-mcp
```

### Configuration for Augment

```
Name: ESLint MCP
Command: npx -y eslint-mcp
Environment Variables: No environment variables set
```

### Benefits for Coding

- Code linting and analysis
- Automatic code style enforcement
- Identification of potential bugs and issues
- Suggestions for code improvements
- Integration with your project's ESLint configuration

## 5. TypeScript MCP

### Installation

```bash
npm install -g typescript-mcp
```

### Configuration for Augment

```
Name: TypeScript MCP
Command: npx -y typescript-mcp
Environment Variables: No environment variables set
```

### Benefits for Coding

- Type checking and validation
- TypeScript compilation
- Type information and suggestions
- Integration with your project's TypeScript configuration
- Enhanced code navigation and analysis

## 6. Prettier MCP

### Installation

```bash
npm install -g prettier-mcp
```

### Configuration for Augment

```
Name: Prettier MCP
Command: npx -y prettier-mcp
Environment Variables: No environment variables set
```

### Benefits for Coding

- Automatic code formatting
- Consistent code style enforcement
- Integration with your project's Prettier configuration
- Support for multiple file types (JavaScript, TypeScript, CSS, HTML, etc.)
- Improved code readability

## 7. Jest MCP

### Installation

```bash
npm install -g jest-mcp
```

### Configuration for Augment

```
Name: Jest MCP
Command: npx -y jest-mcp
Environment Variables: No environment variables set
```

### Benefits for Coding

- Test execution and reporting
- Test coverage analysis
- Test debugging
- Integration with your project's Jest configuration
- Enhanced test development workflow

## 8. Langchain MCP

### Installation

```bash
npm install -g langchain-mcp
```

### Configuration for Augment

```
Name: Langchain MCP
Command: npx -y langchain-mcp
Environment Variables: No environment variables set
```

### Benefits for Coding

- Integration with language models
- Chain creation and management
- Vector database operations
- Document loading and processing
- Enhanced AI application development

## 9. Qdrant MCP

### Installation

```bash
pip install qdrant-mcp
```

### Configuration for Augment

```
Name: Qdrant MCP
Command: python -m qdrant_mcp
Environment Variables: No environment variables set
```

### Benefits for Coding

- Vector database operations
- Similarity search
- Collection management
- Point management
- Enhanced AI application development with vector embeddings

## 10. Semgrep MCP

### Installation

```bash
pip install semgrep-mcp
```

### Configuration for Augment

```
Name: Semgrep MCP
Command: python -m semgrep_mcp
Environment Variables: No environment variables set
```

### Benefits for Coding

- Code security analysis
- Vulnerability detection
- Custom rule creation and management
- Integration with your project's Semgrep configuration
- Enhanced code security and quality

## Troubleshooting

If you encounter issues with any of these MCP servers:

1. Make sure the required dependencies are installed (Node.js, Python, Docker, etc.)
2. Verify that the MCP server is installed correctly
3. Check if the MCP server is running
4. Restart the MCP server
5. Check the logs for error messages

## Starting All MCP Servers

To start all MCP servers at once, you can use the `start-all-mcps.bat` script in your MCP folder. This script will start all the MCP servers in separate windows.

## Starting Individual MCP Servers

To start an individual MCP server, you can use the `start-mcp.bat` script in your MCP folder. This script takes the name of the MCP server as an argument.

For example:

```bash
start-mcp.bat vscode
```

This will start the VSCode MCP server in a separate window.
