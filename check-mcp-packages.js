// Script to check if MCP packages can be installed
const { execSync } = require('child_process');

const mcpPackages = [
  { name: 'brave-search-mcp', env: 'BRAVE_API_KEY=BSAN7HoBWjJOUG-zXVN8rkIGXpbsRtq' },
  { name: 'github-mcp', env: 'GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN' },
  { name: '@21st-dev/magic@latest', env: '' },
  { name: '@supabase/mcp-server-supabase@latest', env: '' },
  { name: '@agentdeskai/browser-tools-mcp@latest', env: '' },
  { name: 'firecrawl-mcp', env: 'FIRECRAWL_API_KEY=fc-857417811665460e92716b92e08ec398' },
  { name: '@modelcontextprotocol/server-puppeteer', env: '' }
];

console.log('Checking MCP packages...');
console.log('=======================');

mcpPackages.forEach(pkg => {
  console.log(`\nChecking ${pkg.name}...`);
  try {
    // Check if the package exists in npm registry
    const cmd = `npm view ${pkg.name} version`;
    const version = execSync(cmd).toString().trim();
    console.log(`✅ ${pkg.name} exists in npm registry (version: ${version})`);
    
    // For packages with environment variables, check if they're set
    if (pkg.env) {
      console.log(`Environment variable required: ${pkg.env.split('=')[0]}`);
    }
    
    console.log(`Command to use in Augment: npx -y ${pkg.name}`);
    if (pkg.env) {
      console.log(`Environment variable to set in Augment: ${pkg.env}`);
    }
  } catch (error) {
    console.log(`❌ Error checking ${pkg.name}: ${error.message}`);
  }
});

console.log('\n=======================');
console.log('Check complete!');
