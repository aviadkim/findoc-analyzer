/**
 * Cache API Routes
 * 
 * Endpoints for managing the document processing cache.
 */

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../../utils/logger');
const authMiddleware = require('../../middleware/authMiddleware');

// Path to Python cache manager script
const cacheManagerScript = path.resolve(__dirname, '../../services/cache/cache_manager.py');

// Load cache settings from config
const config = require('../../config');
const defaultCacheDir = path.resolve(__dirname, '../../../cache');

// Create cache directory if it doesn't exist
const cacheDir = config.cache?.cacheDir || defaultCacheDir;
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

/**
 * Helper function to execute Python cache management commands
 * @param {string} command - Command to execute
 * @param {Object} params - Parameters for the command
 * @returns {Promise<Object>} - Command result
 */
const executeCacheCommand = async (command, params = {}) => {
  return new Promise((resolve, reject) => {
    // Check if cache manager script exists
    if (!fs.existsSync(cacheManagerScript)) {
      return reject(new Error(`Cache manager script not found: ${cacheManagerScript}`));
    }
    
    // Prepare arguments
    const args = [
      cacheManagerScript,
      '--command', command,
      '--cache-dir', cacheDir
    ];
    
    // Add any additional parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        args.push(`--${key}`, String(value));
      }
    });
    
    // Execute Python script
    const pythonProcess = spawn('python3', args);
    
    let stdoutData = '';
    let stderrData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
      logger.warn(`Cache command stderr: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        logger.error(`Cache command failed with code ${code}: ${stderrData}`);
        return reject(new Error(`Cache command failed: ${stderrData}`));
      }
      
      try {
        const result = JSON.parse(stdoutData);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse cache command result: ${error.message}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      logger.error(`Cache command error: ${error.message}`);
      reject(new Error(`Cache command error: ${error.message}`));
    });
  });
};

/**
 * @route GET /api/cache/stats
 * @desc Get cache statistics
 * @access Private (Admin)
 */
router.get('/stats', authMiddleware.isAdmin, async (req, res) => {
  try {
    const stats = await executeCacheCommand('stats');
    res.json(stats);
  } catch (error) {
    logger.error(`Error getting cache stats: ${error.message}`);
    res.status(500).json({ message: 'Failed to get cache statistics', error: error.message });
  }
});

/**
 * @route GET /api/cache/info
 * @desc Get basic cache information
 * @access Private
 */
router.get('/info', authMiddleware.isAuthenticated, async (req, res) => {
  try {
    // For regular users, only show their tenant's cache info
    const tenant_id = req.user.tenant_id;
    const stats = await executeCacheCommand('tenant-stats', { tenant_id });
    res.json(stats);
  } catch (error) {
    logger.error(`Error getting tenant cache stats: ${error.message}`);
    res.status(500).json({ message: 'Failed to get cache information', error: error.message });
  }
});

/**
 * @route POST /api/cache/clear
 * @desc Clear expired cache entries
 * @access Private (Admin)
 */
router.post('/clear', authMiddleware.isAdmin, async (req, res) => {
  try {
    const result = await executeCacheCommand('clear-expired');
    res.json(result);
  } catch (error) {
    logger.error(`Error clearing expired cache: ${error.message}`);
    res.status(500).json({ message: 'Failed to clear expired cache entries', error: error.message });
  }
});

/**
 * @route DELETE /api/cache/:fingerprint
 * @desc Invalidate a specific cache entry
 * @access Private
 */
router.delete('/:fingerprint', authMiddleware.isAuthenticated, async (req, res) => {
  try {
    const { fingerprint } = req.params;
    const tenant_id = req.user.tenant_id;
    
    // Regular users can only invalidate their tenant's cache
    const result = await executeCacheCommand('invalidate', { fingerprint, tenant_id });
    
    if (result.invalidated) {
      res.json({ message: 'Cache entry invalidated successfully' });
    } else {
      res.status(404).json({ message: 'Cache entry not found' });
    }
  } catch (error) {
    logger.error(`Error invalidating cache entry: ${error.message}`);
    res.status(500).json({ message: 'Failed to invalidate cache entry', error: error.message });
  }
});

/**
 * @route DELETE /api/cache/tenant/:tenant_id
 * @desc Clear all cache entries for a specific tenant
 * @access Private (Admin)
 */
router.delete('/tenant/:tenant_id', authMiddleware.isAdmin, async (req, res) => {
  try {
    const { tenant_id } = req.params;
    
    const result = await executeCacheCommand('clear-tenant', { tenant_id });
    res.json(result);
  } catch (error) {
    logger.error(`Error clearing tenant cache: ${error.message}`);
    res.status(500).json({ message: 'Failed to clear tenant cache', error: error.message });
  }
});

/**
 * @route DELETE /api/cache
 * @desc Clear all cache entries (admin only)
 * @access Private (Admin)
 */
router.delete('/', authMiddleware.isAdmin, async (req, res) => {
  try {
    const result = await executeCacheCommand('clear-all');
    res.json(result);
  } catch (error) {
    logger.error(`Error clearing all cache: ${error.message}`);
    res.status(500).json({ message: 'Failed to clear all cache entries', error: error.message });
  }
});

module.exports = router;