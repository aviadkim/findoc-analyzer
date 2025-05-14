/**
 * Plugin Registry
 * 
 * Manages information about available plugins, their status, and settings.
 * Provides persistence for plugin data.
 */

const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../../utils/logger');

/**
 * Plugin Registry Class
 */
class PluginRegistry {
  constructor(options = {}) {
    this.options = {
      configDir: options.configDir || path.join(process.cwd(), 'config'),
      registryFile: 'plugin-registry.json',
      settingsDir: 'plugin-settings',
      ...options
    };
    
    // Complete paths
    this.registryPath = path.join(
      this.options.configDir, 
      this.options.registryFile
    );
    
    this.settingsPath = path.join(
      this.options.configDir, 
      this.options.settingsDir
    );
    
    // Initialize registry
    this.registry = {
      plugins: {},
      lastUpdated: null
    };
    
    // Ensure config directories exist
    this.ensureDirectories();
  }
  
  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    try {
      // Ensure config directory
      await fs.mkdir(this.options.configDir, { recursive: true });
      
      // Ensure settings directory
      await fs.mkdir(this.settingsPath, { recursive: true });
      
      logger.debug('Plugin registry directories ensured');
    } catch (error) {
      logger.error('Failed to ensure plugin registry directories:', error);
      throw error;
    }
  }
  
  /**
   * Load registry data from disk
   */
  async load() {
    try {
      // Check if registry file exists
      try {
        await fs.access(this.registryPath);
      } catch (err) {
        // File doesn't exist, create empty registry
        logger.info('Plugin registry file not found, creating new registry');
        await this.save();
        return;
      }
      
      // Read registry file
      const data = await fs.readFile(this.registryPath, 'utf8');
      this.registry = JSON.parse(data);
      
      // Ensure registry has the expected structure
      if (!this.registry.plugins) {
        this.registry.plugins = {};
      }
      
      logger.info(`Loaded plugin registry with ${Object.keys(this.registry.plugins).length} plugins`);
    } catch (error) {
      logger.error('Failed to load plugin registry:', error);
      
      // Fallback to empty registry
      this.registry = {
        plugins: {},
        lastUpdated: null
      };
    }
  }
  
  /**
   * Save registry data to disk
   */
  async save() {
    try {
      // Update timestamp
      this.registry.lastUpdated = new Date().toISOString();
      
      // Write registry file
      const data = JSON.stringify(this.registry, null, 2);
      await fs.writeFile(this.registryPath, data, 'utf8');
      
      logger.debug('Plugin registry saved successfully');
    } catch (error) {
      logger.error('Failed to save plugin registry:', error);
      throw error;
    }
  }
  
  /**
   * Register a new plugin
   * @param {Object} plugin - Plugin data
   */
  registerPlugin(plugin) {
    // Validate plugin data
    if (!plugin.id || !plugin.manifest) {
      throw new Error('Invalid plugin data: ID and manifest are required');
    }
    
    // Check if plugin already exists
    const existingPlugin = this.registry.plugins[plugin.id];
    
    if (existingPlugin) {
      // Update existing plugin
      this.registry.plugins[plugin.id] = {
        ...existingPlugin,
        ...plugin,
        updated: new Date().toISOString()
      };
      
      logger.info(`Updated plugin in registry: ${plugin.id}`);
    } else {
      // Add new plugin
      this.registry.plugins[plugin.id] = {
        ...plugin,
        enabled: plugin.enabled !== false,
        registered: new Date().toISOString(),
        updated: new Date().toISOString()
      };
      
      logger.info(`Registered new plugin: ${plugin.id}`);
    }
  }
  
  /**
   * Update a plugin's data
   * @param {string} pluginId - Plugin ID
   * @param {Object} data - Data to update
   */
  updatePlugin(pluginId, data) {
    // Check if plugin exists
    if (!this.registry.plugins[pluginId]) {
      throw new Error(`Plugin not found in registry: ${pluginId}`);
    }
    
    // Update plugin data
    this.registry.plugins[pluginId] = {
      ...this.registry.plugins[pluginId],
      ...data,
      updated: new Date().toISOString()
    };
    
    logger.debug(`Updated plugin data: ${pluginId}`);
  }
  
  /**
   * Unregister a plugin
   * @param {string} pluginId - Plugin ID
   */
  unregisterPlugin(pluginId) {
    // Check if plugin exists
    if (!this.registry.plugins[pluginId]) {
      logger.warn(`Plugin not found in registry: ${pluginId}`);
      return;
    }
    
    // Remove plugin from registry
    delete this.registry.plugins[pluginId];
    
    logger.info(`Unregistered plugin: ${pluginId}`);
  }
  
  /**
   * Get a plugin by ID
   * @param {string} pluginId - Plugin ID
   * @returns {Object|null} - Plugin data or null if not found
   */
  getPlugin(pluginId) {
    return this.registry.plugins[pluginId] || null;
  }
  
  /**
   * Get all registered plugins
   * @returns {Array} - Array of all plugins
   */
  getAllPlugins() {
    return Object.values(this.registry.plugins);
  }
  
  /**
   * Get available plugins (registered in the registry)
   * @returns {Array} - Array of available plugins
   */
  getAvailablePlugins() {
    return Object.values(this.registry.plugins);
  }
  
  /**
   * Get enabled plugins
   * @returns {Array} - Array of enabled plugins
   */
  getEnabledPlugins() {
    return Object.values(this.registry.plugins)
      .filter(plugin => plugin.enabled);
  }
  
  /**
   * Get disabled plugins
   * @returns {Array} - Array of disabled plugins
   */
  getDisabledPlugins() {
    return Object.values(this.registry.plugins)
      .filter(plugin => !plugin.enabled);
  }
  
  /**
   * Get plugin settings
   * @param {string} pluginId - Plugin ID
   * @returns {Object} - Plugin settings
   */
  async getPluginSettings(pluginId) {
    const settingsFilePath = path.join(this.settingsPath, `${pluginId}.json`);
    
    try {
      // Check if settings file exists
      try {
        await fs.access(settingsFilePath);
      } catch (err) {
        // File doesn't exist, return empty settings
        return {};
      }
      
      // Read settings file
      const data = await fs.readFile(settingsFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Failed to load settings for plugin ${pluginId}:`, error);
      return {};
    }
  }
  
  /**
   * Save plugin settings
   * @param {string} pluginId - Plugin ID
   * @param {Object} settings - Plugin settings
   */
  async savePluginSettings(pluginId, settings) {
    const settingsFilePath = path.join(this.settingsPath, `${pluginId}.json`);
    
    try {
      // Write settings file
      const data = JSON.stringify(settings, null, 2);
      await fs.writeFile(settingsFilePath, data, 'utf8');
      
      logger.debug(`Saved settings for plugin ${pluginId}`);
    } catch (error) {
      logger.error(`Failed to save settings for plugin ${pluginId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete plugin settings
   * @param {string} pluginId - Plugin ID
   */
  async deletePluginSettings(pluginId) {
    const settingsFilePath = path.join(this.settingsPath, `${pluginId}.json`);
    
    try {
      // Check if settings file exists
      try {
        await fs.access(settingsFilePath);
      } catch (err) {
        // File doesn't exist, nothing to delete
        return;
      }
      
      // Delete settings file
      await fs.unlink(settingsFilePath);
      
      logger.debug(`Deleted settings for plugin ${pluginId}`);
    } catch (error) {
      logger.error(`Failed to delete settings for plugin ${pluginId}:`, error);
      throw error;
    }
  }
}

module.exports = PluginRegistry;