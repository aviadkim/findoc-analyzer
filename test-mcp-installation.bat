@echo off
echo ===================================================
echo Testing MCP Server Installation
echo ===================================================
echo.

echo Testing Magic MCP...
call npx -y @21st-dev/magic@latest --version
if %ERRORLEVEL% EQU 0 (
    echo Magic MCP installation successful!
) else (
    echo Magic MCP installation failed!
)
echo.

echo Testing Supabase MCP...
call npx -y @supabase/mcp-server-supabase@latest --version
if %ERRORLEVEL% EQU 0 (
    echo Supabase MCP installation successful!
) else (
    echo Supabase MCP installation failed!
)
echo.

echo Testing Browser Tools MCP...
call npx -y @agentdeskai/browser-tools-mcp@latest --version
if %ERRORLEVEL% EQU 0 (
    echo Browser Tools MCP installation successful!
) else (
    echo Browser Tools MCP installation failed!
)
echo.

echo Testing Firecrawl MCP...
call npx -y firecrawl-mcp --version
if %ERRORLEVEL% EQU 0 (
    echo Firecrawl MCP installation successful!
) else (
    echo Firecrawl MCP installation failed!
)
echo.

echo Testing Puppeteer MCP...
call npx -y @modelcontextprotocol/server-puppeteer --version
if %ERRORLEVEL% EQU 0 (
    echo Puppeteer MCP installation successful!
) else (
    echo Puppeteer MCP installation failed!
)
echo.

echo Testing GitHub MCP...
call npx -y github-mcp --version
if %ERRORLEVEL% EQU 0 (
    echo GitHub MCP installation successful!
) else (
    echo GitHub MCP installation failed!
)
echo.

echo ===================================================
echo Testing Complete!
echo ===================================================
echo.
echo Press any key to exit...
pause > nul
