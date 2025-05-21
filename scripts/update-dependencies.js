#!/usr/bin/env node

/**
 * Script to safely update dependencies
 * Usage: node scripts/update-dependencies.js
 * 
 * This script:
 * 1. Creates a backup of package.json and package-lock.json
 * 2. Updates dependencies incrementally (non-major versions first)
 * 3. Runs tests after each update to ensure nothing breaks
 * 4. Generates a report of updated packages
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  skipMajorUpdates: false,        // Set to true to skip major version updates
  runTestsAfterEachUpdate: true,  // Run tests after each package update
  generateReport: true,           // Generate an update report
  backupFiles: true,              // Create backups before updating
  updateDevDependencies: true,    // Update devDependencies as well
};

// Create backup directory
const backupDir = path.join(__dirname, '..', 'dependency-backup');
if (config.backupFiles && !fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Create report directory
const reportDir = path.join(__dirname, '..', 'dependency-reports');
if (config.generateReport && !fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// Get the current date for backup and report files
const date = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');

console.log('📦 Starting dependency update process...');

// Backup package files
if (config.backupFiles) {
  console.log('📝 Creating backup of package files...');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
  
  fs.copyFileSync(packageJsonPath, path.join(backupDir, `package.json.${date}`));
  fs.copyFileSync(packageLockPath, path.join(backupDir, `package-lock.json.${date}`));
  
  console.log('✅ Backup created successfully');
}

// Function to run tests
function runTests() {
  console.log('🧪 Running tests to verify updates...');
  
  try {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ Tests passed');
    return true;
  } catch (error) {
    console.error('❌ Tests failed after dependency update:', error.message);
    return false;
  }
}

// Function to get outdated packages
function getOutdatedPackages() {
  console.log('🔍 Checking for outdated packages...');
  
  try {
    const output = execSync('npm outdated --json', { stdio: 'pipe' }).toString();
    return JSON.parse(output);
  } catch (error) {
    // npm outdated returns exit code 1 if there are outdated packages
    if (error.status === 1) {
      return JSON.parse(error.stdout.toString());
    }
    console.error('❌ Error checking outdated packages:', error.message);
    return {};
  }
}

// Function to update a single package
function updatePackage(packageName, targetVersion) {
  console.log(`📦 Updating ${packageName} to ${targetVersion}...`);
  
  try {
    execSync(`npm install ${packageName}@${targetVersion} --save-exact`, { stdio: 'inherit' });
    console.log(`✅ Updated ${packageName} to ${targetVersion}`);
    
    if (config.runTestsAfterEachUpdate) {
      const testsPass = runTests();
      if (!testsPass) {
        console.log(`⚠️ Rolling back update to ${packageName}...`);
        execSync(`npm install ${packageName}@"$(node -e "console.log(require('./package.json').dependencies['${packageName}'])")" --save-exact`, { stdio: 'inherit' });
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${packageName}:`, error.message);
    return false;
  }
}

// Main update process
async function updateDependencies() {
  // Check for outdated packages
  const outdated = getOutdatedPackages();
  
  if (Object.keys(outdated).length === 0) {
    console.log('✅ All packages are up to date!');
    return;
  }
  
  console.log(`📊 Found ${Object.keys(outdated).length} outdated packages`);
  
  // Track update results
  const updateResults = {
    updated: [],
    failed: [],
    skipped: [],
  };
  
  // First, update patch and minor versions (non-breaking changes)
  for (const [packageName, info] of Object.entries(outdated)) {
    // Skip devDependencies if configured
    if (!config.updateDevDependencies && info.type === 'devDependencies') {
      updateResults.skipped.push({ packageName, from: info.current, to: info.latest, reason: 'devDependency' });
      continue;
    }
    
    const currentVersion = info.current;
    const latestVersion = info.latest;
    const wantedVersion = info.wanted;
    
    // Check if it's a major update
    const currentMajor = parseInt(currentVersion.split('.')[0]);
    const latestMajor = parseInt(latestVersion.split('.')[0]);
    const isMajorUpdate = latestMajor > currentMajor;
    
    // Skip major updates for the first pass
    if (isMajorUpdate) {
      continue;
    }
    
    // Update to wanted version (next non-major version)
    const success = updatePackage(packageName, wantedVersion);
    
    if (success) {
      updateResults.updated.push({ packageName, from: currentVersion, to: wantedVersion, type: 'minor/patch' });
    } else {
      updateResults.failed.push({ packageName, from: currentVersion, to: wantedVersion, reason: 'tests failed' });
    }
  }
  
  // Now, update major versions if configured
  if (!config.skipMajorUpdates) {
    // Get the updated list of outdated packages
    const newOutdated = getOutdatedPackages();
    
    for (const [packageName, info] of Object.entries(newOutdated)) {
      // Skip devDependencies if configured
      if (!config.updateDevDependencies && info.type === 'devDependencies') {
        continue;
      }
      
      const currentVersion = info.current;
      const latestVersion = info.latest;
      
      // Check if it's a major update
      const currentMajor = parseInt(currentVersion.split('.')[0]);
      const latestMajor = parseInt(latestVersion.split('.')[0]);
      const isMajorUpdate = latestMajor > currentMajor;
      
      if (isMajorUpdate) {
        console.log(`⚠️ Major version update detected for ${packageName}: ${currentVersion} -> ${latestVersion}`);
        console.log('   This may introduce breaking changes. Proceeding with update...');
        
        const success = updatePackage(packageName, latestVersion);
        
        if (success) {
          updateResults.updated.push({ packageName, from: currentVersion, to: latestVersion, type: 'major' });
        } else {
          updateResults.failed.push({ packageName, from: currentVersion, to: latestVersion, reason: 'tests failed' });
        }
      }
    }
  } else {
    // Get the list of major updates that were skipped
    const newOutdated = getOutdatedPackages();
    
    for (const [packageName, info] of Object.entries(newOutdated)) {
      const currentVersion = info.current;
      const latestVersion = info.latest;
      
      // Check if it's a major update
      const currentMajor = parseInt(currentVersion.split('.')[0]);
      const latestMajor = parseInt(latestVersion.split('.')[0]);
      const isMajorUpdate = latestMajor > currentMajor;
      
      if (isMajorUpdate) {
        updateResults.skipped.push({ packageName, from: currentVersion, to: latestVersion, reason: 'major update' });
      }
    }
  }
  
  // Generate report
  if (config.generateReport) {
    console.log('📝 Generating update report...');
    
    const report = {
      date: new Date().toISOString(),
      summary: {
        total: Object.keys(outdated).length,
        updated: updateResults.updated.length,
        failed: updateResults.failed.length,
        skipped: updateResults.skipped.length,
      },
      details: updateResults,
    };
    
    fs.writeFileSync(
      path.join(reportDir, `dependency-update-${date}.json`),
      JSON.stringify(report, null, 2)
    );
    
    // Generate human-readable report
    const readableReport = `
# Dependency Update Report

Date: ${new Date().toLocaleString()}

## Summary
- Total outdated packages: ${report.summary.total}
- Successfully updated: ${report.summary.updated}
- Failed updates: ${report.summary.failed}
- Skipped updates: ${report.summary.skipped}

## Updated Packages
${report.details.updated.map(pkg => `- ${pkg.packageName}: ${pkg.from} → ${pkg.to} (${pkg.type})`).join('\n')}

## Failed Updates
${report.details.failed.map(pkg => `- ${pkg.packageName}: ${pkg.from} → ${pkg.to} (${pkg.reason})`).join('\n')}

## Skipped Updates
${report.details.skipped.map(pkg => `- ${pkg.packageName}: ${pkg.from} → ${pkg.to} (${pkg.reason})`).join('\n')}
    `;
    
    fs.writeFileSync(
      path.join(reportDir, `dependency-update-${date}.md`),
      readableReport
    );
    
    console.log(`✅ Report generated: dependency-update-${date}.md`);
  }
  
  console.log('\n📊 Update Summary:');
  console.log(`- Total outdated packages: ${Object.keys(outdated).length}`);
  console.log(`- Successfully updated: ${updateResults.updated.length}`);
  console.log(`- Failed updates: ${updateResults.failed.length}`);
  console.log(`- Skipped updates: ${updateResults.skipped.length}`);
  
  if (updateResults.failed.length > 0) {
    console.log('\n⚠️ Some packages could not be updated due to test failures or errors.');
    console.log('   Review the logs and reports for details.');
  }
  
  if (updateResults.skipped.length > 0 && config.skipMajorUpdates) {
    console.log('\n⚠️ Major version updates were skipped.');
    console.log('   Run with skipMajorUpdates=false to include major version updates.');
  }
  
  console.log('\n📦 Dependency update process completed!');
}

// Run the update process
updateDependencies().catch(error => {
  console.error('❌ Error in update process:', error);
  process.exit(1);
});