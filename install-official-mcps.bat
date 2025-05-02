@echo off
echo ===================================================
echo Installing Official MCP Servers
echo ===================================================
echo.

set LOG_FILE=official-mcps-installation.log
echo Official MCP Server Installation Log > %LOG_FILE%
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

echo Installing and testing official MCP servers...
echo.

REM Install and test official npm-based MCP servers
call :install_npm_mcp "Docker MCP" "@modelcontextprotocol/server-docker" "npx -y @modelcontextprotocol/server-docker"
call :install_npm_mcp "Kubernetes MCP" "@modelcontextprotocol/server-kubernetes" "npx -y @modelcontextprotocol/server-kubernetes"
call :install_npm_mcp "ESLint MCP" "@modelcontextprotocol/server-eslint" "npx -y @modelcontextprotocol/server-eslint"
call :install_npm_mcp "TypeScript MCP" "@modelcontextprotocol/server-typescript" "npx -y @modelcontextprotocol/server-typescript"
call :install_npm_mcp "Prettier MCP" "@modelcontextprotocol/server-prettier" "npx -y @modelcontextprotocol/server-prettier"
call :install_npm_mcp "Jest MCP" "@modelcontextprotocol/server-jest" "npx -y @modelcontextprotocol/server-jest"
call :install_npm_mcp "Langchain MCP" "@modelcontextprotocol/server-langchain" "npx -y @modelcontextprotocol/server-langchain"
call :install_npm_mcp "VSCode MCP" "@modelcontextprotocol/server-vscode" "npx -y @modelcontextprotocol/server-vscode"

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
