/**
 * Document Upload Test
 * Tests the document upload functionality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create results directory
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:3002',
  uploadPage: '/upload',
  testFile: path.join(__dirname, 'test-files', 'sample.pdf'),
  timeout: 60000 // 1 minute timeout for upload
};

// Create test file if it doesn't exist
if (!fs.existsSync(path.dirname(config.testFile))) {
  fs.mkdirSync(path.dirname(config.testFile), { recursive: true });
}

// Create a simple PDF file for testing if it doesn't exist
if (!fs.existsSync(config.testFile)) {
  console.log(`Creating test file at ${config.testFile}...`);
  
  // Simple PDF content (minimal valid PDF)
  const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000102 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
178
%%EOF`;
  
  fs.writeFileSync(config.testFile, pdfContent);
}

async function runTest() {
  console.log(`Testing document upload at ${config.url}${config.uploadPage}...`);
  
  const results = {
    steps: [],
    success: false,
    error: null
  };
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to upload page
    results.steps.push({ name: 'Navigate to upload page', status: 'running' });
    await page.goto(`${config.url}${config.uploadPage}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, 'upload-page.png') });
    results.steps[0].status = 'passed';
    
    // Step 2: Check if file input exists
    results.steps.push({ name: 'Check file input', status: 'running' });
    const fileInputExists = await page.$('input[type="file"]') !== null;
    
    if (!fileInputExists) {
      results.steps[1].status = 'failed';
      results.steps[1].error = 'File input not found';
      throw new Error('File input not found');
    }
    
    results.steps[1].status = 'passed';
    
    // Step 3: Upload file
    results.steps.push({ name: 'Upload file', status: 'running' });
    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile(config.testFile);
    await page.screenshot({ path: path.join(screenshotsDir, 'file-selected.png') });
    results.steps[2].status = 'passed';
    
    // Step 4: Submit form
    results.steps.push({ name: 'Submit form', status: 'running' });
    
    // Find the submit button
    const submitButton = await page.$('button[type="submit"], input[type="submit"], button:contains("Upload"), button:contains("Submit")');
    
    if (!submitButton) {
      results.steps[3].status = 'failed';
      results.steps[3].error = 'Submit button not found';
      throw new Error('Submit button not found');
    }
    
    await submitButton.click();
    await page.screenshot({ path: path.join(screenshotsDir, 'form-submitted.png') });
    results.steps[3].status = 'passed';
    
    // Step 5: Wait for upload to complete
    results.steps.push({ name: 'Wait for upload to complete', status: 'running' });
    
    try {
      // Wait for progress indicator or success message
      await page.waitForSelector('#progress-container, .success-message, .alert-success', { 
        timeout: config.timeout,
        visible: true
      });
      
      await page.screenshot({ path: path.join(screenshotsDir, 'upload-complete.png') });
      results.steps[4].status = 'passed';
    } catch (error) {
      results.steps[4].status = 'failed';
      results.steps[4].error = `Timeout waiting for upload to complete: ${error.message}`;
      throw new Error(`Timeout waiting for upload to complete: ${error.message}`);
    }
    
    // All steps passed
    results.success = true;
    
  } catch (error) {
    console.error(`Error during document upload test: ${error.message}`);
    results.error = error.message;
    
    // Take screenshot of error state
    await page.screenshot({ path: path.join(screenshotsDir, 'upload-error.png') });
    
  } finally {
    await browser.close();
  }
  
  // Save results
  fs.writeFileSync(
    path.join(resultsDir, 'document-upload-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  // Generate report
  const report = `
# Document Upload Test Results

Test URL: ${config.url}${config.uploadPage}
Date: ${new Date().toISOString()}
Test File: ${config.testFile}
Overall Result: ${results.success ? '✅ Passed' : '❌ Failed'}
${results.error ? `Error: ${results.error}` : ''}

## Test Steps

${results.steps.map((step, index) => `
### Step ${index + 1}: ${step.name}
- **Status**: ${step.status === 'passed' ? '✅ Passed' : '❌ Failed'}
${step.error ? `- **Error**: ${step.error}` : ''}
`).join('\n')}

## Screenshots

The following screenshots were captured during the test:
- [Upload Page](../screenshots/upload-page.png)
- [File Selected](../screenshots/file-selected.png)
- [Form Submitted](../screenshots/form-submitted.png)
${results.success ? '- [Upload Complete](../screenshots/upload-complete.png)' : '- [Upload Error](../screenshots/upload-error.png)'}

## Recommendations

${!results.success ? `
The document upload functionality needs to be fixed:

${results.steps
  .filter(step => step.status === 'failed')
  .map(step => `- Fix "${step.name}" step: ${step.error}`)
  .join('\n')}
` : 'The document upload functionality is working correctly. No action needed.'}
`;
  
  fs.writeFileSync(
    path.join(resultsDir, 'document-upload-test-report.md'),
    report
  );
  
  console.log(`Test completed. Results saved to ${path.join(resultsDir, 'document-upload-test-results.json')}`);
  console.log(`Report saved to ${path.join(resultsDir, 'document-upload-test-report.md')}`);
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { runTest };
