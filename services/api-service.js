/**
 * API Service
 *
 * This service handles API integrations, including:
 * - DeepSeek API for AI processing
 * - API key management
 * - Secure request handling
 * - Error handling and retry logic
 */

const axios = require('axios');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager').v1;

// Configuration
const config = {
  deepSeekApiUrl: 'https://api.deepseek.com/v1',
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
  useMockApi: process.env.USE_MOCK_API === 'true' || true // Default to mock API for development
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
    if (process.env.NODE_ENV === 'production' && process.env.GAE_ENV === 'standard') {
      const client = new SecretManagerServiceClient();
      const name = 'projects/findoc-deploy/secrets/deepseek-api-key/versions/latest';
      const [version] = await client.accessSecretVersion({ name });
      const apiKey = version.payload.data.toString();

      apiKeys.deepSeek = apiKey;
      apiKeys.lastFetched = now;
      return apiKey;
    }

    // Return a mock API key for development
    apiKeys.deepSeek = 'mock-deepseek-api-key';
    apiKeys.lastFetched = now;
    return apiKeys.deepSeek;
  } catch (error) {
    console.error('Error getting DeepSeek API key:', error);

    // Return a mock API key for development
    return 'mock-deepseek-api-key';
  }
}

/**
 * Make a request to the DeepSeek API
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request data
 * @param {object} options - Request options
 * @returns {Promise<object>} - API response
 */
async function callDeepSeekApi(endpoint, data, options = {}) {
  // Use mock API for development
  if (config.useMockApi) {
    return mockDeepSeekApi(endpoint, data, options);
  }

  let retries = 0;

  while (retries <= config.maxRetries) {
    try {
      const apiKey = await getDeepSeekApiKey();

      const response = await axios({
        method: options.method || 'POST',
        url: `${config.deepSeekApiUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...options.headers
        },
        data,
        timeout: options.timeout || config.timeout
      });

      return response.data;
    } catch (error) {
      retries++;

      // Check if we should retry
      if (retries <= config.maxRetries && isRetryableError(error)) {
        console.warn(`Retrying DeepSeek API call (${retries}/${config.maxRetries})...`);
        await sleep(config.retryDelay * retries); // Exponential backoff
        continue;
      }

      // Handle specific error types
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('DeepSeek API error response:', {
          status: error.response.status,
          data: error.response.data
        });

        throw new Error(`DeepSeek API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('DeepSeek API no response:', error.request);
        throw new Error('DeepSeek API no response');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('DeepSeek API request error:', error.message);
        throw error;
      }
    }
  }
}

/**
 * Check if an error is retryable
 * @param {Error} error - Error object
 * @returns {boolean} - Whether the error is retryable
 */
function isRetryableError(error) {
  // Network errors are retryable
  if (!error.response) {
    return true;
  }

  // 429 (Too Many Requests) and 5xx errors are retryable
  const status = error.response.status;
  return status === 429 || (status >= 500 && status < 600);
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Duration in milliseconds
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate text using DeepSeek API
 * @param {string} prompt - Text prompt
 * @param {object} options - Generation options
 * @returns {Promise<string>} - Generated text
 */
async function generateText(prompt, options = {}) {
  try {
    const data = {
      model: options.model || 'deepseek-chat',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
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
 * Answer a question about a document
 * @param {string} question - User question
 * @param {object} document - Document content
 * @param {object} options - Generation options
 * @returns {Promise<string>} - Answer
 */
async function answerQuestion(question, document, options = {}) {
  try {
    // Create a prompt with the document content and question
    const prompt = `
Document Content:
${document.text}

${document.tables && document.tables.length > 0 ? `
Tables:
${document.tables.map(table => `
Table: ${table.title || 'Untitled'}
${table.headers.join(' | ')}
${table.rows.map(row => row.join(' | ')).join('\n')}
`).join('\n')}
` : ''}

Question: ${question}

Please answer the question based only on the information provided in the document above. If the answer cannot be found in the document, say "I don't have enough information to answer this question."
`;

    return await generateText(prompt, options);
  } catch (error) {
    console.error('Error answering question:', error);
    throw error;
  }
}

/**
 * Extract entities from text
 * @param {string} text - Text to extract entities from
 * @param {object} options - Extraction options
 * @returns {Promise<object>} - Extracted entities
 */
async function extractEntities(text, options = {}) {
  try {
    const prompt = `
Extract the following entities from the text below:
${options.entities ? options.entities.join(', ') : 'companies, people, locations, dates, monetary values'}

Text:
${text}

Format the output as JSON with entity types as keys and arrays of extracted entities as values.
`;

    const response = await generateText(prompt, {
      ...options,
      temperature: 0.2 // Lower temperature for more deterministic output
    });

    // Parse the JSON response
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;

      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Error parsing entity extraction response:', parseError);
      return { error: 'Failed to parse entity extraction response', rawResponse: response };
    }
  } catch (error) {
    console.error('Error extracting entities:', error);
    throw error;
  }
}

/**
 * Analyze sentiment of text
 * @param {string} text - Text to analyze
 * @returns {Promise<object>} - Sentiment analysis
 */
async function analyzeSentiment(text) {
  try {
    const prompt = `
Analyze the sentiment of the following text. Provide a score from -1 (very negative) to 1 (very positive), and a brief explanation of the sentiment.

Text:
${text}

Format the output as JSON with 'score' and 'explanation' fields.
`;

    const response = await generateText(prompt, {
      temperature: 0.3 // Lower temperature for more deterministic output
    });

    // Parse the JSON response
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;

      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Error parsing sentiment analysis response:', parseError);
      return { error: 'Failed to parse sentiment analysis response', rawResponse: response };
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
}

/**
 * Mock DeepSeek API for development
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request data
 * @param {object} options - Request options
 * @returns {Promise<object>} - Mock API response
 */
async function mockDeepSeekApi(endpoint, data, options = {}) {
  console.log(`Mock DeepSeek API call: ${endpoint}`);

  // Simulate API latency
  await sleep(500);

  // Handle different endpoints
  if (endpoint === '/chat/completions') {
    return mockChatCompletions(data);
  } else if (endpoint === '/embeddings') {
    return mockEmbeddings(data);
  } else {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }
}

/**
 * Mock chat completions API
 * @param {object} data - Request data
 * @returns {Promise<object>} - Mock API response
 */
function mockChatCompletions(data) {
  const messages = data.messages || [];
  const lastMessage = messages[messages.length - 1]?.content || '';

  let response = '';

  // Generate a response based on the last message
  if (lastMessage.toLowerCase().includes('revenue')) {
    response = 'The total revenue is $10,500,000.';
  } else if (lastMessage.toLowerCase().includes('profit')) {
    response = 'The net profit is $3,300,000 with a profit margin of 31.4%.';
  } else if (lastMessage.toLowerCase().includes('asset')) {
    response = 'The total assets are $25,000,000.';
  } else if (lastMessage.toLowerCase().includes('liabilit')) {
    response = 'The total liabilities are $12,000,000.';
  } else if (lastMessage.toLowerCase().includes('equity')) {
    response = 'The shareholders\' equity is $13,000,000.';
  } else if (lastMessage.toLowerCase().includes('extract') && lastMessage.toLowerCase().includes('entit')) {
    // Mock entity extraction
    response = `\`\`\`json
{
  "companies": ["ABC Corporation", "Apple Inc.", "Microsoft", "Amazon", "Tesla", "Google"],
  "people": ["John Smith", "Jane Doe"],
  "locations": ["New York", "San Francisco", "London"],
  "dates": ["December 31, 2023", "January 15, 2024"],
  "monetary_values": ["$10,500,000", "$7,200,000", "$3,300,000", "$25,000,000", "$12,000,000", "$13,000,000"]
}
\`\`\``;
  } else if (lastMessage.toLowerCase().includes('sentiment')) {
    // Mock sentiment analysis
    response = `\`\`\`json
{
  "score": 0.75,
  "explanation": "The text has a positive sentiment overall, with mentions of growth, profit, and strong financial performance."
}
\`\`\``;
  } else {
    // Default response
    response = 'I\'m a mock AI assistant. I can help you analyze financial documents and answer questions about them.';
  }

  return {
    id: `mock-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: data.model || 'deepseek-chat',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: response
        },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    }
  };
}

/**
 * Mock embeddings API
 * @param {object} data - Request data
 * @returns {Promise<object>} - Mock API response
 */
function mockEmbeddings(data) {
  const input = Array.isArray(data.input) ? data.input : [data.input];

  return {
    object: 'list',
    data: input.map((text, index) => ({
      object: 'embedding',
      embedding: Array(1536).fill(0).map(() => Math.random() * 2 - 1), // Random 1536-dimensional vector
      index
    })),
    model: data.model || 'deepseek-embedding',
    usage: {
      prompt_tokens: input.reduce((sum, text) => sum + text.length / 4, 0),
      total_tokens: input.reduce((sum, text) => sum + text.length / 4, 0)
    }
  };
}

module.exports = {
  generateText,
  answerQuestion,
  extractEntities,
  analyzeSentiment,
  // Export for testing
  mockDeepSeekApi,
  getDeepSeekApiKey,
  callDeepSeekApi
};
