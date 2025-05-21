#!/usr/bin/env node

/**
 * Script to run security scans on the codebase
 * Usage: node scripts/security-scan.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  scanDependencies: true,
  scanSourceCode: true,
  scanDocker: true,
  outputDir: path.join(__dirname, '..', 'security-reports'),
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

console.log('🔒 Starting security scan...');

// Scan npm dependencies
if (config.scanDependencies) {
  console.log('\n📦 Scanning npm dependencies...');
  try {
    const auditOutput = execSync('npm audit --json', { stdio: 'pipe' }).toString();
    fs.writeFileSync(
      path.join(config.outputDir, 'npm-audit.json'),
      auditOutput
    );
    console.log('✅ npm audit completed successfully. Report saved to security-reports/npm-audit.json');
    
    try {
      const auditData = JSON.parse(auditOutput);
      const vulnerabilities = auditData.vulnerabilities || {};
      const vulnCount = Object.keys(vulnerabilities).length;
      
      if (vulnCount > 0) {
        console.log(`⚠️  Found ${vulnCount} vulnerabilities in dependencies`);
        const highCount = Object.values(vulnerabilities).filter(v => v.severity === 'high').length;
        const criticalCount = Object.values(vulnerabilities).filter(v => v.severity === 'critical').length;
        
        if (highCount > 0 || criticalCount > 0) {
          console.log(`🚨 WARNING: Found ${highCount} high and ${criticalCount} critical vulnerabilities!`);
          console.log('📝 Run npm audit fix to automatically fix issues that don\'t require major version updates');
        }
      } else {
        console.log('✅ No vulnerabilities found in dependencies');
      }
    } catch (e) {
      console.error('⚠️  Error parsing npm audit output:', e);
    }
  } catch (error) {
    console.error('❌ npm audit failed:', error.message);
    fs.writeFileSync(
      path.join(config.outputDir, 'npm-audit-error.log'),
      error.message
    );
  }
}

// Scan source code with ESLint security plugin
if (config.scanSourceCode) {
  console.log('\n📄 Scanning source code with ESLint security plugin...');
  try {
    const eslintOutput = execSync(
      'npx eslint --ext .js,.ts . -c .eslintrc.js --no-eslintrc --plugin security --rule "security/detect-eval-with-expression: error" --rule "security/detect-non-literal-regexp: error" --rule "security/detect-buffer-noassert: error" --rule "security/detect-unsafe-regex: error" --rule "security/detect-object-injection: warn" -f json',
      { stdio: 'pipe' }
    ).toString();
    
    fs.writeFileSync(
      path.join(config.outputDir, 'eslint-security.json'),
      eslintOutput
    );
    console.log('✅ ESLint security scan completed. Report saved to security-reports/eslint-security.json');
    
    try {
      const eslintData = JSON.parse(eslintOutput);
      const errorCount = eslintData.reduce((sum, file) => sum + file.errorCount, 0);
      const warningCount = eslintData.reduce((sum, file) => sum + file.warningCount, 0);
      
      if (errorCount > 0 || warningCount > 0) {
        console.log(`⚠️  Found ${errorCount} errors and ${warningCount} warnings in source code`);
      } else {
        console.log('✅ No security issues found in source code');
      }
    } catch (e) {
      console.error('⚠️  Error parsing ESLint output:', e);
    }
  } catch (error) {
    console.error('❌ ESLint security scan failed:', error.message);
    fs.writeFileSync(
      path.join(config.outputDir, 'eslint-security-error.log'),
      error.message
    );
  }
}

// Scan Docker image with trivy
if (config.scanDocker) {
  console.log('\n🐳 Scanning Docker image with trivy...');
  try {
    if (!fs.existsSync('Dockerfile.production')) {
      console.log('⚠️  Dockerfile.production not found, skipping Docker scan');
    } else {
      // Build the image
      console.log('Building Docker image for scanning...');
      try {
        execSync('docker build -t findoc-analyzer-scan:latest -f Dockerfile.production .', { stdio: 'inherit' });
        
        // Scan the image
        console.log('Scanning Docker image...');
        const trivyOutput = execSync(
          'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --format json findoc-analyzer-scan:latest',
          { stdio: 'pipe' }
        ).toString();
        
        fs.writeFileSync(
          path.join(config.outputDir, 'trivy-docker.json'),
          trivyOutput
        );
        console.log('✅ Trivy Docker scan completed. Report saved to security-reports/trivy-docker.json');
        
        try {
          const trivyData = JSON.parse(trivyOutput);
          const vulnerabilities = trivyData.Results.reduce((sum, result) => {
            return sum + (result.Vulnerabilities ? result.Vulnerabilities.length : 0);
          }, 0);
          
          if (vulnerabilities > 0) {
            console.log(`⚠️  Found ${vulnerabilities} vulnerabilities in Docker image`);
          } else {
            console.log('✅ No vulnerabilities found in Docker image');
          }
        } catch (e) {
          console.error('⚠️  Error parsing Trivy output:', e);
        }
      } catch (buildError) {
        console.error('❌ Docker build failed, skipping Docker scan:', buildError.message);
      }
    }
  } catch (error) {
    console.error('❌ Trivy Docker scan failed:', error.message);
    fs.writeFileSync(
      path.join(config.outputDir, 'trivy-docker-error.log'),
      error.message
    );
  }
}

console.log('\n🔒 Security scan completed!');
console.log(`📊 Reports are available in the ${config.outputDir} directory`);