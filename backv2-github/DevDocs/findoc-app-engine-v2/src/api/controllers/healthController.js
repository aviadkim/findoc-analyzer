/**
 * Health Controller
 * 
 * This controller provides health check endpoints for the API.
 */

/**
 * Get health status
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getHealth = (req, res) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    return res.json({
      success: true,
      data: healthData
    });
  } catch (error) {
    console.error('Error in getHealth:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get detailed health status
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getDetailedHealth = (req, res) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB'
      },
      cpu: {
        user: process.cpuUsage().user,
        system: process.cpuUsage().system
      },
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
    
    return res.json({
      success: true,
      data: healthData
    });
  } catch (error) {
    console.error('Error in getDetailedHealth:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getHealth,
  getDetailedHealth
};
