/**
 * Integration tests for server
 */

const request = require('supertest');
const express = require('express');
const path = require('path');
const cors = require('cors');
const { errorHandler } = require('../../src/api/middleware/errorMiddleware');

// Create a test app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FinDoc Analyzer API is running',
    timestamp: new Date().toISOString()
  });
});

// Error route for testing
app.get('/api/error', (req, res, next) => {
  next(new Error('Test error'));
});

// Error handler middleware
app.use(errorHandler);

describe('Server Integration Tests', () => {
  test('should return health status', async () => {
    const response = await request(app)
      .get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.message).toBe('FinDoc Analyzer API is running');
    expect(response.body.timestamp).toBeDefined();
  });
  
  test('should handle errors correctly', async () => {
    const response = await request(app)
      .get('/api/error');
    
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Test error');
  });
  
  test('should return 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/api/non-existent');
    
    expect(response.status).toBe(404);
  });
});
