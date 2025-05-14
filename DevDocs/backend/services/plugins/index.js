/**
 * @fileoverview Plugin System for the FinDoc Analyzer application.
 * 
 * This module exports the plugin system components for use in the application.
 * It serves as the main entry point for the plugin system.
 */

const PluginManager = require('./PluginManager');
const PluginRegistry = require('./PluginRegistry');
const PluginContext = require('./PluginContext');
const PluginSandbox = require('./PluginSandbox');
const PluginSDK = require('./PluginSDK');
const constants = require('./constants');

/**
 * Initialize the plugin system
 * 
 * @param {Object} options - Plugin system options
 * @returns {Object} The initialized plugin system
 */
function initializePluginSystem(options = {}) {
  // Create the registry
  const registry = new PluginRegistry({
    configDir: options.configDir,
    registryFile: options.registryFile,
    settingsDir: options.settingsDir
  });
  
  // Create the manager
  const manager = new PluginManager({
    pluginsDir: options.pluginsDir,
    configDir: options.configDir,
    coreVersion: options.coreVersion || '1.0.0',
    autoDiscovery: options.autoDiscovery !== false,
    developmentMode: options.developmentMode === true,
    registry: registry
  });
  
  return {
    manager,
    registry
  };
}

/**
 * Middleware for handling plugin API requests
 * 
 * @param {Object} pluginSystem - The initialized plugin system
 * @returns {Function} Express middleware function
 */
function pluginApiMiddleware(pluginSystem) {
  return async (req, res, next) => {
    if (!req.path.startsWith('/api/plugins')) {
      return next();
    }
    
    try {
      const path = req.path.replace('/api/plugins', '');
      
      // Handle plugin list request
      if (path === '/list' && req.method === 'GET') {
        const plugins = await pluginSystem.registry.listPlugins();
        return res.json({ success: true, plugins });
      }
      
      // Handle plugin installation
      if (path === '/install' && req.method === 'POST') {
        const { pluginPath } = req.body;
        
        if (!pluginPath) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing pluginPath parameter' 
          });
        }
        
        try {
          const plugin = await pluginSystem.manager.installPlugin(pluginPath);
          return res.json({ success: true, plugin });
        } catch (error) {
          return res.status(400).json({ 
            success: false, 
            error: error.message 
          });
        }
      }
      
      // Handle plugin uninstallation
      if (path === '/uninstall' && req.method === 'POST') {
        const { pluginId } = req.body;
        
        if (!pluginId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing pluginId parameter' 
          });
        }
        
        try {
          await pluginSystem.manager.uninstallPlugin(pluginId);
          return res.json({ success: true });
        } catch (error) {
          return res.status(400).json({ 
            success: false, 
            error: error.message 
          });
        }
      }
      
      // Handle plugin activation
      if (path === '/activate' && req.method === 'POST') {
        const { pluginId } = req.body;
        
        if (!pluginId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing pluginId parameter' 
          });
        }
        
        try {
          await pluginSystem.manager.activatePlugin(pluginId);
          return res.json({ success: true });
        } catch (error) {
          return res.status(400).json({ 
            success: false, 
            error: error.message 
          });
        }
      }
      
      // Handle plugin deactivation
      if (path === '/deactivate' && req.method === 'POST') {
        const { pluginId } = req.body;
        
        if (!pluginId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing pluginId parameter' 
          });
        }
        
        try {
          await pluginSystem.manager.deactivatePlugin(pluginId);
          return res.json({ success: true });
        } catch (error) {
          return res.status(400).json({ 
            success: false, 
            error: error.message 
          });
        }
      }
      
      // Handle plugin configuration
      if (path === '/config' && req.method === 'GET') {
        const { pluginId } = req.query;
        
        if (!pluginId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing pluginId parameter' 
          });
        }
        
        try {
          const config = await pluginSystem.registry.getPluginSettings(pluginId);
          return res.json({ success: true, config });
        } catch (error) {
          return res.status(400).json({ 
            success: false, 
            error: error.message 
          });
        }
      }
      
      // Handle plugin configuration update
      if (path === '/config' && req.method === 'POST') {
        const { pluginId, config } = req.body;
        
        if (!pluginId || !config) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing pluginId or config parameter' 
          });
        }
        
        try {
          await pluginSystem.registry.savePluginSettings(pluginId, config);
          return res.json({ success: true });
        } catch (error) {
          return res.status(400).json({ 
            success: false, 
            error: error.message 
          });
        }
      }
      
      // Handle plugin reload
      if (path === '/reload' && req.method === 'POST') {
        try {
          await pluginSystem.manager.reloadPlugins();
          return res.json({ success: true });
        } catch (error) {
          return res.status(400).json({ 
            success: false, 
            error: error.message 
          });
        }
      }
      
      // Handle unknown endpoint
      return res.status(404).json({ 
        success: false, 
        error: 'Unknown plugin API endpoint' 
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  };
}

// Export the plugin system components
module.exports = {
  PluginManager,
  PluginRegistry,
  PluginContext,
  PluginSandbox,
  PluginSDK,
  constants,
  initializePluginSystem,
  pluginApiMiddleware
};