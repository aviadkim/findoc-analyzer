/**
 * Agent System
 *
 * This file exports the agent system functionality.
 */

const {
  processFinancialDocument,
  queryFinancialDocument,
  generateFinancialReport,
  getFinancialProcessorStatus
} = require('./financial_document_processor');

// In-memory storage for processed documents
const processedDocuments = {};

/**
 * Process a document with the agent system
 * @param {string} documentPath - Path to the document
 * @param {object} options - Processing options
 * @returns {Promise<object>} Processing result
 */
const processDocumentWithAgents = async (documentPath, options = {}) => {
  try {
    console.log(`Processing document: ${documentPath}`);

    // Process document with financial document processor
    const result = await processFinancialDocument(documentPath, options);

    // Store result in memory
    if (result.processingId) {
      processedDocuments[result.processingId] = result;
    }

    return result;
  } catch (error) {
    console.error('Error processing document with agents:', error);
    throw error;
  }
};

/**
 * Query a document with the agent system
 * @param {string} documentId - Document ID
 * @param {string} query - Query string
 * @returns {Promise<object>} Query result
 */
const queryDocumentWithAgents = async (documentId, query, options = {}) => {
  try {
    console.log(`Querying document ${documentId} with query: ${query}`);

    // Check if document exists
    if (!processedDocuments[documentId]) {
      throw new Error('Document not found');
    }

    // Get document result
    const documentResult = processedDocuments[documentId];

    // Get tenant ID from options or document result
    const tenantId = options.tenantId || documentResult.tenantId || null;

    // Query document with tenant ID
    const result = await queryFinancialDocument(documentResult, query, { tenantId });

    return result;
  } catch (error) {
    console.error('Error querying document with agents:', error);
    throw error;
  }
};

/**
 * Generate a report for a document
 * @param {string} documentId - Document ID
 * @param {object} options - Report options
 * @returns {Promise<object>} Report generation result
 */
const generateReportWithAgents = async (documentId, options = {}) => {
  try {
    console.log(`Generating report for document ${documentId}`);

    // Check if document exists
    if (!processedDocuments[documentId]) {
      throw new Error('Document not found');
    }

    // Get document result
    const documentResult = processedDocuments[documentId];

    // Get tenant ID from options or document result
    const tenantId = options.tenantId || documentResult.tenantId || null;

    // Generate report with tenant ID
    const result = await generateFinancialReport(documentResult, {
      ...options,
      tenantId
    });

    return result;
  } catch (error) {
    console.error('Error generating report with agents:', error);
    throw error;
  }
};

/**
 * Get agent system status
 * @returns {Promise<object>} Agent system status
 */
const getAgentSystemStatus = async () => {
  try {
    // Get financial processor status
    const status = await getFinancialProcessorStatus();

    return status;
  } catch (error) {
    console.error('Error getting agent system status:', error);
    throw error;
  }
};

/**
 * Run the agent system
 * @param {string} documentId - Document ID
 * @param {object} options - Processing options
 * @returns {Promise<object>} Processing result
 */
const runAgentSystem = async (documentId, options = {}) => {
  try {
    console.log(`Running agent system for document ${documentId}`);

    // Check if document exists
    if (!processedDocuments[documentId]) {
      throw new Error('Document not found');
    }

    // Get document path
    const documentPath = processedDocuments[documentId].documentPath;

    // Process document
    const result = await processDocumentWithAgents(documentPath, options);

    // Store result
    processedDocuments[documentId] = {
      ...processedDocuments[documentId],
      ...result
    };

    return result;
  } catch (error) {
    console.error('Error running agent system:', error);
    throw error;
  }
};

module.exports = {
  processDocumentWithAgents,
  queryDocumentWithAgents,
  generateReportWithAgents,
  getAgentSystemStatus,
  runAgentSystem
};
