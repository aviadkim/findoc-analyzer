#!/bin/bash
# FinDoc Analyzer QA Fixes
# This script applies all QA fixes to the FinDoc Analyzer application.

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===================================================${NC}"
echo -e "${YELLOW}           FinDoc Analyzer QA Fixes               ${NC}"
echo -e "${YELLOW}===================================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo -e "${RED}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

# Run the apply-qa-fixes.js script
echo -e "${YELLOW}Applying QA fixes...${NC}"
node apply-qa-fixes.js

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to apply QA fixes.${NC}"
    exit 1
fi

echo -e "${YELLOW}===================================================${NC}"
echo -e "${GREEN}QA fixes applied successfully!${NC}"
echo -e "${GREEN}Please restart your server to apply the changes.${NC}"
echo -e "${YELLOW}===================================================${NC}"

# Prompt to restart the server
read -p "Do you want to restart the server now? (y/n): " restart
if [[ $restart =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Restarting server...${NC}"
    
    # Check if server is running
    if pgrep -f "node server.js" > /dev/null; then
        # Kill existing Node.js processes
        echo -e "${YELLOW}Stopping existing Node.js processes...${NC}"
        pkill -f "node server.js"
    fi
    
    # Start the server
    echo -e "${YELLOW}Starting server...${NC}"
    node server.js > server.log 2>&1 &
    
    echo -e "${GREEN}Server restarted successfully!${NC}"
else
    echo -e "${YELLOW}Please restart the server manually to apply the changes.${NC}"
fi
