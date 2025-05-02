/**
 * Pre-Deployment Check Script
 *
 * This script performs checks before deployment to ensure everything is ready.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  requiredFiles: [
    'app.yaml',
    'package.json',
    'src/server.js',
    'src/app.js'
  ],
  basePath: path.resolve(__dirname),
  requiredDependencies: [
    'express',
    'cors',
    'dotenv',
    'axios'
  ],
  requiredScripts: [
    'start',
    'test'
  ],
  secretsToCheck: [
    'GEMINI_API_KEY',
    'OPENROUTER_API_KEY'
  ]
};

// Results
const results = {
  success: true,
  checks: []
};

/**
 * Add a check result
 * @param {string} name - Check name
 * @param {boolean} success - Check success
 * @param {string} message - Check message
 */
function addCheckResult(name, success, message) {
  results.checks.push({
    name,
    success,
    message
  });

  if (!success) {
    results.success = false;
  }
}

/**
 * Check if required files exist
 */
function checkRequiredFiles() {
  console.log('Checking required files...');

  for (const file of config.requiredFiles) {
    const filePath = path.join(config.basePath, file);
    const exists = fs.existsSync(filePath);

    addCheckResult(
      `Required File: ${file}`,
      exists,
      exists ? `File exists: ${filePath}` : `File not found: ${filePath}`
    );
  }
}

/**
 * Check package.json
 */
function checkPackageJson() {
  console.log('Checking package.json...');

  try {
    const packageJsonPath = path.join(config.basePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check required dependencies
    for (const dependency of config.requiredDependencies) {
      const hasDependency = packageJson.dependencies && packageJson.dependencies[dependency];

      addCheckResult(
        `Required Dependency: ${dependency}`,
        hasDependency,
        hasDependency ? `Dependency found: ${dependency}@${packageJson.dependencies[dependency]}` : `Dependency not found: ${dependency}`
      );
    }

    // Check required scripts
    for (const script of config.requiredScripts) {
      const hasScript = packageJson.scripts && packageJson.scripts[script];

      addCheckResult(
        `Required Script: ${script}`,
        hasScript,
        hasScript ? `Script found: ${script}` : `Script not found: ${script}`
      );
    }
  } catch (error) {
    addCheckResult(
      'Package JSON',
      false,
      `Error checking package.json: ${error.message}`
    );
  }
}

/**
 * Check app.yaml
 */
function checkAppYaml() {
  console.log('Checking app.yaml...');

  try {
    const appYamlPath = path.join(config.basePath, 'app.yaml');
    const appYaml = fs.readFileSync(appYamlPath, 'utf8');

    // Check runtime
    const hasRuntime = appYaml.includes('runtime:');

    addCheckResult(
      'App YAML Runtime',
      hasRuntime,
      hasRuntime ? 'Runtime found in app.yaml' : 'Runtime not found in app.yaml'
    );

    // Check env variables
    const hasEnvVars = appYaml.includes('env_variables:');

    addCheckResult(
      'App YAML Environment Variables',
      hasEnvVars,
      hasEnvVars ? 'Environment variables found in app.yaml' : 'Environment variables not found in app.yaml'
    );

    // Check secrets
    for (const secret of config.secretsToCheck) {
      const hasSecret = appYaml.includes(secret);

      addCheckResult(
        `Secret: ${secret}`,
        hasSecret,
        hasSecret ? `Secret found in app.yaml: ${secret}` : `Secret not found in app.yaml: ${secret}`
      );
    }
  } catch (error) {
    addCheckResult(
      'App YAML',
      false,
      `Error checking app.yaml: ${error.message}`
    );
  }
}

/**
 * Check gcloud CLI
 */
function checkGcloudCli() {
  console.log('Checking gcloud CLI...');

  try {
    const gcloudVersion = execSync('gcloud --version', { encoding: 'utf8' });

    addCheckResult(
      'Google Cloud SDK',
      true,
      `Google Cloud SDK installed: ${gcloudVersion.split('\n')[0]}`
    );

    // Check authentication
    const gcloudAuth = execSync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', { encoding: 'utf8' });

    addCheckResult(
      'Google Cloud Authentication',
      gcloudAuth.trim() !== '',
      gcloudAuth.trim() !== '' ? `Authenticated as: ${gcloudAuth.trim()}` : 'Not authenticated with gcloud'
    );

    // Check project
    const gcloudProject = execSync('gcloud config get-value project', { encoding: 'utf8' });

    addCheckResult(
      'Google Cloud Project',
      gcloudProject.trim() !== '',
      gcloudProject.trim() !== '' ? `Using project: ${gcloudProject.trim()}` : 'No project set'
    );
  } catch (error) {
    addCheckResult(
      'Google Cloud SDK',
      false,
      `Error checking Google Cloud SDK: ${error.message}`
    );
  }
}

/**
 * Run all checks
 */
function runChecks() {
  console.log('Running pre-deployment checks...');

  checkRequiredFiles();
  checkPackageJson();
  checkAppYaml();
  checkGcloudCli();

  // Print results
  console.log('\nPre-Deployment Check Results:');
  console.log('==============================');
  console.log(`Overall Status: ${results.success ? 'PASS' : 'FAIL'}`);
  console.log('');

  for (const check of results.checks) {
    console.log(`${check.success ? '✅' : '❌'} ${check.name}`);
    console.log(`   ${check.message}`);
  }

  console.log('\nSummary:');
  console.log(`Total Checks: ${results.checks.length}`);
  console.log(`Passed: ${results.checks.filter(check => check.success).length}`);
  console.log(`Failed: ${results.checks.filter(check => !check.success).length}`);

  // Exit with appropriate code
  process.exit(results.success ? 0 : 1);
}

// Run checks
runChecks();
