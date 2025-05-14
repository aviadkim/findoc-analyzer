/**
 * UI Components Check
 * This script checks for the presence of UI components in both local and deployed environments
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create directories for results
const resultsDir = path.join(__dirname, 'ui-test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Environments to test
const environments = [
  { name: 'Local', url: 'http://localhost:3002' },
  { name: 'Deployed', url: 'https://backv2-app-brfi73d4ra-zf.a.run.app' }
];

// UI components to test
const uiComponents = [
  { name: 'Document Chat Input', path: '/document-chat', selector: '#document-chat-input' },
  { name: 'Document Chat Send Button', path: '/document-chat', selector: '#document-send-btn' },
  { name: 'Progress Container', path: '/upload', selector: '#progress-container' },
  { name: 'Document List', path: '/documents-new', selector: '#document-list' },
  { name: 'Document Item', path: '/documents-new', selector: '.document-item' },
  { name: 'Document Actions', path: '/documents-new', selector: '.document-actions' },
  { name: 'Agent Card', path: '/test', selector: '.agent-card' },
  { name: 'Agent Status Indicator', path: '/test', selector: '.status-indicator' },
  { name: 'Agent Action Button', path: '/test', selector: '.agent-action' }
];

// Test results
const testResults = {};

// Run tests for a specific environment
async function testEnvironment(environment) {
  console.log(`Testing ${environment.name} environment (${environment.url})...`);
  
  // Initialize results for this environment
  testResults[environment.name] = {
    components: {},
    total: 0,
    found: 0,
    missing: 0
  };
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test each component
    for (const component of uiComponents) {
      console.log(`Testing ${component.name}...`);
      testResults[environment.name].total++;
      
      try {
        // Navigate to the page
        await page.goto(`${environment.url}${component.path}`, { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        });
        
        // Check if component exists
        const exists = await page.$(component.selector) !== null;
        
        // Store result
        testResults[environment.name].components[component.name] = exists;
        
        if (exists) {
          console.log(`✅ ${component.name} found`);
          testResults[environment.name].found++;
        } else {
          console.log(`❌ ${component.name} not found`);
          testResults[environment.name].missing++;
        }
      } catch (error) {
        console.error(`Error testing ${component.name}: ${error.message}`);
        testResults[environment.name].components[component.name] = false;
        testResults[environment.name].missing++;
      }
    }
  } catch (error) {
    console.error(`Error testing ${environment.name} environment: ${error.message}`);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Generate report
function generateReport() {
  console.log('Generating report...');
  
  // Create report content
  let report = '# UI Components Test Results\n\n';
  
  // Add summary for each environment
  for (const environment of environments) {
    const results = testResults[environment.name];
    const passRate = (results.found / results.total) * 100;
    
    report += `## ${environment.name} Environment\n\n`;
    report += `- **Total Components**: ${results.total}\n`;
    report += `- **Found Components**: ${results.found}\n`;
    report += `- **Missing Components**: ${results.missing}\n`;
    report += `- **Pass Rate**: ${passRate.toFixed(2)}%\n\n`;
    
    report += '### Component Details\n\n';
    report += '| Component | Status |\n';
    report += '|-----------|--------|\n';
    
    for (const [component, found] of Object.entries(results.components)) {
      report += `| ${component} | ${found ? '✅ Found' : '❌ Missing'} |\n`;
    }
    
    report += '\n';
  }
  
  // Add comparison
  report += '## Component Comparison\n\n';
  report += '| Component | Local | Deployed | Match |\n';
  report += '|-----------|-------|----------|-------|\n';
  
  for (const component of uiComponents) {
    const localFound = testResults['Local'].components[component.name];
    const deployedFound = testResults['Deployed'].components[component.name];
    const match = localFound === deployedFound;
    
    report += `| ${component.name} | ${localFound ? '✅' : '❌'} | ${deployedFound ? '✅' : '❌'} | ${match ? '✅' : '❌'} |\n`;
  }
  
  // Add recommendations
  report += '\n## Recommendations\n\n';
  
  for (const component of uiComponents) {
    const localFound = testResults['Local'].components[component.name];
    const deployedFound = testResults['Deployed'].components[component.name];
    
    if (!localFound || !deployedFound) {
      report += `### ${component.name}\n\n`;
      
      if (!localFound && !deployedFound) {
        report += `- **Issue**: Missing in both environments\n`;
        report += `- **Recommendation**: Implement the component in both environments\n`;
      } else if (!localFound) {
        report += `- **Issue**: Missing in local environment but present in deployed environment\n`;
        report += `- **Recommendation**: Implement the component in the local environment to match the deployed environment\n`;
      } else {
        report += `- **Issue**: Present in local environment but missing in deployed environment\n`;
        report += `- **Recommendation**: Deploy the component to match the local environment\n`;
      }
      
      report += '\n';
    }
  }
  
  // Write report to file
  fs.writeFileSync(path.join(resultsDir, 'ui-components-report.md'), report);
  console.log(`Report saved to ${path.join(resultsDir, 'ui-components-report.md')}`);
  
  // Also save JSON results
  fs.writeFileSync(path.join(resultsDir, 'ui-components-results.json'), JSON.stringify(testResults, null, 2));
  console.log(`Results saved to ${path.join(resultsDir, 'ui-components-results.json')}`);
}

// Main function
async function main() {
  console.log('Starting UI components check...');
  
  // Test each environment
  for (const environment of environments) {
    await testEnvironment(environment);
  }
  
  // Generate report
  generateReport();
  
  console.log('UI components check completed.');
}

// Run the main function
main();
