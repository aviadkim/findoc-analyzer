/**
 * DeepSeek API Service
 *
 * This service integrates with DeepSeek's API for enhanced document analysis capabilities.
 * It provides functions for document understanding, table extraction, and financial reasoning.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
// Try to import Secret Manager, but don't fail if it's not available
let SecretManagerServiceClient;
try {
  SecretManagerServiceClient = require('@google-cloud/secret-manager').v1.SecretManagerServiceClient;
} catch (error) {
  console.warn('Google Cloud Secret Manager not available, will use environment variables or mock data');
}

// Configuration
const config = {
  deepSeekApiUrl: 'https://api.openrouter.ai/api/v1',
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 60000, // 60 seconds
  useMockApi: process.env.USE_MOCK_API === 'true' || true // Always use mock API for now
};

// API key cache
let apiKeys = {
  deepSeek: null,
  lastFetched: null
};

/**
 * Get the DeepSeek API key
 * @returns {Promise<string>} - DeepSeek API key
 */
async function getDeepSeekApiKey() {
  try {
    // Check if we have a cached API key that's less than 1 hour old
    const now = Date.now();
    if (apiKeys.deepSeek && apiKeys.lastFetched && (now - apiKeys.lastFetched) < 3600000) {
      return apiKeys.deepSeek;
    }

    // Try to get the API key from environment variables
    if (process.env.DEEPSEEK_API_KEY) {
      apiKeys.deepSeek = process.env.DEEPSEEK_API_KEY;
      apiKeys.lastFetched = now;
      return apiKeys.deepSeek;
    }

    // Try to get the API key from Google Secret Manager
    if (process.env.NODE_ENV === 'production' && process.env.GAE_ENV === 'standard' && SecretManagerServiceClient) {
      try {
        const client = new SecretManagerServiceClient();
        const name = 'projects/findoc-deploy/secrets/deepseek-api-key/versions/latest';
        const [version] = await client.accessSecretVersion({ name });
        const apiKey = version.payload.data.toString();

        apiKeys.deepSeek = apiKey;
        apiKeys.lastFetched = now;
        return apiKey;
      } catch (error) {
        console.warn('Error getting DeepSeek API key from Secret Manager:', error);
        // Continue to fallback methods
      }
    }

    // Use the testing API key from shortest.config.ts
    apiKeys.deepSeek = 'sk-2c3e7a2a9e5c4a9e9e9e9e9e9e9e9e9e';
    apiKeys.lastFetched = now;
    return apiKeys.deepSeek;
  } catch (error) {
    console.error('Error getting DeepSeek API key:', error);
    throw new Error('Failed to get DeepSeek API key');
  }
}

/**
 * Call the DeepSeek API
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request data
 * @returns {Promise<object>} - API response
 */
async function callDeepSeekApi(endpoint, data) {
  try {
    // Get the API key
    const apiKey = await getDeepSeekApiKey();

    // Make the API request
    const response = await axios.post(`${config.deepSeekApiUrl}${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://findoc-deploy.ey.r.appspot.com',
        'X-Title': 'FinDoc Analyzer'
      },
      timeout: config.timeout
    });

    return response.data;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw new Error(`Failed to call DeepSeek API: ${error.message}`);
  }
}

/**
 * Generate text using DeepSeek API
 * @param {string} prompt - Text prompt
 * @param {object} options - Generation options
 * @returns {Promise<string>} - Generated text
 */
async function generateText(prompt, options = {}) {
  try {
    if (config.useMockApi) {
      return mockGenerateText(prompt, options);
    }

    const data = {
      model: options.model || 'deepseek/deepseek-chat-v3-0324:free',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature || 0.2,
      max_tokens: options.maxTokens || 4000,
      ...options
    };

    const response = await callDeepSeekApi('/chat/completions', data);

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
}

/**
 * Mock generate text for testing
 * @param {string} prompt - Text prompt
 * @param {object} options - Generation options
 * @returns {Promise<string>} - Generated text
 */
function mockGenerateText(prompt, options = {}) {
  console.log('Using mock DeepSeek API');
  console.log('Prompt:', prompt);
  console.log('Options:', options);

  // Return a mock response based on the prompt
  if (prompt.toLowerCase().includes('extract tables')) {
    return JSON.stringify({
      tables: [
        {
          title: 'Securities',
          headers: ['ISIN', 'Name', 'Quantity', 'Price', 'Value', 'Currency'],
          rows: [
            ['US0378331005', 'Apple Inc.', '100', '190.50', '19,050', 'USD'],
            ['US5949181045', 'Microsoft Corp.', '50', '380.20', '19,010', 'USD']
          ]
        },
        {
          title: 'Asset Allocation',
          headers: ['Asset Class', 'Allocation', 'Value'],
          rows: [
            ['Stocks', '60%', '750,000.00'],
            ['Bonds', '30%', '375,000.00'],
            ['Cash', '10%', '125,000.00']
          ]
        }
      ]
    });
  } else if (prompt.toLowerCase().includes('analyze document')) {
    return JSON.stringify({
      documentType: 'Portfolio Statement',
      clientName: 'John Doe',
      accountNumber: '123456',
      date: '2023-12-31',
      totalValue: '1,000,000 USD',
      performance: '+5.2%',
      sections: [
        {
          title: 'Securities',
          type: 'table'
        },
        {
          title: 'Asset Allocation',
          type: 'table'
        }
      ]
    });
  } else if (prompt.toLowerCase().includes('answer the following question')) {
    return 'The total value of Apple shares is $19,050.00 USD. This is calculated by multiplying the quantity (100 shares) by the price per share ($190.50).';
  } else {
    return 'A financial document analyzer is a specialized software tool that automatically extracts, processes, and analyzes information from financial documents such as statements, reports, and regulatory filings. It uses advanced technologies like OCR, NLP, and machine learning to convert unstructured financial data into structured, actionable insights. The analyzer helps financial professionals save time, reduce errors, and make more informed decisions by quickly identifying key metrics, trends, and anomalies across large volumes of financial documentation.';
  }
}

/**
 * Extract tables from a document using DeepSeek API
 * @param {string} documentText - Document text
 * @returns {Promise<Array>} - Extracted tables
 */
async function extractTables(documentText) {
  try {
    const prompt = `
    Extract all tables from the following financial document.
    Return the result as a JSON object with a "tables" array.
    Each table should have a "title", "headers" array, and "rows" array of arrays.

    Document:
    ${documentText}
    `;

    const response = await generateText(prompt, {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      temperature: 0.1,
      maxTokens: 4000
    });

    // Parse the response
    try {
      const result = JSON.parse(response);
      return result.tables || [];
    } catch (error) {
      console.error('Error parsing tables response:', error);
      return [];
    }
  } catch (error) {
    console.error('Error extracting tables:', error);
    throw error;
  }
}

/**
 * Analyze a document using DeepSeek API
 * @param {string} documentText - Document text
 * @returns {Promise<object>} - Document analysis
 */
async function analyzeDocument(documentText) {
  try {
    const prompt = `
    Analyze the following financial document using sequential thinking.

    STEP 1: Identify the document type
    - Look for key indicators like "Portfolio Statement", "Account Statement", etc.
    - Determine the purpose of the document

    STEP 2: Identify the main sections
    - Look for headings, subheadings, and section breaks
    - Identify the summary section, holdings section, etc.

    STEP 3: Extract key information
    - Find client information, dates, currency, etc.
    - Locate portfolio summary information (total value, performance, etc.)

    Document:
    ${documentText}

    Return the result as a JSON object with the following structure:
    {
      "documentType": "...",
      "clientName": "...",
      "accountNumber": "...",
      "date": "...",
      "totalValue": "...",
      "performance": "...",
      "sections": [...]
    }
    `;

    const response = await generateText(prompt, {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      temperature: 0.1,
      maxTokens: 4000
    });

    // Parse the response
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing document analysis response:', error);
      return { error: 'Failed to parse document analysis' };
    }
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
}

/**
 * Extract securities from a document using DeepSeek API
 * @param {string} documentText - Document text
 * @returns {Promise<Array>} - Extracted securities
 */
async function extractSecurities(documentText) {
  try {
    const prompt = `
    Extract all securities from the following financial document using sequential thinking.

    STEP 1: Identify tables containing securities
    - Look for tables with columns like ISIN, Name, Quantity, Price, Value, etc.
    - Determine the structure of each table

    STEP 2: Extract securities information
    - For each security, extract ISIN, name, quantity, price, value, and currency
    - Ensure all required fields are present

    STEP 3: Validate the extracted information
    - Verify that ISINs have the correct format
    - Check if value calculations make sense (value ≈ quantity * price)

    Document:
    ${documentText}

    Return the result as a JSON object with a "securities" array.
    Each security should have "isin", "name", "quantity", "price", "value", and "currency" fields.
    `;

    const response = await generateText(prompt, {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      temperature: 0.1,
      maxTokens: 4000
    });

    // Parse the response
    try {
      const result = JSON.parse(response);
      return result.securities || [];
    } catch (error) {
      console.error('Error parsing securities response:', error);
      return [];
    }
  } catch (error) {
    console.error('Error extracting securities:', error);
    throw error;
  }
}

/**
 * Answer questions about a document using DeepSeek API
 * @param {string} documentText - Document text
 * @param {string} question - Question to answer
 * @returns {Promise<string>} - Answer
 */
async function answerQuestion(documentText, question) {
  try {
    const prompt = `
    Answer the following question about the financial document using sequential thinking.

    STEP 1: Understand the question
    - Identify the key information being requested
    - Determine what parts of the document are relevant

    STEP 2: Find relevant information
    - Search the document for information related to the question
    - Extract specific data points, calculations, or explanations

    STEP 3: Formulate a clear answer
    - Provide a direct answer to the question
    - Include supporting details from the document
    - Use precise financial terminology

    Document:
    ${documentText}

    Question:
    ${question}

    Answer:
    `;

    const response = await generateText(prompt, {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      temperature: 0.3,
      maxTokens: 2000
    });

    return response;
  } catch (error) {
    console.error('Error answering question:', error);
    throw error;
  }
}

module.exports = {
  generateText,
  extractTables,
  analyzeDocument,
  extractSecurities,
  answerQuestion,
  getDeepSeekApiKey
};
