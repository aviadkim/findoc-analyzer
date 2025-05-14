const puppeteer = require('puppeteer');
const fs = require('fs');

// Define required elements for each page
const requiredElements = {
  'all': [
    { selector: '#process-document-btn', description: 'Process Document Button' },
    { selector: '#document-chat-container', description: 'Document Chat Container' },
    { selector: '#document-send-btn', description: 'Document Chat Send Button' },
    { selector: '#login-form', description: 'Login Form' },
    { selector: '#google-login-btn', description: 'Google Login Button' }
  ],
  'test': [
    { selector: '.agent-card', description: 'Agent Cards' },
    { selector: '.status-indicator', description: 'Agent Status Indicators' },
    { selector: '.agent-action', description: 'Agent Action Buttons' }
  ]
};

// URLs to test
const urls = [
  'https://backv2-app-brfi73d4ra-zf.a.run.app/',
  'https://backv2-app-brfi73d4ra-zf.a.run.app/documents-new',
  'https://backv2-app-brfi73d4ra-zf.a.run.app/upload',
  'https://backv2-app-brfi73d4ra-zf.a.run.app/document-chat',
  'https://backv2-app-brfi73d4ra-zf.a.run.app/login',
  'https://backv2-app-brfi73d4ra-zf.a.run.app/test'
];

// Function to validate UI elements on a page
async function validatePage(page, url) {
  console.log(`Validating URL: ${url}`);
  
  // Navigate to the page
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Take a screenshot
  const screenshotPath = `validation-${url.split('/').pop() || 'home'}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved to ${screenshotPath}`);
  
  // Determine which elements to validate
  let elementsToValidate = [...requiredElements['all']];
  if (url.includes('/test')) {
    elementsToValidate = [...elementsToValidate, ...requiredElements['test']];
  }
  
  // Validate elements
  const results = [];
  for (const element of elementsToValidate) {
    const found = await page.$(element.selector);
    const isVisible = found ? await page.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }, found) : false;
    
    results.push({
      selector: element.selector,
      description: element.description,
      found: !!found,
      visible: isVisible
    });
    
    console.log(`${element.description} (${element.selector}): ${found ? 'Found' : 'Not found'}, ${isVisible ? 'Visible' : 'Not visible'}`);
  }
  
  return results;
}

// Main function
async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({ width: 1280, height: 800 });
  
  // Results object
  const allResults = {};
  
  // Validate each URL
  for (const url of urls) {
    allResults[url] = await validatePage(page, url);
  }
  
  // Save results to file
  fs.writeFileSync('deployed-ui-validation-results.json', JSON.stringify(allResults, null, 2));
  console.log('Results saved to deployed-ui-validation-results.json');
  
  // Generate summary
  const summary = {
    totalElements: 0,
    foundElements: 0,
    visibleElements: 0,
    missingElements: []
  };
  
  for (const url in allResults) {
    for (const result of allResults[url]) {
      summary.totalElements++;
      if (result.found) summary.foundElements++;
      if (result.visible) summary.visibleElements++;
      if (!result.found) {
        summary.missingElements.push({
          url,
          selector: result.selector,
          description: result.description
        });
      }
    }
  }
  
  console.log('\nSummary:');
  console.log(`Total elements: ${summary.totalElements}`);
  console.log(`Found elements: ${summary.foundElements} (${Math.round(summary.foundElements / summary.totalElements * 100)}%)`);
  console.log(`Visible elements: ${summary.visibleElements} (${Math.round(summary.visibleElements / summary.totalElements * 100)}%)`);
  console.log(`Missing elements: ${summary.missingElements.length} (${Math.round(summary.missingElements.length / summary.totalElements * 100)}%)`);
  
  if (summary.missingElements.length > 0) {
    console.log('\nMissing elements:');
    for (const element of summary.missingElements) {
      console.log(`- ${element.description} (${element.selector}) on ${element.url}`);
    }
  }
  
  // Save summary to file
  fs.writeFileSync('deployed-ui-validation-summary.json', JSON.stringify(summary, null, 2));
  console.log('Summary saved to deployed-ui-validation-summary.json');
  
  await browser.close();
}

main().catch(console.error);
