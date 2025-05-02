@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Installing MCP Packages from GitHub
echo ===================================================
echo.

set LOG_FILE=github-mcp-installation.log
echo GitHub MCP Installation Log > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a directory for MCP packages if it doesn't exist
mkdir mcp-packages 2>nul
cd mcp-packages

REM Function to install an MCP package from GitHub
:install_from_github
echo.
echo ===================================================
echo Installing: %~1
echo Repository: %~2
echo ===================================================
echo.
echo Installing: %~1 >> ..\%LOG_FILE%
echo Repository: %~2 >> ..\%LOG_FILE%

echo Cloning repository...
git clone %~2 %~1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to clone repository.
    echo [FAILED] Failed to clone repository. >> ..\%LOG_FILE%
    echo Error code: %ERRORLEVEL% >> ..\%LOG_FILE%
) else (
    echo [SUCCESS] Repository cloned successfully.
    echo [SUCCESS] Repository cloned successfully. >> ..\%LOG_FILE%
    
    echo Installing dependencies...
    cd %~1
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to install dependencies.
        echo [FAILED] Failed to install dependencies. >> ..\..\%LOG_FILE%
        echo Error code: %ERRORLEVEL% >> ..\..\%LOG_FILE%
    ) else (
        echo [SUCCESS] Dependencies installed successfully.
        echo [SUCCESS] Dependencies installed successfully. >> ..\..\%LOG_FILE%
        
        echo Building package...
        call npm run build
        if %ERRORLEVEL% NEQ 0 (
            echo [WARNING] Build command failed, trying to install globally...
            echo [WARNING] Build command failed, trying to install globally... >> ..\..\%LOG_FILE%
        ) else (
            echo [SUCCESS] Package built successfully.
            echo [SUCCESS] Package built successfully. >> ..\..\%LOG_FILE%
        )
        
        echo Installing package globally...
        call npm install -g .
        if %ERRORLEVEL% NEQ 0 (
            echo [FAILED] Failed to install package globally.
            echo [FAILED] Failed to install package globally. >> ..\..\%LOG_FILE%
            echo Error code: %ERRORLEVEL% >> ..\..\%LOG_FILE%
        ) else (
            echo [SUCCESS] Package installed globally.
            echo [SUCCESS] Package installed globally. >> ..\..\%LOG_FILE%
        )
    )
    cd ..
)

echo. >> ..\%LOG_FILE%
goto :eof

echo Installing MCP packages from GitHub...
echo.

REM Install Docker MCP
call :install_from_github "docker-mcp" "https://github.com/modelcontextprotocol/server-docker.git"

REM Install Kubernetes MCP
call :install_from_github "kubernetes-mcp" "https://github.com/modelcontextprotocol/server-kubernetes.git"

REM Install ESLint MCP
call :install_from_github "eslint-mcp" "https://github.com/modelcontextprotocol/server-eslint.git"

REM Install TypeScript MCP
call :install_from_github "typescript-mcp" "https://github.com/modelcontextprotocol/server-typescript.git"

REM Install Prettier MCP
call :install_from_github "prettier-mcp" "https://github.com/modelcontextprotocol/server-prettier.git"

REM Install Jest MCP
call :install_from_github "jest-mcp" "https://github.com/modelcontextprotocol/server-jest.git"

REM Install VSCode MCP
call :install_from_github "vscode-mcp" "https://github.com/modelcontextprotocol/server-vscode.git"

cd ..

echo.
echo ===================================================
echo Installation Complete!
echo ===================================================
echo.
echo Installation results have been saved to %LOG_FILE%
echo.
echo Press any key to exit...
pause > nul
