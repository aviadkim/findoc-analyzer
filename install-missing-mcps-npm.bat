@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Installing Missing MCP Servers
echo ===================================================
echo.

set LOG_FILE=missing-mcps-npm-installation.log
echo Missing MCPs NPM Installation Log > %LOG_FILE%
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
echo Installing Python Package: %~1
echo Package: %~2
echo ===================================================
echo.
echo Installing Python Package: %~1 >> %LOG_FILE%
echo Package: %~2 >> %LOG_FILE%

echo Installing %~1...
call pip install %~2
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install Python package %~1.
    echo [FAILED] Failed to install Python package %~1. >> %LOG_FILE%
    echo Error code: %ERRORLEVEL% >> %LOG_FILE%
) else (
    echo [SUCCESS] Python package %~1 installed successfully.
    echo [SUCCESS] Python package %~1 installed successfully. >> %LOG_FILE%
)

echo. >> %LOG_FILE%
goto :eof

echo Installing missing MCP servers...
echo.

REM Install Docker MCP
call :install_npm_package "Docker MCP" "@docker/cli-mcp"

REM Install Kubernetes MCP
call :install_npm_package "Kubernetes MCP" "kubernetes-mcp-server"

REM Install ESLint MCP
call :install_npm_package "ESLint MCP" "eslint-mcp"

REM Install TypeScript MCP
call :install_npm_package "TypeScript MCP" "typescript-mcp"

REM Install Prettier MCP
call :install_npm_package "Prettier MCP" "prettier-mcp"

REM Install Jest MCP
call :install_npm_package "Jest MCP" "jest-mcp"

REM Install Langchain MCP
call :install_npm_package "Langchain MCP" "langchain-mcp"

REM Install Qdrant MCP
call :install_python_package "Qdrant MCP" "qdrant-mcp"

REM Install Semgrep MCP
call :install_python_package "Semgrep MCP" "semgrep-mcp"

REM Install Supergateway for VSCode MCP
call :install_npm_package "Supergateway" "supergateway"

echo.
echo ===================================================
echo Installation Complete!
echo ===================================================
echo.
echo Installation results have been saved to %LOG_FILE%
echo.
echo Press any key to exit...
pause > nul
