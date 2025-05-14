#!/bin/bash
# Setup environment for MCPs
# This script installs and configures MCPs for FinDoc Analyzer

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== FinDoc Analyzer MCP Environment Setup ===${NC}"

# Create directories
mkdir -p mcp-servers
mkdir -p mcp-logs
mkdir -p .api-keys

# Create .env file for API keys
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating .env file for API keys...${NC}"
  cat > .env << 'EOF'
# API keys for MCP servers
# Replace with your actual API keys

# Brave Search API key (get from https://brave.com/search/api/)
BRAVE_API_KEY=your_brave_api_key_here

# Tavily API key (get from https://tavily.com/)
TAVILY_API_KEY=your_tavily_api_key_here

# GitHub Personal Access Token (for GitHub MCP)
GITHUB_TOKEN=your_github_token_here

# Supabase configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here

# OpenAI API key (for AI processing)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API key (for Claude models)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google API key (for Gemini models)
GOOGLE_API_KEY=your_google_api_key_here
EOF

  echo -e "${GREEN}Created .env file. Please edit it to add your actual API keys.${NC}"
else
  echo -e "${YELLOW}.env file already exists. Skipping creation.${NC}"
fi

# Install essential MCP packages
echo -e "${BLUE}Installing essential MCP packages...${NC}"

# Core packages
echo -e "${YELLOW}Installing Brave Search MCP...${NC}"
npm install --save brave-search-mcp

echo -e "${YELLOW}Installing Sequential Thinking MCP...${NC}"
npm install --save @modelcontextprotocol/server-sequential-thinking

# Create MCP startup script
echo -e "${BLUE}Creating MCP startup script...${NC}"

cat > start-essential-mcps.sh << 'EOF'
#!/bin/bash
# Start essential MCP servers

# Load environment variables
source .env

# Create logs directory
mkdir -p mcp-logs

echo "Starting Brave Search MCP..."
BRAVE_API_KEY=$BRAVE_API_KEY npx brave-search-mcp > mcp-logs/brave-search.log 2>&1 &
echo $! > mcp-logs/brave-search.pid

echo "Starting Sequential Thinking MCP..."
npx @modelcontextprotocol/server-sequential-thinking > mcp-logs/sequential-thinking.log 2>&1 &
echo $! > mcp-logs/sequential-thinking.pid

echo "MCP servers started! Check mcp-logs directory for logs."
echo "To stop servers, run: ./stop-mcps.sh"
EOF

chmod +x start-essential-mcps.sh

# Create MCP stop script
echo -e "${BLUE}Creating MCP stop script...${NC}"

cat > stop-mcps.sh << 'EOF'
#!/bin/bash
# Stop MCP servers

# Check if pid files exist
if [ -d mcp-logs ]; then
  for pid_file in mcp-logs/*.pid; do
    if [ -f "$pid_file" ]; then
      PID=$(cat "$pid_file")
      SERVER_NAME=$(basename "$pid_file" | sed 's/\.pid$//')
      
      echo "Stopping $SERVER_NAME MCP (PID: $PID)..."
      kill $PID 2>/dev/null || echo "Process not running"
      rm "$pid_file"
    fi
  done
else
  echo "No MCP logs directory found"
fi

echo "All MCP servers stopped"
EOF

chmod +x stop-mcps.sh

# Create simple test script for MCPs
echo -e "${BLUE}Creating simple MCP test script...${NC}"

cat > test-mcps-simple.js << 'EOF'
/**
 * Simple MCP Test Script
 */

const { spawn } = require('child_process');
const fs = require('fs');
require('dotenv').config();

// Test Brave Search MCP
async function testBraveSearch() {
  return new Promise((resolve) => {
    console.log('Testing Brave Search MCP...');
    
    if (!process.env.BRAVE_API_KEY) {
      console.log('⚠️ BRAVE_API_KEY not set in .env file');
      return resolve(false);
    }
    
    const mcpProcess = spawn('npx', ['brave-search-mcp'], {
      env: { ...process.env }
    });
    
    const testPayload = {
      action: 'search',
      params: {
        q: 'ISIN code Apple Inc',
        type: 'web',
        count: 1
      }
    };
    
    let responseData = '';
    
    mcpProcess.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    mcpProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data.toString()}`);
    });
    
    mcpProcess.on('close', (code) => {
      try {
        const response = JSON.parse(responseData);
        if (response && response.results) {
          console.log('✅ Brave Search MCP is working!');
          resolve(true);
        } else {
          console.log('❌ Brave Search MCP test failed');
          resolve(false);
        }
      } catch (error) {
        console.error(`❌ Brave Search MCP test failed: ${error.message}`);
        resolve(false);
      }
    });
    
    // Send test payload
    mcpProcess.stdin.write(JSON.stringify(testPayload));
    mcpProcess.stdin.end();
  });
}

// Test Sequential Thinking MCP
async function testSequentialThinking() {
  return new Promise((resolve) => {
    console.log('Testing Sequential Thinking MCP...');
    
    const mcpProcess = spawn('npx', ['@modelcontextprotocol/server-sequential-thinking']);
    
    const testPayload = {
      action: 'think',
      params: {
        question: 'How to extract ISIN codes from financial documents?',
        maxSteps: 2
      }
    };
    
    let responseData = '';
    
    mcpProcess.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    mcpProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data.toString()}`);
    });
    
    mcpProcess.on('close', (code) => {
      try {
        const response = JSON.parse(responseData);
        if (response && response.steps) {
          console.log('✅ Sequential Thinking MCP is working!');
          resolve(true);
        } else {
          console.log('❌ Sequential Thinking MCP test failed');
          resolve(false);
        }
      } catch (error) {
        console.error(`❌ Sequential Thinking MCP test failed: ${error.message}`);
        resolve(false);
      }
    });
    
    // Send test payload
    mcpProcess.stdin.write(JSON.stringify(testPayload));
    mcpProcess.stdin.end();
  });
}

// Run all tests
async function runTests() {
  const braveResult = await testBraveSearch();
  const thinkingResult = await testSequentialThinking();
  
  console.log('\n=== Test Results ===');
  console.log(`Brave Search MCP: ${braveResult ? '✅ Working' : '❌ Failed'}`);
  console.log(`Sequential Thinking MCP: ${thinkingResult ? '✅ Working' : '❌ Failed'}`);
  
  if (braveResult && thinkingResult) {
    console.log('\n✅ All MCPs are working correctly!');
  } else {
    console.log('\n⚠️ Some MCPs are not working correctly.');
    console.log('Please check the .env file and make sure all API keys are set.');
    console.log('Then try running the MCPs with ./start-essential-mcps.sh');
  }
}

runTests();
EOF

# Create readme file
echo -e "${BLUE}Creating MCP SETUP README...${NC}"

cat > MCP-SETUP-README.md << 'EOF'
# FinDoc Analyzer MCP Setup Guide

This guide will help you set up and use Model Context Protocol (MCP) servers with the FinDoc Analyzer project.

## What are MCPs?

MCPs (Model Context Protocol servers) extend AI capabilities with specialized functions. For FinDoc Analyzer, we use MCPs for web search, document processing, testing, and more.

## Getting Started

1. **Set up environment variables**:
   
   Edit the `.env` file to add your API keys:
   
   ```
   # Get a Brave Search API key from https://brave.com/search/api/
   BRAVE_API_KEY=your_brave_api_key_here
   
   # Add other API keys as needed
   ```

2. **Start the MCPs**:
   
   ```bash
   ./start-essential-mcps.sh
   ```
   
   This will start the required MCP servers in the background.

3. **Verify MCP functionality**:
   
   ```bash
   node test-mcps-simple.js
   ```
   
   This will test if the MCPs are working correctly.

4. **Stop the MCPs**:
   
   ```bash
   ./stop-mcps.sh
   ```

## Available MCPs

The FinDoc Analyzer project uses the following MCPs:

1. **Brave Search MCP** - For web search and research capabilities
2. **Sequential Thinking MCP** - For advanced reasoning and problem-solving
3. **Playwright MCP** - For browser automation and testing

## Troubleshooting

If you encounter issues:

- Check the log files in the `mcp-logs` directory
- Verify your API keys in the `.env` file
- Make sure npm packages are installed with `npm install`
- Try restarting the MCPs with `./stop-mcps.sh` followed by `./start-essential-mcps.sh`

## Next Steps

See the `mcp-recommended-packages.md` file for additional MCPs that can enhance the FinDoc Analyzer project.
EOF

echo -e "${GREEN}MCP environment setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Edit ${BLUE}.env${NC} file to add your actual API keys"
echo -e "2. Start MCPs with ${BLUE}./start-essential-mcps.sh${NC}"
echo -e "3. Test MCPs with ${BLUE}node test-mcps-simple.js${NC}"
echo -e "4. See ${BLUE}MCP-SETUP-README.md${NC} for more details"
echo -e "5. Check ${BLUE}mcp-recommended-packages.md${NC} for additional recommended MCPs"