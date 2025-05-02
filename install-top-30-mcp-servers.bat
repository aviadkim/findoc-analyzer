@echo off
echo ===================================================
echo Installing Top 30 MCP Servers for Coding
echo ===================================================
echo.

REM Core Development Tools
echo Installing Core Development Tools...
echo.

echo Installing GitHub MCP...
call npm install -g @modelcontextprotocol/server-github

echo Installing GitLab MCP...
call npm install -g @modelcontextprotocol/server-gitlab

echo Installing Git MCP...
call pip install mcp-server-git

echo Installing Filesystem MCP...
call npm install -g @modelcontextprotocol/server-filesystem

echo Installing VSCode MCP...
call npm install -g vscode-mcp

REM Web Development & UI
echo.
echo Installing Web Development & UI Tools...
echo.

echo Installing Magic MCP...
call npm install -g @21st-dev/magic@latest

echo Installing Browser Tools MCP...
call npm install -g @agentdeskai/browser-tools-mcp@latest

echo Installing Brave Search MCP...
call npm install -g brave-search-mcp

echo Installing Fetch MCP...
call npm install -g @modelcontextprotocol/server-fetch

echo Installing Puppeteer MCP...
call npm install -g @modelcontextprotocol/server-puppeteer

REM Databases & Data Storage
echo.
echo Installing Databases & Data Storage Tools...
echo.

echo Installing SQLite MCP...
call npm install -g @modelcontextprotocol/server-sqlite

echo Installing PostgreSQL MCP...
call npm install -g @modelcontextprotocol/server-postgres

echo Installing Redis MCP...
call npm install -g @modelcontextprotocol/server-redis

echo Installing Supabase MCP...
call npm install -g @supabase/mcp-server-supabase@latest

echo Installing Neo4j MCP...
call npm install -g @modelcontextprotocol/server-neo4j

REM AI Enhancements & Reasoning
echo.
echo Installing AI Enhancements & Reasoning Tools...
echo.

echo Installing Sequential Thinking MCP...
call npm install -g @modelcontextprotocol/server-sequentialthinking

echo Installing Memory MCP...
call npm install -g @modelcontextprotocol/server-memory

echo Installing Qdrant MCP...
call pip install qdrant-mcp

echo Installing Langchain MCP...
call npm install -g langchain-mcp

echo Installing Anthropic MCP...
call npm install -g anthropic-mcp

REM Code Quality & Security
echo.
echo Installing Code Quality & Security Tools...
echo.

echo Installing Semgrep MCP...
call pip install semgrep-mcp

echo Installing ESLint MCP...
call npm install -g eslint-mcp

echo Installing TypeScript MCP...
call npm install -g typescript-mcp

echo Installing Prettier MCP...
call npm install -g prettier-mcp

echo Installing Jest MCP...
call npm install -g jest-mcp

REM Cloud & DevOps
echo.
echo Installing Cloud & DevOps Tools...
echo.

echo Installing AWS MCP...
call pip install aws-mcp

echo Installing Docker MCP...
call npm install -g docker-mcp

echo Installing Kubernetes MCP...
call npm install -g kubernetes-mcp

REM Specialized Tools
echo.
echo Installing Specialized Tools...
echo.

echo Installing Firecrawl MCP...
call npm install -g firecrawl-mcp

echo Installing Time MCP...
call npm install -g @modelcontextprotocol/server-time

echo.
echo ===================================================
echo Installation Complete!
echo ===================================================
echo.
echo Press any key to exit...
pause > nul
