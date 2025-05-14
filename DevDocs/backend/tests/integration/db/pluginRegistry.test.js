/**
 * Integration tests for Plugin Registry with database
 */

const path = require('path');
const fs = require('fs').promises;
const PluginRegistry = require('../../../services/plugins/PluginRegistry');
const { mockUtils, pluginTestUtils } = require('../../helpers/test-utils');

// Temporary directory for testing
const tempDir = path.join(__dirname, '..', '..', 'temp');
const configDir = path.join(tempDir, 'config');
const pluginsDir = path.join(tempDir, 'plugins');
const registryFile = 'plugin-registry.json';
const settingsDir = 'plugin-settings';

describe('PluginRegistry Database Integration', () => {
  let registry;
  
  beforeAll(async () => {
    // Create temporary directories
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(configDir, { recursive: true });
    await fs.mkdir(pluginsDir, { recursive: true });
    await fs.mkdir(path.join(configDir, settingsDir), { recursive: true });
  });
  
  afterAll(async () => {
    // Clean up temporary directories
    await fs.rm(tempDir, { recursive: true, force: true });
  });
  
  beforeEach(() => {
    // Create a new registry instance
    registry = new PluginRegistry({
      configDir,
      registryFile,
      settingsDir
    });
  });
  
  afterEach(async () => {
    // Clean up registry file and settings
    try {
      await fs.unlink(path.join(configDir, registryFile));
    } catch (error) {
      // Ignore file not found errors
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    
    try {
      const settingsPath = path.join(configDir, settingsDir);
      const files = await fs.readdir(settingsPath);
      for (const file of files) {
        await fs.unlink(path.join(settingsPath, file));
      }
    } catch (error) {
      // Ignore directory not found errors
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  });
  
  describe('Registry Persistence', () => {
    test('should initialize registry if it does not exist', async () => {
      // Initialize registry
      await registry.initialize();
      
      // Check if registry file exists
      const exists = await fs.access(path.join(configDir, registryFile))
        .then(() => true)
        .catch(() => false);
      
      expect(exists).toBe(true);
      
      // Check registry content
      const content = await fs.readFile(path.join(configDir, registryFile), 'utf8');
      const data = JSON.parse(content);
      
      expect(data).toHaveProperty('plugins');
      expect(data).toHaveProperty('lastUpdated');
      expect(Object.keys(data.plugins)).toHaveLength(0);
    });
    
    test('should load existing registry', async () => {
      // Create a registry file with test data
      const testRegistry = {
        plugins: {
          'test-plugin': {
            id: 'test-plugin',
            path: '/plugins/test-plugin',
            manifest: pluginTestUtils.createMockPluginManifest(),
            active: true
          }
        },
        lastUpdated: new Date().toISOString()
      };
      
      await fs.writeFile(
        path.join(configDir, registryFile),
        JSON.stringify(testRegistry, null, 2)
      );
      
      // Initialize registry
      await registry.initialize();
      
      // Check if plugins were loaded
      const plugins = await registry.listPlugins();
      expect(plugins).toHaveLength(1);
      expect(plugins[0].id).toBe('test-plugin');
      expect(plugins[0].active).toBe(true);
    });
    
    test('should save registry changes to disk', async () => {
      // Initialize registry
      await registry.initialize();
      
      // Add a plugin
      const pluginInfo = {
        id: 'test-plugin',
        path: '/plugins/test-plugin',
        manifest: pluginTestUtils.createMockPluginManifest(),
        active: true
      };
      
      await registry.registerPlugin(pluginInfo);
      
      // Read registry file
      const content = await fs.readFile(path.join(configDir, registryFile), 'utf8');
      const data = JSON.parse(content);
      
      expect(data.plugins).toHaveProperty('test-plugin');
      expect(data.plugins['test-plugin'].id).toBe('test-plugin');
      expect(data.plugins['test-plugin'].active).toBe(true);
    });
  });
  
  describe('Plugin Settings Persistence', () => {
    test('should save and load plugin settings', async () => {
      // Initialize registry
      await registry.initialize();
      
      // Add a plugin
      const pluginInfo = {
        id: 'test-plugin',
        path: '/plugins/test-plugin',
        manifest: pluginTestUtils.createMockPluginManifest(),
        active: true
      };
      
      await registry.registerPlugin(pluginInfo);
      
      // Save settings
      const settings = {
        setting1: 'value1',
        setting2: {
          nestedSetting: 'nestedValue'
        },
        setting3: 123
      };
      
      await registry.savePluginSettings('test-plugin', settings);
      
      // Check if settings file exists
      const settingsFile = path.join(configDir, settingsDir, 'test-plugin.json');
      const exists = await fs.access(settingsFile)
        .then(() => true)
        .catch(() => false);
      
      expect(exists).toBe(true);
      
      // Read settings file
      const content = await fs.readFile(settingsFile, 'utf8');
      const data = JSON.parse(content);
      
      expect(data).toEqual(settings);
      
      // Load settings
      const loadedSettings = await registry.getPluginSettings('test-plugin');
      expect(loadedSettings).toEqual(settings);
    });
    
    test('should handle updates to plugin settings', async () => {
      // Initialize registry
      await registry.initialize();
      
      // Add a plugin
      const pluginInfo = {
        id: 'test-plugin',
        path: '/plugins/test-plugin',
        manifest: pluginTestUtils.createMockPluginManifest(),
        active: true
      };
      
      await registry.registerPlugin(pluginInfo);
      
      // Save initial settings
      const initialSettings = {
        setting1: 'value1',
        setting2: 'value2'
      };
      
      await registry.savePluginSettings('test-plugin', initialSettings);
      
      // Update settings
      const updatedSettings = {
        setting1: 'updatedValue1',
        setting3: 'newSetting'
      };
      
      await registry.savePluginSettings('test-plugin', updatedSettings);
      
      // Load settings
      const loadedSettings = await registry.getPluginSettings('test-plugin');
      
      // Verify that settings were updated/merged
      expect(loadedSettings.setting1).toBe('updatedValue1');
      expect(loadedSettings.setting2).toBeUndefined(); // Replaced, not merged
      expect(loadedSettings.setting3).toBe('newSetting');
    });
    
    test('should return empty object for non-existent plugin settings', async () => {
      // Initialize registry
      await registry.initialize();
      
      // Load settings for non-existent plugin
      const settings = await registry.getPluginSettings('non-existent-plugin');
      
      expect(settings).toEqual({});
    });
    
    test('should delete plugin settings when unregistering plugin', async () => {
      // Initialize registry
      await registry.initialize();
      
      // Add a plugin
      const pluginInfo = {
        id: 'test-plugin',
        path: '/plugins/test-plugin',
        manifest: pluginTestUtils.createMockPluginManifest(),
        active: true
      };
      
      await registry.registerPlugin(pluginInfo);
      
      // Save settings
      await registry.savePluginSettings('test-plugin', { setting: 'value' });
      
      // Unregister plugin
      await registry.unregisterPlugin('test-plugin');
      
      // Check if settings file was deleted
      const settingsFile = path.join(configDir, settingsDir, 'test-plugin.json');
      const exists = await fs.access(settingsFile)
        .then(() => true)
        .catch(() => false);
      
      expect(exists).toBe(false);
    });
  });
  
  describe('Plugin Management', () => {
    test('should register and unregister plugins', async () => {
      // Initialize registry
      await registry.initialize();
      
      // Register a plugin
      const pluginInfo = {
        id: 'test-plugin',
        path: '/plugins/test-plugin',
        manifest: pluginTestUtils.createMockPluginManifest(),
        active: false
      };
      
      await registry.registerPlugin(pluginInfo);
      
      // Verify plugin was registered
      let plugins = await registry.listPlugins();
      expect(plugins).toHaveLength(1);
      expect(plugins[0].id).toBe('test-plugin');
      
      // Unregister the plugin
      await registry.unregisterPlugin('test-plugin');
      
      // Verify plugin was unregistered
      plugins = await registry.listPlugins();
      expect(plugins).toHaveLength(0);
    });
    
    test('should update plugin information', async () => {
      // Initialize registry
      await registry.initialize();
      
      // Register a plugin
      const pluginInfo = {
        id: 'test-plugin',
        path: '/plugins/test-plugin',
        manifest: pluginTestUtils.createMockPluginManifest(),
        active: false
      };
      
      await registry.registerPlugin(pluginInfo);
      
      // Update plugin info
      const updatedInfo = {
        id: 'test-plugin',
        path: '/plugins/test-plugin-new',
        manifest: pluginTestUtils.createMockPluginManifest({
          version: '2.0.0',
          description: 'Updated description'
        }),
        active: true
      };
      
      await registry.updatePlugin('test-plugin', updatedInfo);
      
      // Verify plugin was updated
      const plugin = await registry.getPluginInfo('test-plugin');
      expect(plugin.path).toBe('/plugins/test-plugin-new');
      expect(plugin.manifest.version).toBe('2.0.0');
      expect(plugin.manifest.description).toBe('Updated description');
      expect(plugin.active).toBe(true);
    });
    
    test('should activate and deactivate plugins', async () => {
      // Initialize registry
      await registry.initialize();
      
      // Register a plugin
      const pluginInfo = {
        id: 'test-plugin',
        path: '/plugins/test-plugin',
        manifest: pluginTestUtils.createMockPluginManifest(),
        active: false
      };
      
      await registry.registerPlugin(pluginInfo);
      
      // Activate the plugin
      await registry.activatePlugin('test-plugin');
      
      // Verify plugin was activated
      let plugin = await registry.getPluginInfo('test-plugin');
      expect(plugin.active).toBe(true);
      
      // Deactivate the plugin
      await registry.deactivatePlugin('test-plugin');
      
      // Verify plugin was deactivated
      plugin = await registry.getPluginInfo('test-plugin');
      expect(plugin.active).toBe(false);
    });
    
    test('should handle non-existent plugins gracefully', async () => {
      // Initialize registry
      await registry.initialize();
      
      // Try to get info for non-existent plugin
      const plugin = await registry.getPluginInfo('non-existent-plugin');
      expect(plugin).toBeNull();
      
      // Try to update non-existent plugin
      const updatePromise = registry.updatePlugin('non-existent-plugin', {});
      await expect(updatePromise).rejects.toThrow();
      
      // Try to activate non-existent plugin
      const activatePromise = registry.activatePlugin('non-existent-plugin');
      await expect(activatePromise).rejects.toThrow();
    });
  });
});