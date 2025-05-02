@echo off
echo ===================================================
echo Checking Available MCP Packages
echo ===================================================
echo.

set LOG_FILE=available-mcps.log
echo Available MCP Packages > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Function to check if an npm package exists
:check_npm_package
echo Checking %~1...
echo Checking %~1... >> %LOG_FILE%
npm view %~1 version > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [AVAILABLE] %~1
    echo [AVAILABLE] %~1 >> %LOG_FILE%
    npm view %~1 version >> %LOG_FILE%
) else (
    echo [NOT FOUND] %~1
    echo [NOT FOUND] %~1 >> %LOG_FILE%
)
echo. >> %LOG_FILE%
goto :eof

echo Checking Docker MCP packages...
call :check_npm_package "docker-mcp"
call :check_npm_package "@docker/mcp"
call :check_npm_package "@docker/cli-mcp"
call :check_npm_package "@modelcontextprotocol/server-docker"
call :check_npm_package "@modelcontextprotocol/docker-server"

echo.
echo Checking Kubernetes MCP packages...
call :check_npm_package "kubernetes-mcp"
call :check_npm_package "k8s-mcp"
call :check_npm_package "@modelcontextprotocol/server-kubernetes"
call :check_npm_package "@modelcontextprotocol/kubernetes-server"

echo.
echo Checking code quality MCP packages...
call :check_npm_package "eslint-mcp"
call :check_npm_package "@modelcontextprotocol/server-eslint"
call :check_npm_package "typescript-mcp"
call :check_npm_package "@modelcontextprotocol/server-typescript"
call :check_npm_package "prettier-mcp"
call :check_npm_package "@modelcontextprotocol/server-prettier"
call :check_npm_package "jest-mcp"
call :check_npm_package "@modelcontextprotocol/server-jest"

echo.
echo Checking AI-related MCP packages...
call :check_npm_package "langchain-mcp"
call :check_npm_package "@modelcontextprotocol/server-langchain"

echo.
echo Checking editor MCP packages...
call :check_npm_package "vscode-mcp"
call :check_npm_package "@modelcontextprotocol/server-vscode"

echo.
echo ===================================================
echo Check Complete!
echo ===================================================
echo.
echo Results have been saved to %LOG_FILE%
echo.
echo Press any key to exit...
pause > nul
