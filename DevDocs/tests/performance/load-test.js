/**
 * Performance Testing for FinDoc Analyzer
 * 
 * This script uses k6 to run load and performance tests against the FinDoc Analyzer application.
 * It tests various key user journeys to ensure the application can handle the expected load.
 */

import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Custom metrics
const documentProcessingDuration = new Trend('document_processing_duration');
const apiErrorRate = new Rate('api_errors');
const documentProcessed = new Counter('documents_processed');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = `${BASE_URL}/api`;

// Test data
const users = new SharedArray('users', function() {
  return [
    { username: 'test@example.com', password: 'TestPassword123!' },
    { username: 'user1@example.com', password: 'User1Password!' },
    { username: 'user2@example.com', password: 'User2Password!' }
  ];
});

// Test scenarios
export const options = {
  scenarios: {
    // Common user browsing behavior
    browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },   // Ramp up to 50 users over 1 minute
        { duration: '3m', target: 50 },   // Stay at 50 users for 3 minutes
        { duration: '1m', target: 0 }     // Ramp down to 0 users over 1 minute
      ],
      gracefulRampDown: '30s',
      exec: 'browsing'
    },
    
    // Simulates document processing
    documentProcessing: {
      executor: 'per-vu-iterations',
      vus: 10,
      iterations: 5,
      maxDuration: '5m',
      exec: 'documentProcessing'
    },
    
    // API stress test
    apiStress: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
      maxVUs: 50,
      exec: 'apiEndpoints'
    },
    
    // Dashboard performance
    dashboardPerformance: {
      executor: 'constant-vus',
      vus: 25,
      duration: '2m',
      exec: 'dashboardLoad'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
    'document_processing_duration': ['p(95)<10000'], // 95% of document processing should be below 10s
    'api_errors': ['rate<0.01']       // Less than 1% API errors
  }
};

// Global setup
export function setup() {
  const loginRes = http.post(`${API_BASE_URL}/auth/login`, {
    email: users[0].username,
    password: users[0].password
  });
  
  const token = loginRes.json('token');
  
  return {
    token
  };
}

// Browsing scenario
export function browsing() {
  group('Public pages', function() {
    // Home page
    let res = http.get(BASE_URL);
    check(res, {
      'home page status is 200': (r) => r.status === 200,
      'home page contains logo': (r) => r.body.includes('FinDoc Analyzer')
    });
    sleep(2);
    
    // About page
    res = http.get(`${BASE_URL}/about`);
    check(res, {
      'about page status is 200': (r) => r.status === 200,
      'about page contains expected content': (r) => r.body.includes('Financial Document Analysis')
    });
    sleep(1);
    
    // Features page
    res = http.get(`${BASE_URL}/features`);
    check(res, {
      'features page status is 200': (r) => r.status === 200,
      'features page contains expected content': (r) => r.body.includes('Agent')
    });
    sleep(1);
  });
  
  // Random sleep to simulate user thinking time
  sleep(Math.random() * 3 + 1);
}

// Document processing scenario
export function documentProcessing(data) {
  const token = data.token;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  group('Document Upload and Processing', function() {
    // Get document list first
    let res = http.get(`${API_BASE_URL}/documents`, { headers });
    check(res, {
      'get documents status is 200': (r) => r.status === 200,
      'documents response is json': (r) => r.headers['Content-Type'].includes('application/json')
    });
    
    // Start document processing
    const startTime = new Date();
    res = http.post(`${API_BASE_URL}/documents/process`, {
      documentId: `doc-${uuidv4().substring(0, 8)}`,
      agentPipeline: ['ISINExtractorAgent', 'FinancialTableDetectorAgent', 'FinancialDataAnalyzerAgent']
    }, { headers });
    
    check(res, {
      'process document status is 202': (r) => r.status === 202,
      'process response has job id': (r) => r.json('jobId') !== undefined
    });
    
    const jobId = res.json('jobId');
    
    // Poll for processing status
    let status = 'processing';
    let attempts = 0;
    const maxAttempts = 20;
    
    while (status === 'processing' && attempts < maxAttempts) {
      sleep(1);
      attempts++;
      
      res = http.get(`${API_BASE_URL}/documents/process/status/${jobId}`, { headers });
      if (res.status === 200) {
        status = res.json('status');
      }
    }
    
    const endTime = new Date();
    const duration = endTime - startTime;
    
    documentProcessingDuration.add(duration);
    
    if (status === 'completed') {
      documentProcessed.add(1);
    }
    
    check(res, {
      'document processing completed': (r) => r.json('status') === 'completed'
    });
  });
  
  // Random sleep between iterations
  sleep(Math.random() * 2 + 1);
}

// API endpoints stress test
export function apiEndpoints(data) {
  const token = data.token;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  group('API Endpoints', function() {
    // Random API endpoint selection
    const endpoints = [
      `${API_BASE_URL}/documents`,
      `${API_BASE_URL}/agents`,
      `${API_BASE_URL}/user/profile`,
      `${API_BASE_URL}/analytics/portfolio`
    ];
    
    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    
    const res = http.get(randomEndpoint, { headers });
    
    const success = check(res, {
      'API response status is 200': (r) => r.status === 200,
      'API response is valid json': (r) => r.headers['Content-Type'].includes('application/json')
    });
    
    if (!success) {
      apiErrorRate.add(1);
      console.log(`API Error: ${res.status} - ${res.body.substring(0, 100)}`);
    }
  });
  
  // Minimal sleep to not overwhelm the server
  sleep(0.1);
}

// Dashboard performance test
export function dashboardLoad(data) {
  const token = data.token;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  group('Dashboard Performance', function() {
    // Load dashboard
    let res = http.get(`${BASE_URL}/dashboard`, { headers });
    check(res, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard contains charts': (r) => r.body.includes('chart')
    });
    
    // Load analytics data
    res = http.get(`${API_BASE_URL}/analytics/summary`, { headers });
    check(res, {
      'analytics status is 200': (r) => r.status === 200,
      'analytics is valid json': (r) => r.headers['Content-Type'].includes('application/json')
    });
    
    // Load portfolio data
    res = http.get(`${API_BASE_URL}/analytics/portfolio`, { headers });
    check(res, {
      'portfolio status is 200': (r) => r.status === 200,
      'portfolio is valid json': (r) => r.headers['Content-Type'].includes('application/json')
    });
  });
  
  // Dashboard interaction simulation
  sleep(5);
}

// Generate HTML report after test completion
export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
    "stdout": textSummary(data, { indent: " ", enableColors: true })
  };
}
