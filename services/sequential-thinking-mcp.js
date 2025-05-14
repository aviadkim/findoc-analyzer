/**
 * Sequential Thinking MCP Implementation
 * 
 * A custom implementation of the sequential thinking MCP for entity extraction
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// Create event emitter
const emitter = new EventEmitter();

/**
 * Process a thinking request
 * @param {Object} params - Thinking parameters
 * @param {string} params.question - The question to think about
 * @param {number} params.maxSteps - Maximum number of steps
 * @returns {Promise<Object>} - Thinking result
 */
async function think(params) {
  try {
    const { question, maxSteps = 3 } = params;
    
    // Check if question is about entity extraction
    if (question && question.toLowerCase().includes('extract') && question.toLowerCase().includes('entities')) {
      return processEntityExtraction(question, maxSteps);
    }
    
    // Generic thinking process
    return {
      question,
      steps: [
        {
          step: 1,
          content: `Let me think about: ${question}`
        },
        {
          step: 2,
          content: `After careful consideration, I need more specific information to provide a detailed answer.`
        }
      ],
      result: 'Thinking process completed. Please provide more specific information.'
    };
  } catch (error) {
    console.error(`Error in thinking process: ${error.message}`);
    return {
      error: error.message,
      steps: []
    };
  }
}

/**
 * Process entity extraction from text
 * @param {string} question - The extraction question
 * @param {number} maxSteps - Maximum number of steps
 * @returns {Promise<Object>} - Extraction result
 */
async function processEntityExtraction(question, maxSteps) {
  try {
    // Extract text from question
    const textMatch = question.match(/Extract all .* from this text: (.+)$/s);
    const text = textMatch ? textMatch[1] : '';
    
    if (!text) {
      return {
        steps: [
          {
            step: 1,
            content: 'No text provided for entity extraction.'
          }
        ],
        result: 'No text provided for entity extraction.'
      };
    }
    
    // Step 1: Analyze text for financial entities
    const step1 = {
      step: 1,
      content: `Analyzing text for financial entities. The text is ${text.length} characters long.`
    };
    
    // Step 2: Extract companies and securities
    const companies = extractCompanies(text);
    const securities = extractSecurities(text);
    const metrics = extractFinancialMetrics(text);
    const currencies = extractCurrencies(text);
    const isins = extractISINs(text);
    
    const step2 = {
      step: 2,
      content: `Extracted ${companies.length} companies, ${securities.length} securities, ${metrics.length} metrics, ${currencies.length} currencies, and ${isins.length} ISINs.`
    };
    
    // Step 3: Format as structured JSON
    const entities = [
      ...companies.map(company => ({ type: 'company', name: company, confidence: 0.85 })),
      ...securities.map(security => ({ type: 'security', name: security.name, isin: security.isin, confidence: 0.9 })),
      ...metrics.map(metric => ({ type: 'financialMetric', name: metric.name, value: metric.value, confidence: 0.8 })),
      ...currencies.map(currency => ({ type: 'currency', name: currency.currency, value: currency.amount, confidence: 0.95 })),
      ...isins.map(isin => ({ type: 'isin', value: isin, confidence: 0.95 }))
    ];
    
    const step3 = {
      step: 3,
      content: `\`\`\`json
{
  "entities": ${JSON.stringify(entities, null, 2)}
}
\`\`\``
    };
    
    return {
      question,
      steps: [step1, step2, step3].slice(0, maxSteps),
      result: JSON.stringify({ entities })
    };
  } catch (error) {
    console.error(`Error in entity extraction: ${error.message}`);
    return {
      error: error.message,
      steps: [
        {
          step: 1,
          content: `Error in entity extraction: ${error.message}`
        }
      ]
    };
  }
}

/**
 * Extract companies from text
 * @param {string} text - Text to extract from
 * @returns {Array<string>} - Extracted companies
 */
function extractCompanies(text) {
  try {
    // Common company patterns (simplified)
    const companies = [];
    
    // Pattern for company names with "Inc", "Corp", etc.
    const companyPattern = /([A-Z][a-zA-Z0-9\s\.&,]+?)(?:\s+(?:Inc|Corp|Ltd|LLC|SA|NV|SE|Plc|AG))/g;
    let match;
    
    while ((match = companyPattern.exec(text)) !== null) {
      companies.push(match[1].trim());
    }
    
    // Common company names to look for
    const commonCompanies = [
      'Apple', 'Microsoft', 'Amazon', 'Alphabet', 'Google', 'Meta', 'Facebook',
      'Tesla', 'Netflix', 'IBM', 'Intel', 'AMD', 'Nvidia', 'JPMorgan', 'Visa'
    ];
    
    commonCompanies.forEach(company => {
      if (text.includes(company) && !companies.includes(company)) {
        companies.push(company);
      }
    });
    
    // Remove duplicates and return
    return [...new Set(companies)];
  } catch (error) {
    console.error(`Error extracting companies: ${error.message}`);
    return [];
  }
}

/**
 * Extract securities from text
 * @param {string} text - Text to extract from
 * @returns {Array<Object>} - Extracted securities
 */
function extractSecurities(text) {
  try {
    // Extract securities (with ISIN)
    const securities = [];
    
    // Extract ISINs and look for associated securities
    const isins = extractISINs(text);
    
    isins.forEach(isin => {
      const isinIndex = text.indexOf(isin);
      
      if (isinIndex !== -1) {
        // Look for company name before the ISIN
        const contextBefore = text.substring(Math.max(0, isinIndex - 100), isinIndex);
        const match = contextBefore.match(/([A-Z][a-zA-Z0-9\s\.&,]+?)(?:\s*$)/);
        
        if (match) {
          securities.push({
            name: match[1].trim(),
            isin
          });
        } else {
          // If no company name found, still include as a security
          securities.push({
            name: 'Unknown Security',
            isin
          });
        }
      }
    });
    
    return securities;
  } catch (error) {
    console.error(`Error extracting securities: ${error.message}`);
    return [];
  }
}

/**
 * Extract financial metrics from text
 * @param {string} text - Text to extract from
 * @returns {Array<Object>} - Extracted metrics
 */
function extractFinancialMetrics(text) {
  try {
    const metrics = [];
    
    // Common financial metric patterns
    const patterns = [
      // Percentage metrics
      {
        pattern: /([A-Za-z\s]+(?:Rate|Return|Ratio|Margin|Yield|Growth|Percentage|Allocation))\s*:\s*([0-9]+\.?[0-9]*%)/g,
        valueGroup: 2,
        nameGroup: 1
      },
      // Dollar amount metrics
      {
        pattern: /([A-Za-z\s]+(?:Value|Price|Cost|Income|Revenue|Amount|Balance|Earnings|Assets|Liabilities|Equity))\s*:\s*\$([0-9,]+\.?[0-9]*)/g,
        valueGroup: 2,
        nameGroup: 1,
        valuePrefix: '$'
      },
      // Basic metrics with numeric values
      {
        pattern: /([A-Za-z\s]+(?:Ratio|Count|Number|Factor|Index))\s*:\s*([0-9]+\.?[0-9]*)/g,
        valueGroup: 2,
        nameGroup: 1
      }
    ];
    
    patterns.forEach(({ pattern, valueGroup, nameGroup, valuePrefix = '' }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        metrics.push({
          name: match[nameGroup].trim(),
          value: valuePrefix + match[valueGroup].trim()
        });
      }
    });
    
    return metrics;
  } catch (error) {
    console.error(`Error extracting financial metrics: ${error.message}`);
    return [];
  }
}

/**
 * Extract currencies from text
 * @param {string} text - Text to extract from
 * @returns {Array<Object>} - Extracted currencies
 */
function extractCurrencies(text) {
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
      '₴': 'UAH'
    };
    
    // Extract amounts with currency symbols
    Object.entries(currencySymbols).forEach(([symbol, currency]) => {
      const regex = new RegExp(`${symbol.replace('$', '\\$')}\\s*([0-9,]+(?:\\.[0-9]{1,2})?)`, 'g');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        results.push({
          currency,
          amount: match[0].trim()
        });
      }
    });
    
    // Extract amounts with currency codes
    const currencyCodeRegex = /([0-9,]+(?:\.[0-9]{1,2})?)\s*(USD|EUR|GBP|JPY|CHF|AUD|CAD|NZD|HKD)/g;
    let match;
    
    while ((match = currencyCodeRegex.exec(text)) !== null) {
      results.push({
        currency: match[2],
        amount: match[1].trim()
      });
    }
    
    return results;
  } catch (error) {
    console.error(`Error extracting currencies: ${error.message}`);
    return [];
  }
}

/**
 * Extract ISINs from text
 * @param {string} text - Text to extract from
 * @returns {Array<string>} - Extracted ISINs
 */
function extractISINs(text) {
  try {
    // ISIN format: 2 letters followed by 10 alphanumeric characters
    const isinRegex = /[A-Z]{2}[A-Z0-9]{10}/g;
    const matches = text.match(isinRegex) || [];
    
    // Extract unique ISINs
    return [...new Set(matches)];
  } catch (error) {
    console.error(`Error extracting ISINs: ${error.message}`);
    return [];
  }
}

/**
 * Handle sequential thinking requests
 * @param {Object} request - Request object
 * @returns {Promise<Object>} - Response object
 */
async function handleRequest(request) {
  try {
    const { action, params } = request;
    
    switch (action) {
      case 'think':
        return await think(params);
      default:
        return {
          error: `Unknown action: ${action}`
        };
    }
  } catch (error) {
    console.error(`Error handling request: ${error.message}`);
    return {
      error: error.message
    };
  }
}

// Export the module
module.exports = {
  think,
  handleRequest,
  emitter
};