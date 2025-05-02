/**
 * Test Script for FinDoc Analyzer
 * 
 * This script tests the basic functionality of the FinDoc Analyzer application.
 */

const fs = require('fs');
const path = require('path');

// Test directory structure
console.log('Testing directory structure...');
const directories = [
  'src',
  'src/api',
  'src/api/controllers',
  'src/api/middleware',
  'src/api/routes',
  'src/api/services',
  'public',
  'public/css'
];

let allDirectoriesExist = true;
for (const dir of directories) {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory not found: ${dir}`);
    allDirectoriesExist = false;
  }
}

if (allDirectoriesExist) {
  console.log('All directories exist.');
} else {
  console.error('Some directories are missing.');
}

// Test files
console.log('\nTesting files...');
const files = [
  'src/app.js',
  'src/server.js',
  'public/index.html',
  'public/css/styles.css',
  'public/analytics.html',
  'public/financial.html',
  'public/reports.html'
];

let allFilesExist = true;
for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${file}`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('All files exist.');
} else {
  console.error('Some files are missing.');
}

// Test controllers
console.log('\nTesting controllers...');
const controllers = [
  'visualizationController.js',
  'reportController.js',
  'financialController.js'
];

let allControllersExist = true;
for (const controller of controllers) {
  const controllerPath = path.join(__dirname, 'src/api/controllers', controller);
  if (!fs.existsSync(controllerPath)) {
    console.error(`Controller not found: ${controller}`);
    allControllersExist = false;
  }
}

if (allControllersExist) {
  console.log('All controllers exist.');
} else {
  console.error('Some controllers are missing.');
}

// Test routes
console.log('\nTesting routes...');
const routes = [
  'visualizationRoutes.js',
  'reportRoutes.js',
  'financialRoutes.js'
];

let allRoutesExist = true;
for (const route of routes) {
  const routePath = path.join(__dirname, 'src/api/routes', route);
  if (!fs.existsSync(routePath)) {
    console.error(`Route not found: ${route}`);
    allRoutesExist = false;
  }
}

if (allRoutesExist) {
  console.log('All routes exist.');
} else {
  console.error('Some routes are missing.');
}

// Test services
console.log('\nTesting services...');
const services = [
  'visualization/chartGenerator.js',
  'audit/auditService.js'
];

let allServicesExist = true;
for (const service of services) {
  const servicePath = path.join(__dirname, 'src/api/services', service);
  if (!fs.existsSync(servicePath)) {
    console.error(`Service not found: ${service}`);
    allServicesExist = false;
  }
}

if (allServicesExist) {
  console.log('All services exist.');
} else {
  console.error('Some services are missing.');
}

// Summary
console.log('\nTest Summary:');
if (allDirectoriesExist && allFilesExist && allControllersExist && allRoutesExist && allServicesExist) {
  console.log('All tests passed. The application structure is correct.');
} else {
  console.error('Some tests failed. Please check the errors above.');
}
