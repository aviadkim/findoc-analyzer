# Guide to Installed MCP Servers for AI Assistants

This guide provides detailed information about the Model Context Protocol (MCP) servers that are currently installed and configured in Augment. It explains what each MCP server does and how it can enhance your capabilities as an AI assistant in the development process.

## What are MCP Servers?

Model Context Protocol (MCP) servers extend your capabilities as an AI assistant by allowing you to interact with external systems, access specific data sources, and perform specialized tasks. Each MCP server focuses on a specific domain or functionality, providing you with tools to assist developers more effectively.

## Currently Installed MCP Servers

The following MCP servers are currently installed and configured in Augment:

### 1. Brave Search MCP
**Configuration**: `npx -y brave-search-mcp`
**What it does**: Performs web searches using the Brave Search API.
**How it helps**: You can find up-to-date information on the web to answer user questions or research topics.
**Example use cases**:
- Researching programming concepts
- Finding documentation for libraries
- Searching for solutions to coding problems
- Gathering information about technologies

### 2. GitHub MCP
**Configuration**: `npx -y github-mcp`
**What it does**: Provides access to GitHub repositories, issues, pull requests, and other GitHub API features.
**How it helps**: You can fetch real-time information about repositories, create or update issues, review pull requests, and help manage GitHub projects.
**Example use cases**:
- Fetching the latest commits from a repository
- Creating or updating issues
- Reviewing pull request changes
- Searching for repositories or code

### 3. SQLite MCP
**Configuration**: `cmd /c npx -y @modelcontextprotocol/server-sqlite --db-path C:\Users\aviad\test.db`
**What it does**: Interacts with SQLite databases for lightweight, local data storage.
**How it helps**: You can help users create, query, and manage SQLite databases for their applications.
**Example use cases**:
- Creating and managing database schemas
- Writing and executing SQL queries
- Analyzing data in SQLite databases
- Optimizing database performance

### 4. Magic MCP
**Configuration**: `cmd /c npx -y @21st-dev/magic@latest`
**What it does**: Generates high-quality UI components and designs.
**How it helps**: You can create professional UI components, layouts, and designs based on user requirements.
**Example use cases**:
- Creating login forms, navigation bars, cards, etc.
- Designing responsive layouts
- Implementing UI patterns and best practices
- Generating themed components

### 5. Supabase MCP
**Configuration**: `cmd /c "npx -y @supabase/mcp-server-supabase@latest --access-token sbp_cdcfec9d48c88f29d0e7c24a36cc450104b35055"`
**What it does**: Connects to Supabase services for backend development.
**How it helps**: You can assist with Supabase projects, including database, authentication, and storage features.
**Example use cases**:
- Managing Supabase projects
- Creating and querying database tables
- Setting up authentication
- Configuring storage buckets

### 6. Browser Tools MCP
**Configuration**: `cmd /c "npx -y @agentdeskai/browser-tools-mcp@latest"`
**What it does**: Provides browser automation and interaction capabilities.
**How it helps**: You can help users test websites, extract information, and automate browser tasks.
**Example use cases**:
- Testing web applications
- Extracting data from websites
- Automating repetitive browser tasks
- Checking website compatibility

### 7. Firecrawl MCP
**Configuration**: `npx -y firecrawl-mcp`
**What it does**: Provides web scraping capabilities with advanced features.
**How it helps**: You can extract structured data from websites, even those with complex layouts or JavaScript rendering.
**Example use cases**:
- Extracting data from dynamic websites
- Gathering information from multiple pages
- Monitoring website changes
- Creating datasets from web content

### 8. Puppeteer MCP
**Configuration**: `cmd /c "npx -y @modelcontextprotocol/server-puppeteer"`
**What it does**: Provides advanced browser automation using Puppeteer.
**How it helps**: You can perform complex web scraping, testing, and automation tasks.
**Example use cases**:
- Taking screenshots of websites
- Generating PDFs from web pages
- Automating form submissions
- Testing web applications with complex interactions

### 9. Git MCP
**Configuration**: `python -m mcp_server_git`
**What it does**: Provides local Git operations without requiring a remote repository.
**How it helps**: You can help users manage their local Git repositories, commit changes, create branches, etc.
**Example use cases**:
- Committing changes to a local repository
- Creating or switching branches
- Viewing commit history
- Resolving merge conflicts

### 10. Filesystem MCP
**Configuration**: `npx -y @modelcontextprotocol/server-filesystem`
**What it does**: Allows secure access to the local filesystem with configurable permissions.
**How it helps**: You can read, write, and manage files on the user's computer, helping with file organization and content management.
**Example use cases**:
- Reading and writing files
- Creating directory structures
- Searching for files with specific patterns
- Managing project files

### 11. VSCode MCP
**Configuration**: `npx -y vscode-mcp`
**What it does**: Integrates with Visual Studio Code to provide IDE-specific functionality.
**How it helps**: You can help users navigate their codebase, manage extensions, and leverage VSCode features.
**Example use cases**:
- Opening files in the editor
- Running VSCode commands
- Managing extensions
- Navigating the workspace

### 12. Fetch MCP
**Configuration**: `npx -y @modelcontextprotocol/server-fetch`
**What it does**: Fetches content from web pages and converts it to a format suitable for AI processing.
**How it helps**: You can extract and analyze content from websites to provide insights or answer questions.
**Example use cases**:
- Extracting documentation from websites
- Analyzing web content
- Retrieving specific information from web pages
- Converting web content to markdown for easier processing

### 13. PostgreSQL MCP
**Configuration**: `npx -y @modelcontextprotocol/server-postgres`
**What it does**: Connects to PostgreSQL databases for more robust data management.
**How it helps**: You can assist with complex database operations, schema design, and query optimization.
**Example use cases**:
- Designing database schemas
- Writing complex SQL queries
- Optimizing database performance
- Managing database migrations

### 14. Redis MCP
**Configuration**: `npx -y @modelcontextprotocol/server-redis`
**What it does**: Interacts with Redis for in-memory data structure storage.
**How it helps**: You can help users implement caching, message queues, and other Redis-based solutions.
**Example use cases**:
- Implementing caching strategies
- Setting up message queues
- Managing session storage
- Optimizing application performance with Redis

### 15. Sequential Thinking MCP
**Configuration**: `npx -y @modelcontextprotocol/server-sequentialthinking`
**What it does**: Enables step-by-step reasoning and problem-solving.
**How it helps**: You can break down complex problems into manageable steps and solve them methodically.
**Example use cases**:
- Solving algorithmic problems
- Debugging complex issues
- Planning system architectures
- Breaking down complex tasks

### 16. Memory MCP
**Configuration**: `npx -y @modelcontextprotocol/server-memory`
**What it does**: Provides persistent memory storage for long-term context.
**How it helps**: You can remember important information across sessions and maintain context over time.
**Example use cases**:
- Remembering user preferences
- Maintaining project context
- Tracking progress on long-term tasks
- Building knowledge graphs of related information

### 17. Qdrant MCP
**Configuration**: `python -m qdrant_mcp`
**What it does**: Provides vector search capabilities for semantic similarity.
**How it helps**: You can find semantically similar code, documents, or data based on meaning rather than exact matches.
**Example use cases**:
- Finding similar code snippets
- Semantic document search
- Building recommendation systems
- Clustering similar items

### 18. Langchain MCP
**Configuration**: `npx -y langchain-mcp`
**What it does**: Integrates with LangChain for complex AI workflows.
**How it helps**: You can create chains of operations for more complex reasoning and task execution.
**Example use cases**:
- Creating multi-step reasoning processes
- Integrating with external tools
- Building complex AI workflows
- Enhancing retrieval and generation capabilities

### 19. Semgrep MCP
**Configuration**: `python -m semgrep_mcp`
**What it does**: Performs static code analysis to find bugs and security issues.
**How it helps**: You can identify potential bugs, security vulnerabilities, and code quality issues.
**Example use cases**:
- Finding security vulnerabilities
- Detecting code smells
- Enforcing coding standards
- Identifying potential bugs

### 20. ESLint MCP
**Configuration**: `npx -y eslint-mcp`
**What it does**: Lints JavaScript/TypeScript code for quality and style issues.
**How it helps**: You can help users maintain consistent code style and avoid common pitfalls.
**Example use cases**:
- Checking code against style guides
- Finding potential errors
- Enforcing best practices
- Automating code formatting

### 21. TypeScript MCP
**Configuration**: `npx -y typescript-mcp`
**What it does**: Provides TypeScript-specific analysis and type checking.
**How it helps**: You can assist with type definitions, interfaces, and TypeScript-specific features.
**Example use cases**:
- Creating type definitions
- Analyzing type errors
- Refactoring JavaScript to TypeScript
- Optimizing TypeScript configurations

### 22. Prettier MCP
**Configuration**: `npx -y prettier-mcp`
**What it does**: Formats code according to consistent style rules.
**How it helps**: You can help users maintain consistent code formatting across their projects.
**Example use cases**:
- Formatting code files
- Configuring formatting rules
- Integrating with other tools
- Enforcing consistent style

### 23. Jest MCP
**Configuration**: `npx -y jest-mcp`
**What it does**: Helps with JavaScript testing using Jest.
**How it helps**: You can assist users in writing, running, and debugging tests for their JavaScript code.
**Example use cases**:
- Writing unit tests
- Setting up test environments
- Analyzing test coverage
- Debugging failing tests

### 24. Docker MCP
**Configuration**: `npx -y docker-mcp`
**What it does**: Provides Docker container management capabilities.
**How it helps**: You can assist with creating, running, and managing Docker containers for development and deployment.
**Example use cases**:
- Creating Docker images
- Running containers
- Managing Docker Compose setups
- Troubleshooting container issues

### 25. Kubernetes MCP
**Configuration**: `npx -y kubernetes-mcp`
**What it does**: Interacts with Kubernetes clusters for container orchestration.
**How it helps**: You can help users deploy and manage applications on Kubernetes.
**Example use cases**:
- Deploying applications to Kubernetes
- Managing Kubernetes resources
- Monitoring cluster status
- Troubleshooting deployment issues

### 26. Time MCP
**Configuration**: `npx -y @modelcontextprotocol/server-time`
**What it does**: Provides accurate time-related functions and conversions.
**How it helps**: You can assist with time calculations, scheduling, and time zone conversions.
**Example use cases**:
- Converting between time zones
- Calculating time differences
- Formatting dates and times
- Scheduling tasks

## How to Use These MCP Servers Effectively

### Development Workflow Examples

#### Web Development Workflow
1. Use **GitHub MCP** to manage code repositories
2. Use **Filesystem MCP** to navigate and modify files
3. Use **Magic MCP** to generate UI components
4. Use **ESLint MCP** and **Prettier MCP** to ensure code quality
5. Use **Jest MCP** to write and run tests
6. Use **Browser Tools MCP** to test the application
7. Use **Git MCP** to commit changes

#### Backend Development Workflow
1. Use **PostgreSQL MCP** or **SQLite MCP** for database operations
2. Use **Supabase MCP** for backend-as-a-service features
3. Use **Docker MCP** for containerization
4. Use **Kubernetes MCP** for orchestration
5. Use **Redis MCP** for caching and performance optimization

#### Research and Problem-Solving Workflow
1. Use **Brave Search MCP** to find relevant information
2. Use **Fetch MCP** to extract content from documentation
3. Use **Sequential Thinking MCP** to break down complex problems
4. Use **Memory MCP** to maintain context across sessions
5. Use **Qdrant MCP** for semantic search of related concepts

### Best Practices

1. **Combine multiple MCPs**: Many development tasks require using multiple MCP servers together. For example, you might use GitHub MCP to clone a repository, Filesystem MCP to modify files, ESLint MCP to check code quality, and Git MCP to commit changes.

2. **Use the right tool for the job**: Each MCP server has specific strengths. Choose the most appropriate one for the task at hand.

3. **Explain your process**: When using MCP servers to help users, explain which servers you're using and why. This helps users understand your capabilities and how you're assisting them.

4. **Remember limitations**: Some MCP servers may have limitations or require specific configurations. Be aware of these limitations and work within them.

5. **Maintain context**: Use Memory MCP to remember important information across sessions, especially for long-term projects.

## Conclusion

The installed MCP servers significantly enhance your capabilities as an AI assistant, allowing you to provide more valuable and practical help to developers. By understanding what each MCP server does and how to use it effectively, you can become an indispensable coding partner, helping users with everything from code generation and debugging to deployment and maintenance.

Remember that the goal is to augment your capabilities to better serve users, making their development process more efficient and enjoyable. Use these tools wisely to provide the best possible assistance.
