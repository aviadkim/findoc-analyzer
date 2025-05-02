@echo off
echo ===================================================
echo Installing All MCP Dependencies
echo ===================================================
echo.

cd C:\Users\aviad\OneDrive\Desktop\MCP

echo Installing Docker MCP...
call npm install -g @docker/cli-mcp
echo.

echo Installing Kubernetes MCP...
call npm install -g kubernetes-mcp-server
echo.

echo Installing ESLint MCP...
call npm install -g eslint-mcp
echo.

echo Installing TypeScript MCP...
call npm install -g typescript-mcp
echo.

echo Installing Prettier MCP...
call npm install -g prettier-mcp
echo.

echo Installing Jest MCP...
call npm install -g jest-mcp
echo.

echo Installing Langchain MCP...
call npm install -g langchain-mcp
echo.

echo Installing Qdrant MCP...
call pip install qdrant-mcp
echo.

echo Installing Semgrep MCP...
call pip install semgrep-mcp
echo.

echo ===================================================
echo Testing MCP Servers
echo ===================================================
echo.

echo Testing Docker MCP...
call npx -y @docker/cli-mcp --help
echo.

echo Testing Kubernetes MCP...
call npx -y kubernetes-mcp-server --help
echo.

echo Testing ESLint MCP...
call npx -y eslint-mcp --help
echo.

echo Testing TypeScript MCP...
call npx -y typescript-mcp --help
echo.

echo Testing Prettier MCP...
call npx -y prettier-mcp --help
echo.

echo Testing Jest MCP...
call npx -y jest-mcp --help
echo.

echo Testing Langchain MCP...
call npx -y langchain-mcp --help
echo.

echo Testing Qdrant MCP...
call python -m qdrant_mcp --help
echo.

echo Testing Semgrep MCP...
call python -m semgrep_mcp --help
echo.

echo ===================================================
echo Installation and Testing Complete!
echo ===================================================
echo.

pause
