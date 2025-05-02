@echo off
echo ===================================================
echo Checking MCP Dependencies
echo ===================================================
echo.

set LOG_FILE=mcp-dependencies-check.log
echo MCP Dependencies Check > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Check Docker
echo Checking Docker...
echo Checking Docker... >> %LOG_FILE%
docker --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker is not installed or not in PATH.
    echo [WARNING] Docker is not installed or not in PATH. >> %LOG_FILE%
    echo Docker MCP may not work properly.
    echo Docker MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Docker is installed.
    echo [SUCCESS] Docker is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check Kubernetes
echo Checking Kubernetes...
echo Checking Kubernetes... >> %LOG_FILE%
kubectl version --client >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Kubernetes (kubectl) is not installed or not in PATH.
    echo [WARNING] Kubernetes (kubectl) is not installed or not in PATH. >> %LOG_FILE%
    echo Kubernetes MCP may not work properly.
    echo Kubernetes MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Kubernetes (kubectl) is installed.
    echo [SUCCESS] Kubernetes (kubectl) is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check PostgreSQL
echo Checking PostgreSQL...
echo Checking PostgreSQL... >> %LOG_FILE%
psql --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] PostgreSQL is not installed or not in PATH.
    echo [WARNING] PostgreSQL is not installed or not in PATH. >> %LOG_FILE%
    echo PostgreSQL MCP may not work properly.
    echo PostgreSQL MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] PostgreSQL is installed.
    echo [SUCCESS] PostgreSQL is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check Redis
echo Checking Redis...
echo Checking Redis... >> %LOG_FILE%
redis-cli --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Redis is not installed or not in PATH.
    echo [WARNING] Redis is not installed or not in PATH. >> %LOG_FILE%
    echo Redis MCP may not work properly.
    echo Redis MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Redis is installed.
    echo [SUCCESS] Redis is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check TypeScript
echo Checking TypeScript...
echo Checking TypeScript... >> %LOG_FILE%
tsc --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] TypeScript is not installed or not in PATH.
    echo [WARNING] TypeScript is not installed or not in PATH. >> %LOG_FILE%
    echo TypeScript MCP may not work properly.
    echo TypeScript MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] TypeScript is installed.
    echo [SUCCESS] TypeScript is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check ESLint
echo Checking ESLint...
echo Checking ESLint... >> %LOG_FILE%
eslint --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] ESLint is not installed or not in PATH.
    echo [WARNING] ESLint is not installed or not in PATH. >> %LOG_FILE%
    echo ESLint MCP may not work properly.
    echo ESLint MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] ESLint is installed.
    echo [SUCCESS] ESLint is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check Prettier
echo Checking Prettier...
echo Checking Prettier... >> %LOG_FILE%
prettier --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Prettier is not installed or not in PATH.
    echo [WARNING] Prettier is not installed or not in PATH. >> %LOG_FILE%
    echo Prettier MCP may not work properly.
    echo Prettier MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Prettier is installed.
    echo [SUCCESS] Prettier is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check Jest
echo Checking Jest...
echo Checking Jest... >> %LOG_FILE%
jest --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Jest is not installed or not in PATH.
    echo [WARNING] Jest is not installed or not in PATH. >> %LOG_FILE%
    echo Jest MCP may not work properly.
    echo Jest MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Jest is installed.
    echo [SUCCESS] Jest is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check VSCode
echo Checking VSCode...
echo Checking VSCode... >> %LOG_FILE%
code --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] VSCode is not installed or not in PATH.
    echo [WARNING] VSCode is not installed or not in PATH. >> %LOG_FILE%
    echo VSCode MCP may not work properly.
    echo VSCode MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] VSCode is installed.
    echo [SUCCESS] VSCode is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check Python packages
echo Checking Python packages...
echo Checking Python packages... >> %LOG_FILE%

echo Checking Qdrant client...
echo Checking Qdrant client... >> %LOG_FILE%
pip show qdrant-client >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Qdrant client is not installed.
    echo [WARNING] Qdrant client is not installed. >> %LOG_FILE%
    echo Qdrant MCP may not work properly.
    echo Qdrant MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Qdrant client is installed.
    echo [SUCCESS] Qdrant client is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Checking Langchain...
echo Checking Langchain... >> %LOG_FILE%
pip show langchain >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Langchain is not installed.
    echo [WARNING] Langchain is not installed. >> %LOG_FILE%
    echo Langchain MCP may not work properly.
    echo Langchain MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Langchain is installed.
    echo [SUCCESS] Langchain is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check Node.js packages
echo Checking Node.js packages...
echo Checking Node.js packages... >> %LOG_FILE%

echo Checking Puppeteer...
echo Checking Puppeteer... >> %LOG_FILE%
npm list -g puppeteer >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Puppeteer is not installed globally.
    echo [WARNING] Puppeteer is not installed globally. >> %LOG_FILE%
    echo Puppeteer MCP may not work properly.
    echo Puppeteer MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Puppeteer is installed globally.
    echo [SUCCESS] Puppeteer is installed globally. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Checking Playwright...
echo Checking Playwright... >> %LOG_FILE%
npx playwright --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Playwright is not installed.
    echo [WARNING] Playwright is not installed. >> %LOG_FILE%
    echo Playwright MCP may not work properly.
    echo Playwright MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Playwright is installed.
    echo [SUCCESS] Playwright is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo ===================================================
echo Check Complete!
echo ===================================================
echo.
echo Check %LOG_FILE% for details.
echo.
echo Next Steps:
echo 1. Install any missing dependencies for the MCPs you want to use
echo 2. Run start-all-mcps-for-project.bat to start the MCPs
echo 3. Run configure-augment-for-project.bat to configure Augment
echo.
echo Press any key to exit...
pause > nul
