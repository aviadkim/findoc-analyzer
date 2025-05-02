@echo off
echo ===================================================
echo Installing Docker MCP
echo ===================================================
echo.

set LOG_FILE=docker-mcp-installation.log
echo Docker MCP Installation Log > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a directory for logs if it doesn't exist
mkdir logs 2>nul

echo Trying to install Docker MCP from npm...
echo Trying to install Docker MCP from npm... >> %LOG_FILE%

REM Try the official package first
echo Installing @modelcontextprotocol/server-docker...
echo Installing @modelcontextprotocol/server-docker... >> %LOG_FILE%
call npm install -g @modelcontextprotocol/server-docker
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install @modelcontextprotocol/server-docker.
    echo [FAILED] Failed to install @modelcontextprotocol/server-docker. >> %LOG_FILE%
    
    REM Try the alternative package
    echo Installing docker-mcp...
    echo Installing docker-mcp... >> %LOG_FILE%
    call npm install -g docker-mcp
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to install docker-mcp.
        echo [FAILED] Failed to install docker-mcp. >> %LOG_FILE%
        
        REM Try another alternative package
        echo Installing @modelcontextprotocol/docker-server...
        echo Installing @modelcontextprotocol/docker-server... >> %LOG_FILE%
        call npm install -g @modelcontextprotocol/docker-server
        if %ERRORLEVEL% NEQ 0 (
            echo [FAILED] Failed to install @modelcontextprotocol/docker-server.
            echo [FAILED] Failed to install @modelcontextprotocol/docker-server. >> %LOG_FILE%
            echo [FAILED] All installation attempts failed.
            echo [FAILED] All installation attempts failed. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] @modelcontextprotocol/docker-server installed successfully.
            echo [SUCCESS] @modelcontextprotocol/docker-server installed successfully. >> %LOG_FILE%
            echo Testing @modelcontextprotocol/docker-server...
            echo Testing @modelcontextprotocol/docker-server... >> %LOG_FILE%
            npx -y @modelcontextprotocol/docker-server --help > logs\docker-server.log 2>&1
        )
    ) else (
        echo [SUCCESS] docker-mcp installed successfully.
        echo [SUCCESS] docker-mcp installed successfully. >> %LOG_FILE%
        echo Testing docker-mcp...
        echo Testing docker-mcp... >> %LOG_FILE%
        npx -y docker-mcp --help > logs\docker-mcp.log 2>&1
    )
) else (
    echo [SUCCESS] @modelcontextprotocol/server-docker installed successfully.
    echo [SUCCESS] @modelcontextprotocol/server-docker installed successfully. >> %LOG_FILE%
    echo Testing @modelcontextprotocol/server-docker...
    echo Testing @modelcontextprotocol/server-docker... >> %LOG_FILE%
    npx -y @modelcontextprotocol/server-docker --help > logs\server-docker.log 2>&1
)

echo.
echo ===================================================
echo Installation and Testing Complete!
echo ===================================================
echo.
echo Installation and testing results have been saved to %LOG_FILE%
echo Detailed logs are in the logs directory.
echo.
echo Press any key to exit...
pause > nul
