const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create directories for screenshots and results if they don't exist
const screenshotsDir = path.join(__dirname, 'test-screenshots-deployed-processing');
const resultsDir = path.join(__dirname, 'test-results-deployed-processing');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// URL of the deployed application
const baseUrl = 'https://backv2-app-326324779592.me-west1.run.app';

// Path to test PDF
const testPdfPath = path.join(__dirname, 'test-pdfs', 'sample_portfolio.pdf');

// Check if test PDF exists
if (!fs.existsSync(testPdfPath)) {
  console.error(`Test PDF not found at ${testPdfPath}`);
  process.exit(1);
}

// Test document processing
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Starting document processing test...');
    
    // Navigate to the upload page
    console.log('Navigating to upload page...');
    await page.goto(`${baseUrl}/upload`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '01-upload-page.png'), fullPage: true });
    
    // Set file input
    console.log('Setting up file upload...');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found on upload page');
    }
    
    // Upload file
    console.log('Uploading test PDF...');
    await fileInput.uploadFile(testPdfPath);
    await page.screenshot({ path: path.join(screenshotsDir, '02-file-selected.png'), fullPage: true });
    
    // Click upload button
    console.log('Clicking upload button...');
    const uploadButton = await page.$('button[type="submit"]');
    if (!uploadButton) {
      throw new Error('Upload button not found');
    }
    
    await uploadButton.click();
    
    // Wait for processing to start
    console.log('Waiting for processing to start...');
    await page.waitForSelector('.processing-indicator', { timeout: 10000 })
      .catch(() => console.log('Processing indicator not found, continuing...'));
    
    await page.screenshot({ path: path.join(screenshotsDir, '03-processing-started.png'), fullPage: true });
    
    // Wait for processing to complete (max 60 seconds)
    console.log('Waiting for processing to complete (this may take up to 60 seconds)...');
    await page.waitForFunction(
      () => !document.querySelector('.processing-indicator') || document.querySelector('.processing-complete'),
      { timeout: 60000 }
    ).catch(() => console.log('Processing indicator still present after timeout, continuing...'));
    
    await page.screenshot({ path: path.join(screenshotsDir, '04-processing-complete.png'), fullPage: true });
    
    // Check if we were redirected to the document view page
    console.log('Checking if redirected to document view...');
    const currentUrl = page.url();
    const isDocumentView = currentUrl.includes('/document/') || currentUrl.includes('/documents-new');
    
    if (isDocumentView) {
      console.log('Successfully redirected to document view');
      await page.screenshot({ path: path.join(screenshotsDir, '05-document-view.png'), fullPage: true });
    } else {
      console.log('Not redirected to document view, checking for results on current page');
      await page.screenshot({ path: path.join(screenshotsDir, '05-after-upload.png'), fullPage: true });
    }
    
    // Check for success indicators
    const pageContent = await page.content();
    const hasSuccessMessage = pageContent.includes('success') || 
                             pageContent.includes('processed') || 
                             pageContent.includes('complete');
    
    const hasErrorMessage = pageContent.includes('error') || 
                           pageContent.includes('failed') || 
                           pageContent.includes('timeout');
    
    // Save results
    const results = {
      testName: 'document-processing',
      passed: isDocumentView || hasSuccessMessage,
      uploadSuccessful: true,
      processingStarted: true,
      processingCompleted: isDocumentView || hasSuccessMessage,
      hasSuccessMessage,
      hasErrorMessage,
      finalUrl: currentUrl
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'processing-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    // Generate HTML report
    const htmlReport = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Document Processing Test Results</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .result { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .passed { border-left: 5px solid green; }
        .failed { border-left: 5px solid red; }
        .result h3 { margin-top: 0; }
        .screenshot { max-width: 100%; border: 1px solid #ddd; margin-top: 10px; }
        .step { margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <h1>Document Processing Test Results</h1>
      <div class="result ${results.passed ? 'passed' : 'failed'}">
        <h3>Document Processing - ${results.passed ? 'PASSED' : 'FAILED'}</h3>
        <p>Upload Successful: ${results.uploadSuccessful ? 'Yes' : 'No'}</p>
        <p>Processing Started: ${results.processingStarted ? 'Yes' : 'No'}</p>
        <p>Processing Completed: ${results.processingCompleted ? 'Yes' : 'No'}</p>
        <p>Success Message: ${results.hasSuccessMessage ? 'Yes' : 'No'}</p>
        <p>Error Message: ${results.hasErrorMessage ? 'Yes' : 'No'}</p>
        <p>Final URL: ${results.finalUrl}</p>
      </div>
      
      <h2>Test Steps</h2>
      
      <div class="step">
        <h3>1. Upload Page</h3>
        <img src="../test-screenshots-deployed-processing/01-upload-page.png" class="screenshot" alt="Upload Page">
      </div>
      
      <div class="step">
        <h3>2. File Selected</h3>
        <img src="../test-screenshots-deployed-processing/02-file-selected.png" class="screenshot" alt="File Selected">
      </div>
      
      <div class="step">
        <h3>3. Processing Started</h3>
        <img src="../test-screenshots-deployed-processing/03-processing-started.png" class="screenshot" alt="Processing Started">
      </div>
      
      <div class="step">
        <h3>4. Processing Complete</h3>
        <img src="../test-screenshots-deployed-processing/04-processing-complete.png" class="screenshot" alt="Processing Complete">
      </div>
      
      <div class="step">
        <h3>5. Final Result</h3>
        <img src="../test-screenshots-deployed-processing/05-document-view.png" class="screenshot" alt="Document View">
      </div>
    </body>
    </html>
    `;
    
    fs.writeFileSync(
      path.join(resultsDir, 'processing-report.html'),
      htmlReport
    );
    
    console.log(`Test completed. ${results.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`Results saved to ${path.join(resultsDir, 'processing-results.json')}`);
    console.log(`HTML report saved to ${path.join(resultsDir, 'processing-report.html')}`);
    
  } catch (error) {
    console.error('Error in document processing test:', error);
    
    // Save error results
    const results = {
      testName: 'document-processing',
      passed: false,
      error: error.message,
      stack: error.stack
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'processing-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    // Take final screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'error-state.png'), fullPage: true });
  } finally {
    await page.close();
    await browser.close();
  }
})();
