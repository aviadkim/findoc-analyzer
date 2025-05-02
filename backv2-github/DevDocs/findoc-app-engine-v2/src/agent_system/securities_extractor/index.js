/**
 * Securities Extractor Agent
 *
 * This agent extracts securities information from tables.
 */

const { generateContentInternal } = require('../../api/controllers/geminiController');
const { detectISINs, validateISIN, extractSecurityInfo, getISINCountryInfo } = require('./isin_detector');

/**
 * Securities Extractor Agent
 */
class SecuritiesExtractorAgent {
  /**
   * Constructor
   * @param {object} options - Agent options
   */
  constructor(options = {}) {
    this.name = 'Securities Extractor Agent';
    this.description = 'Extracts securities information from tables';
    this.options = options;
    this.state = {
      processing: false,
      completed: false
    };
  }

  /**
   * Process document
   * @param {object} documentAnalysis - Document analysis result
   * @param {Array<object>} processedTables - Processed tables
   * @returns {Promise<object>} Securities extraction result
   */
  async processDocument(documentAnalysis, processedTables) {
    try {
      console.log('Securities Extractor processing document');

      // Update state
      this.state = {
        processing: true,
        completed: false
      };

      // Extract securities from tables
      const securities = await this.extractSecuritiesFromTables(processedTables);

      // Extract additional securities from text
      const additionalSecurities = await this.extractSecuritiesFromText(documentAnalysis.text);

      // Merge securities
      const mergedSecurities = this.mergeSecurities([...securities, ...additionalSecurities]);

      // Calculate total value
      const totalValue = mergedSecurities.reduce((sum, security) => {
        return sum + (security.value || 0);
      }, 0);

      // Determine currency
      const currency = this.determineCurrency(mergedSecurities, documentAnalysis.metadata?.currency);

      // Create result
      const result = {
        securities: mergedSecurities,
        securitiesCount: mergedSecurities.length,
        totalValue,
        currency
      };

      // Update state
      this.state = {
        processing: false,
        completed: true
      };

      return result;
    } catch (error) {
      console.error('Error in Securities Extractor:', error);

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
   * Extract securities from tables
   * @param {Array<object>} tables - Tables to extract securities from
   * @returns {Promise<Array<object>>} Extracted securities
   */
  async extractSecuritiesFromTables(tables) {
    try {
      const securities = [];

      // Process each table
      for (const table of tables) {
        // Skip tables that are not securities tables
        if (table.tableType !== 'securities_table') {
          continue;
        }

        // Extract securities from table
        const tableSecurities = await this.extractSecuritiesFromTable(table);
        securities.push(...tableSecurities);
      }

      return securities;
    } catch (error) {
      console.error('Error extracting securities from tables:', error);
      throw error;
    }
  }

  /**
   * Extract securities from table
   * @param {object} table - Table to extract securities from
   * @returns {Promise<Array<object>>} Extracted securities
   */
  async extractSecuritiesFromTable(table) {
    try {
      // Prepare prompt
      const prompt = `
        Extract securities information from the following table:

        Table:
        ${table.text}

        For each security, extract the following information:
        - isin: The ISIN (International Securities Identification Number)
        - name: The security name
        - quantity: The quantity or number of shares
        - price: The price per share
        - value: The total value (quantity * price)
        - currency: The currency
        - weight: The weight or percentage in the portfolio
        - sector: The sector or asset class

        Return the securities as a JSON array of objects with the above properties.
        If a property cannot be extracted, set it to null.
      `;

      try {
        // Generate response using Gemini API
        const responseText = await generateContentInternal(prompt);

        // Extract JSON
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
          try {
            const securities = JSON.parse(jsonMatch[0]);
            return securities;
          } catch (error) {
            console.error('Error parsing securities JSON:', error);
            // Continue to fallback
          }
        }
      } catch (error) {
        console.error('Error extracting securities from table with Gemini:', error);
        // Continue to fallback
      }

      return this.fallbackExtractSecuritiesFromTable(table);
    } catch (error) {
      console.error('Error extracting securities from table:', error);
      return this.fallbackExtractSecuritiesFromTable(table);
    }
  }

  /**
   * Fallback extract securities from table
   * @param {object} table - Table to extract securities from
   * @returns {Array<object>} Extracted securities
   */
  fallbackExtractSecuritiesFromTable(table) {
    try {
      const securities = [];

      // Check if table has rows
      if (!table.rows || table.rows.length === 0) {
        return securities;
      }

      // Process each row
      for (const row of table.rows) {
        // Create security
        const security = {
          isin: this.extractIsin(row),
          name: this.extractName(row),
          quantity: this.extractQuantity(row),
          price: this.extractPrice(row),
          value: this.extractValue(row),
          currency: this.extractCurrency(row),
          weight: this.extractWeight(row),
          sector: this.extractSector(row)
        };

        // Add security if it has at least ISIN or name
        if (security.isin || security.name) {
          securities.push(security);
        }
      }

      return securities;
    } catch (error) {
      console.error('Error in fallback extract securities from table:', error);
      return [];
    }
  }

  /**
   * Extract ISIN from row
   * @param {object} row - Row to extract ISIN from
   * @returns {string|null} Extracted ISIN
   */
  extractIsin(row) {
    // Look for ISIN in row
    for (const [key, value] of Object.entries(row)) {
      if (
        key.toLowerCase().includes('isin') ||
        key.toLowerCase().includes('identifier') ||
        key.toLowerCase().includes('id')
      ) {
        // Check if value is a string and matches ISIN format
        if (typeof value === 'string' && /^[A-Z]{2}[A-Z0-9]{10}$/.test(value)) {
          // Validate ISIN
          if (validateISIN(value)) {
            return value;
          }
        }
      }
    }

    // Look for ISIN format in any field
    for (const value of Object.values(row)) {
      if (typeof value === 'string') {
        // Use ISIN detector to find ISINs in the value
        const rowText = typeof value === 'string' ? value : String(value);
        const isinMatches = detectISINs(rowText);

        if (isinMatches.length > 0) {
          // Return the first valid ISIN
          return isinMatches[0].isin;
        }

        // Fallback to regex pattern
        if (/^[A-Z]{2}[A-Z0-9]{10}$/.test(value) && validateISIN(value)) {
          return value;
        }
      }
    }

    return null;
  }

  /**
   * Extract name from row
   * @param {object} row - Row to extract name from
   * @returns {string|null} Extracted name
   */
  extractName(row) {
    // Look for name in row
    for (const [key, value] of Object.entries(row)) {
      if (
        key.toLowerCase().includes('name') ||
        key.toLowerCase().includes('security') ||
        key.toLowerCase().includes('description') ||
        key.toLowerCase().includes('instrument')
      ) {
        return value;
      }
    }

    return null;
  }

  /**
   * Extract quantity from row
   * @param {object} row - Row to extract quantity from
   * @returns {number|null} Extracted quantity
   */
  extractQuantity(row) {
    // Look for quantity in row
    for (const [key, value] of Object.entries(row)) {
      if (
        key.toLowerCase().includes('quantity') ||
        key.toLowerCase().includes('shares') ||
        key.toLowerCase().includes('units') ||
        key.toLowerCase().includes('amount')
      ) {
        // Convert to number
        const quantity = parseFloat(value);
        return isNaN(quantity) ? null : quantity;
      }
    }

    return null;
  }

  /**
   * Extract price from row
   * @param {object} row - Row to extract price from
   * @returns {number|null} Extracted price
   */
  extractPrice(row) {
    // Look for price in row
    for (const [key, value] of Object.entries(row)) {
      if (
        key.toLowerCase().includes('price') ||
        key.toLowerCase().includes('rate') ||
        key.toLowerCase().includes('nav')
      ) {
        // Convert to number
        const price = parseFloat(value);
        return isNaN(price) ? null : price;
      }
    }

    return null;
  }

  /**
   * Extract value from row
   * @param {object} row - Row to extract value from
   * @returns {number|null} Extracted value
   */
  extractValue(row) {
    // Look for value in row
    for (const [key, value] of Object.entries(row)) {
      if (
        key.toLowerCase().includes('value') ||
        key.toLowerCase().includes('total') ||
        key.toLowerCase().includes('amount') ||
        key.toLowerCase().includes('market value')
      ) {
        // Convert to number
        const rowValue = parseFloat(value);
        return isNaN(rowValue) ? null : rowValue;
      }
    }

    // Try to calculate value from quantity and price
    const quantity = this.extractQuantity(row);
    const price = this.extractPrice(row);

    if (quantity !== null && price !== null) {
      return quantity * price;
    }

    return null;
  }

  /**
   * Extract currency from row
   * @param {object} row - Row to extract currency from
   * @returns {string|null} Extracted currency
   */
  extractCurrency(row) {
    // Look for currency in row
    for (const [key, value] of Object.entries(row)) {
      if (
        key.toLowerCase().includes('currency') ||
        key.toLowerCase().includes('ccy')
      ) {
        return value;
      }
    }

    // Look for currency symbols in value fields
    for (const [key, value] of Object.entries(row)) {
      if (
        key.toLowerCase().includes('value') ||
        key.toLowerCase().includes('price') ||
        key.toLowerCase().includes('amount')
      ) {
        if (typeof value === 'string') {
          // Check for currency symbols
          const currencyMatch = value.match(/(\$|€|£|¥)/);
          if (currencyMatch) {
            // Convert currency symbol to code
            const currencyMap = {
              '$': 'USD',
              '€': 'EUR',
              '£': 'GBP',
              '¥': 'JPY'
            };

            return currencyMap[currencyMatch[1]] || null;
          }
        }
      }
    }

    return null;
  }

  /**
   * Extract weight from row
   * @param {object} row - Row to extract weight from
   * @returns {number|null} Extracted weight
   */
  extractWeight(row) {
    // Look for weight in row
    for (const [key, value] of Object.entries(row)) {
      if (
        key.toLowerCase().includes('weight') ||
        key.toLowerCase().includes('percentage') ||
        key.toLowerCase().includes('allocation') ||
        key.toLowerCase().includes('%')
      ) {
        // Convert to number
        let weight = parseFloat(value);

        // Check if weight is a percentage
        if (!isNaN(weight) && typeof value === 'string' && value.includes('%')) {
          weight /= 100;
        }

        return isNaN(weight) ? null : weight;
      }
    }

    return null;
  }

  /**
   * Extract sector from row
   * @param {object} row - Row to extract sector from
   * @returns {string|null} Extracted sector
   */
  extractSector(row) {
    // Look for sector in row
    for (const [key, value] of Object.entries(row)) {
      if (
        key.toLowerCase().includes('sector') ||
        key.toLowerCase().includes('industry') ||
        key.toLowerCase().includes('asset class') ||
        key.toLowerCase().includes('category')
      ) {
        return value;
      }
    }

    return null;
  }

  /**
   * Extract securities from text
   * @param {string} text - Text to extract securities from
   * @returns {Promise<Array<object>>} Extracted securities
   */
  async extractSecuritiesFromText(text) {
    try {
      console.log('Extracting securities from text');

      // First, try to extract securities using ISIN detector
      const isinMatches = detectISINs(text);

      if (isinMatches.length > 0) {
        console.log(`Found ${isinMatches.length} ISINs in text`);

        // Extract security information for each ISIN
        const securities = isinMatches.map(match => {
          const securityInfo = extractSecurityInfo(match.isin, match.context);
          const countryInfo = getISINCountryInfo(match.isin);

          return {
            ...securityInfo,
            country: countryInfo.name,
            region: countryInfo.region
          };
        });

        return securities;
      }

      // If no ISINs found, try using Gemini API
      console.log('No ISINs found, trying Gemini API');

      // Prepare prompt
      const prompt = `
        Extract securities information from the following text:

        Text:
        ${text.substring(0, 5000)}...

        For each security mentioned, extract the following information:
        - isin: The ISIN (International Securities Identification Number)
        - name: The security name
        - quantity: The quantity or number of shares
        - price: The price per share
        - value: The total value (quantity * price)
        - currency: The currency
        - weight: The weight or percentage in the portfolio
        - sector: The sector or asset class

        Return the securities as a JSON array of objects with the above properties.
        If a property cannot be extracted, set it to null.
        If no securities are mentioned, return an empty array.
      `;

      try {
        // Generate response using Gemini API
        const responseText = await generateContentInternal(prompt);

        // Extract JSON
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
          try {
            const securities = JSON.parse(jsonMatch[0]);

            // Validate ISINs
            for (const security of securities) {
              if (security.isin && !validateISIN(security.isin)) {
                security.isin = null;
              }

              // Add country information if ISIN is valid
              if (security.isin) {
                const countryInfo = getISINCountryInfo(security.isin);
                security.country = countryInfo.name;
                security.region = countryInfo.region;
              }
            }

            return securities;
          } catch (error) {
            console.error('Error parsing securities JSON:', error);
            return [];
          }
        }
      } catch (error) {
        console.error('Error extracting securities from text with Gemini:', error);
      }

      return [];
    } catch (error) {
      console.error('Error extracting securities from text:', error);
      return [];
    }
  }

  /**
   * Merge securities
   * @param {Array<object>} securities - Securities to merge
   * @returns {Array<object>} Merged securities
   */
  mergeSecurities(securities) {
    try {
      // Group securities by ISIN
      const securitiesByIsin = new Map();

      for (const security of securities) {
        // Skip securities without ISIN
        if (!security.isin) {
          continue;
        }

        if (securitiesByIsin.has(security.isin)) {
          // Merge with existing security
          const existingSecurity = securitiesByIsin.get(security.isin);

          // Use non-null values from new security
          for (const [key, value] of Object.entries(security)) {
            if (value !== null && existingSecurity[key] === null) {
              existingSecurity[key] = value;
            }
          }
        } else {
          // Add new security
          securitiesByIsin.set(security.isin, { ...security });
        }
      }

      // Add securities without ISIN
      for (const security of securities) {
        if (!security.isin && security.name) {
          // Check if security with same name exists
          let exists = false;

          for (const existingSecurity of securitiesByIsin.values()) {
            if (existingSecurity.name === security.name) {
              exists = true;
              break;
            }
          }

          if (!exists) {
            // Add security with generated ISIN
            const generatedIsin = 'XX' + security.name.replace(/[^A-Z0-9]/gi, '').substring(0, 10).padEnd(10, '0').toUpperCase();
            securitiesByIsin.set(generatedIsin, { ...security, isin: generatedIsin });
          }
        }
      }

      // Convert map to array
      return Array.from(securitiesByIsin.values());
    } catch (error) {
      console.error('Error merging securities:', error);
      return securities;
    }
  }

  /**
   * Determine currency
   * @param {Array<object>} securities - Securities
   * @param {string} defaultCurrency - Default currency
   * @returns {string} Determined currency
   */
  determineCurrency(securities, defaultCurrency = 'USD') {
    try {
      // Count currencies
      const currencyCounts = new Map();

      for (const security of securities) {
        if (security.currency) {
          const count = currencyCounts.get(security.currency) || 0;
          currencyCounts.set(security.currency, count + 1);
        }
      }

      // Find most common currency
      let maxCount = 0;
      let mostCommonCurrency = defaultCurrency;

      for (const [currency, count] of currencyCounts.entries()) {
        if (count > maxCount) {
          maxCount = count;
          mostCommonCurrency = currency;
        }
      }

      return mostCommonCurrency;
    } catch (error) {
      console.error('Error determining currency:', error);
      return defaultCurrency;
    }
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
  SecuritiesExtractorAgent
};
