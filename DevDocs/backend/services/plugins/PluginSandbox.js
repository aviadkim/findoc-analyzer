/**
 * Plugin Sandbox
 * 
 * Provides a secure sandbox for loading and executing plugins.
 * Isolates plugin code and restricts access to system resources.
 */

const vm = require('vm');
const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const { logger } = require('../../utils/logger');

// Default resource limits
const DEFAULT_RESOURCE_LIMITS = {
  memory: 100 * 1024 * 1024, // 100MB
  cpu: 500, // ms of CPU time
  fileSize: 1024 * 1024, // 1MB file size limit
  requestCount: 10, // Maximum HTTP requests
};

/**
 * Create a secure context for plugin execution
 * @param {Object} pluginInfo - Plugin information
 * @returns {Object} - Sandbox context
 */
function createSandboxContext(pluginInfo) {
  // Create sandbox context
  const sandbox = {
    module: { exports: {} },
    exports: {},
    console: {
      log: (...args) => logger.info(`[Plugin:${pluginInfo.id}]`, ...args),
      info: (...args) => logger.info(`[Plugin:${pluginInfo.id}]`, ...args),
      warn: (...args) => logger.warn(`[Plugin:${pluginInfo.id}]`, ...args),
      error: (...args) => logger.error(`[Plugin:${pluginInfo.id}]`, ...args),
      debug: (...args) => logger.debug(`[Plugin:${pluginInfo.id}]`, ...args)
    },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    setImmediate,
    clearImmediate,
    Buffer,
    Promise,
    process: {
      env: {}, // Empty environment variables
      cwd: () => pluginInfo.path,
      nextTick: process.nextTick
    },
    require: sandboxRequire(pluginInfo), // Custom require function
    JSON,
    Date,
    RegExp,
    Math,
    Number,
    String,
    Object,
    Array,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Error,
    TypeError,
    RangeError,
    SyntaxError,
    URIError,
    EvalError,
    ReferenceError,
    Proxy,
    Symbol,
    Reflect,
    decodeURI,
    decodeURIComponent,
    encodeURI,
    encodeURIComponent,
    escape,
    unescape,
    isFinite,
    isNaN,
    parseFloat,
    parseInt,
    EventEmitter
  };
  
  // Add references to global object
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;
  
  return sandbox;
}

/**
 * Create a sandboxed require function
 * @param {Object} pluginInfo - Plugin information
 * @returns {Function} - Sandboxed require function
 */
function sandboxRequire(pluginInfo) {
  // Set of allowed built-in modules
  const allowedModules = new Set([
    'events',
    'path',
    'util',
    'stream',
    'querystring',
    'url',
    'punycode',
    'string_decoder',
    'buffer',
    'timers',
    'crypto',
    'zlib',
    'assert'
  ]);
  
  // Set of allowed npm modules (commonly needed)
  const allowedNpmModules = new Set([
    'lodash',
    'moment',
    'uuid',
    'axios',
    'semver',
    'chalk',
    'cheerio',
    'qs',
    'mime',
    'joi',
    'jsdom',
    'marked'
  ]);
  
  // Custom require function
  return function(modulePath) {
    try {
      // If this is a relative path, resolve from plugin directory
      if (modulePath.startsWith('.') || modulePath.startsWith('/')) {
        const absolutePath = path.resolve(pluginInfo.path, modulePath);
        
        // Make sure the path is within the plugin directory
        if (!absolutePath.startsWith(pluginInfo.path)) {
          throw new Error(`Access denied: Module path outside plugin directory: ${modulePath}`);
        }
        
        // Check file permissions
        const permissions = pluginInfo.manifest.permissions || [];
        if (!permissions.includes('filesystem')) {
          throw new Error(`Access denied: Plugin does not have filesystem permission`);
        }
        
        // Load the module using the VM
        return loadModuleInSandbox(absolutePath, pluginInfo);
      }
      
      // For built-in modules, allow only those in the allowed set
      if (allowedModules.has(modulePath)) {
        return require(modulePath);
      }
      
      // For npm modules, check if they're in the allowed set
      if (allowedNpmModules.has(modulePath) || modulePath.startsWith('@types/')) {
        return require(modulePath);
      }
      
      // Check if the package is in the plugin's own node_modules directory
      const packagePath = path.join(pluginInfo.path, 'node_modules', modulePath);
      
      try {
        // Check if package exists
        fs.access(packagePath);
        
        // Load from plugin's node_modules
        return require(packagePath);
      } catch (err) {
        // Package not found in plugin's node_modules
      }
      
      // Module not allowed
      throw new Error(`Access denied: Module not in allowed list: ${modulePath}`);
    } catch (error) {
      logger.error(`Error requiring module ${modulePath} in plugin ${pluginInfo.id}:`, error);
      throw error;
    }
  };
}

/**
 * Load a module in the sandbox
 * @param {string} modulePath - Path to the module
 * @param {Object} pluginInfo - Plugin information
 * @returns {Object} - The loaded module exports
 */
async function loadModuleInSandbox(modulePath, pluginInfo) {
  try {
    // Read the module file
    const moduleCode = await fs.readFile(modulePath, 'utf8');
    
    // Create a sandbox context for this module
    const sandbox = createSandboxContext(pluginInfo);
    
    // Set up the filename and dirname in the module
    const filename = modulePath;
    const dirname = path.dirname(modulePath);
    
    sandbox.module.filename = filename;
    sandbox.module.path = dirname;
    sandbox.__filename = filename;
    sandbox.__dirname = dirname;
    
    // Create a context for the VM
    const context = vm.createContext(sandbox);
    
    // Wrap module code in a function (similar to how Node.js does it)
    const wrappedCode = `
      (function(exports, require, module, __filename, __dirname) {
        ${moduleCode}
      })(module.exports, require, module, __filename, __dirname);
      module.exports;
    `;
    
    // Run the code in the context
    const script = new vm.Script(wrappedCode, { filename });
    const result = script.runInContext(context);
    
    return result;
  } catch (error) {
    logger.error(`Error loading module ${modulePath} in sandbox:`, error);
    throw error;
  }
}

/**
 * Create a sandbox for a plugin
 * @param {Object} pluginInfo - Plugin information
 * @returns {Object} - Sandbox object
 */
function createSandbox(pluginInfo) {
  // Set resource limits based on plugin permissions
  const permissions = pluginInfo.manifest.permissions || [];
  const resourceLimits = { ...DEFAULT_RESOURCE_LIMITS };
  
  // Create the sandbox object
  const sandbox = {
    /**
     * Load a module in the sandbox
     * @param {string} modulePath - Path to the module
     * @returns {Promise<Object>} - The loaded module
     */
    async load(modulePath) {
      try {
        logger.debug(`Loading module ${modulePath} in sandbox for plugin ${pluginInfo.id}`);
        
        // Check if module exists
        await fs.access(modulePath);
        
        // Resolve absolute path
        const absolutePath = path.resolve(modulePath);
        
        // Load the module in the sandbox
        const moduleExports = await loadModuleInSandbox(absolutePath, pluginInfo);
        
        return moduleExports;
      } catch (error) {
        logger.error(`Failed to load module ${modulePath} in sandbox:`, error);
        throw error;
      }
    },
    
    /**
     * Execute a function in the sandbox
     * @param {Function} fn - Function to execute
     * @param {Array} args - Arguments to pass to the function
     * @returns {Promise<any>} - Result of the function
     */
    async execute(fn, ...args) {
      try {
        logger.debug(`Executing function in sandbox for plugin ${pluginInfo.id}`);
        
        // Ensure we have a function
        if (typeof fn !== 'function') {
          throw new Error('First argument must be a function');
        }
        
        // Create a sandbox context
        const context = createSandboxContext(pluginInfo);
        
        // Convert function to string and create a new function in the sandbox
        const fnString = fn.toString();
        const fnBody = fnString.substring(fnString.indexOf('{') + 1, fnString.lastIndexOf('}'));
        
        // Create a wrapper that returns the function result
        const wrappedCode = `
          (function() {
            const fn = function(${Object.keys(args).join(',')}) {
              ${fnBody}
            };
            return fn(${Object.keys(args).map(key => `args[${key}]`).join(',')});
          })();
        `;
        
        // Create and run the script
        const script = new vm.Script(wrappedCode, { 
          filename: `plugin-${pluginInfo.id}-execution.js` 
        });
        
        // Set timeout for execution
        const result = await Promise.race([
          Promise.resolve(script.runInContext(context)),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Execution timed out')), resourceLimits.cpu)
          )
        ]);
        
        return result;
      } catch (error) {
        logger.error(`Error executing function in sandbox for plugin ${pluginInfo.id}:`, error);
        throw error;
      }
    },
    
    /**
     * Check if plugin has a permission
     * @param {string} permission - Permission to check
     * @returns {boolean} - Whether the plugin has the permission
     */
    hasPermission(permission) {
      return permissions.includes(permission);
    }
  };
  
  return sandbox;
}

module.exports = {
  createSandbox
};