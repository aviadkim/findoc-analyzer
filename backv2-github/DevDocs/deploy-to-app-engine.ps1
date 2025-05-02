# Deploy to Google App Engine Script
# This script deploys the DevDocs application to Google App Engine

Write-Host "====================================================="
Write-Host "Deploying DevDocs to Google App Engine"
Write-Host "====================================================="

# Set environment variables
$env:NODE_ENV = "production"

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version
    Write-Host "Google Cloud SDK is installed."
} catch {
    Write-Host "Error: Google Cloud SDK (gcloud) is not installed or not in PATH."
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Check if user is logged in
try {
    $account = gcloud auth list --filter=status:ACTIVE --format="value(account)"
    if (-not $account) {
        Write-Host "You are not logged in to Google Cloud. Please log in."
        gcloud auth login
    } else {
        Write-Host "Logged in as: $account"
    }
} catch {
    Write-Host "Error checking authentication status. Please log in."
    gcloud auth login
}

# Set the project
$project = "findoc-deploy"
Write-Host "Setting project to: $project"
gcloud config set project $project

# Create Gemini API key secret if it doesn't exist
$secretExists = gcloud secrets describe gemini-api-key 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating Gemini API key secret..."
    
    # Prompt for Gemini API key
    $geminiApiKey = Read-Host "Enter your Gemini API key"
    
    # Create the secret
    echo $geminiApiKey | gcloud secrets create gemini-api-key --data-file=-
    
    # Grant access to the App Engine service account
    $serviceAccount = "findoc-app@$project.iam.gserviceaccount.com"
    gcloud secrets add-iam-policy-binding gemini-api-key `
        --member="serviceAccount:$serviceAccount" `
        --role="roles/secretmanager.secretAccessor"
} else {
    Write-Host "Gemini API key secret already exists."
}

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Build the application
Write-Host "Building the application..."
npm run build

# Deploy to App Engine
Write-Host "Deploying to App Engine..."
gcloud app deploy app.yaml --quiet

# Open the deployed application
$url = "https://findoc-app.appspot.com"
Write-Host "Opening the deployed application at: $url"
Start-Process $url

Write-Host "====================================================="
Write-Host "Deployment completed!"
Write-Host "====================================================="
