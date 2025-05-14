/**
 * Enhanced Extraction Service
 * 
 * Uses MCP integration to enhance document extraction capabilities
 * by leveraging AI models and external knowledge
 */

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const McpIntegration = require('./mcp-integration');

/**
 * Enhanced Extraction service for improving document processing capabilities
 */
class EnhancedExtraction {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {McpIntegration} options.mcpIntegration - MCP integration instance
   * @param {boolean} options.debug - Whether to enable debug logging
   */
  constructor(options = {}) {
    this.mcpIntegration = options.mcpIntegration || new McpIntegration({ debug: options.debug });
    this.debug = options.debug || false;
  }

  /**
   * Extract financial entities from text with enhanced capabilities
   * @param {string} text - Document text content
   * @param {Object} options - Extraction options
   * @returns {Promise<Array>} - Extracted entities
   */
  async extractFinancialEntities(text, options = {}) {
    try {
      // First attempt with sequential thinking to identify potential entities
      const thinkingResult = await this.mcpIntegration.think(
        `Identify potential financial entities (companies, securities, ISINs, etc.) in the following text: ${text.substring(0, 1000)}...`,
        { maxSteps: 3 }
      );
      
      if (this.debug) {
        console.log('Sequential thinking result:', thinkingResult);
      }
      
      // Extract initial entities
      const potentialEntities = this._extractEntitiesFromThinking(thinkingResult);
      
      // Enhance entities with additional information
      const enhancedEntities = await this._enhanceEntitiesWithExternalData(potentialEntities);
      
      // Validate ISINs
      const validatedEntities = this._validateEntities(enhancedEntities);
      
      // Store processing result in memory for future reference
      const memoryKey = `financial_entities_${uuidv4()}`;
      await this.mcpIntegration.memorize(memoryKey, validatedEntities);
      
      if (this.debug) {
        console.log(`Stored ${validatedEntities.length} financial entities in memory with key: ${memoryKey}`);
      }
      
      return validatedEntities;
    } catch (error) {
      console.error(`Error in enhanced financial entity extraction: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Extract financial tables with enhanced capabilities
   * @param {string} filePath - Path to the document file
   * @param {Object} options - Extraction options
   * @returns {Promise<Array>} - Extracted tables
   */
  async extractFinancialTables(filePath, options = {}) {
    try {
      // First attempt regular extraction
      if (this.debug) {
        console.log(`Extracting financial tables from: ${filePath}`);
      }
      
      // Use filesystem MCP to ensure file exists
      const fileExists = await this._checkFileExists(filePath);
      
      if (!fileExists) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      // In a real implementation, this would use OCR or PDF extraction tools
      // For this demo, we'll return mock data
      const mockTables = [
        {
          id: `table-${uuidv4().substring(0, 8)}`,
          title: 'Portfolio Summary',
          headers: ['Security', 'ISIN', 'Quantity', 'Market Value', 'Percentage'],
          rows: [
            ['Apple Inc.', 'US0378331005', '100', '$18,250.00', '14.6%'],
            ['Microsoft Corporation', 'US5949181045', '50', '$15,750.00', '12.6%'],
            ['Amazon.com Inc.', 'US0231351067', '30', '$9,300.00', '7.4%'],
            ['Alphabet Inc.', 'US02079K1079', '20', '$8,500.00', '6.8%'],
            ['Tesla Inc.', 'US88160R1014', '25', '$7,250.00', '5.8%']
          ]
        }
      ];
      
      // Store tables in memory for future reference
      const memoryKey = `financial_tables_${uuidv4()}`;
      await this.mcpIntegration.memorize(memoryKey, mockTables);
      
      if (this.debug) {
        console.log(`Stored ${mockTables.length} financial tables in memory with key: ${memoryKey}`);
      }
      
      return mockTables;
    } catch (error) {
      console.error(`Error in enhanced financial table extraction: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Check if a file exists using filesystem MCP
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} - Whether the file exists
   * @private
   */
  async _checkFileExists(filePath) {
    try {
      const stats = await this.mcpIntegration.filesystem('stat', { path: filePath });
      return stats && stats.isFile;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Extract entities from sequential thinking result
   * @param {Object} thinkingResult - Result from sequential thinking
   * @returns {Array} - Extracted entities
   * @private
   */
  _extractEntitiesFromThinking(thinkingResult) {
    const entities = [];
    const isinPattern = /[A-Z]{2}[A-Z0-9]{9}\d/g;
    
    // Parse thinking steps for ISINs and company names
    if (thinkingResult && thinkingResult.steps) {
      thinkingResult.steps.forEach(step => {
        // Extract ISINs
        const isins = step.content.match(isinPattern) || [];
        
        isins.forEach(isin => {
          // Check if we already have this ISIN
          if (!entities.some(e => e.isin === isin)) {
            entities.push({
              type: 'security',
              isin: isin,
              confidence: 0.9
            });
          }
        });
        
        // Extract company names (simplified approach)
        const companyPatterns = [
          /([A-Z][a-z]+ (?:Inc|Corp|Ltd|LLC|Group|Holding|Company|Technologies|Systems|International))/g,
          /([A-Z][a-z]+ [A-Z][a-z]+ (?:Inc|Corp|Ltd|LLC|Group|Holding|Company|Technologies|Systems|International))/g
        ];
        
        companyPatterns.forEach(pattern => {
          const companies = step.content.match(pattern) || [];
          
          companies.forEach(company => {
            // Check if we already have this company
            if (!entities.some(e => e.name === company)) {
              entities.push({
                type: 'company',
                name: company,
                confidence: 0.7
              });
            }
          });
        });
      });
    }
    
    // If conclusion has a summary, parse it too
    if (thinkingResult && thinkingResult.conclusion) {
      const isins = thinkingResult.conclusion.match(isinPattern) || [];
      
      isins.forEach(isin => {
        // Check if we already have this ISIN
        if (!entities.some(e => e.isin === isin)) {
          entities.push({
            type: 'security',
            isin: isin,
            confidence: 0.9
          });
        }
      });
    }
    
    return entities;
  }
  
  /**
   * Enhance entities with external data using MCPs
   * @param {Array} entities - Extracted entities
   * @returns {Promise<Array>} - Enhanced entities
   * @private
   */
  async _enhanceEntitiesWithExternalData(entities) {
    const enhancedEntities = [...entities];
    
    // Enhance with external data if available
    if (this.mcpIntegration.isAvailable('brave')) {
      // Process batch of up to 5 entities at a time to avoid rate limits
      const batchSize = 5;
      
      for (let i = 0; i < enhancedEntities.length; i += batchSize) {
        const batch = enhancedEntities.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (entity) => {
          try {
            // Search for additional information
            if (entity.type === 'company' && entity.name) {
              const searchQuery = `${entity.name} stock symbol ticker ISIN`;
              const searchResults = await this.mcpIntegration.search(searchQuery, { count: 3 });
              
              if (searchResults && searchResults.results && searchResults.results.length > 0) {
                // Extract ticker from search results
                const result = searchResults.results[0];
                
                // Look for ticker pattern in description
                const tickerPattern = /\(([A-Z]+)(?:\.|:|\))/;
                const tickerMatch = result.description ? result.description.match(tickerPattern) : null;
                
                if (tickerMatch && tickerMatch[1]) {
                  entity.ticker = tickerMatch[1];
                  entity.confidence = 0.85;
                }
                
                // Add source URL
                entity.sources = [result.url];
              }
            }
            
            // For securities with ISIN, look up additional data
            if (entity.type === 'security' && entity.isin) {
              const searchQuery = `${entity.isin} security details`;
              const searchResults = await this.mcpIntegration.search(searchQuery, { count: 3 });
              
              if (searchResults && searchResults.results && searchResults.results.length > 0) {
                // Try to extract company name if not present
                if (!entity.name) {
                  const result = searchResults.results[0];
                  const titleParts = result.title.split(' - ');
                  
                  if (titleParts.length > 1) {
                    entity.name = titleParts[0].trim();
                  } else {
                    entity.name = result.title.replace(/\bISIN\b|\bTicker\b|\bSymbol\b/g, '').trim();
                  }
                }
                
                // Add source URL
                entity.sources = [searchResults.results[0].url];
              }
            }
          } catch (error) {
            console.warn(`Error enhancing entity ${entity.name || entity.isin}: ${error.message}`);
          }
        }));
        
        // Add a small delay between batches
        if (i + batchSize < enhancedEntities.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    return enhancedEntities;
  }
  
  /**
   * Validate entities
   * @param {Array} entities - Entities to validate
   * @returns {Array} - Validated entities
   * @private
   */
  _validateEntities(entities) {
    return entities.map(entity => {
      // Validate ISINs
      if (entity.type === 'security' && entity.isin) {
        entity.isValidIsin = this._validateIsin(entity.isin);
        
        // Reduce confidence if ISIN is invalid
        if (!entity.isValidIsin) {
          entity.confidence = Math.max(0.1, (entity.confidence || 0.5) - 0.4);
        }
      }
      
      return entity;
    });
  }
  
  /**
   * Validate an ISIN code
   * @param {string} isin - ISIN code to validate
   * @returns {boolean} - Whether the ISIN is valid
   * @private
   */
  _validateIsin(isin) {
    // Basic ISIN validation
    if (!isin || typeof isin !== 'string') {
      return false;
    }
    
    // ISIN format: 2 letters (country code) + 9 characters + 1 check digit
    if (!isin.match(/^[A-Z]{2}[A-Z0-9]{9}\d$/)) {
      return false;
    }
    
    // Country code validation (simplified)
    const validCountryCodes = [
      'US', 'GB', 'DE', 'FR', 'JP', 'CN', 'HK', 'AU', 'CA', 'CH', 
      'ES', 'IT', 'NL', 'SE', 'DK', 'NO', 'FI', 'AT', 'BE', 'IE'
    ];
    
    const countryCode = isin.substring(0, 2);
    if (!validCountryCodes.includes(countryCode)) {
      // Allow it to pass if it's a well-formed ISIN but from a less common country
      return true;
    }
    
    // In a real implementation, we would also validate the check digit
    // For this demo, we'll consider it valid at this point
    return true;
  }
  
  /**
   * Generate synthetic securities data for testing
   * @param {number} count - Number of securities to generate
   * @returns {Array} - Generated securities data
   */
  generateSyntheticSecurities(count = 10) {
    const companies = [
      { name: 'Apple Inc.', ticker: 'AAPL', isin: 'US0378331005' },
      { name: 'Microsoft Corporation', ticker: 'MSFT', isin: 'US5949181045' },
      { name: 'Amazon.com Inc.', ticker: 'AMZN', isin: 'US0231351067' },
      { name: 'Alphabet Inc.', ticker: 'GOOGL', isin: 'US02079K1079' },
      { name: 'Tesla Inc.', ticker: 'TSLA', isin: 'US88160R1014' },
      { name: 'Meta Platforms Inc.', ticker: 'META', isin: 'US30303M1027' },
      { name: 'NVIDIA Corporation', ticker: 'NVDA', isin: 'US67066G1040' },
      { name: 'Johnson & Johnson', ticker: 'JNJ', isin: 'US4781601046' },
      { name: 'JPMorgan Chase & Co.', ticker: 'JPM', isin: 'US46625H1005' },
      { name: 'Visa Inc.', ticker: 'V', isin: 'US92826C8394' },
      { name: 'Procter & Gamble Co.', ticker: 'PG', isin: 'US7427181091' },
      { name: 'UnitedHealth Group Inc.', ticker: 'UNH', isin: 'US91324P1021' },
      { name: 'Home Depot Inc.', ticker: 'HD', isin: 'US4370761029' },
      { name: 'Bank of America Corp.', ticker: 'BAC', isin: 'US0605051046' },
      { name: 'Mastercard Inc.', ticker: 'MA', isin: 'US57636Q1040' }
    ];
    
    // Select random subset
    const selectedCompanies = [];
    const totalCompanies = Math.min(count, companies.length);
    
    // Shuffle array
    const shuffled = [...companies].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < totalCompanies; i++) {
      const company = shuffled[i];
      
      // Generate random quantity and price
      const quantity = Math.floor(Math.random() * 1000) + 10;
      const price = (Math.random() * 500 + 10).toFixed(2);
      const marketValue = (quantity * parseFloat(price)).toFixed(2);
      
      selectedCompanies.push({
        type: 'security',
        name: company.name,
        ticker: company.ticker,
        isin: company.isin,
        quantity,
        price: `$${price}`,
        marketValue: `$${marketValue}`,
        confidence: 0.95,
        isValidIsin: true
      });
    }
    
    return selectedCompanies;
  }
}

module.exports = EnhancedExtraction;