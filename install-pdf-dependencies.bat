@echo off
REM Script to install all dependencies needed for PDF processing on Windows

echo Installing PDF processing dependencies...

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed. Please install Python 3.8+ before continuing.
    pause
    exit /b 1
) else (
    echo Python is already installed
    python --version
)

REM Install Python dependencies
echo Installing Python packages...
pip install pymupdf pandas camelot-py pdfplumber pytesseract opencv-python

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js before continuing.
    pause
    exit /b 1
) else (
    echo Node.js is already installed
    node --version
)

REM Install NPM packages
echo Installing NPM packages...
call npm install pdf-parse @pdf-lib/fontkit pdfjs-dist @modelcontextprotocol/server-sequential-thinking @modelcontextprotocol/brave-search-mcp

REM Create necessary directories
echo Creating necessary directories...
if not exist uploads mkdir uploads
if not exist temp mkdir temp
if not exist pdf-test-results mkdir pdf-test-results
if not exist mcp-logs mkdir mcp-logs

REM Check if brave-search MCP is installed
call npm list -g | findstr "@modelcontextprotocol/brave-search-mcp" >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing Brave Search MCP globally...
    call npm install -g @modelcontextprotocol/brave-search-mcp
) else (
    echo Brave Search MCP is already installed globally
)

REM Check if sequential-thinking MCP is installed
call npm list -g | findstr "@modelcontextprotocol/server-sequential-thinking" >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing Sequential Thinking MCP globally...
    call npm install -g @modelcontextprotocol/server-sequential-thinking
) else (
    echo Sequential Thinking MCP is already installed globally
)

echo Starting MCPs for document processing...
start "Sequential Thinking MCP" cmd /c "npx @modelcontextprotocol/server-sequential-thinking > mcp-logs\sequential-thinking.log 2>&1"
echo Started Sequential Thinking MCP

start "Brave Search MCP" cmd /c "npx @modelcontextprotocol/brave-search-mcp > mcp-logs\brave-search.log 2>&1"
echo Started Brave Search MCP

echo All dependencies installed successfully!
echo Run 'node test-pdf-optimized.js' to test PDF processing functionality.
pause