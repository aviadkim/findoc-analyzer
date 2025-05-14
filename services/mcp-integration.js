/**
 * MCP Integration Service
 * 
 * A comprehensive utility for integrating and using 
 * Model Context Protocol (MCP) servers with FinDoc Analyzer
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// In-memory cache for MCP responses
const responseCache = new Map();
const DEFAULT_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// The default MCP config file path
const DEFAULT_CONFIG_PATH = path.join(__dirname, '..', 'mcp-config.json');

/**
 * MCP Integration service
 */
class McpIntegration {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {string} options.configPath - Path to MCP config file
   * @param {boolean} options.enableCache - Whether to enable caching
   * @param {number} options.cacheDuration - Cache duration in milliseconds
   * @param {boolean} options.debug - Whether to enable debug logging
   */
  constructor(options = {}) {
    this.configPath = options.configPath || DEFAULT_CONFIG_PATH;
    this.enableCache = options.enableCache !== false;
    this.cacheDuration = options.cacheDuration || DEFAULT_CACHE_DURATION;
    this.debug = options.debug || false;
    
    // Load MCP configuration
    try {
      const configFileContent = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configFileContent);
      
      if (this.debug) {
        console.log(`Loaded MCP configuration from ${this.configPath}`);
        console.log(`Available MCPs: ${Object.keys(this.config.mcpServers).join(', ')}`);
      }
    } catch (error) {
      console.error(`Error loading MCP configuration: ${error.message}`);
      this.config = { mcpServers: {} };
    }
  }
  
  /**
   * Check if an MCP is available
   * @param {string} mcpName - Name of the MCP
   * @returns {boolean} - Whether the MCP is configured
   */
  isAvailable(mcpName) {
    return !!this.config.mcpServers[mcpName];
  }
  
  /**
   * Execute an MCP command
   * @param {string} mcpName - Name of the MCP
   * @param {Object} payload - Payload to send to the MCP
   * @param {Object} options - Options for execution
   * @param {boolean} options.useCache - Whether to use cache
   * @param {boolean} options.forceFresh - Whether to force fresh data
   * @param {number} options.timeout - Timeout in milliseconds
   * @returns {Promise<any>} - MCP response
   */
  async execute(mcpName, payload, options = {}) {
    const useCache = options.useCache !== false && this.enableCache;
    const forceFresh = options.forceFresh || false;
    const timeout = options.timeout || 30000; // Default 30s timeout
    
    // Generate cache key if caching is enabled
    const cacheKey = useCache ? `${mcpName}:${JSON.stringify(payload)}` : null;
    
    // Check cache if enabled and not forcing fresh data
    if (useCache && !forceFresh && responseCache.has(cacheKey)) {
      const cachedData = responseCache.get(cacheKey);
      if (cachedData.expiry > Date.now()) {
        if (this.debug) {
          console.log(`Using cached response for ${mcpName}`);
        }
        return cachedData.data;
      } else {
        // Remove expired cache entry
        responseCache.delete(cacheKey);
      }
    }
    
    // Check if MCP is available
    if (!this.isAvailable(mcpName)) {
      throw new Error(`MCP ${mcpName} is not available`);
    }
    
    const mcpServer = this.config.mcpServers[mcpName];
    
    if (this.debug) {
      console.log(`Executing ${mcpName} MCP:`, { 
        command: mcpServer.command, 
        args: mcpServer.args,
        payload: JSON.stringify(payload).substring(0, 100) + (JSON.stringify(payload).length > 100 ? '...' : '')
      });
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Spawn MCP process
        const mcpProcess = spawn(mcpServer.command, mcpServer.args);
        
        // Set timeout
        const timeoutId = setTimeout(() => {
          mcpProcess.kill();
          reject(new Error(`MCP ${mcpName} execution timed out after ${timeout}ms`));
        }, timeout);
        
        // Process output
        let responseData = '';
        
        // Send payload
        mcpProcess.stdin.write(JSON.stringify(payload));
        mcpProcess.stdin.end();
        
        // Collect stdout
        mcpProcess.stdout.on('data', (data) => {
          responseData += data.toString();
        });
        
        // Handle stderr
        mcpProcess.stderr.on('data', (data) => {
          if (this.debug) {
            console.error(`${mcpName} MCP stderr:`, data.toString());
          }
        });
        
        // Handle process completion
        mcpProcess.on('close', (code) => {
          clearTimeout(timeoutId);
          
          if (code !== 0 && this.debug) {
            console.warn(`${mcpName} MCP exited with code ${code}`);
          }
          
          try {
            const response = JSON.parse(responseData);
            
            // Cache response if caching is enabled
            if (useCache && response) {
              responseCache.set(cacheKey, {
                data: response,
                expiry: Date.now() + this.cacheDuration
              });
              
              if (this.debug) {
                console.log(`Cached response for ${mcpName} (expires in ${this.cacheDuration / 1000}s)`);
              }
            }
            
            resolve(response);
          } catch (parseError) {
            reject(new Error(`Failed to parse ${mcpName} MCP response: ${parseError.message}`));
          }
        });
        
        // Handle process errors
        mcpProcess.on('error', (error) => {
          clearTimeout(timeoutId);
          reject(new Error(`${mcpName} MCP error: ${error.message}`));
        });
      } catch (execError) {
        reject(new Error(`Failed to start ${mcpName} MCP: ${execError.message}`));
      }
    });
  }
  
  /**
   * Execute an MCP search query using Brave Search MCP
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {string} options.type - Search type (web, news, images, videos)
   * @param {number} options.count - Number of results
   * @param {boolean} options.useCache - Whether to use cache
   * @returns {Promise<Object>} - Search results
   */
  async search(query, options = {}) {
    const searchType = options.type || 'web';
    const count = options.count || 5;
    const useCache = options.useCache !== false && this.enableCache;
    
    return this.execute('brave', {
      action: 'search',
      params: {
        q: query,
        type: searchType,
        count
      }
    }, { useCache });
  }
  
  /**
   * Execute a web request using Fetch MCP
   * @param {string} url - URL to fetch
   * @param {Object} options - Fetch options
   * @param {string} options.method - HTTP method
   * @param {Object} options.headers - HTTP headers
   * @param {any} options.body - Request body
   * @param {boolean} options.useCache - Whether to use cache
   * @returns {Promise<Object>} - Fetch response
   */
  async fetch(url, options = {}) {
    const method = options.method || 'GET';
    const headers = options.headers || {};
    const body = options.body;
    const useCache = options.useCache !== false && this.enableCache;
    
    return this.execute('fetch', {
      action: 'fetch',
      params: {
        url,
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      }
    }, { useCache });
  }
  
  /**
   * Store data in Memory MCP
   * @param {string} key - Key to store
   * @param {any} value - Value to store
   * @returns {Promise<Object>} - Memory MCP response
   */
  async memorize(key, value) {
    return this.execute('memory', {
      action: 'store',
      data: { key, value }
    });
  }
  
  /**
   * Retrieve data from Memory MCP
   * @param {string} key - Key to retrieve
   * @returns {Promise<any>} - Retrieved value
   */
  async recall(key) {
    const response = await this.execute('memory', {
      action: 'retrieve',
      data: { key }
    });
    
    return response.value;
  }
  
  /**
   * Use SequentialThinking MCP to analyze a problem
   * @param {string} question - Question or problem to think about
   * @param {Object} options - Thinking options
   * @param {number} options.maxSteps - Maximum number of thinking steps
   * @returns {Promise<Object>} - Thinking result
   */
  async think(question, options = {}) {
    const maxSteps = options.maxSteps || 5;
    
    return this.execute('sequentialthinking', {
      action: 'think',
      params: {
        question,
        maxSteps
      }
    });
  }
  
  /**
   * Execute filesystem operations using FileSystem MCP
   * @param {string} action - Filesystem action to perform
   * @param {Object} params - Parameters for the action
   * @returns {Promise<Object>} - Filesystem operation result
   */
  async filesystem(action, params = {}) {
    return this.execute('filesystem', {
      action,
      params
    });
  }
  
  /**
   * Work with GitHub repositories using GitHub MCP
   * @param {string} action - GitHub action to perform
   * @param {Object} params - Parameters for the action
   * @returns {Promise<Object>} - GitHub operation result
   */
  async github(action, params = {}) {
    return this.execute('github', {
      action,
      params
    });
  }
  
  /**
   * Execute browser automation using Puppeteer MCP
   * @param {string} script - JavaScript script to execute
   * @param {Object} options - Puppeteer options
   * @param {string} options.url - URL to navigate to
   * @param {boolean} options.headless - Whether to run in headless mode
   * @returns {Promise<Object>} - Puppeteer execution result
   */
  async puppeteer(script, options = {}) {
    const url = options.url || 'about:blank';
    const headless = options.headless !== false;
    
    return this.execute('puppeteer', {
      action: 'evaluate',
      params: {
        url,
        script,
        options: {
          headless
        }
      }
    });
  }
  
  /**
   * Work with Supabase database using Supabase MCP
   * @param {string} action - Supabase action to perform
   * @param {Object} params - Parameters for the action
   * @returns {Promise<Object>} - Supabase operation result
   */
  async supabase(action, params = {}) {
    return this.execute('supabase', {
      action,
      params
    });
  }
  
  /**
   * Clear the response cache
   * @param {string} mcpName - Name of the MCP to clear cache for (optional)
   */
  clearCache(mcpName) {
    if (mcpName) {
      // Clear cache for specific MCP
      const cacheKeysToDelete = [];
      
      for (const key of responseCache.keys()) {
        if (key.startsWith(`${mcpName}:`)) {
          cacheKeysToDelete.push(key);
        }
      }
      
      for (const key of cacheKeysToDelete) {
        responseCache.delete(key);
      }
      
      if (this.debug) {
        console.log(`Cleared cache for ${mcpName} MCP (${cacheKeysToDelete.length} entries)`);
      }
    } else {
      // Clear all cache
      responseCache.clear();
      
      if (this.debug) {
        console.log('Cleared all MCP response cache');
      }
    }
  }
  
  /**
   * Get available MCP servers
   * @returns {Array<string>} - Names of available MCP servers
   */
  getAvailableMcps() {
    return Object.keys(this.config.mcpServers);
  }
}

module.exports = McpIntegration;