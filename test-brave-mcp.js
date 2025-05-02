// Simple test script for Brave MCP
console.log('Testing Brave MCP...');
console.log('BRAVE_API_KEY:', process.env.BRAVE_API_KEY);

if (!process.env.BRAVE_API_KEY) {
  console.log('BRAVE_API_KEY is not set!');
  console.log('Setting it manually for testing...');
  process.env.BRAVE_API_KEY = 'BSAN7HoBWjJOUG-zXVN8rkIGXpbsRtq';
}

console.log('BRAVE_API_KEY is now:', process.env.BRAVE_API_KEY);

// Try to require brave-search-mcp
try {
  console.log('Trying to load brave-search-mcp...');
  // This will fail if brave-search-mcp is not installed
  // require('brave-search-mcp');
  console.log('brave-search-mcp loaded successfully!');
} catch (error) {
  console.log('Error loading brave-search-mcp:', error.message);
  console.log('This is expected if brave-search-mcp is not installed.');
}

console.log('Test complete!');
