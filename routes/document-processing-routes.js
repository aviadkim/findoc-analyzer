/**
 * Document Processing Routes
 *
 * This module provides API endpoints for document processing.
 * It integrates with the scan1 controller for enhanced PDF processing.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { processDocument, extractSecurities, generateFinancialSummary } = require('../services/document-processor');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = process.env.UPLOAD_FOLDER || path.join(__dirname, '../uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },
  fileFilter: function (req, file, cb) {
    // Accept only PDF, Excel, and CSV files
    const filetypes = /pdf|xlsx|xls|csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, Excel, and CSV files are allowed'));
    }
  }
});

/**
 * @route POST /api/documents/upload
 * @description Upload a document
 * @access Public
 */
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the uploaded file information
    res.status(200).json({
      id: path.basename(req.file.path),
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      uploadDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Error uploading document' });
  }
});

/**
 * @route POST /api/documents/process
 * @description Process a document
 * @access Public
 */
router.post('/process', async (req, res) => {
  try {
    const { filePath, options } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'No file path provided' });
    }

    // Process the document
    const result = await processDocument(filePath, options);

    // Extract securities
    const securities = await extractSecurities(result);
    result.securities = securities;

    // Generate financial summary
    const financialSummary = await generateFinancialSummary(result);
    result.financialSummary = financialSummary;

    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Error processing document' });
  }
});

/**
 * @route POST /api/documents/extract-securities
 * @description Extract securities from a document
 * @access Public
 */
router.post('/extract-securities', async (req, res) => {
  try {
    const { document } = req.body;

    if (!document) {
      return res.status(400).json({ error: 'No document provided' });
    }

    // Extract securities
    const securities = await extractSecurities(document);

    res.status(200).json(securities);
  } catch (error) {
    console.error('Error extracting securities:', error);
    res.status(500).json({ error: 'Error extracting securities' });
  }
});

/**
 * @route POST /api/documents/generate-financial-summary
 * @description Generate a financial summary from a document
 * @access Public
 */
router.post('/generate-financial-summary', async (req, res) => {
  try {
    const { document } = req.body;

    if (!document) {
      return res.status(400).json({ error: 'No document provided' });
    }

    // Generate financial summary
    const summary = await generateFinancialSummary(document);

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error generating financial summary:', error);
    res.status(500).json({ error: 'Error generating financial summary' });
  }
});

/**
 * @route GET /api/documents/:id
 * @description Get a document by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // In a real implementation, we would retrieve the document from a database
    // For now, we'll just return a mock document

    const document = {
      id,
      fileName: `Document ${id}.pdf`,
      fileType: 'pdf',
      uploadDate: new Date().toISOString(),
      processed: true,
      content: {
        text: 'Sample document content...',
        tables: [
          {
            id: 'table-1',
            title: 'Sample Table',
            headers: ['Column 1', 'Column 2', 'Column 3'],
            rows: [
              ['Value 1', 'Value 2', 'Value 3'],
              ['Value 4', 'Value 5', 'Value 6'],
              ['Value 7', 'Value 8', 'Value 9']
            ]
          }
        ],
        metadata: {
          author: 'John Doe',
          creationDate: '2023-01-01',
          pageCount: 10
        },
        securities: [
          {
            name: 'Apple Inc.',
            isin: 'US0378331005',
            quantity: '1,000',
            acquisitionPrice: '$150.00',
            currentValue: '$175.00',
            percentOfAssets: '7.0%'
          },
          {
            name: 'Microsoft',
            isin: 'US5949181045',
            quantity: '800',
            acquisitionPrice: '$250.00',
            currentValue: '$300.00',
            percentOfAssets: '9.6%'
          },
          {
            name: 'Amazon',
            isin: 'US0231351067',
            quantity: '500',
            acquisitionPrice: '$120.00',
            currentValue: '$140.00',
            percentOfAssets: '2.8%'
          }
        ],
        financialSummary: {
          totalAssets: '$1,250,000',
          totalLiabilities: '$500,000',
          netWorth: '$750,000',
          annualReturn: '8.5%',
          topHoldings: [
            { name: 'Microsoft', value: '$300,000', percent: '9.6%' },
            { name: 'Apple Inc.', value: '$175,000', percent: '7.0%' },
            { name: 'Amazon', value: '$140,000', percent: '2.8%' }
          ]
        }
      }
    };

    res.status(200).json(document);
  } catch (error) {
    console.error('Error retrieving document:', error);
    res.status(500).json({ error: 'Error retrieving document' });
  }
});

/**
 * @route GET /api/documents
 * @description Get all documents
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // In a real implementation, we would retrieve documents from a database
    // For now, we'll just return mock documents

    const documents = [
      {
        id: 'doc-1',
        fileName: 'Financial Report 2023.pdf',
        fileType: 'pdf',
        uploadDate: new Date().toISOString(),
        processed: true
      },
      {
        id: 'doc-2',
        fileName: 'Investment Portfolio.xlsx',
        fileType: 'xlsx',
        uploadDate: new Date().toISOString(),
        processed: true
      },
      {
        id: 'doc-3',
        fileName: 'Stock Transactions.csv',
        fileType: 'csv',
        uploadDate: new Date().toISOString(),
        processed: true
      }
    ];

    res.status(200).json(documents);
  } catch (error) {
    console.error('Error retrieving documents:', error);
    res.status(500).json({ error: 'Error retrieving documents' });
  }
});

/**
 * @route POST /api/documents/:id/scan1
 * @description Process a document with scan1
 * @access Public
 */
router.post('/:id/scan1', async (req, res) => {
  try {
    const { id } = req.params;
    const options = req.body.options || {};

    // In a real implementation, we would retrieve the document from a database
    // For now, we'll just use the ID as the file path
    const filePath = id;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // For local testing, we'll use our document processor
    // In production, this would be handled by the scan1Controller
    console.log('Processing document with scan1 (local implementation)');

    // Process the document with scan1
    const result = await processDocument(filePath, { ...options, useScan1: true });

    // Extract securities
    const securities = await extractSecurities(result);
    result.securities = securities;

    // Generate financial summary
    const financialSummary = await generateFinancialSummary(result);
    result.financialSummary = financialSummary;

    res.status(200).json({
      success: true,
      message: 'Document processed successfully with scan1',
      result
    });
  } catch (error) {
    console.error('Error processing document with scan1:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing document with scan1',
      message: error.message
    });
  }
});

/**
 * @route GET /api/documents/scan1/status
 * @description Check if scan1 is available
 * @access Public
 */
router.get('/scan1/status', async (req, res) => {
  try {
    let pythonAvailable = false;
    let python3Available = false;
    let pythonVersion = 'Unknown';
    let python3Version = 'Unknown';

    // Check if Python is available
    try {
      const pythonProcess = require('child_process').spawn('python', ['--version']);

      pythonProcess.stderr.on('data', (data) => {
        // Python version is output to stderr in older versions
        pythonVersion = data.toString().trim();
      });

      pythonProcess.stdout.on('data', (data) => {
        // Python version is output to stdout in newer versions
        pythonVersion = data.toString().trim();
      });

      await new Promise((resolve) => {
        pythonProcess.on('close', (code) => {
          pythonAvailable = code === 0;
          resolve();
        });

        // Handle process error
        pythonProcess.on('error', () => {
          pythonAvailable = false;
          resolve();
        });
      });
    } catch (error) {
      console.warn('Error checking Python availability:', error);
      pythonAvailable = false;
    }

    // Check if Python3 is available
    try {
      const python3Process = require('child_process').spawn('python3', ['--version']);

      python3Process.stderr.on('data', (data) => {
        // Python version is output to stderr in older versions
        python3Version = data.toString().trim();
      });

      python3Process.stdout.on('data', (data) => {
        // Python version is output to stdout in newer versions
        python3Version = data.toString().trim();
      });

      await new Promise((resolve) => {
        python3Process.on('close', (code) => {
          python3Available = code === 0;
          resolve();
        });

        // Handle process error
        python3Process.on('error', () => {
          python3Available = false;
          resolve();
        });
      });
    } catch (error) {
      console.warn('Error checking Python3 availability:', error);
      python3Available = false;
    }

    // Check for required Python packages
    let packagesAvailable = false;
    let missingPackages = [];
    const requiredPackages = ['pandas', 'PyMuPDF'];

    if (pythonAvailable || python3Available) {
      const pythonCmd = python3Available ? 'python3' : 'python';

      try {
        // Create a temporary script to check for packages
        const tempDir = path.join(process.env.TEMP_FOLDER || path.join(__dirname, '../temp'), 'scan1-check');
        fs.mkdirSync(tempDir, { recursive: true });
        const scriptPath = path.join(tempDir, 'check_packages.py');

        const checkScript = `
import importlib.util
import sys

required_packages = ${JSON.stringify(requiredPackages)}
missing_packages = []

for package in required_packages:
    try:
        spec = importlib.util.find_spec(package)
        if spec is None:
            missing_packages.append(package)
    except ImportError:
        missing_packages.append(package)

print(missing_packages)
`;

        fs.writeFileSync(scriptPath, checkScript);

        const packageProcess = require('child_process').spawn(pythonCmd, [scriptPath]);

        let packageOutput = '';

        packageProcess.stdout.on('data', (data) => {
          packageOutput += data.toString();
        });

        await new Promise((resolve) => {
          packageProcess.on('close', () => {
            try {
              missingPackages = JSON.parse(packageOutput.replace(/'/g, '"'));
              packagesAvailable = missingPackages.length === 0;
            } catch (error) {
              console.warn('Error parsing package check output:', error);
              packagesAvailable = false;
            }
            resolve();
          });

          // Handle process error
          packageProcess.on('error', () => {
            packagesAvailable = false;
            resolve();
          });
        });

        // Clean up
        fs.unlinkSync(scriptPath);
        fs.rmdirSync(tempDir);
      } catch (error) {
        console.warn('Error checking Python packages:', error);
        packagesAvailable = false;
      }
    }

    res.status(200).json({
      success: true,
      scan1Available: (pythonAvailable || python3Available) && packagesAvailable,
      pythonAvailable,
      python3Available,
      pythonVersion,
      python3Version,
      packagesAvailable,
      missingPackages,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    });
  } catch (error) {
    console.error('Error checking scan1 status:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking scan1 status',
      message: error.message
    });
  }
});

module.exports = router;
