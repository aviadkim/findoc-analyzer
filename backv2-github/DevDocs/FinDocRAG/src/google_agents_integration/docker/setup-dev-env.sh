#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create a .env file for Docker Compose
cat > .env << EOL
# Google Cloud Configuration
GEMINI_API_KEY=your_gemini_api_key
EOL

echo -e "${GREEN}Created .env file. Please update it with your actual API keys.${NC}"

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo -e "${GREEN}Docker is installed.${NC}"
else
    echo -e "${RED}Docker is not installed. Please install Docker from https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}Docker Compose is installed.${NC}"
elif docker compose version &> /dev/null; then
    echo -e "${GREEN}Docker Compose plugin is installed.${NC}"
else
    echo -e "${RED}Docker Compose is not installed. It should be included with Docker Desktop or as a plugin.${NC}"
    exit 1
fi

# Create Google Cloud credentials placeholder
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

# Build and start the development environment
echo -e "${BLUE}Building and starting the development environment...${NC}"

# Detect which docker compose command to use
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

$DOCKER_COMPOSE -f docker-compose.dev.yml up -d --build

echo -e "${GREEN}Development environment is now running.${NC}"
echo -e "${BLUE}You can access the application at http://localhost:8080${NC}"
echo -e "${BLUE}To stop the environment, run: $DOCKER_COMPOSE -f docker-compose.dev.yml down${NC}"
