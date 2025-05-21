# FinDoc Analyzer Deployment Test Plan

This test plan outlines the verification steps to ensure the FinDoc Analyzer application is correctly deployed and functioning on Google Cloud Run.

## Test Environment

- **Production URL**: https://findoc-analyzer-xxxx-xx.a.run.app
- **Test Date**: May 21, 2025
- **Branch**: ui-modernization-2025

## 1. Basic Connectivity Tests

 < /dev/null |  Test | Method | Endpoint | Expected Result | Status |
|------|--------|----------|----------------|--------|
| Health Check | GET | /api/health | 200 OK with status and timestamp | ⬜ |
| API Keys Status | GET | /api/config/api-keys | 200 OK with API key configuration | ⬜ |
| Static File | GET | /images/logo.png | 200 OK with image content | ⬜ |

## 2. UI Route Tests

| Test | Method | Endpoint | Expected Result | Status |
|------|--------|----------|----------------|--------|
| Home Page | GET | / | 200 OK with Browser MCP Web Surfer | ⬜ |
| Login Page | GET | /login | 200 OK with login form | ⬜ |
| Signup Page | GET | /signup | 200 OK with signup form | ⬜ |
| Upload Page | GET | /upload | 200 OK with upload form | ⬜ |
| Documents Page | GET | /documents | 200 OK with documents list | ⬜ |
| Analytics Page | GET | /analytics | 200 OK with analytics dashboard | ⬜ |
| Document Chat | GET | /document-chat | 200 OK with chat interface | ⬜ |
| Feedback | GET | /feedback | 200 OK with feedback form | ⬜ |
| Comparison | GET | /comparison | 200 OK with comparison interface | ⬜ |
| Admin Dashboard | GET | /admin | 200 OK with admin dashboard | ⬜ |

## 3. Authentication Tests

| Test | Method | Endpoint | Expected Result | Status |
|------|--------|----------|----------------|--------|
| Login (Valid) | POST | /api/auth/login | 200 OK with user data and token | ⬜ |
| Login (Invalid) | POST | /api/auth/login | 401 Unauthorized | ⬜ |
| Get User Profile | GET | /api/auth/me | 200 OK with user data when authenticated | ⬜ |
| Get User Profile (No Auth) | GET | /api/auth/me | 401 Unauthorized without token | ⬜ |

## 4. Document API Tests

| Test | Method | Endpoint | Expected Result | Status |
|------|--------|----------|----------------|--------|
| Get Documents (Auth) | GET | /api/documents | 200 OK with user documents | ⬜ |
| Get Documents (No Auth) | GET | /api/documents | 401 Unauthorized | ⬜ |
| Get Document by ID (Auth) | GET | /api/documents/{id} | 200 OK with document details | ⬜ |
| Document Status | GET | /api/documents/{id}/status | 200 OK with processing status | ⬜ |

## 5. Performance Tests

| Test | Description | Expected Result | Status |
|------|-------------|----------------|--------|
| Load Time | Measure homepage load time | < 2 seconds | ⬜ |
| API Response Time | Measure /api/health response time | < 300ms | ⬜ |
| Concurrent Requests | 10 simultaneous requests to /api/health | All succeed with 200 OK | ⬜ |

## 6. Browser Compatibility Tests

| Browser | Version | Expected Result | Status |
|---------|---------|----------------|--------|
| Chrome | Latest | All UI pages load correctly | ⬜ |
| Firefox | Latest | All UI pages load correctly | ⬜ |
| Safari | Latest | All UI pages load correctly | ⬜ |
| Edge | Latest | All UI pages load correctly | ⬜ |
| Mobile Chrome | Latest | Responsive design works | ⬜ |
| Mobile Safari | Latest | Responsive design works | ⬜ |

## 7. Document Processing Tests

These tests require authentication and file upload.

| Test | Method | Endpoint | Expected Result | Status |
|------|--------|----------|----------------|--------|
| Upload Document | POST | /api/documents/upload | 200 OK with document ID | ⬜ |
| Process Document | POST | /api/documents/{id}/process | 200 OK, starts processing | ⬜ |
| Check Processing Status | GET | /api/documents/{id}/status | 200 OK with progress | ⬜ |

## Test Automation Script

```javascript
const axios = require('axios');

// Configuration
const BASE_URL = 'https://findoc-analyzer-xxxx-xx.a.run.app';
const AUTH_TOKEN = 'demo_token'; // Replace with actual token

async function runTests() {
  console.log('Starting FinDoc Analyzer Deployment Tests...');
  
  // Basic connectivity tests
  await testEndpoint('GET', '/api/health', undefined, 200);
  await testEndpoint('GET', '/api/config/api-keys', undefined, 200);
  
  // UI routes tests
  await testEndpoint('GET', '/', undefined, 200);
  await testEndpoint('GET', '/login', undefined, 200);
  await testEndpoint('GET', '/upload', undefined, 200);
  await testEndpoint('GET', '/documents', undefined, 200);
  await testEndpoint('GET', '/document-chat', undefined, 200);
  await testEndpoint('GET', '/analytics', undefined, 200);
  
  // Authentication tests
  await testEndpoint('POST', '/api/auth/login', { email: 'demo@example.com', password: 'password' }, 200);
  await testEndpoint('POST', '/api/auth/login', { email: 'wrong@example.com', password: 'wrongpass' }, 401);
  
  // Document API tests (authenticated)
  await testEndpoint('GET', '/api/documents', undefined, 200, true);
  
  console.log('Tests completed\!');
}

async function testEndpoint(method, path, data, expectedStatus, requireAuth = false) {
  try {
    const headers = {};
    if (requireAuth) {
      headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    }
    
    const response = await axios({
      method,
      url: `${BASE_URL}${path}`,
      data,
      headers,
      validateStatus: () => true
    });
    
    const passed = response.status === expectedStatus;
    
    console.log(`${passed ? '✅' : '❌'} ${method} ${path} - Expected: ${expectedStatus}, Got: ${response.status}`);
    
    return passed;
  } catch (error) {
    console.error(`❌ Error testing ${method} ${path}:`, error.message);
    return false;
  }
}

runTests();
```

## Manual Testing Steps

1. Open the application URL in a browser
2. Navigate to each page in the UI routes section
3. Attempt to log in with the demo credentials
4. Upload a test PDF document
5. Process the document and check the results
6. Test the document chat functionality
7. Export document analysis results

## Reporting Issues

Report any deployment issues in GitHub with the following information:
- URL where the issue occurred
- Steps to reproduce
- Expected vs. actual behavior
- Browser/device information
- Screenshots if applicable
