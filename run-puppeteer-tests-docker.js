/**
 * Run Puppeteer Tests in Docker
 * 
 * This script creates a Docker Compose file and runs the Puppeteer tests in a Docker container
 * with all the necessary dependencies installed.
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Create Docker Compose file
const dockerComposeYml = `
version: '3'
services:
  test-runner:
    extra_hosts:
      - "host.docker.internal:host-gateway"
    image: node:18
    working_dir: /app
    volumes:
      - ./:/app
    command: >
      bash -c "
        apt-get update &&
        apt-get install -y wget gnupg ca-certificates procps libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxfixes3 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libatk1.0-0 libatk-bridge2.0-0 libpangocairo-1.0-0 libgtk-3-0 libgbm1 &&
        wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - &&
        echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' > /etc/apt/sources.list.d/google.list &&
        apt-get update &&
        apt-get install -y google-chrome-stable &&
        npm install puppeteer &&
        mkdir -p chat-test-screenshots &&
        chmod 777 chat-test-screenshots &&
        node puppeteer-chat-document-test.js
      "
    environment:
      - PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
      - IN_DOCKER=true
      - HOST_URL=http://host.docker.internal:8080
`;

// Save the Docker Compose file
fs.writeFileSync('docker-compose.puppeteer.yml', dockerComposeYml);
console.log('Created Docker Compose file');

// Function to run a command and capture output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    throw error;
  }
}

// Make sure the server is running
console.log('Checking if server is running at http://localhost:8080...');
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8080');
  if (response.toString().trim() !== '200') {
    console.error('Server is not running at http://localhost:8080');
    console.log('Please make sure the server is running and accessible from Docker');
    process.exit(1);
  }
  console.log('Server is running');
} catch (error) {
  console.error('Failed to check server status');
  console.error(error);
  process.exit(1);
}

// Run the Docker Compose command
console.log('Running Puppeteer tests in Docker...');
try {
  runCommand('docker-compose -f docker-compose.puppeteer.yml up --build');
  
  // Clean up
  console.log('Cleaning up...');
  runCommand('docker-compose -f docker-compose.puppeteer.yml down');
  
  console.log('Tests completed!');
  console.log('Check the output above for test results');
} catch (error) {
  console.error('Failed to run tests in Docker');
}