/**
 * API Usage Service
 * 
 * This service provides utilities for monitoring API usage.
 */

// In-memory storage for API usage
const apiUsage = {
  openRouter: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalTokens: 0,
    byModel: {},
    byTenant: {},
    byEndpoint: {},
    history: []
  }
};

// Maximum history entries to keep
const MAX_HISTORY_ENTRIES = 1000;

/**
 * Record API request
 * @param {string} service - Service name (e.g., 'openRouter')
 * @param {object} data - Request data
 * @param {string} data.model - Model name
 * @param {string} [data.tenantId] - Tenant ID
 * @param {string} [data.endpoint] - Endpoint
 * @param {boolean} [data.success=true] - Whether the request was successful
 * @param {number} [data.inputTokens=0] - Number of input tokens
 * @param {number} [data.outputTokens=0] - Number of output tokens
 * @param {number} [data.latencyMs] - Latency in milliseconds
 * @param {string} [data.error] - Error message if the request failed
 */
const recordRequest = (service, data) => {
  if (!apiUsage[service]) {
    apiUsage[service] = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      byModel: {},
      byTenant: {},
      byEndpoint: {},
      history: []
    };
  }
  
  const {
    model,
    tenantId,
    endpoint,
    success = true,
    inputTokens = 0,
    outputTokens = 0,
    latencyMs,
    error
  } = data;
  
  // Update total counts
  apiUsage[service].totalRequests++;
  
  if (success) {
    apiUsage[service].successfulRequests++;
  } else {
    apiUsage[service].failedRequests++;
  }
  
  apiUsage[service].totalTokens += (inputTokens + outputTokens);
  
  // Update by model
  if (model) {
    if (!apiUsage[service].byModel[model]) {
      apiUsage[service].byModel[model] = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokens: 0
      };
    }
    
    apiUsage[service].byModel[model].totalRequests++;
    
    if (success) {
      apiUsage[service].byModel[model].successfulRequests++;
    } else {
      apiUsage[service].byModel[model].failedRequests++;
    }
    
    apiUsage[service].byModel[model].totalTokens += (inputTokens + outputTokens);
  }
  
  // Update by tenant
  if (tenantId) {
    if (!apiUsage[service].byTenant[tenantId]) {
      apiUsage[service].byTenant[tenantId] = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokens: 0
      };
    }
    
    apiUsage[service].byTenant[tenantId].totalRequests++;
    
    if (success) {
      apiUsage[service].byTenant[tenantId].successfulRequests++;
    } else {
      apiUsage[service].byTenant[tenantId].failedRequests++;
    }
    
    apiUsage[service].byTenant[tenantId].totalTokens += (inputTokens + outputTokens);
  }
  
  // Update by endpoint
  if (endpoint) {
    if (!apiUsage[service].byEndpoint[endpoint]) {
      apiUsage[service].byEndpoint[endpoint] = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokens: 0
      };
    }
    
    apiUsage[service].byEndpoint[endpoint].totalRequests++;
    
    if (success) {
      apiUsage[service].byEndpoint[endpoint].successfulRequests++;
    } else {
      apiUsage[service].byEndpoint[endpoint].failedRequests++;
    }
    
    apiUsage[service].byEndpoint[endpoint].totalTokens += (inputTokens + outputTokens);
  }
  
  // Add to history
  apiUsage[service].history.push({
    timestamp: new Date().toISOString(),
    model,
    tenantId,
    endpoint,
    success,
    inputTokens,
    outputTokens,
    latencyMs,
    error
  });
  
  // Trim history if needed
  if (apiUsage[service].history.length > MAX_HISTORY_ENTRIES) {
    apiUsage[service].history = apiUsage[service].history.slice(-MAX_HISTORY_ENTRIES);
  }
};

/**
 * Get API usage statistics
 * @param {string} service - Service name (e.g., 'openRouter')
 * @param {object} [options] - Options
 * @param {string} [options.tenantId] - Filter by tenant ID
 * @param {string} [options.model] - Filter by model
 * @param {string} [options.endpoint] - Filter by endpoint
 * @param {boolean} [options.includeHistory=false] - Whether to include history
 * @returns {object} API usage statistics
 */
const getUsageStats = (service, options = {}) => {
  if (!apiUsage[service]) {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      successRate: 0,
      byModel: {},
      byTenant: {},
      byEndpoint: {}
    };
  }
  
  const {
    tenantId,
    model,
    endpoint,
    includeHistory = false
  } = options;
  
  // Filter history if needed
  let filteredHistory = apiUsage[service].history;
  
  if (tenantId) {
    filteredHistory = filteredHistory.filter(entry => entry.tenantId === tenantId);
  }
  
  if (model) {
    filteredHistory = filteredHistory.filter(entry => entry.model === model);
  }
  
  if (endpoint) {
    filteredHistory = filteredHistory.filter(entry => entry.endpoint === endpoint);
  }
  
  // Calculate statistics
  const stats = {
    totalRequests: filteredHistory.length,
    successfulRequests: filteredHistory.filter(entry => entry.success).length,
    failedRequests: filteredHistory.filter(entry => !entry.success).length,
    totalTokens: filteredHistory.reduce((sum, entry) => sum + (entry.inputTokens + entry.outputTokens), 0),
    byModel: {},
    byTenant: {},
    byEndpoint: {}
  };
  
  // Calculate success rate
  stats.successRate = stats.totalRequests > 0 ? (stats.successfulRequests / stats.totalRequests) * 100 : 0;
  
  // Group by model
  const modelGroups = {};
  filteredHistory.forEach(entry => {
    if (!entry.model) return;
    
    if (!modelGroups[entry.model]) {
      modelGroups[entry.model] = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokens: 0
      };
    }
    
    modelGroups[entry.model].totalRequests++;
    
    if (entry.success) {
      modelGroups[entry.model].successfulRequests++;
    } else {
      modelGroups[entry.model].failedRequests++;
    }
    
    modelGroups[entry.model].totalTokens += (entry.inputTokens + entry.outputTokens);
  });
  
  stats.byModel = modelGroups;
  
  // Include history if requested
  if (includeHistory) {
    stats.history = filteredHistory;
  }
  
  return stats;
};

/**
 * Reset API usage statistics
 * @param {string} service - Service name (e.g., 'openRouter')
 */
const resetUsageStats = (service) => {
  if (apiUsage[service]) {
    apiUsage[service] = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      byModel: {},
      byTenant: {},
      byEndpoint: {},
      history: []
    };
  }
};

/**
 * Estimate token count for a prompt
 * @param {string} text - Text to estimate token count for
 * @returns {number} Estimated token count
 */
const estimateTokenCount = (text) => {
  if (!text) return 0;
  
  // Simple estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};

module.exports = {
  recordRequest,
  getUsageStats,
  resetUsageStats,
  estimateTokenCount
};
