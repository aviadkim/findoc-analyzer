/**
 * Test utilities for backend testing
 */

const path = require('path');
const fs = require('fs').promises;

/**
 * Utilities for working with test fixtures and data
 */
const fixtureUtils = {
  /**
   * Load a JSON fixture file
   * 
   * @param {string} fixtureName - Name of the fixture file without extension
   * @returns {Promise<Object>} - Parsed JSON fixture
   */
  async loadJsonFixture(fixtureName) {
    const fixturePath = path.join(__dirname, '..', 'fixtures', `${fixtureName}.json`);
    const fileContent = await fs.readFile(fixturePath, 'utf8');
    return JSON.parse(fileContent);
  },

  /**
   * Load a text fixture file
   * 
   * @param {string} fixtureName - Name of the fixture file without extension
   * @returns {Promise<string>} - File content as string
   */
  async loadTextFixture(fixtureName) {
    const fixturePath = path.join(__dirname, '..', 'fixtures', `${fixtureName}.txt`);
    return fs.readFile(fixturePath, 'utf8');
  },

  /**
   * Get path to a binary fixture file
   * 
   * @param {string} fixtureName - Name of the fixture file with extension
   * @returns {string} - Full path to the fixture file
   */
  getBinaryFixturePath(fixtureName) {
    return path.join(__dirname, '..', 'fixtures', fixtureName);
  }
};

/**
 * Utilities for mocking dependencies
 */
const mockUtils = {
  /**
   * Create a mock logger
   * 
   * @returns {Object} - Mock logger object
   */
  createMockLogger() {
    return {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
  },

  /**
   * Create a mock database client
   * 
   * @returns {Object} - Mock database client
   */
  createMockDbClient() {
    return {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      connect: jest.fn().mockResolvedValue(true),
      end: jest.fn().mockResolvedValue(true),
      transaction: jest.fn().mockImplementation(async (callback) => {
        const client = {
          query: jest.fn().mockResolvedValue({ rows: [] })
        };
        await callback(client);
        return { success: true };
      })
    };
  },

  /**
   * Create a mock Supabase client
   * 
   * @returns {Object} - Mock Supabase client
   */
  createMockSupabaseClient() {
    const mockStorage = {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' } }),
        download: jest.fn().mockResolvedValue({ data: Buffer.from('test') }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test-url.com' } }),
        list: jest.fn().mockResolvedValue({ data: [] }),
        remove: jest.fn().mockResolvedValue({ data: null })
      })
    };

    return {
      from: jest.fn().mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: [], error: null }),
        update: jest.fn().mockResolvedValue({ data: [], error: null }),
        delete: jest.fn().mockResolvedValue({ data: null, error: null }),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        like: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        containedBy: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockReturnThis(),
        csv: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((callback) => Promise.resolve(callback({ data: [], error: null })))
      })),
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
        signIn: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null })
      },
      storage: mockStorage
    };
  }
};

/**
 * Utilities for testing API endpoints
 */
const apiTestUtils = {
  /**
   * Generate mock JWT token for testing authenticated endpoints
   * 
   * @param {Object} payload - Token payload
   * @returns {string} - Mock JWT token
   */
  generateMockToken(payload = {}) {
    const defaultPayload = {
      sub: 'test-user-id',
      email: 'test@example.com',
      role: 'user',
      ...payload
    };
    
    // This is just a mock token for testing, not a real JWT
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(
      JSON.stringify(defaultPayload)
    ).toString('base64')}.mock-signature`;
  },

  /**
   * Create auth headers with Bearer token
   * 
   * @param {string} token - JWT token
   * @returns {Object} - Headers object with Authorization
   */
  createAuthHeaders(token) {
    return {
      Authorization: `Bearer ${token}`
    };
  }
};

/**
 * Utilities for working with time in tests
 */
const timeUtils = {
  /**
   * Mock current time for testing
   * 
   * @param {string|number|Date} fakeNow - Time to set as current
   * @returns {Function} - Function to restore original Date
   */
  mockTime(fakeNow) {
    const RealDate = global.Date;
    const dateNow = typeof fakeNow === 'string' ? new Date(fakeNow).getTime() : 
                   fakeNow instanceof Date ? fakeNow.getTime() : fakeNow;
    
    class MockDate extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          super(dateNow);
        } else {
          super(...args);
        }
      }
      
      static now() {
        return dateNow;
      }
    }
    
    global.Date = MockDate;
    
    return () => {
      global.Date = RealDate;
    };
  },
  
  /**
   * Wait for a specified time
   * 
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>} - Promise that resolves after specified time
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * Measure execution time of a function
   * 
   * @param {Function} fn - Function to measure
   * @param {...any} args - Arguments to pass to the function
   * @returns {Promise<{result: any, executionTime: number}>} - Result and execution time
   */
  async measureExecutionTime(fn, ...args) {
    const start = process.hrtime.bigint();
    const result = await fn(...args);
    const end = process.hrtime.bigint();
    const executionTime = Number(end - start) / 1e6; // Convert to milliseconds
    
    return { result, executionTime };
  }
};

/**
 * Utilities for testing with plugins
 */
const pluginTestUtils = {
  /**
   * Create a mock plugin manifest
   * 
   * @param {Object} overrides - Fields to override in the default manifest
   * @returns {Object} - Mock plugin manifest
   */
  createMockPluginManifest(overrides = {}) {
    return {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'Test plugin for testing',
      main: 'plugin.js',
      author: 'Test Author',
      repository: 'https://github.com/test/test-plugin',
      license: 'MIT',
      engines: {
        finDocAnalyzer: '>=1.0.0'
      },
      permissions: ['core', 'fs_read', 'fs_write'],
      extensionPoints: ['dataExporter'],
      dependencies: {},
      ...overrides
    };
  },
  
  /**
   * Create a mock plugin instance
   * 
   * @param {string} type - Type of plugin to mock
   * @param {Object} overrides - Methods to override
   * @returns {Object} - Mock plugin instance
   */
  createMockPlugin(type = 'BasePlugin', overrides = {}) {
    const basePlugin = {
      initialize: jest.fn().mockResolvedValue(undefined),
      teardown: jest.fn().mockResolvedValue(undefined),
      getConfig: jest.fn().mockReturnValue({}),
      saveConfig: jest.fn().mockResolvedValue(true),
      log: jest.fn(),
      registerExtensionPoint: jest.fn()
    };
    
    const plugins = {
      BasePlugin: basePlugin,
      
      DocumentProcessorPlugin: {
        ...basePlugin,
        processDocument: jest.fn().mockResolvedValue({}),
        canProcessFileType: jest.fn().mockReturnValue(true),
        supportedFileTypes: ['pdf', 'docx']
      },
      
      DataAnalyzerPlugin: {
        ...basePlugin,
        analyzeData: jest.fn().mockResolvedValue({}),
        canAnalyzeDataType: jest.fn().mockReturnValue(true),
        supportedDataTypes: ['financial', 'portfolio']
      },
      
      DataExporterPlugin: {
        ...basePlugin,
        exportData: jest.fn().mockResolvedValue(Buffer.from('test')),
        canExportFormat: jest.fn().mockReturnValue(true),
        supportedExportFormats: ['json', 'csv', 'xlsx']
      },
      
      UIExtensionPlugin: {
        ...basePlugin,
        getUIExtension: jest.fn().mockResolvedValue({}),
        extendsArea: jest.fn().mockReturnValue(true),
        extensionAreas: ['dashboard', 'settings']
      }
    };
    
    return {
      ...plugins[type],
      ...overrides
    };
  }
};

module.exports = {
  fixtureUtils,
  mockUtils,
  apiTestUtils,
  timeUtils,
  pluginTestUtils
};