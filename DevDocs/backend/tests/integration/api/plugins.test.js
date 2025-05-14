/**
 * Integration tests for Plugin API endpoints
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { apiTestUtils } = require('../../helpers/test-utils');

// Mock app creation to avoid actual server startup
const mockApp = express => {
  // Setup middleware
  express.use(require('express').json());
  express.use(require('express').urlencoded({ extended: true }));
  
  // Setup plugin system
  const mockPluginSystem = {
    registry: {
      listPlugins: jest.fn().mockResolvedValue([
        {
          id: 'test-plugin-1',
          manifest: {
            name: 'Test Plugin 1',
            version: '1.0.0',
            description: 'Test Plugin 1 Description'
          },
          active: true
        },
        {
          id: 'test-plugin-2',
          manifest: {
            name: 'Test Plugin 2',
            version: '2.0.0',
            description: 'Test Plugin 2 Description'
          },
          active: false
        }
      ]),
      getPluginInfo: jest.fn().mockImplementation(id => {
        if (id === 'test-plugin-1') {
          return Promise.resolve({
            id: 'test-plugin-1',
            manifest: {
              name: 'Test Plugin 1',
              version: '1.0.0',
              description: 'Test Plugin 1 Description',
              permissions: ['core', 'fs_read'],
              extensionPoints: ['dataExporter']
            },
            active: true,
            path: '/plugins/test-plugin-1'
          });
        }
        return Promise.resolve(null);
      }),
      getPluginSettings: jest.fn().mockResolvedValue({
        setting1: 'value1',
        setting2: 'value2'
      }),
      savePluginSettings: jest.fn().mockResolvedValue(true)
    },
    manager: {
      installPlugin: jest.fn().mockResolvedValue({
        id: 'new-plugin',
        manifest: {
          name: 'New Plugin',
          version: '1.0.0',
          description: 'Newly Installed Plugin'
        },
        active: false
      }),
      uninstallPlugin: jest.fn().mockResolvedValue(true),
      activatePlugin: jest.fn().mockResolvedValue(true),
      deactivatePlugin: jest.fn().mockResolvedValue(true),
      reloadPlugins: jest.fn().mockResolvedValue(true)
    }
  };
  
  // Set plugin system in app locals
  express.locals.pluginSystem = mockPluginSystem;
  
  // Setup auth middleware mock
  express.use((req, res, next) => {
    // Check for admin role in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Decode token
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString()
        );
        // Set user data
        req.user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role
        };
      } catch (error) {
        // Invalid token format
        console.error('Invalid token format:', error);
      }
    }
    next();
  });
  
  // Register routes
  const pluginsRoutes = require('../../../routes/api/plugins');
  express.use('/api/plugins', pluginsRoutes);
  
  // Error handlers
  express.use((req, res, next) => {
    res.status(404).json({
      success: false,
      error: 'Not found'
    });
  });
  
  express.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  });
  
  return express;
};

// Use express for the app
const express = require('express')();
const app = mockApp(express);

describe('Plugin API Endpoints', () => {
  
  // Generate test tokens
  const adminToken = apiTestUtils.generateMockToken({ role: 'admin' });
  const userToken = apiTestUtils.generateMockToken({ role: 'user' });
  
  describe('GET /api/plugins', () => {
    test('should return list of plugins for admin users', async () => {
      const response = await request(app)
        .get('/api/plugins')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.plugins)).toBe(true);
      expect(response.body.plugins).toHaveLength(2);
      expect(response.body.plugins[0].id).toBe('test-plugin-1');
      expect(response.body.plugins[1].id).toBe('test-plugin-2');
    });
    
    test('should deny access to non-admin users', async () => {
      const response = await request(app)
        .get('/api/plugins')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
    
    test('should deny access to unauthenticated requests', async () => {
      const response = await request(app).get('/api/plugins');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/plugins/:id', () => {
    test('should return plugin details for existing plugin', async () => {
      const response = await request(app)
        .get('/api/plugins/test-plugin-1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.plugin).toBeDefined();
      expect(response.body.plugin.id).toBe('test-plugin-1');
      expect(response.body.plugin.manifest.name).toBe('Test Plugin 1');
    });
    
    test('should return 404 for non-existent plugin', async () => {
      // Mock getPluginInfo to return null for non-existent plugin
      app.locals.pluginSystem.registry.getPluginInfo.mockResolvedValueOnce(null);
      
      const response = await request(app)
        .get('/api/plugins/non-existent')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/plugins/install', () => {
    test('should install plugin from path', async () => {
      const response = await request(app)
        .post('/api/plugins/install')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ pluginPath: '/path/to/plugin' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.plugin).toBeDefined();
      expect(response.body.plugin.id).toBe('new-plugin');
      expect(app.locals.pluginSystem.manager.installPlugin).toHaveBeenCalledWith('/path/to/plugin');
    });
    
    test('should reject install request without pluginPath', async () => {
      const response = await request(app)
        .post('/api/plugins/install')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
    test('should handle installation errors', async () => {
      // Mock installation error
      app.locals.pluginSystem.manager.installPlugin.mockRejectedValueOnce(
        new Error('Installation failed')
      );
      
      const response = await request(app)
        .post('/api/plugins/install')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ pluginPath: '/path/to/plugin' });
      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Installation failed');
    });
  });
  
  describe('POST /api/plugins/:id/uninstall', () => {
    test('should uninstall plugin', async () => {
      const response = await request(app)
        .post('/api/plugins/test-plugin-1/uninstall')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(app.locals.pluginSystem.manager.uninstallPlugin).toHaveBeenCalledWith('test-plugin-1');
    });
    
    test('should handle uninstallation errors', async () => {
      // Mock uninstallation error
      app.locals.pluginSystem.manager.uninstallPlugin.mockRejectedValueOnce(
        new Error('Uninstallation failed')
      );
      
      const response = await request(app)
        .post('/api/plugins/test-plugin-1/uninstall')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Uninstallation failed');
    });
  });
  
  describe('POST /api/plugins/:id/activate', () => {
    test('should activate plugin', async () => {
      const response = await request(app)
        .post('/api/plugins/test-plugin-1/activate')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(app.locals.pluginSystem.manager.activatePlugin).toHaveBeenCalledWith('test-plugin-1');
    });
  });
  
  describe('POST /api/plugins/:id/deactivate', () => {
    test('should deactivate plugin', async () => {
      const response = await request(app)
        .post('/api/plugins/test-plugin-1/deactivate')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(app.locals.pluginSystem.manager.deactivatePlugin).toHaveBeenCalledWith('test-plugin-1');
    });
  });
  
  describe('GET /api/plugins/:id/config', () => {
    test('should return plugin configuration', async () => {
      const response = await request(app)
        .get('/api/plugins/test-plugin-1/config')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.config).toBeDefined();
      expect(response.body.config.setting1).toBe('value1');
      expect(response.body.config.setting2).toBe('value2');
    });
  });
  
  describe('POST /api/plugins/:id/config', () => {
    test('should update plugin configuration', async () => {
      const newConfig = {
        setting1: 'new-value1',
        setting2: 'new-value2',
        setting3: 'new-value3'
      };
      
      const response = await request(app)
        .post('/api/plugins/test-plugin-1/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ config: newConfig });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(app.locals.pluginSystem.registry.savePluginSettings).toHaveBeenCalledWith(
        'test-plugin-1',
        newConfig
      );
    });
    
    test('should reject update without config', async () => {
      const response = await request(app)
        .post('/api/plugins/test-plugin-1/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/plugins/reload', () => {
    test('should reload all plugins', async () => {
      const response = await request(app)
        .post('/api/plugins/reload')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(app.locals.pluginSystem.manager.reloadPlugins).toHaveBeenCalled();
    });
  });
});