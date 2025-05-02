# PowerShell script to set up Google Cloud project

# Check if gcloud is installed
try {
    gcloud --version
    Write-Host "Google Cloud SDK (gcloud) is installed."
} catch {
    Write-Host "Google Cloud SDK (gcloud) is not installed. Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Ask for project ID
$PROJECT_ID = Read-Host -Prompt "Enter your Google Cloud project ID"

# Set the project
Write-Host "Setting Google Cloud project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "Enabling required APIs..."
gcloud services enable generativeai.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Create service account
Write-Host "Creating service account..."
$SERVICE_ACCOUNT = "findoc-rag-sa"
gcloud iam service-accounts create $SERVICE_ACCOUNT `
    --display-name="FinDoc RAG Service Account"

# Grant permissions to the service account
Write-Host "Granting permissions to the service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" `
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" `
    --role="roles/logging.logWriter"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" `
    --role="roles/monitoring.metricWriter"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" `
    --role="roles/aiplatform.user"

# Create storage bucket
Write-Host "Creating storage bucket..."
$BUCKET_NAME = "$PROJECT_ID-findoc-rag"
gcloud storage buckets create gs://$BUCKET_NAME --location=us-central1

# Create secret for Gemini API key
Write-Host "Creating secret for Gemini API key..."
$GEMINI_API_KEY = Read-Host -Prompt "Enter your Gemini API key"
$GEMINI_API_KEY | gcloud secrets create gemini-api-key --data-file=-

# Grant access to the secret
gcloud secrets add-iam-policy-binding gemini-api-key `
    --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" `
    --role="roles/secretmanager.secretAccessor"

# Download service account key
Write-Host "Downloading service account key..."
gcloud iam service-accounts keys create google-credentials.json `
    --iam-account=$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com

Write-Host "Google Cloud setup complete!"
Write-Host "Service account key saved to google-credentials.json"
Write-Host "Please move this file to the docker directory for local development"
Write-Host "or use it to set up GitHub Actions secrets for CI/CD"
