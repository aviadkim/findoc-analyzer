/**
 * Error Handling Service
 * 
 * This service provides utilities for handling errors and implementing fallback mechanisms.
 */

// Error types
const ERROR_TYPES = {
  NETWORK: 'network',
  API: 'api',
  AUTHENTICATION: 'authentication',
  RATE_LIMIT: 'rate_limit',
  TIMEOUT: 'timeout',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown'
};

/**
 * Classify error based on its properties
 * @param {Error} error - Error object
 * @returns {string} Error type
 */
const classifyError = (error) => {
  if (!error) {
    return ERROR_TYPES.UNKNOWN;
  }
  
  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    return ERROR_TYPES.NETWORK;
  }
  
  // Axios errors
  if (error.response) {
    const status = error.response.status;
    
    // Authentication errors
    if (status === 401 || status === 403) {
      return ERROR_TYPES.AUTHENTICATION;
    }
    
    // Rate limit errors
    if (status === 429) {
      return ERROR_TYPES.RATE_LIMIT;
    }
    
    // Validation errors
    if (status === 400 || status === 422) {
      return ERROR_TYPES.VALIDATION;
    }
    
    // Other API errors
    return ERROR_TYPES.API;
  }
  
  // Timeout errors
  if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
    return ERROR_TYPES.TIMEOUT;
  }
  
  return ERROR_TYPES.UNKNOWN;
};

/**
 * Get retry delay based on error type and retry count
 * @param {string} errorType - Error type
 * @param {number} retryCount - Retry count
 * @returns {number} Retry delay in milliseconds
 */
const getRetryDelay = (errorType, retryCount) => {
  // Base delay (exponential backoff)
  const baseDelay = Math.pow(2, retryCount) * 1000;
  
  // Add jitter to avoid thundering herd problem
  const jitter = Math.random() * 1000;
  
  // Adjust delay based on error type
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      return baseDelay + jitter;
    case ERROR_TYPES.RATE_LIMIT:
      return baseDelay * 2 + jitter; // Longer delay for rate limit errors
    case ERROR_TYPES.TIMEOUT:
      return baseDelay + jitter;
    case ERROR_TYPES.API:
      return baseDelay + jitter;
    default:
      return baseDelay + jitter;
  }
};

/**
 * Should retry based on error type and retry count
 * @param {string} errorType - Error type
 * @param {number} retryCount - Retry count
 * @param {number} maxRetries - Maximum number of retries
 * @returns {boolean} Whether to retry
 */
const shouldRetry = (errorType, retryCount, maxRetries = 3) => {
  if (retryCount >= maxRetries) {
    return false;
  }
  
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
    case ERROR_TYPES.TIMEOUT:
    case ERROR_TYPES.RATE_LIMIT:
      return true;
    case ERROR_TYPES.API:
      return retryCount < 2; // Retry API errors fewer times
    case ERROR_TYPES.AUTHENTICATION:
      return false; // Don't retry authentication errors
    case ERROR_TYPES.VALIDATION:
      return false; // Don't retry validation errors
    default:
      return retryCount < 1; // Only retry unknown errors once
  }
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {object} options - Options
 * @param {number} [options.maxRetries=3] - Maximum number of retries
 * @param {Function} [options.onRetry] - Function to call before retrying
 * @returns {Promise<*>} Result of the function
 */
const retryWithBackoff = async (fn, options = {}) => {
  const { maxRetries = 3, onRetry = null } = options;
  
  let retryCount = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      const errorType = classifyError(error);
      
      if (!shouldRetry(errorType, retryCount, maxRetries)) {
        throw error;
      }
      
      retryCount++;
      
      const delay = getRetryDelay(errorType, retryCount);
      
      console.log(`Retrying after error (${errorType}) - attempt ${retryCount} of ${maxRetries} after ${delay}ms`);
      
      if (onRetry) {
        onRetry(error, retryCount, delay);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Execute with fallbacks
 * @param {Function[]} fns - Array of functions to try in order
 * @param {object} options - Options
 * @param {Function} [options.shouldFallback] - Function to determine if should fallback
 * @returns {Promise<*>} Result of the first successful function
 */
const executeWithFallbacks = async (fns, options = {}) => {
  const { shouldFallback = (error) => true } = options;
  
  let lastError = null;
  
  for (let i = 0; i < fns.length; i++) {
    try {
      return await fns[i]();
    } catch (error) {
      console.log(`Fallback ${i + 1}/${fns.length} failed:`, error.message);
      
      lastError = error;
      
      if (!shouldFallback(error) || i === fns.length - 1) {
        throw error;
      }
    }
  }
  
  throw lastError || new Error('All fallbacks failed');
};

module.exports = {
  ERROR_TYPES,
  classifyError,
  getRetryDelay,
  shouldRetry,
  retryWithBackoff,
  executeWithFallbacks
};
