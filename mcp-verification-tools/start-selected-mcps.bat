@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Start Selected MCP Servers
echo ===================================================
echo.

set GLOBAL_MCP_DIR=C:\Users\aviad\.mcp-servers
set LOG_DIR=%TEMP%\mcp-logs
mkdir %LOG_DIR% 2>nul

:menu
cls
echo Select MCP categories to start:
echo.
echo 1. Development MCPs (GitHub, Git, VSCode, ESLint, TypeScript, Prettier, Jest)
echo 2. Database MCPs (SQLite, PostgreSQL, Redis, Qdrant)
echo 3. Web MCPs (Brave Search, Fetch, Browser Tools, Firecrawl, Puppeteer)
echo 4. AI MCPs (Memory, Sequential Thinking, Langchain, OpenAI, Perplexity)
echo 5. Infrastructure MCPs (Docker, Kubernetes)
echo 6. All MCPs
echo 0. Exit
echo.
set /p CHOICE=Enter your choice (0-6): 

if "%CHOICE%"=="0" goto end
if "%CHOICE%"=="1" goto dev_mcps
if "%CHOICE%"=="2" goto db_mcps
if "%CHOICE%"=="3" goto web_mcps
if "%CHOICE%"=="4" goto ai_mcps
if "%CHOICE%"=="5" goto infra_mcps
if "%CHOICE%"=="6" goto all_mcps
goto menu

:dev_mcps
echo Starting Development MCPs...
call :start_mcp github-mcp.js
call :start_mcp git_mcp.py
call :start_mcp vscode-mcp.js
call :start_mcp eslint-mcp.js
call :start_mcp typescript-mcp.js
call :start_mcp prettier-mcp.js
call :start_mcp jest-mcp.js
goto menu

:db_mcps
echo Starting Database MCPs...
call :start_mcp sqlite-mcp.js
call :start_mcp postgresql-mcp.js
call :start_mcp redis-mcp.js
call :start_mcp qdrant_mcp.py
goto menu

:web_mcps
echo Starting Web MCPs...
call :start_mcp brave-search-mcp.ts
call :start_mcp fetch-mcp.js
call :start_mcp browser-tools-mcp.js
call :start_mcp firecrawl-mcp.js
call :start_mcp puppeteer-mcp.js
goto menu

:ai_mcps
echo Starting AI MCPs...
call :start_mcp memory-mcp.js
call :start_mcp sequential-thinking-mcp.js
call :start_mcp langchain-mcp.js
call :start_mcp openai-mcp.js
call :start_mcp perplexity-mcp.js
goto menu

:infra_mcps
echo Starting Infrastructure MCPs...
call :start_mcp docker-mcp.js
call :start_mcp kubernetes-mcp.js
goto menu

:all_mcps
echo Starting All MCPs...
for %%f in (%GLOBAL_MCP_DIR%\js\*.js) do (
    call :start_mcp %%~nxf
)
for %%f in (%GLOBAL_MCP_DIR%\py\*.py) do (
    if not "%%~nxf"=="setup.py" (
        if not "%%~nxf"=="mcp_template.py" (
            call :start_mcp %%~nxf
        )
    )
)
for %%f in (%GLOBAL_MCP_DIR%\ts\*.ts) do (
    call :start_mcp %%~nxf
)
goto menu

:start_mcp
set MCP_FILE=%~1
set MCP_NAME=%~n1
set MCP_EXT=%~x1

echo Starting %MCP_NAME% MCP...
if "%MCP_EXT%"==".js" (
    start "%MCP_NAME% MCP" cmd /c "node %GLOBAL_MCP_DIR%\js\%MCP_FILE% > %LOG_DIR%\%MCP_NAME%.log 2>&1"
) else if "%MCP_EXT%"==".py" (
    start "%MCP_NAME% MCP" cmd /c "python -m %MCP_NAME% > %LOG_DIR%\%MCP_NAME%.log 2>&1"
) else if "%MCP_EXT%"==".ts" (
    start "%MCP_NAME% MCP" cmd /c "ts-node %GLOBAL_MCP_DIR%\ts\%MCP_FILE% > %LOG_DIR%\%MCP_NAME%.log 2>&1"
)
timeout /t 1 > nul
goto :eof

:end
echo ===================================================
echo Exiting MCP Starter
echo ===================================================
echo.
echo MCP logs are being saved to: %LOG_DIR%
echo.
echo Press any key to exit...
pause > nul
