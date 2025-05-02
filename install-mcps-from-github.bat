@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Installing MCP Servers from GitHub
echo ===================================================
echo.

set LOG_FILE=github-mcps-installation.log
echo GitHub MCPs Installation Log > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a directory for logs if it doesn't exist
mkdir logs 2>nul

REM Create a directory for MCP packages if it doesn't exist
mkdir mcp-packages 2>nul

echo Installing MCP servers from GitHub...
echo.

goto :start_installation

REM Function to install an npm package from GitHub
:install_from_github
echo.
echo ===================================================
echo Installing: %~1
echo Repository: %~2
echo ===================================================
echo.
echo Installing: %~1 >> %LOG_FILE%
echo Repository: %~2 >> %LOG_FILE%

cd mcp-packages

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

cd ..
goto :eof

REM Function to install a Python package from GitHub
:install_python_from_github
echo.
echo ===================================================
echo Installing Python Package: %~1
echo Repository: %~2
echo ===================================================
echo.
echo Installing Python Package: %~1 >> %LOG_FILE%
echo Repository: %~2 >> %LOG_FILE%

cd mcp-packages

echo Cloning repository...
git clone %~2 %~1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to clone repository.
    echo [FAILED] Failed to clone repository. >> ..\%LOG_FILE%
    echo Error code: %ERRORLEVEL% >> ..\%LOG_FILE%
) else (
    echo [SUCCESS] Repository cloned successfully.
    echo [SUCCESS] Repository cloned successfully. >> ..\%LOG_FILE%

    echo Installing Python package...
    cd %~1
    call pip install -e .
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to install Python package.
        echo [FAILED] Failed to install Python package. >> ..\..\%LOG_FILE%
        echo Error code: %ERRORLEVEL% >> ..\..\%LOG_FILE%
    ) else (
        echo [SUCCESS] Python package installed successfully.
        echo [SUCCESS] Python package installed successfully. >> ..\..\%LOG_FILE%
    )
    cd ..
)

cd ..
goto :eof

:start_installation

REM Install VSCode MCP
call :install_from_github "vscode-mcp" "https://github.com/modelcontextprotocol/server-vscode.git"

REM Install Langchain MCP
call :install_from_github "langchain-mcp" "https://github.com/modelcontextprotocol/server-langchain.git"

REM Install Qdrant MCP
call :install_python_from_github "qdrant-mcp" "https://github.com/modelcontextprotocol/server-qdrant.git"

REM Install Semgrep MCP
call :install_python_from_github "semgrep-mcp" "https://github.com/modelcontextprotocol/server-semgrep.git"

REM Install ESLint MCP
call :install_from_github "eslint-mcp" "https://github.com/modelcontextprotocol/server-eslint.git"

REM Install TypeScript MCP
call :install_from_github "typescript-mcp" "https://github.com/modelcontextprotocol/server-typescript.git"

REM Install Prettier MCP
call :install_from_github "prettier-mcp" "https://github.com/modelcontextprotocol/server-prettier.git"

REM Install Jest MCP
call :install_from_github "jest-mcp" "https://github.com/modelcontextprotocol/server-jest.git"

REM Install Docker MCP
call :install_from_github "docker-mcp" "https://github.com/modelcontextprotocol/server-docker.git"

REM Install Kubernetes MCP
call :install_from_github "kubernetes-mcp" "https://github.com/modelcontextprotocol/server-kubernetes.git"

echo.
echo ===================================================
echo Installation Complete!
echo ===================================================
echo.
echo Installation results have been saved to %LOG_FILE%
echo.
echo Press any key to exit...
pause > nul
