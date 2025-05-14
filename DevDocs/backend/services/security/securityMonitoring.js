/**
 * Security Monitoring Service
 * 
 * Provides comprehensive security monitoring and alerting capabilities:
 * - Real-time security event detection
 * - Suspicious activity alerting
 * - Threat detection rules
 * - Security dashboard metrics
 * - Audit log analysis
 */

const logger = require('../../utils/logger');
const auditService = require('./auditService');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { EventEmitter } = require('events');

// Security monitoring settings
const SECURITY_LOG_DIR = process.env.SECURITY_LOG_DIR || path.join(process.cwd(), 'logs', 'security');
const SECURITY_LOG_FILE = process.env.SECURITY_LOG_FILE || 'security-events.log';
const SECURITY_LOG_PATH = path.join(SECURITY_LOG_DIR, SECURITY_LOG_FILE);
const ALERT_THRESHOLD = process.env.SECURITY_ALERT_THRESHOLD || 3;
const MONITORING_INTERVAL = process.env.SECURITY_MONITORING_INTERVAL || 5 * 60 * 1000; // 5 minutes

// Create event emitter for security events
const securityEvents = new EventEmitter();

// Security event types
const SECURITY_EVENT_TYPES = {
  AUTH_FAILURE: 'authentication_failure',
  BRUTE_FORCE: 'brute_force_attempt',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  ACCESS_VIOLATION: 'access_violation',
  DATA_LEAKAGE: 'data_leakage',
  MALWARE_DETECTED: 'malware_detected',
  CONFIGURATION_CHANGE: 'configuration_change',
  PRIVILEGE_ESCALATION: 'privilege_escalation',
  ABNORMAL_BEHAVIOR: 'abnormal_behavior',
  THREAT_INTELLIGENCE: 'threat_intelligence'
};

// Severity levels
const SEVERITY = {
  INFO: 'info',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Store security metrics
let securityMetrics = {
  authFailures: {
    count: 0,
    byIp: {},
    byUsername: {}
  },
  accessViolations: {
    count: 0,
    byIp: {},
    byEndpoint: {}
  },
  suspiciousActivities: {
    count: 0,
    byType: {}
  },
  malwareDetections: {
    count: 0,
    byType: {}
  },
  totalAlerts: 0,
  alertsBySeverity: {
    [SEVERITY.INFO]: 0,
    [SEVERITY.LOW]: 0,
    [SEVERITY.MEDIUM]: 0,
    [SEVERITY.HIGH]: 0,
    [SEVERITY.CRITICAL]: 0
  },
  lastReset: new Date().toISOString()
};

/**
 * Initialize security monitoring
 * @returns {Promise<void>}
 */
async function initSecurityMonitoring() {
  try {
    // Create security log directory if it doesn't exist
    await fs.mkdir(SECURITY_LOG_DIR, { recursive: true });
    
    // Start monitoring interval
    startMonitoringInterval();
    
    // Set up event listeners
    setupEventListeners();
    
    logger.info(`Security monitoring initialized. Log path: ${SECURITY_LOG_PATH}`);
  } catch (error) {
    logger.error(`Error initializing security monitoring: ${error.message}`, error);
    throw error;
  }
}

/**
 * Start the monitoring interval
 */
function startMonitoringInterval() {
  setInterval(async () => {
    try {
      // Analyze recent audit logs
      const recentLogs = await auditService.getAuditLogs({
        startDate: new Date(Date.now() - MONITORING_INTERVAL).toISOString()
      });
      
      // Run security analysis
      analyzeSecurityLogs(recentLogs);
      
      // Check for security threshold violations
      checkSecurityThresholds();
    } catch (error) {
      logger.error(`Error in security monitoring interval: ${error.message}`, error);
    }
  }, MONITORING_INTERVAL);
  
  logger.info(`Security monitoring interval started (${MONITORING_INTERVAL / 1000} seconds)`);
}

/**
 * Set up security event listeners
 */
function setupEventListeners() {
  // Listen for security events
  securityEvents.on('security-event', async (event) => {
    try {
      // Log the security event
      await logSecurityEvent(event);
      
      // Update security metrics
      updateSecurityMetrics(event);
      
      // Check if an alert should be triggered
      if (shouldTriggerAlert(event)) {
        await triggerSecurityAlert(event);
      }
    } catch (error) {
      logger.error(`Error handling security event: ${error.message}`, error);
    }
  });
  
  // Listen for authentication failures
  securityEvents.on('auth-failure', async (data) => {
    const event = {
      type: SECURITY_EVENT_TYPES.AUTH_FAILURE,
      severity: SEVERITY.LOW,
      timestamp: new Date().toISOString(),
      source: 'authentication',
      details: {
        username: data.username,
        ip: data.ip,
        userAgent: data.userAgent,
        reason: data.reason || 'Invalid credentials'
      }
    };
    
    // Emit as security event
    securityEvents.emit('security-event', event);
    
    // Check for brute force attempts
    checkBruteForceAttempts(data);
  });
  
  // Listen for access violations
  securityEvents.on('access-violation', async (data) => {
    const event = {
      type: SECURITY_EVENT_TYPES.ACCESS_VIOLATION,
      severity: SEVERITY.MEDIUM,
      timestamp: new Date().toISOString(),
      source: 'authorization',
      details: {
        userId: data.userId,
        username: data.username,
        resource: data.resource,
        action: data.action,
        ip: data.ip,
        userAgent: data.userAgent,
        reason: data.reason || 'Unauthorized access attempt'
      }
    };
    
    // Emit as security event
    securityEvents.emit('security-event', event);
  });
  
  // Listen for file upload events
  securityEvents.on('file-upload', async (data) => {
    // Check for malware characteristics (very simple check)
    const fileName = data.fileName || '';
    const fileType = data.fileType || '';
    const fileSize = data.fileSize || 0;
    
    const suspiciousFileExtensions = ['.exe', '.dll', '.bat', '.sh', '.js', '.vbs'];
    const hasSuspiciousExt = suspiciousFileExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
    
    if (hasSuspiciousExt || fileType.includes('application/x-msdownload')) {
      const event = {
        type: SECURITY_EVENT_TYPES.MALWARE_DETECTED,
        severity: SEVERITY.HIGH,
        timestamp: new Date().toISOString(),
        source: 'file-upload',
        details: {
          userId: data.userId,
          fileName,
          fileType,
          fileSize,
          ip: data.ip,
          reason: 'Potentially malicious file'
        }
      };
      
      // Emit as security event
      securityEvents.emit('security-event', event);
    }
  });
}

/**
 * Log a security event
 * @param {Object} event - Security event
 * @returns {Promise<void>}
 */
async function logSecurityEvent(event) {
  try {
    // Convert event to string
    const eventString = JSON.stringify(event) + '\n';
    
    // Append to security log file
    await fs.appendFile(SECURITY_LOG_PATH, eventString, 'utf8');
    
    // Log to application logger based on severity
    switch (event.severity) {
      case SEVERITY.CRITICAL:
      case SEVERITY.HIGH:
        logger.error(`SECURITY ALERT: ${event.type}`, { event });
        break;
      case SEVERITY.MEDIUM:
        logger.warn(`Security warning: ${event.type}`, { event });
        break;
      case SEVERITY.LOW:
      case SEVERITY.INFO:
      default:
        logger.info(`Security event: ${event.type}`, { event });
        break;
    }
  } catch (error) {
    logger.error(`Error logging security event: ${error.message}`, error);
    throw error;
  }
}

/**
 * Update security metrics based on event
 * @param {Object} event - Security event
 */
function updateSecurityMetrics(event) {
  // Update total count
  securityMetrics.totalAlerts++;
  
  // Update count by severity
  if (event.severity in securityMetrics.alertsBySeverity) {
    securityMetrics.alertsBySeverity[event.severity]++;
  }
  
  // Update specific metrics based on event type
  switch (event.type) {
    case SECURITY_EVENT_TYPES.AUTH_FAILURE:
      securityMetrics.authFailures.count++;
      
      // Track by IP
      const ip = event.details.ip || 'unknown';
      securityMetrics.authFailures.byIp[ip] = (securityMetrics.authFailures.byIp[ip] || 0) + 1;
      
      // Track by username
      const username = event.details.username || 'unknown';
      securityMetrics.authFailures.byUsername[username] = (securityMetrics.authFailures.byUsername[username] || 0) + 1;
      break;
    
    case SECURITY_EVENT_TYPES.ACCESS_VIOLATION:
      securityMetrics.accessViolations.count++;
      
      // Track by IP
      const violationIp = event.details.ip || 'unknown';
      securityMetrics.accessViolations.byIp[violationIp] = (securityMetrics.accessViolations.byIp[violationIp] || 0) + 1;
      
      // Track by endpoint
      const endpoint = event.details.resource || 'unknown';
      securityMetrics.accessViolations.byEndpoint[endpoint] = (securityMetrics.accessViolations.byEndpoint[endpoint] || 0) + 1;
      break;
    
    case SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY:
    case SECURITY_EVENT_TYPES.ABNORMAL_BEHAVIOR:
      securityMetrics.suspiciousActivities.count++;
      
      // Track by activity type
      const activityType = event.details.activityType || 'unknown';
      securityMetrics.suspiciousActivities.byType[activityType] = (securityMetrics.suspiciousActivities.byType[activityType] || 0) + 1;
      break;
    
    case SECURITY_EVENT_TYPES.MALWARE_DETECTED:
      securityMetrics.malwareDetections.count++;
      
      // Track by malware type
      const malwareType = event.details.malwareType || 'unknown';
      securityMetrics.malwareDetections.byType[malwareType] = (securityMetrics.malwareDetections.byType[malwareType] || 0) + 1;
      break;
  }
}

/**
 * Determine if a security alert should be triggered
 * @param {Object} event - Security event
 * @returns {boolean} - Whether an alert should be triggered
 */
function shouldTriggerAlert(event) {
  // Always alert for high and critical severity events
  if (event.severity === SEVERITY.HIGH || event.severity === SEVERITY.CRITICAL) {
    return true;
  }
  
  // For medium severity, check if we've seen similar events recently
  if (event.severity === SEVERITY.MEDIUM) {
    switch (event.type) {
      case SECURITY_EVENT_TYPES.AUTH_FAILURE:
        const ip = event.details.ip || 'unknown';
        return (securityMetrics.authFailures.byIp[ip] || 0) >= ALERT_THRESHOLD;
      
      case SECURITY_EVENT_TYPES.ACCESS_VIOLATION:
        const violationIp = event.details.ip || 'unknown';
        return (securityMetrics.accessViolations.byIp[violationIp] || 0) >= ALERT_THRESHOLD;
      
      default:
        return false;
    }
  }
  
  // For low and info severity, don't alert
  return false;
}

/**
 * Trigger a security alert
 * @param {Object} event - Security event
 * @returns {Promise<void>}
 */
async function triggerSecurityAlert(event) {
  // Log the alert
  logger.error(`SECURITY ALERT TRIGGERED: ${event.type}`, { event });
  
  // In a real implementation, this could:
  // 1. Send an email to admins
  // 2. Send a text message/SMS
  // 3. Trigger a webhook
  // 4. Create a ticket in a ticketing system
  // 5. Notify a security monitoring service
  
  // For now, just log it
  await fs.appendFile(
    path.join(SECURITY_LOG_DIR, 'security-alerts.log'),
    JSON.stringify({ timestamp: new Date().toISOString(), event }) + '\n',
    'utf8'
  );
  
  // Add system info to the alert for context
  const systemInfo = {
    hostname: os.hostname(),
    platform: os.platform(),
    uptime: os.uptime(),
    loadAvg: os.loadavg(),
    memory: {
      total: os.totalmem(),
      free: os.freemem()
    }
  };
  
  // Audit the alert
  await auditService.logSecurityEvent('security_alert_triggered', {
    event,
    systemInfo
  });
}

/**
 * Check for brute force attempts
 * @param {Object} data - Authentication failure data
 */
function checkBruteForceAttempts(data) {
  const ip = data.ip || 'unknown';
  const failCount = securityMetrics.authFailures.byIp[ip] || 0;
  
  // If we've seen multiple failures from this IP, it might be a brute force attempt
  if (failCount >= ALERT_THRESHOLD) {
    const event = {
      type: SECURITY_EVENT_TYPES.BRUTE_FORCE,
      severity: SEVERITY.HIGH,
      timestamp: new Date().toISOString(),
      source: 'authentication',
      details: {
        ip,
        failCount,
        username: data.username,
        userAgent: data.userAgent,
        reason: `Multiple authentication failures from same IP (${failCount} attempts)`
      }
    };
    
    // Emit as security event
    securityEvents.emit('security-event', event);
  }
}

/**
 * Analyze security logs for patterns
 * @param {Array} logs - Audit logs
 */
function analyzeSecurityLogs(logs) {
  // Group logs by IP
  const ipGroups = {};
  logs.forEach(log => {
    const ip = log.ip || 'unknown';
    if (!ipGroups[ip]) {
      ipGroups[ip] = [];
    }
    ipGroups[ip].push(log);
  });
  
  // Check each IP group for suspicious activity
  Object.entries(ipGroups).forEach(([ip, ipLogs]) => {
    // Too many requests in a short time
    if (ipLogs.length > 100) {
      const event = {
        type: SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        severity: SEVERITY.MEDIUM,
        timestamp: new Date().toISOString(),
        source: 'log-analysis',
        details: {
          ip,
          activityType: 'high_request_volume',
          requestCount: ipLogs.length,
          timespan: MONITORING_INTERVAL,
          reason: `Unusually high request volume from IP (${ipLogs.length} requests)`
        }
      };
      
      securityEvents.emit('security-event', event);
    }
    
    // Accessing multiple sensitive endpoints
    const sensitiveEndpoints = ipLogs.filter(log => 
      log.url && (
        log.url.includes('/api/auth') || 
        log.url.includes('/api/user') || 
        log.url.includes('/api/admin')
      )
    );
    
    if (sensitiveEndpoints.length > 10) {
      const event = {
        type: SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        severity: SEVERITY.MEDIUM,
        timestamp: new Date().toISOString(),
        source: 'log-analysis',
        details: {
          ip,
          activityType: 'sensitive_endpoint_access',
          accessCount: sensitiveEndpoints.length,
          endpoints: sensitiveEndpoints.map(log => log.url),
          reason: `Multiple sensitive endpoint access from IP (${sensitiveEndpoints.length} requests)`
        }
      };
      
      securityEvents.emit('security-event', event);
    }
    
    // Check for sequential URL scanning (potential directory traversal/scanning)
    const urls = ipLogs
      .filter(log => log.url)
      .map(log => log.url)
      .sort();
    
    let sequentialUrlCount = 0;
    for (let i = 1; i < urls.length; i++) {
      if (urls[i].startsWith(urls[i-1]) || 
          urls[i-1].startsWith(urls[i]) ||
          levenshteinDistance(urls[i], urls[i-1]) < 3) {
        sequentialUrlCount++;
      }
    }
    
    if (sequentialUrlCount > 10) {
      const event = {
        type: SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        severity: SEVERITY.MEDIUM,
        timestamp: new Date().toISOString(),
        source: 'log-analysis',
        details: {
          ip,
          activityType: 'sequential_url_access',
          sequentialCount: sequentialUrlCount,
          urls: urls.slice(0, 10), // Include first 10 as example
          reason: `Sequential URL scanning detected from IP (${sequentialUrlCount} sequential requests)`
        }
      };
      
      securityEvents.emit('security-event', event);
    }
  });
}

/**
 * Check security thresholds for potential threats
 */
function checkSecurityThresholds() {
  // Check for high number of overall auth failures
  if (securityMetrics.authFailures.count > 50) {
    const event = {
      type: SECURITY_EVENT_TYPES.ABNORMAL_BEHAVIOR,
      severity: SEVERITY.HIGH,
      timestamp: new Date().toISOString(),
      source: 'security-metrics',
      details: {
        metricType: 'auth_failures',
        count: securityMetrics.authFailures.count,
        timespan: MONITORING_INTERVAL,
        reason: `Unusually high number of authentication failures (${securityMetrics.authFailures.count} failures)`
      }
    };
    
    securityEvents.emit('security-event', event);
  }
  
  // Check for high number of access violations
  if (securityMetrics.accessViolations.count > 20) {
    const event = {
      type: SECURITY_EVENT_TYPES.ABNORMAL_BEHAVIOR,
      severity: SEVERITY.HIGH,
      timestamp: new Date().toISOString(),
      source: 'security-metrics',
      details: {
        metricType: 'access_violations',
        count: securityMetrics.accessViolations.count,
        timespan: MONITORING_INTERVAL,
        reason: `Unusually high number of access violations (${securityMetrics.accessViolations.count} violations)`
      }
    };
    
    securityEvents.emit('security-event', event);
  }
  
  // Check for malware detections
  if (securityMetrics.malwareDetections.count > 0) {
    const event = {
      type: SECURITY_EVENT_TYPES.THREAT_INTELLIGENCE,
      severity: SEVERITY.CRITICAL,
      timestamp: new Date().toISOString(),
      source: 'security-metrics',
      details: {
        metricType: 'malware_detections',
        count: securityMetrics.malwareDetections.count,
        types: Object.keys(securityMetrics.malwareDetections.byType),
        timespan: MONITORING_INTERVAL,
        reason: `Malware detection(s) reported (${securityMetrics.malwareDetections.count} detections)`
      }
    };
    
    securityEvents.emit('security-event', event);
  }
}

/**
 * Get security metrics for the dashboard
 * @returns {Object} - Security metrics
 */
function getSecurityMetrics() {
  return {
    ...securityMetrics,
    timestamp: new Date().toISOString(),
    uptime: os.uptime(),
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      memory: {
        total: os.totalmem(),
        free: os.freemem()
      }
    }
  };
}

/**
 * Reset security metrics
 */
function resetSecurityMetrics() {
  securityMetrics = {
    authFailures: {
      count: 0,
      byIp: {},
      byUsername: {}
    },
    accessViolations: {
      count: 0,
      byIp: {},
      byEndpoint: {}
    },
    suspiciousActivities: {
      count: 0,
      byType: {}
    },
    malwareDetections: {
      count: 0,
      byType: {}
    },
    totalAlerts: 0,
    alertsBySeverity: {
      [SEVERITY.INFO]: 0,
      [SEVERITY.LOW]: 0,
      [SEVERITY.MEDIUM]: 0,
      [SEVERITY.HIGH]: 0,
      [SEVERITY.CRITICAL]: 0
    },
    lastReset: new Date().toISOString()
  };
  
  logger.info('Security metrics reset');
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Levenshtein distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];
  
  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Create a security monitoring middleware
 * @returns {Function} - Express middleware
 */
function securityMonitoringMiddleware() {
  return (req, res, next) => {
    // Check for suspicious query parameters (potential SQLi)
    const suspiciousSQLPatterns = [
      '1=1', '1 = 1', 'OR 1', "' OR '", "' OR 1", "' OR 1=1", 
      'DROP TABLE', 'DELETE FROM', 'INSERT INTO', 'SELECT *', 
      'UNION SELECT', 'INFORMATION_SCHEMA'
    ];
    
    const queryString = JSON.stringify(req.query).toLowerCase();
    const hasSuspiciousSQL = suspiciousSQLPatterns.some(pattern => 
      queryString.includes(pattern.toLowerCase())
    );
    
    if (hasSuspiciousSQL) {
      const event = {
        type: SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        severity: SEVERITY.HIGH,
        timestamp: new Date().toISOString(),
        source: 'request-monitoring',
        details: {
          ip: req.ip,
          url: req.originalUrl,
          method: req.method,
          query: req.query,
          userAgent: req.get('User-Agent'),
          activityType: 'sql_injection_attempt',
          reason: 'Suspicious SQL patterns detected in query parameters'
        }
      };
      
      securityEvents.emit('security-event', event);
    }
    
    // Check for suspicious headers (potential header injection)
    const suspiciousHeaders = [
      'X-Forwarded-Host',
      'X-Original-URL',
      'X-Rewrite-URL',
      'X-Override-URL',
      'X-Original-Host'
    ];
    
    const hasSuspiciousHeaders = suspiciousHeaders.some(header => 
      req.headers[header.toLowerCase()]
    );
    
    if (hasSuspiciousHeaders) {
      const event = {
        type: SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        severity: SEVERITY.MEDIUM,
        timestamp: new Date().toISOString(),
        source: 'request-monitoring',
        details: {
          ip: req.ip,
          url: req.originalUrl,
          method: req.method,
          headers: req.headers,
          userAgent: req.get('User-Agent'),
          activityType: 'header_injection_attempt',
          reason: 'Suspicious headers detected in request'
        }
      };
      
      securityEvents.emit('security-event', event);
    }
    
    // Check for suspicious URL patterns (potential path traversal)
    const suspiciousURLPatterns = [
      '../', '..\\', '%2e%2e', 'etc/passwd', 'etc/shadow', 'proc/',
      'wp-admin', 'wp-login', 'phpMyAdmin', 'admin.php', '.git/'
    ];
    
    const url = req.originalUrl.toLowerCase();
    const hasSuspiciousURL = suspiciousURLPatterns.some(pattern => 
      url.includes(pattern.toLowerCase())
    );
    
    if (hasSuspiciousURL) {
      const event = {
        type: SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        severity: SEVERITY.MEDIUM,
        timestamp: new Date().toISOString(),
        source: 'request-monitoring',
        details: {
          ip: req.ip,
          url: req.originalUrl,
          method: req.method,
          userAgent: req.get('User-Agent'),
          activityType: 'path_traversal_attempt',
          reason: 'Suspicious URL patterns detected in request'
        }
      };
      
      securityEvents.emit('security-event', event);
    }
    
    // Check for suspicious user agent (potential scraper or bot)
    const suspiciousUserAgents = [
      'sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab', 'gobuster', 'dirb',
      'brutus', 'hydra', 'burpsuite', 'curl/', 'wget/', 'python-requests',
      'go-http-client', 'ruby', 'perl', 'scrapy', 'phantomjs'
    ];
    
    const userAgent = (req.get('User-Agent') || '').toLowerCase();
    const hasSuspiciousUserAgent = suspiciousUserAgents.some(agent => 
      userAgent.includes(agent.toLowerCase())
    );
    
    if (hasSuspiciousUserAgent) {
      const event = {
        type: SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        severity: SEVERITY.LOW,
        timestamp: new Date().toISOString(),
        source: 'request-monitoring',
        details: {
          ip: req.ip,
          url: req.originalUrl,
          method: req.method,
          userAgent,
          activityType: 'suspicious_user_agent',
          reason: 'Suspicious user agent detected in request'
        }
      };
      
      securityEvents.emit('security-event', event);
    }
    
    next();
  };
}

module.exports = {
  SECURITY_EVENT_TYPES,
  SEVERITY,
  securityEvents,
  initSecurityMonitoring,
  getSecurityMetrics,
  resetSecurityMetrics,
  securityMonitoringMiddleware
};