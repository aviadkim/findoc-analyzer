/**
 * OCR Integration Module
 * 
 * This module integrates OCR capabilities from scan1Controller with our enhanced financial PDF processing.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Try to import scan1Controller
let scan1Controller = null;
try {
  // Try different possible paths
  const possiblePaths = [
    '../backv2-github/DevDocs/findoc-app-engine-v2/src/api/controllers/scan1Controller',
    '../DevDocs/findoc-app-engine-v2/src/api/controllers/scan1Controller',
    './controllers/scan1Controller',
    '../controllers/scan1Controller'
  ];
  
  for (const modulePath of possiblePaths) {
    try {
      scan1Controller = require(modulePath);
      console.log(`Successfully imported scan1Controller from ${modulePath}`);
      break;
    } catch (err) {
      // Continue to next path
    }
  }
  
  if (!scan1Controller) {
    console.warn('Could not import scan1Controller, using fallback implementation');
  }
} catch (error) {
  console.warn(`Error importing scan1Controller: ${error.message}`);
}

/**
 * Check if OCR is available
 * @returns {Promise<boolean>} - Whether OCR is available
 */
async function isOcrAvailable() {
  if (scan1Controller && typeof scan1Controller.isScan1Available === 'function') {
    return await scan1Controller.isScan1Available();
  }
  
  // Fallback: Check if tesseract is installed
  return new Promise((resolve) => {
    const tesseract = spawn('tesseract', ['--version']);
    
    tesseract.on('close', (code) => {
      resolve(code === 0);
    });
    
    tesseract.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Process a PDF with OCR
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<object>} - Extracted text and data
 */
async function processPdfWithOcr(filePath) {
  console.log(`Processing PDF with OCR: ${filePath}`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  // If scan1Controller is available, use it
  if (scan1Controller && typeof scan1Controller.processDocumentWithScan1 === 'function') {
    try {
      // Create a mock request and response
      const req = {
        file: {
          path: filePath,
          originalname: path.basename(filePath)
        },
        body: {
          documentType: 'financial_pdf'
        }
      };
      
      let responseData = null;
      
      const res = {
        status: (code) => {
          return {
            json: (data) => {
              responseData = data;
            }
          };
        },
        json: (data) => {
          responseData = data;
        }
      };
      
      // Process the document with scan1
      await scan1Controller.processDocumentWithScan1(req, res);
      
      if (responseData && responseData.success) {
        return {
          text: responseData.data.text || '',
          tables: responseData.data.tables || [],
          metadata: responseData.data.metadata || {},
          securities: responseData.data.securities || []
        };
      } else {
        throw new Error('Error processing document with scan1');
      }
    } catch (error) {
      console.error(`Error using scan1Controller: ${error.message}`);
      // Fall back to basic OCR
      return await performBasicOcr(filePath);
    }
  } else {
    // Fall back to basic OCR
    return await performBasicOcr(filePath);
  }
}

/**
 * Perform basic OCR on a PDF
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<object>} - Extracted text
 */
async function performBasicOcr(filePath) {
  console.log(`Performing basic OCR on: ${filePath}`);
  
  // Create a temporary directory for extracted images
  const tempDir = path.join(__dirname, '../temp');
  fs.mkdirSync(tempDir, { recursive: true });
  
  // Extract images from PDF
  const extractedText = await extractTextFromPdf(filePath, tempDir);
  
  return {
    text: extractedText,
    tables: [],
    metadata: {
      title: path.basename(filePath),
      pages: 0
    },
    securities: []
  };
}

/**
 * Extract text from PDF using basic tools
 * @param {string} filePath - Path to the PDF file
 * @param {string} tempDir - Temporary directory for extracted images
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPdf(filePath, tempDir) {
  return new Promise((resolve, reject) => {
    // Try to use pdftotext if available
    const pdftotext = spawn('pdftotext', [filePath, '-']);
    
    let text = '';
    
    pdftotext.stdout.on('data', (data) => {
      text += data.toString();
    });
    
    pdftotext.on('close', (code) => {
      if (code === 0) {
        resolve(text);
      } else {
        // Fall back to tesseract if pdftotext fails
        extractTextWithTesseract(filePath, tempDir)
          .then(resolve)
          .catch(reject);
      }
    });
    
    pdftotext.on('error', () => {
      // Fall back to tesseract if pdftotext is not available
      extractTextWithTesseract(filePath, tempDir)
        .then(resolve)
        .catch(reject);
    });
  });
}

/**
 * Extract text from PDF using tesseract
 * @param {string} filePath - Path to the PDF file
 * @param {string} tempDir - Temporary directory for extracted images
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextWithTesseract(filePath, tempDir) {
  // Try to use pdftoppm to convert PDF to images
  return new Promise((resolve, reject) => {
    const pdftoppm = spawn('pdftoppm', ['-png', filePath, path.join(tempDir, 'page')]);
    
    pdftoppm.on('close', async (code) => {
      if (code === 0) {
        // Get all extracted images
        const imageFiles = fs.readdirSync(tempDir)
          .filter(file => file.startsWith('page') && file.endsWith('.png'))
          .map(file => path.join(tempDir, file))
          .sort();
        
        // Process each image with tesseract
        let fullText = '';
        
        for (const imageFile of imageFiles) {
          try {
            const text = await processImageWithTesseract(imageFile);
            fullText += text + '\n\n';
          } catch (error) {
            console.error(`Error processing image ${imageFile}: ${error.message}`);
          }
        }
        
        resolve(fullText);
      } else {
        reject(new Error('Error converting PDF to images'));
      }
    });
    
    pdftoppm.on('error', () => {
      reject(new Error('pdftoppm is not available'));
    });
  });
}

/**
 * Process an image with tesseract
 * @param {string} imageFile - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
async function processImageWithTesseract(imageFile) {
  return new Promise((resolve, reject) => {
    const tesseract = spawn('tesseract', [imageFile, 'stdout']);
    
    let text = '';
    
    tesseract.stdout.on('data', (data) => {
      text += data.toString();
    });
    
    tesseract.on('close', (code) => {
      if (code === 0) {
        resolve(text);
      } else {
        reject(new Error('Error processing image with tesseract'));
      }
    });
    
    tesseract.on('error', () => {
      reject(new Error('tesseract is not available'));
    });
  });
}

module.exports = {
  isOcrAvailable,
  processPdfWithOcr
};
