# MCP Server Setup and Configuration

This guide provides instructions on how to set up and configure all the MCP servers for use with Augment.

## Installation Scripts

### 1. Install MCPs from GitHub

```
install-mcps-from-github.bat
```

This script will clone the MCP repositories from GitHub, build them, and install them globally. It will install the following MCP servers:

- VSCode MCP
- Langchain MCP
- Qdrant MCP
- Semgrep MCP
- ESLint MCP
- TypeScript MCP
- Prettier MCP
- Jest MCP
- Docker MCP
- Kubernetes MCP

### 2. Create MCP Wrapper Scripts

```
create-mcp-wrappers.bat
```

This script will create wrapper scripts for all MCP servers in the `wrappers` directory. These wrapper scripts make it easier to start individual MCP servers.

## Starting MCP Servers

### 1. Start All MCP Servers

```
start-all-mcps.bat
```

This script will start all MCP servers in separate windows. Logs will be written to the `logs` directory.

### 2. Start Individual MCP Servers

```
start-mcp.bat [mcp-name]
```

This script will start an individual MCP server. Available MCP names:

- `memory` - Memory MCP
- `github` - GitHub MCP
- `sqlite` - SQLite MCP
- `brave-search` - Brave Search MCP
- `git` - Git MCP
- `filesystem` - Filesystem MCP
- `postgres` - PostgreSQL MCP
- `redis` - Redis MCP
- `sequential` - Sequential Thinking MCP
- `puppeteer` - Puppeteer MCP
- `fetch` - Fetch MCP
- `time` - Time MCP
- `magic` - Magic MCP
- `supabase` - Supabase MCP
- `browser-tools` - Browser Tools MCP
- `firecrawl` - Firecrawl MCP
- `vscode` - VSCode MCP
- `langchain` - Langchain MCP
- `qdrant` - Qdrant MCP
- `semgrep` - Semgrep MCP
- `eslint` - ESLint MCP
- `typescript` - TypeScript MCP
- `prettier` - Prettier MCP
- `jest` - Jest MCP
- `docker` - Docker MCP
- `kubernetes` - Kubernetes MCP

## Augment Configuration

After installing the MCP servers, you need to update your Augment configuration to use them. Here's the recommended configuration for each MCP server:

### Memory MCP
```
Name: Memory MCP
Command: npx -y @modelcontextprotocol/server-memory
Environment Variables: No environment variables set
```

### GitHub MCP
```
Name: GitHub MCP
Command: npx -y @modelcontextprotocol/server-github
Environment Variables: No environment variables set
```

### SQLite MCP
```
Name: SQLite MCP
Command: C:\Users\aviad\AppData\Roaming\Python\Python313\Scripts\mcp-server-sqlite.exe --db-path C:\Users\aviad\test.db
Environment Variables: No environment variables set
```

### Brave Search MCP
```
Name: Brave Search MCP
Command: cd C:\Users\aviad\OneDrive\Desktop\MCP\brave-search-server && node build/index.js
Environment Variables: BRAVE_API_KEY=YOUR_BRAVE_API_KEY
```

### Git MCP
```
Name: Git MCP
Command: python -m mcp_server_git
Environment Variables: No environment variables set
```

### Filesystem MCP
```
Name: Filesystem MCP
Command: npx -y @modelcontextprotocol/server-filesystem
Environment Variables: No environment variables set
```

### PostgreSQL MCP
```
Name: PostgreSQL MCP
Command: npx -y @modelcontextprotocol/server-postgres
Environment Variables: No environment variables set
```

### Redis MCP
```
Name: Redis MCP
Command: npx -y @modelcontextprotocol/server-redis
Environment Variables: No environment variables set
```

### Sequential Thinking MCP
```
Name: Sequential Thinking MCP
Command: npx -y @modelcontextprotocol/server-sequentialthinking
Environment Variables: No environment variables set
```

### Puppeteer MCP
```
Name: Puppeteer MCP
Command: npx -y @modelcontextprotocol/server-puppeteer
Environment Variables: No environment variables set
```

### Fetch MCP
```
Name: Fetch MCP
Command: npx -y @modelcontextprotocol/server-fetch
Environment Variables: No environment variables set
```

### Time MCP
```
Name: Time MCP
Command: npx -y @modelcontextprotocol/server-time
Environment Variables: No environment variables set
```

### Magic MCP
```
Name: Magic MCP
Command: npx -y @21st-dev/magic@latest
Environment Variables: No environment variables set
```

### Supabase MCP
```
Name: Supabase MCP
Command: npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_SUPABASE_TOKEN
Environment Variables: No environment variables set
```

### Browser Tools MCP
```
Name: Browser Tools MCP
Command: npx -y @agentdeskai/browser-tools-mcp@latest
Environment Variables: No environment variables set
```

### Firecrawl MCP
```
Name: Firecrawl MCP
Command: npx -y firecrawl-mcp
Environment Variables: FIRECRAWL_API_KEY=YOUR_FIRECRAWL_API_KEY
```

### VSCode MCP
```
Name: VSCode MCP
Command: npx -y vscode-mcp
Environment Variables: No environment variables set
```

### Langchain MCP
```
Name: Langchain MCP
Command: npx -y langchain-mcp
Environment Variables: No environment variables set
```

### Qdrant MCP
```
Name: Qdrant MCP
Command: python -m qdrant_mcp
Environment Variables: No environment variables set
```

### Semgrep MCP
```
Name: Semgrep MCP
Command: python -m semgrep_mcp
Environment Variables: No environment variables set
```

### ESLint MCP
```
Name: ESLint MCP
Command: npx -y eslint-mcp
Environment Variables: No environment variables set
```

### TypeScript MCP
```
Name: TypeScript MCP
Command: npx -y typescript-mcp
Environment Variables: No environment variables set
```

### Prettier MCP
```
Name: Prettier MCP
Command: npx -y prettier-mcp
Environment Variables: No environment variables set
```

### Jest MCP
```
Name: Jest MCP
Command: npx -y jest-mcp
Environment Variables: No environment variables set
```

### Docker MCP
```
Name: Docker MCP
Command: npx -y docker-mcp
Environment Variables: No environment variables set
```

### Kubernetes MCP
```
Name: Kubernetes MCP
Command: npx -y kubernetes-mcp
Environment Variables: No environment variables set
```

## Troubleshooting

If you encounter issues with any of the MCP servers:

1. Check the logs in the `logs` directory for error messages.
2. Make sure you have the necessary dependencies installed (Node.js, Python, etc.).
3. Try reinstalling the MCP server using the installation scripts.
4. Check if the MCP server requires any specific environment variables or configuration.

## Benefits of Each MCP Server for Coding

### Memory MCP
- Maintains persistent knowledge about your codebase
- Remembers important context across coding sessions
- Stores information about project structure, architecture, and design decisions

### GitHub MCP
- Integrates with GitHub repositories for code management
- Helps with creating, reviewing, and merging pull requests
- Manages issues and project boards

### SQLite MCP
- Enables database operations directly from Augment
- Helps with designing and optimizing database schemas
- Facilitates data querying and manipulation

### Brave Search MCP
- Provides access to web search results directly in Augment
- Helps with researching coding problems and solutions
- Finds documentation, tutorials, and examples

### Git MCP
- Integrates with local Git repositories
- Helps with version control operations
- Facilitates branch management and merging

### Filesystem MCP
- Enables file and directory operations directly from Augment
- Helps with project organization and structure
- Facilitates file creation, modification, and deletion

### PostgreSQL MCP
- Enables PostgreSQL database operations directly from Augment
- Helps with designing and optimizing complex database schemas
- Facilitates advanced data querying and manipulation

### Redis MCP
- Enables Redis operations directly from Augment
- Helps with designing caching strategies
- Facilitates working with in-memory data structures

### Sequential Thinking MCP
- Enhances problem-solving capabilities through structured thinking
- Helps with breaking down complex coding tasks into manageable steps
- Facilitates algorithm design and optimization

### Puppeteer MCP
- Enables browser automation directly from Augment
- Helps with web scraping and data extraction
- Facilitates testing web applications

### Fetch MCP
- Enables HTTP requests directly from Augment
- Helps with API integration and testing
- Facilitates working with web services

### Time MCP
- Provides time-related operations directly from Augment
- Helps with date and time manipulation
- Facilitates working with timezones

### Magic MCP
- Enhances UI component generation capabilities
- Helps with creating visually appealing and functional UI components
- Facilitates rapid prototyping of user interfaces

### Supabase MCP
- Enables Supabase operations directly from Augment
- Helps with designing and managing backend services
- Facilitates database operations with PostgreSQL

### Browser Tools MCP
- Enables browser interaction directly from Augment
- Helps with web development and debugging
- Facilitates testing web applications

### Firecrawl MCP
- Enables web crawling and data extraction directly from Augment
- Helps with gathering information from websites
- Facilitates competitive analysis and research

### VSCode MCP
- Integrates with VSCode for code editing and navigation
- Helps with code completion and suggestions
- Facilitates code refactoring and formatting

### Langchain MCP
- Enables language model chaining and orchestration
- Helps with building complex AI workflows
- Facilitates working with multiple language models

### Qdrant MCP
- Enables vector database operations directly from Augment
- Helps with semantic search and similarity matching
- Facilitates working with embeddings and vector representations

### Semgrep MCP
- Enables code security analysis directly from Augment
- Helps with identifying security vulnerabilities
- Facilitates code quality and security improvements

### ESLint MCP
- Enables code linting directly from Augment
- Helps with identifying code quality issues
- Facilitates code style and best practice enforcement

### TypeScript MCP
- Enables TypeScript type checking directly from Augment
- Helps with type safety and code correctness
- Facilitates working with TypeScript projects

### Prettier MCP
- Enables code formatting directly from Augment
- Helps with maintaining consistent code style
- Facilitates code readability and maintainability

### Jest MCP
- Enables test automation directly from Augment
- Helps with writing and running tests
- Facilitates test-driven development

### Docker MCP
- Enables Docker container management directly from Augment
- Helps with building, running, and managing containers
- Facilitates containerized application development

### Kubernetes MCP
- Enables Kubernetes cluster management directly from Augment
- Helps with deploying and managing containerized applications
- Facilitates cloud-native application development
