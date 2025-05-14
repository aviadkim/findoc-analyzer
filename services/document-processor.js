/**
 * Document Processor Service
 * Handles document processing and analysis
 * 
 * Enhanced by Claude AI Assistant on May 11, 2025
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

// Import services
const apiKeyProvider = require('./api-key-provider-service');
const extractionCacheService = require('./extraction-cache-service');

// Import controllers
const scan1Controller = require('../controllers/scan1Controller');

// Cache for document processing status
const processingStatus = new Map();

// Define allowed file types
const ALLOWED_EXTENSIONS = ['pdf', 'xlsx', 'csv'];

// In-memory document storage
const documentStore = new Map();

/**
 * Process a document
 * @param {string} documentId - The document ID
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - The processed document
 */
async function processDocument(documentId, options = {}) {
  console.log(`Processing document with ID: ${documentId}`);

  try {
    // Get document file path
    const document = await getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    // Check for cached results if caching is enabled
    if (options.useCache !== false) {
      try {
        // Generate document fingerprint
        const fingerprint = extractionCacheService.generateDocumentFingerprint({
          id: documentId,
          filePath: document.filePath,
          fileName: document.fileName,
          tenantId: options.tenantId || document.tenantId
        });
        
        // Check for cached processing result
        const cachedDocument = await extractionCacheService.getCachedExtraction(
          fingerprint,
          'document-processing',
          options.tenantId || document.tenantId
        );
        
        if (cachedDocument) {
          console.log(`Using cached processing result for document ${documentId}`);
          return cachedDocument;
        }
      } catch (cacheError) {
        console.warn(`Cache check failed: ${cacheError.message}`);
        // Continue with normal processing
      }
    }

    // Update processing status
    updateDocumentStatus(documentId, {
      status: 'processing',
      progress: 0,
      startTime: new Date().toISOString()
    });

    // Get processing options
    const {
      extractText = true,
      extractTables = true,
      extractMetadata = true,
      extractSecurities = true,
      tenantId = null,
      useMcp = true // New option to enable/disable MCP processing
    } = options;

    // Check if the file is a PDF
    const filePath = document.filePath;
    const fileExt = path.extname(filePath).toLowerCase().slice(1);

    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      throw new Error(`Unsupported file type: ${fileExt}`);
    }

    // Update processing status
    updateDocumentStatus(documentId, {
      status: 'processing',
      progress: 10,
      message: 'Analyzing document type'
    });

    // Process document based on file type and MCP preference
    let processedDocument = {};

    // Try to use MCP-enhanced processing if enabled
    if (useMcp) {
      try {
        // Import the MCP document processor
        const mcpDocumentProcessor = require('./mcp-document-processor');

        // Update processing status
        updateDocumentStatus(documentId, {
          status: 'processing',
          progress: 20,
          message: 'Processing with MCP-enhanced capabilities'
        });

        // Process with MCP
        const mcpResult = await mcpDocumentProcessor.processDocument(filePath, {
          extractText,
          extractTables,
          extractMetadata,
          extractSecurities,
          tenantId
        });

        // Use the MCP results
        processedDocument = {
          metadata: { fileName: mcpResult.fileName },
          text: mcpResult.text || '',
          tables: [],
          entities: mcpResult.entities || [],
          securities: mcpResult.entities.filter(e => e.type === 'security' || e.isin) || []
        };

        // Log success
        console.log(`Successfully processed document ${documentId} with MCP enhancements`);

      } catch (mcpError) {
        // Log MCP error but continue with standard processing
        console.warn(`MCP processing failed, falling back to standard processing: ${mcpError.message}`);

        // Update processing status
        updateDocumentStatus(documentId, {
          status: 'processing',
          progress: 25,
          message: 'MCP processing failed, using standard processing'
        });

        // Fall back to standard processing
        if (fileExt === 'pdf') {
          processedDocument = await processPdfDocument(documentId, filePath, options);
        } else if (fileExt === 'xlsx' || fileExt === 'csv') {
          processedDocument = await processSpreadsheetDocument(documentId, filePath, options);
        }
      }
    } else {
      // Standard processing (without MCP)
      if (fileExt === 'pdf') {
        processedDocument = await processPdfDocument(documentId, filePath, options);
      } else if (fileExt === 'xlsx' || fileExt === 'csv') {
        processedDocument = await processSpreadsheetDocument(documentId, filePath, options);
      }
    }

    // Update document with processing results
    const updatedDocument = {
      ...document,
      processed: true,
      processingDate: new Date().toISOString(),
      content: processedDocument
    };

    // Store processed document
    storeDocument(documentId, updatedDocument);
    
    // Store in cache if caching is enabled
    if (options.useCache !== false) {
      try {
        // Generate document fingerprint
        const fingerprint = extractionCacheService.generateDocumentFingerprint({
          id: documentId,
          filePath: document.filePath,
          fileName: document.fileName,
          tenantId: options.tenantId || document.tenantId
        });
        
        // Cache the processing result
        await extractionCacheService.storeExtractionResult(
          fingerprint,
          'document-processing',
          updatedDocument,
          options.cacheTTL || extractionCacheService.DEFAULT_CACHE_TTL,
          options.tenantId || document.tenantId
        );
        
        console.log(`Cached processing result for document ${documentId}`);
      } catch (cacheError) {
        console.warn(`Failed to cache processing result: ${cacheError.message}`);
        // Continue even if caching fails
      }
    }

    // Update processing status
    updateDocumentStatus(documentId, {
      status: 'completed',
      progress: 100,
      message: 'Document processing completed',
      endTime: new Date().toISOString()
    });

    return updatedDocument;
  } catch (error) {
    console.error(`Error processing document: ${error.message}`);

    // Update processing status with error
    updateDocumentStatus(documentId, {
      status: 'failed',
      progress: 0,
      message: `Error: ${error.message}`,
      error: error.message,
      endTime: new Date().toISOString()
    });

    throw error;
  }
}

/**
 * Process a PDF document
 * @param {string} documentId - The document ID
 * @param {string} filePath - Path to the PDF file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - The processed document content
 */
async function processPdfDocument(documentId, filePath, options) {
  try {
    // Update processing status
    updateDocumentStatus(documentId, {
      status: 'processing',
      progress: 20,
      message: 'Analyzing PDF document'
    });
    
    // Process the document with Scan1
    let scan1Result = null;
    
    try {
      // Get document object for Scan1
      const docObj = {
        id: documentId,
        filePath: filePath,
        name: path.basename(filePath),
        options
      };
      
      // Get Gemini API key for enhanced processing
      const geminiApiKey = await apiKeyProvider.getApiKey('gemini', { 
        tenantId: options.tenantId 
      });
      
      // Process with Scan1
      scan1Result = await scan1Controller.processDocument(docObj, {
        ...options,
        apiKey: geminiApiKey
      });
      
      // Update processing status
      updateDocumentStatus(documentId, {
        status: 'processing',
        progress: 70,
        message: 'PDF processing completed, analyzing content'
      });
    } catch (scan1Error) {
      console.warn(`Scan1 processing failed: ${scan1Error.message}`);
      console.log('Falling back to basic PDF processing');
      
      // Update processing status
      updateDocumentStatus(documentId, {
        status: 'processing',
        progress: 30,
        message: 'Scan1 processing failed, using basic processing'
      });
      
      // Fallback to basic PDF processing
      scan1Result = await processBasicPdf(filePath, options);
    }
    
    // Extract financial entities
    let financialEntities = [];
    
    try {
      // Update processing status
      updateDocumentStatus(documentId, {
        status: 'processing',
        progress: 80,
        message: 'Extracting financial entities'
      });
      
      // Get OpenRouter API key for financial extraction
      const openRouterApiKey = await apiKeyProvider.getApiKey('openrouter', { 
        tenantId: options.tenantId 
      });
      
      financialEntities = await extractFinancialEntities(scan1Result.text, {
        apiKey: openRouterApiKey
      });
    } catch (extractionError) {
      console.warn(`Financial entity extraction failed: ${extractionError.message}`);
      console.log('Using basic entity extraction');
      
      // Use basic entity extraction
      financialEntities = extractBasicFinancialEntities(scan1Result.text);
    }
    
    // Update processing status
    updateDocumentStatus(documentId, {
      status: 'processing',
      progress: 90,
      message: 'Finalizing document processing'
    });
    
    // Generate the final processed document
    return {
      metadata: scan1Result.metadata || {},
      text: scan1Result.text || '',
      tables: scan1Result.tables || [],
      entities: financialEntities,
      securities: scan1Result.securities || extractSecuritiesFromEntities(financialEntities, {
        text: scan1Result.text || '',
        tables: scan1Result.tables || [],
        financialData: scan1Result.financialData || {},
        tenantId: options.tenantId
      }, {
        useCache: options.useCache !== false,
        cacheTTL: options.cacheTTL,
        tenantId: options.tenantId
      })
    };
  } catch (error) {
    console.error(`Error processing PDF document: ${error.message}`);
    throw error;
  }
}

/**
 * Process a spreadsheet document (XLSX or CSV)
 * @param {string} documentId - The document ID
 * @param {string} filePath - Path to the spreadsheet file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - The processed document content
 */
async function processSpreadsheetDocument(documentId, filePath, options) {
  try {
    console.log(`Processing spreadsheet document: ${filePath}`);

    // Update processing status
    updateDocumentStatus(documentId, {
      status: 'processing',
      progress: 20,
      message: 'Analyzing spreadsheet document'
    });

    // Import the spreadsheet processor
    const spreadsheetProcessor = require('./spreadsheet-processor');

    // Process the spreadsheet
    const processingResult = await spreadsheetProcessor.processSpreadsheet(filePath, options);

    // Update processing status
    updateDocumentStatus(documentId, {
      status: 'processing',
      progress: 60,
      message: 'Extracting financial entities'
    });

    // Extract entities if text is available
    let entities = [];
    if (processingResult.text) {
      try {
        // Get OpenRouter API key for financial extraction
        const openRouterApiKey = await apiKeyProvider.getApiKey('openrouter', {
          tenantId: options.tenantId
        });

        entities = await extractFinancialEntities(processingResult.text, {
          apiKey: openRouterApiKey
        });
      } catch (extractionError) {
        console.warn(`Financial entity extraction failed: ${extractionError.message}`);
        console.log('Using basic entity extraction');

        // Use basic entity extraction
        entities = extractBasicFinancialEntities(processingResult.text);
      }
    }

    // Extract securities from entities with enhanced extractor v2
    const securities = extractSecuritiesFromEntities(entities, {
      text: processingResult.text || '',
      tables: processingResult.tables || [],
      financialData: processingResult.financialData || {},
      tenantId: options.tenantId
    }, {
      useCache: options.useCache !== false,
      cacheTTL: options.cacheTTL,
      tenantId: options.tenantId
    });

    // Update processing status
    updateDocumentStatus(documentId, {
      status: 'processing',
      progress: 90,
      message: 'Finalizing document processing'
    });

    // Return processed document
    return {
      metadata: processingResult.metadata || {
        filename: path.basename(filePath),
        fileType: path.extname(filePath).toLowerCase().slice(1),
        createdAt: new Date().toISOString()
      },
      text: processingResult.text || '',
      tables: processingResult.tables || [],
      entities: entities,
      securities: securities
    };
  } catch (error) {
    console.error(`Error processing spreadsheet document: ${error.message}`);

    // Return basic info in case of error
    return {
      metadata: {
        filename: path.basename(filePath),
        fileType: path.extname(filePath).toLowerCase().slice(1),
        createdAt: new Date().toISOString(),
        error: error.message
      },
      text: `Error processing spreadsheet: ${error.message}`,
      tables: [],
      entities: [],
      securities: []
    };
  }
}

/**
 * Process a PDF document using basic techniques
 * @param {string} filePath - Path to the PDF file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Basic PDF processing result
 */
async function processBasicPdf(filePath, options) {
  try {
    console.log(`Processing PDF with basic techniques: ${filePath}`);

    // Import the PDF processor
    const pdfProcessor = require('./pdf-processor');

    // Process PDF
    const processingResult = await pdfProcessor.processPdf(filePath, {
      useOcr: false,
      ...options
    });

    // Return the structured result
    return {
      metadata: processingResult.metadata || {
        filename: path.basename(filePath),
        fileType: 'pdf',
        createdAt: new Date().toISOString()
      },
      text: processingResult.text || '',
      tables: processingResult.tables || []
    };
  } catch (error) {
    console.error(`Error in basic PDF processing: ${error.message}`);
    // Return minimal data if processing fails
    return {
      metadata: {
        filename: path.basename(filePath),
        fileType: 'pdf',
        createdAt: new Date().toISOString()
      },
      text: 'Error processing document: ' + error.message,
      tables: []
    };
  }
}

/**
 * Extract financial entities from text using AI
 * @param {string} text - The document text
 * @param {Object} options - Extraction options
 * @returns {Promise<Array>} - Extracted financial entities
 */
async function extractFinancialEntities(text, options) {
  try {
    console.log('Extracting financial entities from text');

    // Import the entity extractor
    const entityExtractor = require('./entity-extractor');

    // Extract entities
    return await entityExtractor.extractFinancialEntities(text, options);
  } catch (error) {
    console.error(`Error extracting financial entities: ${error.message}`);

    // Fall back to basic extraction
    return extractBasicFinancialEntities(text);
  }
}

/**
 * Basic extraction of financial entities
 * @param {string} text - The document text
 * @returns {Array} - Extracted financial entities
 */
function extractBasicFinancialEntities(text) {
  try {
    console.log('Using basic entity extraction fallback');

    // Import the entity extractor
    const entityExtractor = require('./entity-extractor');

    // Use basic extraction
    return entityExtractor.extractBasicFinancialEntities(text);
  } catch (error) {
    console.error(`Error in basic entity extraction: ${error.message}`);

    // Return minimal set of entities if everything fails
    return [
      { type: 'company', name: 'Unknown Company', confidence: 0.5 }
    ];
  }
}

/**
 * Extract securities from financial entities
 * @param {Array} entities - Financial entities
 * @param {Object} documentContent - Optional document content for enhanced extraction
 * @param {Object} options - Processing options
 * @returns {Array} - Extracted securities
 */
function extractSecuritiesFromEntities(entities, documentContent = null, options = {}) {
  try {
    console.log('Extracting securities from entities with enhanced extractor v2');

    // Import the cached securities extractor
    const cachedSecuritiesExtractor = require('./cached-securities-extractor');

    // Determine if we should use caching
    const useCache = options.useCache !== false;
    
    // Use the appropriate extractor based on caching preference
    if (useCache && documentContent) {
      console.log('Using cached securities extraction');
      return cachedSecuritiesExtractor.extractSecuritiesEnhancedWithCache(
        documentContent,
        {
          tenantId: documentContent.tenantId || options.tenantId,
          ttl: options.cacheTTL || extractionCacheService.DEFAULT_CACHE_TTL
        }
      );
    } else {
      // If caching is disabled or no document content, use the entity extractor directly
      console.log('Using standard securities extraction');
      const entityExtractor = require('./entity-extractor');
      return entityExtractor.extractSecuritiesFromEntities(entities, documentContent);
    }
  } catch (error) {
    console.error(`Error extracting securities from entities: ${error.message}`);

    // Fallback to basic filtering
    return entities
      .filter(entity => entity.type === 'company' && entity.isin)
      .map(entity => ({
        name: entity.name,
        isin: entity.isin,
        ticker: entity.ticker || '',
        quantity: entity.quantity || 0
      }));
  }
}

/**
 * Get document status
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - The document status
 */
async function getDocumentStatus(documentId) {
  try {
    // Get status from processing status map
    if (processingStatus.has(documentId)) {
      return processingStatus.get(documentId);
    }
    
    // Get document to check if it exists
    const document = await getDocumentById(documentId);
    
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    // If document exists but no status, it's not being processed
    return {
      id: documentId,
      status: document.processed ? 'completed' : 'pending',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error getting document status: ${error.message}`);
    throw error;
  }
}

/**
 * Update document status
 * @param {string} documentId - The document ID
 * @param {Object} status - The status update
 */
function updateDocumentStatus(documentId, status) {
  // Get current status or create new one
  const currentStatus = processingStatus.get(documentId) || {
    id: documentId,
    status: 'pending',
    progress: 0
  };
  
  // Update status with new values
  const updatedStatus = {
    ...currentStatus,
    ...status,
    lastUpdated: new Date().toISOString()
  };
  
  // Store updated status
  processingStatus.set(documentId, updatedStatus);
  
  console.log(`Updated status for document ${documentId}: ${updatedStatus.status}, progress: ${updatedStatus.progress}%`);
}

/**
 * Get document by ID
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - The document
 */
async function getDocumentById(documentId) {
  try {
    // Get document from in-memory store
    if (documentStore.has(documentId)) {
      return documentStore.get(documentId);
    }
    
    // Document not found
    return null;
  } catch (error) {
    console.error(`Error getting document by ID: ${error.message}`);
    throw error;
  }
}

/**
 * Store document
 * @param {string} documentId - The document ID
 * @param {Object} document - The document to store
 */
function storeDocument(documentId, document) {
  // Store document in memory
  documentStore.set(documentId, document);
}

/**
 * Get document content
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - The document content
 */
async function getDocumentContent(documentId) {
  try {
    // Get document from store
    const document = await getDocumentById(documentId);
    
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    return document;
  } catch (error) {
    console.error(`Error getting document content: ${error.message}`);
    throw error;
  }
}

/**
 * Create a new document
 * @param {Object} documentData - Document data including file path
 * @returns {Promise<Object>} - The created document
 */
async function createDocument(documentData) {
  try {
    const { fileName, filePath, contentType, userId, tenantId } = documentData;
    
    // Generate document ID
    const documentId = uuidv4();
    
    // Create document object
    const document = {
      id: documentId,
      fileName,
      filePath,
      contentType,
      userId,
      tenantId,
      uploadDate: new Date().toISOString(),
      processed: false
    };
    
    // Store document
    storeDocument(documentId, document);
    
    console.log(`Created document with ID: ${documentId}`);
    
    return document;
  } catch (error) {
    console.error(`Error creating document: ${error.message}`);
    throw error;
  }
}

/**
 * Delete a document
 * @param {string} documentId - The document ID
 * @returns {Promise<boolean>} - Whether the document was deleted
 */
async function deleteDocument(documentId) {
  try {
    // Get document
    const document = await getDocumentById(documentId);
    
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    // Remove from document store
    documentStore.delete(documentId);
    
    // Remove from processing status
    processingStatus.delete(documentId);
    
    // Delete file if it exists
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    console.log(`Deleted document with ID: ${documentId}`);
    
    return true;
  } catch (error) {
    console.error(`Error deleting document: ${error.message}`);
    throw error;
  }
}

/**
 * List documents
 * @param {Object} filters - Filters to apply
 * @returns {Promise<Array>} - List of documents
 */
async function listDocuments(filters = {}) {
  try {
    const { userId, tenantId, processed } = filters;
    
    // Get all documents
    const documents = Array.from(documentStore.values());
    
    // Apply filters
    return documents.filter(doc => {
      // Filter by user ID
      if (userId && doc.userId !== userId) {
        return false;
      }
      
      // Filter by tenant ID
      if (tenantId && doc.tenantId !== tenantId) {
        return false;
      }
      
      // Filter by processed status
      if (processed !== undefined && doc.processed !== processed) {
        return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error(`Error listing documents: ${error.message}`);
    throw error;
  }
}

// Export functions
module.exports = {
  processDocument,
  getDocumentStatus,
  getDocumentContent,
  createDocument,
  deleteDocument,
  listDocuments
};