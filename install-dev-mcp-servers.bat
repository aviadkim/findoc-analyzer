@echo off
echo ===================================================
echo Installing Development MCP Servers
echo ===================================================
echo.

echo Creating MCP directories...
mkdir "C:\Users\aviad\OneDrive\Desktop\MCP\config" 2>nul
echo Directories created.
echo.

REM Core Development Tools
echo Installing Core Development Tools...
echo.

echo Installing GitHub MCP...
call npm install -g @modelcontextprotocol/server-github

echo Installing GitLab MCP...
call npm install -g @modelcontextprotocol/server-gitlab

echo Installing SQLite MCP...
call npm install -g @modelcontextprotocol/server-sqlite

echo Installing PostgreSQL MCP...
call npm install -g @modelcontextprotocol/server-postgres

echo Installing Puppeteer MCP...
call npm install -g @modelcontextprotocol/server-puppeteer

REM Code Quality & Security
echo.
echo Installing Code Quality & Security Tools...
echo.

echo Installing Semgrep MCP...
call pip install semgrep-mcp

echo Installing Codacy MCP...
call npm install -g codacy-mcp

REM AI-Specific Enhancements
echo.
echo Installing AI-Specific Enhancements...
echo.

echo Installing Sequential Thinking MCP...
call npm install -g @modelcontextprotocol/server-sequentialthinking

echo Installing Memory MCP...
call npm install -g @modelcontextprotocol/server-memory

echo Installing Qdrant MCP...
call pip install qdrant-mcp

REM Workflow Automation
echo.
echo Installing Workflow Automation Tools...
echo.

echo Installing Zapier MCP...
call npm install -g zapier-mcp

REM Data & API Tools
echo.
echo Installing Data & API Tools...
echo.

echo Installing Firecrawl MCP...
call npm install -g firecrawl-mcp

echo Installing Stripe MCP...
call npm install -g mcp-stripe

echo Installing AWS MCP...
call pip install aws-mcp

REM Specialized Development
echo.
echo Installing Specialized Development Tools...
echo.

echo Installing Neo4j MCP...
call npm install -g mcp-neo4j-server

echo Installing Elasticsearch MCP...
call npm install -g elasticsearch-mcp

echo Installing Docker MCP...
call npm install -g code-sandbox-mcp

REM Web & UI Development
echo.
echo Installing Web & UI Development Tools...
echo.

echo Installing Magic MCP...
call npm install -g @21st-dev/magic@latest

echo Installing Browser Tools MCP...
call npm install -g @agentdeskai/browser-tools-mcp@latest

echo Installing Brave Search MCP...
call npm install -g brave-search-mcp

echo.
echo Creating Augment configuration file...
(
echo {
echo   "mcpServers": {
echo     "github": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-github"],
echo       "env": {
echo         "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN"
echo       }
echo     },
echo     "gitlab": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-gitlab"]
echo     },
echo     "sqlite": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "C:\\Users\\aviad\\test.db"]
echo     },
echo     "postgres": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-postgres"]
echo     },
echo     "puppeteer": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
echo     },
echo     "semgrep": {
echo       "command": "python",
echo       "args": ["-m", "semgrep_mcp"]
echo     },
echo     "codacy": {
echo       "command": "npx",
echo       "args": ["-y", "codacy-mcp"]
echo     },
echo     "sequentialThinking": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-sequentialthinking"]
echo     },
echo     "memory": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-memory"]
echo     },
echo     "qdrant": {
echo       "command": "python",
echo       "args": ["-m", "qdrant_mcp"]
echo     },
echo     "zapier": {
echo       "command": "npx",
echo       "args": ["-y", "zapier-mcp"]
echo     },
echo     "firecrawl": {
echo       "command": "npx",
echo       "args": ["-y", "firecrawl-mcp"],
echo       "env": {
echo         "FIRECRAWL_API_KEY": "fc-857417811665460e92716b92e08ec398"
echo       }
echo     },
echo     "stripe": {
echo       "command": "npx",
echo       "args": ["-y", "mcp-stripe"]
echo     },
echo     "aws": {
echo       "command": "python",
echo       "args": ["-m", "aws_mcp"]
echo     },
echo     "neo4j": {
echo       "command": "npx",
echo       "args": ["-y", "mcp-neo4j-server"]
echo     },
echo     "elasticsearch": {
echo       "command": "npx",
echo       "args": ["-y", "elasticsearch-mcp"]
echo     },
echo     "docker": {
echo       "command": "npx",
echo       "args": ["-y", "code-sandbox-mcp"]
echo     },
echo     "magic": {
echo       "command": "npx",
echo       "args": ["-y", "@21st-dev/magic@latest"]
echo     },
echo     "browserTools": {
echo       "command": "npx",
echo       "args": ["-y", "@agentdeskai/browser-tools-mcp@latest"]
echo     },
echo     "braveSearch": {
echo       "command": "npx",
echo       "args": ["-y", "brave-search-mcp"],
echo       "env": {
echo         "BRAVE_API_KEY": "BSAN7HoBWjJOUG-zXVN8rkIGXpbsRtq"
echo       }
echo     },
echo     "supabase": {
echo       "command": "npx",
echo       "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "YOUR_SUPABASE_TOKEN"]
echo     }
echo   }
echo }
) > "C:\Users\aviad\OneDrive\Desktop\MCP\config\dev-mcp-config.json"
echo Configuration file created.
echo.

echo ===================================================
echo Installation Complete!
echo ===================================================
echo.
echo To configure Augment:
echo 1. Open Augment
echo 2. Go to Settings
echo 3. Navigate to the MCP section
echo 4. Copy the contents of "C:\Users\aviad\OneDrive\Desktop\MCP\config\dev-mcp-config.json"
echo    into the Augment MCP configuration
echo.
echo Note: Some MCP servers may require additional API keys or configuration.
echo Please check the documentation for each server for more information.
echo.
echo Press any key to exit...
pause > nul
