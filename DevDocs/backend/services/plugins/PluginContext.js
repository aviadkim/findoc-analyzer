/**
 * @fileoverview Plugin Context for the FinDoc Analyzer application.
 * 
 * This module provides the context object that is passed to plugins
 * during initialization. It serves as a bridge between the plugin and
 * the application, providing a controlled API surface for plugins to use.
 */

const path = require('path');
const fs = require('fs').promises;
const EventEmitter = require('events');
const { createLogger } = require('../../utils/logger');
const { PERMISSIONS } = require('./constants');

const logger = createLogger('PluginContext');

/**
 * Creates a plugin context object for a specific plugin
 */
class PluginContext extends EventEmitter {
  /**
   * Create a new plugin context
   * 
   * @param {Object} options - Context options
   * @param {string} options.id - Unique plugin ID
   * @param {Object} options.manifest - Plugin manifest
   * @param {string} options.pluginPath - Path to the plugin directory
   * @param {Object} options.registry - Plugin registry instance
   * @param {Object} options.manager - Plugin manager instance
   */
  constructor(options) {
    super();
    
    if (!options.id || !options.manifest || !options.pluginPath) {
      throw new Error('Plugin context requires id, manifest, and pluginPath');
    }
    
    this.id = options.id;
    this.manifest = options.manifest;
    this.pluginPath = options.pluginPath;
    this.registry = options.registry;
    this.manager = options.manager;
    
    this.logger = createLogger(`PluginContext:${this.id}`);
    this.permissions = this.manifest.permissions || [];
    
    // Create plugin storage directory if it doesn't exist
    this.pluginStoragePath = path.join(this.pluginPath, 'storage');
    this._ensureStorageDir();
    
    // Initialize API object with permitted capabilities
    this.api = this._createApiObject();
  }
  
  /**
   * Register an extension point handler
   * 
   * @param {string} extensionPoint - The extension point identifier
   * @param {Function} handler - The handler function
   * @returns {boolean} Whether the registration was successful
   */
  registerExtensionPoint(extensionPoint, handler) {
    try {
      if (!this.hasPermission('core')) {
        this.logger.warn(`Plugin ${this.id} tried to register extension point without core permission`);
        return false;
      }
      
      if (!this.manifest.extensionPoints.includes(extensionPoint)) {
        this.logger.warn(`Plugin ${this.id} tried to register extension point ${extensionPoint} not declared in manifest`);
        return false;
      }
      
      if (typeof handler !== 'function') {
        this.logger.warn(`Plugin ${this.id} tried to register invalid handler for ${extensionPoint}`);
        return false;
      }
      
      this.logger.debug(`Registering handler for extension point ${extensionPoint}`);
      
      // Forward to plugin manager
      if (this.manager) {
        this.manager.registerPluginExtensionPoint(this.id, extensionPoint, handler);
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Error registering extension point ${extensionPoint}:`, error);
      return false;
    }
  }
  
  /**
   * Get the plugin's configuration
   * 
   * @returns {Object} The plugin configuration
   */
  getConfig() {
    try {
      if (!this.registry) {
        return {};
      }
      
      return this.registry.getPluginSettings(this.id) || {};
    } catch (error) {
      this.logger.error('Error getting plugin config:', error);
      return {};
    }
  }
  
  /**
   * Save the plugin's configuration
   * 
   * @param {Object} config - The configuration to save
   * @returns {Promise<boolean>} Whether the save was successful
   */
  async saveConfig(config) {
    try {
      if (!this.registry) {
        return false;
      }
      
      if (!this.hasPermission('core')) {
        this.logger.warn(`Plugin ${this.id} tried to save config without core permission`);
        return false;
      }
      
      await this.registry.savePluginSettings(this.id, config);
      return true;
    } catch (error) {
      this.logger.error('Error saving plugin config:', error);
      return false;
    }
  }
  
  /**
   * Check if the plugin has a specific permission
   * 
   * @param {string} permission - The permission to check
   * @returns {boolean} Whether the plugin has the permission
   */
  hasPermission(permission) {
    return this.permissions.includes(permission);
  }
  
  /**
   * Get a path within the plugin's storage directory
   * 
   * @param {string} relativePath - Relative path within the storage
   * @returns {string} The absolute path
   */
  getStoragePath(relativePath = '') {
    const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    return path.join(this.pluginStoragePath, safePath);
  }
  
  /**
   * Create a file in the plugin's storage directory
   * 
   * @param {string} relativePath - Relative path within the storage
   * @param {string|Buffer} content - File content
   * @returns {Promise<boolean>} Whether the file was created
   */
  async createFile(relativePath, content) {
    try {
      if (!this.hasPermission('fs_write')) {
        this.logger.warn(`Plugin ${this.id} tried to write file without fs_write permission`);
        return false;
      }
      
      const filePath = this.getStoragePath(relativePath);
      
      // Create parent directories if they don't exist
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(filePath, content);
      return true;
    } catch (error) {
      this.logger.error(`Error creating file ${relativePath}:`, error);
      return false;
    }
  }
  
  /**
   * Read a file from the plugin's storage directory
   * 
   * @param {string} relativePath - Relative path within the storage
   * @returns {Promise<Buffer|null>} The file content or null if not found
   */
  async readFile(relativePath) {
    try {
      if (!this.hasPermission('fs_read')) {
        this.logger.warn(`Plugin ${this.id} tried to read file without fs_read permission`);
        return null;
      }
      
      const filePath = this.getStoragePath(relativePath);
      return await fs.readFile(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.error(`Error reading file ${relativePath}:`, error);
      }
      return null;
    }
  }
  
  /**
   * Delete a file from the plugin's storage directory
   * 
   * @param {string} relativePath - Relative path within the storage
   * @returns {Promise<boolean>} Whether the file was deleted
   */
  async deleteFile(relativePath) {
    try {
      if (!this.hasPermission('fs_write')) {
        this.logger.warn(`Plugin ${this.id} tried to delete file without fs_write permission`);
        return false;
      }
      
      const filePath = this.getStoragePath(relativePath);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.error(`Error deleting file ${relativePath}:`, error);
      }
      return false;
    }
  }
  
  /**
   * List files in the plugin's storage directory
   * 
   * @param {string} relativePath - Relative path within the storage
   * @returns {Promise<string[]>} List of file names
   */
  async listFiles(relativePath = '') {
    try {
      if (!this.hasPermission('fs_read')) {
        this.logger.warn(`Plugin ${this.id} tried to list files without fs_read permission`);
        return [];
      }
      
      const dirPath = this.getStoragePath(relativePath);
      
      try {
        await fs.access(dirPath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          // Directory doesn't exist, create it
          await fs.mkdir(dirPath, { recursive: true });
          return [];
        }
        throw error;
      }
      
      const files = await fs.readdir(dirPath);
      return files;
    } catch (error) {
      this.logger.error(`Error listing files in ${relativePath}:`, error);
      return [];
    }
  }
  
  /**
   * Make a network request (if permitted)
   * 
   * @param {string} url - The URL to request
   * @param {Object} options - Request options
   * @returns {Promise<Object|null>} The response or null if not permitted
   */
  async makeRequest(url, options = {}) {
    try {
      if (!this.hasPermission('network')) {
        this.logger.warn(`Plugin ${this.id} tried to make network request without network permission`);
        return null;
      }
      
      // Use a safe fetch implementation that respects limits
      if (this.manager && this.manager.safeFetch) {
        return await this.manager.safeFetch(this.id, url, options);
      }
      
      this.logger.warn(`Plugin ${this.id} tried to make network request but safeFetch is not available`);
      return null;
    } catch (error) {
      this.logger.error(`Error making request to ${url}:`, error);
      return null;
    }
  }
  
  /**
   * Ensure the plugin storage directory exists
   * 
   * @private
   */
  async _ensureStorageDir() {
    try {
      await fs.mkdir(this.pluginStoragePath, { recursive: true });
    } catch (error) {
      this.logger.error('Error creating plugin storage directory:', error);
    }
  }
  
  /**
   * Create the API object based on permissions
   * 
   * @private
   * @returns {Object} The API object
   */
  _createApiObject() {
    const api = {
      // Metadata - available to all plugins
      metadata: {
        id: this.id,
        name: this.manifest.name,
        version: this.manifest.version,
        description: this.manifest.description
      },
      
      // Core API - requires 'core' permission
      core: {},
      
      // File system API - requires 'fs_read' and/or 'fs_write' permissions
      fs: {},
      
      // Data API - requires 'data_read' and/or 'data_write' permissions
      data: {},
      
      // Network API - requires 'network' permission
      network: {},
      
      // UI API - requires 'ui' permission
      ui: {},
      
      // Admin API - requires 'admin' permission
      admin: {}
    };
    
    // Add core API if permitted
    if (this.hasPermission('core')) {
      api.core = {
        getConfig: this.getConfig.bind(this),
        saveConfig: this.saveConfig.bind(this),
        registerExtensionPoint: this.registerExtensionPoint.bind(this),
        
        // Logging helpers
        log: {
          debug: (message, meta) => this.logger.debug(message, meta),
          info: (message, meta) => this.logger.info(message, meta),
          warn: (message, meta) => this.logger.warn(message, meta),
          error: (message, meta) => this.logger.error(message, meta)
        },
        
        // Event emitter methods
        on: this.on.bind(this),
        once: this.once.bind(this),
        off: this.off.bind(this),
        emit: this.emit.bind(this)
      };
    }
    
    // Add file system API if permitted
    if (this.hasPermission('fs_read')) {
      api.fs.readFile = this.readFile.bind(this);
      api.fs.listFiles = this.listFiles.bind(this);
    }
    
    if (this.hasPermission('fs_write')) {
      api.fs.createFile = this.createFile.bind(this);
      api.fs.deleteFile = this.deleteFile.bind(this);
    }
    
    // Add data API if permitted and manager is available
    if (this.manager) {
      if (this.hasPermission('data_read')) {
        api.data.getDocumentData = (documentId) => 
          this.manager.getDocumentData(this.id, documentId);
          
        api.data.getAnalysisData = (analysisId) => 
          this.manager.getAnalysisData(this.id, analysisId);
          
        api.data.getExportData = (exportId) => 
          this.manager.getExportData(this.id, exportId);
      }
      
      if (this.hasPermission('data_write')) {
        api.data.saveDocumentData = (documentId, data) => 
          this.manager.saveDocumentData(this.id, documentId, data);
          
        api.data.saveAnalysisData = (analysisId, data) => 
          this.manager.saveAnalysisData(this.id, analysisId, data);
          
        api.data.createExport = (data, format) => 
          this.manager.createExport(this.id, data, format);
      }
    }
    
    // Add network API if permitted
    if (this.hasPermission('network')) {
      api.network.fetch = this.makeRequest.bind(this);
    }
    
    // Add UI API if permitted and manager is available
    if (this.manager && this.hasPermission('ui')) {
      api.ui.registerComponent = (area, component) => 
        this.manager.registerUIComponent(this.id, area, component);
        
      api.ui.registerDashboardWidget = (widget) => 
        this.manager.registerDashboardWidget(this.id, widget);
        
      api.ui.registerVisualization = (visualization) => 
        this.manager.registerVisualization(this.id, visualization);
    }
    
    // Add admin API if permitted and manager is available
    if (this.manager && this.hasPermission('admin')) {
      api.admin.getSystemConfig = () => 
        this.manager.getSystemConfig(this.id);
        
      api.admin.getPluginList = () => 
        this.manager.getPluginList(this.id);
        
      api.admin.getPluginInfo = (pluginId) => 
        this.manager.getPluginInfo(this.id, pluginId);
    }
    
    return api;
  }
}

module.exports = PluginContext;