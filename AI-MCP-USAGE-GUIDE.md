# AI Guide to MCP Usage

This guide provides information about all available Model Context Protocol (MCP) servers, their capabilities, and how to use them effectively in development tasks.

## MCP Usage Strategy

### On-Demand Usage
- Start MCPs only when needed for specific tasks
- Shut down MCPs when they're no longer needed
- Avoid running all MCPs simultaneously to preserve system resources

### When to Use Each MCP
- Use specific MCPs based on the current development task
- Combine multiple MCPs when needed for complex tasks
- Consider resource usage when deciding which MCPs to use

## Available MCP Servers

### Core Development Tools

#### 1. GitHub MCP
- **Capabilities**: Repository management, issue tracking, PR reviews, code search
- **When to use**: When working with GitHub repositories, issues, or pull requests
- **Command**: `npx -y @modelcontextprotocol/server-github`
- **Example tasks**: Fetching repository contents, creating issues, reviewing PRs

#### 2. Git MCP
- **Capabilities**: Local Git operations, commit history, branch management
- **When to use**: When working with local Git repositories
- **Command**: `python -m mcp_server_git`
- **Example tasks**: Committing changes, creating branches, viewing commit history

#### 3. Filesystem MCP
- **Capabilities**: File operations, directory management
- **When to use**: When working with local files and directories
- **Command**: `npx -y @modelcontextprotocol/server-filesystem <directory>`
- **Example tasks**: Reading/writing files, creating directories, searching for files

#### 4. VSCode MCP
- **Capabilities**: VSCode integration, extension management
- **When to use**: When working within VSCode
- **Command**: `npx -y vscode-mcp`
- **Example tasks**: Opening files in editor, running VSCode commands, managing extensions

### Web Development & UI

#### 5. Magic MCP (21st.dev)
- **Capabilities**: UI component generation, responsive design
- **When to use**: When creating UI components or layouts
- **Command**: `npx -y @21st-dev/magic@latest`
- **Example tasks**: Creating forms, navigation bars, cards, responsive layouts

#### 6. Browser Tools MCP
- **Capabilities**: Browser automation, web testing
- **When to use**: When testing web applications or automating browser tasks
- **Command**: `npx -y @agentdeskai/browser-tools-mcp@latest`
- **Example tasks**: Testing websites, extracting data, automating browser tasks

#### 7. Brave Search MCP
- **Capabilities**: Web search, information retrieval
- **When to use**: When researching or finding information online
- **Command**: `npx -y brave-search-mcp`
- **Environment variables**: `BRAVE_API_KEY=YOUR_BRAVE_API_KEY_HERE`
- **Example tasks**: Researching programming concepts, finding documentation

#### 8. Fetch MCP
- **Capabilities**: Web content fetching, HTML parsing
- **When to use**: When extracting content from websites
- **Command**: `npx -y @modelcontextprotocol/server-fetch`
- **Example tasks**: Extracting documentation, analyzing web content

#### 9. Puppeteer MCP
- **Capabilities**: Advanced browser automation, screenshot capture
- **When to use**: When performing complex web automation tasks
- **Command**: `npx -y @modelcontextprotocol/server-puppeteer`
- **Example tasks**: Taking screenshots, generating PDFs, automating form submissions

### Databases & Data Storage

#### 10. SQLite MCP
- **Capabilities**: Local database operations, SQL queries
- **When to use**: When working with SQLite databases
- **Command**: `npx -y @modelcontextprotocol/server-sqlite --db-path <path>`
- **Example tasks**: Creating tables, querying data, database schema design

#### 11. PostgreSQL MCP
- **Capabilities**: PostgreSQL database operations, complex queries
- **When to use**: When working with PostgreSQL databases
- **Command**: `npx -y @modelcontextprotocol/server-postgres`
- **Example tasks**: Database schema design, query optimization, data analysis

#### 12. Redis MCP
- **Capabilities**: In-memory data structure operations, caching
- **When to use**: When working with Redis for caching or messaging
- **Command**: `npx -y @modelcontextprotocol/server-redis`
- **Example tasks**: Implementing caching, message queues, session storage

#### 13. Supabase MCP
- **Capabilities**: Supabase service integration, backend-as-a-service
- **When to use**: When working with Supabase projects
- **Command**: `npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN_HERE`
- **Example tasks**: Managing Supabase projects, database operations, authentication

### AI Enhancements & Reasoning

#### 14. Sequential Thinking MCP
- **Capabilities**: Step-by-step reasoning, problem decomposition
- **When to use**: When solving complex problems that require structured thinking
- **Command**: `npx -y @modelcontextprotocol/server-sequentialthinking`
- **Example tasks**: Algorithm design, debugging complex issues, system architecture

#### 15. Memory MCP
- **Capabilities**: Persistent knowledge storage, context maintenance
- **When to use**: When maintaining context across sessions or storing important information
- **Command**: `npx -y @modelcontextprotocol/server-memory`
- **Example tasks**: Remembering user preferences, maintaining project context

#### 16. Qdrant MCP
- **Capabilities**: Vector search, semantic similarity
- **When to use**: When searching for semantically similar content
- **Command**: `python -m qdrant_mcp`
- **Example tasks**: Finding similar code snippets, semantic document search

#### 17. Langchain MCP
- **Capabilities**: Complex AI workflows, chain-of-thought processing
- **When to use**: When creating multi-step AI workflows
- **Command**: `npx -y langchain-mcp`
- **Example tasks**: Creating reasoning chains, integrating multiple tools

### Code Quality & Security

#### 18. Semgrep MCP
- **Capabilities**: Static code analysis, security vulnerability detection
- **When to use**: When checking code for security issues or bugs
- **Command**: `python -m semgrep_mcp`
- **Example tasks**: Finding security vulnerabilities, detecting code smells

#### 19. ESLint MCP
- **Capabilities**: JavaScript/TypeScript linting, code style enforcement
- **When to use**: When checking JavaScript/TypeScript code quality
- **Command**: `npx -y eslint-mcp`
- **Example tasks**: Enforcing coding standards, finding potential errors

#### 20. TypeScript MCP
- **Capabilities**: TypeScript type checking, interface generation
- **When to use**: When working with TypeScript code
- **Command**: `npx -y typescript-mcp`
- **Example tasks**: Type checking, generating interfaces, refactoring JavaScript to TypeScript

#### 21. Prettier MCP
- **Capabilities**: Code formatting, style consistency
- **When to use**: When formatting code or enforcing style rules
- **Command**: `npx -y prettier-mcp`
- **Example tasks**: Formatting code files, configuring formatting rules

#### 22. Jest MCP
- **Capabilities**: JavaScript testing, test coverage analysis
- **When to use**: When writing or running tests for JavaScript code
- **Command**: `npx -y jest-mcp`
- **Example tasks**: Writing unit tests, analyzing test coverage, debugging tests

### DevOps & Deployment

#### 23. Docker MCP
- **Capabilities**: Container management, image building
- **When to use**: When working with Docker containers
- **Command**: `npx -y docker-mcp`
- **Example tasks**: Creating Docker images, running containers, managing Docker Compose

#### 24. Kubernetes MCP
- **Capabilities**: Kubernetes cluster management, deployment configuration
- **When to use**: When working with Kubernetes
- **Command**: `npx -y kubernetes-mcp`
- **Example tasks**: Deploying applications, managing Kubernetes resources

### Specialized Tools

#### 25. Firecrawl MCP
- **Capabilities**: Advanced web scraping, structured data extraction
- **When to use**: When extracting data from complex websites
- **Command**: `npx -y firecrawl-mcp`
- **Environment variables**: `FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY_HERE`
- **Example tasks**: Extracting data from dynamic websites, monitoring website changes

#### 26. Time MCP
- **Capabilities**: Time-related operations, scheduling
- **When to use**: When working with dates, times, or scheduling
- **Command**: `npx -y @modelcontextprotocol/server-time`
- **Example tasks**: Time zone conversions, date formatting, scheduling

## Development Workflow Examples

### Web Development Workflow
1. Use **Filesystem MCP** to navigate project files
2. Use **Git MCP** to check repository status
3. Use **Magic MCP** to generate UI components
4. Use **ESLint MCP** and **Prettier MCP** for code quality
5. Use **Browser Tools MCP** or **Puppeteer MCP** for testing
6. Use **GitHub MCP** to commit and push changes

### Backend Development Workflow
1. Use **PostgreSQL MCP** or **SQLite MCP** for database operations
2. Use **Supabase MCP** for backend-as-a-service features
3. Use **Docker MCP** for containerization
4. Use **Jest MCP** for testing
5. Use **GitHub MCP** for version control

### Research and Problem-Solving Workflow
1. Use **Brave Search MCP** to find relevant information
2. Use **Fetch MCP** to extract content from documentation
3. Use **Sequential Thinking MCP** to break down complex problems
4. Use **Memory MCP** to maintain context across sessions

## Best Practices for AI Using MCPs

1. **Start MCPs on demand**: Only start the MCPs needed for the current task
2. **Combine complementary MCPs**: Use multiple MCPs together for complex tasks
3. **Explain MCP usage**: Tell the user which MCPs you're using and why
4. **Handle errors gracefully**: If an MCP fails, suggest alternatives or troubleshooting steps
5. **Clean up after use**: Shut down MCPs when they're no longer needed
6. **Remember context**: Use Memory MCP to maintain important information across sessions

## Troubleshooting Common MCP Issues

1. **Missing API keys**: Ensure environment variables are set for MCPs that require API keys
2. **Package not found**: Verify the correct package name and install if necessary
3. **Port conflicts**: Ensure no other services are using the same ports
4. **Permission issues**: Check file and directory permissions
5. **Version conflicts**: Try specifying a specific version if the latest version has issues
