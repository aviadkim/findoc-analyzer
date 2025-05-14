/**
 * @fileoverview Plugin API routes for the FinDoc Analyzer application.
 * 
 * This module provides API routes for managing plugins, including
 * listing, installing, uninstalling, activating, deactivating, and
 * configuring plugins.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { createLogger } = require('../../utils/logger');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { validateApiRequest } = require('../../middleware/validationMiddleware');
const { pluginSystem } = require('../../services/plugins');

const logger = createLogger('PluginAPI');

// Configure multer for plugin uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'plugins');
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.zip');
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Only accept zip files
    if (file.mimetype === 'application/zip' || 
        file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

/**
 * @api {get} /api/plugins List all plugins
 * @apiName ListPlugins
 * @apiGroup Plugins
 * @apiPermission admin
 * 
 * @apiSuccess {Boolean} success Whether the request was successful
 * @apiSuccess {Array} plugins List of plugins
 * 
 * @apiError {Boolean} success false
 * @apiError {String} error Error message
 */
router.get('/', authMiddleware('admin'), async (req, res) => {
  try {
    const plugins = await pluginSystem.registry.listPlugins();
    res.json({ success: true, plugins });
  } catch (error) {
    logger.error('Error listing plugins:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @api {get} /api/plugins/:id Get plugin details
 * @apiName GetPlugin
 * @apiGroup Plugins
 * @apiPermission admin
 * 
 * @apiParam {String} id Plugin ID
 * 
 * @apiSuccess {Boolean} success Whether the request was successful
 * @apiSuccess {Object} plugin Plugin details
 * 
 * @apiError {Boolean} success false
 * @apiError {String} error Error message
 */
router.get('/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const pluginId = req.params.id;
    const plugin = await pluginSystem.registry.getPluginInfo(pluginId);
    
    if (!plugin) {
      return res.status(404).json({
        success: false,
        error: `Plugin ${pluginId} not found`
      });
    }
    
    res.json({ success: true, plugin });
  } catch (error) {
    logger.error(`Error getting plugin ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @api {post} /api/plugins/upload Upload and install a plugin
 * @apiName UploadPlugin
 * @apiGroup Plugins
 * @apiPermission admin
 * 
 * @apiParam {File} plugin Plugin zip file
 * 
 * @apiSuccess {Boolean} success Whether the request was successful
 * @apiSuccess {Object} plugin Installed plugin details
 * 
 * @apiError {Boolean} success false
 * @apiError {String} error Error message
 */
router.post('/upload', 
  authMiddleware('admin'), 
  upload.single('plugin'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No plugin file uploaded'
        });
      }
      
      const pluginPath = req.file.path;
      logger.info(`Installing plugin from ${pluginPath}`);
      
      // Install the plugin
      const plugin = await pluginSystem.manager.installPlugin(pluginPath);
      
      // Clean up the uploaded file
      await fs.unlink(pluginPath);
      
      res.json({ success: true, plugin });
    } catch (error) {
      logger.error('Error uploading and installing plugin:', error);
      
      // Clean up the uploaded file if it exists
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          logger.error('Error deleting uploaded file:', unlinkError);
        }
      }
      
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * @api {post} /api/plugins/install Install a plugin from a path
 * @apiName InstallPlugin
 * @apiGroup Plugins
 * @apiPermission admin
 * 
 * @apiParam {String} pluginPath Path to the plugin directory or zip file
 * 
 * @apiSuccess {Boolean} success Whether the request was successful
 * @apiSuccess {Object} plugin Installed plugin details
 * 
 * @apiError {Boolean} success false
 * @apiError {String} error Error message
 */
router.post('/install', 
  authMiddleware('admin'),
  validateApiRequest({
    body: {
      type: 'object',
      required: ['pluginPath'],
      properties: {
        pluginPath: { type: 'string' }
      }
    }
  }),
  async (req, res) => {
    try {
      const { pluginPath } = req.body;
      logger.info(`Installing plugin from ${pluginPath}`);
      
      const plugin = await pluginSystem.manager.installPlugin(pluginPath);
      res.json({ success: true, plugin });
    } catch (error) {
      logger.error('Error installing plugin:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * @api {post} /api/plugins/:id/uninstall Uninstall a plugin
 * @apiName UninstallPlugin
 * @apiGroup Plugins
 * @apiPermission admin
 * 
 * @apiParam {String} id Plugin ID
 * 
 * @apiSuccess {Boolean} success Whether the request was successful
 * 
 * @apiError {Boolean} success false
 * @apiError {String} error Error message
 */
router.post('/:id/uninstall', 
  authMiddleware('admin'),
  async (req, res) => {
    try {
      const pluginId = req.params.id;
      logger.info(`Uninstalling plugin ${pluginId}`);
      
      await pluginSystem.manager.uninstallPlugin(pluginId);
      res.json({ success: true });
    } catch (error) {
      logger.error(`Error uninstalling plugin ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * @api {post} /api/plugins/:id/activate Activate a plugin
 * @apiName ActivatePlugin
 * @apiGroup Plugins
 * @apiPermission admin
 * 
 * @apiParam {String} id Plugin ID
 * 
 * @apiSuccess {Boolean} success Whether the request was successful
 * 
 * @apiError {Boolean} success false
 * @apiError {String} error Error message
 */
router.post('/:id/activate', 
  authMiddleware('admin'),
  async (req, res) => {
    try {
      const pluginId = req.params.id;
      logger.info(`Activating plugin ${pluginId}`);
      
      await pluginSystem.manager.activatePlugin(pluginId);
      res.json({ success: true });
    } catch (error) {
      logger.error(`Error activating plugin ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * @api {post} /api/plugins/:id/deactivate Deactivate a plugin
 * @apiName DeactivatePlugin
 * @apiGroup Plugins
 * @apiPermission admin
 * 
 * @apiParam {String} id Plugin ID
 * 
 * @apiSuccess {Boolean} success Whether the request was successful
 * 
 * @apiError {Boolean} success false
 * @apiError {String} error Error message
 */
router.post('/:id/deactivate', 
  authMiddleware('admin'),
  async (req, res) => {
    try {
      const pluginId = req.params.id;
      logger.info(`Deactivating plugin ${pluginId}`);
      
      await pluginSystem.manager.deactivatePlugin(pluginId);
      res.json({ success: true });
    } catch (error) {
      logger.error(`Error deactivating plugin ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * @api {get} /api/plugins/:id/config Get plugin configuration
 * @apiName GetPluginConfig
 * @apiGroup Plugins
 * @apiPermission admin
 * 
 * @apiParam {String} id Plugin ID
 * 
 * @apiSuccess {Boolean} success Whether the request was successful
 * @apiSuccess {Object} config Plugin configuration
 * 
 * @apiError {Boolean} success false
 * @apiError {String} error Error message
 */
router.get('/:id/config', 
  authMiddleware('admin'),
  async (req, res) => {
    try {
      const pluginId = req.params.id;
      logger.debug(`Getting config for plugin ${pluginId}`);
      
      const config = await pluginSystem.registry.getPluginSettings(pluginId);
      res.json({ success: true, config });
    } catch (error) {
      logger.error(`Error getting config for plugin ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * @api {post} /api/plugins/:id/config Update plugin configuration
 * @apiName UpdatePluginConfig
 * @apiGroup Plugins
 * @apiPermission admin
 * 
 * @apiParam {String} id Plugin ID
 * @apiParam {Object} config Plugin configuration
 * 
 * @apiSuccess {Boolean} success Whether the request was successful
 * 
 * @apiError {Boolean} success false
 * @apiError {String} error Error message
 */
router.post('/:id/config', 
  authMiddleware('admin'),
  validateApiRequest({
    body: {
      type: 'object',
      required: ['config'],
      properties: {
        config: { type: 'object' }
      }
    }
  }),
  async (req, res) => {
    try {
      const pluginId = req.params.id;
      const { config } = req.body;
      logger.info(`Updating config for plugin ${pluginId}`);
      
      await pluginSystem.registry.savePluginSettings(pluginId, config);
      res.json({ success: true });
    } catch (error) {
      logger.error(`Error updating config for plugin ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * @api {post} /api/plugins/reload Reload all plugins
 * @apiName ReloadPlugins
 * @apiGroup Plugins
 * @apiPermission admin
 * 
 * @apiSuccess {Boolean} success Whether the request was successful
 * 
 * @apiError {Boolean} success false
 * @apiError {String} error Error message
 */
router.post('/reload', 
  authMiddleware('admin'),
  async (req, res) => {
    try {
      logger.info('Reloading all plugins');
      
      await pluginSystem.manager.reloadPlugins();
      res.json({ success: true });
    } catch (error) {
      logger.error('Error reloading plugins:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;