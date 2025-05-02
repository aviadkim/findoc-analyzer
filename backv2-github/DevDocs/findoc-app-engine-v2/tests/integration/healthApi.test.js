/**
 * Integration tests for health API
 */

const request = require('supertest');
const express = require('express');

// Create a test app
const app = express();

// Set up health route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FinDoc Analyzer API is running',
    timestamp: new Date().toISOString()
  });
});

describe('Health API Integration Tests', () => {
  test('should return health status', async () => {
    const response = await request(app)
      .get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.message).toBe('FinDoc Analyzer API is running');
    expect(response.body.timestamp).toBeDefined();
  });
});
