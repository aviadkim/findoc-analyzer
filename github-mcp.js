#!/usr/bin/env node

/**
 * GitHub MCP Server
 * 
 * This script starts an MCP server for GitHub.
 */

const { Server } = require('@modelcontextprotocol/server');
const { Octokit } = require('@octokit/rest');

// Check for API key
const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_PERSONAL_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize Octokit
const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

// Create MCP server
const server = new Server('github');

// Register getRepository method
server.registerMethod('getRepository', async (params) => {
  const { owner, repo } = params;
  
  if (!owner || !repo) {
    throw new Error('Owner and repo parameters are required');
  }
  
  try {
    const { data } = await octokit.repos.get({
      owner,
      repo
    });
    
    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      url: data.html_url,
      stars: data.stargazers_count,
      forks: data.forks_count,
      issues: data.open_issues_count,
      language: data.language,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error getting repository:', error);
    throw new Error(`Failed to get repository: ${error.message}`);
  }
});

// Register getIssues method
server.registerMethod('getIssues', async (params) => {
  const { owner, repo, state = 'open' } = params;
  
  if (!owner || !repo) {
    throw new Error('Owner and repo parameters are required');
  }
  
  try {
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      state
    });
    
    return {
      issues: data.map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        state: issue.state,
        url: issue.html_url,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        user: {
          login: issue.user.login,
          url: issue.user.html_url
        }
      }))
    };
  } catch (error) {
    console.error('Error getting issues:', error);
    throw new Error(`Failed to get issues: ${error.message}`);
  }
});

// Register getPullRequests method
server.registerMethod('getPullRequests', async (params) => {
  const { owner, repo, state = 'open' } = params;
  
  if (!owner || !repo) {
    throw new Error('Owner and repo parameters are required');
  }
  
  try {
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state
    });
    
    return {
      pull_requests: data.map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        url: pr.html_url,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        user: {
          login: pr.user.login,
          url: pr.user.html_url
        }
      }))
    };
  } catch (error) {
    console.error('Error getting pull requests:', error);
    throw new Error(`Failed to get pull requests: ${error.message}`);
  }
});

// Start server
console.log('GitHub MCP server running on stdio');
server.listen();
