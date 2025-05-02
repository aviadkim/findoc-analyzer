@echo off
echo ===================================================
echo Configuring Augment for Project
echo ===================================================
echo.

set GLOBAL_MCP_DIR=C:\Users\aviad\.mcp-servers
set CONFIG_FILE=augment-mcp-config-for-project.json

echo Creating Augment MCP configuration file...
echo.

echo { > %CONFIG_FILE%
echo   "mcpServers": { >> %CONFIG_FILE%

REM JavaScript MCPs
echo     "GitHub_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\github-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Memory_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\memory-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "SQLite_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\sqlite-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Filesystem_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\filesystem-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Fetch_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\fetch-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "PostgreSQL_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\postgresql-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Redis_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\redis-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "SequentialThinking_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\sequential-thinking-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Puppeteer_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\puppeteer-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Time_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\time-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Docker_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\docker-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Kubernetes_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\kubernetes-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "VSCode_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\vscode-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "TypeScript_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\typescript-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Prettier_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\prettier-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Jest_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\jest-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "ESLint_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\eslint-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Langchain_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\langchain-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Context7_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\context7-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Playwright_MCP": { >> %CONFIG_FILE%
echo       "command": "node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\js\\playwright-mcp.js"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

REM Python MCPs
echo     "Git_MCP": { >> %CONFIG_FILE%
echo       "command": "python", >> %CONFIG_FILE%
echo       "args": ["-m", "git_mcp"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Qdrant_MCP": { >> %CONFIG_FILE%
echo       "command": "python", >> %CONFIG_FILE%
echo       "args": ["-m", "qdrant_mcp"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

echo     "Semgrep_MCP": { >> %CONFIG_FILE%
echo       "command": "python", >> %CONFIG_FILE%
echo       "args": ["-m", "semgrep_mcp"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     }, >> %CONFIG_FILE%

REM TypeScript MCPs
echo     "BraveSearch_MCP": { >> %CONFIG_FILE%
echo       "command": "ts-node", >> %CONFIG_FILE%
echo       "args": ["%GLOBAL_MCP_DIR%\\ts\\brave-search-mcp.ts"], >> %CONFIG_FILE%
echo       "disabled": false, >> %CONFIG_FILE%
echo       "autoApprove": [], >> %CONFIG_FILE%
echo       "timeout": 600 >> %CONFIG_FILE%
echo     } >> %CONFIG_FILE%

echo   } >> %CONFIG_FILE%
echo } >> %CONFIG_FILE%

echo [SUCCESS] Created Augment MCP configuration file: %CONFIG_FILE%
echo.
echo ===================================================
echo Configuration Complete!
echo ===================================================
echo.
echo To use this configuration:
echo 1. Copy the contents of %CONFIG_FILE%
echo 2. Open Augment settings
echo 3. Paste the configuration into the MCP settings
echo.
echo Press any key to open the configuration file...
pause > nul
start notepad %CONFIG_FILE%
