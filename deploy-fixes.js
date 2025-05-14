/**
 * Deploy Fixes to Cloud
 *
 * This script creates a zip file with the fixes and instructions for deploying to the cloud.
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create a zip file with the fixes
const createFixesZip = () => {
  console.log('Creating fixes zip file...');

  const output = fs.createWriteStream(path.join(__dirname, 'findoc-fixes.zip'));
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  // Listen for all archive data to be written
  output.on('close', () => {
    console.log(`Fixes zip file created: ${archive.pointer()} total bytes`);
    console.log('Fixes zip file is ready for deployment');
  });

  // Good practice to catch warnings
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('Warning:', err);
    } else {
      throw err;
    }
  });

  // Good practice to catch errors
  archive.on('error', (err) => {
    throw err;
  });

  // Pipe archive data to the file
  archive.pipe(output);

  // Add files

  // Add all files from the public directory
  console.log('Adding all files from the public directory...');
  archive.directory(path.join(__dirname, 'public'), 'public');

  // Add server.js
  const serverPath = path.join(__dirname, 'server.js');
  if (fs.existsSync(serverPath)) {
    console.log('Adding server.js...');
    archive.file(serverPath, { name: 'server.js' });
  }

  // Add routes directory
  const routesPath = path.join(__dirname, 'routes');
  if (fs.existsSync(routesPath)) {
    console.log('Adding routes directory...');
    archive.directory(routesPath, 'routes');
  }

  // Add middleware directory
  const middlewarePath = path.join(__dirname, 'middleware');
  if (fs.existsSync(middlewarePath)) {
    console.log('Adding middleware directory...');
    archive.directory(middlewarePath, 'middleware');
  }

  // Add controllers directory
  const controllersPath = path.join(__dirname, 'controllers');
  if (fs.existsSync(controllersPath)) {
    console.log('Adding controllers directory...');
    archive.directory(controllersPath, 'controllers');
  }

  // Add services directory
  const servicesPath = path.join(__dirname, 'services');
  if (fs.existsSync(servicesPath)) {
    console.log('Adding services directory...');
    archive.directory(servicesPath, 'services');
  }

  // Add models directory
  const modelsPath = path.join(__dirname, 'models');
  if (fs.existsSync(modelsPath)) {
    console.log('Adding models directory...');
    archive.directory(modelsPath, 'models');
  }

  // Add utils directory
  const utilsPath = path.join(__dirname, 'utils');
  if (fs.existsSync(utilsPath)) {
    console.log('Adding utils directory...');
    archive.directory(utilsPath, 'utils');
  }

  // Add config directory
  const configPath = path.join(__dirname, 'config');
  if (fs.existsSync(configPath)) {
    console.log('Adding config directory...');
    archive.directory(configPath, 'config');
  }

  // Add package.json
  const packagePath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packagePath)) {
    console.log('Adding package.json...');
    archive.file(packagePath, { name: 'package.json' });
  }

  // Add deployment instructions
  const deploymentInstructions = `# Deployment Instructions

## Files Included

This zip file contains the complete application, including:

1. \`public/\` - All static files (HTML, CSS, JavaScript, images)
2. \`server.js\` - Main server file
3. \`routes/\` - API and page routes
4. \`middleware/\` - Authentication and other middleware
5. \`controllers/\` - Business logic controllers
6. \`services/\` - Service modules
7. \`models/\` - Data models
8. \`utils/\` - Utility functions
9. \`config/\` - Configuration files
10. \`package.json\` - Dependencies and scripts

## Deployment Steps

1. Extract the zip file
2. Copy all files to the corresponding locations in your cloud deployment
3. Run \`npm install\` to install dependencies
4. Restart the server

## Testing

After deployment, test the following functionality:

1. Homepage - Verify the new UI is displayed
2. Documents Page - Go to /documents-new and verify the new UI
3. Analytics Page - Go to /analytics-new and verify the new UI
4. Upload Page - Go to /upload and verify file upload works
5. Document Chat - Go to /document-chat and test the chat functionality
6. API Health - Check /api/health for API status

## Troubleshooting

If you encounter any issues:

1. Check the server logs for errors
2. Verify that all files were copied correctly
3. Make sure the server was restarted after copying the files
4. Clear browser cache to ensure you're seeing the latest version
5. Check for any JavaScript console errors
`;

  archive.append(deploymentInstructions, { name: 'DEPLOYMENT_INSTRUCTIONS.md' });

  // Finalize the archive
  archive.finalize();

  return true;
};

// Main function
const main = async () => {
  console.log('Preparing fixes for deployment...');

  // Check if archiver is installed
  try {
    require('archiver');
  } catch (error) {
    console.error('archiver package is not installed');
    console.log('Installing archiver...');

    // Install archiver
    const { execSync } = require('child_process');
    execSync('npm install archiver');

    console.log('archiver installed successfully');
  }

  // Create fixes zip
  const zipCreated = createFixesZip();

  if (zipCreated) {
    console.log('Fixes prepared successfully');
    return true;
  } else {
    console.error('Failed to prepare fixes');
    return false;
  }
};

// Run main function
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main,
  createFixesZip
};
