/**
 * Deploy to Google Cloud Run
 * This script deploys the application to Google Cloud Run
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  projectId: 'findoc-deploy',
  region: 'europe-west3',
  containerName: 'findoc-app-container-new',
  imageName: 'findoc-analyzer-ui-fixed',
  serviceAccount: 'findoc-app@findoc-deploy.iam.gserviceaccount.com',
  memory: '1Gi',
  cpu: 1,
  port: 8080,
  minInstances: 1,
  maxInstances: 5
};

// Get timestamp for image tag
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const imageTag = `${timestamp}`;
const fullImageName = `gcr.io/${config.projectId}/${config.imageName}:${imageTag}`;

// Deploy to Google Cloud Run
async function deploy() {
  console.log('Deploying to Google Cloud Run...');
  
  try {
    // Step 1: Tag the Docker image
    console.log(`Step 1: Tagging Docker image as ${fullImageName}...`);
    execSync(`docker tag ${config.containerName} ${fullImageName}`);
    console.log('Docker image tagged successfully');
    
    // Step 2: Push the Docker image to Google Container Registry
    console.log('Step 2: Pushing Docker image to Google Container Registry...');
    execSync(`docker push ${fullImageName}`);
    console.log('Docker image pushed successfully');
    
    // Step 3: Deploy to Google Cloud Run
    console.log('Step 3: Deploying to Google Cloud Run...');
    execSync(`gcloud run deploy ${config.imageName} \\
      --image=${fullImageName} \\
      --platform=managed \\
      --region=${config.region} \\
      --allow-unauthenticated \\
      --memory=${config.memory} \\
      --cpu=${config.cpu} \\
      --port=${config.port} \\
      --min-instances=${config.minInstances} \\
      --max-instances=${config.maxInstances} \\
      --service-account=${config.serviceAccount} \\
      --project=${config.projectId}`);
    
    console.log('Deployment to Google Cloud Run completed successfully');
    
    // Step 4: Get the deployed URL
    console.log('Step 4: Getting deployed URL...');
    const deployedUrl = execSync(`gcloud run services describe ${config.imageName} \\
      --platform=managed \\
      --region=${config.region} \\
      --project=${config.projectId} \\
      --format="value(status.url)"`).toString().trim();
    
    console.log(`Deployed URL: ${deployedUrl}`);
    
    // Save deployment info
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      imageTag,
      fullImageName,
      deployedUrl,
      config
    };
    
    const deploymentInfoDir = path.join(__dirname, '../../deployment-info');
    if (!fs.existsSync(deploymentInfoDir)) {
      fs.mkdirSync(deploymentInfoDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(deploymentInfoDir, `deployment-${timestamp}.json`),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log(`Deployment info saved to deployment-info/deployment-${timestamp}.json`);
    
    return {
      success: true,
      deployedUrl,
      imageTag,
      fullImageName
    };
    
  } catch (error) {
    console.error(`Error deploying to Google Cloud Run: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the deployment if this file is executed directly
if (require.main === module) {
  deploy().catch(console.error);
}

module.exports = deploy;
