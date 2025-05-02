@echo off
echo ===================================================
echo Installing MCP Dependencies
echo ===================================================
echo.

set LOG_FILE=mcp-dependencies-installation.log
echo MCP Dependencies Installation > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a directory for logs
mkdir logs 2>nul

REM Install Node.js dependencies
echo Installing Node.js dependencies...
echo Installing Node.js dependencies... >> %LOG_FILE%

echo Installing TypeScript...
echo Installing TypeScript... >> %LOG_FILE%
call npm install -g typescript >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install TypeScript.
    echo [FAILED] Failed to install TypeScript. >> %LOG_FILE%
) else (
    echo [SUCCESS] TypeScript installed.
    echo [SUCCESS] TypeScript installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Installing ESLint...
echo Installing ESLint... >> %LOG_FILE%
call npm install -g eslint >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install ESLint.
    echo [FAILED] Failed to install ESLint. >> %LOG_FILE%
) else (
    echo [SUCCESS] ESLint installed.
    echo [SUCCESS] ESLint installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Installing Prettier...
echo Installing Prettier... >> %LOG_FILE%
call npm install -g prettier >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install Prettier.
    echo [FAILED] Failed to install Prettier. >> %LOG_FILE%
) else (
    echo [SUCCESS] Prettier installed.
    echo [SUCCESS] Prettier installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Installing Jest...
echo Installing Jest... >> %LOG_FILE%
call npm install -g jest >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install Jest.
    echo [FAILED] Failed to install Jest. >> %LOG_FILE%
) else (
    echo [SUCCESS] Jest installed.
    echo [SUCCESS] Jest installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Installing Puppeteer...
echo Installing Puppeteer... >> %LOG_FILE%
call npm install -g puppeteer >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install Puppeteer.
    echo [FAILED] Failed to install Puppeteer. >> %LOG_FILE%
) else (
    echo [SUCCESS] Puppeteer installed.
    echo [SUCCESS] Puppeteer installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Installing Playwright...
echo Installing Playwright... >> %LOG_FILE%
call npm install -g playwright >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install Playwright.
    echo [FAILED] Failed to install Playwright. >> %LOG_FILE%
) else (
    echo [SUCCESS] Playwright installed.
    echo [SUCCESS] Playwright installed. >> %LOG_FILE%
    echo Installing Playwright browsers...
    echo Installing Playwright browsers... >> %LOG_FILE%
    call npx playwright install >> %LOG_FILE% 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Failed to install Playwright browsers.
        echo [WARNING] Failed to install Playwright browsers. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] Playwright browsers installed.
        echo [SUCCESS] Playwright browsers installed. >> %LOG_FILE%
    )
)
echo. >> %LOG_FILE%

REM Install Python dependencies
echo Installing Python dependencies...
echo Installing Python dependencies... >> %LOG_FILE%

echo Installing SQLite...
echo Installing SQLite... >> %LOG_FILE%
echo Downloading SQLite...
echo Downloading SQLite... >> %LOG_FILE%
curl -L -o sqlite.zip https://www.sqlite.org/2023/sqlite-tools-win32-x86-3410200.zip >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to download SQLite.
    echo [FAILED] Failed to download SQLite. >> %LOG_FILE%
) else (
    echo [SUCCESS] SQLite downloaded.
    echo [SUCCESS] SQLite downloaded. >> %LOG_FILE%
    echo Extracting SQLite...
    echo Extracting SQLite... >> %LOG_FILE%
    powershell -Command "Expand-Archive -Path sqlite.zip -DestinationPath sqlite -Force" >> %LOG_FILE% 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to extract SQLite.
        echo [FAILED] Failed to extract SQLite. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] SQLite extracted.
        echo [SUCCESS] SQLite extracted. >> %LOG_FILE%
        echo Adding SQLite to PATH...
        echo Adding SQLite to PATH... >> %LOG_FILE%
        setx PATH "%PATH%;%CD%\sqlite\sqlite-tools-win32-x86-3410200" >> %LOG_FILE% 2>&1
        if %ERRORLEVEL% NEQ 0 (
            echo [WARNING] Failed to add SQLite to PATH.
            echo [WARNING] Failed to add SQLite to PATH. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] SQLite added to PATH.
            echo [SUCCESS] SQLite added to PATH. >> %LOG_FILE%
        )
    )
)
echo. >> %LOG_FILE%

echo Installing Qdrant client...
echo Installing Qdrant client... >> %LOG_FILE%
call pip install qdrant-client >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install Qdrant client.
    echo [FAILED] Failed to install Qdrant client. >> %LOG_FILE%
) else (
    echo [SUCCESS] Qdrant client installed.
    echo [SUCCESS] Qdrant client installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Installing Langchain...
echo Installing Langchain... >> %LOG_FILE%
call pip install langchain >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install Langchain.
    echo [FAILED] Failed to install Langchain. >> %LOG_FILE%
) else (
    echo [SUCCESS] Langchain installed.
    echo [SUCCESS] Langchain installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

REM Check for Docker, PostgreSQL, and Redis
echo Checking for Docker, PostgreSQL, and Redis...
echo Checking for Docker, PostgreSQL, and Redis... >> %LOG_FILE%

echo Checking for Docker...
echo Checking for Docker... >> %LOG_FILE%
docker --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker is not installed.
    echo [WARNING] Docker is not installed. >> %LOG_FILE%
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/ >> %LOG_FILE%
) else (
    echo [SUCCESS] Docker is installed.
    echo [SUCCESS] Docker is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Checking for PostgreSQL...
echo Checking for PostgreSQL... >> %LOG_FILE%
psql --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] PostgreSQL is not installed.
    echo [WARNING] PostgreSQL is not installed. >> %LOG_FILE%
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/ >> %LOG_FILE%
) else (
    echo [SUCCESS] PostgreSQL is installed.
    echo [SUCCESS] PostgreSQL is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Checking for Redis...
echo Checking for Redis... >> %LOG_FILE%
redis-cli --version >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Redis is not installed.
    echo [WARNING] Redis is not installed. >> %LOG_FILE%
    echo Please install Redis from https://github.com/microsoftarchive/redis/releases
    echo Please install Redis from https://github.com/microsoftarchive/redis/releases >> %LOG_FILE%
) else (
    echo [SUCCESS] Redis is installed.
    echo [SUCCESS] Redis is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo Checking for kubectl...
echo Checking for kubectl... >> %LOG_FILE%
kubectl version --client >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] kubectl is not installed.
    echo [WARNING] kubectl is not installed. >> %LOG_FILE%
    echo Please install kubectl from https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/
    echo Please install kubectl from https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/ >> %LOG_FILE%
) else (
    echo [SUCCESS] kubectl is installed.
    echo [SUCCESS] kubectl is installed. >> %LOG_FILE%
)
echo. >> %LOG_FILE%

echo ===================================================
echo Installation Complete!
echo ===================================================
echo.
echo Installation results have been saved to %LOG_FILE%
echo.
echo Next Steps:
echo 1. Restart your command prompt to apply PATH changes
echo 2. Install Docker, PostgreSQL, Redis, and kubectl if needed
echo 3. Run check-mcp-dependencies.bat to verify all dependencies are installed
echo 4. Run start-all-dependency-mcps.bat to start all MCPs that require dependencies
echo.
echo Press any key to exit...
pause > nul
