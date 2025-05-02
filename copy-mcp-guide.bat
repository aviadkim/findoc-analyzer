@echo off
echo ===================================================
echo Copying MCP Guide to MCP Folder
echo ===================================================
echo.

set MCP_FOLDER=C:\Users\aviad\OneDrive\Desktop\MCP
set DOCS_FOLDER=%MCP_FOLDER%\docs

echo Creating directories if they don't exist...
mkdir "%MCP_FOLDER%" 2>nul
mkdir "%DOCS_FOLDER%" 2>nul
echo Directories created.
echo.

echo Copying MCP guide...
copy /Y "AI-MCP-USAGE-GUIDE.md" "%DOCS_FOLDER%\AI-MCP-USAGE-GUIDE.md"
echo MCP guide copied.
echo.

echo ===================================================
echo Copy Complete!
echo ===================================================
echo.
echo The AI MCP Usage Guide has been copied to:
echo %DOCS_FOLDER%\AI-MCP-USAGE-GUIDE.md
echo.
echo Press any key to exit...
pause > nul
