#\!/bin/bash
# UI Components Test Script for Deployed Application

# Configuration
DEFAULT_URL="https://findoc-analyzer.uc.r.appspot.com"
TIMEOUT=30  # Seconds to wait for puppeteer
TEST_DIR="ui-test-results"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -eq 0 ]; then
  URL=$DEFAULT_URL
  echo -e "${YELLOW}No URL provided, using default: $URL${NC}"
else
  URL=$1
  echo -e "${YELLOW}Testing URL: $URL${NC}"
fi

# Create test results directory
mkdir -p $TEST_DIR

# Create test script for Puppeteer
cat > test-ui-components.js << 'EOF'
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Get URL from command line argument or use default
const url = process.argv[2] || 'https://findoc-analyzer.uc.r.appspot.com';
const testDir = process.argv[3] || 'ui-test-results';

// Create results directory if it doesn't exist
if (\!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Function to create HTML report
function createHtmlReport(results) {
  const reportPath = path.join(testDir, 'test-report.html');
  const reportHtml = `
<\!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Components Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 30px; }
    .summary { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .test-group { margin-bottom: 30px; border: 1px solid #eee; padding: 15px; border-radius: 5px; }
    .test-result { margin: 10px 0; padding: 10px; border-radius: 5px; }
    .pass { background-color: #d4edda; border-left: 5px solid #28a745; }
    .fail { background-color: #f8d7da; border-left: 5px solid #dc3545; }
    .test-title { font-weight: bold; margin-bottom: 5px; }
    .test-details { margin-left: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    table, th, td { border: 1px solid #ddd; }
    th, td { padding: 10px; text-align: left; }
    th { background-color: #f5f5f5; }
    .screenshot { max-width: 100%; height: auto; border: 1px solid #ddd; margin: 10px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>UI Components Test Report</h1>
  <div class="summary">
    <p><strong>URL tested:</strong> ${url}</p>
    <p><strong>Test date:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Total tests:</strong> ${results.total}</p>
    <p><strong>Passed:</strong> ${results.passed} (${Math.round(results.passed / results.total * 100)}%)</p>
    <p><strong>Failed:</strong> ${results.failed} (${Math.round(results.failed / results.total * 100)}%)</p>
  </div>

  <h2>Test Results</h2>
  ${results.tests.map(group => `
    <div class="test-group">
      <h3>${group.page}</h3>
      ${group.results.map(test => `
        <div class="test-result ${test.status ? 'pass' : 'fail'}">
          <div class="test-title">${test.name}: ${test.status ? 'Pass' : 'Fail'}</div>
          <div class="test-details">
            <p>${test.details || ''}</p>
            ${test.screenshot ? `<img src="${test.screenshot}" alt="Screenshot" class="screenshot">` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `).join('')}
</body>
</html>
  `;

  fs.writeFileSync(reportPath, reportHtml);
  return reportPath;
}

// Main function to run tests
async function runTests() {
  console.log(`Starting UI component tests for ${url}`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  
  // Create test results object
  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  try {
    // Test home page
    const homePageResults = await testHomePage(browser);
    testResults.tests.push(homePageResults);
    testResults.total += homePageResults.results.length;
    testResults.passed += homePageResults.results.filter(r => r.status).length;
    testResults.failed += homePageResults.results.filter(r => \!r.status).length;
    
    // Test upload page
    const uploadPageResults = await testUploadPage(browser);
    testResults.tests.push(uploadPageResults);
    testResults.total += uploadPageResults.results.length;
    testResults.passed += uploadPageResults.results.filter(r => r.status).length;
    testResults.failed += uploadPageResults.results.filter(r => \!r.status).length;
    
    // Test documents page
    const documentsPageResults = await testDocumentsPage(browser);
    testResults.tests.push(documentsPageResults);
    testResults.total += documentsPageResults.results.length;
    testResults.passed += documentsPageResults.results.filter(r => r.status).length;
    testResults.failed += documentsPageResults.results.filter(r => \!r.status).length;
    
    // Test document chat page
    const chatPageResults = await testDocumentChatPage(browser);
    testResults.tests.push(chatPageResults);
    testResults.total += chatPageResults.results.length;
    testResults.passed += chatPageResults.results.filter(r => r.status).length;
    testResults.failed += chatPageResults.results.filter(r => \!r.status).length;
    
    // Create and save test results
    const jsonPath = path.join(testDir, 'test-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(testResults, null, 2));
    
    // Create HTML report
    const reportPath = createHtmlReport(testResults);
    console.log(`Test report saved to ${reportPath}`);
    console.log(`Summary: ${testResults.passed} passed, ${testResults.failed} failed (${Math.round(testResults.passed / testResults.total * 100)}% pass rate)`);
    
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    await browser.close();
  }
}

// Test functions for specific pages
async function testHomePage(browser) {
  console.log('Testing home page');
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${url}/`, { waitUntil: 'networkidle2', timeout: 30000 });
  
  const homeTests = {
    page: 'Home Page',
    results: []
  };
  
  // Take screenshot
  const screenshot = path.join(testDir, 'homepage.png');
  await page.screenshot({ path: screenshot });
  
  // Test 1: Verify page loaded
  homeTests.results.push({
    name: 'Page Load',
    status: await page.title().then(title => title \!== ''),
    details: 'Verify home page loads successfully',
    screenshot: screenshot
  });
  
  // Test 2: Verify chat button exists
  let chatButtonExists = await page.evaluate(() => {
    return \!\!document.getElementById('show-chat-btn');
  });
  homeTests.results.push({
    name: 'Chat Button',
    status: chatButtonExists,
    details: 'Verify chat button is visible on the page'
  });
  
  // Test 3: Verify chat functionality works
  if (chatButtonExists) {
    await page.click('#show-chat-btn');
    await page.waitForTimeout(1000);
    
    const chatScreenshot = path.join(testDir, 'chat-opened.png');
    await page.screenshot({ path: chatScreenshot });
    
    const chatContainerVisible = await page.evaluate(() => {
      const container = document.getElementById('document-chat-container');
      if (\!container) return false;
      
      const style = window.getComputedStyle(container);
      return style.display \!== 'none';
    });
    
    homeTests.results.push({
      name: 'Chat Functionality',
      status: chatContainerVisible,
      details: 'Verify chat container opens when chat button is clicked',
      screenshot: chatScreenshot
    });
  }
  
  await page.close();
  return homeTests;
}

async function testUploadPage(browser) {
  console.log('Testing upload page');
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${url}/upload`, { waitUntil: 'networkidle2', timeout: 30000 });
  
  const uploadTests = {
    page: 'Upload Page',
    results: []
  };
  
  // Take screenshot
  const screenshot = path.join(testDir, 'upload-page.png');
  await page.screenshot({ path: screenshot });
  
  // Test 1: Verify page loaded
  uploadTests.results.push({
    name: 'Page Load',
    status: await page.title().then(title => title \!== ''),
    details: 'Verify upload page loads successfully',
    screenshot: screenshot
  });
  
  // Test 2: Verify process button exists
  const processButtonExists = await page.evaluate(() => {
    return \!\!document.getElementById('process-document-btn');
  });
  uploadTests.results.push({
    name: 'Process Button',
    status: processButtonExists,
    details: 'Verify process document button is visible on the page'
  });
  
  // Test 3: Verify chat button exists
  const chatButtonExists = await page.evaluate(() => {
    return \!\!document.getElementById('show-chat-btn');
  });
  uploadTests.results.push({
    name: 'Chat Button',
    status: chatButtonExists,
    details: 'Verify chat button is visible on the upload page'
  });
  
  // Test 4: Verify file upload form exists
  const fileUploadExists = await page.evaluate(() => {
    const form = document.querySelector('form');
    const fileInput = form && form.querySelector('input[type="file"]');
    return \!\!fileInput;
  });
  uploadTests.results.push({
    name: 'File Upload Form',
    status: fileUploadExists,
    details: 'Verify file upload form exists on the page'
  });
  
  await page.close();
  return uploadTests;
}

async function testDocumentsPage(browser) {
  console.log('Testing documents page');
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${url}/documents-new`, { waitUntil: 'networkidle2', timeout: 30000 });
  
  const documentsTests = {
    page: 'Documents Page',
    results: []
  };
  
  // Take screenshot
  const screenshot = path.join(testDir, 'documents-page.png');
  await page.screenshot({ path: screenshot });
  
  // Test 1: Verify page loaded
  documentsTests.results.push({
    name: 'Page Load',
    status: await page.title().then(title => title \!== ''),
    details: 'Verify documents page loads successfully',
    screenshot: screenshot
  });
  
  // Test 2: Verify document list exists
  const documentListExists = await page.evaluate(() => {
    return \!\!document.querySelector('.document-list, .documents-container, .document-grid');
  });
  documentsTests.results.push({
    name: 'Document List',
    status: documentListExists,
    details: 'Verify document list component is visible on the page'
  });
  
  // Test 3: Verify chat button exists
  const chatButtonExists = await page.evaluate(() => {
    return \!\!document.getElementById('show-chat-btn');
  });
  documentsTests.results.push({
    name: 'Chat Button',
    status: chatButtonExists,
    details: 'Verify chat button is visible on the documents page'
  });
  
  await page.close();
  return documentsTests;
}

async function testDocumentChatPage(browser) {
  console.log('Testing document chat page');
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${url}/document-chat`, { waitUntil: 'networkidle2', timeout: 30000 });
  
  const chatTests = {
    page: 'Document Chat Page',
    results: []
  };
  
  // Take screenshot
  const screenshot = path.join(testDir, 'document-chat-page.png');
  await page.screenshot({ path: screenshot });
  
  // Test 1: Verify page loaded
  chatTests.results.push({
    name: 'Page Load',
    status: await page.title().then(title => title \!== ''),
    details: 'Verify document chat page loads successfully',
    screenshot: screenshot
  });
  
  // Test 2: Verify chat container exists and is visible
  const chatContainerVisible = await page.evaluate(() => {
    const container = document.getElementById('document-chat-container');
    if (\!container) return false;
    
    const style = window.getComputedStyle(container);
    return style.display \!== 'none';
  });
  chatTests.results.push({
    name: 'Chat Container',
    status: chatContainerVisible,
    details: 'Verify document chat container is visible on the page'
  });
  
  // Test 3: Verify document selector exists
  const documentSelectorExists = await page.evaluate(() => {
    return \!\!document.getElementById('document-select');
  });
  chatTests.results.push({
    name: 'Document Selector',
    status: documentSelectorExists,
    details: 'Verify document selector dropdown is visible on the page'
  });
  
  // Test 4: Verify chat input exists
  const chatInputExists = await page.evaluate(() => {
    return \!\!document.getElementById('question-input');
  });
  chatTests.results.push({
    name: 'Chat Input',
    status: chatInputExists,
    details: 'Verify chat input field is visible on the page'
  });
  
  // Test 5: Verify send button exists
  const sendButtonExists = await page.evaluate(() => {
    return \!\!document.getElementById('send-btn') || \!\!document.getElementById('document-send-btn');
  });
  chatTests.results.push({
    name: 'Send Button',
    status: sendButtonExists,
    details: 'Verify send button is visible on the page'
  });
  
  await page.close();
  return chatTests;
}

// Run all tests
runTests();
EOF

# Check if Node.js and npm are installed
if \! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed${NC}"
  echo "Please install Node.js: https://nodejs.org/"
  exit 1
fi

# Check if puppeteer is installed
if \! npm list -g puppeteer &> /dev/null; then
  echo -e "${YELLOW}Installing puppeteer globally...${NC}"
  npm install -g puppeteer
fi

# Run the test
echo -e "${GREEN}Running UI component tests...${NC}"
node test-ui-components.js "$URL" "$TEST_DIR"

# Check if the test completed successfully
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Tests completed successfully\!${NC}"
  
  # Check if report was generated
  if [ -f "${TEST_DIR}/test-report.html" ]; then
    echo -e "${GREEN}Test report generated: ${TEST_DIR}/test-report.html${NC}"
    
    # Display summary from JSON results
    if [ -f "${TEST_DIR}/test-results.json" ]; then
      TOTAL=$(grep -o '"total":[0-9]*' "${TEST_DIR}/test-results.json"  < /dev/null |  cut -d: -f2)
      PASSED=$(grep -o '"passed":[0-9]*' "${TEST_DIR}/test-results.json" | cut -d: -f2)
      FAILED=$(grep -o '"failed":[0-9]*' "${TEST_DIR}/test-results.json" | cut -d: -f2)
      
      if [ \! -z "$TOTAL" ] && [ \! -z "$PASSED" ] && [ \! -z "$FAILED" ]; then
        PASS_RATE=$((PASSED * 100 / TOTAL))
        echo -e "${GREEN}Test Summary: ${PASSED}/${TOTAL} tests passed (${PASS_RATE}% pass rate)${NC}"
        
        if [ $FAILED -gt 0 ]; then
          echo -e "${YELLOW}${FAILED} tests failed. Check the report for details.${NC}"
        fi
      fi
    fi
  else
    echo -e "${RED}Error: Test report not generated${NC}"
  fi
else
  echo -e "${RED}Error running tests${NC}"
fi

# Clean up
rm -f test-ui-components.js

echo ""
echo "Next steps:"
echo "1. Open ${TEST_DIR}/test-report.html in a browser to view detailed results"
echo "2. Check the screenshots in the ${TEST_DIR} directory"
echo "3. If there are failing tests, fix the issues and re-deploy"
