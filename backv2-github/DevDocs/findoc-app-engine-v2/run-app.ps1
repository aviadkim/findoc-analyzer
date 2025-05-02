# Run FinDoc Analyzer App

# Set environment variables
$env:PORT = 3000
$env:NODE_ENV = "development"
$env:SUPABASE_URL = "https://dnjnsotemnfrjlotgved.supabase.co"
$env:SUPABASE_KEY = "your-supabase-key"
$env:JWT_SECRET = "your-jwt-secret"
$env:GEMINI_API_KEY = "your-gemini-api-key"

# Install dependencies if needed
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

# Start the application
Write-Host "Starting FinDoc Analyzer..."
npm start
