/**
 * Auth Controller Tests
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateToken } = require('../../src/api/controllers/authController');

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  };

  return {
    createClient: jest.fn().mockReturnValue(mockSupabase),
  };
});

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';

describe('Auth Controller', () => {
  describe('validateToken', () => {
    it('should return null for invalid token', async () => {
      const result = await validateToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should return user data for valid token', async () => {
      // Create a valid token
      const userData = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      const token = jwt.sign(userData, process.env.JWT_SECRET);

      // Mock Supabase response
      const mockUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        organization: 'Test Org',
        tenant_id: 'test-tenant',
        created_at: new Date().toISOString(),
      };

      const supabase = require('@supabase/supabase-js').createClient();
      supabase.single.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      // Test validateToken
      const result = await validateToken(token);

      // Verify result
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        organization: mockUser.organization,
        tenantId: mockUser.tenant_id,
        createdAt: mockUser.created_at,
      });
    });
  });
});
