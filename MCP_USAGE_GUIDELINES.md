# FinDoc Analyzer - MCP Usage Guidelines

## Overview

This document outlines the guidelines for using Model Context Protocol (MCP) in the FinDoc Analyzer project. MCP is a powerful tool for handling large inputs and complex processing tasks, and following these guidelines will ensure efficient and effective use of MCP in the project.

## What is MCP?

Model Context Protocol (MCP) is a protocol for interacting with large language models (LLMs) and other AI models. It provides a standardized way to send inputs to models, receive outputs, and manage context windows. MCP is particularly useful for handling large inputs that exceed the context window of a single model call.

## MCP Servers in FinDoc Analyzer

The FinDoc Analyzer project uses several MCP servers to handle different types of processing tasks:

1. **GitHub MCP** - For interacting with GitHub repositories
2. **Linear MCP** - For managing tasks and issues in Linear
3. **Jira MCP** - For managing tasks and issues in Jira
4. **Notion MCP** - For accessing documentation in Notion
5. **Confluence MCP** - For accessing and updating documentation in Confluence
6. **Supabase MCP** - For interacting with the Supabase database
7. **Memory MCP** - For storing and retrieving information across sessions
8. **Git MCP** - For interacting with Git repositories
9. **Magic MCP** - For generating UI components
10. **Semgrep MCP** - For code analysis and security scanning

## When to Use MCP

Use MCP in the following scenarios:

1. **Large Inputs** - When processing large inputs that exceed the context window of a single model call
2. **Complex Processing** - When performing complex processing tasks that require multiple steps
3. **External Integrations** - When integrating with external services like GitHub, Linear, Jira, etc.
4. **Memory Management** - When storing and retrieving information across sessions
5. **Code Analysis** - When analyzing code for security vulnerabilities or other issues
6. **UI Generation** - When generating UI components based on user requirements

## MCP Usage Guidelines

### 1. MCP Server Selection

Select the appropriate MCP server based on the task:

- **GitHub MCP** - For code-related tasks, version management, and collaboration on codebase changes
- **Linear MCP** - For managing tasks, bugs, and team workflows
- **Jira MCP** - For tracking detailed tasks, managing sprints, and updating project status
- **Notion MCP** - For retrieving documentation, notes, and specs
- **Confluence MCP** - For querying or updating documentation and knowledge base
- **Supabase MCP** - For database operations, authentication, and real-time data needs
- **Memory MCP** - For storing and retrieving information across sessions
- **Git MCP** - For local Git operations
- **Magic MCP** - For generating UI components
- **Semgrep MCP** - For code analysis and security scanning

### 2. Input Preparation

Prepare inputs for MCP calls:

- **Chunking** - Break down large inputs into smaller chunks
- **Formatting** - Format inputs according to the requirements of the MCP server
- **Validation** - Validate inputs before sending them to the MCP server
- **Compression** - Compress inputs when appropriate to reduce data transfer

Example:
```javascript
// Prepare input for GitHub MCP
const input = {
  owner: 'aviadkim',
  repo: 'backv2',
  path: 'DevDocs/findoc-app-engine-v2/public/processing.html',
  content: '...',
  message: 'Update processing.html with modern UI',
  branch: 'main'
};

// Call GitHub MCP
const result = await githubMCP.createOrUpdateFile(input);
```

### 3. Error Handling

Implement proper error handling for MCP calls:

- **Retry Logic** - Implement retry logic for transient errors
- **Fallback Mechanisms** - Implement fallback mechanisms for critical operations
- **Error Reporting** - Report errors to the user and log them for debugging
- **Graceful Degradation** - Degrade gracefully when MCP servers are unavailable

Example:
```javascript
// Error handling for MCP calls
async function callMCPWithRetry(mcpFunction, input, maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await mcpFunction(input);
    } catch (error) {
      retries++;
      
      if (retries >= maxRetries) {
        console.error('MCP call failed after multiple retries:', error);
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
}
```

### 4. Response Processing

Process MCP responses appropriately:

- **Validation** - Validate responses to ensure they meet expectations
- **Transformation** - Transform responses into the format required by the application
- **Caching** - Cache responses when appropriate to improve performance
- **Pagination** - Handle pagination for large responses

Example:
```javascript
// Process response from GitHub MCP
async function processGitHubMCPResponse(response) {
  // Validate response
  if (!response || !response.content) {
    throw new Error('Invalid response from GitHub MCP');
  }
  
  // Transform response
  const transformedResponse = {
    content: response.content,
    sha: response.sha,
    url: response.url,
    html_url: response.html_url
  };
  
  // Cache response
  await cacheResponse('github-mcp', response.path, transformedResponse);
  
  return transformedResponse;
}
```

### 5. Performance Optimization

Optimize MCP usage for performance:

- **Batching** - Batch multiple MCP calls when possible
- **Parallelization** - Parallelize independent MCP calls
- **Caching** - Cache MCP responses to reduce redundant calls
- **Lazy Loading** - Load MCP responses only when needed

Example:
```javascript
// Batch multiple GitHub MCP calls
async function batchGitHubMCPCalls(files) {
  // Group files by repository
  const filesByRepo = groupFilesByRepo(files);
  
  // Process each repository in parallel
  const results = await Promise.all(
    Object.entries(filesByRepo).map(async ([repo, repoFiles]) => {
      // Process files in batches
      const batches = chunkArray(repoFiles, 10);
      
      // Process each batch sequentially
      const batchResults = [];
      for (const batch of batches) {
        const batchResult = await Promise.all(
          batch.map(file => githubMCP.getFileContents({
            owner: file.owner,
            repo,
            path: file.path
          }))
        );
        batchResults.push(...batchResult);
      }
      
      return batchResults;
    })
  );
  
  // Flatten results
  return results.flat();
}
```

### 6. Security Considerations

Consider security when using MCP:

- **API Key Management** - Securely manage API keys for MCP servers
- **Data Sanitization** - Sanitize data before sending it to MCP servers
- **Access Control** - Implement proper access control for MCP operations
- **Audit Logging** - Log MCP operations for audit purposes

Example:
```javascript
// Secure API key management for MCP
function getMCPApiKey(mcpServer) {
  // Get API key from secure storage
  const apiKey = process.env[`${mcpServer.toUpperCase()}_API_KEY`];
  
  if (!apiKey) {
    throw new Error(`API key for ${mcpServer} MCP server not found`);
  }
  
  return apiKey;
}
```

### 7. Testing MCP Integration

Test MCP integration thoroughly:

- **Unit Tests** - Test individual MCP functions
- **Integration Tests** - Test interactions between MCP servers and the application
- **Mock MCP Servers** - Use mock MCP servers for testing
- **Error Scenarios** - Test error scenarios and recovery mechanisms

Example:
```javascript
// Mock GitHub MCP for testing
const mockGitHubMCP = {
  getFileContents: jest.fn().mockResolvedValue({
    content: 'file content',
    sha: 'file sha'
  }),
  createOrUpdateFile: jest.fn().mockResolvedValue({
    content: {
      sha: 'new file sha'
    }
  })
};

// Test GitHub MCP integration
describe('GitHub MCP Integration', () => {
  it('should get file contents', async () => {
    const result = await mockGitHubMCP.getFileContents({
      owner: 'aviadkim',
      repo: 'backv2',
      path: 'DevDocs/findoc-app-engine-v2/public/processing.html'
    });
    
    expect(result.content).toBe('file content');
    expect(result.sha).toBe('file sha');
  });
  
  it('should create or update file', async () => {
    const result = await mockGitHubMCP.createOrUpdateFile({
      owner: 'aviadkim',
      repo: 'backv2',
      path: 'DevDocs/findoc-app-engine-v2/public/processing.html',
      content: 'new file content',
      message: 'Update processing.html',
      branch: 'main'
    });
    
    expect(result.content.sha).toBe('new file sha');
  });
});
```

## MCP Server Setup

To set up MCP servers for the FinDoc Analyzer project:

1. **Install MCP Servers** - Install the required MCP servers using the provided scripts
2. **Configure MCP Servers** - Configure the MCP servers with the appropriate API keys and settings
3. **Start MCP Servers** - Start the MCP servers using the provided scripts
4. **Verify MCP Servers** - Verify that the MCP servers are running correctly

Example:
```bash
# Install MCP servers
./install-all-mcps.bat

# Configure MCP servers
./configure-augment-mcps.bat

# Start MCP servers
./start-augment-mcps.bat

# Verify MCP servers
./test-augment-mcps.bat
```

## Conclusion

By following these guidelines, you can effectively use MCP in the FinDoc Analyzer project to handle large inputs and complex processing tasks. This will improve the performance, reliability, and maintainability of the application, making it easier for developers to work with the code and for users to use the application.
