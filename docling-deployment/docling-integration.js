/**
 * Docling Integration for FinDoc Analyzer
 * 
 * This script integrates Docling with FinDoc Analyzer for enhanced PDF processing.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const config = {
  doclingApiUrl: process.env.DOCLING_API_URL || 'https://api.docling.ai',
  doclingApiKey: process.env.DOCLING_API_KEY || 'your-api-key',
  tempDir: path.join(__dirname, 'temp'),
  resultsDir: path.join(__dirname, 'results'),
};

// Create directories if they don't exist
if (!fs.existsSync(config.tempDir)) {
  fs.mkdirSync(config.tempDir, { recursive: true });
}

if (!fs.existsSync(config.resultsDir)) {
  fs.mkdirSync(config.resultsDir, { recursive: true });
}

// Docling API client
const doclingClient = {
  /**
   * Process a PDF document with Docling
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<object>} - Docling processing results
   */
  async processPdf(filePath) {
    try {
      console.log(`Processing PDF with Docling: ${filePath}`);
      
      // Create form data
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      form.append('options', JSON.stringify({
        extractTables: true,
        extractText: true,
        extractImages: true,
        detectSecurities: true,
        detectFormulas: true,
        detectCode: true,
        enhancedOcr: true,
      }));
      
      // Make API request
      const response = await axios.post(`${config.doclingApiUrl}/process`, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${config.doclingApiKey}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      
      console.log('Docling processing completed successfully');
      return response.data;
    } catch (error) {
      console.error('Error processing PDF with Docling:', error.message);
      throw error;
    }
  },
  
  /**
   * Extract tables from a PDF document with Docling
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<object>} - Extracted tables
   */
  async extractTables(filePath) {
    try {
      console.log(`Extracting tables with Docling: ${filePath}`);
      
      // Create form data
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      form.append('options', JSON.stringify({
        extractTables: true,
        tableFormat: 'json',
      }));
      
      // Make API request
      const response = await axios.post(`${config.doclingApiUrl}/extract-tables`, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${config.doclingApiKey}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      
      console.log('Table extraction completed successfully');
      return response.data;
    } catch (error) {
      console.error('Error extracting tables with Docling:', error.message);
      throw error;
    }
  },
  
  /**
   * Extract securities from a PDF document with Docling
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<object>} - Extracted securities
   */
  async extractSecurities(filePath) {
    try {
      console.log(`Extracting securities with Docling: ${filePath}`);
      
      // Create form data
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      form.append('options', JSON.stringify({
        detectSecurities: true,
        securityTypes: ['stock', 'bond', 'etf', 'fund', 'crypto'],
      }));
      
      // Make API request
      const response = await axios.post(`${config.doclingApiUrl}/extract-securities`, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${config.doclingApiKey}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      
      console.log('Securities extraction completed successfully');
      return response.data;
    } catch (error) {
      console.error('Error extracting securities with Docling:', error.message);
      throw error;
    }
  },
  
  /**
   * Analyze a financial document with Docling
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<object>} - Financial analysis results
   */
  async analyzeFinancialDocument(filePath) {
    try {
      console.log(`Analyzing financial document with Docling: ${filePath}`);
      
      // Create form data
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      form.append('options', JSON.stringify({
        documentType: 'financial',
        extractTables: true,
        detectSecurities: true,
        extractPortfolioSummary: true,
        extractAssetAllocation: true,
      }));
      
      // Make API request
      const response = await axios.post(`${config.doclingApiUrl}/analyze-financial`, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${config.doclingApiKey}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      
      console.log('Financial document analysis completed successfully');
      return response.data;
    } catch (error) {
      console.error('Error analyzing financial document with Docling:', error.message);
      throw error;
    }
  },
};

// Integration with FinDoc Analyzer
const doclingIntegration = {
  /**
   * Process a document with Docling
   * @param {string} documentId - Document ID
   * @returns {Promise<object>} - Processing results
   */
  async processDocument(documentId) {
    try {
      console.log(`Processing document with Docling: ${documentId}`);
      
      // Get document path
      const documentPath = path.join(__dirname, 'uploads', documentId);
      
      if (!fs.existsSync(documentPath)) {
        throw new Error(`Document not found: ${documentId}`);
      }
      
      // Process document with Docling
      const results = await doclingClient.processPdf(documentPath);
      
      // Save results
      const resultsPath = path.join(config.resultsDir, `${documentId}-docling.json`);
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      
      console.log(`Document processed successfully. Results saved to: ${resultsPath}`);
      return results;
    } catch (error) {
      console.error('Error processing document with Docling:', error.message);
      throw error;
    }
  },
  
  /**
   * Extract tables from a document with Docling
   * @param {string} documentId - Document ID
   * @returns {Promise<object>} - Extracted tables
   */
  async extractTables(documentId) {
    try {
      console.log(`Extracting tables with Docling: ${documentId}`);
      
      // Get document path
      const documentPath = path.join(__dirname, 'uploads', documentId);
      
      if (!fs.existsSync(documentPath)) {
        throw new Error(`Document not found: ${documentId}`);
      }
      
      // Extract tables with Docling
      const tables = await doclingClient.extractTables(documentPath);
      
      // Save results
      const resultsPath = path.join(config.resultsDir, `${documentId}-tables.json`);
      fs.writeFileSync(resultsPath, JSON.stringify(tables, null, 2));
      
      console.log(`Tables extracted successfully. Results saved to: ${resultsPath}`);
      return tables;
    } catch (error) {
      console.error('Error extracting tables with Docling:', error.message);
      throw error;
    }
  },
  
  /**
   * Extract securities from a document with Docling
   * @param {string} documentId - Document ID
   * @returns {Promise<object>} - Extracted securities
   */
  async extractSecurities(documentId) {
    try {
      console.log(`Extracting securities with Docling: ${documentId}`);
      
      // Get document path
      const documentPath = path.join(__dirname, 'uploads', documentId);
      
      if (!fs.existsSync(documentPath)) {
        throw new Error(`Document not found: ${documentId}`);
      }
      
      // Extract securities with Docling
      const securities = await doclingClient.extractSecurities(documentPath);
      
      // Save results
      const resultsPath = path.join(config.resultsDir, `${documentId}-securities.json`);
      fs.writeFileSync(resultsPath, JSON.stringify(securities, null, 2));
      
      console.log(`Securities extracted successfully. Results saved to: ${resultsPath}`);
      return securities;
    } catch (error) {
      console.error('Error extracting securities with Docling:', error.message);
      throw error;
    }
  },
  
  /**
   * Analyze a financial document with Docling
   * @param {string} documentId - Document ID
   * @returns {Promise<object>} - Financial analysis results
   */
  async analyzeFinancialDocument(documentId) {
    try {
      console.log(`Analyzing financial document with Docling: ${documentId}`);
      
      // Get document path
      const documentPath = path.join(__dirname, 'uploads', documentId);
      
      if (!fs.existsSync(documentPath)) {
        throw new Error(`Document not found: ${documentId}`);
      }
      
      // Analyze financial document with Docling
      const analysis = await doclingClient.analyzeFinancialDocument(documentPath);
      
      // Save results
      const resultsPath = path.join(config.resultsDir, `${documentId}-financial-analysis.json`);
      fs.writeFileSync(resultsPath, JSON.stringify(analysis, null, 2));
      
      console.log(`Financial document analysis completed successfully. Results saved to: ${resultsPath}`);
      return analysis;
    } catch (error) {
      console.error('Error analyzing financial document with Docling:', error.message);
      throw error;
    }
  },
  
  /**
   * Compare Docling results with scan1 results
   * @param {string} documentId - Document ID
   * @returns {Promise<object>} - Comparison results
   */
  async compareWithScan1(documentId) {
    try {
      console.log(`Comparing Docling results with scan1 results: ${documentId}`);
      
      // Get Docling results
      const doclingResultsPath = path.join(config.resultsDir, `${documentId}-docling.json`);
      
      if (!fs.existsSync(doclingResultsPath)) {
        throw new Error(`Docling results not found: ${documentId}`);
      }
      
      const doclingResults = JSON.parse(fs.readFileSync(doclingResultsPath, 'utf8'));
      
      // Get scan1 results
      const scan1ResultsPath = path.join(config.resultsDir, `${documentId}-scan1.json`);
      
      if (!fs.existsSync(scan1ResultsPath)) {
        throw new Error(`scan1 results not found: ${documentId}`);
      }
      
      const scan1Results = JSON.parse(fs.readFileSync(scan1ResultsPath, 'utf8'));
      
      // Compare results
      const comparison = {
        documentId,
        tables: {
          docling: doclingResults.tables?.length || 0,
          scan1: scan1Results.tables?.length || 0,
          improvement: ((doclingResults.tables?.length || 0) - (scan1Results.tables?.length || 0)) / (scan1Results.tables?.length || 1) * 100,
        },
        securities: {
          docling: doclingResults.securities?.length || 0,
          scan1: scan1Results.securities?.length || 0,
          improvement: ((doclingResults.securities?.length || 0) - (scan1Results.securities?.length || 0)) / (scan1Results.securities?.length || 1) * 100,
        },
        text: {
          docling: doclingResults.text?.length || 0,
          scan1: scan1Results.text?.length || 0,
          improvement: ((doclingResults.text?.length || 0) - (scan1Results.text?.length || 0)) / (scan1Results.text?.length || 1) * 100,
        },
        images: {
          docling: doclingResults.images?.length || 0,
          scan1: scan1Results.images?.length || 0,
          improvement: ((doclingResults.images?.length || 0) - (scan1Results.images?.length || 0)) / (scan1Results.images?.length || 1) * 100,
        },
      };
      
      // Save comparison results
      const comparisonPath = path.join(config.resultsDir, `${documentId}-comparison.json`);
      fs.writeFileSync(comparisonPath, JSON.stringify(comparison, null, 2));
      
      console.log(`Comparison completed successfully. Results saved to: ${comparisonPath}`);
      return comparison;
    } catch (error) {
      console.error('Error comparing results:', error.message);
      throw error;
    }
  },
};

// Export the integration
module.exports = doclingIntegration;
