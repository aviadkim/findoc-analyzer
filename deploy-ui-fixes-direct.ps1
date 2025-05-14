# FinDoc Analyzer UI Fixes Direct Deployment Script
# This script directly deploys the UI fixes to Google Cloud Run

# Set variables
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "deploy-ui-fixes-direct-$timestamp.log"
$serviceName = "backv2-app"
$region = "me-west1"

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
Log-Message "Starting direct UI fixes deployment to Google Cloud Run..."

# Step 1: Create a temporary directory for deployment
$tempDir = "temp-deploy-$timestamp"
Log-Message "Creating temporary directory: $tempDir"
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Step 2: Copy all files from the current directory to the temporary directory
Log-Message "Copying files to temporary directory..."
Copy-Item -Path * -Destination $tempDir -Recurse -Force -Exclude $tempDir

# Step 3: Ensure UI component files exist in the temporary directory
Log-Message "Checking UI component files..."
$uiComponentsPath = Join-Path -Path $tempDir -ChildPath "public\js\ui-components.js"
$uiValidatorPath = Join-Path -Path $tempDir -ChildPath "public\js\ui-validator.js"

if (-not (Test-Path $uiComponentsPath)) {
    Log-Message "Creating ui-components.js..."
    $uiComponentsDir = Join-Path -Path $tempDir -ChildPath "public\js"
    if (-not (Test-Path $uiComponentsDir)) {
        New-Item -ItemType Directory -Path $uiComponentsDir -Force | Out-Null
    }
    Copy-Item -Path "ui-components.js" -Destination $uiComponentsPath -Force
}

if (-not (Test-Path $uiValidatorPath)) {
    Log-Message "Creating ui-validator.js..."
    $uiValidatorDir = Join-Path -Path $tempDir -ChildPath "public\js"
    if (-not (Test-Path $uiValidatorDir)) {
        New-Item -ItemType Directory -Path $uiValidatorDir -Force | Out-Null
    }
    Copy-Item -Path "ui-validator.js" -Destination $uiValidatorPath -Force
}

# Step 4: Update all HTML files to include UI components
Log-Message "Updating HTML files to include UI components..."
$htmlFiles = Get-ChildItem -Path $tempDir -Filter "*.html" -Recurse

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

# Step 5: Create a custom Dockerfile
Log-Message "Creating custom Dockerfile..."
$dockerfilePath = Join-Path -Path $tempDir -ChildPath "Dockerfile"
$dockerfileContent = @"
FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
"@

Set-Content -Path $dockerfilePath -Value $dockerfileContent
Log-Message "Created custom Dockerfile"

# Step 6: Deploy to Google Cloud Run
Log-Message "Deploying to Google Cloud Run..."
Set-Location -Path $tempDir
Log-Message "Running: gcloud run deploy $serviceName --source . --region $region"

try {
    gcloud run deploy $serviceName --source . --region $region
    Log-Message "Deployment successful!"
} catch {
    Log-Message "Error deploying to Google Cloud Run: $_"
    Set-Location -Path ..
    exit 1
}

# Step 7: Clean up
Log-Message "Cleaning up..."
Set-Location -Path ..
Remove-Item -Path $tempDir -Recurse -Force

# Step 8: Get the deployed URL
Log-Message "Getting deployed URL..."
$deployedUrl = gcloud run services describe $serviceName --region $region --format="value(status.url)"
Log-Message "Deployed URL: $deployedUrl"

# Deployment complete
Log-Message "Direct UI fixes deployment complete!"
Log-Message "Service: $serviceName"
Log-Message "Region: $region"
Log-Message "URL: $deployedUrl"
Log-Message "Log file: $logFile"

# Display instructions
Write-Host ""
Write-Host "To verify the UI fixes, visit the deployed application at:"
Write-Host "$deployedUrl"
Write-Host ""
Write-Host "Check the upload page to verify that the process button and chat functionality are working."
Write-Host ""
