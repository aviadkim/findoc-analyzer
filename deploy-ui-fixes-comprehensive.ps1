# FinDoc Analyzer UI Fixes Comprehensive Deployment Script
# This script ensures that UI fixes are properly included in the deployed application

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-ui-fixes-$timestamp.log"
$region = "me-west1"
$serviceName = "backv2-app"

# Create log function
function Log-Message {
    param (
        [string]$message
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $message"
    
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

# Start deployment
Log-Message "Starting comprehensive UI fixes deployment..."

# Check if UI components files exist
Log-Message "Checking UI components files..."
if (-not (Test-Path "public/js/ui-components.js")) {
    Log-Message "Error: UI components file not found: public/js/ui-components.js"
    exit 1
}
if (-not (Test-Path "public/js/ui-validator.js")) {
    Log-Message "Error: UI validator file not found: public/js/ui-validator.js"
    exit 1
}

# Update all HTML files to include UI components
Log-Message "Updating all HTML files to include UI components..."
$htmlFiles = Get-ChildItem -Path "public" -Filter "*.html" -Recurse

foreach ($file in $htmlFiles) {
    $filePath = $file.FullName
    $fileContent = Get-Content -Path $filePath -Raw
    
    if (-not $fileContent.Contains("ui-components.js")) {
        Log-Message "Adding UI components script to $($file.Name)..."
        $headEndPos = $fileContent.IndexOf("</head>")
        if ($headEndPos -gt 0) {
            $newFileContent = $fileContent.Substring(0, $headEndPos) + 
                "`n    <script src='/js/ui-components.js'></script>" +
                "`n    <script src='/js/ui-validator.js'></script>" +
                $fileContent.Substring($headEndPos)
            
            Set-Content -Path $filePath -Value $newFileContent
            Log-Message "Updated $($file.Name) with UI components scripts"
        } else {
            Log-Message "Warning: Could not find </head> tag in $($file.Name)"
        }
    } else {
        Log-Message "UI components scripts already included in $($file.Name)"
    }
}

# Create a custom Dockerfile that ensures UI components are included
Log-Message "Creating custom Dockerfile..."
$dockerfileContent = @"
FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Make sure UI components are in the right place
RUN mkdir -p /app/public/js
COPY public/js/ui-components.js /app/public/js/
COPY public/js/ui-validator.js /app/public/js/

# Expose the port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
"@

Set-Content -Path "Dockerfile.ui-fixes" -Value $dockerfileContent
Log-Message "Created custom Dockerfile: Dockerfile.ui-fixes"

# Create a custom cloudbuild.yaml file
Log-Message "Creating custom cloudbuild.yaml file..."
$cloudbuildContent = @"
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/\$PROJECT_ID/$serviceName', '-f', 'Dockerfile.ui-fixes', '.']
  
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/\$PROJECT_ID/$serviceName']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - '$serviceName'
      - '--image'
      - 'gcr.io/\$PROJECT_ID/$serviceName'
      - '--region'
      - '$region'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/\$PROJECT_ID/$serviceName'
"@

Set-Content -Path "cloudbuild.ui-fixes.yaml" -Value $cloudbuildContent
Log-Message "Created custom cloudbuild.yaml file: cloudbuild.ui-fixes.yaml"

# Deploy to Google Cloud Run
Log-Message "Deploying to Google Cloud Run..."
Log-Message "Running: gcloud builds submit --config cloudbuild.ui-fixes.yaml"

try {
    gcloud builds submit --config cloudbuild.ui-fixes.yaml
    Log-Message "Deployment successful!"
} catch {
    Log-Message "Error deploying to Google Cloud Run: $_"
    exit 1
}

# Get the deployed URL
Log-Message "Getting deployed URL..."
$deployedUrl = gcloud run services describe $serviceName --region $region --format="value(status.url)"
Log-Message "Deployed URL: $deployedUrl"

# Deployment complete
Log-Message "Comprehensive UI fixes deployment complete!"
Log-Message "Service: $serviceName"
Log-Message "Region: $region"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the UI fixes, visit the deployed application at:"
Write-Host "$deployedUrl"
Write-Host ""
Write-Host "Run the UI validation script to check if all UI elements are present:"
Write-Host "node test-deployed-ui.js"
Write-Host ""
