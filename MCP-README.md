# MCP Installation and Configuration Guide

This folder contains scripts and instructions for installing, testing, and configuring Model Context Protocol (MCP) servers for use with Augment.

## UI Validation with MCP for FinDoc Analyzer

We've added new scripts to validate the UI elements of the FinDoc Analyzer application deployed on Google Cloud Platform using MCP. This helps identify missing buttons, forms, and other UI elements that should be present in the deployed application.

### New Files for UI Validation

- `install-mcp.js`: Script to set up the MCP environment for UI validation
- `ui-validator.js`: Script to detect missing UI elements
- `augment-integration.js`: Main script for validating deployed interfaces
- `ci-integration.js`: Script to run as part of CI/CD pipeline

### Using the UI Validation

1. Install the MCP environment: `node install-mcp.js`
2. Run the validation: `node augment-integration.js`
3. Check the `validation-report.json` file for details about any missing UI elements

The validation is also integrated into the deployment process through the `deploy-to-cloud.ps1` script.

## Available Scripts

### 1. Check Available MCP Packages

```
check-available-mcps.bat
```

This script checks which MCP packages are available in the npm registry. It helps identify which packages can be installed directly using npm.

### 2. Install MCP Packages from GitHub

```
install-mcp-from-github.bat
```

This script clones MCP repositories from GitHub, builds them, and installs them globally. Use this if the packages are not available in the npm registry.

### 3. Install Individual MCP Servers

```
install-individual-mcp.bat [mcp-name]
```

This script installs a specific MCP server. Available MCP names:
- `docker` - Docker MCP
- `kubernetes` - Kubernetes MCP
- `eslint` - ESLint MCP
- `typescript` - TypeScript MCP
- `prettier` - Prettier MCP
- `jest` - Jest MCP
- `langchain` - Langchain MCP
- `vscode` - VSCode MCP
- `qdrant` - Qdrant MCP
- `semgrep` - Semgrep MCP

### 4. Install Docker MCP

```
install-docker-mcp.bat
```

This script specifically focuses on installing Docker MCP, trying multiple package names and configurations.

### 5. Custom MCP Installation

```
custom-mcp-install.bat
```

This script attempts to install various MCP packages using alternative package names.

## Updating Augment Configuration

After installing MCP servers, you need to update your Augment configuration to use the correct commands. See `update-augment-config.md` for detailed instructions.

## Troubleshooting

If you encounter issues with MCP installation or configuration:

1. Check the log files in this folder for error messages.
2. For more detailed logs, check the `logs` directory.
3. Try installing the MCP packages from GitHub if they're not available in the npm registry.
4. Make sure you have the necessary dependencies installed (Node.js, Python, etc.).
5. Check if the MCP server requires any specific environment variables or configuration.

## Starting MCP Servers

To start an MCP server:

1. Open a command prompt.
2. Navigate to this folder.
3. Run the appropriate command for the MCP server you want to start.

For example, to start Docker MCP:

```
npx -y docker-mcp
```

## Testing MCP Servers

To test if an MCP server is working correctly:

1. Start the MCP server.
2. Check if it starts without errors.
3. Try using the MCP's functionality in Augment.

If the MCP server doesn't start or doesn't work correctly, check the logs for error messages and troubleshooting information.
