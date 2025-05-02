@echo off
echo ===================================================
echo Installing MCP Servers (Alternative Methods)
echo ===================================================
echo.

cd C:\Users\aviad\OneDrive\Desktop\MCP

REM Create logs directory if it doesn't exist
mkdir logs 2>nul

echo Installing Docker MCP (Alternative)...
call npm install -g @modelcontextprotocol/server-docker
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install @modelcontextprotocol/server-docker
    echo Trying alternative package...
    call npm install -g docker-mcp-server
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to install docker-mcp-server
    ) else (
        echo [SUCCESS] Installed docker-mcp-server
    )
) else (
    echo [SUCCESS] Installed @modelcontextprotocol/server-docker
)
echo.

echo Installing ESLint MCP (Alternative)...
call npm install -g @modelcontextprotocol/server-eslint
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install @modelcontextprotocol/server-eslint
    echo Trying alternative package...
    call npm install -g eslint-mcp-server
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to install eslint-mcp-server
    ) else (
        echo [SUCCESS] Installed eslint-mcp-server
    )
) else (
    echo [SUCCESS] Installed @modelcontextprotocol/server-eslint
)
echo.

echo Installing TypeScript MCP (Alternative)...
call npm install -g @modelcontextprotocol/server-typescript
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install @modelcontextprotocol/server-typescript
    echo Trying alternative package...
    call npm install -g typescript-mcp-server
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to install typescript-mcp-server
    ) else (
        echo [SUCCESS] Installed typescript-mcp-server
    )
) else (
    echo [SUCCESS] Installed @modelcontextprotocol/server-typescript
)
echo.

echo Installing Prettier MCP (Alternative)...
call npm install -g @modelcontextprotocol/server-prettier
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install @modelcontextprotocol/server-prettier
    echo Trying alternative package...
    call npm install -g prettier-mcp-server
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to install prettier-mcp-server
    ) else (
        echo [SUCCESS] Installed prettier-mcp-server
    )
) else (
    echo [SUCCESS] Installed @modelcontextprotocol/server-prettier
)
echo.

echo Installing Jest MCP (Alternative)...
call npm install -g @modelcontextprotocol/server-jest
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install @modelcontextprotocol/server-jest
    echo Trying alternative package...
    call npm install -g jest-mcp-server
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to install jest-mcp-server
    ) else (
        echo [SUCCESS] Installed jest-mcp-server
    )
) else (
    echo [SUCCESS] Installed @modelcontextprotocol/server-jest
)
echo.

echo Installing Langchain MCP (Alternative)...
call npm install -g @modelcontextprotocol/server-langchain
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install @modelcontextprotocol/server-langchain
    echo Trying alternative package...
    call npm install -g langchain-mcp-server
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to install langchain-mcp-server
    ) else (
        echo [SUCCESS] Installed langchain-mcp-server
    )
) else (
    echo [SUCCESS] Installed @modelcontextprotocol/server-langchain
)
echo.

echo Installing Qdrant MCP (Alternative)...
echo Trying to install qdrant-mcp with pip...
call pip install qdrant-mcp --force-reinstall
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Failed to install qdrant-mcp with pip
    echo Trying to install from GitHub...
    call pip install git+https://github.com/modelcontextprotocol/server-qdrant.git
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] Failed to install from GitHub
    ) else (
        echo [SUCCESS] Installed qdrant-mcp from GitHub
    )
) else (
    echo [SUCCESS] Installed qdrant-mcp with pip
)
echo.

echo ===================================================
echo Testing MCP Servers
echo ===================================================
echo.

echo Testing Docker MCP...
call npx -y @modelcontextprotocol/server-docker --help > logs\docker-mcp-test.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] @modelcontextprotocol/server-docker test failed
    echo Trying alternative...
    call npx -y docker-mcp-server --help > logs\docker-mcp-server-test.log 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] docker-mcp-server test failed
    ) else (
        echo [SUCCESS] docker-mcp-server test passed
    )
) else (
    echo [SUCCESS] @modelcontextprotocol/server-docker test passed
)
echo.

echo Testing ESLint MCP...
call npx -y @modelcontextprotocol/server-eslint --help > logs\eslint-mcp-test.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] @modelcontextprotocol/server-eslint test failed
    echo Trying alternative...
    call npx -y eslint-mcp-server --help > logs\eslint-mcp-server-test.log 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] eslint-mcp-server test failed
    ) else (
        echo [SUCCESS] eslint-mcp-server test passed
    )
) else (
    echo [SUCCESS] @modelcontextprotocol/server-eslint test passed
)
echo.

echo Testing TypeScript MCP...
call npx -y @modelcontextprotocol/server-typescript --help > logs\typescript-mcp-test.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] @modelcontextprotocol/server-typescript test failed
    echo Trying alternative...
    call npx -y typescript-mcp-server --help > logs\typescript-mcp-server-test.log 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] typescript-mcp-server test failed
    ) else (
        echo [SUCCESS] typescript-mcp-server test passed
    )
) else (
    echo [SUCCESS] @modelcontextprotocol/server-typescript test passed
)
echo.

echo Testing Prettier MCP...
call npx -y @modelcontextprotocol/server-prettier --help > logs\prettier-mcp-test.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] @modelcontextprotocol/server-prettier test failed
    echo Trying alternative...
    call npx -y prettier-mcp-server --help > logs\prettier-mcp-server-test.log 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] prettier-mcp-server test failed
    ) else (
        echo [SUCCESS] prettier-mcp-server test passed
    )
) else (
    echo [SUCCESS] @modelcontextprotocol/server-prettier test passed
)
echo.

echo Testing Jest MCP...
call npx -y @modelcontextprotocol/server-jest --help > logs\jest-mcp-test.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] @modelcontextprotocol/server-jest test failed
    echo Trying alternative...
    call npx -y jest-mcp-server --help > logs\jest-mcp-server-test.log 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] jest-mcp-server test failed
    ) else (
        echo [SUCCESS] jest-mcp-server test passed
    )
) else (
    echo [SUCCESS] @modelcontextprotocol/server-jest test passed
)
echo.

echo Testing Langchain MCP...
call npx -y @modelcontextprotocol/server-langchain --help > logs\langchain-mcp-test.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] @modelcontextprotocol/server-langchain test failed
    echo Trying alternative...
    call npx -y langchain-mcp-server --help > logs\langchain-mcp-server-test.log 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] langchain-mcp-server test failed
    ) else (
        echo [SUCCESS] langchain-mcp-server test passed
    )
) else (
    echo [SUCCESS] @modelcontextprotocol/server-langchain test passed
)
echo.

echo Testing Qdrant MCP...
call python -m qdrant_mcp --help > logs\qdrant-mcp-test.log 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] qdrant_mcp test failed
) else (
    echo [SUCCESS] qdrant_mcp test passed
)
echo.

echo ===================================================
echo Installation and Testing Complete!
echo ===================================================
echo.
echo Check the logs directory for detailed test results.
echo.

pause
