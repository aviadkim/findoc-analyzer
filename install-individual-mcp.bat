@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Installing Individual MCP Server
echo ===================================================
echo.

if "%~1"=="" (
    echo Usage: install-individual-mcp.bat [mcp-name]
    echo.
    echo Available MCP names:
    echo   docker       - Docker MCP
    echo   kubernetes   - Kubernetes MCP
    echo   eslint       - ESLint MCP
    echo   typescript   - TypeScript MCP
    echo   prettier     - Prettier MCP
    echo   jest         - Jest MCP
    echo   langchain    - Langchain MCP
    echo   vscode       - VSCode MCP
    echo   qdrant       - Qdrant MCP
    echo   semgrep      - Semgrep MCP
    echo.
    exit /b 1
)

set MCP_NAME=%~1
set LOG_FILE=%MCP_NAME%-installation.log
echo %MCP_NAME% MCP Installation Log > %LOG_FILE%
echo Timestamp: %date% %time% >> %LOG_FILE%
echo. >> %LOG_FILE%

REM Create a directory for logs if it doesn't exist
mkdir logs 2>nul

if /i "%MCP_NAME%"=="docker" (
    echo Installing Docker MCP...
    echo Installing Docker MCP... >> %LOG_FILE%
    call npm install -g @modelcontextprotocol/server-docker
    if !ERRORLEVEL! NEQ 0 (
        echo [FAILED] Failed to install Docker MCP.
        echo [FAILED] Failed to install Docker MCP. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] Docker MCP installed successfully.
        echo [SUCCESS] Docker MCP installed successfully. >> %LOG_FILE%
        echo Testing Docker MCP...
        echo Testing Docker MCP... >> %LOG_FILE%
        npx -y @modelcontextprotocol/server-docker --help > logs\docker-mcp.log 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [FAILED] Docker MCP test failed.
            echo [FAILED] Docker MCP test failed. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] Docker MCP test passed.
            echo [SUCCESS] Docker MCP test passed. >> %LOG_FILE%
        )
    )
) else if /i "%MCP_NAME%"=="kubernetes" (
    echo Installing Kubernetes MCP...
    echo Installing Kubernetes MCP... >> %LOG_FILE%
    call npm install -g @modelcontextprotocol/server-kubernetes
    if !ERRORLEVEL! NEQ 0 (
        echo [FAILED] Failed to install Kubernetes MCP.
        echo [FAILED] Failed to install Kubernetes MCP. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] Kubernetes MCP installed successfully.
        echo [SUCCESS] Kubernetes MCP installed successfully. >> %LOG_FILE%
        echo Testing Kubernetes MCP...
        echo Testing Kubernetes MCP... >> %LOG_FILE%
        npx -y @modelcontextprotocol/server-kubernetes --help > logs\kubernetes-mcp.log 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [FAILED] Kubernetes MCP test failed.
            echo [FAILED] Kubernetes MCP test failed. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] Kubernetes MCP test passed.
            echo [SUCCESS] Kubernetes MCP test passed. >> %LOG_FILE%
        )
    )
) else if /i "%MCP_NAME%"=="eslint" (
    echo Installing ESLint MCP...
    echo Installing ESLint MCP... >> %LOG_FILE%
    call npm install -g @modelcontextprotocol/server-eslint
    if !ERRORLEVEL! NEQ 0 (
        echo [FAILED] Failed to install ESLint MCP.
        echo [FAILED] Failed to install ESLint MCP. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] ESLint MCP installed successfully.
        echo [SUCCESS] ESLint MCP installed successfully. >> %LOG_FILE%
        echo Testing ESLint MCP...
        echo Testing ESLint MCP... >> %LOG_FILE%
        npx -y @modelcontextprotocol/server-eslint --help > logs\eslint-mcp.log 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [FAILED] ESLint MCP test failed.
            echo [FAILED] ESLint MCP test failed. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] ESLint MCP test passed.
            echo [SUCCESS] ESLint MCP test passed. >> %LOG_FILE%
        )
    )
) else if /i "%MCP_NAME%"=="typescript" (
    echo Installing TypeScript MCP...
    echo Installing TypeScript MCP... >> %LOG_FILE%
    call npm install -g @modelcontextprotocol/server-typescript
    if !ERRORLEVEL! NEQ 0 (
        echo [FAILED] Failed to install TypeScript MCP.
        echo [FAILED] Failed to install TypeScript MCP. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] TypeScript MCP installed successfully.
        echo [SUCCESS] TypeScript MCP installed successfully. >> %LOG_FILE%
        echo Testing TypeScript MCP...
        echo Testing TypeScript MCP... >> %LOG_FILE%
        npx -y @modelcontextprotocol/server-typescript --help > logs\typescript-mcp.log 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [FAILED] TypeScript MCP test failed.
            echo [FAILED] TypeScript MCP test failed. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] TypeScript MCP test passed.
            echo [SUCCESS] TypeScript MCP test passed. >> %LOG_FILE%
        )
    )
) else if /i "%MCP_NAME%"=="prettier" (
    echo Installing Prettier MCP...
    echo Installing Prettier MCP... >> %LOG_FILE%
    call npm install -g @modelcontextprotocol/server-prettier
    if !ERRORLEVEL! NEQ 0 (
        echo [FAILED] Failed to install Prettier MCP.
        echo [FAILED] Failed to install Prettier MCP. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] Prettier MCP installed successfully.
        echo [SUCCESS] Prettier MCP installed successfully. >> %LOG_FILE%
        echo Testing Prettier MCP...
        echo Testing Prettier MCP... >> %LOG_FILE%
        npx -y @modelcontextprotocol/server-prettier --help > logs\prettier-mcp.log 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [FAILED] Prettier MCP test failed.
            echo [FAILED] Prettier MCP test failed. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] Prettier MCP test passed.
            echo [SUCCESS] Prettier MCP test passed. >> %LOG_FILE%
        )
    )
) else if /i "%MCP_NAME%"=="jest" (
    echo Installing Jest MCP...
    echo Installing Jest MCP... >> %LOG_FILE%
    call npm install -g @modelcontextprotocol/server-jest
    if !ERRORLEVEL! NEQ 0 (
        echo [FAILED] Failed to install Jest MCP.
        echo [FAILED] Failed to install Jest MCP. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] Jest MCP installed successfully.
        echo [SUCCESS] Jest MCP installed successfully. >> %LOG_FILE%
        echo Testing Jest MCP...
        echo Testing Jest MCP... >> %LOG_FILE%
        npx -y @modelcontextprotocol/server-jest --help > logs\jest-mcp.log 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [FAILED] Jest MCP test failed.
            echo [FAILED] Jest MCP test failed. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] Jest MCP test passed.
            echo [SUCCESS] Jest MCP test passed. >> %LOG_FILE%
        )
    )
) else if /i "%MCP_NAME%"=="langchain" (
    echo Installing Langchain MCP...
    echo Installing Langchain MCP... >> %LOG_FILE%
    call npm install -g @modelcontextprotocol/server-langchain
    if !ERRORLEVEL! NEQ 0 (
        echo [FAILED] Failed to install Langchain MCP.
        echo [FAILED] Failed to install Langchain MCP. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] Langchain MCP installed successfully.
        echo [SUCCESS] Langchain MCP installed successfully. >> %LOG_FILE%
        echo Testing Langchain MCP...
        echo Testing Langchain MCP... >> %LOG_FILE%
        npx -y @modelcontextprotocol/server-langchain --help > logs\langchain-mcp.log 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [FAILED] Langchain MCP test failed.
            echo [FAILED] Langchain MCP test failed. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] Langchain MCP test passed.
            echo [SUCCESS] Langchain MCP test passed. >> %LOG_FILE%
        )
    )
) else if /i "%MCP_NAME%"=="vscode" (
    echo Installing VSCode MCP...
    echo Installing VSCode MCP... >> %LOG_FILE%
    call npm install -g @modelcontextprotocol/server-vscode
    if !ERRORLEVEL! NEQ 0 (
        echo [FAILED] Failed to install VSCode MCP.
        echo [FAILED] Failed to install VSCode MCP. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] VSCode MCP installed successfully.
        echo [SUCCESS] VSCode MCP installed successfully. >> %LOG_FILE%
        echo Testing VSCode MCP...
        echo Testing VSCode MCP... >> %LOG_FILE%
        npx -y @modelcontextprotocol/server-vscode --help > logs\vscode-mcp.log 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [FAILED] VSCode MCP test failed.
            echo [FAILED] VSCode MCP test failed. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] VSCode MCP test passed.
            echo [SUCCESS] VSCode MCP test passed. >> %LOG_FILE%
        )
    )
) else if /i "%MCP_NAME%"=="qdrant" (
    echo Installing Qdrant MCP...
    echo Installing Qdrant MCP... >> %LOG_FILE%
    call pip install qdrant-mcp
    if !ERRORLEVEL! NEQ 0 (
        echo [FAILED] Failed to install Qdrant MCP.
        echo [FAILED] Failed to install Qdrant MCP. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] Qdrant MCP installed successfully.
        echo [SUCCESS] Qdrant MCP installed successfully. >> %LOG_FILE%
        echo Testing Qdrant MCP...
        echo Testing Qdrant MCP... >> %LOG_FILE%
        python -m qdrant_mcp --help > logs\qdrant-mcp.log 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [FAILED] Qdrant MCP test failed.
            echo [FAILED] Qdrant MCP test failed. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] Qdrant MCP test passed.
            echo [SUCCESS] Qdrant MCP test passed. >> %LOG_FILE%
        )
    )
) else if /i "%MCP_NAME%"=="semgrep" (
    echo Installing Semgrep MCP...
    echo Installing Semgrep MCP... >> %LOG_FILE%
    call pip install semgrep-mcp
    if !ERRORLEVEL! NEQ 0 (
        echo [FAILED] Failed to install Semgrep MCP.
        echo [FAILED] Failed to install Semgrep MCP. >> %LOG_FILE%
    ) else (
        echo [SUCCESS] Semgrep MCP installed successfully.
        echo [SUCCESS] Semgrep MCP installed successfully. >> %LOG_FILE%
        echo Testing Semgrep MCP...
        echo Testing Semgrep MCP... >> %LOG_FILE%
        python -m semgrep_mcp --help > logs\semgrep-mcp.log 2>&1
        if !ERRORLEVEL! NEQ 0 (
            echo [FAILED] Semgrep MCP test failed.
            echo [FAILED] Semgrep MCP test failed. >> %LOG_FILE%
        ) else (
            echo [SUCCESS] Semgrep MCP test passed.
            echo [SUCCESS] Semgrep MCP test passed. >> %LOG_FILE%
        )
    )
) else (
    echo Unknown MCP name: %MCP_NAME%
    echo Usage: install-individual-mcp.bat [mcp-name]
    echo.
    echo Available MCP names:
    echo   docker       - Docker MCP
    echo   kubernetes   - Kubernetes MCP
    echo   eslint       - ESLint MCP
    echo   typescript   - TypeScript MCP
    echo   prettier     - Prettier MCP
    echo   jest         - Jest MCP
    echo   langchain    - Langchain MCP
    echo   vscode       - VSCode MCP
    echo   qdrant       - Qdrant MCP
    echo   semgrep      - Semgrep MCP
    echo.
    exit /b 1
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
