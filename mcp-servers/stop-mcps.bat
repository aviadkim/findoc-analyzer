@echo off
echo Stopping MCP servers...

:: Find and kill Firecrawl MCP process
for /f "tokens=2" %%p in ('tasklist /fi "windowtitle eq Firecrawl MCP" /fo list ^| find "PID:"') do (
  echo Stopping Firecrawl MCP with PID: %%p
  taskkill /PID %%p /F
)

:: Find and kill Context7 MCP process
for /f "tokens=2" %%p in ('tasklist /fi "windowtitle eq Context7 MCP" /fo list ^| find "PID:"') do (
  echo Stopping Context7 MCP with PID: %%p
  taskkill /PID %%p /F
)

:: Find and kill Playwright MCP process
for /f "tokens=2" %%p in ('tasklist /fi "windowtitle eq Playwright MCP" /fo list ^| find "PID:"') do (
  echo Stopping Playwright MCP with PID: %%p
  taskkill /PID %%p /F
)

echo MCP servers stopped successfully!