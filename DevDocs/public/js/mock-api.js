/**
 * Mock API for FinDoc Analyzer
 * 
 * This file provides mock API endpoints for the FinDoc Analyzer application.
 */

// Mock user data
const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  apiKey: 'mock-api-key-123'
};

// Mock documents data
let mockDocuments = [
  {
    id: 'doc-1',
    fileName: 'Financial Report 2023.pdf',
    documentType: 'financial',
    uploadDate: '2025-04-28T12:00:00Z',
    processed: true,
    userId: 'user-123'
  },
  {
    id: 'doc-2',
    fileName: 'Investment Portfolio.pdf',
    documentType: 'portfolio',
    uploadDate: '2025-04-28T12:00:00Z',
    processed: true,
    userId: 'user-123'
  },
  {
    id: 'doc-3',
    fileName: 'Tax Documents 2024.pdf',
    documentType: 'tax',
    uploadDate: '2025-04-28T12:00:00Z',
    processed: true,
    userId: 'user-123'
  }
];

// Mock document content
const mockDocumentContent = {
  'doc-1': {
    text: `Financial Report 2023
    
Company: ABC Corporation
Date: December 31, 2023

Executive Summary

This financial report presents the financial performance of ABC Corporation for the fiscal year 2023.

Financial Highlights:
- Total Revenue: $10,500,000
- Operating Expenses: $7,200,000
- Net Profit: $3,300,000
- Profit Margin: 31.4%

Balance Sheet Summary:
- Total Assets: $25,000,000
- Total Liabilities: $12,000,000
- Shareholders' Equity: $13,000,000`,
    tables: [
      {
        id: 'table-1',
        title: 'Investment Portfolio',
        headers: ['Security', 'ISIN', 'Quantity', 'Acquisition Price', 'Current Value', '% of Assets'],
        rows: [
          ['Apple Inc.', 'US0378331005', '1,000', '$150.00', '$175.00', '7.0%'],
          ['Microsoft', 'US5949181045', '800', '$250.00', '$300.00', '9.6%'],
          ['Amazon', 'US0231351067', '500', '$120.00', '$140.00', '2.8%'],
          ['Tesla', 'US88160R1014', '300', '$200.00', '$180.00', '2.2%'],
          ['Google', 'US02079K1079', '200', '$1,200.00', '$1,300.00', '10.4%']
        ]
      }
    ],
    metadata: {
      author: 'John Smith',
      createdDate: 'December 31, 2023',
      modifiedDate: 'January 15, 2024',
      documentFormat: 'PDF 1.7',
      keywords: 'financial, report, 2023, ABC Corporation'
    }
  }
};

// Mock authentication
function mockAuth() {
  // For simplicity, always return the mock user
  return mockUser;
}

// Mock API endpoints
class MockAPI {
  /**
   * Initialize the mock API
   */
  static init() {
    console.log('Initializing mock API...');
    
    // Override fetch to intercept API calls
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options) {
      // Check if this is an API call
      if (typeof url === 'string' && url.includes('/api/')) {
        return MockAPI.handleApiCall(url, options);
      }
      
      // Otherwise, use the original fetch
      return originalFetch.apply(this, arguments);
    };
    
    console.log('Mock API initialized');
  }
  
  /**
   * Handle API calls
   * @param {string} url - API URL
   * @param {object} options - Fetch options
   * @returns {Promise} - Promise resolving to a Response object
   */
  static handleApiCall(url, options) {
    console.log(`Mock API call: ${url}`, options);
    
    // Parse the URL
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;
    
    // Get the request method
    const method = options?.method || 'GET';
    
    // Get the request body
    let body = null;
    
    if (options?.body) {
      try {
        body = JSON.parse(options.body);
      } catch (error) {
        console.error('Error parsing request body:', error);
      }
    }
    
    // Handle different API endpoints
    let response;
    
    switch (path) {
      case '/api/auth/user':
        response = MockAPI.handleAuthUser(method);
        break;
      case '/api/documents':
        response = MockAPI.handleDocuments(method, body);
        break;
      case '/api/documents/process':
        response = MockAPI.handleDocumentProcess(method, body);
        break;
      default:
        // Check if the path matches /api/documents/:id
        const documentMatch = path.match(/\/api\/documents\/([^/]+)/);
        
        if (documentMatch) {
          const documentId = documentMatch[1];
          response = MockAPI.handleDocumentById(method, documentId);
        } else {
          // Return a 404 for unknown endpoints
          response = {
            status: 404,
            body: {
              error: 'Not found'
            }
          };
        }
    }
    
    // Create a Response object
    return Promise.resolve(new Response(
      JSON.stringify(response.body),
      {
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ));
  }
  
  /**
   * Handle /api/auth/user endpoint
   * @param {string} method - HTTP method
   * @returns {object} - Response object
   */
  static handleAuthUser(method) {
    if (method === 'GET') {
      const user = mockAuth();
      
      return {
        status: 200,
        body: user
      };
    }
    
    return {
      status: 405,
      body: {
        error: 'Method not allowed'
      }
    };
  }
  
  /**
   * Handle /api/documents endpoint
   * @param {string} method - HTTP method
   * @param {object} body - Request body
   * @returns {object} - Response object
   */
  static handleDocuments(method, body) {
    const user = mockAuth();
    
    if (!user) {
      return {
        status: 401,
        body: {
          error: 'Unauthorized'
        }
      };
    }
    
    if (method === 'GET') {
      // Return the user's documents
      const userDocuments = mockDocuments.filter(doc => doc.userId === user.id);
      
      return {
        status: 200,
        body: userDocuments
      };
    } else if (method === 'POST') {
      // Create a new document
      if (!body || !body.fileName) {
        return {
          status: 400,
          body: {
            error: 'Missing required fields'
          }
        };
      }
      
      const newDocument = {
        id: `doc-${mockDocuments.length + 1}`,
        fileName: body.fileName,
        documentType: body.documentType || 'other',
        uploadDate: new Date().toISOString(),
        processed: false,
        userId: user.id
      };
      
      mockDocuments.push(newDocument);
      
      return {
        status: 201,
        body: newDocument
      };
    }
    
    return {
      status: 405,
      body: {
        error: 'Method not allowed'
      }
    };
  }
  
  /**
   * Handle /api/documents/:id endpoint
   * @param {string} method - HTTP method
   * @param {string} documentId - Document ID
   * @returns {object} - Response object
   */
  static handleDocumentById(method, documentId) {
    const user = mockAuth();
    
    if (!user) {
      return {
        status: 401,
        body: {
          error: 'Unauthorized'
        }
      };
    }
    
    // Find the document
    const document = mockDocuments.find(doc => doc.id === documentId && doc.userId === user.id);
    
    if (!document) {
      return {
        status: 404,
        body: {
          error: 'Document not found'
        }
      };
    }
    
    if (method === 'GET') {
      // Return the document with its content
      const documentWithContent = {
        ...document,
        content: mockDocumentContent[documentId] || null
      };
      
      return {
        status: 200,
        body: documentWithContent
      };
    } else if (method === 'DELETE') {
      // Remove the document
      mockDocuments = mockDocuments.filter(doc => doc.id !== documentId);
      
      return {
        status: 204,
        body: null
      };
    }
    
    return {
      status: 405,
      body: {
        error: 'Method not allowed'
      }
    };
  }
  
  /**
   * Handle /api/documents/process endpoint
   * @param {string} method - HTTP method
   * @param {object} body - Request body
   * @returns {object} - Response object
   */
  static handleDocumentProcess(method, body) {
    const user = mockAuth();
    
    if (!user) {
      return {
        status: 401,
        body: {
          error: 'Unauthorized'
        }
      };
    }
    
    if (method === 'POST') {
      // Process a document
      if (!body || !body.documentId) {
        return {
          status: 400,
          body: {
            error: 'Missing required fields'
          }
        };
      }
      
      // Find the document
      const documentIndex = mockDocuments.findIndex(doc => doc.id === body.documentId && doc.userId === user.id);
      
      if (documentIndex === -1) {
        return {
          status: 404,
          body: {
            error: 'Document not found'
          }
        };
      }
      
      // Update the document
      mockDocuments[documentIndex].processed = true;
      
      // Create mock content if it doesn't exist
      if (!mockDocumentContent[body.documentId]) {
        mockDocumentContent[body.documentId] = {
          text: `Sample text content for ${mockDocuments[documentIndex].fileName}`,
          tables: [],
          metadata: {
            author: 'Unknown',
            createdDate: new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
            documentFormat: 'PDF',
            keywords: 'sample, document'
          }
        };
      }
      
      return {
        status: 200,
        body: mockDocuments[documentIndex]
      };
    }
    
    return {
      status: 405,
      body: {
        error: 'Method not allowed'
      }
    };
  }
}

// Initialize the mock API when the script is loaded
document.addEventListener('DOMContentLoaded', function() {
  MockAPI.init();
});
