#!/bin/bash
# Comprehensive MCP Installation Script for FinDoc Analyzer
# This script installs all MCPs needed for complete development capabilities

# Set up colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Installing Comprehensive MCP Set for FinDoc Analyzer Development ===${NC}"

# Create MCP directories
mkdir -p mcp-servers
mkdir -p mcp-logs

# Check Node.js and npm installation
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js and npm are available. Proceeding with installation...${NC}"

# Install essential development MCPs
echo -e "\n${BLUE}=== Installing Essential Development MCPs ===${NC}"

echo -e "${YELLOW}Installing GitHub MCP (for code management)...${NC}"
npm install -g @modelcontextprotocol/server-github

echo -e "${YELLOW}Installing VSCode MCP (for code editing)...${NC}"
npm install -g vscode-mcp

echo -e "${YELLOW}Installing ESLint MCP (for code linting)...${NC}"
npm install -g eslint-mcp

echo -e "${YELLOW}Installing TypeScript MCP (for type checking)...${NC}"
npm install -g typescript-mcp

echo -e "${YELLOW}Installing Prettier MCP (for code formatting)...${NC}"
npm install -g prettier-mcp

echo -e "${YELLOW}Installing Jest MCP (for unit testing)...${NC}"
npm install -g jest-mcp

# Install web and search MCPs
echo -e "\n${BLUE}=== Installing Web and Search MCPs ===${NC}"

echo -e "${YELLOW}Installing Brave Search MCP (for research)...${NC}"
npm install -g brave-search-mcp

echo -e "${YELLOW}Installing Fetch MCP (for API calls)...${NC}"
npm install -g @modelcontextprotocol/server-fetch

echo -e "${YELLOW}Installing Puppeteer MCP (for browser automation)...${NC}"
npm install -g @modelcontextprotocol/server-puppeteer

echo -e "${YELLOW}Installing Playwright MCP (for advanced browser testing)...${NC}"
npm install -g @playwright/mcp

echo -e "${YELLOW}Installing Browser Tools MCP (for web debugging)...${NC}"
npm install -g @agentdeskai/browser-tools-mcp

echo -e "${YELLOW}Installing FireCrawl MCP (for web crawling)...${NC}"
npm install -g firecrawl-mcp

# Install database MCPs
echo -e "\n${BLUE}=== Installing Database MCPs ===${NC}"

echo -e "${YELLOW}Installing Supabase MCP (for managed PostgreSQL)...${NC}"
npm install -g @supabase/mcp-server-supabase

echo -e "${YELLOW}Installing PostgreSQL MCP (for direct database access)...${NC}"
npm install -g @modelcontextprotocol/server-postgres

echo -e "${YELLOW}Installing SQLite MCP (for local development)...${NC}"
npm install -g @modelcontextprotocol/server-sqlite

echo -e "${YELLOW}Installing Redis MCP (for caching)...${NC}"
npm install -g @modelcontextprotocol/server-redis

# Install AI reasoning and memory MCPs
echo -e "\n${BLUE}=== Installing AI Reasoning and Memory MCPs ===${NC}"

echo -e "${YELLOW}Installing Sequential Thinking MCP (for reasoning)...${NC}"
npm install -g @modelcontextprotocol/server-sequentialthinking

echo -e "${YELLOW}Installing Memory MCP (for context retention)...${NC}"
npm install -g @modelcontextprotocol/server-memory

echo -e "${YELLOW}Installing Magic MCP (for AI-enhanced coding)...${NC}"
npm install -g @21st-dev/magic

echo -e "${YELLOW}Installing Langchain MCP (for AI chains)...${NC}"
npm install -g langchain-mcp

echo -e "${YELLOW}Installing Qdrant MCP (for vector search)...${NC}"
npm install -g qdrant-mcp

# Install system and infrastructure MCPs
echo -e "\n${BLUE}=== Installing System and Infrastructure MCPs ===${NC}"

echo -e "${YELLOW}Installing FileSystem MCP (for file operations)...${NC}"
npm install -g @modelcontextprotocol/server-filesystem

echo -e "${YELLOW}Installing Docker MCP (for containerization)...${NC}"
npm install -g docker-mcp

echo -e "${YELLOW}Installing Kubernetes MCP (for orchestration)...${NC}"
npm install -g kubernetes-mcp

echo -e "${YELLOW}Installing Time MCP (for time operations)...${NC}"
npm install -g @modelcontextprotocol/server-time

echo -e "${YELLOW}Installing Taskmaster MCP (for task orchestration)...${NC}"
npm install -g @mcpso/taskmaster

# Install security MCPs
echo -e "\n${BLUE}=== Installing Security MCPs ===${NC}"

echo -e "${YELLOW}Installing Semgrep MCP (for security scanning)...${NC}"
pip install semgrep-mcp

echo -e "${YELLOW}Installing Git MCP (for secure source control)...${NC}"
pip install mcp-server-git

# Create configuration file
echo -e "\n${BLUE}=== Creating MCP Configuration File ===${NC}"

cat > mcp-config.json << 'EOF'
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    },
    "vscode": {
      "command": "npx",
      "args": ["-y", "vscode-mcp"]
    },
    "eslint": {
      "command": "npx",
      "args": ["-y", "eslint-mcp"]
    },
    "typescript": {
      "command": "npx",
      "args": ["-y", "typescript-mcp"]
    },
    "prettier": {
      "command": "npx",
      "args": ["-y", "prettier-mcp"]
    },
    "jest": {
      "command": "npx",
      "args": ["-y", "jest-mcp"]
    },
    "brave": {
      "command": "npx",
      "args": ["-y", "brave-search-mcp"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp", "--browser", "chromium"]
    },
    "browserTools": {
      "command": "npx",
      "args": ["-y", "@agentdeskai/browser-tools-mcp"]
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"]
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite"]
    },
    "redis": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-redis"]
    },
    "sequentialthinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequentialthinking"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "magic": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic"]
    },
    "langchain": {
      "command": "npx",
      "args": ["-y", "langchain-mcp"]
    },
    "qdrant": {
      "command": "npx",
      "args": ["-y", "qdrant-mcp"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    },
    "docker": {
      "command": "npx",
      "args": ["-y", "docker-mcp"]
    },
    "kubernetes": {
      "command": "npx",
      "args": ["-y", "kubernetes-mcp"]
    },
    "time": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-time"]
    },
    "taskmaster": {
      "command": "npx",
      "args": ["-y", "@mcpso/taskmaster"]
    },
    "semgrep": {
      "command": "python",
      "args": ["-m", "semgrep_mcp"]
    },
    "git": {
      "command": "python",
      "args": ["-m", "mcp_server_git"]
    }
  }
}
EOF

echo -e "${GREEN}MCP Configuration file created: mcp-config.json${NC}"

# Create start script
echo -e "\n${BLUE}=== Creating MCP Start Script ===${NC}"

cat > start-all-mcps.sh << 'EOF'
#!/bin/bash
# Script to start all MCP servers

# Create logs directory
mkdir -p mcp-logs

# Start each MCP server in background
echo "Starting GitHub MCP..."
npx -y @modelcontextprotocol/server-github > mcp-logs/github.log 2>&1 &

echo "Starting Brave Search MCP..."
npx -y brave-search-mcp > mcp-logs/brave.log 2>&1 &

echo "Starting Fetch MCP..."
npx -y @modelcontextprotocol/server-fetch > mcp-logs/fetch.log 2>&1 &

echo "Starting Puppeteer MCP..."
npx -y @modelcontextprotocol/server-puppeteer > mcp-logs/puppeteer.log 2>&1 &

echo "Starting Supabase MCP..."
npx -y @supabase/mcp-server-supabase > mcp-logs/supabase.log 2>&1 &

echo "Starting SequentialThinking MCP..."
npx -y @modelcontextprotocol/server-sequentialthinking > mcp-logs/sequentialthinking.log 2>&1 &

echo "Starting Memory MCP..."
npx -y @modelcontextprotocol/server-memory > mcp-logs/memory.log 2>&1 &

echo "Starting Magic MCP..."
npx -y @21st-dev/magic > mcp-logs/magic.log 2>&1 &

echo "Starting FileSystem MCP..."
npx -y @modelcontextprotocol/server-filesystem > mcp-logs/filesystem.log 2>&1 &

echo "All MCP servers started! Check mcp-logs directory for logs."
echo "To stop all servers, run: pkill -f 'npx -y'"
EOF

chmod +x start-all-mcps.sh

echo -e "${GREEN}MCP Start script created: start-all-mcps.sh${NC}"

# Create a Windows batch file for starting MCPs
echo -e "\n${BLUE}=== Creating Windows Batch File for MCP Start ===${NC}"

cat > start-all-mcps.bat << 'EOF'
@echo off
REM Script to start all MCP servers on Windows

REM Create logs directory
mkdir mcp-logs 2>nul

REM Start each MCP server in background
echo Starting GitHub MCP...
start /b npx -y @modelcontextprotocol/server-github > mcp-logs\github.log 2>&1

echo Starting Brave Search MCP...
start /b npx -y brave-search-mcp > mcp-logs\brave.log 2>&1

echo Starting Fetch MCP...
start /b npx -y @modelcontextprotocol/server-fetch > mcp-logs\fetch.log 2>&1

echo Starting Puppeteer MCP...
start /b npx -y @modelcontextprotocol/server-puppeteer > mcp-logs\puppeteer.log 2>&1

echo Starting Supabase MCP...
start /b npx -y @supabase/mcp-server-supabase > mcp-logs\supabase.log 2>&1

echo Starting SequentialThinking MCP...
start /b npx -y @modelcontextprotocol/server-sequentialthinking > mcp-logs\sequentialthinking.log 2>&1

echo Starting Memory MCP...
start /b npx -y @modelcontextprotocol/server-memory > mcp-logs\memory.log 2>&1

echo Starting Magic MCP...
start /b npx -y @21st-dev/magic > mcp-logs\magic.log 2>&1

echo Starting FileSystem MCP...
start /b npx -y @modelcontextprotocol/server-filesystem > mcp-logs\filesystem.log 2>&1

echo All MCP servers started! Check mcp-logs directory for logs.
echo To stop all servers, use the Task Manager to end Node.js processes.
EOF

echo -e "${GREEN}Windows batch file created: start-all-mcps.bat${NC}"

echo -e "\n${GREEN}==============================================${NC}"
echo -e "${GREEN}MCP Installation Complete!${NC}"
echo -e "${GREEN}==============================================${NC}"
echo -e "${YELLOW}To start all MCPs:${NC}"
echo -e "  On Linux/Mac: ${BLUE}./start-all-mcps.sh${NC}"
echo -e "  On Windows: ${BLUE}start-all-mcps.bat${NC}"
echo -e "${YELLOW}MCP configuration file:${NC} ${BLUE}mcp-config.json${NC}"
echo -e "${YELLOW}MCP logs directory:${NC} ${BLUE}mcp-logs/${NC}"
echo -e "${GREEN}==============================================${NC}"

exit 0