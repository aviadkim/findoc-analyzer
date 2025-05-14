#!/bin/bash
# Script to install all dependencies needed for PDF processing

echo "Installing PDF processing dependencies..."

# Check if Python is installed
if command -v python3 &>/dev/null; then
    echo "Python 3 is already installed"
    python3 --version
else
    echo "Python 3 is not installed. Installing..."
    apt-get update
    apt-get install -y python3 python3-pip
fi

# Install Python dependencies
echo "Installing Python packages..."
pip3 install pymupdf pandas camelot-py pdfplumber pytesseract opencv-python

# Check if Node.js is installed
if command -v node &>/dev/null; then
    echo "Node.js is already installed"
    node --version
else
    echo "Node.js is not installed. Please install Node.js before continuing."
    exit 1
fi

# Install NPM packages
echo "Installing NPM packages..."
npm install pdf-parse @pdf-lib/fontkit pdfjs-dist @modelcontextprotocol/server-sequential-thinking @modelcontextprotocol/brave-search-mcp

# Install OCR tools
echo "Installing OCR tools..."
apt-get update
apt-get install -y tesseract-ocr poppler-utils

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p uploads temp pdf-test-results

# Check if brave-search MCP is installed
if npm list -g | grep -q "@modelcontextprotocol/brave-search-mcp"; then
    echo "Brave Search MCP is already installed globally"
else
    echo "Installing Brave Search MCP globally..."
    npm install -g @modelcontextprotocol/brave-search-mcp
fi

# Check if sequential-thinking MCP is installed
if npm list -g | grep -q "@modelcontextprotocol/server-sequential-thinking"; then
    echo "Sequential Thinking MCP is already installed globally"
else
    echo "Installing Sequential Thinking MCP globally..."
    npm install -g @modelcontextprotocol/server-sequential-thinking
fi

echo "Starting MCPs for document processing..."
npx @modelcontextprotocol/server-sequential-thinking > ./mcp-logs/sequential-thinking.log 2>&1 &
echo $! > ./mcp-logs/sequential-thinking.pid
echo "Started Sequential Thinking MCP with PID $(cat ./mcp-logs/sequential-thinking.pid)"

npx @modelcontextprotocol/brave-search-mcp > ./mcp-logs/brave-search.log 2>&1 &
echo $! > ./mcp-logs/brave-search.pid
echo "Started Brave Search MCP with PID $(cat ./mcp-logs/brave-search.pid)"

echo "All dependencies installed successfully!"
echo "Run 'node test-pdf-optimized.js' to test PDF processing functionality."