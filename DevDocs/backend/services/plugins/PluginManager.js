/**
 * Plugin Manager
 * 
 * Central system for managing plugins in the FinDoc Analyzer.
 * Handles plugin discovery, registration, loading, and lifecycle management.
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const semver = require('semver');
const { createSandbox } = require('./PluginSandbox');
const PluginRegistry = require('./PluginRegistry');
const { logger } = require('../../utils/logger');

// Extension point definitions
const EXTENSION_POINTS = {
  'document-processor': {
    interface: ['processDocument'],
    events: ['document:processing:start', 'document:processing:complete']
  },
  'data-analyzer': {
    interface: ['analyzeData'],
    events: ['data:analysis:start', 'data:analysis:complete']
  },
  'data-exporter': {
    interface: ['exportData'],
    events: ['data:export:start', 'data:export:complete']
  },
  'ui-extension': {
    interface: ['registerComponents'],
    events: ['ui:render']
  },
  'external-integration': {
    interface: ['initialize', 'connect', 'disconnect'],
    events: ['integration:connect', 'integration:disconnect']
  }
};

/**
 * Plugin Manager Class
 */
class PluginManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      pluginsDir: options.pluginsDir || path.join(process.cwd(), 'plugins'),
      configDir: options.configDir || path.join(process.cwd(), 'config'),
      coreVersion: options.coreVersion || '1.0.0',
      autoDiscovery: options.autoDiscovery !== false,
      developmentMode: options.developmentMode === true,
      ...options
    };
    
    // Create plugin registry
    this.registry = new PluginRegistry({
      configDir: this.options.configDir
    });
    
    // Track loaded plugins
    this.loadedPlugins = new Map();
    
    // Track active extension points
    this.extensionPoints = new Map();
    
    // Initialize extension points
    Object.keys(EXTENSION_POINTS).forEach(point => {
      this.extensionPoints.set(point, []);
    });
    
    // Setup automatic discovery
    if (this.options.autoDiscovery) {
      this.ensurePluginsDirectory();
    }
  }
  
  /**
   * Ensure the plugins directory exists
   */
  async ensurePluginsDirectory() {
    try {
      await fs.mkdir(this.options.pluginsDir, { recursive: true });
      logger.info(`Plugins directory ensured at ${this.options.pluginsDir}`);
    } catch (error) {
      logger.error('Failed to ensure plugins directory:', error);
    }
  }
  
  /**
   * Initialize the plugin manager
   */
  async initialize() {
    logger.info('Initializing plugin manager');
    
    try {
      // Load registry data
      await this.registry.load();
      
      // Discover available plugins
      if (this.options.autoDiscovery) {
        await this.discoverPlugins();
      }
      
      // Load enabled plugins
      await this.loadEnabledPlugins();
      
      logger.info(`Plugin manager initialized with ${this.loadedPlugins.size} active plugins`);
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize plugin manager:', error);
      throw error;
    }
  }
  
  /**
   * Discover available plugins from the plugins directory
   */
  async discoverPlugins() {
    logger.info(`Discovering plugins in ${this.options.pluginsDir}`);
    
    try {
      // Get subdirectories in the plugins directory
      const entries = await fs.readdir(this.options.pluginsDir, { withFileTypes: true });
      const pluginDirs = entries.filter(entry => entry.isDirectory());
      
      logger.info(`Found ${pluginDirs.length} potential plugin directories`);
      
      // Check each directory for a manifest file
      for (const dir of pluginDirs) {
        const pluginDir = path.join(this.options.pluginsDir, dir.name);
        const manifestPath = path.join(pluginDir, 'manifest.json');
        
        try {
          // Check if manifest file exists
          await fs.access(manifestPath);
          
          // Read and parse manifest
          const manifestContent = await fs.readFile(manifestPath, 'utf8');
          const manifest = JSON.parse(manifestContent);
          
          // Validate manifest
          if (!this.validateManifest(manifest)) {
            logger.warn(`Invalid manifest for plugin in directory ${dir.name}, skipping`);
            continue;
          }
          
          // Register the plugin
          this.registry.registerPlugin({
            id: manifest.name,
            path: pluginDir,
            manifest
          });
          
          logger.info(`Discovered plugin: ${manifest.name} (${manifest.displayName || manifest.name})`);
        } catch (err) {
          // Skip directories without a valid manifest
          if (err.code === 'ENOENT') {
            logger.debug(`No manifest found in directory ${dir.name}, skipping`);
          } else {
            logger.warn(`Error processing plugin in directory ${dir.name}:`, err);
          }
        }
      }
      
      // Save registry after discovery
      await this.registry.save();
      
      const availablePlugins = this.registry.getAvailablePlugins();
      logger.info(`Plugin discovery complete. Found ${availablePlugins.length} valid plugins`);
      
      return availablePlugins;
    } catch (error) {
      logger.error('Plugin discovery failed:', error);
      throw error;
    }
  }
  
  /**
   * Validate a plugin manifest
   * @param {Object} manifest - Plugin manifest to validate
   * @returns {boolean} - True if manifest is valid
   */
  validateManifest(manifest) {
    // Check required fields
    if (!manifest.name || typeof manifest.name !== 'string') {
      logger.warn('Plugin manifest missing required "name" field');
      return false;
    }
    
    if (!manifest.version || typeof manifest.version !== 'string') {
      logger.warn(`Plugin ${manifest.name}: manifest missing required "version" field`);
      return false;
    }
    
    if (!manifest.main || typeof manifest.main !== 'string') {
      logger.warn(`Plugin ${manifest.name}: manifest missing required "main" field`);
      return false;
    }
    
    // Check version compatibility
    if (manifest.engines && manifest.engines.findoc) {
      if (!semver.satisfies(this.options.coreVersion, manifest.engines.findoc)) {
        logger.warn(`Plugin ${manifest.name} is not compatible with core version ${this.options.coreVersion}`);
        return false;
      }
    }
    
    // Validate extension points
    if (manifest.extensionPoints && Array.isArray(manifest.extensionPoints)) {
      for (const point of manifest.extensionPoints) {
        if (!EXTENSION_POINTS[point]) {
          logger.warn(`Plugin ${manifest.name} declares unknown extension point: ${point}`);
          // We don't fail validation for unknown extension points, just warn
        }
      }
    }
    
    return true;
  }
  
  /**
   * Load all enabled plugins
   */
  async loadEnabledPlugins() {
    const enabledPlugins = this.registry.getEnabledPlugins();
    
    logger.info(`Loading ${enabledPlugins.length} enabled plugins`);
    
    // Load each enabled plugin
    const loadPromises = enabledPlugins.map(plugin => this.loadPlugin(plugin.id));
    
    // Wait for all plugins to load
    await Promise.allSettled(loadPromises);
    
    logger.info(`Loaded ${this.loadedPlugins.size} plugins successfully`);
    
    // Emit event
    this.emit('plugins:loaded', {
      count: this.loadedPlugins.size,
      plugins: Array.from(this.loadedPlugins.keys())
    });
  }
  
  /**
   * Load a specific plugin
   * @param {string} pluginId - Plugin ID to load
   * @returns {Object|null} - Loaded plugin instance or null if loading failed
   */
  async loadPlugin(pluginId) {
    logger.info(`Loading plugin: ${pluginId}`);
    
    // Check if already loaded
    if (this.loadedPlugins.has(pluginId)) {
      logger.info(`Plugin ${pluginId} is already loaded`);
      return this.loadedPlugins.get(pluginId).instance;
    }
    
    // Get plugin info from registry
    const pluginInfo = this.registry.getPlugin(pluginId);
    
    if (!pluginInfo) {
      logger.error(`Plugin ${pluginId} not found in registry`);
      return null;
    }
    
    // Check if enabled
    if (!pluginInfo.enabled && !this.options.developmentMode) {
      logger.warn(`Cannot load disabled plugin: ${pluginId}`);
      return null;
    }
    
    try {
      // Check for dependencies
      if (pluginInfo.manifest.dependencies) {
        for (const [depName, depVersion] of Object.entries(pluginInfo.manifest.dependencies)) {
          // Check if dependency is available
          const depInfo = this.registry.getPlugin(depName);
          
          if (!depInfo) {
            logger.error(`Plugin ${pluginId} depends on ${depName}, which is not available`);
            return null;
          }
          
          // Check version compatibility
          if (!semver.satisfies(depInfo.manifest.version, depVersion)) {
            logger.error(
              `Plugin ${pluginId} depends on ${depName} ${depVersion}, ` +
              `but version ${depInfo.manifest.version} is installed`
            );
            return null;
          }
          
          // Make sure dependency is loaded
          if (!this.loadedPlugins.has(depName)) {
            logger.info(`Loading dependency ${depName} for plugin ${pluginId}`);
            const depInstance = await this.loadPlugin(depName);
            
            if (!depInstance) {
              logger.error(`Failed to load dependency ${depName} for plugin ${pluginId}`);
              return null;
            }
          }
        }
      }
      
      // Prepare plugin context
      const context = await this.createPluginContext(pluginInfo);
      
      // Load the plugin module
      const pluginPath = path.join(pluginInfo.path, pluginInfo.manifest.main);
      
      // Create sandbox for plugin if not in development mode
      let pluginModule;
      if (this.options.developmentMode) {
        // In development mode, load directly (for easier debugging)
        // Delete cache first to ensure we load the latest version
        delete require.cache[require.resolve(pluginPath)];
        pluginModule = require(pluginPath);
      } else {
        // In production mode, load in sandbox
        const sandbox = createSandbox(pluginInfo);
        pluginModule = await sandbox.load(pluginPath);
      }
      
      // Instantiate plugin
      let pluginInstance;
      
      if (typeof pluginModule === 'function') {
        // Plugin exports a constructor
        pluginInstance = new pluginModule(context);
      } else if (typeof pluginModule === 'object') {
        // Plugin exports an object
        pluginInstance = pluginModule;
      } else {
        throw new Error(`Plugin ${pluginId} has invalid export type: ${typeof pluginModule}`);
      }
      
      // Call initialize method if available
      if (typeof pluginInstance.initialize === 'function') {
        await Promise.resolve(pluginInstance.initialize(context));
      }
      
      // Register extension points
      if (pluginInfo.manifest.extensionPoints) {
        for (const point of pluginInfo.manifest.extensionPoints) {
          if (EXTENSION_POINTS[point]) {
            // Add to extension point registry
            this.registerExtensionPoint(point, pluginInstance, pluginInfo);
          }
        }
      }
      
      // Add to loaded plugins
      this.loadedPlugins.set(pluginId, {
        info: pluginInfo,
        instance: pluginInstance,
        context
      });
      
      // Update last loaded time
      this.registry.updatePlugin(pluginId, {
        lastLoaded: new Date().toISOString()
      });
      
      // Save registry
      await this.registry.save();
      
      // Emit event
      this.emit('plugin:loaded', {
        id: pluginId,
        name: pluginInfo.manifest.displayName || pluginInfo.manifest.name
      });
      
      logger.info(`Successfully loaded plugin: ${pluginId}`);
      
      return pluginInstance;
    } catch (error) {
      logger.error(`Failed to load plugin ${pluginId}:`, error);
      
      // Update error status in registry
      this.registry.updatePlugin(pluginId, {
        loadError: error.message,
        lastError: new Date().toISOString()
      });
      
      // Save registry
      await this.registry.save();
      
      // Emit event
      this.emit('plugin:error', {
        id: pluginId,
        error: error.message
      });
      
      return null;
    }
  }
  
  /**
   * Register a plugin to an extension point
   * @param {string} point - Extension point name
   * @param {Object} instance - Plugin instance
   * @param {Object} info - Plugin info
   */
  registerExtensionPoint(point, instance, info) {
    // Get extension point definition
    const pointDef = EXTENSION_POINTS[point];
    
    // Check if extension point exists
    if (!this.extensionPoints.has(point)) {
      this.extensionPoints.set(point, []);
    }
    
    // Check if plugin implements required interface
    const isValid = pointDef.interface.every(method => {
      return typeof instance[method] === 'function';
    });
    
    if (!isValid) {
      logger.warn(
        `Plugin ${info.manifest.name} does not implement required interface for ` +
        `extension point ${point}: ${pointDef.interface.join(', ')}`
      );
      return;
    }
    
    // Register plugin for this extension point
    this.extensionPoints.get(point).push({
      id: info.manifest.name,
      instance,
      info
    });
    
    logger.info(`Registered plugin ${info.manifest.name} for extension point ${point}`);
    
    // Subscribe to events for this extension point
    if (pointDef.events) {
      for (const event of pointDef.events) {
        if (typeof instance.onEvent === 'function') {
          this.on(event, (data) => {
            try {
              instance.onEvent(event, data);
            } catch (error) {
              logger.error(
                `Error in plugin ${info.manifest.name} while handling event ${event}:`,
                error
              );
            }
          });
          
          logger.debug(`Plugin ${info.manifest.name} subscribed to event ${event}`);
        }
      }
    }
  }
  
  /**
   * Create a context object for a plugin
   * @param {Object} pluginInfo - Plugin info from registry
   * @returns {Object} - Plugin context
   */
  async createPluginContext(pluginInfo) {
    // Get plugin settings
    const settings = await this.registry.getPluginSettings(pluginInfo.id);
    
    // Create plugin context
    return {
      id: pluginInfo.id,
      version: pluginInfo.manifest.version,
      pluginPath: pluginInfo.path,
      extensionPoints: pluginInfo.manifest.extensionPoints || [],
      logger: {
        debug: (message, ...args) => logger.debug(`[Plugin:${pluginInfo.id}] ${message}`, ...args),
        info: (message, ...args) => logger.info(`[Plugin:${pluginInfo.id}] ${message}`, ...args),
        warn: (message, ...args) => logger.warn(`[Plugin:${pluginInfo.id}] ${message}`, ...args),
        error: (message, ...args) => logger.error(`[Plugin:${pluginInfo.id}] ${message}`, ...args)
      },
      settings: {
        get: (key, defaultValue) => {
          return settings[key] !== undefined ? settings[key] : defaultValue;
        },
        set: async (key, value) => {
          settings[key] = value;
          await this.registry.savePluginSettings(pluginInfo.id, settings);
          return true;
        }
      },
      events: {
        emit: (event, data) => {
          this.emit(`plugin:${pluginInfo.id}:${event}`, data);
          return true;
        },
        on: (event, handler) => {
          this.on(`app:${event}`, handler);
          return true;
        },
        off: (event, handler) => {
          this.off(`app:${event}`, handler);
          return true;
        }
      },
      permissions: this.getPluginPermissions(pluginInfo),
      getResource: (resourcePath) => {
        // Ensure resource path is within plugin directory
        const absolutePath = path.resolve(pluginInfo.path, resourcePath);
        if (!absolutePath.startsWith(pluginInfo.path)) {
          throw new Error('Access denied: Resource path outside plugin directory');
        }
        
        return absolutePath;
      }
    };
  }
  
  /**
   * Get permissions for a plugin
   * @param {Object} pluginInfo - Plugin info
   * @returns {Object} - Plugin permissions
   */
  getPluginPermissions(pluginInfo) {
    // Default permissions (minimal access)
    const defaultPermissions = {
      storage: false,
      network: false,
      filesystem: false,
      ui: false
    };
    
    // Check requested permissions from manifest
    if (pluginInfo.manifest.permissions && Array.isArray(pluginInfo.manifest.permissions)) {
      const permissions = { ...defaultPermissions };
      
      // Grant requested permissions
      for (const permission of pluginInfo.manifest.permissions) {
        switch (permission) {
          case 'storage':
            permissions.storage = true;
            break;
          case 'network':
            permissions.network = true;
            break;
          case 'filesystem':
            permissions.filesystem = true;
            break;
          case 'ui':
            permissions.ui = true;
            break;
          // Add more permission types as needed
        }
      }
      
      return permissions;
    }
    
    return defaultPermissions;
  }
  
  /**
   * Get plugins registered for a specific extension point
   * @param {string} point - Extension point name
   * @returns {Array} - Array of plugins
   */
  getExtensionPoint(point) {
    return this.extensionPoints.get(point) || [];
  }
  
  /**
   * Execute plugins for a specific extension point
   * @param {string} point - Extension point name
   * @param {string} method - Method to execute
   * @param {Array} args - Arguments to pass to the method
   * @returns {Promise<Array>} - Array of results
   */
  async executeExtensionPoint(point, method, ...args) {
    // Get plugins for this extension point
    const plugins = this.getExtensionPoint(point);
    
    if (!plugins.length) {
      logger.debug(`No plugins registered for extension point ${point}`);
      return [];
    }
    
    logger.debug(`Executing ${plugins.length} plugins for extension point ${point}.${method}`);
    
    // Execute method on each plugin
    const results = await Promise.allSettled(
      plugins.map(plugin => {
        if (typeof plugin.instance[method] !== 'function') {
          return Promise.reject(new Error(`Plugin ${plugin.id} does not implement method ${method}`));
        }
        
        try {
          return Promise.resolve(plugin.instance[method](...args));
        } catch (error) {
          return Promise.reject(error);
        }
      })
    );
    
    // Process results
    return results.map((result, index) => {
      const plugin = plugins[index];
      
      if (result.status === 'fulfilled') {
        return {
          plugin: plugin.id,
          success: true,
          data: result.value
        };
      } else {
        logger.error(
          `Error executing ${method} on plugin ${plugin.id} for extension point ${point}:`,
          result.reason
        );
        
        return {
          plugin: plugin.id,
          success: false,
          error: result.reason.message
        };
      }
    });
  }
  
  /**
   * Install a plugin from a directory
   * @param {string} sourcePath - Source directory path
   * @returns {Promise<Object>} - Installed plugin info
   */
  async installPlugin(sourcePath) {
    logger.info(`Installing plugin from ${sourcePath}`);
    
    try {
      // Check if source path exists
      await fs.access(sourcePath);
      
      // Read manifest
      const manifestPath = path.join(sourcePath, 'manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      // Validate manifest
      if (!this.validateManifest(manifest)) {
        throw new Error('Invalid plugin manifest');
      }
      
      // Check if plugin already exists
      const existingPlugin = this.registry.getPlugin(manifest.name);
      
      if (existingPlugin) {
        logger.info(`Plugin ${manifest.name} already exists, upgrading`);
        
        // Check if it's an upgrade
        if (semver.gt(manifest.version, existingPlugin.manifest.version)) {
          // Unload the plugin if it's loaded
          if (this.loadedPlugins.has(manifest.name)) {
            await this.unloadPlugin(manifest.name);
          }
          
          // Delete existing plugin directory
          await fs.rm(existingPlugin.path, { recursive: true, force: true });
        } else {
          throw new Error(
            `Cannot downgrade plugin ${manifest.name} from version ` +
            `${existingPlugin.manifest.version} to ${manifest.version}`
          );
        }
      }
      
      // Create plugin directory
      const pluginDir = path.join(this.options.pluginsDir, manifest.name);
      await fs.mkdir(pluginDir, { recursive: true });
      
      // Copy files
      await this.copyDirectory(sourcePath, pluginDir);
      
      // Register plugin
      this.registry.registerPlugin({
        id: manifest.name,
        path: pluginDir,
        manifest,
        enabled: true,
        installed: new Date().toISOString()
      });
      
      // Save registry
      await this.registry.save();
      
      // Load the plugin
      const plugin = await this.loadPlugin(manifest.name);
      
      // Emit event
      this.emit('plugin:installed', {
        id: manifest.name,
        name: manifest.displayName || manifest.name,
        version: manifest.version
      });
      
      logger.info(`Successfully installed plugin: ${manifest.name} v${manifest.version}`);
      
      return { 
        id: manifest.name, 
        path: pluginDir, 
        manifest, 
        instance: plugin 
      };
    } catch (error) {
      logger.error(`Failed to install plugin from ${sourcePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Copy a directory recursively
   * @param {string} source - Source directory
   * @param {string} destination - Destination directory
   */
  async copyDirectory(source, destination) {
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);
      
      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
  
  /**
   * Unload a plugin
   * @param {string} pluginId - Plugin ID to unload
   * @returns {boolean} - True if plugin was unloaded
   */
  async unloadPlugin(pluginId) {
    logger.info(`Unloading plugin: ${pluginId}`);
    
    // Check if plugin is loaded
    if (!this.loadedPlugins.has(pluginId)) {
      logger.info(`Plugin ${pluginId} is not loaded`);
      return false;
    }
    
    try {
      const pluginData = this.loadedPlugins.get(pluginId);
      const { instance, info } = pluginData;
      
      // Call dispose method if available
      if (typeof instance.dispose === 'function') {
        await Promise.resolve(instance.dispose());
      }
      
      // Remove from extension points
      for (const [point, plugins] of this.extensionPoints.entries()) {
        this.extensionPoints.set(
          point,
          plugins.filter(p => p.id !== pluginId)
        );
      }
      
      // Remove from loaded plugins
      this.loadedPlugins.delete(pluginId);
      
      // Emit event
      this.emit('plugin:unloaded', {
        id: pluginId,
        name: info.manifest.displayName || info.manifest.name
      });
      
      logger.info(`Successfully unloaded plugin: ${pluginId}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to unload plugin ${pluginId}:`, error);
      return false;
    }
  }
  
  /**
   * Uninstall a plugin
   * @param {string} pluginId - Plugin ID to uninstall
   * @returns {boolean} - True if plugin was uninstalled
   */
  async uninstallPlugin(pluginId) {
    logger.info(`Uninstalling plugin: ${pluginId}`);
    
    try {
      // Get plugin info
      const pluginInfo = this.registry.getPlugin(pluginId);
      
      if (!pluginInfo) {
        logger.warn(`Plugin ${pluginId} not found in registry`);
        return false;
      }
      
      // Unload the plugin if it's loaded
      if (this.loadedPlugins.has(pluginId)) {
        await this.unloadPlugin(pluginId);
      }
      
      // Delete plugin directory
      if (pluginInfo.path) {
        await fs.rm(pluginInfo.path, { recursive: true, force: true });
      }
      
      // Remove from registry
      this.registry.unregisterPlugin(pluginId);
      
      // Save registry
      await this.registry.save();
      
      // Emit event
      this.emit('plugin:uninstalled', {
        id: pluginId,
        name: pluginInfo.manifest.displayName || pluginInfo.manifest.name
      });
      
      logger.info(`Successfully uninstalled plugin: ${pluginId}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to uninstall plugin ${pluginId}:`, error);
      return false;
    }
  }
  
  /**
   * Enable a plugin
   * @param {string} pluginId - Plugin ID to enable
   * @returns {boolean} - True if plugin was enabled
   */
  async enablePlugin(pluginId) {
    logger.info(`Enabling plugin: ${pluginId}`);
    
    try {
      // Check if plugin exists
      const pluginInfo = this.registry.getPlugin(pluginId);
      
      if (!pluginInfo) {
        logger.warn(`Plugin ${pluginId} not found in registry`);
        return false;
      }
      
      // Update registry
      this.registry.updatePlugin(pluginId, { enabled: true });
      
      // Save registry
      await this.registry.save();
      
      // Load the plugin if not already loaded
      if (!this.loadedPlugins.has(pluginId)) {
        await this.loadPlugin(pluginId);
      }
      
      // Emit event
      this.emit('plugin:enabled', {
        id: pluginId,
        name: pluginInfo.manifest.displayName || pluginInfo.manifest.name
      });
      
      logger.info(`Successfully enabled plugin: ${pluginId}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to enable plugin ${pluginId}:`, error);
      return false;
    }
  }
  
  /**
   * Disable a plugin
   * @param {string} pluginId - Plugin ID to disable
   * @returns {boolean} - True if plugin was disabled
   */
  async disablePlugin(pluginId) {
    logger.info(`Disabling plugin: ${pluginId}`);
    
    try {
      // Check if plugin exists
      const pluginInfo = this.registry.getPlugin(pluginId);
      
      if (!pluginInfo) {
        logger.warn(`Plugin ${pluginId} not found in registry`);
        return false;
      }
      
      // Unload the plugin if it's loaded
      if (this.loadedPlugins.has(pluginId)) {
        await this.unloadPlugin(pluginId);
      }
      
      // Update registry
      this.registry.updatePlugin(pluginId, { enabled: false });
      
      // Save registry
      await this.registry.save();
      
      // Emit event
      this.emit('plugin:disabled', {
        id: pluginId,
        name: pluginInfo.manifest.displayName || pluginInfo.manifest.name
      });
      
      logger.info(`Successfully disabled plugin: ${pluginId}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to disable plugin ${pluginId}:`, error);
      return false;
    }
  }
  
  /**
   * Get a list of all plugins
   * @returns {Array} - List of plugins
   */
  getPlugins() {
    return this.registry.getAllPlugins();
  }
  
  /**
   * Get a specific plugin
   * @param {string} pluginId - Plugin ID
   * @returns {Object|null} - Plugin info or null if not found
   */
  getPlugin(pluginId) {
    const pluginInfo = this.registry.getPlugin(pluginId);
    const isLoaded = this.loadedPlugins.has(pluginId);
    
    if (!pluginInfo) {
      return null;
    }
    
    return {
      ...pluginInfo,
      isLoaded,
      instance: isLoaded ? this.loadedPlugins.get(pluginId).instance : null
    };
  }
  
  /**
   * Shutdown the plugin manager
   */
  async shutdown() {
    logger.info('Shutting down plugin manager');
    
    // Unload all plugins
    const pluginIds = Array.from(this.loadedPlugins.keys());
    
    for (const pluginId of pluginIds) {
      await this.unloadPlugin(pluginId);
    }
    
    // Save registry
    await this.registry.save();
    
    logger.info('Plugin manager shutdown complete');
  }
}

module.exports = PluginManager;