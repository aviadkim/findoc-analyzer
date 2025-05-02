/**
 * Financial Document Processor
 * 
 * A comprehensive processor for financial documents that combines all agent capabilities.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { DocumentAnalyzerAgent } = require('./document_analyzer');
const { TableUnderstandingAgent } = require('./table_understanding');
const { SecuritiesExtractorAgent } = require('./securities_extractor');
const { FinancialReasonerAgent } = require('./financial_reasoner');

/**
 * Process a financial document
 * @param {string} documentPath - Path to the document
 * @param {object} options - Processing options
 * @returns {Promise<object>} Processing result
 */
const processFinancialDocument = async (documentPath, options = {}) => {
  try {
    console.log(`Processing financial document: ${documentPath}`);
    
    // Create processing ID
    const processingId = uuidv4();
    
    // Create agents
    const documentAnalyzer = new DocumentAnalyzerAgent();
    const tableUnderstanding = new TableUnderstandingAgent();
    const securitiesExtractor = new SecuritiesExtractorAgent();
    const financialReasoner = new FinancialReasonerAgent();
    
    // Step 1: Document Analysis
    console.log('Step 1: Document Analysis');
    const documentAnalysis = await documentAnalyzer.processDocument(documentPath);
    
    // Step 2: Table Understanding
    console.log('Step 2: Table Understanding');
    const processedTables = await tableUnderstanding.processTables(
      documentAnalysis.structure?.tables || documentAnalysis.tables || [],
      documentAnalysis
    );
    
    // Step 3: Securities Extraction
    console.log('Step 3: Securities Extraction');
    const securitiesResult = await securitiesExtractor.processDocument(documentAnalysis, processedTables);
    
    // Step 4: Financial Reasoning
    console.log('Step 4: Financial Reasoning');
    const financialResult = await financialReasoner.processSecurities(securitiesResult);
    
    // Create final result
    const result = {
      processingId,
      documentPath,
      documentType: documentAnalysis.documentType,
      metadata: documentAnalysis.metadata,
      securities: financialResult.securities,
      securitiesCount: financialResult.securitiesCount,
      totalValue: financialResult.totalValue,
      currency: financialResult.currency,
      portfolioMetrics: financialResult.portfolioMetrics,
      insights: financialResult.insights,
      tables: processedTables,
      processingTimestamp: new Date().toISOString()
    };
    
    // Save result if requested
    if (options.saveResult) {
      const resultsDir = options.resultsDir || process.env.RESULTS_FOLDER || '/tmp/results';
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      // Save result
      const resultPath = path.join(resultsDir, `${processingId}.json`);
      fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
      
      // Add result path to result
      result.resultPath = resultPath;
    }
    
    return result;
  } catch (error) {
    console.error('Error processing financial document:', error);
    throw error;
  }
};

/**
 * Query a processed document
 * @param {object} documentResult - Document processing result
 * @param {string} query - Query string
 * @returns {Promise<object>} Query result
 */
const queryFinancialDocument = async (documentResult, query) => {
  try {
    console.log(`Querying document with query: ${query}`);
    
    // Create financial reasoner agent
    const financialReasoner = new FinancialReasonerAgent();
    
    // Query document
    const result = await financialReasoner.queryDocument(documentResult, query);
    
    return result;
  } catch (error) {
    console.error('Error querying financial document:', error);
    throw error;
  }
};

/**
 * Generate a financial report
 * @param {object} documentResult - Document processing result
 * @param {object} options - Report options
 * @returns {Promise<object>} Report generation result
 */
const generateFinancialReport = async (documentResult, options = {}) => {
  try {
    console.log('Generating financial report');
    
    // Create financial reasoner agent
    const financialReasoner = new FinancialReasonerAgent();
    
    // Generate report
    const report = await financialReasoner.generateReport(documentResult, options);
    
    return report;
  } catch (error) {
    console.error('Error generating financial report:', error);
    throw error;
  }
};

/**
 * Get agent system status
 * @returns {Promise<object>} Agent system status
 */
const getFinancialProcessorStatus = async () => {
  try {
    // Get status of each agent
    const documentAnalyzer = new DocumentAnalyzerAgent();
    const tableUnderstanding = new TableUnderstandingAgent();
    const securitiesExtractor = new SecuritiesExtractorAgent();
    const financialReasoner = new FinancialReasonerAgent();
    
    const status = {
      documentAnalyzer: await documentAnalyzer.getStatus(),
      tableUnderstanding: await tableUnderstanding.getStatus(),
      securitiesExtractor: await securitiesExtractor.getStatus(),
      financialReasoner: await financialReasoner.getStatus(),
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    };
    
    return status;
  } catch (error) {
    console.error('Error getting financial processor status:', error);
    throw error;
  }
};

module.exports = {
  processFinancialDocument,
  queryFinancialDocument,
  generateFinancialReport,
  getFinancialProcessorStatus
};
