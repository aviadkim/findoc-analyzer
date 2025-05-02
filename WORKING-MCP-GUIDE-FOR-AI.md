# Guide to Working MCP Servers for AI Assistants

This guide provides detailed information about the Model Context Protocol (MCP) servers that are currently working in your environment. It explains what each MCP server does and how it can enhance your capabilities as an AI assistant in the development process.

## What are MCP Servers?

Model Context Protocol (MCP) servers extend your capabilities as an AI assistant by allowing you to interact with external systems, access specific data sources, and perform specialized tasks. Each MCP server focuses on a specific domain or functionality, providing you with tools to assist developers more effectively.

## Currently Working MCP Servers

Based on testing, the following MCP servers are currently working in your environment:

### 1. GitHub MCP
**Configuration**: `npx -y @modelcontextprotocol/server-github`
**What it does**: Provides access to GitHub repositories, issues, pull requests, and other GitHub API features.
**How it helps**: You can fetch real-time information about repositories, create or update issues, review pull requests, and help manage GitHub projects.
**Example use cases**:
- Fetching the latest commits from a repository
- Creating or updating issues
- Reviewing pull request changes
- Searching for repositories or code

### 2. Memory MCP
**Configuration**: `npx -y @modelcontextprotocol/server-memory`
**What it does**: Provides persistent memory storage for long-term context.
**How it helps**: You can remember important information across sessions and maintain context over time.
**Example use cases**:
- Remembering user preferences
- Maintaining project context
- Tracking progress on long-term tasks
- Building knowledge graphs of related information

## MCP Servers That Need Configuration

### 1. Brave Search MCP
**Configuration**: `npx -y brave-search-mcp`
**Issue**: Requires the BRAVE_API_KEY environment variable to be set.
**How to fix**: Set the BRAVE_API_KEY environment variable before starting the server.
**What it does**: Performs web searches using the Brave Search API.
**How it helps**: You can find up-to-date information on the web to answer user questions or research topics.

## How to Use These MCP Servers Effectively

### Development Workflow Examples

#### GitHub-Based Development Workflow
1. Use **GitHub MCP** to:
   - Clone repositories
   - Create and manage branches
   - Create and review pull requests
   - Track issues and projects
   - Search for code examples

2. Use **Memory MCP** to:
   - Remember repository structures
   - Track ongoing development tasks
   - Maintain context about project requirements
   - Remember user preferences and coding styles

### Best Practices

1. **Leverage GitHub MCP for code management**: Use GitHub MCP to help users manage their code repositories, track issues, and collaborate with others.

2. **Use Memory MCP for context retention**: Use Memory MCP to remember important information about projects, user preferences, and ongoing tasks.

3. **Explain your process**: When using MCP servers to help users, explain which servers you're using and why. This helps users understand your capabilities and how you're assisting them.

4. **Work within limitations**: Be aware of the limitations of the currently working MCP servers and adapt your assistance accordingly.

## Conclusion

Even with a limited set of working MCP servers, you can still provide valuable assistance to developers. GitHub MCP gives you access to code repositories and collaboration tools, while Memory MCP allows you to maintain context across sessions.

As more MCP servers are properly configured and become available, your capabilities will expand further. For now, focus on making the most of the working MCP servers to provide the best possible assistance.
