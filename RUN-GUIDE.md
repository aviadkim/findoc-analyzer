# FinDoc Analyzer: Step-by-Step Run Guide

This guide provides step-by-step instructions for running the FinDoc Analyzer application, from local development to deployment on Google Cloud Run.

## Local Development

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher
- Docker (for containerization)
- Google Cloud SDK (for deployment)

### Step 1: Clone the Repository

```bash
git clone https://github.com/aviadkim/backv2.git
cd backv2
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=8080
NODE_ENV=development
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 4: Run the Application Locally

```bash
npm run start
```

The application will be available at http://localhost:8080.

## Docker Deployment

### Step 1: Build the Docker Image

```bash
docker build -t findoc-app .
```

### Step 2: Run the Docker Container

```bash
docker run -p 8080:8080 --name findoc-app-container findoc-app
```

The application will be available at http://localhost:8080.

## Google Cloud Run Deployment

### Step 1: Tag the Docker Image for Google Cloud Registry

```bash
docker tag findoc-app gcr.io/findoc-deploy/backv2-app:latest
```

### Step 2: Configure Docker for Google Cloud

```bash
gcloud auth configure-docker
```

### Step 3: Push the Docker Image to Google Cloud Registry

```bash
docker push gcr.io/findoc-deploy/backv2-app:latest
```

### Step 4: Deploy to Google Cloud Run

```bash
gcloud run deploy backv2-app --image gcr.io/findoc-deploy/backv2-app:latest --platform managed --region me-west1 --allow-unauthenticated
```

The application will be available at the URL provided in the output of the command.

## Running Tests

### Step 1: Install Test Dependencies

```bash
npm install -g puppeteer playwright
```

### Step 2: Run UI Tests

```bash
node test-ui-components.js
```

### Step 3: Run Agent Tests

```bash
node test-agents.js
```

### Step 4: Run Deployed UI Tests

```bash
node test-deployed-ui.js
```

## Troubleshooting

### Issue: Docker Build Fails

If the Docker build fails, try the following:

1. Check if Docker is running
2. Check if you have enough disk space
3. Check if the Dockerfile is correctly formatted

### Issue: Google Cloud Deployment Fails

If the Google Cloud deployment fails, try the following:

1. Check if you have the correct permissions
2. Check if the Docker image was pushed correctly
3. Check if the region is correct

### Issue: Tests Fail

If the tests fail, try the following:

1. Check if the application is running
2. Check if the environment variables are set correctly
3. Check if the UI components are implemented correctly

## Conclusion

Following these steps, you should be able to run the FinDoc Analyzer application locally, deploy it to Docker, and deploy it to Google Cloud Run. If you encounter any issues, refer to the troubleshooting section or check the documentation.
