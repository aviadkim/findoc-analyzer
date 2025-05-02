/**
 * Unit tests for middleware
 */

const { errorHandler } = require('../../src/api/middleware/errorMiddleware');
const { authMiddleware, adminMiddleware } = require('../../src/api/middleware/authMiddleware');

// Mock auth controller
jest.mock('../../src/api/controllers/authController', () => ({
  validateToken: jest.fn().mockImplementation((token) => {
    if (token === 'valid-token') {
      return {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      };
    } else if (token === 'user-token') {
      return {
        id: '2',
        name: 'Test User',
        email: 'user@example.com',
        role: 'user'
      };
    } else {
      return null;
    }
  })
}));

describe('Middleware', () => {
  describe('errorHandler', () => {
    let req, res, next;
    
    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
      
      // Mock request, response, and next
      req = {};
      
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        statusCode: 200,
        headersSent: false
      };
      
      next = jest.fn();
    });
    
    test('should handle error correctly', () => {
      const error = new Error('Test error');
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Test error'
      }));
    });
    
    test('should use existing status code if not 200', () => {
      const error = new Error('Test error');
      res.statusCode = 400;
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Test error'
      }));
    });
    
    test('should call next if headers already sent', () => {
      const error = new Error('Test error');
      res.headersSent = true;
      
      errorHandler(error, req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
  
  describe('authMiddleware', () => {
    let req, res, next;
    
    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
      
      // Mock request, response, and next
      req = {
        headers: {
          authorization: 'Bearer valid-token'
        }
      };
      
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      next = jest.fn();
    });
    
    test('should authenticate user with valid token', () => {
      authMiddleware(req, res, next);
      
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('1');
      expect(req.user.name).toBe('Admin User');
      expect(req.user.email).toBe('admin@example.com');
      expect(req.user.role).toBe('admin');
      expect(next).toHaveBeenCalled();
    });
    
    test('should return error with invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Invalid or expired token'
      }));
      expect(next).not.toHaveBeenCalled();
    });
    
    test('should return error with missing token', () => {
      req.headers.authorization = undefined;
      
      authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'No token provided'
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('adminMiddleware', () => {
    let req, res, next;
    
    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
      
      // Mock request, response, and next
      req = {
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        }
      };
      
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      next = jest.fn();
    });
    
    test('should allow admin user', () => {
      adminMiddleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    test('should return error for non-admin user', () => {
      req.user.role = 'user';
      
      adminMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Unauthorized - Admin access required'
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });
});
