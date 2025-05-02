@echo off
echo ===================================================
echo MCP Status Checker
echo ===================================================
echo.

set LOG_FILE=mcp-status.log
echo MCP Status Check > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Check if MCPs are running
echo Checking if MCPs are running...
echo Checking if MCPs are running... >> %LOG_FILE%

REM Check for MCP processes
echo Checking for MCP processes...
echo Checking for MCP processes... >> %LOG_FILE%
tasklist /fi "windowtitle eq *MCP*" >> %LOG_FILE% 2>&1
echo. >> %LOG_FILE%

REM Check GitHub MCP
echo Checking GitHub MCP...
echo Checking GitHub MCP... >> %LOG_FILE%
curl -s http://localhost:8080/github/user > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] GitHub MCP may not be running.
    echo [WARNING] GitHub MCP may not be running. >> %LOG_FILE%
) else (
    echo [SUCCESS] GitHub MCP is running.
    echo [SUCCESS] GitHub MCP is running. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check Memory MCP
echo Checking Memory MCP...
echo Checking Memory MCP... >> %LOG_FILE%
curl -s http://localhost:8080/memory/entities > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Memory MCP may not be running.
    echo [WARNING] Memory MCP may not be running. >> %LOG_FILE%
) else (
    echo [SUCCESS] Memory MCP is running.
    echo [SUCCESS] Memory MCP is running. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check Docker
echo Checking Docker...
echo Checking Docker... >> %LOG_FILE%
docker ps > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker is not running or not installed.
    echo [WARNING] Docker is not running or not installed. >> %LOG_FILE%
    echo Docker MCP may not work properly.
    echo Docker MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Docker is running.
    echo [SUCCESS] Docker is running. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check Kubernetes
echo Checking Kubernetes...
echo Checking Kubernetes... >> %LOG_FILE%
kubectl get nodes > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Kubernetes is not running or not configured.
    echo [WARNING] Kubernetes is not running or not configured. >> %LOG_FILE%
    echo Kubernetes MCP may not work properly.
    echo Kubernetes MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Kubernetes is running.
    echo [SUCCESS] Kubernetes is running. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check SQLite
echo Checking SQLite...
echo Checking SQLite... >> %LOG_FILE%
sqlite3 --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] SQLite is not installed or not in PATH.
    echo [WARNING] SQLite is not installed or not in PATH. >> %LOG_FILE%
    echo SQLite MCP may not work properly.
    echo SQLite MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] SQLite is installed.
    echo [SUCCESS] SQLite is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check PostgreSQL
echo Checking PostgreSQL...
echo Checking PostgreSQL... >> %LOG_FILE%
psql --version > nul 2>&1
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
redis-cli --version > nul 2>&1
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

REM Check Node.js tools
echo Checking Node.js tools...
echo Checking Node.js tools... >> %LOG_FILE%

echo Checking TypeScript...
echo Checking TypeScript... >> %LOG_FILE%
tsc --version > nul 2>&1
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

echo Checking ESLint...
echo Checking ESLint... >> %LOG_FILE%
eslint --version > nul 2>&1
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

echo Checking Prettier...
echo Checking Prettier... >> %LOG_FILE%
prettier --version > nul 2>&1
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

echo Checking Jest...
echo Checking Jest... >> %LOG_FILE%
jest --version > nul 2>&1
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

REM Check Python tools
echo Checking Python tools...
echo Checking Python tools... >> %LOG_FILE%

echo Checking Semgrep...
echo Checking Semgrep... >> %LOG_FILE%
semgrep --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Semgrep is not installed or not in PATH.
    echo [WARNING] Semgrep is not installed or not in PATH. >> %LOG_FILE%
    echo Semgrep MCP may not work properly.
    echo Semgrep MCP may not work properly. >> %LOG_FILE%
) else (
    echo [SUCCESS] Semgrep is installed.
    echo [SUCCESS] Semgrep is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo ===================================================
echo Status Check Complete!
echo ===================================================
echo.
echo Check %LOG_FILE% for details.
echo.
echo Next Steps:
echo 1. Fix any issues identified in the status check
echo 2. Restart your command prompt to apply PATH changes
echo 3. Run start-all-no-api-mcps.bat to start all MCPs
echo.
echo Press any key to exit...
pause > nul
