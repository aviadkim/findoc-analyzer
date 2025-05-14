#!/usr/bin/env node

/**
 * Deployment script for FinDoc application
 * 
 * This script handles deployment to different environments:
 * - development
 * - staging
 * - production
 * 
 * Usage: node deploy.js <environment>
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get environment from command line argument
const environment = process.argv[2];

if (!environment || !['development', 'staging', 'production'].includes(environment)) {
  console.error('Error: Please specify a valid environment (development, staging, or production)');
  process.exit(1);
}

console.log(`Deploying to ${environment} environment...`);

// Environment-specific settings
const envSettings = {
  development: {
    service: 'findoc-dev',
    region: 'us-central1',
    env: 'development',
    allowUnauthenticated: true,
    memory: '1Gi',
    cpu: 1
  },
  staging: {
    service: 'findoc-staging',
    region: 'us-central1',
    env: 'staging',
    allowUnauthenticated: true,
    memory: '2Gi',
    cpu: 2
  },
  production: {
    service: 'findoc-prod',
    region: 'us-central1',
    env: 'production',
    allowUnauthenticated: true,
    memory: '4Gi',
    cpu: 2
  }
};

// Selected environment settings
const settings = envSettings[environment];

/**
 * Run deployment steps
 */
async function deploy() {
  try {
    // Check for GCP CLI
    try {
      execSync('gcloud --version', { stdio: 'ignore' });
    } catch (error) {
      console.error('Error: Google Cloud SDK (gcloud) is not installed or not in PATH');
      process.exit(1);
    }

    // Verify authentication
    console.log('Verifying authentication...');
    try {
      execSync('gcloud auth list', { stdio: 'ignore' });
    } catch (error) {
      console.error('Error: Not authenticated with Google Cloud. Please run "gcloud auth login" first.');
      process.exit(1);
    }

    // Build application
    console.log('Building application...');
    execSync(`npm run build:${environment}`, { stdio: 'inherit' });

    // Build Docker image
    console.log('Building Docker image...');
    const imageTag = `gcr.io/$GOOGLE_CLOUD_PROJECT/${settings.service}:${new Date().toISOString().replace(/[:.]/g, '-')}`;
    execSync(`docker build -t ${imageTag} .`, { stdio: 'inherit' });

    // Push to Container Registry
    console.log('Pushing image to Container Registry...');
    execSync(`docker push ${imageTag}`, { stdio: 'inherit' });

    // Deploy to Cloud Run
    console.log(`Deploying to Cloud Run (${settings.service})...`);
    let deployCommand = `gcloud run deploy ${settings.service} \\
      --image=${imageTag} \\
      --platform=managed \\
      --region=${settings.region} \\
      --memory=${settings.memory} \\
      --cpu=${settings.cpu} \\
      --set-env-vars="NODE_ENV=${settings.env}" \\
      --quiet`;
    
    if (settings.allowUnauthenticated) {
      deployCommand += ' --allow-unauthenticated';
    }
    
    execSync(deployCommand, { stdio: 'inherit' });

    // Get deployed URL
    console.log('Deployment successful!');
    const serviceUrl = execSync(`gcloud run services describe ${settings.service} --region=${settings.region} --format="value(status.url)"`, { encoding: 'utf8' }).trim();
    console.log(`Application deployed to: ${serviceUrl}`);

    // Run basic verification test if not production
    if (environment !== 'production') {
      console.log('Running basic verification test...');
      execSync(`cross-env BASE_URL=${serviceUrl} npx playwright test tests/basic-test.js --project=chromium`, { stdio: 'inherit' });
    }

    console.log(`Deployment to ${environment} completed successfully`);
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

// Execute deployment
deploy().catch(err => {
  console.error('Unhandled error during deployment:', err);
  process.exit(1);
});