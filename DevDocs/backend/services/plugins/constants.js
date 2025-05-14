/**
 * @fileoverview Constants for the plugin system.
 * 
 * This module defines constants used throughout the plugin system,
 * including extension points, permission levels, and resource limits.
 */

/**
 * Available extension points in the application
 * Each extension point has a unique identifier and a description
 */
const EXTENSION_POINTS = {
  // Document processing extension points
  documentProcessor: {
    id: 'documentProcessor',
    description: 'Process uploaded documents and extract data',
    params: ['document', 'options'],
    returns: 'Object - Extracted data from the document'
  },
  
  documentValidator: {
    id: 'documentValidator',
    description: 'Validate documents before processing',
    params: ['document', 'options'],
    returns: 'Object - Validation result with isValid flag and errors if any'
  },
  
  // Data analysis extension points
  dataAnalyzer: {
    id: 'dataAnalyzer',
    description: 'Analyze extracted data from documents',
    params: ['data', 'options'],
    returns: 'Object - Analysis results and insights'
  },
  
  dataEnricher: {
    id: 'dataEnricher',
    description: 'Enrich extracted data with additional information',
    params: ['data', 'options'],
    returns: 'Object - Enriched data'
  },
  
  // Export extension points
  dataExporter: {
    id: 'dataExporter',
    description: 'Export data to different formats',
    params: ['data', 'format', 'options'],
    returns: 'Buffer|string - Exported data in the requested format'
  },
  
  reportGenerator: {
    id: 'reportGenerator',
    description: 'Generate reports from extracted data',
    params: ['data', 'options'],
    returns: 'Object - Generated report'
  },
  
  // UI extension points
  uiExtension: {
    id: 'uiExtension',
    description: 'Extend the UI with custom components',
    params: ['area', 'props'],
    returns: 'Object - UI component definition'
  },
  
  dashboardWidget: {
    id: 'dashboardWidget',
    description: 'Add widgets to the dashboard',
    params: ['props'],
    returns: 'Object - Widget component definition'
  },
  
  dataVisualizer: {
    id: 'dataVisualizer',
    description: 'Visualize data in different ways',
    params: ['data', 'options'],
    returns: 'Object - Visualization component'
  },
  
  // Integration extension points
  apiIntegration: {
    id: 'apiIntegration',
    description: 'Integrate with external APIs',
    params: ['request', 'options'],
    returns: 'Object - Integration result'
  },
  
  notificationHandler: {
    id: 'notificationHandler',
    description: 'Handle notifications and alerts',
    params: ['notification', 'options'],
    returns: 'void'
  },
  
  // Workflow extension points
  workflowAction: {
    id: 'workflowAction',
    description: 'Custom actions for workflows',
    params: ['context', 'options'],
    returns: 'Object - Action result'
  },
  
  workflowTrigger: {
    id: 'workflowTrigger',
    description: 'Custom triggers for workflows',
    params: ['context', 'options'],
    returns: 'Boolean - Whether the trigger condition is met'
  }
};

/**
 * Plugin permission levels and their capabilities
 */
const PERMISSIONS = {
  // Core permissions
  core: {
    name: 'core',
    description: 'Basic plugin functionality',
    capabilities: [
      'register_extension_points',
      'access_plugin_api',
      'access_own_config'
    ]
  },
  
  // File system permissions
  fs_read: {
    name: 'fs_read',
    description: 'Read files from specific directories',
    capabilities: [
      'read_plugin_dir',
      'read_temp_dir',
      'read_uploaded_files'
    ]
  },
  
  fs_write: {
    name: 'fs_write',
    description: 'Write files to specific directories',
    capabilities: [
      'write_plugin_dir',
      'write_temp_dir'
    ]
  },
  
  // Data access permissions
  data_read: {
    name: 'data_read',
    description: 'Read data from the application',
    capabilities: [
      'read_document_data',
      'read_analysis_data',
      'read_export_data'
    ]
  },
  
  data_write: {
    name: 'data_write',
    description: 'Write data to the application',
    capabilities: [
      'write_document_data',
      'write_analysis_data',
      'create_export_data'
    ]
  },
  
  // Network permissions
  network: {
    name: 'network',
    description: 'Access network resources',
    capabilities: [
      'make_http_requests',
      'connect_to_external_services'
    ]
  },
  
  // UI permissions
  ui: {
    name: 'ui',
    description: 'Extend the UI',
    capabilities: [
      'add_ui_components',
      'add_dashboard_widgets',
      'add_visualizations'
    ]
  },
  
  // Admin permissions (restricted)
  admin: {
    name: 'admin',
    description: 'Administrative capabilities (restricted)',
    capabilities: [
      'access_system_config',
      'access_all_data',
      'manage_plugins'
    ]
  }
};

/**
 * Default resource limits for plugins
 */
const DEFAULT_RESOURCE_LIMITS = {
  // Memory limits
  memory: {
    heapSizeMB: 256,
    rss: 512
  },
  
  // CPU limits
  cpu: {
    percentage: 50,
    periodMs: 1000
  },
  
  // Time limits
  timeouts: {
    executionMs: 30000,
    idleMs: 60000
  },
  
  // File system limits
  fs: {
    maxOpenFiles: 20,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxTotalSize: 100 * 1024 * 1024 // 100MB
  },
  
  // Network limits
  network: {
    maxConcurrentConnections: 10,
    maxRequestsPerMinute: 60,
    maxResponseSize: 20 * 1024 * 1024 // 20MB
  }
};

/**
 * Special directory names used in the plugin system
 */
const DIRECTORY_NAMES = {
  PLUGINS_DIR: 'plugins',
  CONFIG_DIR: 'config',
  TEMP_DIR: 'temp',
  REGISTRY_FILE: 'plugin-registry.json',
  SETTINGS_DIR: 'plugin-settings'
};

/**
 * Plugin lifecycle states
 */
const PLUGIN_STATES = {
  REGISTERED: 'registered',
  INSTALLED: 'installed',
  LOADED: 'loaded',
  ACTIVATED: 'activated',
  DEACTIVATED: 'deactivated',
  UNLOADED: 'unloaded',
  UNINSTALLED: 'uninstalled',
  ERROR: 'error'
};

/**
 * Plugin system event types
 */
const PLUGIN_EVENTS = {
  PLUGIN_REGISTERED: 'plugin:registered',
  PLUGIN_INSTALLED: 'plugin:installed',
  PLUGIN_LOADED: 'plugin:loaded',
  PLUGIN_ACTIVATED: 'plugin:activated',
  PLUGIN_DEACTIVATED: 'plugin:deactivated',
  PLUGIN_UNLOADED: 'plugin:unloaded',
  PLUGIN_UNINSTALLED: 'plugin:uninstalled',
  PLUGIN_ERROR: 'plugin:error',
  EXTENSION_POINT_REGISTERED: 'extensionPoint:registered',
  EXTENSION_POINT_EXECUTED: 'extensionPoint:executed',
  EXTENSION_POINT_ERROR: 'extensionPoint:error'
};

// Export all constants
module.exports = {
  EXTENSION_POINTS,
  PERMISSIONS,
  DEFAULT_RESOURCE_LIMITS,
  DIRECTORY_NAMES,
  PLUGIN_STATES,
  PLUGIN_EVENTS
};