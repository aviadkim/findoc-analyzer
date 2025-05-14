/**
 * Multi-Document Analyzer Service
 *
 * This service provides functionality for analyzing multiple documents together,
 * finding relationships between documents, and generating comprehensive reports.
 */

const fs = require('fs');
const path = require('path');
const deepSeekService = require('./deepseek-service');

/**
 * Multi-Document Analyzer
 */
class MultiDocumentAnalyzer {
  /**
   * Initialize the analyzer
   * @param {object} options - Options
   */
  constructor(options = {}) {
    this.options = {
      tempDir: options.tempDir || path.join(process.cwd(), 'temp'),
      resultsDir: options.resultsDir || path.join(process.cwd(), 'results'),
      ...options
    };

    // Create directories if they don't exist
    fs.mkdirSync(this.options.tempDir, { recursive: true });
    fs.mkdirSync(this.options.resultsDir, { recursive: true });
  }

  /**
   * Analyze multiple documents together
   * @param {Array<object>} documents - Array of document objects
   * @returns {Promise<object>} - Analysis results
   */
  async analyzeDocuments(documents) {
    try {
      console.log(`Analyzing ${documents.length} documents together...`);

      // Step 1: Extract information from each document
      const documentInfos = await Promise.all(
        documents.map(async (doc) => {
          try {
            // Get document text
            const documentText = doc.content?.text || doc.text || '';
            
            // Analyze document
            const analysis = await deepSeekService.analyzeDocument(documentText);
            
            // Extract tables
            const tables = await deepSeekService.extractTables(documentText);
            
            // Extract securities
            const securities = await deepSeekService.extractSecurities(documentText);
            
            return {
              id: doc.id,
              fileName: doc.fileName,
              documentType: analysis.documentType || doc.documentType,
              analysis,
              tables,
              securities
            };
          } catch (error) {
            console.error(`Error analyzing document ${doc.id}:`, error);
            return {
              id: doc.id,
              fileName: doc.fileName,
              documentType: doc.documentType,
              error: error.message
            };
          }
        })
      );

      // Step 2: Find relationships between documents
      const relationships = await this.findRelationships(documentInfos);

      // Step 3: Generate a comprehensive report
      const report = await this.generateReport(documentInfos, relationships);

      // Step 4: Save the results
      const resultsPath = path.join(
        this.options.resultsDir,
        `multi-doc-analysis-${Date.now()}.json`
      );
      
      const results = {
        documents: documentInfos,
        relationships,
        report
      };
      
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      return results;
    } catch (error) {
      console.error('Error analyzing multiple documents:', error);
      throw error;
    }
  }

  /**
   * Find relationships between documents
   * @param {Array<object>} documentInfos - Array of document info objects
   * @returns {Promise<Array<object>>} - Relationships
   */
  async findRelationships(documentInfos) {
    try {
      console.log('Finding relationships between documents...');

      // Create a prompt for DeepSeek to find relationships
      const documentsJson = JSON.stringify(
        documentInfos.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          documentType: doc.documentType,
          analysis: doc.analysis
        })),
        null,
        2
      );

      const prompt = `
      Find relationships between the following financial documents using sequential thinking.
      
      STEP 1: Identify common entities
      - Look for common client names, account numbers, dates, etc.
      - Identify securities that appear in multiple documents
      
      STEP 2: Identify temporal relationships
      - Determine if documents are from different time periods
      - Identify if documents show changes over time
      
      STEP 3: Identify complementary information
      - Determine if documents provide different perspectives on the same portfolio
      - Identify if documents contain complementary information
      
      Documents:
      ${documentsJson}
      
      Return the result as a JSON object with a "relationships" array.
      Each relationship should have "type", "description", and "documentIds" fields.
      `;

      const response = await deepSeekService.generateText(prompt, {
        model: 'deepseek/deepseek-chat-v3-0324:free',
        temperature: 0.2,
        maxTokens: 4000
      });

      // Parse the response
      try {
        const result = JSON.parse(response);
        return result.relationships || [];
      } catch (error) {
        console.error('Error parsing relationships response:', error);
        return [];
      }
    } catch (error) {
      console.error('Error finding relationships between documents:', error);
      return [];
    }
  }

  /**
   * Generate a comprehensive report
   * @param {Array<object>} documentInfos - Array of document info objects
   * @param {Array<object>} relationships - Relationships between documents
   * @returns {Promise<object>} - Report
   */
  async generateReport(documentInfos, relationships) {
    try {
      console.log('Generating comprehensive report...');

      // Create a prompt for DeepSeek to generate a report
      const documentsJson = JSON.stringify(
        documentInfos.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          documentType: doc.documentType,
          analysis: doc.analysis,
          securities: doc.securities
        })),
        null,
        2
      );

      const relationshipsJson = JSON.stringify(relationships, null, 2);

      const prompt = `
      Generate a comprehensive financial report based on the following documents and their relationships using sequential thinking.
      
      STEP 1: Summarize each document
      - Provide a brief summary of each document
      - Highlight key information from each document
      
      STEP 2: Analyze relationships
      - Explain how the documents relate to each other
      - Identify complementary information across documents
      
      STEP 3: Provide financial insights
      - Analyze the overall financial situation based on all documents
      - Identify trends, risks, and opportunities
      
      Documents:
      ${documentsJson}
      
      Relationships:
      ${relationshipsJson}
      
      Return the result as a JSON object with the following structure:
      {
        "title": "...",
        "summary": "...",
        "documentSummaries": [...],
        "relationshipAnalysis": "...",
        "financialInsights": "...",
        "recommendations": [...]
      }
      `;

      const response = await deepSeekService.generateText(prompt, {
        model: 'deepseek/deepseek-chat-v3-0324:free',
        temperature: 0.3,
        maxTokens: 4000
      });

      // Parse the response
      try {
        return JSON.parse(response);
      } catch (error) {
        console.error('Error parsing report response:', error);
        return {
          title: 'Multi-Document Analysis Report',
          summary: 'Error generating report',
          error: error.message
        };
      }
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        title: 'Multi-Document Analysis Report',
        summary: 'Error generating report',
        error: error.message
      };
    }
  }

  /**
   * Compare two documents
   * @param {object} document1 - First document
   * @param {object} document2 - Second document
   * @returns {Promise<object>} - Comparison results
   */
  async compareDocuments(document1, document2) {
    try {
      console.log(`Comparing documents: ${document1.fileName} and ${document2.fileName}`);

      // Get document texts
      const text1 = document1.content?.text || document1.text || '';
      const text2 = document2.content?.text || document2.text || '';

      // Create a prompt for DeepSeek to compare documents
      const prompt = `
      Compare the following two financial documents using sequential thinking.
      
      STEP 1: Identify similarities
      - Identify common information between the documents
      - Determine if they refer to the same client, account, time period, etc.
      
      STEP 2: Identify differences
      - Identify information that appears in one document but not the other
      - Determine if there are discrepancies in values, dates, etc.
      
      STEP 3: Analyze implications
      - Determine what the similarities and differences mean
      - Identify potential issues or insights based on the comparison
      
      Document 1:
      ${text1.substring(0, 5000)}
      
      Document 2:
      ${text2.substring(0, 5000)}
      
      Return the result as a JSON object with the following structure:
      {
        "similarities": [...],
        "differences": [...],
        "implications": [...]
      }
      `;

      const response = await deepSeekService.generateText(prompt, {
        model: 'deepseek/deepseek-chat-v3-0324:free',
        temperature: 0.2,
        maxTokens: 4000
      });

      // Parse the response
      try {
        return JSON.parse(response);
      } catch (error) {
        console.error('Error parsing comparison response:', error);
        return {
          similarities: [],
          differences: [],
          implications: [],
          error: error.message
        };
      }
    } catch (error) {
      console.error('Error comparing documents:', error);
      throw error;
    }
  }
}

module.exports = MultiDocumentAnalyzer;
