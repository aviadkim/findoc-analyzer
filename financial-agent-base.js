/**
 * Financial Agent Base Class
 * 
 * This module provides a base class for all financial agents in the FinDoc Analyzer.
 * It includes common functionality for financial analysis and reporting.
 */

class FinancialAgentBase {
  /**
   * Constructor
   * @param {string} name - Agent name
   * @param {string} description - Agent description
   * @param {string} provider - AI provider (openrouter, huggingface, google)
   * @param {Object} apiKeys - API keys for the agent
   * @param {Object} options - Additional options
   */
  constructor(name, description, provider, apiKeys, options = {}) {
    this.name = name;
    this.description = description;
    this.provider = provider;
    this.apiKeys = apiKeys;
    this.options = options;
    this.status = 'initializing';
    this.logs = [];
    this.stats = {};
    
    // Add initialization log
    this.addLog('INFO', 'Initializing agent');
  }
  
  /**
   * Add a log entry
   * @param {string} level - Log level (INFO, WARNING, ERROR)
   * @param {string} message - Log message
   */
  addLog(level, message) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message
    });
    
    // Keep only the last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }
  
  /**
   * Start the agent
   * @returns {Promise<boolean>} Success status
   */
  async start() {
    try {
      this.addLog('INFO', 'Starting agent');
      this.status = 'starting';
      
      // Validate API keys
      if (!this.validateApiKeys()) {
        this.addLog('ERROR', 'Invalid API keys');
        this.status = 'error';
        return false;
      }
      
      // Initialize agent-specific resources
      await this.initialize();
      
      this.status = 'active';
      this.addLog('INFO', 'Agent started successfully');
      return true;
    } catch (error) {
      this.addLog('ERROR', `Error starting agent: ${error.message}`);
      this.status = 'error';
      return false;
    }
  }
  
  /**
   * Stop the agent
   * @returns {Promise<boolean>} Success status
   */
  async stop() {
    try {
      this.addLog('INFO', 'Stopping agent');
      this.status = 'stopping';
      
      // Clean up agent-specific resources
      await this.cleanup();
      
      this.status = 'inactive';
      this.addLog('INFO', 'Agent stopped successfully');
      return true;
    } catch (error) {
      this.addLog('ERROR', `Error stopping agent: ${error.message}`);
      this.status = 'error';
      return false;
    }
  }
  
  /**
   * Get agent status
   * @returns {Object} Agent status
   */
  getStatus() {
    return {
      name: this.name,
      description: this.description,
      status: this.status,
      provider: this.provider,
      logs: this.logs,
      stats: this.stats
    };
  }
  
  /**
   * Validate API keys
   * @returns {boolean} Validation result
   */
  validateApiKeys() {
    // Base implementation - should be overridden by subclasses
    return !!this.apiKeys;
  }
  
  /**
   * Initialize agent-specific resources
   * @returns {Promise<void>}
   */
  async initialize() {
    // Base implementation - should be overridden by subclasses
  }
  
  /**
   * Clean up agent-specific resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    // Base implementation - should be overridden by subclasses
  }
  
  /**
   * Process a document
   * @param {Object} document - Document to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Processing result
   */
  async processDocument(document, options = {}) {
    // Base implementation - should be overridden by subclasses
    throw new Error('Method not implemented');
  }
  
  /**
   * Generate a report
   * @param {Object} data - Data for the report
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Generated report
   */
  async generateReport(data, options = {}) {
    // Base implementation - should be overridden by subclasses
    throw new Error('Method not implemented');
  }
  
  /**
   * Calculate financial metrics
   * @param {Object} data - Financial data
   * @param {Array<string>} metrics - Metrics to calculate
   * @returns {Promise<Object>} Calculated metrics
   */
  async calculateMetrics(data, metrics = []) {
    // Base implementation - should be overridden by subclasses
    throw new Error('Method not implemented');
  }
  
  /**
   * Format currency value
   * @param {number} value - Value to format
   * @param {string} currency - Currency code
   * @param {string} locale - Locale for formatting
   * @returns {string} Formatted currency value
   */
  formatCurrency(value, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(value);
  }
  
  /**
   * Format percentage value
   * @param {number} value - Value to format (0-1)
   * @param {string} locale - Locale for formatting
   * @returns {string} Formatted percentage value
   */
  formatPercentage(value, locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  
  /**
   * Format date value
   * @param {Date|string} date - Date to format
   * @param {string} locale - Locale for formatting
   * @returns {string} Formatted date value
   */
  formatDate(date, locale = 'en-US') {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

module.exports = FinancialAgentBase;
