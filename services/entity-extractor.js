/**
 * Entity Extractor Service
 * 
 * This service extracts financial entities such as companies, ISINs, and 
 * other financial information from document text using various methods.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const apiKeyProvider = require('./api-key-provider-service');

// Debug flag
const DEBUG = process.env.DEBUG === 'true';

/**
 * Extract financial entities from text using AI
 * @param {string} text - The document text
 * @param {Object} options - Extraction options including API key
 * @returns {Promise<Array>} - Extracted financial entities
 */
async function extractFinancialEntities(text, options = {}) {
  try {
    if (DEBUG) console.log('Extracting financial entities using AI');
    
    // Get API key from options or provider
    let apiKey = options.apiKey;
    if (!apiKey) {
      try {
        apiKey = await apiKeyProvider.getApiKey('openrouter', { tenantId: options.tenantId });
      } catch (keyError) {
        console.warn(`Failed to get OpenRouter API key: ${keyError.message}`);
        // Fall back to basic extraction
        return extractBasicFinancialEntities(text);
      }
    }
    
    // Define the sample text for processing
    const sampleText = text.length > 4000 ? text.substring(0, 4000) : text;
    
    // Call API to extract entities
    const response = await callOpenRouterAPI(sampleText, apiKey);
    
    // Process and enhance entities
    return processAPIResponse(response, text);
  } catch (error) {
    console.error(`Error extracting financial entities: ${error.message}`);
    
    // Fall back to basic extraction
    return extractBasicFinancialEntities(text);
  }
}

/**
 * Call OpenRouter API to extract entities
 * @param {string} text - Document text
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<Object>} - API response
 */
async function callOpenRouterAPI(text, apiKey) {
  try {
    if (DEBUG) console.log('Calling OpenRouter API');
    
    const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    
    const payload = {
      model: 'anthropic/claude-3-haiku-20240307',
      messages: [
        {
          role: 'system',
          content: 'You are a financial entity extraction expert. Extract all financial entities from the provided text, including companies, securities, ISINs, and financial metrics. Return the results in a structured JSON format.'
        },
        {
          role: 'user',
          content: `Extract all financial entities from the following document text. Return ONLY a JSON array of entities with fields: type (company, security, isin, metric, currency), name, value (if applicable), isin (if applicable), confidence (0.0-1.0).\n\nTEXT:\n${text}`
        }
      ],
      response_format: { type: 'json_object' }
    };
    
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error calling OpenRouter API: ${error.message}`);
    throw error;
  }
}

/**
 * Process API response to extract and enhance entities
 * @param {Object} response - API response
 * @param {string} fullText - Full document text
 * @returns {Array} - Processed entities
 */
function processAPIResponse(response, fullText) {
  try {
    if (DEBUG) console.log('Processing API response');
    
    // Get content from response
    const content = response.choices?.[0]?.message?.content;
    
    if (!content) {
      console.warn('No content in API response');
      return extractBasicFinancialEntities(fullText);
    }
    
    // Parse JSON from content
    let entities;
    try {
      // Try to parse as is
      entities = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON object from text
      const jsonMatch = content.match(/(\[.*\]|\{.*\})/s);
      if (jsonMatch) {
        try {
          entities = JSON.parse(jsonMatch[0]);
        } catch (nestedParseError) {
          console.warn(`Error parsing JSON from API response: ${nestedParseError.message}`);
          return extractBasicFinancialEntities(fullText);
        }
      } else {
        console.warn('No JSON found in API response');
        return extractBasicFinancialEntities(fullText);
      }
    }
    
    // Check if entities is an array or needs to be accessed from a property
    if (!Array.isArray(entities)) {
      // Look for an array property in the object
      const arrayProps = Object.entries(entities).find(([_, value]) => Array.isArray(value));
      if (arrayProps) {
        entities = arrayProps[1];
      } else {
        console.warn('No array found in parsed JSON');
        return extractBasicFinancialEntities(fullText);
      }
    }
    
    // Enhance entities with IDs and additional context
    const enhancedEntities = entities.map(entity => ({
      id: uuidv4(),
      ...entity,
      confidence: entity.confidence || 0.9, // Default confidence
      source: 'ai-extraction'
    }));
    
    // Find additional ISINs that might have been missed
    const extractedISINs = enhancedEntities.filter(entity => entity.type === 'isin').map(entity => entity.value);
    const allISINs = extractISINsFromText(fullText);
    
    // Add missing ISINs
    allISINs.forEach(isin => {
      if (!extractedISINs.includes(isin)) {
        enhancedEntities.push({
          id: uuidv4(),
          type: 'isin',
          value: isin,
          confidence: 0.85,
          source: 'regex-extraction'
        });
      }
    });
    
    return enhancedEntities;
  } catch (error) {
    console.error(`Error processing API response: ${error.message}`);
    return extractBasicFinancialEntities(fullText);
  }
}

/**
 * Basic extraction of financial entities using regex patterns
 * @param {string} text - Document text
 * @returns {Array} - Extracted entities
 */
function extractBasicFinancialEntities(text) {
  try {
    if (DEBUG) console.log('Performing basic financial entity extraction');
    
    const entities = [];
    
    // Extract ISINs
    const isins = extractISINsFromText(text);
    isins.forEach(isin => {
      entities.push({
        id: uuidv4(),
        type: 'isin',
        value: isin,
        confidence: 0.85,
        source: 'regex-extraction'
      });
      
      // Try to find associated company name
      const isinIndex = text.indexOf(isin);
      if (isinIndex !== -1) {
        const contextBefore = text.substring(Math.max(0, isinIndex - 100), isinIndex);
        const companyMatch = contextBefore.match(/([A-Z][a-zA-Z0-9\s\.&,]+?)(?:\s+(?:Inc|Corp|Ltd|LLC|SA|NV|SE|Plc|AG))?(?:\s*\(|\s*$)/);
        
        if (companyMatch) {
          const companyName = companyMatch[0].trim();
          
          // Check if we already have this company
          if (!entities.some(e => e.type === 'company' && e.name === companyName)) {
            entities.push({
              id: uuidv4(),
              type: 'company',
              name: companyName,
              isin,
              confidence: 0.8,
              source: 'regex-extraction'
            });
          }
        }
      }
    });
    
    // Extract currencies and amounts
    const currencyAmounts = extractCurrencyAmounts(text);
    currencyAmounts.forEach(({ currency, amount }) => {
      entities.push({
        id: uuidv4(),
        type: 'currency',
        name: currency,
        value: amount,
        confidence: 0.85,
        source: 'regex-extraction'
      });
    });
    
    // Extract percentage metrics
    const percentages = extractPercentages(text);
    percentages.forEach(({ label, value }) => {
      entities.push({
        id: uuidv4(),
        type: 'metric',
        name: label || 'percentage',
        value,
        confidence: 0.8,
        source: 'regex-extraction'
      });
    });
    
    // Extract common company names
    const commonCompanies = [
      'Apple', 'Microsoft', 'Amazon', 'Alphabet', 'Google', 'Facebook', 'Meta',
      'Tesla', 'Netflix', 'IBM', 'Intel', 'AMD', 'Nvidia', 'Cisco', 'Oracle',
      'JPMorgan', 'Bank of America', 'Goldman Sachs', 'Morgan Stanley', 'Wells Fargo',
      'Citigroup', 'Visa', 'Mastercard', 'PayPal', 'American Express',
      'Johnson & Johnson', 'Pfizer', 'Merck', 'AbbVie', 'Bristol-Myers Squibb',
      'Eli Lilly', 'UnitedHealth', 'CVS Health', 'Walgreens', 'Anthem'
    ];
    
    // Look for these companies in the text
    commonCompanies.forEach(company => {
      if (new RegExp(`\\b${company}\\b`, 'i').test(text)) {
        // Check if we already have this company
        if (!entities.some(e => e.type === 'company' && e.name === company)) {
          entities.push({
            id: uuidv4(),
            type: 'company',
            name: company,
            confidence: 0.75,
            source: 'regex-extraction'
          });
        }
      }
    });
    
    return entities;
  } catch (error) {
    console.error(`Error in basic financial entity extraction: ${error.message}`);
    return [];
  }
}

/**
 * Extract ISINs from text
 * @param {string} text - Document text
 * @returns {Array} - Extracted ISINs
 */
function extractISINsFromText(text) {
  try {
    // ISIN format: 2 letters followed by 10 alphanumeric characters
    const isinRegex = /[A-Z]{2}[A-Z0-9]{10}/g;
    const matches = [...text.matchAll(isinRegex)];
    
    // Extract unique ISINs
    const isins = [...new Set(matches.map(match => match[0]))];
    
    // Filter out invalid ISINs
    return isins.filter(isin => {
      // Check country code (first two letters)
      const countryCode = isin.substring(0, 2);
      const validCountryCodes = [
        'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
        'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
        'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
        'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
        'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
        'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
        'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
        'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
        'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
        'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
        'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
        'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
        'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
        'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
        'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
        'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
      ];
      
      return validCountryCodes.includes(countryCode);
    });
  } catch (error) {
    console.error(`Error extracting ISINs: ${error.message}`);
    return [];
  }
}

/**
 * Extract currency amounts from text
 * @param {string} text - Document text
 * @returns {Array} - Extracted currency amounts
 */
function extractCurrencyAmounts(text) {
  try {
    const results = [];
    
    // Common currency symbols
    const currencySymbols = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR',
      '₽': 'RUB',
      '₣': 'CHF',
      '₩': 'KRW',
      '₴': 'UAH',
      'A$': 'AUD',
      'C$': 'CAD',
      'HK$': 'HKD'
    };
    
    // Extract amounts with currency symbols
    Object.entries(currencySymbols).forEach(([symbol, currency]) => {
      const regex = new RegExp(`${symbol.replace('$', '\\$')}\\s*([0-9,]+(?:\\.[0-9]{1,2})?)`, 'g');
      const matches = [...text.matchAll(regex)];
      
      matches.forEach(match => {
        results.push({
          currency,
          amount: parseFloat(match[1].replace(/,/g, ''))
        });
      });
    });
    
    // Extract amounts with currency codes
    const currencyCodeRegex = /([0-9,]+(?:\.[0-9]{1,2})?)\s*(USD|EUR|GBP|JPY|CHF|AUD|CAD|NZD|HKD)/g;
    const codeMatches = [...text.matchAll(currencyCodeRegex)];
    
    codeMatches.forEach(match => {
      results.push({
        currency: match[2],
        amount: parseFloat(match[1].replace(/,/g, ''))
      });
    });
    
    return results;
  } catch (error) {
    console.error(`Error extracting currency amounts: ${error.message}`);
    return [];
  }
}

/**
 * Extract percentages from text
 * @param {string} text - Document text
 * @returns {Array} - Extracted percentages
 */
function extractPercentages(text) {
  try {
    const results = [];
    
    // Match simple percentages
    const simpleRegex = /([0-9]+(?:\.[0-9]+)?)%/g;
    const simpleMatches = [...text.matchAll(simpleRegex)];
    
    simpleMatches.forEach(match => {
      results.push({
        label: null,
        value: parseFloat(match[1])
      });
    });
    
    // Match labeled percentages
    const labeledRegex = /([A-Za-z\s]+?)(?:\s+at|\s+of|\s+is|\s+:|\s+equals)?\s+([0-9]+(?:\.[0-9]+)?)%/g;
    const labeledMatches = [...text.matchAll(labeledRegex)];
    
    labeledMatches.forEach(match => {
      const label = match[1].trim();
      const value = parseFloat(match[2]);
      
      // Filter out some false positives
      if (label.length < 30 && !label.toLowerCase().includes('page')) {
        results.push({ label, value });
      }
    });
    
    return results;
  } catch (error) {
    console.error(`Error extracting percentages: ${error.message}`);
    return [];
  }
}

/**
 * Extract securities from entities with enhanced v2 extractor integration
 * @param {Array} entities - Extracted entities
 * @param {Object} documentContent - Optional document content for enhanced extraction
 * @returns {Array} - Securities
 */
function extractSecuritiesFromEntities(entities, documentContent = null) {
  try {
    if (DEBUG) console.log('Extracting securities from entities');

    // If document content is provided, use enhanced securities extractor v2 with caching
    if (documentContent && documentContent.text) {
      try {
        // Import the cached securities extractor
        const cachedSecuritiesExtractor = require('./cached-securities-extractor');
        
        // Extract enhanced entities with caching
        return cachedSecuritiesExtractor.extractSecuritiesEnhancedWithCache({
          text: documentContent.text,
          tables: documentContent.tables || [],
          financialData: documentContent.financialData || {},
          tenantId: documentContent.tenantId || null
        });
      } catch (enhancedExtractorError) {
        console.warn(`Enhanced securities extractor v2 failed: ${enhancedExtractorError.message}`);
        console.log('Falling back to basic securities extraction from entities');
        // Fall back to basic extraction if enhanced extractor fails
      }
    }

    // Basic extraction (fallback)
    // Create a map of ISINs to ensure we don't duplicate
    const isinMap = new Map();

    // Create a map of companies by name
    const companyMap = new Map();

    // First, collect all companies
    entities.forEach(entity => {
      if (entity.type === 'company' && entity.name) {
        companyMap.set(entity.name.toLowerCase(), entity);
      }
    });

    // Process all entities with ISINs (securities)
    entities.forEach(entity => {
      if ((entity.type === 'security' || entity.type === 'isin') && entity.isin) {
        // Skip if we've already processed this ISIN
        if (isinMap.has(entity.isin)) {
          return;
        }

        // Initialize security information
        const security = {
          type: 'security',
          isin: entity.isin,
          name: entity.name || 'Unknown',
          ticker: entity.ticker || '',
          quantity: entity.quantity || 0,
          price: entity.price || 0,
          value: entity.value || 0,
          confidence: entity.confidence || 0.8
        };

        // Find matching company by name or ISIN
        if (!security.name || security.name === 'Unknown') {
          // Try to find a company with this ISIN
          const matchingCompany = Array.from(companyMap.values()).find(comp =>
            comp.isin === entity.isin
          );

          if (matchingCompany) {
            security.name = matchingCompany.name;
            if (matchingCompany.ticker) security.ticker = matchingCompany.ticker;
          }
        }

        // Add to the map
        isinMap.set(entity.isin, security);
      }
    });

    // Add securities with company information but without ISINs
    entities.forEach(entity => {
      if (entity.type === 'company' && entity.name && entity.isin) {
        // Skip if we've already processed this ISIN
        if (isinMap.has(entity.isin)) {
          // Update the existing security with company info
          const security = isinMap.get(entity.isin);
          security.name = entity.name;
          if (entity.ticker) security.ticker = entity.ticker;
          return;
        }

        // Create a new security
        const security = {
          type: 'security',
          isin: entity.isin,
          name: entity.name,
          ticker: entity.ticker || '',
          quantity: entity.quantity || 0,
          price: entity.price || 0,
          value: entity.value || 0,
          confidence: entity.confidence || 0.8
        };

        // Add to the map
        isinMap.set(entity.isin, security);
      }
    });

    // Return all securities
    return Array.from(isinMap.values());
  } catch (error) {
    console.error(`Error extracting securities: ${error.message}`);
    return [];
  }
}

module.exports = {
  extractFinancialEntities,
  extractBasicFinancialEntities,
  extractSecuritiesFromEntities
};