# FinDoc Analyzer - Deploy User Feedback and Analytics Features
# This script deploys the user feedback and analytics features to Google App Engine

Write-Host "Deploying User Feedback and Analytics Features to Google App Engine..." -ForegroundColor Cyan

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version
    Write-Host "Google Cloud SDK is installed." -ForegroundColor Green
} catch {
    Write-Host "Google Cloud SDK is not installed. Please install it from https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Check if user is authenticated with gcloud
try {
    $gcloudAuth = gcloud auth list
    if ($gcloudAuth -match "No credentialed accounts.") {
        Write-Host "You are not authenticated with Google Cloud. Please run 'gcloud auth login'" -ForegroundColor Red
        exit 1
    }
    Write-Host "You are authenticated with Google Cloud." -ForegroundColor Green
} catch {
    Write-Host "Error checking Google Cloud authentication. Please run 'gcloud auth login'" -ForegroundColor Red
    exit 1
}

# Set the project ID
$projectId = "findoc-deploy"
Write-Host "Setting Google Cloud project to $projectId..." -ForegroundColor Yellow
gcloud config set project $projectId

# Copy the new files to the deployment directory
Write-Host "Copying new files to deployment directory..." -ForegroundColor Yellow

# Create directories if they don't exist
$deployDir = "cloud-deploy"
$componentsDir = "$deployDir/public/js/components"
$apiDir = "$deployDir/routes/api"
$cssDir = "$deployDir/public/css"

if (-not (Test-Path $componentsDir)) {
    New-Item -ItemType Directory -Path $componentsDir -Force | Out-Null
}

if (-not (Test-Path $apiDir)) {
    New-Item -ItemType Directory -Path $apiDir -Force | Out-Null
}

if (-not (Test-Path $cssDir)) {
    New-Item -ItemType Directory -Path $cssDir -Force | Out-Null
}

# Copy frontend components
Copy-Item "DevDocs/frontend/components/UserFeedbackForm.js" -Destination "$componentsDir/UserFeedbackForm.js" -Force
Copy-Item "DevDocs/frontend/components/AnalyticsDashboard.js" -Destination "$componentsDir/AnalyticsDashboard.js" -Force

# Copy API routes
Copy-Item "DevDocs/frontend/pages/api/feedback.js" -Destination "$apiDir/feedback.js" -Force
Copy-Item "DevDocs/frontend/pages/api/analytics/events.js" -Destination "$apiDir/analytics-events.js" -Force
Copy-Item "DevDocs/frontend/pages/api/analytics/dashboard.js" -Destination "$apiDir/analytics-dashboard.js" -Force

# Copy pages
Copy-Item "DevDocs/frontend/pages/analytics-dashboard.js" -Destination "$deployDir/public/js/analytics-dashboard.js" -Force

# Copy library files
Copy-Item "DevDocs/frontend/lib/analytics.js" -Destination "$deployDir/public/js/analytics.js" -Force

# Create CSS file for analytics dashboard
@"
.analytics-dashboard {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-title {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}

.time-range-selector {
  display: flex;
  gap: 10px;
}

.time-range-btn {
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.time-range-btn:hover {
  background-color: #f7fafc;
}

.time-range-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-row {
  display: flex;
  gap: 20px;
  width: 100%;
}

.dashboard-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  padding: 20px;
  border: 1px solid #e2e8f0;
  width: 100%;
}

.half-width {
  width: 50%;
}

.card-title {
  font-size: 1.125rem;
  color: #2d3748;
  margin: 0 0 15px 0;
}

.chart-container {
  height: 300px;
  position: relative;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #fed7d7;
  color: #c53030;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.feedback-list {
  max-height: 300px;
  overflow-y: auto;
}

.feedback-item {
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.feedback-item:last-child {
  border-bottom: none;
}

.feedback-rating {
  margin-bottom: 5px;
}

.star {
  color: #e2e8f0;
  font-size: 1.125rem;
}

.star.filled {
  color: #f6ad55;
}

.feedback-text {
  margin: 0 0 5px 0;
  font-size: 0.875rem;
}

.feedback-meta {
  margin: 0;
  font-size: 0.75rem;
  color: #718096;
}

.no-data {
  color: #718096;
  text-align: center;
  padding: 20px;
}

@media (max-width: 768px) {
  .dashboard-row {
    flex-direction: column;
  }
  
  .half-width {
    width: 100%;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .time-range-selector {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 5px;
  }
}
"@ | Out-File -FilePath "$cssDir/analytics-dashboard.css" -Encoding utf8

# Update app.yaml if needed
Write-Host "Checking app.yaml configuration..." -ForegroundColor Yellow
$appYaml = Get-Content "app.yaml" -Raw
if (-not ($appYaml -match "analytics-dashboard.css")) {
    Write-Host "Updating app.yaml to include new static files..." -ForegroundColor Yellow
    $appYaml = $appYaml -replace "- url: /css/(.*)\n  static_files: public/css/\1\n  upload: public/css/(.*)", "- url: /css/(.*)\n  static_files: public/css/\1\n  upload: public/css/(.*)\n\n- url: /css/analytics-dashboard.css\n  static_files: public/css/analytics-dashboard.css\n  upload: public/css/analytics-dashboard.css"
    $appYaml | Out-File -FilePath "app.yaml" -Encoding utf8
}

# Deploy to Google App Engine
Write-Host "Deploying to Google App Engine..." -ForegroundColor Green
gcloud app deploy app.yaml --quiet

# Verify deployment
Write-Host "Deployment completed. Verifying..." -ForegroundColor Yellow
$appUrl = "https://$projectId.appspot.com"
Write-Host "Application is now available at: $appUrl" -ForegroundColor Cyan
Write-Host "Please verify the following pages:" -ForegroundColor Cyan
Write-Host "- Feedback page: $appUrl/feedback" -ForegroundColor Cyan
Write-Host "- Analytics Dashboard: $appUrl/analytics-dashboard" -ForegroundColor Cyan

Write-Host "Deployment of User Feedback and Analytics Features completed successfully!" -ForegroundColor Green
