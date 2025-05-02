/**
 * OpenRouter Service
 *
 * This service provides a client for the OpenRouter API, which allows access to various AI models
 * including Google's Gemini models.
 */

const axios = require('axios');
const cacheService = require('./cacheService');
const crypto = require('crypto');
const errorHandlingService = require('./errorHandlingService');
const apiUsageService = require('./apiUsageService');

/**
 * Generate a cache key for the prompt and options
 * @param {string} prompt - Prompt text
 * @param {object} options - Options
 * @returns {string} Cache key
 */
const generateCacheKey = (prompt, options) => {
  const { model = 'google/gemini-2.0-flash-exp:free' } = options;

  // Create a hash of the prompt and model
  const hash = crypto.createHash('md5').update(`${prompt}|${model}`).digest('hex');

  return `openrouter:${hash}`;
};

/**
 * Make API request to OpenRouter
 * @param {string} prompt - Prompt text
 * @param {object} options - Options
 * @returns {Promise<string>} Generated content
 * @private
 */
const _makeOpenRouterRequest = async (prompt, options) => {
  const {
    model,
    apiKey,
    siteUrl,
    siteName,
    tenantId
  } = options;

  // Estimate token count
  const inputTokens = apiUsageService.estimateTokenCount(prompt);

  // Record start time for latency calculation
  const startTime = Date.now();

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': siteUrl,
          'X-Title': siteName
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from OpenRouter API');
    }

    const content = response.data.choices[0].message.content;

    // Calculate latency
    const latencyMs = Date.now() - startTime;

    // Estimate output token count
    const outputTokens = apiUsageService.estimateTokenCount(content);

    // Record successful request
    apiUsageService.recordRequest('openRouter', {
      model,
      tenantId,
      endpoint: 'chat/completions',
      success: true,
      inputTokens,
      outputTokens,
      latencyMs
    });

    return content;
  } catch (error) {
    // Calculate latency
    const latencyMs = Date.now() - startTime;

    // Record failed request
    apiUsageService.recordRequest('openRouter', {
      model,
      tenantId,
      endpoint: 'chat/completions',
      success: false,
      inputTokens,
      outputTokens: 0,
      latencyMs,
      error: error.message
    });

    throw error;
  }
};

/**
 * Generate content using OpenRouter API
 * @param {string} prompt - Prompt text
 * @param {object} options - Options
 * @param {string} [options.model] - Model to use (default: google/gemini-2.0-flash-exp:free)
 * @param {string} [options.apiKey] - API key to use (default: process.env.OPENROUTER_API_KEY)
 * @param {string} [options.siteUrl] - Site URL for rankings on openrouter.ai
 * @param {string} [options.siteName] - Site name for rankings on openrouter.ai
 * @param {boolean} [options.useCache] - Whether to use cache (default: true)
 * @param {number} [options.cacheTTL] - Cache TTL in milliseconds (default: 30 minutes)
 * @param {number} [options.maxRetries] - Maximum number of retries (default: 3)
 * @param {boolean} [options.useFallbackModels] - Whether to use fallback models (default: true)
 * @returns {Promise<string>} Generated content
 */
const generateContent = async (prompt, options = {}) => {
  const {
    model = 'google/gemini-2.0-flash-exp:free',
    apiKey = process.env.OPENROUTER_API_KEY,
    siteUrl = 'https://findoc-deploy.ey.r.appspot.com',
    siteName = 'FinDoc Analyzer',
    useCache = true,
    cacheTTL = 30 * 60 * 1000, // 30 minutes
    maxRetries = 3,
    useFallbackModels = true
  } = options;

  if (!apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  // Check cache if enabled
  if (useCache) {
    const cacheKey = generateCacheKey(prompt, { model });
    const cachedContent = cacheService.get(cacheKey);

    if (cachedContent) {
      console.log('Using cached response for prompt');
      return cachedContent;
    }
  }

  console.log(`Generating content with OpenRouter API using model: ${model}`);

  try {
    // Define fallback models
    const fallbackModels = useFallbackModels ? [
      model,
      'google/gemini-1.5-pro',
      'anthropic/claude-3-opus:beta',
      'anthropic/claude-3-sonnet:beta',
      'anthropic/claude-3-haiku:beta'
    ] : [model];

    // Remove duplicates
    const uniqueFallbackModels = [...new Set(fallbackModels)];

    // Create fallback functions
    const fallbackFunctions = uniqueFallbackModels.map(fallbackModel => {
      return async () => {
        const requestOptions = {
          model: fallbackModel,
          apiKey,
          siteUrl,
          siteName,
          tenantId
        };

        // Use retry with backoff for each model
        return await errorHandlingService.retryWithBackoff(
          async () => _makeOpenRouterRequest(prompt, requestOptions),
          {
            maxRetries,
            onRetry: (error, retryCount, delay) => {
              console.log(`Retrying request to model ${fallbackModel} (attempt ${retryCount}/${maxRetries}) after ${delay}ms`);
            }
          }
        );
      };
    });

    // Execute with fallbacks
    const content = await errorHandlingService.executeWithFallbacks(fallbackFunctions, {
      shouldFallback: (error) => {
        // Determine if we should try the next fallback model
        const errorType = errorHandlingService.classifyError(error);
        return errorType !== errorHandlingService.ERROR_TYPES.AUTHENTICATION;
      }
    });

    // Cache the response if caching is enabled
    if (useCache && content) {
      const cacheKey = generateCacheKey(prompt, { model });
      cacheService.set(cacheKey, content, cacheTTL);
    }

    return content;
  } catch (error) {
    console.error('Error generating content with OpenRouter API:', error);

    if (error.response) {
      console.error('OpenRouter API response error:', error.response.data);
    }

    throw error;
  }
};

/**
 * Generate a cache key for the prompt, image URL, and options
 * @param {string} prompt - Prompt text
 * @param {string} imageUrl - Image URL
 * @param {object} options - Options
 * @returns {string} Cache key
 */
const generateImageCacheKey = (prompt, imageUrl, options) => {
  const { model = 'google/gemini-2.0-flash-exp:free' } = options;

  // Create a hash of the prompt, image URL, and model
  const hash = crypto.createHash('md5').update(`${prompt}|${imageUrl}|${model}`).digest('hex');

  return `openrouter:image:${hash}`;
};

/**
 * Make API request to OpenRouter with image
 * @param {string} prompt - Prompt text
 * @param {string} imageUrl - Image URL
 * @param {object} options - Options
 * @returns {Promise<string>} Generated content
 * @private
 */
const _makeOpenRouterRequestWithImage = async (prompt, imageUrl, options) => {
  const {
    model,
    apiKey,
    siteUrl,
    siteName,
    tenantId
  } = options;

  // Estimate token count
  const inputTokens = apiUsageService.estimateTokenCount(prompt) + 1000; // Add 1000 tokens for image

  // Record start time for latency calculation
  const startTime = Date.now();

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': siteUrl,
          'X-Title': siteName
        },
        timeout: 60000 // 60 seconds timeout for image processing
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from OpenRouter API');
    }

    const content = response.data.choices[0].message.content;

    // Calculate latency
    const latencyMs = Date.now() - startTime;

    // Estimate output token count
    const outputTokens = apiUsageService.estimateTokenCount(content);

    // Record successful request
    apiUsageService.recordRequest('openRouter', {
      model,
      tenantId,
      endpoint: 'chat/completions/image',
      success: true,
      inputTokens,
      outputTokens,
      latencyMs
    });

    return content;
  } catch (error) {
    // Calculate latency
    const latencyMs = Date.now() - startTime;

    // Record failed request
    apiUsageService.recordRequest('openRouter', {
      model,
      tenantId,
      endpoint: 'chat/completions/image',
      success: false,
      inputTokens,
      outputTokens: 0,
      latencyMs,
      error: error.message
    });

    throw error;
  }
};

/**
 * Generate content with image using OpenRouter API
 * @param {string} prompt - Prompt text
 * @param {string} imageUrl - Image URL
 * @param {object} options - Options
 * @param {string} [options.model] - Model to use (default: google/gemini-2.0-flash-exp:free)
 * @param {string} [options.apiKey] - API key to use (default: process.env.OPENROUTER_API_KEY)
 * @param {string} [options.siteUrl] - Site URL for rankings on openrouter.ai
 * @param {string} [options.siteName] - Site name for rankings on openrouter.ai
 * @param {boolean} [options.useCache] - Whether to use cache (default: true)
 * @param {number} [options.cacheTTL] - Cache TTL in milliseconds (default: 30 minutes)
 * @param {number} [options.maxRetries] - Maximum number of retries (default: 3)
 * @param {boolean} [options.useFallbackModels] - Whether to use fallback models (default: true)
 * @returns {Promise<string>} Generated content
 */
const generateContentWithImage = async (prompt, imageUrl, options = {}) => {
  const {
    model = 'google/gemini-2.0-flash-exp:free',
    apiKey = process.env.OPENROUTER_API_KEY,
    siteUrl = 'https://findoc-deploy.ey.r.appspot.com',
    siteName = 'FinDoc Analyzer',
    useCache = true,
    cacheTTL = 30 * 60 * 1000, // 30 minutes
    maxRetries = 3,
    useFallbackModels = true
  } = options;

  if (!apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  if (!imageUrl) {
    throw new Error('Image URL is required');
  }

  // Check cache if enabled
  if (useCache) {
    const cacheKey = generateImageCacheKey(prompt, imageUrl, { model });
    const cachedContent = cacheService.get(cacheKey);

    if (cachedContent) {
      console.log('Using cached response for prompt with image');
      return cachedContent;
    }
  }

  console.log(`Generating content with image using OpenRouter API using model: ${model}`);

  try {
    // Define fallback models that support image input
    const fallbackModels = useFallbackModels ? [
      model,
      'google/gemini-1.5-pro-vision',
      'anthropic/claude-3-opus:beta',
      'anthropic/claude-3-sonnet:beta',
      'anthropic/claude-3-haiku:beta'
    ] : [model];

    // Remove duplicates
    const uniqueFallbackModels = [...new Set(fallbackModels)];

    // Create fallback functions
    const fallbackFunctions = uniqueFallbackModels.map(fallbackModel => {
      return async () => {
        const requestOptions = {
          model: fallbackModel,
          apiKey,
          siteUrl,
          siteName,
          tenantId
        };

        // Use retry with backoff for each model
        return await errorHandlingService.retryWithBackoff(
          async () => _makeOpenRouterRequestWithImage(prompt, imageUrl, requestOptions),
          {
            maxRetries,
            onRetry: (error, retryCount, delay) => {
              console.log(`Retrying image request to model ${fallbackModel} (attempt ${retryCount}/${maxRetries}) after ${delay}ms`);
            }
          }
        );
      };
    });

    // Execute with fallbacks
    const content = await errorHandlingService.executeWithFallbacks(fallbackFunctions, {
      shouldFallback: (error) => {
        // Determine if we should try the next fallback model
        const errorType = errorHandlingService.classifyError(error);
        return errorType !== errorHandlingService.ERROR_TYPES.AUTHENTICATION;
      }
    });

    // Cache the response if caching is enabled
    if (useCache && content) {
      const cacheKey = generateImageCacheKey(prompt, imageUrl, { model });
      cacheService.set(cacheKey, content, cacheTTL);
    }

    return content;
  } catch (error) {
    console.error('Error generating content with image using OpenRouter API:', error);

    if (error.response) {
      console.error('OpenRouter API response error:', error.response.data);
    }

    throw error;
  }
};

/**
 * Verify OpenRouter API key
 * @param {string} apiKey - API key to verify
 * @returns {Promise<boolean>} Whether the API key is valid
 */
const verifyApiKey = async (apiKey) => {
  try {
    const response = await generateContent('Hello, world!', { apiKey });
    return !!response;
  } catch (error) {
    console.error('Error verifying OpenRouter API key:', error);
    return false;
  }
};

module.exports = {
  generateContent,
  generateContentWithImage,
  verifyApiKey
};
