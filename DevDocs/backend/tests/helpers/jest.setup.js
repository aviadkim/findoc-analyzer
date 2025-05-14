/**
 * Jest setup file for backend testing
 * 
 * This file runs before each test file and is used to set up the testing environment
 */

// Set default timeout for all tests (10 seconds)
jest.setTimeout(10000);

// Suppress console.log during tests unless in debug mode
if (!process.env.DEBUG) {
  global.console.log = jest.fn();
}

// Keep normal behavior for console.error and console.warn
global.console.error = console.error;
global.console.warn = console.warn;

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.API_BASE_URL = 'http://localhost:3001';

// Global teardown
afterAll(async () => {
  // Any global cleanup needed after all tests
  jest.clearAllMocks();
});

// Add global test utilities and helpers
global.createMockRequest = () => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    session: {},
    user: null
  };
};

global.createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    locals: {},
    headersSent: false
  };
  return res;
};

global.createMockNext = () => {
  return jest.fn();
};

// Custom Jest matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  toBeSuccessResponse(received) {
    const pass = 
      received && 
      received.success === true && 
      !received.error;
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a success response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a success response`,
        pass: false,
      };
    }
  },
  toBeErrorResponse(received) {
    const pass = 
      received && 
      received.success === false && 
      received.error;
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be an error response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be an error response`,
        pass: false,
      };
    }
  },
});