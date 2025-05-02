/**
 * FinDoc Analyzer Processing Test
 *
 * This script tests the document processing functionality of the FinDoc Analyzer application.
 */

const { MicroTestRunner } = require('./micro-test-framework');
const path = require('path');
const fs = require('fs');

// Create a test PDF file if it doesn't exist
const testPdfPath = path.join(__dirname, 'test-documents', 'test-processing.pdf');
const testPdfDir = path.dirname(testPdfPath);

if (!fs.existsSync(testPdfDir)) {
  fs.mkdirSync(testPdfDir, { recursive: true });
}

if (!fs.existsSync(testPdfPath)) {
  // Create a simple PDF file with financial data
  const financialPdf = `%PDF-1.4
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
<< /Length 1000 >>
stream
BT
/F1 24 Tf
50 700 Td
(Financial Report 2023) Tj
/F1 12 Tf
0 -50 Td
(Company: ABC Corporation) Tj
0 -20 Td
(Date: December 31, 2023) Tj
0 -40 Td
(Executive Summary) Tj
/F1 10 Tf
0 -20 Td
(This financial report presents the financial performance of ABC Corporation for the fiscal year 2023.) Tj
0 -30 Td
(Financial Highlights:) Tj
0 -20 Td
(- Total Revenue: $10,500,000) Tj
0 -15 Td
(- Operating Expenses: $7,200,000) Tj
0 -15 Td
(- Net Profit: $3,300,000) Tj
0 -15 Td
(- Profit Margin: 31.4%) Tj
0 -30 Td
(Balance Sheet Summary:) Tj
0 -20 Td
(- Total Assets: $25,000,000) Tj
0 -15 Td
(- Total Liabilities: $12,000,000) Tj
0 -15 Td
(- Shareholders' Equity: $13,000,000) Tj
0 -30 Td
(Investment Portfolio:) Tj
0 -20 Td
(Security | ISIN | Quantity | Acquisition Price | Current Value | % of Assets) Tj
0 -15 Td
(Apple Inc. | US0378331005 | 1,000 | $150.00 | $175.00 | 7.0%) Tj
0 -15 Td
(Microsoft | US5949181045 | 800 | $250.00 | $300.00 | 9.6%) Tj
0 -15 Td
(Amazon | US0231351067 | 500 | $120.00 | $140.00 | 2.8%) Tj
0 -15 Td
(Tesla | US88160R1014 | 300 | $200.00 | $180.00 | 2.2%) Tj
0 -15 Td
(Google | US02079K1079 | 200 | $1,200.00 | $1,300.00 | 10.4%) Tj
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
1395
%%EOF`;

  fs.writeFileSync(testPdfPath, financialPdf);
  console.log(`Created test PDF file at: ${testPdfPath}`);
}

/**
 * Run the processing test
 */
async function runProcessingTest() {
  const runner = new MicroTestRunner();

  try {
    await runner.init();

    // Test 1: Upload financial PDF
    await runner.runTest('Upload Financial PDF', async (runner) => {
      await runner.navigateTo('/upload');

      // Check if the upload page loaded
      const uploadPageExists = await runner.elementExists('.upload-area, #dropzone, form[enctype="multipart/form-data"]');
      if (!uploadPageExists) {
        throw new Error('Upload page content not found');
      }

      // Find the file input
      const fileInputSelector = 'input[type="file"], #file-input';
      const fileInputExists = await runner.elementExists(fileInputSelector);
      if (!fileInputExists) {
        throw new Error('File input not found on upload page');
      }

      // Upload the test PDF file
      await runner.uploadFile(fileInputSelector, testPdfPath);

      // Check if the document type select exists
      const documentTypeExists = await runner.elementExists('#document-type, select');
      if (documentTypeExists) {
        // Select "financial" document type if available
        await runner.page.evaluate(() => {
          const select = document.querySelector('#document-type, select');
          if (select) {
            // Look for financial option
            for (const option of select.options) {
              if (option.value.toLowerCase().includes('financial') || option.text.toLowerCase().includes('financial')) {
                select.value = option.value;
                select.dispatchEvent(new Event('change'));
                return;
              }
            }
          }
        });
      }

      // Check if extraction options exist and ensure they're checked
      await runner.page.evaluate(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          checkbox.checked = true;
          checkbox.dispatchEvent(new Event('change'));
        });
      });

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
        console.log('Progress indicator found, waiting for processing to complete...');

        // Wait for a reasonable amount of time for the processing to complete
        await runner.wait(10000);
      } else {
        console.warn('No progress indicator found on upload page');

        // Wait a bit anyway
        await runner.wait(5000);
      }

      // Take a screenshot after processing
      await runner.takeScreenshot('after-processing');

      // Check for any error messages
      const errorExists = await runner.elementExists('.error, .alert-danger, .text-danger');
      if (errorExists) {
        const errorMessage = await runner.getElementText('.error, .alert-danger, .text-danger');
        console.error(`Error message displayed: ${errorMessage}`);
      }

      // Check if we were redirected to another page
      const currentUrl = runner.page.url();
      console.log(`Current URL after processing: ${currentUrl}`);

      // If we're not redirected to the documents page or document details page, navigate there
      if (!currentUrl.includes('documents') && !currentUrl.includes('document-details')) {
        await runner.navigateTo('/documents-new');
      }
    });

    // Test 2: Check processing results
    await runner.runTest('Check Processing Results', async (runner) => {
      // If we're not on the documents page, navigate there
      const url = runner.page.url();
      if (!url.includes('documents')) {
        await runner.navigateTo('/documents-new');
      }

      // Check if the documents page loaded
      const documentsPageExists = await runner.elementExists('.documents-page, .document-grid');
      if (!documentsPageExists) {
        throw new Error('Documents page content not found');
      }

      // Check if there are any document cards
      const documentCardsExist = await runner.elementExists('.document-card');
      if (!documentCardsExist) {
        throw new Error('No document cards found on documents page');
      }

      // Click on the first document card
      await runner.clickElement('.document-card');

      // Check if we navigated to the document details page
      const documentDetailsExists = await runner.elementExists('.document-details, .document-content, .extracted-text, .document-text');
      if (!documentDetailsExists) {
        throw new Error('Document details page not loaded after clicking on document card');
      }

      // Take a screenshot of the document details
      await runner.takeScreenshot('document-details');

      // Check for extracted text
      const extractedTextExists = await runner.elementExists('.extracted-text, .document-text, .text-content');
      if (extractedTextExists) {
        const extractedText = await runner.getElementText('.extracted-text, .document-text, .text-content');
        console.log(`Extracted text: ${extractedText.substring(0, 100)}...`);

        // Check if the extracted text contains financial data
        if (!extractedText.includes('Financial') && !extractedText.includes('Revenue')) {
          console.warn('Extracted text does not contain expected financial data');
        }
      } else {
        console.warn('No extracted text found on document details page');
      }

      // Check for extracted tables
      const extractedTablesExist = await runner.elementExists('table, .table, .extracted-table');
      if (extractedTablesExist) {
        console.log('Extracted tables found on document details page');

        // Check if the table contains financial data
        const tableContent = await runner.page.evaluate(() => {
          const tables = document.querySelectorAll('table, .table, .extracted-table');
          return Array.from(tables).map(table => table.textContent).join(' ');
        });

        if (!tableContent.includes('ISIN') && !tableContent.includes('Apple')) {
          console.warn('Extracted tables do not contain expected financial data');
        }
      } else {
        console.warn('No extracted tables found on document details page');
      }

      // Check for metadata
      const metadataExists = await runner.elementExists('.metadata, .document-metadata, .meta-info');
      if (metadataExists) {
        console.log('Metadata found on document details page');
      } else {
        console.warn('No metadata found on document details page');
      }
    });

    // Test 3: Test Q&A functionality
    await runner.runTest('Test Q&A Functionality', async (runner) => {
      // If we're not on the document details page, navigate to documents and click on a document
      const url = runner.page.url();
      if (!url.includes('document-details') && !url.includes('documents/')) {
        await runner.navigateTo('/documents-new');

        // Check if there are any document cards
        const documentCardsExist = await runner.elementExists('.document-card');
        if (documentCardsExist) {
          // Click on the first document card
          await runner.clickElement('.document-card');
        } else {
          console.warn('No document cards found on documents page');
          return; // Skip this test
        }
      }

      // Check if there's a chat or Q&A interface
      const chatExists = await runner.elementExists('.chat, .qa, .question-answer, .ask-question, input[placeholder*="question"], input[placeholder*="ask"]');
      if (!chatExists) {
        console.warn('No chat or Q&A interface found on document details page');
        return; // Skip this test
      }

      // Find the input field
      const inputFieldExists = await runner.elementExists('#question-input');
      if (!inputFieldExists) {
        console.warn('No input field found for the chat interface');
        return; // Skip this test
      }

      // Type a question
      await runner.typeText('#question-input', 'What is the total revenue?');

      // Find the submit button
      const submitButtonExists = await runner.elementExists('#ask-btn');
      if (submitButtonExists) {
        // Click the submit button
        await runner.clickElement('#ask-btn');

        // Wait for the answer
        await runner.wait(5000);

        // Take a screenshot of the answer
        await runner.takeScreenshot('qa-answer');

        // Check if there's an answer
        const answerExists = await runner.elementExists('.answer, .response, .ai-message, .chat-message:not(:first-child)');
        if (answerExists) {
          const answer = await runner.getElementText('.answer, .response, .ai-message, .chat-message:not(:first-child)');
          console.log(`Answer: ${answer}`);

          // Check if the answer contains the expected information
          if (!answer.includes('10,500,000') && !answer.includes('10.5') && !answer.includes('million')) {
            console.warn('Answer does not contain expected revenue information');
          }
        } else {
          console.warn('No answer found after asking a question');
        }
      } else {
        console.warn('No submit button found for the chat interface');
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
  runProcessingTest()
    .then(reportPath => {
      console.log(`Processing test completed. Report saved to: ${reportPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Processing test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runProcessingTest
};
