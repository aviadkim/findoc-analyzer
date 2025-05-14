/**
 * Basic UI Components Test
 * Tests for the presence of essential UI components
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create results directory
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:3002',
  components: [
    { name: 'Navigation Bar', selector: 'nav', page: '/' },
    { name: 'Document List', selector: '#document-list', page: '/documents-new' },
    { name: 'Upload Form', selector: 'form[enctype="multipart/form-data"]', page: '/upload' },
    { name: 'Chat Input', selector: '#document-chat-input', page: '/document-chat' },
    { name: 'Chat Send Button', selector: '#document-send-btn', page: '/document-chat' }
  ]
};

async function runTest() {
  console.log(`Testing basic UI components at ${config.url}...`);
  
  const results = {
    total: config.components.length,
    passed: 0,
    failed: 0,
    components: {}
  };
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    for (const component of config.components) {
      console.log(`Testing ${component.name}...`);
      
      try {
        // Navigate to the page
        await page.goto(`${config.url}${component.page}`, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Check if component exists
        const exists = await page.$(component.selector) !== null;
        
        results.components[component.name] = {
          exists,
          selector: component.selector,
          page: component.page
        };
        
        if (exists) {
          console.log(`✅ ${component.name} found`);
          results.passed++;
        } else {
          console.log(`❌ ${component.name} not found`);
          results.failed++;
        }
      } catch (error) {
        console.error(`Error testing ${component.name}: ${error.message}`);
        results.components[component.name] = {
          exists: false,
          selector: component.selector,
          page: component.page,
          error: error.message
        };
        results.failed++;
      }
    }
  } finally {
    await browser.close();
  }
  
  // Calculate pass rate
  results.passRate = (results.passed / results.total) * 100;
  
  // Save results
  fs.writeFileSync(
    path.join(resultsDir, 'basic-ui-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  // Generate report
  const report = `
# Basic UI Components Test Results

Test URL: ${config.url}
Date: ${new Date().toISOString()}

## Summary
- Total components tested: ${results.total}
- Components found: ${results.passed}
- Components missing: ${results.failed}
- Pass rate: ${results.passRate.toFixed(2)}%

## Component Details

${Object.entries(results.components).map(([name, data]) => `
### ${name}
- **Status**: ${data.exists ? '✅ Found' : '❌ Missing'}
- **Selector**: \`${data.selector}\`
- **Page**: \`${data.page}\`
${data.error ? `- **Error**: ${data.error}` : ''}
`).join('\n')}

## Recommendations

${results.failed > 0 ? `
The following components need to be implemented or fixed:

${Object.entries(results.components)
  .filter(([_, data]) => !data.exists)
  .map(([name, data]) => `- ${name} (on page \`${data.page}\` with selector \`${data.selector}\`)`)
  .join('\n')}
` : 'All basic UI components are present. No action needed.'}
`;
  
  fs.writeFileSync(
    path.join(resultsDir, 'basic-ui-test-report.md'),
    report
  );
  
  console.log(`Test completed. Results saved to ${path.join(resultsDir, 'basic-ui-test-results.json')}`);
  console.log(`Report saved to ${path.join(resultsDir, 'basic-ui-test-report.md')}`);
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { runTest };
