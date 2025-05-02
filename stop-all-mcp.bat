@echo off
echo ===================================================
echo Stopping All MCP Servers
echo ===================================================
echo.

echo This will stop all MCP server processes.
echo.
set /p CONFIRM=Are you sure you want to continue? (Y/N): 

if /i "%CONFIRM%" neq "Y" (
    echo Operation cancelled.
    goto :end
)

echo.
echo Stopping MCP server processes...
taskkill /f /fi "WINDOWTITLE eq GitHub_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq GitLab_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Git_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Filesystem_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq VSCode_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Magic_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Browser_Tools_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Brave_Search_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Fetch_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Puppeteer_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq SQLite_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq PostgreSQL_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Redis_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Supabase_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Neo4j_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Sequential_Thinking_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Memory_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Qdrant_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Langchain_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Semgrep_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq ESLint_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq TypeScript_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Prettier_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Jest_MCP*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Time_MCP*" 2>nul

echo.
echo ===================================================
echo All MCP servers stopped!
echo ===================================================
echo.

:end
echo Press any key to exit...
pause > nul
