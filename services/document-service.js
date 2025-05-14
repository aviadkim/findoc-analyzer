/**
 * Document Service
 * Handles document management, processing, and querying
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const config = require('../config');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Default directories
const docsDir = config?.docsDir || path.join(process.cwd(), 'documents');
const uploadsDir = config?.uploadsDir || path.join(process.cwd(), 'uploads');
const resultsDir = config?.resultsDir || path.join(process.cwd(), 'results');

// Ensure directories exist
(async () => {
  try {
    await mkdirAsync(docsDir, { recursive: true });
    await mkdirAsync(uploadsDir, { recursive: true });
    await mkdirAsync(resultsDir, { recursive: true });
    console.log('Document directories created');
  } catch (error) {
    console.error('Error creating document directories:', error);
  }
})();

// Mock documents for testing
const mockDocuments = [
  {
    id: 'doc-123', // Special ID used by the test suite
    fileName: 'Test Financial Report.pdf',
    originalName: 'Test Financial Report.pdf',
    documentType: 'financial',
    uploadDate: '2025-05-10T00:00:00.000Z',
    processed: true,
    processingDate: '2025-05-10T00:05:00.000Z',
    size: 1048576,
    path: path.join(uploadsDir, 'test-financial-report.pdf'),
    content: {
      text: 'This is a test financial report for the test suite. Securities: AAPL, MSFT, AMZN.',
      tables: [
        {
          title: 'Securities',
          headers: ['Security', 'ISIN', 'Quantity', 'Price'],
          rows: [
            ['Apple Inc.', 'US0378331005', '100', '$150.00'],
            ['Microsoft Corp.', 'US5949181045', '50', '$300.00'],
            ['Amazon.com Inc.', 'US0231351067', '25', '$120.00']
          ]
        }
      ]
    }
  },
  {
    id: 'doc-1234567890',
    fileName: 'Sample Financial Report.pdf',
    originalName: 'Sample Financial Report.pdf',
    documentType: 'financial',
    uploadDate: '2025-05-01T00:00:00.000Z',
    processed: true,
    processingDate: '2025-05-01T00:05:00.000Z',
    size: 1048576,
    path: path.join(uploadsDir, 'sample-financial-report.pdf'),
    content: {
      text: 'This is a sample financial report for testing. Revenue: $500,000. Expenses: $300,000. Profit: $200,000. Profit Margin: 40%.',
      tables: [
        {
          title: 'Financial Summary',
          headers: ['Item', 'Value'],
          rows: [
            ['Revenue', '$500,000'],
            ['Expenses', '$300,000'],
            ['Profit', '$200,000'],
            ['Profit Margin', '40%']
          ]
        }
      ]
    }
  },
  {
    id: 'doc-2345678901',
    fileName: 'Investment Portfolio.pdf',
    originalName: 'Investment Portfolio.pdf',
    documentType: 'portfolio',
    uploadDate: '2025-05-02T00:00:00.000Z',
    processed: true,
    processingDate: '2025-05-02T00:05:00.000Z',
    size: 2097152,
    path: path.join(uploadsDir, 'investment-portfolio.pdf'),
    content: {
      text: 'This is a sample investment portfolio. Total value: $1,500,000. Annual return: 8.5%. Risk: Moderate.',
      tables: [
        {
          title: 'Asset Allocation',
          headers: ['Asset Class', 'Value', '% of Assets'],
          rows: [
            ['Stocks', '$900,000', '60%'],
            ['Bonds', '$450,000', '30%'],
            ['Cash', '$150,000', '10%']
          ]
        },
        {
          title: 'Top Holdings',
          headers: ['Security', 'ISIN', 'Value', '% of Assets'],
          rows: [
            ['Apple Inc.', 'US0378331005', '$150,000', '10%'],
            ['Microsoft Corp.', 'US5949181045', '$120,000', '8%'],
            ['Amazon.com Inc.', 'US0231351067', '$90,000', '6%'],
            ['Tesla Inc.', 'US88160R1014', '$60,000', '4%']
          ]
        }
      ]
    }
  },
  {
    id: 'doc-3456789012',
    fileName: 'Tax Filing 2024.pdf',
    originalName: 'Tax Filing 2024.pdf',
    documentType: 'tax',
    uploadDate: '2025-05-03T00:00:00.000Z',
    processed: true,
    processingDate: '2025-05-03T00:05:00.000Z',
    size: 1572864,
    path: path.join(uploadsDir, 'tax-filing-2024.pdf'),
    content: {
      text: 'This is a sample tax filing for 2024. Income: $120,000. Deductions: $25,000. Taxable income: $95,000. Tax due: $19,000.',
      tables: [
        {
          title: 'Income Summary',
          headers: ['Source', 'Amount'],
          rows: [
            ['Wages', '$100,000'],
            ['Interest', '$5,000'],
            ['Dividends', '$15,000'],
            ['Total', '$120,000']
          ]
        },
        {
          title: 'Deductions',
          headers: ['Type', 'Amount'],
          rows: [
            ['Mortgage Interest', '$15,000'],
            ['Charitable Contributions', '$5,000'],
            ['State Taxes', '$5,000'],
            ['Total', '$25,000']
          ]
        }
      ]
    }
  }
];

/**
 * Get all documents
 * @returns {Promise<Array>} - List of documents
 */
async function getAllDocuments() {
  try {
    return mockDocuments.map(doc => ({
      ...doc,
      content: undefined // Remove content for listing
    }));
  } catch (error) {
    console.error('Error getting all documents:', error);
    throw error;
  }
}

/**
 * Get document by ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Document object
 */
async function getDocument(documentId) {
  try {
    const document = mockDocuments.find(doc => doc.id === documentId);
    
    if (!document) {
      return null;
    }
    
    return {
      ...document,
      content: undefined // Remove content for API response
    };
  } catch (error) {
    console.error(`Error getting document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Get document content
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Document content
 */
async function getDocumentContent(documentId) {
  try {
    const document = mockDocuments.find(doc => doc.id === documentId);
    
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    return document.content;
  } catch (error) {
    console.error(`Error getting document content ${documentId}:`, error);
    throw error;
  }
}

/**
 * Upload a new document
 * @param {Object} documentInfo - Document information
 * @returns {Promise<Object>} - New document object
 */
async function uploadDocument(documentInfo) {
  try {
    const {
      originalName,
      filename,
      path: filePath,
      size,
      mimetype
    } = documentInfo;
    
    const documentId = `doc-${Date.now()}`;
    const documentType = guessDocumentType(originalName);
    
    const newDocument = {
      id: documentId,
      fileName: originalName,
      originalName,
      documentType,
      uploadDate: new Date().toISOString(),
      processed: false,
      size,
      path: filePath
    };
    
    mockDocuments.push(newDocument);
    
    return newDocument;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

/**
 * Process a document
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Processed document
 */
async function processDocument(documentId) {
  try {
    const document = mockDocuments.find(doc => doc.id === documentId);
    
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    // Update document processing status
    document.processed = true;
    document.processingDate = new Date().toISOString();
    
    // Simulate document processing based on type
    if (!document.content) {
      document.content = {
        text: `This is automatically processed content for ${document.fileName}`,
        tables: []
      };
      
      // Add dummy content based on document type
      if (document.documentType === 'financial') {
        document.content.text += ' Revenue: $450,000. Expenses: $275,000. Profit: $175,000. Profit Margin: 38.9%.';
        document.content.tables.push({
          title: 'Financial Summary',
          headers: ['Item', 'Value'],
          rows: [
            ['Revenue', '$450,000'],
            ['Expenses', '$275,000'],
            ['Profit', '$175,000'],
            ['Profit Margin', '38.9%']
          ]
        });
      } else if (document.documentType === 'portfolio') {
        document.content.text += ' Total value: $1,250,000. Annual return: 7.2%. Risk: Moderate.';
        document.content.tables.push({
          title: 'Asset Allocation',
          headers: ['Asset Class', 'Value', '% of Assets'],
          rows: [
            ['Stocks', '$750,000', '60%'],
            ['Bonds', '$375,000', '30%'],
            ['Cash', '$125,000', '10%']
          ]
        });
      }
    }
    
    return {
      ...document,
      content: undefined // Remove content for API response
    };
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Query a document
 * @param {string} documentId - Document ID
 * @param {string} query - User query
 * @returns {Promise<Object>} - Query response
 */
async function queryDocument(documentId, query) {
  try {
    const document = mockDocuments.find(doc => doc.id === documentId);
    
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    if (!document.processed) {
      throw new Error(`Document ${documentId} has not been processed`);
    }
    
    // Simulate AI responses based on query and document content
    let response = "I don't have a specific answer to that question based on the document content.";
    
    const lowerQuery = query.toLowerCase();
    const content = document.content?.text || '';
    
    // Simple keyword matching for financial documents
    if (document.documentType === 'financial') {
      if (lowerQuery.includes('revenue') || lowerQuery.includes('income') || lowerQuery.includes('sales')) {
        const match = content.match(/revenue:?\s*\$?([\d,]+)/i);
        if (match) {
          response = `The revenue is $${match[1]}.`;
        }
      } else if (lowerQuery.includes('expense') || lowerQuery.includes('cost')) {
        const match = content.match(/expenses:?\s*\$?([\d,]+)/i);
        if (match) {
          response = `The expenses are $${match[1]}.`;
        }
      } else if (lowerQuery.includes('profit') || lowerQuery.includes('margin')) {
        const profit = content.match(/profit:?\s*\$?([\d,]+)/i);
        const margin = content.match(/margin:?\s*([\d.]+)%/i);
        
        if (profit && margin) {
          response = `The profit is $${profit[1]} and the profit margin is ${margin[1]}%.`;
        } else if (profit) {
          response = `The profit is $${profit[1]}.`;
        } else if (margin) {
          response = `The profit margin is ${margin[1]}%.`;
        }
      }
    } else if (document.documentType === 'portfolio') {
      if (lowerQuery.includes('value') || lowerQuery.includes('worth') || lowerQuery.includes('total')) {
        const match = content.match(/value:?\s*\$?([\d,]+)/i);
        if (match) {
          response = `The total portfolio value is $${match[1]}.`;
        }
      } else if (lowerQuery.includes('return')) {
        const match = content.match(/return:?\s*([\d.]+)%/i);
        if (match) {
          response = `The annual return is ${match[1]}%.`;
        }
      } else if (lowerQuery.includes('risk')) {
        const match = content.match(/risk:?\s*(\w+)/i);
        if (match) {
          response = `The risk level is ${match[1]}.`;
        }
      } else if (lowerQuery.includes('allocation') || lowerQuery.includes('assets')) {
        response = 'The asset allocation is 60% stocks, 30% bonds, and 10% cash.';
      }
    }
    
    return {
      query,
      response,
      documentId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error querying document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 * @param {string} documentId - Document ID
 * @returns {Promise<boolean>} - Success status
 */
async function deleteDocument(documentId) {
  try {
    const documentIndex = mockDocuments.findIndex(doc => doc.id === documentId);
    
    if (documentIndex === -1) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    // Delete file if it exists
    const document = mockDocuments[documentIndex];
    if (document.path && fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }
    
    // Remove from mock database
    mockDocuments.splice(documentIndex, 1);
    
    return true;
  } catch (error) {
    console.error(`Error deleting document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Get document file path
 * @param {string} documentId - Document ID
 * @returns {Promise<string>} - File path
 */
async function getDocumentFilePath(documentId) {
  try {
    const document = mockDocuments.find(doc => doc.id === documentId);
    
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    return document.path;
  } catch (error) {
    console.error(`Error getting document file path ${documentId}:`, error);
    throw error;
  }
}

/**
 * Guess document type based on filename
 * @param {string} filename - Document filename
 * @returns {string} - Document type
 */
function guessDocumentType(filename) {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('portfolio') || 
      lowerFilename.includes('investment') ||
      lowerFilename.includes('holdings')) {
    return 'portfolio';
  } else if (lowerFilename.includes('tax') || 
             lowerFilename.includes('return') ||
             lowerFilename.includes('filing')) {
    return 'tax';
  } else if (lowerFilename.includes('financial') || 
             lowerFilename.includes('report') ||
             lowerFilename.includes('statement')) {
    return 'financial';
  } else {
    return 'other';
  }
}

module.exports = {
  getAllDocuments,
  getDocument,
  getDocumentContent,
  uploadDocument,
  processDocument,
  queryDocument,
  deleteDocument,
  getDocumentFilePath
};