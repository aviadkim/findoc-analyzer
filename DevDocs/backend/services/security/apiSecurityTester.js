/**
 * API Security Tester
 * 
 * Utility for testing API security measures:
 * - Validates schema compliance
 * - Tests input sanitization
 * - Simulates attack patterns
 * - Verifies rate limiting
 * - Tests payload size limits
 */

const axios = require('axios');
const { logger } = require('../../utils/logger');

// Common attack patterns for testing
const ATTACK_PATTERNS = {
  SQL_INJECTION: [
    "' OR 1=1 --",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "admin' --",
    "1'; SELECT * FROM users WHERE name LIKE '%"
  ],
  XSS: [
    "<script>alert('XSS')</script>",
    "<img src='x' onerror='alert(1)'>",
    "<svg onload='alert(1)'>",
    "javascript:alert(1)",
    "\"><script>alert(1)</script>"
  ],
  NOSQL_INJECTION: [
    '{"$gt": ""}',
    '{"$ne": null}',
    '{"$where": "function() { return true; }"}',
    '{"$gte": ""}',
    '{"$regex": ".*"}'
  ],
  PATH_TRAVERSAL: [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\cmd.exe",
    "/var/www/html/../../../../etc/passwd",
    "file:///etc/passwd",
    "....//....//....//etc//passwd"
  ],
  COMMAND_INJECTION: [
    "; ls -la",
    "| cat /etc/passwd",
    "`cat /etc/passwd`",
    "$(cat /etc/passwd)",
    "&& cat /etc/passwd"
  ]
};

/**
 * API Security Tester
 */
class ApiSecurityTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || 'http://localhost:3000/api';
    this.testResults = {
      endpointsTested: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      vulnerabilities: [],
      details: {}
    };
  }

  /**
   * Create an axios instance with custom headers
   * @param {Object} headers - Custom headers to include
   * @returns {Object} - Axios instance
   */
  createClient(headers = {}) {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Security-Tester/1.0',
        ...headers
      },
      timeout: 5000
    });
  }

  /**
   * Test schema validation for an endpoint
   * @param {string} endpoint - API endpoint to test
   * @param {Object} validPayload - Valid payload for endpoint
   * @param {Array} invalidPayloads - Array of invalid payloads to test
   * @returns {Object} - Test results
   */
  async testSchemaValidation(endpoint, validPayload, invalidPayloads) {
    const endpointResults = {
      endpoint,
      validationTests: {
        total: 1 + invalidPayloads.length,
        passed: 0,
        failed: 0,
        details: []
      }
    };

    const client = this.createClient();

    // Test valid payload - should succeed
    try {
      const response = await client.post(endpoint, validPayload);
      
      if (response.status >= 200 && response.status < 300) {
        endpointResults.validationTests.passed++;
        endpointResults.validationTests.details.push({
          payload: 'valid',
          success: true,
          status: response.status
        });
      } else {
        endpointResults.validationTests.failed++;
        endpointResults.validationTests.details.push({
          payload: 'valid',
          success: false,
          status: response.status,
          message: 'Valid payload rejected'
        });
      }
    } catch (error) {
      endpointResults.validationTests.failed++;
      endpointResults.validationTests.details.push({
        payload: 'valid',
        success: false,
        status: error.response?.status || 'error',
        message: error.message
      });
    }

    // Test each invalid payload - should fail with 400 status
    for (const [index, payload] of invalidPayloads.entries()) {
      try {
        const response = await client.post(endpoint, payload);
        
        if (response.status === 400) {
          endpointResults.validationTests.passed++;
          endpointResults.validationTests.details.push({
            payload: `invalid-${index}`,
            success: true,
            status: response.status
          });
        } else {
          endpointResults.validationTests.failed++;
          endpointResults.validationTests.details.push({
            payload: `invalid-${index}`,
            success: false,
            status: response.status,
            message: 'Invalid payload accepted'
          });
        }
      } catch (error) {
        if (error.response?.status === 400) {
          endpointResults.validationTests.passed++;
          endpointResults.validationTests.details.push({
            payload: `invalid-${index}`,
            success: true,
            status: error.response.status
          });
        } else {
          endpointResults.validationTests.failed++;
          endpointResults.validationTests.details.push({
            payload: `invalid-${index}`,
            success: false,
            status: error.response?.status || 'error',
            message: error.message
          });
        }
      }
    }

    return endpointResults;
  }

  /**
   * Test input sanitization for an endpoint
   * @param {string} endpoint - API endpoint to test
   * @param {Object} basePayload - Base payload structure
   * @param {Object} injectionMap - Map of payload fields to attack patterns
   * @returns {Object} - Test results
   */
  async testInputSanitization(endpoint, basePayload, injectionMap) {
    const endpointResults = {
      endpoint,
      sanitizationTests: {
        total: 0,
        passed: 0,
        failed: 0,
        details: []
      }
    };

    const client = this.createClient();

    // Test each field with various attack patterns
    for (const [field, attackType] of Object.entries(injectionMap)) {
      const attackPatterns = ATTACK_PATTERNS[attackType] || [];
      endpointResults.sanitizationTests.total += attackPatterns.length;

      for (const pattern of attackPatterns) {
        // Create a payload with the attack pattern in the specified field
        const payload = this.createInjectedPayload(basePayload, field, pattern);
        
        try {
          const response = await client.post(endpoint, payload);
          
          // Check if the response contains the unsanitized attack pattern
          const responseContainsAttack = this.checkResponseForAttackPattern(response.data, pattern);
          
          if (responseContainsAttack) {
            endpointResults.sanitizationTests.failed++;
            endpointResults.sanitizationTests.details.push({
              field,
              pattern,
              success: false,
              status: response.status,
              message: 'Unsanitized attack pattern detected in response'
            });
          } else {
            endpointResults.sanitizationTests.passed++;
            endpointResults.sanitizationTests.details.push({
              field,
              pattern,
              success: true,
              status: response.status
            });
          }
        } catch (error) {
          // 400 status is expected for properly sanitized inputs
          if (error.response?.status === 400) {
            endpointResults.sanitizationTests.passed++;
            endpointResults.sanitizationTests.details.push({
              field,
              pattern,
              success: true,
              status: error.response.status
            });
          } else {
            endpointResults.sanitizationTests.failed++;
            endpointResults.sanitizationTests.details.push({
              field,
              pattern,
              success: false,
              status: error.response?.status || 'error',
              message: error.message
            });
          }
        }
      }
    }

    return endpointResults;
  }

  /**
   * Test rate limiting for an endpoint
   * @param {string} endpoint - API endpoint to test
   * @param {Object} payload - Request payload
   * @param {number} requestCount - Number of requests to send
   * @param {number} expectedLimit - Expected rate limit
   * @returns {Object} - Test results
   */
  async testRateLimiting(endpoint, payload, requestCount, expectedLimit) {
    const endpointResults = {
      endpoint,
      rateLimitTests: {
        requestCount,
        expectedLimit,
        limitTriggered: false,
        limitTriggeredAt: null,
        details: []
      }
    };

    const client = this.createClient();
    let limitTriggered = false;
    let limitTriggeredAt = null;

    // Send multiple requests in quick succession
    for (let i = 0; i < requestCount; i++) {
      try {
        const response = await client.post(endpoint, payload);
        
        endpointResults.rateLimitTests.details.push({
          requestNumber: i + 1,
          status: response.status,
          rateLimit: {
            remaining: response.headers['x-ratelimit-remaining'],
            limit: response.headers['x-ratelimit-limit'],
            reset: response.headers['x-ratelimit-reset']
          }
        });
      } catch (error) {
        if (error.response?.status === 429) {
          limitTriggered = true;
          limitTriggeredAt = i + 1;
          
          endpointResults.rateLimitTests.details.push({
            requestNumber: i + 1,
            status: error.response.status,
            rateLimit: {
              remaining: error.response.headers['x-ratelimit-remaining'],
              limit: error.response.headers['x-ratelimit-limit'],
              reset: error.response.headers['x-ratelimit-reset']
            },
            message: 'Rate limit triggered'
          });
          
          break; // Stop after rate limit is triggered
        } else {
          endpointResults.rateLimitTests.details.push({
            requestNumber: i + 1,
            status: error.response?.status || 'error',
            message: error.message
          });
        }
      }
    }

    endpointResults.rateLimitTests.limitTriggered = limitTriggered;
    endpointResults.rateLimitTests.limitTriggeredAt = limitTriggeredAt;
    
    // Determine if rate limiting is working as expected
    if (expectedLimit && limitTriggeredAt) {
      endpointResults.rateLimitTests.success = 
        limitTriggeredAt >= expectedLimit - 2 && limitTriggeredAt <= expectedLimit + 2;
    } else {
      endpointResults.rateLimitTests.success = false;
    }

    return endpointResults;
  }

  /**
   * Test payload size limits for an endpoint
   * @param {string} endpoint - API endpoint to test
   * @param {Object} basePayload - Base payload structure
   * @param {Array<number>} sizesToTest - Array of sizes to test in bytes
   * @returns {Object} - Test results
   */
  async testPayloadSizeLimits(endpoint, basePayload, sizesToTest) {
    const endpointResults = {
      endpoint,
      payloadSizeTests: {
        total: sizesToTest.length,
        passed: 0,
        failed: 0,
        details: []
      }
    };

    const client = this.createClient();

    // Test each payload size
    for (const size of sizesToTest) {
      // Create a payload of the specified size
      const payload = this.createPayloadOfSize(basePayload, size);
      
      try {
        const response = await client.post(endpoint, payload);
        
        // For very large payloads, we expect a 413 or 400 status
        if (size > 1024 * 1024 && (response.status === 413 || response.status === 400)) {
          endpointResults.payloadSizeTests.passed++;
          endpointResults.payloadSizeTests.details.push({
            size: `${(size / 1024).toFixed(2)} KB`,
            success: true,
            status: response.status,
            message: 'Large payload correctly rejected'
          });
        } 
        // For smaller payloads, we expect acceptance
        else if (size <= 1024 * 1024 && response.status >= 200 && response.status < 300) {
          endpointResults.payloadSizeTests.passed++;
          endpointResults.payloadSizeTests.details.push({
            size: `${(size / 1024).toFixed(2)} KB`,
            success: true,
            status: response.status,
            message: 'Normal payload correctly accepted'
          });
        } 
        // Unexpected response
        else {
          endpointResults.payloadSizeTests.failed++;
          endpointResults.payloadSizeTests.details.push({
            size: `${(size / 1024).toFixed(2)} KB`,
            success: false,
            status: response.status,
            message: size > 1024 * 1024 ? 
              'Large payload incorrectly accepted' : 
              'Normal payload incorrectly rejected'
          });
        }
      } catch (error) {
        // For very large payloads, we expect a 413 or 400 status
        if (size > 1024 * 1024 && 
            (error.response?.status === 413 || error.response?.status === 400)) {
          endpointResults.payloadSizeTests.passed++;
          endpointResults.payloadSizeTests.details.push({
            size: `${(size / 1024).toFixed(2)} KB`,
            success: true,
            status: error.response.status,
            message: 'Large payload correctly rejected'
          });
        } else {
          endpointResults.payloadSizeTests.failed++;
          endpointResults.payloadSizeTests.details.push({
            size: `${(size / 1024).toFixed(2)} KB`,
            success: false,
            status: error.response?.status || 'error',
            message: error.message
          });
        }
      }
    }

    return endpointResults;
  }

  /**
   * Run all security tests for an endpoint
   * @param {string} endpoint - API endpoint to test
   * @param {Object} options - Test options
   * @returns {Object} - Complete test results
   */
  async runEndpointTests(endpoint, options) {
    const {
      validPayload,
      invalidPayloads = [],
      injectionMap = {},
      rateLimitOptions = { requestCount: 20, expectedLimit: 10 },
      payloadSizes = [1024, 10 * 1024, 100 * 1024, 1024 * 1024, 2 * 1024 * 1024]
    } = options;

    const endpointResults = {
      endpoint,
      overallStatus: 'pending',
      tests: {}
    };

    // Run schema validation tests if configured
    if (validPayload && invalidPayloads.length > 0) {
      try {
        const validationResults = await this.testSchemaValidation(
          endpoint, 
          validPayload, 
          invalidPayloads
        );
        endpointResults.tests.validation = validationResults.validationTests;
      } catch (error) {
        logger.error(`Error running validation tests for ${endpoint}:`, error);
        endpointResults.tests.validation = {
          error: error.message,
          stack: error.stack
        };
      }
    }

    // Run input sanitization tests if configured
    if (validPayload && Object.keys(injectionMap).length > 0) {
      try {
        const sanitizationResults = await this.testInputSanitization(
          endpoint,
          validPayload,
          injectionMap
        );
        endpointResults.tests.sanitization = sanitizationResults.sanitizationTests;
      } catch (error) {
        logger.error(`Error running sanitization tests for ${endpoint}:`, error);
        endpointResults.tests.sanitization = {
          error: error.message,
          stack: error.stack
        };
      }
    }

    // Run rate limiting tests if configured
    if (validPayload && rateLimitOptions.requestCount > 0) {
      try {
        const rateLimitResults = await this.testRateLimiting(
          endpoint,
          validPayload,
          rateLimitOptions.requestCount,
          rateLimitOptions.expectedLimit
        );
        endpointResults.tests.rateLimit = rateLimitResults.rateLimitTests;
      } catch (error) {
        logger.error(`Error running rate limit tests for ${endpoint}:`, error);
        endpointResults.tests.rateLimit = {
          error: error.message,
          stack: error.stack
        };
      }
    }

    // Run payload size tests if configured
    if (validPayload && payloadSizes.length > 0) {
      try {
        const payloadSizeResults = await this.testPayloadSizeLimits(
          endpoint,
          validPayload,
          payloadSizes
        );
        endpointResults.tests.payloadSize = payloadSizeResults.payloadSizeTests;
      } catch (error) {
        logger.error(`Error running payload size tests for ${endpoint}:`, error);
        endpointResults.tests.payloadSize = {
          error: error.message,
          stack: error.stack
        };
      }
    }

    // Calculate overall status
    const passRates = [];
    let vulnerabilities = [];

    // Check validation tests
    if (endpointResults.tests.validation && !endpointResults.tests.validation.error) {
      const validation = endpointResults.tests.validation;
      const passRate = validation.passed / validation.total;
      passRates.push(passRate);
      
      if (passRate < 0.7) {
        vulnerabilities.push({
          type: 'schema_validation',
          severity: 'high',
          message: 'Schema validation is ineffective'
        });
      }
    }

    // Check sanitization tests
    if (endpointResults.tests.sanitization && !endpointResults.tests.sanitization.error) {
      const sanitization = endpointResults.tests.sanitization;
      const passRate = sanitization.passed / sanitization.total;
      passRates.push(passRate);
      
      if (passRate < 0.8) {
        vulnerabilities.push({
          type: 'input_sanitization',
          severity: 'critical',
          message: 'Input sanitization is insufficient'
        });
      }
    }

    // Check rate limiting tests
    if (endpointResults.tests.rateLimit && !endpointResults.tests.rateLimit.error) {
      const rateLimit = endpointResults.tests.rateLimit;
      
      if (!rateLimit.limitTriggered) {
        vulnerabilities.push({
          type: 'rate_limiting',
          severity: 'high',
          message: 'Rate limiting is not implemented'
        });
      } else if (!rateLimit.success) {
        vulnerabilities.push({
          type: 'rate_limiting',
          severity: 'medium',
          message: 'Rate limiting threshold is misconfigured'
        });
      }
    }

    // Check payload size tests
    if (endpointResults.tests.payloadSize && !endpointResults.tests.payloadSize.error) {
      const payloadSize = endpointResults.tests.payloadSize;
      const passRate = payloadSize.passed / payloadSize.total;
      passRates.push(passRate);
      
      if (passRate < 0.7) {
        vulnerabilities.push({
          type: 'payload_size',
          severity: 'medium',
          message: 'Payload size limits are not properly enforced'
        });
      }
    }

    // Calculate overall pass rate
    const overallPassRate = passRates.length > 0 
      ? passRates.reduce((sum, rate) => sum + rate, 0) / passRates.length 
      : 0;

    endpointResults.overallPassRate = overallPassRate;
    endpointResults.vulnerabilities = vulnerabilities;
    
    // Determine overall status
    if (overallPassRate >= 0.9) {
      endpointResults.overallStatus = 'secure';
    } else if (overallPassRate >= 0.7) {
      endpointResults.overallStatus = 'moderate';
    } else {
      endpointResults.overallStatus = 'vulnerable';
    }

    return endpointResults;
  }

  /**
   * Create a payload with an injected attack pattern
   * @param {Object} basePayload - Base payload structure
   * @param {string} fieldPath - Path to the field to inject (dot notation)
   * @param {string} attackPattern - Attack pattern to inject
   * @returns {Object} - Modified payload
   */
  createInjectedPayload(basePayload, fieldPath, attackPattern) {
    const payload = JSON.parse(JSON.stringify(basePayload)); // Deep clone
    const fields = fieldPath.split('.');
    
    let current = payload;
    for (let i = 0; i < fields.length - 1; i++) {
      if (!current[fields[i]]) {
        current[fields[i]] = {};
      }
      current = current[fields[i]];
    }
    
    current[fields[fields.length - 1]] = attackPattern;
    return payload;
  }

  /**
   * Check if a response contains an unsanitized attack pattern
   * @param {Object} responseData - Response data
   * @param {string} attackPattern - Attack pattern to check for
   * @returns {boolean} - True if pattern is found
   */
  checkResponseForAttackPattern(responseData, attackPattern) {
    const responseStr = JSON.stringify(responseData);
    return responseStr.includes(attackPattern);
  }

  /**
   * Create a payload of a specific size
   * @param {Object} basePayload - Base payload structure
   * @param {number} targetSize - Target payload size in bytes
   * @returns {Object} - Modified payload
   */
  createPayloadOfSize(basePayload, targetSize) {
    const payload = JSON.parse(JSON.stringify(basePayload)); // Deep clone
    
    // Calculate current payload size
    const currentSize = JSON.stringify(payload).length;
    
    // If we need to add size
    if (currentSize < targetSize) {
      // Add a padding field with random string of appropriate length
      const paddingNeeded = targetSize - currentSize;
      
      // Account for the field name and quotes
      const effectivePaddingNeeded = paddingNeeded - 15; // Approximate for "padding":"..." syntax
      
      payload.padding = 'X'.repeat(Math.max(0, effectivePaddingNeeded));
    }
    
    return payload;
  }

  /**
   * Generate a comprehensive security report
   * @param {Object} results - Test results
   * @returns {string} - HTML report
   */
  generateHtmlReport(results) {
    // HTML report template with CSS styling
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Security Test Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3, h4 {
          color: #2c3e50;
        }
        .summary {
          background-color: #f8f9fa;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 20px;
        }
        .endpoint {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 20px;
        }
        .secure {
          border-left: 5px solid #28a745;
        }
        .moderate {
          border-left: 5px solid #ffc107;
        }
        .vulnerable {
          border-left: 5px solid #dc3545;
        }
        .test-section {
          margin-top: 15px;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 3px;
        }
        .vulnerabilities {
          background-color: #fff3cd;
          padding: 10px;
          border-radius: 3px;
          margin-top: 10px;
        }
        .critical {
          color: #721c24;
          font-weight: bold;
        }
        .high {
          color: #dc3545;
        }
        .medium {
          color: #fd7e14;
        }
        .low {
          color: #ffc107;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f2f2f2;
        }
        .passed {
          color: #28a745;
        }
        .failed {
          color: #dc3545;
        }
        .timestamp {
          font-style: italic;
          color: #6c757d;
          margin-top: 10px;
        }
        .progress-bar {
          height: 20px;
          background-color: #e9ecef;
          border-radius: 5px;
          margin-top: 5px;
        }
        .progress {
          height: 100%;
          border-radius: 5px;
          background-color: #28a745;
          text-align: center;
          color: white;
          font-size: 12px;
          line-height: 20px;
        }
      </style>
    </head>
    <body>
      <h1>API Security Test Report</h1>
      <div class="timestamp">Generated on ${new Date().toISOString()}</div>
      
      <div class="summary">
        <h2>Summary</h2>
        <p>
          <strong>Endpoints Tested:</strong> ${results.endpointsTested}<br>
          <strong>Overall Health:</strong> 
          ${results.passed / (results.passed + results.failed) * 100}% tests passed
        </p>
        <div class="progress-bar">
          <div class="progress" style="width: ${results.passed / (results.passed + results.failed) * 100}%">
            ${Math.round(results.passed / (results.passed + results.failed) * 100)}%
          </div>
        </div>
        
        <h3>Vulnerabilities Found: ${results.vulnerabilities.length}</h3>
        ${results.vulnerabilities.length > 0 ? `
          <div class="vulnerabilities">
            <ul>
              ${results.vulnerabilities.map(v => `
                <li class="${v.severity}">${v.type}: ${v.message} (${v.severity})</li>
              `).join('')}
            </ul>
          </div>
        ` : '<p>No vulnerabilities found.</p>'}
      </div>
      
      <h2>Endpoint Results</h2>
      ${Object.entries(results.details).map(([endpoint, endpointResult]) => `
        <div class="endpoint ${endpointResult.overallStatus}">
          <h3>${endpoint} <small>(${endpointResult.overallStatus})</small></h3>
          <p>Overall Pass Rate: ${Math.round(endpointResult.overallPassRate * 100)}%</p>
          <div class="progress-bar">
            <div class="progress" style="width: ${endpointResult.overallPassRate * 100}%">
              ${Math.round(endpointResult.overallPassRate * 100)}%
            </div>
          </div>
          
          ${endpointResult.vulnerabilities.length > 0 ? `
            <div class="vulnerabilities">
              <h4>Vulnerabilities:</h4>
              <ul>
                ${endpointResult.vulnerabilities.map(v => `
                  <li class="${v.severity}">${v.type}: ${v.message} (${v.severity})</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${Object.entries(endpointResult.tests).map(([testType, testResults]) => {
            if (testResults.error) {
              return `
                <div class="test-section">
                  <h4>${testType} Tests</h4>
                  <p class="failed">Error: ${testResults.error}</p>
                </div>
              `;
            }
            
            // Different rendering based on test type
            if (testType === 'validation' || testType === 'sanitization' || testType === 'payloadSize') {
              return `
                <div class="test-section">
                  <h4>${testType} Tests</h4>
                  <p>
                    Tests: ${testResults.total}, 
                    Passed: <span class="passed">${testResults.passed}</span>, 
                    Failed: <span class="failed">${testResults.failed}</span>
                  </p>
                  <div class="progress-bar">
                    <div class="progress" style="width: ${testResults.passed / testResults.total * 100}%">
                      ${Math.round(testResults.passed / testResults.total * 100)}%
                    </div>
                  </div>
                </div>
              `;
            } else if (testType === 'rateLimit') {
              return `
                <div class="test-section">
                  <h4>Rate Limit Tests</h4>
                  <p>
                    Expected Limit: ${testResults.expectedLimit}, 
                    Limit Triggered: ${testResults.limitTriggered ? 
                      `<span class="passed">Yes (at request ${testResults.limitTriggeredAt})</span>` : 
                      '<span class="failed">No</span>'}
                  </p>
                </div>
              `;
            }
            
            return '';
          }).join('')}
        </div>
      `).join('')}
    </body>
    </html>
    `;

    return html;
  }
}

module.exports = ApiSecurityTester;