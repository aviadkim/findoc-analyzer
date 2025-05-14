/**
 * Unit tests for PluginContext
 */

const path = require('path');
const fs = require('fs').promises;
const PluginContext = require('../../../services/plugins/PluginContext');
const { pluginTestUtils } = require('../../helpers/test-utils');

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue('test-content'),
    writeFile: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
    readdir: jest.fn().mockResolvedValue(['file1.txt', 'file2.txt']),
    access: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  createLogger: jest.fn().mockReturnValue({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  })
}));

describe('PluginContext', () => {
  let pluginContext;
  const mockPluginManager = {
    registerPluginExtensionPoint: jest.fn(),
    getDocumentData: jest.fn(),
    getAnalysisData: jest.fn(),
    getExportData: jest.fn(),
    saveDocumentData: jest.fn(),
    saveAnalysisData: jest.fn(),
    createExport: jest.fn(),
    safeFetch: jest.fn(),
    registerUIComponent: jest.fn(),
    registerDashboardWidget: jest.fn(),
    registerVisualization: jest.fn(),
    getSystemConfig: jest.fn(),
    getPluginList: jest.fn(),
    getPluginInfo: jest.fn()
  };
  
  const mockRegistry = {
    getPluginSettings: jest.fn().mockReturnValue({}),
    savePluginSettings: jest.fn().mockResolvedValue({})
  };
  
  const options = {
    id: 'test-plugin',
    manifest: pluginTestUtils.createMockPluginManifest(),
    pluginPath: '/plugins/test-plugin',
    registry: mockRegistry,
    manager: mockPluginManager
  };
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create plugin context
    pluginContext = new PluginContext(options);
  });
  
  describe('Constructor', () => {
    test('should create a plugin context with required properties', () => {
      expect(pluginContext.id).toBe('test-plugin');
      expect(pluginContext.manifest).toEqual(options.manifest);
      expect(pluginContext.pluginPath).toBe(options.pluginPath);
      expect(pluginContext.registry).toBe(options.registry);
      expect(pluginContext.manager).toBe(options.manager);
      expect(pluginContext.permissions).toEqual(options.manifest.permissions);
      expect(pluginContext.pluginStoragePath).toBe(path.join(options.pluginPath, 'storage'));
    });
    
    test('should throw error if required options are missing', () => {
      expect(() => new PluginContext({})).toThrow('Plugin context requires id, manifest, and pluginPath');
      expect(() => new PluginContext({ id: 'test' })).toThrow('Plugin context requires id, manifest, and pluginPath');
      expect(() => new PluginContext({ id: 'test', manifest: {} })).toThrow('Plugin context requires id, manifest, and pluginPath');
    });
    
    test('should create storage directory on initialization', () => {
      expect(fs.mkdir).toHaveBeenCalledWith(pluginContext.pluginStoragePath, { recursive: true });
    });
  });
  
  describe('registerExtensionPoint', () => {
    test('should register extension point if permitted', () => {
      const extensionPoint = 'dataExporter';
      const handler = () => {};
      
      const result = pluginContext.registerExtensionPoint(extensionPoint, handler);
      
      expect(result).toBe(true);
      expect(mockPluginManager.registerPluginExtensionPoint).toHaveBeenCalledWith(
        'test-plugin', extensionPoint, handler
      );
    });
    
    test('should not register extension point if not in manifest', () => {
      const extensionPoint = 'notInManifest';
      const handler = () => {};
      
      const result = pluginContext.registerExtensionPoint(extensionPoint, handler);
      
      expect(result).toBe(false);
      expect(mockPluginManager.registerPluginExtensionPoint).not.toHaveBeenCalled();
    });
    
    test('should not register extension point if handler is not a function', () => {
      const extensionPoint = 'dataExporter';
      const handler = 'not a function';
      
      const result = pluginContext.registerExtensionPoint(extensionPoint, handler);
      
      expect(result).toBe(false);
      expect(mockPluginManager.registerPluginExtensionPoint).not.toHaveBeenCalled();
    });
    
    test('should not register extension point if core permission is missing', () => {
      // Create plugin context with no permissions
      pluginContext = new PluginContext({
        ...options,
        manifest: pluginTestUtils.createMockPluginManifest({ permissions: [] })
      });
      
      const extensionPoint = 'dataExporter';
      const handler = () => {};
      
      const result = pluginContext.registerExtensionPoint(extensionPoint, handler);
      
      expect(result).toBe(false);
      expect(mockPluginManager.registerPluginExtensionPoint).not.toHaveBeenCalled();
    });
  });
  
  describe('getConfig', () => {
    test('should get plugin settings from registry', () => {
      const config = { setting: 'value' };
      mockRegistry.getPluginSettings.mockReturnValueOnce(config);
      
      const result = pluginContext.getConfig();
      
      expect(result).toEqual(config);
      expect(mockRegistry.getPluginSettings).toHaveBeenCalledWith('test-plugin');
    });
    
    test('should return empty object if registry is not available', () => {
      pluginContext = new PluginContext({
        ...options,
        registry: null
      });
      
      const result = pluginContext.getConfig();
      
      expect(result).toEqual({});
    });
    
    test('should return empty object if error occurs', () => {
      mockRegistry.getPluginSettings.mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      const result = pluginContext.getConfig();
      
      expect(result).toEqual({});
    });
  });
  
  describe('saveConfig', () => {
    test('should save plugin settings to registry', async () => {
      const config = { setting: 'value' };
      
      const result = await pluginContext.saveConfig(config);
      
      expect(result).toBe(true);
      expect(mockRegistry.savePluginSettings).toHaveBeenCalledWith('test-plugin', config);
    });
    
    test('should return false if registry is not available', async () => {
      pluginContext = new PluginContext({
        ...options,
        registry: null
      });
      
      const result = await pluginContext.saveConfig({});
      
      expect(result).toBe(false);
    });
    
    test('should return false if core permission is missing', async () => {
      // Create plugin context with no permissions
      pluginContext = new PluginContext({
        ...options,
        manifest: pluginTestUtils.createMockPluginManifest({ permissions: [] })
      });
      
      const result = await pluginContext.saveConfig({});
      
      expect(result).toBe(false);
      expect(mockRegistry.savePluginSettings).not.toHaveBeenCalled();
    });
    
    test('should return false if error occurs', async () => {
      mockRegistry.savePluginSettings.mockRejectedValueOnce(new Error('Test error'));
      
      const result = await pluginContext.saveConfig({});
      
      expect(result).toBe(false);
    });
  });
  
  describe('hasPermission', () => {
    test('should return true if plugin has permission', () => {
      expect(pluginContext.hasPermission('core')).toBe(true);
      expect(pluginContext.hasPermission('fs_read')).toBe(true);
      expect(pluginContext.hasPermission('fs_write')).toBe(true);
    });
    
    test('should return false if plugin does not have permission', () => {
      expect(pluginContext.hasPermission('network')).toBe(false);
      expect(pluginContext.hasPermission('ui')).toBe(false);
      expect(pluginContext.hasPermission('admin')).toBe(false);
    });
  });
  
  describe('getStoragePath', () => {
    test('should return path within plugin storage directory', () => {
      const result = pluginContext.getStoragePath('test/path');
      const expected = path.join(pluginContext.pluginStoragePath, 'test/path');
      
      expect(result).toBe(expected);
    });
    
    test('should sanitize path to prevent directory traversal', () => {
      const result = pluginContext.getStoragePath('../../../dangerous/path');
      const expected = path.join(pluginContext.pluginStoragePath, 'dangerous/path');
      
      expect(result).toBe(expected);
    });
    
    test('should use root storage path if no relative path provided', () => {
      const result = pluginContext.getStoragePath();
      
      expect(result).toBe(pluginContext.pluginStoragePath);
    });
  });
  
  describe('File operations', () => {
    describe('createFile', () => {
      test('should create file in plugin storage directory', async () => {
        const content = 'test content';
        
        const result = await pluginContext.createFile('test.txt', content);
        
        expect(result).toBe(true);
        expect(fs.writeFile).toHaveBeenCalledWith(
          path.join(pluginContext.pluginStoragePath, 'test.txt'),
          content
        );
      });
      
      test('should create parent directories if they do not exist', async () => {
        const result = await pluginContext.createFile('nested/directory/test.txt', 'content');
        
        expect(result).toBe(true);
        expect(fs.mkdir).toHaveBeenCalledWith(
          path.join(pluginContext.pluginStoragePath, 'nested/directory'),
          { recursive: true }
        );
      });
      
      test('should return false if fs_write permission is missing', async () => {
        // Create plugin context with no fs_write permission
        pluginContext = new PluginContext({
          ...options,
          manifest: pluginTestUtils.createMockPluginManifest({ permissions: ['core'] })
        });
        
        const result = await pluginContext.createFile('test.txt', 'content');
        
        expect(result).toBe(false);
        expect(fs.writeFile).not.toHaveBeenCalled();
      });
    });
    
    describe('readFile', () => {
      test('should read file from plugin storage directory', async () => {
        const result = await pluginContext.readFile('test.txt');
        
        expect(result).toBe('test-content');
        expect(fs.readFile).toHaveBeenCalledWith(
          path.join(pluginContext.pluginStoragePath, 'test.txt')
        );
      });
      
      test('should return null if file does not exist', async () => {
        fs.readFile.mockRejectedValueOnce({ code: 'ENOENT' });
        
        const result = await pluginContext.readFile('non-existent.txt');
        
        expect(result).toBeNull();
      });
      
      test('should return null if fs_read permission is missing', async () => {
        // Create plugin context with no fs_read permission
        pluginContext = new PluginContext({
          ...options,
          manifest: pluginTestUtils.createMockPluginManifest({ permissions: ['core'] })
        });
        
        const result = await pluginContext.readFile('test.txt');
        
        expect(result).toBeNull();
        expect(fs.readFile).not.toHaveBeenCalled();
      });
    });
    
    describe('deleteFile', () => {
      test('should delete file from plugin storage directory', async () => {
        const result = await pluginContext.deleteFile('test.txt');
        
        expect(result).toBe(true);
        expect(fs.unlink).toHaveBeenCalledWith(
          path.join(pluginContext.pluginStoragePath, 'test.txt')
        );
      });
      
      test('should return false if file does not exist', async () => {
        fs.unlink.mockRejectedValueOnce({ code: 'ENOENT' });
        
        const result = await pluginContext.deleteFile('non-existent.txt');
        
        expect(result).toBe(false);
      });
      
      test('should return false if fs_write permission is missing', async () => {
        // Create plugin context with no fs_write permission
        pluginContext = new PluginContext({
          ...options,
          manifest: pluginTestUtils.createMockPluginManifest({ permissions: ['core'] })
        });
        
        const result = await pluginContext.deleteFile('test.txt');
        
        expect(result).toBe(false);
        expect(fs.unlink).not.toHaveBeenCalled();
      });
    });
    
    describe('listFiles', () => {
      test('should list files in plugin storage directory', async () => {
        const result = await pluginContext.listFiles();
        
        expect(result).toEqual(['file1.txt', 'file2.txt']);
        expect(fs.readdir).toHaveBeenCalledWith(pluginContext.pluginStoragePath);
      });
      
      test('should create directory if it does not exist', async () => {
        fs.access.mockRejectedValueOnce({ code: 'ENOENT' });
        
        const result = await pluginContext.listFiles('nested/directory');
        
        expect(result).toEqual([]);
        expect(fs.mkdir).toHaveBeenCalledWith(
          path.join(pluginContext.pluginStoragePath, 'nested/directory'),
          { recursive: true }
        );
      });
      
      test('should return empty array if fs_read permission is missing', async () => {
        // Create plugin context with no fs_read permission
        pluginContext = new PluginContext({
          ...options,
          manifest: pluginTestUtils.createMockPluginManifest({ permissions: ['core'] })
        });
        
        const result = await pluginContext.listFiles();
        
        expect(result).toEqual([]);
        expect(fs.readdir).not.toHaveBeenCalled();
      });
    });
  });
  
  describe('makeRequest', () => {
    test('should make network request if permitted', async () => {
      // Create plugin context with network permission
      pluginContext = new PluginContext({
        ...options,
        manifest: pluginTestUtils.createMockPluginManifest({ 
          permissions: ['core', 'network'] 
        })
      });
      
      const mockResponse = { data: 'response' };
      mockPluginManager.safeFetch.mockResolvedValueOnce(mockResponse);
      
      const result = await pluginContext.makeRequest('https://example.com', { method: 'GET' });
      
      expect(result).toBe(mockResponse);
      expect(mockPluginManager.safeFetch).toHaveBeenCalledWith(
        'test-plugin',
        'https://example.com',
        { method: 'GET' }
      );
    });
    
    test('should return null if network permission is missing', async () => {
      const result = await pluginContext.makeRequest('https://example.com');
      
      expect(result).toBeNull();
      expect(mockPluginManager.safeFetch).not.toHaveBeenCalled();
    });
    
    test('should return null if safeFetch is not available', async () => {
      // Create plugin context with network permission but no safeFetch
      pluginContext = new PluginContext({
        ...options,
        manifest: pluginTestUtils.createMockPluginManifest({ 
          permissions: ['core', 'network'] 
        }),
        manager: {}
      });
      
      const result = await pluginContext.makeRequest('https://example.com');
      
      expect(result).toBeNull();
    });
  });
  
  describe('API object', () => {
    test('should include metadata for all plugins', () => {
      expect(pluginContext.api.metadata).toBeDefined();
      expect(pluginContext.api.metadata.id).toBe('test-plugin');
      expect(pluginContext.api.metadata.name).toBe(options.manifest.name);
      expect(pluginContext.api.metadata.version).toBe(options.manifest.version);
      expect(pluginContext.api.metadata.description).toBe(options.manifest.description);
    });
    
    test('should include core API when core permission is granted', () => {
      expect(pluginContext.api.core).toBeDefined();
      expect(typeof pluginContext.api.core.getConfig).toBe('function');
      expect(typeof pluginContext.api.core.saveConfig).toBe('function');
      expect(typeof pluginContext.api.core.registerExtensionPoint).toBe('function');
      expect(pluginContext.api.core.log).toBeDefined();
    });
    
    test('should not include core API when core permission is missing', () => {
      // Create plugin context with no permissions
      pluginContext = new PluginContext({
        ...options,
        manifest: pluginTestUtils.createMockPluginManifest({ permissions: [] })
      });
      
      expect(pluginContext.api.core).toEqual({});
    });
    
    test('should include fs API when fs permissions are granted', () => {
      expect(pluginContext.api.fs).toBeDefined();
      expect(typeof pluginContext.api.fs.readFile).toBe('function');
      expect(typeof pluginContext.api.fs.listFiles).toBe('function');
      expect(typeof pluginContext.api.fs.createFile).toBe('function');
      expect(typeof pluginContext.api.fs.deleteFile).toBe('function');
    });
    
    test('should have limited fs API when only fs_read permission is granted', () => {
      // Create plugin context with only fs_read permission
      pluginContext = new PluginContext({
        ...options,
        manifest: pluginTestUtils.createMockPluginManifest({ 
          permissions: ['core', 'fs_read'] 
        })
      });
      
      expect(typeof pluginContext.api.fs.readFile).toBe('function');
      expect(typeof pluginContext.api.fs.listFiles).toBe('function');
      expect(pluginContext.api.fs.createFile).toBeUndefined();
      expect(pluginContext.api.fs.deleteFile).toBeUndefined();
    });
    
    test('should include network API when network permission is granted', () => {
      // Create plugin context with network permission
      pluginContext = new PluginContext({
        ...options,
        manifest: pluginTestUtils.createMockPluginManifest({ 
          permissions: ['core', 'network'] 
        })
      });
      
      expect(pluginContext.api.network).toBeDefined();
      expect(typeof pluginContext.api.network.fetch).toBe('function');
    });
    
    test('should not include network API when network permission is missing', () => {
      expect(pluginContext.api.network).toEqual({});
    });
  });
});