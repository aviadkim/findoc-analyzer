/**
 * @fileoverview Plugin SDK for the FinDoc Analyzer application.
 * 
 * This module provides the core SDK classes and utilities for developing
 * plugins for the FinDoc Analyzer. It includes base classes for different
 * types of plugins, interfaces for extension points, and utility functions
 * for common plugin operations.
 */

const path = require('path');
const EventEmitter = require('events');
const semver = require('semver');
const { createLogger } = require('../../utils/logger');

// Import extension point definitions
const { EXTENSION_POINTS } = require('./constants');

const logger = createLogger('PluginSDK');

/**
 * Base class for all plugins
 */
class BasePlugin {
  /**
   * Creates a new plugin instance
   * 
   * @param {Object} context - The plugin context provided by the plugin manager
   * @param {Object} options - Plugin-specific options
   */
  constructor(context, options = {}) {
    if (!context) {
      throw new Error('Plugin context is required');
    }
    
    this.context = context;
    this.options = options;
    this.id = context.id;
    this.name = context.manifest.name;
    this.version = context.manifest.version;
    this.logger = createLogger(`Plugin:${this.id}`);
    this.initialized = false;
    this.extensionPoints = [];
  }
  
  /**
   * Initialize the plugin
   * Must be implemented by subclasses
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      this.logger.warn('Plugin already initialized');
      return;
    }
    
    this.logger.info(`Initializing plugin ${this.name} v${this.version}`);
    this.initialized = true;
  }
  
  /**
   * Clean up resources when plugin is unloaded
   * 
   * @returns {Promise<void>}
   */
  async teardown() {
    this.logger.info(`Tearing down plugin ${this.name}`);
    this.initialized = false;
  }
  
  /**
   * Register a handler for an extension point
   * 
   * @param {string} extensionPoint - The extension point identifier
   * @param {Function} handler - The handler function
   * @throws {Error} If the extension point is invalid
   */
  registerExtensionPoint(extensionPoint, handler) {
    if (!EXTENSION_POINTS[extensionPoint]) {
      throw new Error(`Invalid extension point: ${extensionPoint}`);
    }
    
    if (typeof handler !== 'function') {
      throw new Error('Extension point handler must be a function');
    }
    
    this.extensionPoints.push({ extensionPoint, handler });
    this.logger.debug(`Registered handler for extension point: ${extensionPoint}`);
    
    // Notify plugin manager about the extension point registration
    this.context.registerExtensionPoint(extensionPoint, handler);
  }
  
  /**
   * Get the plugin's configuration
   * 
   * @returns {Object} The plugin configuration
   */
  getConfig() {
    return this.context.getConfig();
  }
  
  /**
   * Save the plugin's configuration
   * 
   * @param {Object} config - The configuration to save
   * @returns {Promise<void>}
   */
  async saveConfig(config) {
    return this.context.saveConfig(config);
  }
  
  /**
   * Log a message with the plugin's logger
   * 
   * @param {string} level - The log level (debug, info, warn, error)
   * @param {string} message - The message to log
   * @param {Object} [meta] - Additional metadata to log
   */
  log(level, message, meta) {
    if (!['debug', 'info', 'warn', 'error'].includes(level)) {
      level = 'info';
    }
    
    this.logger[level](message, meta);
  }
}

/**
 * Document processor plugin - processes and extracts data from documents
 */
class DocumentProcessorPlugin extends BasePlugin {
  /**
   * Creates a new document processor plugin
   * 
   * @param {Object} context - The plugin context
   * @param {Object} options - Plugin-specific options
   */
  constructor(context, options) {
    super(context, options);
    this.supportedFileTypes = options.supportedFileTypes || [];
  }
  
  /**
   * Initialize the document processor plugin
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    await super.initialize();
    
    // Register document processor extension point
    this.registerExtensionPoint('documentProcessor', this.processDocument.bind(this));
  }
  
  /**
   * Process a document
   * Must be implemented by subclasses
   * 
   * @param {Object} document - The document to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} The processing result
   */
  async processDocument(document, options) {
    throw new Error('processDocument must be implemented by subclass');
  }
  
  /**
   * Check if this processor can handle the given file type
   * 
   * @param {string} fileType - The file type/extension
   * @returns {boolean} True if the processor can handle the file type
   */
  canProcessFileType(fileType) {
    if (!fileType) return false;
    
    // Normalize file type (remove leading dot, lowercase)
    const normalizedType = fileType.startsWith('.') 
      ? fileType.substring(1).toLowerCase() 
      : fileType.toLowerCase();
    
    return this.supportedFileTypes.some(type => 
      type.toLowerCase() === normalizedType
    );
  }
}

/**
 * Data analyzer plugin - analyzes extracted data
 */
class DataAnalyzerPlugin extends BasePlugin {
  /**
   * Creates a new data analyzer plugin
   * 
   * @param {Object} context - The plugin context
   * @param {Object} options - Plugin-specific options
   */
  constructor(context, options) {
    super(context, options);
    this.supportedDataTypes = options.supportedDataTypes || [];
  }
  
  /**
   * Initialize the data analyzer plugin
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    await super.initialize();
    
    // Register data analyzer extension point
    this.registerExtensionPoint('dataAnalyzer', this.analyzeData.bind(this));
  }
  
  /**
   * Analyze data
   * Must be implemented by subclasses
   * 
   * @param {Object} data - The data to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} The analysis result
   */
  async analyzeData(data, options) {
    throw new Error('analyzeData must be implemented by subclass');
  }
  
  /**
   * Check if this analyzer can handle the given data type
   * 
   * @param {string} dataType - The data type
   * @returns {boolean} True if the analyzer can handle the data type
   */
  canAnalyzeDataType(dataType) {
    if (!dataType) return false;
    
    return this.supportedDataTypes.some(type => 
      type.toLowerCase() === dataType.toLowerCase()
    );
  }
}

/**
 * Data exporter plugin - exports data to different formats
 */
class DataExporterPlugin extends BasePlugin {
  /**
   * Creates a new data exporter plugin
   * 
   * @param {Object} context - The plugin context
   * @param {Object} options - Plugin-specific options
   */
  constructor(context, options) {
    super(context, options);
    this.supportedExportFormats = options.supportedExportFormats || [];
  }
  
  /**
   * Initialize the data exporter plugin
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    await super.initialize();
    
    // Register data exporter extension point
    this.registerExtensionPoint('dataExporter', this.exportData.bind(this));
  }
  
  /**
   * Export data to a specific format
   * Must be implemented by subclasses
   * 
   * @param {Object} data - The data to export
   * @param {string} format - The format to export to
   * @param {Object} options - Export options
   * @returns {Promise<Buffer|string>} The exported data
   */
  async exportData(data, format, options) {
    throw new Error('exportData must be implemented by subclass');
  }
  
  /**
   * Check if this exporter can handle the given export format
   * 
   * @param {string} format - The export format
   * @returns {boolean} True if the exporter can handle the format
   */
  canExportFormat(format) {
    if (!format) return false;
    
    return this.supportedExportFormats.some(f => 
      f.toLowerCase() === format.toLowerCase()
    );
  }
}

/**
 * UI extension plugin - extends the UI with custom components
 */
class UIExtensionPlugin extends BasePlugin {
  /**
   * Creates a new UI extension plugin
   * 
   * @param {Object} context - The plugin context
   * @param {Object} options - Plugin-specific options
   */
  constructor(context, options) {
    super(context, options);
    this.extensionAreas = options.extensionAreas || [];
  }
  
  /**
   * Initialize the UI extension plugin
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    await super.initialize();
    
    // Register UI extension points
    this.registerExtensionPoint('uiExtension', this.getUIExtension.bind(this));
  }
  
  /**
   * Get UI extension components for a specific area
   * Must be implemented by subclasses
   * 
   * @param {string} area - The UI area to extend
   * @param {Object} props - Props to pass to the component
   * @returns {Promise<Object>} The UI extension component definition
   */
  async getUIExtension(area, props) {
    throw new Error('getUIExtension must be implemented by subclass');
  }
  
  /**
   * Check if this plugin extends a specific UI area
   * 
   * @param {string} area - The UI area
   * @returns {boolean} True if the plugin extends the area
   */
  extendsArea(area) {
    if (!area) return false;
    
    return this.extensionAreas.some(a => 
      a.toLowerCase() === area.toLowerCase()
    );
  }
}

/**
 * Utility functions for plugin development
 */
const PluginUtils = {
  /**
   * Check if a version satisfies a version range
   * 
   * @param {string} version - The version to check
   * @param {string} range - The version range
   * @returns {boolean} True if the version satisfies the range
   */
  checkVersion(version, range) {
    try {
      return semver.satisfies(version, range);
    } catch (error) {
      logger.error('Version check error:', error);
      return false;
    }
  },
  
  /**
   * Create a plugin manifest object
   * 
   * @param {Object} options - Manifest options
   * @returns {Object} The manifest object
   */
  createManifest(options) {
    const required = ['name', 'version', 'description', 'main'];
    
    for (const field of required) {
      if (!options[field]) {
        throw new Error(`Missing required manifest field: ${field}`);
      }
    }
    
    return {
      name: options.name,
      version: options.version,
      description: options.description,
      main: options.main,
      author: options.author || '',
      repository: options.repository || '',
      license: options.license || '',
      engines: {
        finDocAnalyzer: options.finDocVersion || '>=1.0.0'
      },
      permissions: options.permissions || [],
      dependencies: options.dependencies || {},
      extensionPoints: options.extensionPoints || []
    };
  },
  
  /**
   * Safely access nested properties of an object
   * 
   * @param {Object} obj - The object to access
   * @param {string} path - The property path (e.g., 'a.b.c')
   * @param {*} defaultValue - Default value if the property doesn't exist
   * @returns {*} The property value or the default value
   */
  get(obj, path, defaultValue) {
    if (!obj || !path) return defaultValue;
    
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      
      current = current[part];
    }
    
    return current !== undefined ? current : defaultValue;
  },
  
  /**
   * Create a throttled version of a function
   * 
   * @param {Function} fn - The function to throttle
   * @param {number} limit - The time limit in milliseconds
   * @returns {Function} The throttled function
   */
  throttle(fn, limit) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall < limit) {
        return;
      }
      lastCall = now;
      return fn.apply(this, args);
    };
  }
};

/**
 * Type definitions for TypeScript support
 */
const TypeDefinitions = `
/**
 * Plugin manifest definition
 */
export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  main: string;
  author?: string;
  repository?: string;
  license?: string;
  engines: {
    finDocAnalyzer: string;
  };
  permissions: string[];
  dependencies: Record<string, string>;
  extensionPoints: string[];
}

/**
 * Plugin context provided to plugins
 */
export interface PluginContext {
  id: string;
  manifest: PluginManifest;
  pluginPath: string;
  registerExtensionPoint: (extensionPoint: string, handler: Function) => void;
  getConfig: () => any;
  saveConfig: (config: any) => Promise<void>;
  api: Record<string, any>;
}

/**
 * Document processor plugin interface
 */
export interface DocumentProcessor {
  processDocument: (document: any, options: any) => Promise<any>;
  canProcessFileType: (fileType: string) => boolean;
}

/**
 * Data analyzer plugin interface
 */
export interface DataAnalyzer {
  analyzeData: (data: any, options: any) => Promise<any>;
  canAnalyzeDataType: (dataType: string) => boolean;
}

/**
 * Data exporter plugin interface
 */
export interface DataExporter {
  exportData: (data: any, format: string, options: any) => Promise<Buffer | string>;
  canExportFormat: (format: string) => boolean;
}

/**
 * UI extension plugin interface
 */
export interface UIExtension {
  getUIExtension: (area: string, props: any) => Promise<any>;
  extendsArea: (area: string) => boolean;
}
`;

// Export the SDK components
module.exports = {
  BasePlugin,
  DocumentProcessorPlugin,
  DataAnalyzerPlugin,
  DataExporterPlugin,
  UIExtensionPlugin,
  PluginUtils,
  TypeDefinitions
};