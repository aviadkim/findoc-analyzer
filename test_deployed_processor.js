/**
 * Test script for the deployed Financial Document Processor.
 * 
 * This script tests the Financial Document Processor API endpoints on the deployed application.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const config = {
  baseUrl: 'https://backv2-app-brfi73d4ra-zf.a.run.app',
  testPdfPath: './messos.pdf',
  timeout: 30000 // 30 seconds
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

/**
 * Test the Financial Document Processor API endpoints.
 */
async function testFinancialDocumentProcessor() {
  console.log(`${colors.cyan}Testing Financial Document Processor API endpoints on deployed application...${colors.reset}`);
  
  try {
    // Test the health endpoint
    console.log(`${colors.yellow}Testing /api/health endpoint...${colors.reset}`);
    const healthResponse = await axios.get(
      `${config.baseUrl}/api/health`,
      { timeout: config.timeout }
    );
    
    if (healthResponse.status === 200) {
      console.log(`${colors.green}✓ /api/health endpoint test passed${colors.reset}`);
      console.log(`${colors.yellow}Response:${colors.reset}`, JSON.stringify(healthResponse.data, null, 2));
    } else {
      console.log(`${colors.red}✗ /api/health endpoint test failed${colors.reset}`);
      console.log(`${colors.yellow}Response:${colors.reset}`, healthResponse.status, healthResponse.statusText);
      return;
    }
    
    // Test the process-document endpoint
    console.log(`${colors.yellow}Testing /api/financial/process-document endpoint...${colors.reset}`);
    
    // Create form data
    const formData = new FormData();
    
    // Check if test PDF exists
    if (fs.existsSync(config.testPdfPath)) {
      formData.append('file', fs.createReadStream(config.testPdfPath));
    } else {
      console.log(`${colors.red}✗ Test PDF not found at ${config.testPdfPath}${colors.reset}`);
      return;
    }
    
    // Add options
    formData.append('options', JSON.stringify({
      languages: ['eng'],
      extractTables: true,
      extractSecurities: true,
      extractMetrics: true,
      includeText: true,
      includeSecurities: true,
      includeTables: true
    }));
    
    // Make API call
    const processResponse = await axios.post(
      `${config.baseUrl}/api/financial/process-document`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: config.timeout
      }
    );
    
    // Check response
    if (processResponse.status === 200) {
      console.log(`${colors.green}✓ /api/financial/process-document endpoint test passed${colors.reset}`);
      console.log(`${colors.yellow}Response:${colors.reset}`, JSON.stringify(processResponse.data, null, 2));
      
      // Get the filename from the response
      const filename = processResponse.data.filename;
      
      // Test the get-document-text endpoint
      console.log(`${colors.yellow}Testing /api/financial/get-document-text endpoint...${colors.reset}`);
      const textResponse = await axios.get(
        `${config.baseUrl}/api/financial/get-document-text/${filename}`,
        { timeout: config.timeout }
      );
      
      // Check response
      if (textResponse.status === 200) {
        console.log(`${colors.green}✓ /api/financial/get-document-text endpoint test passed${colors.reset}`);
        console.log(`${colors.yellow}Text length:${colors.reset}`, textResponse.data.text.length);
      } else {
        console.log(`${colors.red}✗ /api/financial/get-document-text endpoint test failed${colors.reset}`);
        console.log(`${colors.yellow}Response:${colors.reset}`, textResponse.status, textResponse.statusText);
      }
      
      // Test the get-document-securities endpoint
      console.log(`${colors.yellow}Testing /api/financial/get-document-securities endpoint...${colors.reset}`);
      const securitiesResponse = await axios.get(
        `${config.baseUrl}/api/financial/get-document-securities/${filename}`,
        { timeout: config.timeout }
      );
      
      // Check response
      if (securitiesResponse.status === 200) {
        console.log(`${colors.green}✓ /api/financial/get-document-securities endpoint test passed${colors.reset}`);
        console.log(`${colors.yellow}Securities count:${colors.reset}`, securitiesResponse.data.securities.length);
        
        // Print first 5 securities
        console.log(`${colors.yellow}First 5 securities:${colors.reset}`);
        for (let i = 0; i < Math.min(5, securitiesResponse.data.securities.length); i++) {
          const security = securitiesResponse.data.securities[i];
          console.log(`  ${i+1}. ISIN: ${security.isin}`);
          if (security.price) {
            console.log(`     Price: ${security.price.value} ${security.price.currency || ''}`);
          }
          if (security.quantity) {
            console.log(`     Quantity: ${security.quantity}`);
          }
          if (security.security_type) {
            console.log(`     Type: ${security.security_type}`);
          }
          if (security.name) {
            console.log(`     Name: ${security.name}`);
          }
        }
      } else {
        console.log(`${colors.red}✗ /api/financial/get-document-securities endpoint test failed${colors.reset}`);
        console.log(`${colors.yellow}Response:${colors.reset}`, securitiesResponse.status, securitiesResponse.statusText);
      }
      
      // Test the get-document-metrics endpoint
      console.log(`${colors.yellow}Testing /api/financial/get-document-metrics endpoint...${colors.reset}`);
      const metricsResponse = await axios.get(
        `${config.baseUrl}/api/financial/get-document-metrics/${filename}`,
        { timeout: config.timeout }
      );
      
      // Check response
      if (metricsResponse.status === 200) {
        console.log(`${colors.green}✓ /api/financial/get-document-metrics endpoint test passed${colors.reset}`);
        console.log(`${colors.yellow}Metrics:${colors.reset}`, JSON.stringify(metricsResponse.data.metrics, null, 2));
      } else {
        console.log(`${colors.red}✗ /api/financial/get-document-metrics endpoint test failed${colors.reset}`);
        console.log(`${colors.yellow}Response:${colors.reset}`, metricsResponse.status, metricsResponse.statusText);
      }
    } else {
      console.log(`${colors.red}✗ /api/financial/process-document endpoint test failed${colors.reset}`);
      console.log(`${colors.yellow}Response:${colors.reset}`, processResponse.status, processResponse.statusText);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error testing Financial Document Processor API endpoints${colors.reset}`);
    console.log(`${colors.yellow}Error:${colors.reset}`, error.message);
    
    if (error.response) {
      console.log(`${colors.yellow}Response:${colors.reset}`, error.response.status, error.response.statusText);
      console.log(`${colors.yellow}Data:${colors.reset}`, JSON.stringify(error.response.data, null, 2));
    }
  }
}

/**
 * Main function.
 */
async function main() {
  console.log(`${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.cyan}  Financial Document Processor Deployment Test${colors.reset}`);
  console.log(`${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.yellow}Base URL:${colors.reset} ${config.baseUrl}`);
  console.log(`${colors.yellow}Test PDF:${colors.reset} ${config.testPdfPath}`);
  console.log(`${colors.yellow}Timeout:${colors.reset} ${config.timeout}ms`);
  console.log();
  
  try {
    // Test the Financial Document Processor API endpoints
    await testFinancialDocumentProcessor();
    
    console.log();
    console.log(`${colors.green}All tests completed.${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Error running tests:${colors.reset}`, error.message);
  }
  
  console.log(`${colors.cyan}====================================================${colors.reset}`);
}

// Run the main function
main();
