# PowerShell script to set up the development environment

# Create a .env file for Docker Compose
$envContent = @"
# Google Cloud Configuration
GEMINI_API_KEY=your_gemini_api_key
"@

# Write the .env file
Set-Content -Path ".env" -Value $envContent

Write-Host "Created .env file. Please update it with your actual API keys."

# Check if Docker is installed
try {
    docker --version
    Write-Host "Docker is installed."
} catch {
    Write-Host "Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version
    Write-Host "Docker Compose is installed."
} catch {
    Write-Host "Docker Compose is not installed. It should be included with Docker Desktop."
    exit 1
}

# Create Google Cloud credentials placeholder
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

# Write the credentials file
Set-Content -Path "google-credentials.json" -Value $credentialsContent

Write-Host "Created google-credentials.json placeholder. Please update it with your actual Google Cloud credentials."

# Build and start the development environment
Write-Host "Building and starting the development environment..."
docker-compose -f docker-compose.dev.yml up -d --build

Write-Host "Development environment is now running."
Write-Host "You can access the application at http://localhost:8080"
Write-Host "To stop the environment, run: docker-compose -f docker-compose.dev.yml down"
