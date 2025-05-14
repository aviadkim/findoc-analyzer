/**
 * Deploy FinDoc Analyzer to Google Cloud Platform
 * 
 * This script deploys the FinDoc Analyzer application to Google Cloud Platform,
 * where it can be tested using Playwright or other testing tools.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const config = {
  // GCP configuration
  projectId: process.env.GCP_PROJECT_ID,
  region: process.env.GCP_REGION || 'us-central1',
  appName: process.env.APP_NAME || 'findoc-analyzer',
  
  // Deployment options
  deploymentType: process.env.DEPLOYMENT_TYPE || 'cloudrun', // 'cloudrun' or 'appengine'
  
  // API Keys
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  
  // Other settings
  logFile: path.join(__dirname, 'logs', 'deploy.log'),
  tempDir: path.join(__dirname, 'temp'),
  timeout: parseInt(process.env.DEPLOY_TIMEOUT || '600000') // 10 minutes
};

// Ensure directories exist
[path.dirname(config.logFile), config.tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Ask a question and get user input
 * @param {string} question - Question to ask
 * @returns {Promise<string>} - User's answer
 */
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

/**
 * Execute a command with logging
 * @param {string} command - Command to execute
 * @param {string} description - Description of the command
 * @returns {string} - Command output
 */
function execCommand(command, description) {
  console.log(`\n${description}...`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    // Log command and output
    fs.appendFileSync(config.logFile, `\n\n==== ${description} ====\n\n`);
    fs.appendFileSync(config.logFile, `Command: ${command}\n\n`);
    fs.appendFileSync(config.logFile, `Output:\n${output}\n`);
    
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    // Log error
    fs.appendFileSync(config.logFile, `\n\n==== ERROR: ${description} ====\n\n`);
    fs.appendFileSync(config.logFile, `Command: ${command}\n\n`);
    fs.appendFileSync(config.logFile, `Error:\n${error.message}\n`);
    
    console.error(`❌ Error during ${description}:`);
    console.error(error.message);
    
    if (error.stdout) {
      console.error('stdout:', error.stdout.toString());
    }
    
    if (error.stderr) {
      console.error('stderr:', error.stderr.toString());
    }
    
    throw error;
  }
}

/**
 * Check if gcloud is installed and configured
 * @returns {Promise<boolean>} - Whether gcloud is ready
 */
async function checkGCloud() {
  try {
    const output = execSync('gcloud --version', { encoding: 'utf8' });
    console.log('Google Cloud SDK is installed:');
    console.log(output.split('\n')[0]);
    
    // Check if project ID is set
    if (!config.projectId) {
      const projectsList = execSync('gcloud projects list --format="value(projectId)"', { encoding: 'utf8' });
      const projects = projectsList.split('\n').filter(Boolean);
      
      if (projects.length === 0) {
        console.error('No Google Cloud projects found.');
        return false;
      }
      
      console.log('\nAvailable Google Cloud projects:');
      projects.forEach((project, index) => {
        console.log(`${index + 1}. ${project}`);
      });
      
      const projectIndex = await askQuestion('\nSelect a project by number (or enter a project ID): ');
      
      if (/^\d+$/.test(projectIndex) && parseInt(projectIndex) > 0 && parseInt(projectIndex) <= projects.length) {
        config.projectId = projects[parseInt(projectIndex) - 1];
      } else {
        config.projectId = projectIndex.trim();
      }
    }
    
    console.log(`\nUsing Google Cloud project: ${config.projectId}`);
    
    // Set default project
    execCommand(`gcloud config set project ${config.projectId}`, 'Setting default project');
    
    return true;
  } catch (error) {
    console.error('Error checking Google Cloud SDK:', error.message);
    console.log('\nPlease install the Google Cloud SDK and authenticate:');
    console.log('https://cloud.google.com/sdk/docs/install');
    console.log('Run: gcloud auth login');
    
    return false;
  }
}

/**
 * Deploy to Google Cloud Run
 */
async function deployToCloudRun() {
  console.log('\nDeploying to Google Cloud Run...');
  
  try {
    // Check if Dockerfile exists, if not create one
    if (!fs.existsSync(path.join(__dirname, 'Dockerfile'))) {
      console.log('Creating Dockerfile...');
      
      const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
${config.openaiApiKey ? `ENV OPENAI_API_KEY=${config.openaiApiKey}` : ''}
${config.anthropicApiKey ? `ENV ANTHROPIC_API_KEY=${config.anthropicApiKey}` : ''}

# Start the application
CMD ["node", "server.js"]
`;
      
      fs.writeFileSync(path.join(__dirname, 'Dockerfile'), dockerfile);
      console.log('Dockerfile created');
    }
    
    // Enable required APIs
    execCommand(
      `gcloud services enable cloudbuild.googleapis.com cloudrun.googleapis.com artifactregistry.googleapis.com --project=${config.projectId}`,
      'Enabling required Google Cloud APIs'
    );
    
    // Deploy to Cloud Run
    const deployCommand = `gcloud run deploy ${config.appName} \
      --source . \
      --platform managed \
      --region ${config.region} \
      --allow-unauthenticated \
      --project=${config.projectId}`;
    
    const output = execCommand(deployCommand, 'Deploying to Cloud Run');
    
    // Extract the service URL from the output
    const serviceUrlMatch = output.match(/Service URL: (https:\/\/[\w-]+\.[\w-]+\.[\w.]+)/);
    if (serviceUrlMatch && serviceUrlMatch[1]) {
      const serviceUrl = serviceUrlMatch[1];
      console.log(`\n✅ FinDoc Analyzer deployed successfully!`);
      console.log(`Service URL: ${serviceUrl}`);
      
      // Save the URL to a file for reference
      fs.writeFileSync(path.join(__dirname, 'cloud-url.txt'), serviceUrl);
      
      return serviceUrl;
    } else {
      console.log('\n✅ FinDoc Analyzer deployed successfully!');
      console.log('Please check the Google Cloud Console for the service URL.');
    }
  } catch (error) {
    console.error('\n❌ Deployment to Cloud Run failed:', error.message);
    throw error;
  }
}

/**
 * Deploy to Google App Engine
 */
async function deployToAppEngine() {
  console.log('\nDeploying to Google App Engine...');
  
  try {
    // Check if app.yaml exists, if not create one
    if (!fs.existsSync(path.join(__dirname, 'app.yaml'))) {
      console.log('Creating app.yaml...');
      
      const appYaml = `runtime: nodejs18

env_variables:
  NODE_ENV: "production"
${config.openaiApiKey ? `  OPENAI_API_KEY: "${config.openaiApiKey}"` : ''}
${config.anthropicApiKey ? `  ANTHROPIC_API_KEY: "${config.anthropicApiKey}"` : ''}

handlers:
  - url: /.*
    script: auto
    secure: always

automatic_scaling:
  min_instances: 1
  max_instances: 5
`;
      
      fs.writeFileSync(path.join(__dirname, 'app.yaml'), appYaml);
      console.log('app.yaml created');
    }
    
    // Enable required APIs
    execCommand(
      `gcloud services enable appengine.googleapis.com --project=${config.projectId}`,
      'Enabling App Engine API'
    );
    
    // Deploy to App Engine
    const deployCommand = `gcloud app deploy --project=${config.projectId} --quiet`;
    execCommand(deployCommand, 'Deploying to App Engine');
    
    // Get the App Engine URL
    const serviceUrl = `https://${config.projectId}.uc.r.appspot.com`;
    console.log(`\n✅ FinDoc Analyzer deployed successfully!`);
    console.log(`Service URL: ${serviceUrl}`);
    
    // Save the URL to a file for reference
    fs.writeFileSync(path.join(__dirname, 'cloud-url.txt'), serviceUrl);
    
    return serviceUrl;
  } catch (error) {
    console.error('\n❌ Deployment to App Engine failed:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('FinDoc Analyzer Cloud Deployment');
  console.log('===============================');
  
  try {
    // Check if gcloud is ready
    const isGCloudReady = await checkGCloud();
    if (!isGCloudReady) {
      console.log('\nExiting: Google Cloud SDK not properly configured.');
      return;
    }
    
    // Ask for deployment type if not specified
    if (!process.env.DEPLOYMENT_TYPE) {
      const deploymentTypeAnswer = await askQuestion(
        '\nSelect deployment type:\n1. Google Cloud Run (recommended)\n2. Google App Engine\nYour choice (1/2): '
      );
      
      if (deploymentTypeAnswer === '1' || deploymentTypeAnswer.toLowerCase() === 'cloud run') {
        config.deploymentType = 'cloudrun';
      } else if (deploymentTypeAnswer === '2' || deploymentTypeAnswer.toLowerCase() === 'app engine') {
        config.deploymentType = 'appengine';
      } else {
        console.log('Invalid choice. Using default: Cloud Run');
        config.deploymentType = 'cloudrun';
      }
    }
    
    // Check for API keys
    if (!config.openaiApiKey && !config.anthropicApiKey) {
      console.log('\n⚠️ Warning: No AI API keys provided.');
      console.log('The application will use rule-based responses instead of AI chat.');
      
      const addApiKeyAnswer = await askQuestion('\nWould you like to add an API key now? (y/n): ');
      
      if (addApiKeyAnswer.toLowerCase() === 'y' || addApiKeyAnswer.toLowerCase() === 'yes') {
        const apiKeyType = await askQuestion('\nWhich API key would you like to add?\n1. OpenAI\n2. Anthropic\nYour choice (1/2): ');
        
        if (apiKeyType === '1' || apiKeyType.toLowerCase() === 'openai') {
          config.openaiApiKey = await askQuestion('\nEnter your OpenAI API key: ');
        } else if (apiKeyType === '2' || apiKeyType.toLowerCase() === 'anthropic') {
          config.anthropicApiKey = await askQuestion('\nEnter your Anthropic API key: ');
        }
      }
    }
    
    // Deploy based on selected type
    let serviceUrl;
    if (config.deploymentType === 'cloudrun') {
      serviceUrl = await deployToCloudRun();
    } else if (config.deploymentType === 'appengine') {
      serviceUrl = await deployToAppEngine();
    }
    
    // Show instructions for running Playwright tests against the deployed app
    if (serviceUrl) {
      console.log('\nTo run Playwright tests against the deployed app:');
      console.log(`CLOUD_URL=${serviceUrl} TEST_MODE=cloud node playwright-test.js`);
    }
    
  } catch (error) {
    console.error('\nDeployment failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run main function
main().catch(console.error);