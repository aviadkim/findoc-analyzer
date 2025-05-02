@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Custom MCP Installation Script
echo ===================================================
echo.

set LOG_FILE=custom-mcp-installation.log
echo Custom MCP Installation Log > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a directory for logs if it doesn't exist
mkdir logs 2>nul

REM Function to install an npm package
:install_npm_package
echo.
echo ===================================================
echo Installing: %~1
echo Package: %~2
echo ===================================================
echo.
echo Installing: %~1 >> %LOG_FILE%
echo Package: %~2 >> %LOG_FILE%

echo Installing %~1...
call npm install -g %~2
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install %~1.
    echo [FAILED] Failed to install %~1. >> %LOG_FILE%
    echo Error code: %ERRORLEVEL% >> %LOG_FILE%
) else (
    echo [SUCCESS] %~1 installed successfully.
    echo [SUCCESS] %~1 installed successfully. >> %LOG_FILE%
)

echo. >> %LOG_FILE%
goto :eof

REM Function to install a Python package
:install_python_package
echo.
echo ===================================================
echo Installing: %~1
echo Package: %~2
echo ===================================================
echo.
echo Installing: %~1 >> %LOG_FILE%
echo Package: %~2 >> %LOG_FILE%

echo Installing %~1...
call pip install %~2
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install %~1.
    echo [FAILED] Failed to install %~1. >> %LOG_FILE%
    echo Error code: %ERRORLEVEL% >> %LOG_FILE%
) else (
    echo [SUCCESS] %~1 installed successfully.
    echo [SUCCESS] %~1 installed successfully. >> %LOG_FILE%
)

echo. >> %LOG_FILE%
goto :eof

echo Installing MCP packages...
echo.

REM Install Docker-related packages
call :install_npm_package "Docker CLI MCP" "@docker/cli-mcp"
call :install_npm_package "Docker MCP" "@docker/mcp"

REM Install Kubernetes-related packages
call :install_npm_package "Kubernetes MCP" "kubernetes-mcp-server"
call :install_npm_package "K8s MCP" "k8s-mcp"

REM Install code quality packages
call :install_npm_package "ESLint MCP" "eslint-mcp"
call :install_npm_package "TypeScript MCP" "typescript-mcp"
call :install_npm_package "Prettier MCP" "prettier-mcp"
call :install_npm_package "Jest MCP" "jest-mcp"

REM Install AI-related packages
call :install_npm_package "Langchain MCP" "langchain-mcp"
call :install_python_package "Qdrant MCP" "qdrant-mcp"
call :install_python_package "Semgrep MCP" "semgrep-mcp"

REM Install editor packages
call :install_npm_package "VSCode MCP" "vscode-mcp"

echo.
echo ===================================================
echo Installation Complete!
echo ===================================================
echo.
echo Installation results have been saved to %LOG_FILE%
echo.
echo Press any key to exit...
pause > nul
