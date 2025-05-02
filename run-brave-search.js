#!/usr/bin/env node

/**
 * Brave Search MCP Server
 * 
 * This script starts an MCP server for Brave Search.
 * It requires a BRAVE_API_KEY environment variable to be set.
 */

const { Server } = require('@modelcontextprotocol/server');
const fetch = require('node-fetch');

// Check for API key
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
if (!BRAVE_API_KEY) {
  console.error('Error: BRAVE_API_KEY environment variable is required');
  process.exit(1);
}

// Create MCP server
const server = new Server('braveSearch');

// Register search method
server.registerMethod('search', async (params) => {
  const { query } = params;
  
  if (!query) {
    throw new Error('Query parameter is required');
  }
  
  try {
    const response = await fetch('https://api.search.brave.com/res/v1/web/search', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY
      },
      params: {
        q: query,
        count: 10
      }
    });
    
    if (!response.ok) {
      throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format results
    const results = data.web?.results?.map(result => ({
      title: result.title,
      url: result.url,
      description: result.description
    })) || [];
    
    return {
      results
    };
  } catch (error) {
    console.error('Error searching Brave:', error);
    throw new Error(`Failed to search Brave: ${error.message}`);
  }
});

// Start server
server.listen(3000, () => {
  console.log('Brave Search MCP server running on port 3000');
});
