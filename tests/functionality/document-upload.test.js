/**
 * Document Upload Functionality Test
 * Tests for document upload and processing functionality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  url: process.env.TEST_URL || 'http://localhost:8081',
  uploadPath: '/upload',
  testPdfPath: path.join(__dirname, '../../test-files/sample.pdf'),
  screenshotsDir: path.join(__dirname, '../results/screenshots/document-upload')
};

// Create screenshots directory
if (!fs.existsSync(config.screenshotsDir)) {
  fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

// Create test PDF if it doesn't exist
if (!fs.existsSync(config.testPdfPath)) {
  const testFilesDir = path.dirname(config.testPdfPath);
  if (!fs.existsSync(testFilesDir)) {
    fs.mkdirSync(testFilesDir, { recursive: true });
  }
  
  // Create a simple PDF with text content
  fs.writeFileSync(config.testPdfPath, '%PDF-1.4\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>\nendobj\n4 0 obj\n<</Length 51>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test PDF for FinDoc Analyzer) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000102 00000 n \n0000000192 00000 n \ntrailer\n<</Size 5/Root 1 0 R>>\nstartxref\n292\n%%EOF');
  
  console.log(`Created test PDF at ${config.testPdfPath}`);
}

// Run the test
async function runTest() {
  console.log(`Testing Document Upload Functionality at ${config.url}${config.uploadPath}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    feature: 'Document Upload',
    url: `${config.url}${config.uploadPath}`,
    steps: {},
    success: false
  };
  
  try {
    const page = await browser.newPage();
    
    // Step 1: Navigate to upload page
    console.log('Step 1: Navigating to upload page...');
    await page.goto(`${config.url}${config.uploadPath}`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.screenshot({ 
      path: path.join(config.screenshotsDir, '01-upload-page.png'),
      fullPage: true
    });
    
    results.steps['navigate'] = { success: true };
    
    // Step 2: Check for upload form
    console.log('Step 2: Checking for upload form...');
    const uploadForm = await page.$('form');
    const fileInput = await page.$('input[type="file"]');
    const submitButton = await page.$('button[type="submit"]');
    
    if (uploadForm && fileInput && submitButton) {
      console.log('✅ Upload form found with file input and submit button');
      results.steps['form'] = { success: true };
    } else {
      console.log('❌ Upload form not found or missing components');
      results.steps['form'] = { 
        success: false,
        error: 'Upload form not found or missing components',
        details: {
          formFound: !!uploadForm,
          fileInputFound: !!fileInput,
          submitButtonFound: !!submitButton
        }
      };
      throw new Error('Upload form not found or missing components');
    }
    
    // Step 3: Upload a test PDF
    console.log('Step 3: Uploading test PDF...');
    
    // Set file input
    const inputElement = await page.$('input[type="file"]');
    await inputElement.uploadFile(config.testPdfPath);
    
    // Take screenshot after file selection
    await page.screenshot({ 
      path: path.join(config.screenshotsDir, '02-file-selected.png'),
      fullPage: true
    });
    
    // Click submit button
    await submitButton.click();
    
    // Wait for upload to complete (look for progress indicator or success message)
    try {
      await page.waitForSelector('#progress-container, .progress-bar, .alert-success', { 
        visible: true, 
        timeout: 10000 
      });
      
      console.log('✅ Upload started, progress indicator or success message found');
      results.steps['upload'] = { success: true };
      
      // Take screenshot of upload progress
      await page.screenshot({ 
        path: path.join(config.screenshotsDir, '03-upload-progress.png'),
        fullPage: true
      });
      
      // Wait for processing to complete (this might redirect to another page)
      await page.waitForNavigation({ timeout: 30000 }).catch(() => {
        console.log('No navigation occurred after upload');
      });
      
      // Take screenshot after processing
      await page.screenshot({ 
        path: path.join(config.screenshotsDir, '04-after-upload.png'),
        fullPage: true
      });
      
    } catch (error) {
      console.log(`❌ Upload failed: ${error.message}`);
      results.steps['upload'] = { 
        success: false,
        error: error.message
      };
      throw error;
    }
    
    // Step 4: Check for document processing
    console.log('Step 4: Checking for document processing...');
    
    // Check if we're redirected to document details or documents list
    const currentUrl = page.url();
    
    if (currentUrl.includes('document-details') || currentUrl.includes('documents-new')) {
      console.log(`✅ Redirected to ${currentUrl} after upload`);
      results.steps['redirect'] = { 
        success: true,
        url: currentUrl
      };
      
      // Check for document content or processing status
      const documentContent = await page.$('.document-content, .document-details, .document-item');
      
      if (documentContent) {
        console.log('✅ Document content or details found');
        results.steps['document'] = { success: true };
        
        // Overall success
        results.success = true;
      } else {
        console.log('❌ Document content or details not found');
        results.steps['document'] = { 
          success: false,
          error: 'Document content or details not found'
        };
      }
    } else {
      console.log(`❌ Not redirected after upload, still at ${currentUrl}`);
      results.steps['redirect'] = { 
        success: false,
        error: 'Not redirected after upload',
        url: currentUrl
      };
    }
    
  } catch (error) {
    console.error(`Error testing document upload: ${error.message}`);
    results.error = error.message;
  } finally {
    await browser.close();
  }
  
  // Save results
  const resultsDir = path.join(__dirname, '../results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, 'document-upload-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Document upload test completed. Success: ${results.success}`);
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = runTest;
