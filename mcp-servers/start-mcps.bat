@echo off
echo Starting MCP servers...

:: Start Firecrawl MCP
start "Firecrawl MCP" cmd /c "cd /d %~dp0firecrawl-mcp-server && set FIRECRAWL_API_KEY=fc-857417811665460e92716b92e08ec398 && node dist/index.js --config ../firecrawl-config.json"

:: Start Context7 MCP
start "Context7 MCP" cmd /c "cd /d %~dp0context7 && node dist/index.js --config ../context7-config.json"

:: Start Playwright MCP
start "Playwright MCP" cmd /c "cd /d %~dp0playwright-mcp && node cli.js --config ../playwright-config.json"

:: Start Sequential Thinking MCP
start "Sequential Thinking MCP" cmd /c "cd /d %~dp0sequentialthinking && node dist/index.js --config ../sequential-thinking-config.json"

echo MCP servers started successfully!
echo Firecrawl MCP running on port 8081
echo Context7 MCP running on port 8082
echo Playwright MCP running on port 8083
echo Sequential Thinking MCP running on port 8084