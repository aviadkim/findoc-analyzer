/**
 * FinDoc Analyzer Upload Test
 *
 * This script tests the upload functionality of the FinDoc Analyzer application.
 */

const { MicroTestRunner } = require('./micro-test-framework');
const path = require('path');
const fs = require('fs');

// Create a test PDF file if it doesn't exist
const testPdfPath = path.join(__dirname, 'test-documents', 'test-upload.pdf');
const testPdfDir = path.dirname(testPdfPath);

if (!fs.existsSync(testPdfDir)) {
  fs.mkdirSync(testPdfDir, { recursive: true });
}

if (!fs.existsSync(testPdfPath)) {
  // Create a simple PDF file
  const simplePdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog
   /Pages 2 0 R
>>
endobj
2 0 obj
<< /Type /Pages
   /Kids [3 0 R]
   /Count 1
>>
endobj
3 0 obj
<< /Type /Page
   /Parent 2 0 R
   /Resources << /Font << /F1 4 0 R >>
                 /ProcSet [/PDF /Text] >>
   /MediaBox [0 0 612 792]
   /Contents 5 0 R
>>
endobj
4 0 obj
<< /Type /Font
   /Subtype /Type1
   /BaseFont /Helvetica
>>
endobj
5 0 obj
<< /Length 100 >>
stream
BT
/F1 24 Tf
50 700 Td
(Test Upload PDF) Tj
/F1 12 Tf
0 -50 Td
(This is a test PDF for upload testing.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
0000000342 00000 n
trailer
<< /Size 6
   /Root 1 0 R
>>
startxref
495
%%EOF`;

  fs.writeFileSync(testPdfPath, simplePdf);
  console.log(`Created test PDF file at: ${testPdfPath}`);
}

/**
 * Run the upload test
 */
async function runUploadTest() {
  const runner = new MicroTestRunner();

  try {
    await runner.init();

    // Test 1: Upload page loads
    await runner.runTest('Upload Page Loads', async (runner) => {
      await runner.navigateTo('/upload');

      // Check if the page title contains "FinDoc" or "Upload"
      const title = await runner.page.title();
      if (!title.includes('FinDoc') && !title.includes('Upload')) {
        throw new Error(`Page title does not contain "FinDoc" or "Upload": ${title}`);
      }

      // Check if the upload area exists
      const uploadAreaExists = await runner.elementExists('.upload-area, #dropzone, form[enctype="multipart/form-data"]');
      if (!uploadAreaExists) {
        throw new Error('Upload area not found on upload page');
      }

      // Check if the file input exists
      const fileInputExists = await runner.elementExists('input[type="file"], #file-input');
      if (!fileInputExists) {
        throw new Error('File input not found on upload page');
      }
    });

    // Test 2: Upload options
    await runner.runTest('Upload Options', async (runner) => {
      await runner.navigateTo('/upload');

      // Check if document type select exists
      const documentTypeExists = await runner.elementExists('#document-type, select');
      if (documentTypeExists) {
        // Get the document type options
        const documentTypeOptions = await runner.page.evaluate(() => {
          const select = document.querySelector('#document-type, select');
          if (!select) return [];
          return Array.from(select.options).map(option => option.value);
        });

        console.log(`Document type options: ${documentTypeOptions.join(', ')}`);

        if (documentTypeOptions.length === 0) {
          console.warn('Document type select has no options');
        }
      } else {
        console.warn('Document type select not found on upload page');
      }

      // Check if extraction options exist
      const extractionOptionsExist = await runner.elementExists('input[type="checkbox"], #extract-text, #extract-tables, #extract-metadata');
      if (extractionOptionsExist) {
        // Get the extraction options
        const extractionOptions = await runner.page.evaluate(() => {
          const checkboxes = document.querySelectorAll('input[type="checkbox"]');
          return Array.from(checkboxes).map(checkbox => ({
            id: checkbox.id,
            checked: checkbox.checked
          }));
        });

        console.log(`Extraction options: ${JSON.stringify(extractionOptions)}`);

        if (extractionOptions.length === 0) {
          console.warn('No extraction options found on upload page');
        }
      } else {
        console.warn('Extraction options not found on upload page');
      }
    });

    // Test 3: Upload file
    await runner.runTest('Upload File', async (runner) => {
      await runner.navigateTo('/upload');

      // Find the file input
      const fileInputSelector = 'input[type="file"], #file-input';
      const fileInputExists = await runner.elementExists(fileInputSelector);
      if (!fileInputExists) {
        throw new Error('File input not found on upload page');
      }

      // Upload the test PDF file
      await runner.uploadFile(fileInputSelector, testPdfPath);

      // Check if the file name is displayed
      const fileNameDisplayed = await runner.page.evaluate(() => {
        // Look for elements that might display the file name
        const fileNameElements = document.querySelectorAll('#file-name, .file-name, .selected-file');

        for (const element of fileNameElements) {
          if (element.textContent.includes('test-upload.pdf')) {
            return true;
          }
        }

        return false;
      });

      if (fileNameDisplayed) {
        console.log('File name is displayed on the upload page');
      } else {
        console.warn('File name is not displayed on the upload page');
      }

      // Check if the upload button exists
      const uploadButtonExists = await runner.elementExists('#upload-btn');
      if (uploadButtonExists) {
        // Click the upload button
        await runner.clickElement('#upload-btn');
      } else {
        console.log('No upload button found, file input change might trigger upload automatically');
      }

      // Check if there's a progress indicator
      const progressExists = await runner.elementExists('.progress-bar, .progress, .upload-status, .processing-status');
      if (progressExists) {
        console.log('Progress indicator found, waiting for upload to complete...');

        // Wait for a reasonable amount of time for the upload to complete
        await runner.wait(5000);
      } else {
        console.warn('No progress indicator found on upload page');
      }

      // Take a screenshot after upload
      await runner.takeScreenshot('after-upload');

      // Check for any error messages
      const errorExists = await runner.elementExists('.error, .alert-danger, .text-danger');
      if (errorExists) {
        const errorMessage = await runner.getElementText('.error, .alert-danger, .text-danger');
        console.error(`Error message displayed: ${errorMessage}`);
      }

      // Check if we were redirected to another page
      const currentUrl = runner.page.url();
      console.log(`Current URL after upload: ${currentUrl}`);

      // Wait a bit longer to see if we get redirected
      await runner.wait(5000);

      const newUrl = runner.page.url();
      if (newUrl !== currentUrl) {
        console.log(`Redirected to: ${newUrl}`);
      }
    });

    // Test 4: Check upload result
    await runner.runTest('Check Upload Result', async (runner) => {
      // Navigate to the documents page
      await runner.navigateTo('/documents-new');

      // Check if the documents page loaded
      const documentsPageExists = await runner.elementExists('.documents-page, .document-grid');
      if (!documentsPageExists) {
        throw new Error('Documents page content not found');
      }

      // Check if there are any document cards
      const documentCardsExist = await runner.elementExists('.document-card');
      if (!documentCardsExist) {
        console.warn('No document cards found on documents page');
      } else {
        // Check if our uploaded document is in the list
        const uploadedDocumentExists = await runner.page.evaluate(() => {
          const documentCards = document.querySelectorAll('.document-card');

          for (const card of documentCards) {
            const cardText = card.textContent;
            if (cardText.includes('test-upload.pdf') || cardText.includes('Test Upload PDF')) {
              return true;
            }
          }

          return false;
        });

        if (uploadedDocumentExists) {
          console.log('Uploaded document found in the documents list');
        } else {
          console.warn('Uploaded document not found in the documents list');
        }

        // Click on the first document card
        await runner.clickElement('.document-card');

        // Check if we navigated to the document details page
        const documentDetailsExists = await runner.elementExists('.document-details, .document-content, .extracted-text, .document-text');
        if (documentDetailsExists) {
          console.log('Document details page loaded');

          // Take a screenshot of the document details
          await runner.takeScreenshot('document-details');
        } else {
          console.warn('Document details page not loaded after clicking on document card');
        }
      }
    });

    // Generate report
    const reportPath = await runner.generateReport();
    console.log(`Test report saved to: ${reportPath}`);

    return reportPath;
  } finally {
    await runner.close();
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  runUploadTest()
    .then(reportPath => {
      console.log(`Upload test completed. Report saved to: ${reportPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Upload test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runUploadTest
};
