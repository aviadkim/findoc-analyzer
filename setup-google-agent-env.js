/**
 * Script to set up the development environment for Google Agent technologies
 * 
 * This script:
 * 1. Creates the necessary directories
 * 2. Creates configuration files
 * 3. Installs required dependencies
 * 4. Sets up the environment for development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const PROJECT_DIR = path.join(process.cwd(), 'backv2-github', 'DevDocs', 'FinDocRAG', 'src', 'google_agents_integration');
const UPLOAD_DIR = path.join(PROJECT_DIR, 'uploads');
const TEMP_DIR = path.join(PROJECT_DIR, 'temp');
const RESULTS_DIR = path.join(PROJECT_DIR, 'results');
const ENV_FILE = path.join(PROJECT_DIR, '.env');
const REQUIREMENTS_FILE = path.join(PROJECT_DIR, 'requirements.txt');

// Create directories if they don't exist
console.log('\n=== Creating directories ===');
[PROJECT_DIR, UPLOAD_DIR, TEMP_DIR, RESULTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

// Create .env file
console.log('\n=== Creating .env file ===');
const envContent = `# Google Agent Technologies Configuration
GEMINI_API_KEY=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
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
UPLOAD_FOLDER=./uploads
TEMP_FOLDER=./temp
RESULTS_FOLDER=./results
`;

fs.writeFileSync(ENV_FILE, envContent);
console.log(`Created .env file: ${ENV_FILE}`);

// Create requirements.txt file
console.log('\n=== Creating requirements.txt file ===');
const requirementsContent = `# Core dependencies
flask==2.3.3
flask-cors==4.0.0
gunicorn==21.2.0

# Google Agent Technologies
google-generativeai==0.3.1
python-dotenv==1.0.0
requests==2.31.0
pydantic==2.5.2

# Document processing
pymupdf==1.23.8
pdf2image==1.16.3
pytesseract==0.3.10
pandas==2.1.1
numpy==1.26.0

# Table extraction
camelot-py==0.11.0
tabula-py==2.8.2
opencv-python-headless==4.8.1.78

# Excel processing
openpyxl==3.1.2
`;

fs.writeFileSync(REQUIREMENTS_FILE, requirementsContent);
console.log(`Created requirements.txt file: ${REQUIREMENTS_FILE}`);

// Create Google credentials placeholder
console.log('\n=== Creating Google credentials placeholder ===');
const credentialsContent = `{
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
}`;

const credentialsFile = path.join(PROJECT_DIR, 'google-credentials.json');
fs.writeFileSync(credentialsFile, credentialsContent);
console.log(`Created Google credentials placeholder: ${credentialsFile}`);

// Create start scripts
console.log('\n=== Creating start scripts ===');

// Windows batch file
const batchContent = `@echo off
echo Starting development server...
cd "${PROJECT_DIR}"
python app.py
`;

const batchFile = path.join(PROJECT_DIR, 'start-server.bat');
fs.writeFileSync(batchFile, batchContent);
console.log(`Created batch file: ${batchFile}`);

// Linux/macOS shell script
const shellContent = `#!/bin/bash
echo "Starting development server..."
cd "${PROJECT_DIR}"
python app.py
`;

const shellFile = path.join(PROJECT_DIR, 'start-server.sh');
fs.writeFileSync(shellFile, shellContent);
fs.chmodSync(shellFile, '755');
console.log(`Created shell script: ${shellFile}`);

// Create messos PDF processing script
console.log('\n=== Creating messos PDF processing script ===');
const messosScriptContent = `@echo off
echo Processing messos PDF...
cd "${PROJECT_DIR}"
python process_messos_pdf.py
`;

const messosScriptFile = path.join(PROJECT_DIR, 'process-messos.bat');
fs.writeFileSync(messosScriptFile, messosScriptContent);
console.log(`Created messos PDF processing script: ${messosScriptFile}`);

console.log('\n=== Setup Complete ===');
console.log('The development environment for Google Agent technologies has been set up.');
console.log('\nNext steps:');
console.log('1. Install Python dependencies: pip install -r requirements.txt');
console.log('2. Update the .env file with your Gemini API key');
console.log('3. Run the messos PDF processing script: process-messos.bat');
console.log('4. Start the development server: start-server.bat');
