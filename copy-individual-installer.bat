@echo off
echo Copying individual MCP installer to MCP folder...
copy /Y install-individual-mcp.bat C:\Users\aviad\OneDrive\Desktop\MCP\install-individual-mcp.bat
echo Done!
echo.
echo To install an individual MCP:
echo 1. Navigate to C:\Users\aviad\OneDrive\Desktop\MCP
echo 2. Run install-individual-mcp.bat [mcp-name]
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
echo Press any key to exit...
pause > nul
