# PowerShell script to set up the development environment for Google Agent technologies

# Colors for output
$GREEN = "Green"
$BLUE = "Blue"
$RED = "Red"
$YELLOW = "Yellow"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Create directories
Write-ColorOutput $BLUE "Creating necessary directories..."
$directories = @(
    "uploads",
    "temp",
    "results",
    ".github/workflows"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-ColorOutput $GREEN "Created directory: $dir"
    } else {
        Write-ColorOutput $YELLOW "Directory already exists: $dir"
    }
}

# Create virtual environment
Write-ColorOutput $BLUE "Creating Python virtual environment..."
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-ColorOutput $GREEN "Created virtual environment: venv"
} else {
    Write-ColorOutput $YELLOW "Virtual environment already exists: venv"
}

# Activate virtual environment
Write-ColorOutput $BLUE "Activating virtual environment..."
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-ColorOutput $BLUE "Installing dependencies..."
pip install -r requirements.txt

# Create .env file
Write-ColorOutput $BLUE "Creating .env file..."
$envContent = @"
# Google Agent Technologies Configuration
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
UPLOAD_FOLDER=./uploads
TEMP_FOLDER=./temp
RESULTS_FOLDER=./results
"@

Set-Content -Path ".env" -Value $envContent
Write-ColorOutput $GREEN "Created .env file. Please update it with your actual API keys."

# Create Google credentials placeholder
Write-ColorOutput $BLUE "Creating Google credentials placeholder..."
$credentialsContent = @"
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
"@

Set-Content -Path "google-credentials.json" -Value $credentialsContent
Write-ColorOutput $GREEN "Created google-credentials.json placeholder. Please update it with your actual Google Cloud credentials."

# Set up Memory MCP integration
Write-ColorOutput $BLUE "Setting up Memory MCP integration..."
$memoryMcpPath = "C:/Users/aviad/OneDrive/Desktop/MCP/mcp-packages/custom-mcps/memory-mcp.js"

if (Test-Path $memoryMcpPath) {
    Write-ColorOutput $GREEN "Found Memory MCP at: $memoryMcpPath"
    
    # Create a batch file to start the Memory MCP
    $startMemoryMcpContent = @"
@echo off
echo Starting Memory MCP...
node "$memoryMcpPath"
"@

    Set-Content -Path "start-memory-mcp.bat" -Value $startMemoryMcpContent
    Write-ColorOutput $GREEN "Created start-memory-mcp.bat to start the Memory MCP."
} else {
    Write-ColorOutput $YELLOW "Memory MCP not found at: $memoryMcpPath"
    Write-ColorOutput $YELLOW "You may need to update the path in this script."
}

# Create a batch file to start the development server
Write-ColorOutput $BLUE "Creating start script..."
$startServerContent = @"
@echo off
echo Starting development server...
call .\venv\Scripts\activate.bat
python app.py
"@

Set-Content -Path "start-server.bat" -Value $startServerContent
Write-ColorOutput $GREEN "Created start-server.bat to start the development server."

# Create a batch file to run tests
Write-ColorOutput $BLUE "Creating test script..."
$runTestsContent = @"
@echo off
echo Running tests...
call .\venv\Scripts\activate.bat
python -m pytest tests/
"@

Set-Content -Path "run-tests.bat" -Value $runTestsContent
Write-ColorOutput $GREEN "Created run-tests.bat to run tests."

# Create a batch file to start all components
Write-ColorOutput $BLUE "Creating start-all script..."
$startAllContent = @"
@echo off
echo Starting all components...
start cmd /k "start-memory-mcp.bat"
timeout /t 5
start cmd /k "start-server.bat"
"@

Set-Content -Path "start-all.bat" -Value $startAllContent
Write-ColorOutput $GREEN "Created start-all.bat to start all components."

Write-ColorOutput $GREEN "Setup complete!"
Write-ColorOutput $GREEN "Next steps:"
Write-ColorOutput $GREEN "1. Update the .env file with your Gemini API key"
Write-ColorOutput $GREEN "2. Update google-credentials.json with your Google Cloud credentials"
Write-ColorOutput $GREEN "3. Run start-all.bat to start all components"
Write-ColorOutput $GREEN "4. Access the application at http://localhost:8080"
