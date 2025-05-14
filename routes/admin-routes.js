/**
 * Admin Routes
 * Management routes for administration
 */

const express = require('express');
const router = express.Router();
const logger = require('../services/logger-service');
const errorHandler = require('../services/error-handler-service');
const fs = require('fs');
const path = require('path');

// Mock admin users for testing
const adminUsers = [
  {
    id: 'admin-1',
    email: 'admin@example.com',
    role: 'admin'
  }
];

// Simple admin authentication middleware
function adminAuthMiddleware(req, res, next) {
  const { sessionToken } = req.query;
  
  if (!sessionToken) {
    throw new logger.AuthenticationError('Authentication required');
  }
  
  // For testing, just check if the session token starts with 'admin-'
  if (!sessionToken.startsWith('admin-')) {
    throw new logger.AuthorizationError('Admin access required');
  }
  
  // In a real app, we would verify the session and check if the user is an admin
  req.admin = adminUsers[0];
  next();
}

/**
 * Get system logs
 * @route GET /api/admin/logs
 */
router.get('/logs', errorHandler.asyncHandler(async (req, res) => {
  // This would be authenticated in a real app
  try {
    const { type = 'combined', limit = 100 } = req.query;
    
    // Validate log type
    if (!['error', 'combined', 'access'].includes(type)) {
      throw new logger.ValidationError('Invalid log type', { type });
    }
    
    // Get log contents
    const logContents = await logger.getLogContents(type, parseInt(limit, 10));
    
    res.json({
      success: true,
      data: {
        type,
        limit: parseInt(limit, 10),
        logs: logContents.split('\n')
      }
    });
  } catch (error) {
    logger.error('Error retrieving logs', { error: error.message });
    throw error;
  }
}));

/**
 * Get system status
 * @route GET /api/admin/status
 */
router.get('/status', errorHandler.asyncHandler(async (req, res) => {
  // This would be authenticated in a real app
  try {
    // Get system info
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    // Get log directory size
    const logDir = path.join(__dirname, '..', 'logs');
    let logDirSize = 0;
    
    if (fs.existsSync(logDir)) {
      const files = fs.readdirSync(logDir);
      for (const file of files) {
        const stats = fs.statSync(path.join(logDir, file));
        logDirSize += stats.size;
      }
    }
    
    // Get environment info
    const environment = process.env.NODE_ENV || 'development';
    
    res.json({
      success: true,
      data: {
        uptime,
        uptimeHuman: formatUptime(uptime),
        memoryUsage: {
          rss: formatBytes(memoryUsage.rss),
          heapTotal: formatBytes(memoryUsage.heapTotal),
          heapUsed: formatBytes(memoryUsage.heapUsed),
          external: formatBytes(memoryUsage.external)
        },
        logs: {
          dirSize: formatBytes(logDirSize)
        },
        environment,
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    logger.error('Error retrieving system status', { error: error.message });
    throw error;
  }
}));

/**
 * Format uptime in a human-readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * Format bytes in a human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = router;