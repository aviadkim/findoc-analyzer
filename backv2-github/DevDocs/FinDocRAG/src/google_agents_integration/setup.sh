#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Create directories
echo -e "${BLUE}Creating necessary directories...${NC}"
directories=(
    "uploads"
    "temp"
    "results"
    ".github/workflows"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo -e "${GREEN}Created directory: $dir${NC}"
    else
        echo -e "${YELLOW}Directory already exists: $dir${NC}"
    fi
done

# Create virtual environment
echo -e "${BLUE}Creating Python virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}Created virtual environment: venv${NC}"
else
    echo -e "${YELLOW}Virtual environment already exists: venv${NC}"
fi

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
pip install -r requirements.txt

# Create .env file
echo -e "${BLUE}Creating .env file...${NC}"
cat > .env << EOL
# Google Agent Technologies Configuration
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
UPLOAD_FOLDER=./uploads
TEMP_FOLDER=./temp
RESULTS_FOLDER=./results
EOL

echo -e "${GREEN}Created .env file. Please update it with your actual API keys.${NC}"

# Create Google credentials placeholder
echo -e "${BLUE}Creating Google credentials placeholder...${NC}"
cat > google-credentials.json << EOL
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "your-private-key",
  "client_email": "your-client-email",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "your-client-x509-cert-url"
}
EOL

echo -e "${GREEN}Created google-credentials.json placeholder. Please update it with your actual Google Cloud credentials.${NC}"

# Set up Memory MCP integration
echo -e "${BLUE}Setting up Memory MCP integration...${NC}"
MEMORY_MCP_PATH="$HOME/OneDrive/Desktop/MCP/mcp-packages/custom-mcps/memory-mcp.js"

if [ -f "$MEMORY_MCP_PATH" ]; then
    echo -e "${GREEN}Found Memory MCP at: $MEMORY_MCP_PATH${NC}"
    
    # Create a shell script to start the Memory MCP
    cat > start-memory-mcp.sh << EOL
#!/bin/bash
echo "Starting Memory MCP..."
node "$MEMORY_MCP_PATH"
EOL

    chmod +x start-memory-mcp.sh
    echo -e "${GREEN}Created start-memory-mcp.sh to start the Memory MCP.${NC}"
else
    echo -e "${YELLOW}Memory MCP not found at: $MEMORY_MCP_PATH${NC}"
    echo -e "${YELLOW}You may need to update the path in this script.${NC}"
fi

# Create a shell script to start the development server
echo -e "${BLUE}Creating start script...${NC}"
cat > start-server.sh << EOL
#!/bin/bash
echo "Starting development server..."
source venv/bin/activate
python app.py
EOL

chmod +x start-server.sh
echo -e "${GREEN}Created start-server.sh to start the development server.${NC}"

# Create a shell script to run tests
echo -e "${BLUE}Creating test script...${NC}"
cat > run-tests.sh << EOL
#!/bin/bash
echo "Running tests..."
source venv/bin/activate
python -m pytest tests/
EOL

chmod +x run-tests.sh
echo -e "${GREEN}Created run-tests.sh to run tests.${NC}"

# Create a shell script to start all components
echo -e "${BLUE}Creating start-all script...${NC}"
cat > start-all.sh << EOL
#!/bin/bash
echo "Starting all components..."
./start-memory-mcp.sh &
sleep 5
./start-server.sh &
EOL

chmod +x start-all.sh
echo -e "${GREEN}Created start-all.sh to start all components.${NC}"

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}Next steps:${NC}"
echo -e "${GREEN}1. Update the .env file with your Gemini API key${NC}"
echo -e "${GREEN}2. Update google-credentials.json with your Google Cloud credentials${NC}"
echo -e "${GREEN}3. Run ./start-all.sh to start all components${NC}"
echo -e "${GREEN}4. Access the application at http://localhost:8080${NC}"
