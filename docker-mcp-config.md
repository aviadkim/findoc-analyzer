# Docker MCP Configuration for Augment

To use the Docker MCP with Augment, follow these steps:

## Step 1: Install Docker

1. Download and install Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop

## Step 2: Install the Docker MCP Server

Since the Docker MCP server is not available in the npm registry, we'll use a community-built Docker MCP server:

```bash
npm install -g @docker/cli-mcp
```

## Step 3: Configure Augment to Use the Docker MCP Server

Add the following configuration to Augment:

```
Name: Docker MCP
Command: npx -y @docker/cli-mcp
Environment Variables: No environment variables set
```

## Step 4: Test the Docker MCP

1. Make sure Docker Desktop is running
2. Open Augment
3. Ask Augment to perform Docker-related tasks, such as:
   - List Docker containers
   - List Docker images
   - Start/stop Docker containers
   - Build Docker images

## Benefits of Docker MCP

The Docker MCP provides the following capabilities to Augment:

- **Container Management**: Create, start, stop, and remove Docker containers
- **Image Management**: Build, pull, push, and remove Docker images
- **Volume Management**: Create, list, and remove Docker volumes
- **Network Management**: Create, list, and remove Docker networks
- **Docker Compose**: Run Docker Compose commands

## Troubleshooting

If you encounter issues:

1. Make sure Docker Desktop is running
2. Verify that the Docker CLI is accessible from the command line
3. Check if the Docker MCP server is installed correctly
4. Restart Docker Desktop and the Docker MCP server
