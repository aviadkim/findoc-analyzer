/**
 * Document Analyzer Agent
 *
 * This agent analyzes document structure and extracts raw data.
 */

const fs = require('fs');
const path = require('path');
const { generateContentInternal } = require('../../api/controllers/geminiController');
const { createWorker } = require('tesseract.js');
const { parsePdf } = require('./pdf_parser');

/**
 * Document Analyzer Agent
 */
class DocumentAnalyzerAgent {
  /**
   * Constructor
   * @param {object} options - Agent options
   */
  constructor(options = {}) {
    this.name = 'Document Analyzer Agent';
    this.description = 'Analyzes document structure and extracts raw data';
    this.options = options;
    this.state = {
      processing: false,
      completed: false
    };
  }

  /**
   * Process a document
   * @param {string} documentPath - Path to the document
   * @returns {Promise<object>} Document analysis result
   */
  async processDocument(documentPath, options = {}) {
    try {
      console.log(`Document Analyzer processing: ${documentPath}`);

      // Get tenant ID from options
      const tenantId = options.tenantId || null;

      // Update state
      this.state = {
        processing: true,
        completed: false
      };

      // Analyze document based on file type
      const ext = path.extname(documentPath).toLowerCase();

      let analysisResult;

      if (ext === '.pdf') {
        analysisResult = await this.analyzePdf(documentPath);
      } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
        analysisResult = await this.analyzeImage(documentPath);
      } else if (ext === '.xlsx' || ext === '.xls') {
        analysisResult = await this.analyzeExcel(documentPath);
      } else if (ext === '.csv') {
        analysisResult = await this.analyzeCsv(documentPath);
      } else {
        throw new Error(`Unsupported file type: ${ext}`);
      }

      // Determine document type with tenant ID
      const documentType = await this.determineDocumentType(analysisResult.text, tenantId);
      analysisResult.documentType = documentType;

      // Extract metadata with tenant ID
      const metadata = await this.extractMetadata(analysisResult.text, documentType, tenantId);
      analysisResult.metadata = metadata;

      // Add tenant ID to analysis result
      analysisResult.tenantId = tenantId;

      // Update state
      this.state = {
        processing: false,
        completed: true
      };

      return analysisResult;
    } catch (error) {
      console.error('Error in Document Analyzer:', error);

      // Update state
      this.state = {
        processing: false,
        completed: false,
        error: error.message
      };

      throw error;
    }
  }

  /**
   * Analyze a PDF document
   * @param {string} pdfPath - Path to the PDF document
   * @returns {Promise<object>} PDF analysis result
   */
  async analyzePdf(pdfPath) {
    try {
      console.log(`Analyzing PDF: ${pdfPath}`);

      // Use enhanced PDF parser
      const pdfData = await parsePdf(pdfPath);

      return pdfData;
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      throw error;
    }
  }

  /**
   * Analyze an image document
   * @param {string} imagePath - Path to the image document
   * @returns {Promise<object>} Image analysis result
   */
  async analyzeImage(imagePath) {
    try {
      console.log(`Analyzing image: ${imagePath}`);

      // Create Tesseract worker
      const worker = await createWorker();

      // Recognize text
      const { data } = await worker.recognize(imagePath);

      // Terminate worker
      await worker.terminate();

      // Extract text
      const text = data.text;

      // Identify tables
      const tables = this.identifyTables(text);

      return {
        documentPath: imagePath,
        text,
        pageCount: 1,
        tables,
        structure: {
          pages: [
            {
              pageNumber: 1,
              text,
              width: 0,
              height: 0
            }
          ],
          tables,
          headers: [],
          footers: [],
          sections: []
        }
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  /**
   * Analyze an Excel document
   * @param {string} excelPath - Path to the Excel document
   * @returns {Promise<object>} Excel analysis result
   */
  async analyzeExcel(excelPath) {
    try {
      console.log(`Analyzing Excel: ${excelPath}`);

      // This is a mock implementation
      // In a real implementation, we would use a library like xlsx

      return {
        documentPath: excelPath,
        text: 'Excel document',
        pageCount: 1,
        tables: [],
        structure: {
          pages: [
            {
              pageNumber: 1,
              text: 'Excel document',
              width: 0,
              height: 0
            }
          ],
          tables: [],
          headers: [],
          footers: [],
          sections: []
        }
      };
    } catch (error) {
      console.error('Error analyzing Excel:', error);
      throw error;
    }
  }

  /**
   * Analyze a CSV document
   * @param {string} csvPath - Path to the CSV document
   * @returns {Promise<object>} CSV analysis result
   */
  async analyzeCsv(csvPath) {
    try {
      console.log(`Analyzing CSV: ${csvPath}`);

      // This is a mock implementation
      // In a real implementation, we would use a library like csv-parser

      return {
        documentPath: csvPath,
        text: 'CSV document',
        pageCount: 1,
        tables: [],
        structure: {
          pages: [
            {
              pageNumber: 1,
              text: 'CSV document',
              width: 0,
              height: 0
            }
          ],
          tables: [],
          headers: [],
          footers: [],
          sections: []
        }
      };
    } catch (error) {
      console.error('Error analyzing CSV:', error);
      throw error;
    }
  }

  /**
   * Identify tables in text
   * @param {string} text - Document text
   * @returns {Array<object>} Identified tables
   */
  identifyTables(text) {
    // This is a simplified implementation
    // In a real implementation, we would use a more sophisticated approach

    const tables = [];

    // Look for table-like patterns
    const lines = text.split('\n');

    let tableStart = -1;
    let tableEnd = -1;
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if line looks like a table row
      const isTableRow = line.includes('|') || (line.split(/\s{2,}/).length >= 3);

      if (isTableRow && !inTable) {
        // Start of table
        tableStart = i;
        inTable = true;
      } else if (!isTableRow && inTable) {
        // End of table
        tableEnd = i - 1;
        inTable = false;

        // Add table
        if (tableEnd - tableStart >= 2) { // At least 3 rows (header + data)
          tables.push({
            startLine: tableStart,
            endLine: tableEnd,
            text: lines.slice(tableStart, tableEnd + 1).join('\n')
          });
        }
      }
    }

    // Check if we're still in a table at the end
    if (inTable) {
      tableEnd = lines.length - 1;

      // Add table
      if (tableEnd - tableStart >= 2) { // At least 3 rows (header + data)
        tables.push({
          startLine: tableStart,
          endLine: tableEnd,
          text: lines.slice(tableStart, tableEnd + 1).join('\n')
        });
      }
    }

    return tables;
  }

  /**
   * Determine document type
   * @param {string} text - Document text
   * @returns {Promise<string>} Document type
   */
  async determineDocumentType(text, tenantId = null) {
    try {
      // Prepare prompt
      const prompt = `
        Analyze the following financial document text and determine its type.
        Possible types:
        - portfolio_statement: Contains portfolio holdings, asset allocation, and summary information
        - transaction_statement: Contains transaction history, buys, sells, dividends, etc.
        - performance_report: Contains performance metrics, returns, benchmarks, etc.
        - account_statement: Contains account information, balances, etc.
        - tax_document: Contains tax information, tax forms, etc.
        - unknown: Cannot determine the document type

        Document text (excerpt):
        ${text.substring(0, 2000)}...

        Return only the document type as a single word, no explanation.
      `;

      try {
        // Generate response using Gemini API with tenant ID
        const documentType = await generateContentInternal(prompt, tenantId);

        // Validate document type
        const validTypes = [
          'portfolio_statement',
          'transaction_statement',
          'performance_report',
          'account_statement',
          'tax_document'
        ];

        if (validTypes.includes(documentType.trim().toLowerCase())) {
          return documentType.trim().toLowerCase();
        }
      } catch (error) {
        console.error('Error determining document type with Gemini:', error);
        // Continue to fallback
      }

      // Fallback to rule-based approach
      return this.determineDocumentTypeRuleBased(text);
    } catch (error) {
      console.error('Error determining document type:', error);
      // Fallback to rule-based approach
      return this.determineDocumentTypeRuleBased(text);
    }
  }

  /**
   * Determine document type using rule-based approach
   * @param {string} text - Document text
   * @returns {string} Document type
   */
  determineDocumentTypeRuleBased(text) {
    // Convert text to lowercase for case-insensitive matching
    const lowercaseText = text.toLowerCase();

    // Check for portfolio statement features
    const portfolioFeatures = [
      'portfolio', 'holdings', 'positions', 'securities',
      'asset allocation', 'investment summary', 'account summary'
    ];

    const portfolioScore = portfolioFeatures.reduce((score, feature) => {
      return score + (lowercaseText.includes(feature) ? 1 : 0);
    }, 0);

    // Check for transaction statement features
    const transactionFeatures = [
      'transaction', 'trade', 'buy', 'sell', 'purchase',
      'sale', 'dividend', 'interest', 'fee', 'commission'
    ];

    const transactionScore = transactionFeatures.reduce((score, feature) => {
      return score + (lowercaseText.includes(feature) ? 1 : 0);
    }, 0);

    // Check for performance report features
    const performanceFeatures = [
      'performance', 'return', 'yield', 'gain', 'loss',
      'profit', 'benchmark', 'comparison', 'historical'
    ];

    const performanceScore = performanceFeatures.reduce((score, feature) => {
      return score + (lowercaseText.includes(feature) ? 1 : 0);
    }, 0);

    // Check for account statement features
    const accountFeatures = [
      'account statement', 'balance', 'opening balance', 'closing balance',
      'account number', 'account summary', 'statement period'
    ];

    const accountScore = accountFeatures.reduce((score, feature) => {
      return score + (lowercaseText.includes(feature) ? 1 : 0);
    }, 0);

    // Check for tax document features
    const taxFeatures = [
      'tax', 'form', 'irs', 'w-2', '1099', 'tax year',
      'taxable', 'deduction', 'withholding'
    ];

    const taxScore = taxFeatures.reduce((score, feature) => {
      return score + (lowercaseText.includes(feature) ? 1 : 0);
    }, 0);

    // Determine document type based on scores
    const scores = [
      { type: 'portfolio_statement', score: portfolioScore },
      { type: 'transaction_statement', score: transactionScore },
      { type: 'performance_report', score: performanceScore },
      { type: 'account_statement', score: accountScore },
      { type: 'tax_document', score: taxScore }
    ];

    // Sort scores in descending order
    scores.sort((a, b) => b.score - a.score);

    // Return the document type with the highest score
    // If the highest score is 0, return 'unknown'
    return scores[0].score > 0 ? scores[0].type : 'unknown';
  }

  /**
   * Extract metadata from document text
   * @param {string} text - Document text
   * @param {string} documentType - Document type
   * @returns {Promise<object>} Extracted metadata
   */
  async extractMetadata(text, documentType, tenantId = null) {
    try {
      // Prepare prompt
      const prompt = `
        Extract metadata from the following financial document text.
        Document type: ${documentType}

        Extract the following information:
        - date: The document date or statement period
        - clientName: The client name
        - accountNumber: The account number
        - currency: The primary currency used in the document
        - institution: The financial institution name

        Document text (excerpt):
        ${text.substring(0, 2000)}...

        Return the information as a JSON object with the fields: date, clientName, accountNumber, currency, institution.
        If a field cannot be extracted, set it to null.
      `;

      try {
        // Generate response using Gemini API with tenant ID
        const responseText = await generateContentInternal(prompt, tenantId);

        // Extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          try {
            const metadata = JSON.parse(jsonMatch[0]);
            return metadata;
          } catch (error) {
            console.error('Error parsing metadata JSON:', error);
            // Continue to fallback
          }
        }
      } catch (error) {
        console.error('Error extracting metadata with Gemini:', error);
        // Continue to fallback
      }

      // Fallback to rule-based approach
      return this.extractMetadataRuleBased(text, documentType);
    } catch (error) {
      console.error('Error extracting metadata:', error);
      // Fallback to rule-based approach
      return this.extractMetadataRuleBased(text, documentType);
    }
  }

  /**
   * Extract metadata from document text using rule-based approach
   * @param {string} text - Document text
   * @param {string} documentType - Document type
   * @returns {object} Extracted metadata
   */
  extractMetadataRuleBased(text, documentType) {
    // This is a simplified implementation
    // In a real implementation, we would use a more sophisticated approach

    const metadata = {
      date: this.extractDate(text),
      clientName: this.extractClientName(text),
      accountNumber: this.extractAccountNumber(text),
      currency: this.extractCurrency(text),
      institution: this.extractInstitution(text)
    };

    return metadata;
  }

  /**
   * Extract date from text
   * @param {string} text - Document text
   * @returns {string|null} Extracted date
   */
  extractDate(text) {
    // Look for date patterns
    const datePatterns = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
      /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2}),? (\d{4})/i,
      /(\d{1,2}) (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{4})/i,
      /(?:January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}),? (\d{4})/i,
      /(\d{1,2}) (?:January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})/i,
      /(?:Statement|Period|Date)(?:\s+(?:Date|Period|Ending))?:\s*([A-Za-z0-9\s,\/\-\.]+)/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  /**
   * Extract client name from text
   * @param {string} text - Document text
   * @returns {string|null} Extracted client name
   */
  extractClientName(text) {
    // Look for client name patterns
    const clientPatterns = [
      /(?:Client|Customer|Account Holder|Name):\s*([A-Za-z\s]+)/i,
      /(?:Prepared for|Statement for):\s*([A-Za-z\s]+)/i,
      /(?:Dear|To)(?:\s+(?:Mr\.|Mrs\.|Ms\.|Dr\.))?\s+([A-Za-z\s]+)(?:,|:)/i
    ];

    for (const pattern of clientPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Extract account number from text
   * @param {string} text - Document text
   * @returns {string|null} Extracted account number
   */
  extractAccountNumber(text) {
    // Look for account number patterns
    const accountPatterns = [
      /(?:Account|Account Number|Account #):\s*([A-Za-z0-9\-]+)/i,
      /(?:Account|Account Number|Account #)\s*([A-Za-z0-9\-]+)/i,
      /(?:Account|Account Number|Account #)(?:\s+(?:Number|#|No\.))?\s*:?\s*([A-Za-z0-9\-]+)/i
    ];

    for (const pattern of accountPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Extract currency from text
   * @param {string} text - Document text
   * @returns {string|null} Extracted currency
   */
  extractCurrency(text) {
    // Look for currency patterns
    const currencyPatterns = [
      /(?:Currency|Reported in):\s*([A-Za-z]{3})/i,
      /(?:Currency|Reported in)\s*([A-Za-z]{3})/i,
      /(?:USD|EUR|GBP|JPY|CHF|CAD|AUD|NZD)/i,
      /(?:US Dollar|Euro|British Pound|Japanese Yen|Swiss Franc|Canadian Dollar|Australian Dollar|New Zealand Dollar)/i,
      /(?:\$|€|£|¥|₣|C\$|A\$|NZ\$)/
    ];

    for (const pattern of currencyPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[1]) {
          return match[1].trim().toUpperCase();
        } else {
          const currency = match[0].trim().toUpperCase();

          // Convert currency symbols to codes
          const currencyMap = {
            '$': 'USD',
            '€': 'EUR',
            '£': 'GBP',
            '¥': 'JPY',
            '₣': 'CHF',
            'C$': 'CAD',
            'A$': 'AUD',
            'NZ$': 'NZD',
            'US DOLLAR': 'USD',
            'EURO': 'EUR',
            'BRITISH POUND': 'GBP',
            'JAPANESE YEN': 'JPY',
            'SWISS FRANC': 'CHF',
            'CANADIAN DOLLAR': 'CAD',
            'AUSTRALIAN DOLLAR': 'AUD',
            'NEW ZEALAND DOLLAR': 'NZD'
          };

          return currencyMap[currency] || currency;
        }
      }
    }

    // Default to USD
    return 'USD';
  }

  /**
   * Extract institution from text
   * @param {string} text - Document text
   * @returns {string|null} Extracted institution
   */
  extractInstitution(text) {
    // Look for institution patterns
    const institutionPatterns = [
      /(?:Bank|Institution|Broker|Custodian):\s*([A-Za-z\s]+)/i,
      /(?:Bank|Institution|Broker|Custodian)\s*([A-Za-z\s]+)/i,
      /^([A-Za-z\s]+)(?:\s+(?:Bank|Financial|Investments|Securities|Asset Management))/i
    ];

    for (const pattern of institutionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Get agent status
   * @returns {Promise<object>} Agent status
   */
  async getStatus() {
    return {
      name: this.name,
      description: this.description,
      state: this.state,
      apiKeyConfigured: true // We're using the geminiController which handles API key management
    };
  }
}

module.exports = {
  DocumentAnalyzerAgent
};
