@echo off
echo ===================================================
echo Installing and Testing Missing MCP Servers
echo ===================================================
echo.

set LOG_FILE=missing-mcps-installation.log
echo MCP Server Installation Log > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a directory for logs if it doesn't exist
mkdir logs 2>nul

REM Function to install and test an npm MCP server
:install_npm_mcp
echo.
echo ===================================================
echo Installing and Testing: %~1
echo Package: %~2
echo Command: %~3
echo ===================================================
echo.
echo Installing and Testing: %~1 >> %LOG_FILE%
echo Package: %~2 >> %LOG_FILE%
echo Command: %~3 >> %LOG_FILE%

echo Installing %~1...
call npm install -g %~2
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install %~1.
    echo [FAILED] Failed to install %~1. >> %LOG_FILE%
) else (
    echo [SUCCESS] %~1 installed successfully.
    echo [SUCCESS] %~1 installed successfully. >> %LOG_FILE%
    
    echo Testing %~1...
    start /b cmd /c "%~3 > logs\%~1_test.log 2>&1"
    timeout /t 5 /nobreak > nul
    
    REM Check if the process is still running
    tasklist | find "node.exe" > nul
    if !ERRORLEVEL! EQU 0 (
        echo [SUCCESS] %~1 started successfully.
        echo [SUCCESS] %~1 started successfully. >> %LOG_FILE%
        
        REM Kill the process
        taskkill /F /IM node.exe > nul 2>&1
    ) else (
        echo [FAILED] %~1 failed to start.
        echo [FAILED] %~1 failed to start. >> %LOG_FILE%
        echo Check logs\%~1_test.log for details.
        echo Check logs\%~1_test.log for details. >> %LOG_FILE%
    )
)

echo. >> %LOG_FILE%
goto :eof

REM Function to install and test a Python MCP server
:install_python_mcp
echo.
echo ===================================================
echo Installing and Testing: %~1
echo Package: %~2
echo Command: %~3
echo ===================================================
echo.
echo Installing and Testing: %~1 >> %LOG_FILE%
echo Package: %~2 >> %LOG_FILE%
echo Command: %~3 >> %LOG_FILE%

echo Installing %~1...
call pip install %~2
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install %~1.
    echo [FAILED] Failed to install %~1. >> %LOG_FILE%
) else (
    echo [SUCCESS] %~1 installed successfully.
    echo [SUCCESS] %~1 installed successfully. >> %LOG_FILE%
    
    echo Testing %~1...
    start /b cmd /c "%~3 > logs\%~1_test.log 2>&1"
    timeout /t 5 /nobreak > nul
    
    REM Check if the process is still running
    tasklist | find "python.exe" > nul
    if !ERRORLEVEL! EQU 0 (
        echo [SUCCESS] %~1 started successfully.
        echo [SUCCESS] %~1 started successfully. >> %LOG_FILE%
        
        REM Kill the process
        taskkill /F /IM python.exe > nul 2>&1
    ) else (
        echo [FAILED] %~1 failed to start.
        echo [FAILED] %~1 failed to start. >> %LOG_FILE%
        echo Check logs\%~1_test.log for details.
        echo Check logs\%~1_test.log for details. >> %LOG_FILE%
    )
)

echo. >> %LOG_FILE%
goto :eof

echo Installing and testing missing MCP servers...
echo.

REM Install and test npm-based MCP servers
call :install_npm_mcp "Docker MCP" "docker-mcp" "npx -y docker-mcp"
call :install_npm_mcp "Kubernetes MCP" "kubernetes-mcp" "npx -y kubernetes-mcp"
call :install_npm_mcp "ESLint MCP" "eslint-mcp" "npx -y eslint-mcp"
call :install_npm_mcp "TypeScript MCP" "typescript-mcp" "npx -y typescript-mcp"
call :install_npm_mcp "Prettier MCP" "prettier-mcp" "npx -y prettier-mcp"
call :install_npm_mcp "Jest MCP" "jest-mcp" "npx -y jest-mcp"
call :install_npm_mcp "Langchain MCP" "langchain-mcp" "npx -y langchain-mcp"
call :install_npm_mcp "VSCode MCP" "vscode-mcp" "npx -y vscode-mcp"

REM Install and test Python-based MCP servers
call :install_python_mcp "Qdrant MCP" "qdrant-mcp" "python -m qdrant_mcp"
call :install_python_mcp "Semgrep MCP" "semgrep-mcp" "python -m semgrep_mcp"

echo.
echo ===================================================
echo Installation and Testing Complete!
echo ===================================================
echo.
echo Installation and testing results have been saved to %LOG_FILE%
echo Detailed logs for each MCP server are in the logs directory.
echo.
echo Press any key to exit...
pause > nul
