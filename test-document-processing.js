const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import fetch correctly for Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuration
const config = {
  apiUrl: 'https://findoc-deploy.ey.r.appspot.com/api',
  testDocumentPath: path.join(__dirname, 'test-financial-document.txt'),
  outputDir: path.join(__dirname, 'test-results'),
  jwtToken: null, // Will be set after authentication
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  fs.appendFileSync(
    path.join(config.outputDir, 'test-log.txt'),
    `[${timestamp}] ${message}\n`
  );
}

// Helper function to make API requests
async function makeRequest(endpoint, method = 'GET', data = null, isFormData = false) {
  const url = `${config.apiUrl}/${endpoint}`;
  log(`Making ${method} request to ${url}`);
  
  const headers = {
    'Authorization': config.jwtToken ? `Bearer ${config.jwtToken}` : undefined,
  };
  
  if (!isFormData && data) {
    headers['Content-Type'] = 'application/json';
  }
  
  const options = {
    method,
    headers: headers,
  };
  
  if (data) {
    if (isFormData) {
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
    }
  }
  
  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    log(`Response status: ${response.status}`);
    fs.writeFileSync(
      path.join(config.outputDir, `${endpoint.replace(/\//g, '-')}-response.json`),
      JSON.stringify(responseData, null, 2)
    );
    
    return { success: response.ok, data: responseData };
  } catch (error) {
    log(`Error making request to ${url}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Step 1: Authenticate
async function authenticate() {
  log('Step 1: Authenticating...');
  
  try {
    // For testing purposes, we'll use a hardcoded user
    const response = await makeRequest('auth/login', 'POST', {
      email: 'test@example.com',
      password: 'password123',
    });
    
    if (response.success && response.data.token) {
      config.jwtToken = response.data.token;
      log('Authentication successful');
      return true;
    } else {
      log('Authentication failed');
      return false;
    }
  } catch (error) {
    log(`Authentication error: ${error.message}`);
    return false;
  }
}

// Step 2: Check API key status
async function checkApiKeys() {
  log('Step 2: Checking API keys...');
  
  // Check Gemini API key
  const geminiResponse = await makeRequest('documents/scan1/verify-gemini');
  log(`Gemini API key status: ${geminiResponse.success ? 'Valid' : 'Invalid'}`);
  
  // Check OpenRouter API key
  const openRouterResponse = await makeRequest('documents/scan1/verify-openrouter');
  log(`OpenRouter API key status: ${openRouterResponse.success ? 'Valid' : 'Invalid'}`);
  
  return {
    geminiValid: geminiResponse.success && geminiResponse.data?.data?.available,
    openRouterValid: openRouterResponse.success && openRouterResponse.data?.data?.available,
  };
}

// Step 3: Upload document
async function uploadDocument() {
  log('Step 3: Uploading document...');
  
  // Create form data
  const formData = new FormData();
  const fileContent = fs.readFileSync(config.testDocumentPath);
  const fileName = path.basename(config.testDocumentPath);
  
  // Add file to form data
  const file = new Blob([fileContent], { type: 'text/plain' });
  formData.append('file', file, fileName);
  
  // Upload document
  const response = await makeRequest('documents', 'POST', formData, true);
  
  if (response.success) {
    log(`Document uploaded successfully with ID: ${response.data.data.id}`);
    return response.data.data.id;
  } else {
    log('Document upload failed');
    return null;
  }
}

// Step 4: Process document with all agents
async function processDocument(documentId) {
  log('Step 4: Processing document...');
  
  if (!documentId) {
    log('Cannot process document: No document ID provided');
    return false;
  }
  
  // Process options with all agents enabled
  const options = {
    agents: [
      'Document Analyzer',
      'Table Understanding',
      'Securities Extractor',
      'Financial Reasoner'
    ],
    tableExtraction: true,
    isinDetection: true,
    securityInfo: true,
    portfolioAnalysis: true,
    ocrScanned: true,
    outputFormat: 'json'
  };
  
  // Process document
  const response = await makeRequest(`documents/${documentId}/scan1`, 'POST', options);
  
  if (response.success) {
    log('Document processing initiated successfully');
    return response.data.task_id || documentId;
  } else {
    log('Document processing failed');
    return null;
  }
}

// Step 5: Poll for processing status
async function pollProcessingStatus(documentId) {
  log('Step 5: Polling for processing status...');
  
  if (!documentId) {
    log('Cannot poll for status: No document ID provided');
    return false;
  }
  
  const maxPolls = 30;
  const pollInterval = 5000; // 5 seconds
  
  for (let i = 0; i < maxPolls; i++) {
    log(`Polling attempt ${i + 1}/${maxPolls}...`);
    
    const response = await makeRequest(`documents/${documentId}`);
    
    if (!response.success) {
      log('Failed to get document status');
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      continue;
    }
    
    const status = response.data.data.status;
    log(`Current status: ${status}`);
    
    if (status === 'processed') {
      log('Processing completed successfully!');
      return response.data.data;
    } else if (status === 'error') {
      log('Processing failed with error');
      return null;
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  log('Polling timed out');
  return null;
}

// Step 6: Analyze results
function analyzeResults(result) {
  log('Step 6: Analyzing results...');
  
  if (!result) {
    log('No results to analyze');
    return false;
  }
  
  // Save full result to file
  fs.writeFileSync(
    path.join(config.outputDir, 'processing-result.json'),
    JSON.stringify(result, null, 2)
  );
  
  // Check for extracted securities
  const securities = result.metadata?.securities || [];
  log(`Extracted ${securities.length} securities`);
  
  // Check for extracted tables
  const tables = result.metadata?.tables || [];
  log(`Extracted ${tables.length} tables`);
  
  // Check for portfolio analysis
  const analysis = result.metadata?.analysis || {};
  log(`Portfolio analysis: ${Object.keys(analysis).length > 0 ? 'Available' : 'Not available'}`);
  
  // Check for ISIN detection
  const isinsDetected = securities.filter(s => s.isin).length;
  log(`Detected ${isinsDetected} ISINs`);
  
  // Calculate accuracy
  const expectedSecurities = 6; // Based on our test document
  const expectedIsins = 5; // Based on our test document
  
  const securitiesAccuracy = Math.min(100, (securities.length / expectedSecurities) * 100);
  const isinAccuracy = Math.min(100, (isinsDetected / expectedIsins) * 100);
  
  log(`Securities extraction accuracy: ${securitiesAccuracy.toFixed(2)}%`);
  log(`ISIN detection accuracy: ${isinAccuracy.toFixed(2)}%`);
  
  return {
    securitiesAccuracy,
    isinAccuracy,
    overallAccuracy: (securitiesAccuracy + isinAccuracy) / 2
  };
}

// Main function to run all tests
async function runTests() {
  log('Starting document processing tests...');
  
  // Step 1: Authenticate
  const authenticated = await authenticate();
  if (!authenticated) {
    log('Authentication failed, skipping JWT token authentication for testing');
    // Continue without authentication for testing
  }
  
  // Step 2: Check API keys
  const apiKeyStatus = await checkApiKeys();
  log(`API key status: Gemini: ${apiKeyStatus.geminiValid ? 'Valid' : 'Invalid'}, OpenRouter: ${apiKeyStatus.openRouterValid ? 'Valid' : 'Invalid'}`);
  
  if (!apiKeyStatus.geminiValid && !apiKeyStatus.openRouterValid) {
    log('Both API keys are invalid, cannot proceed with testing');
    return;
  }
  
  // Step 3: Upload document
  const documentId = await uploadDocument();
  if (!documentId) {
    log('Document upload failed, cannot proceed with testing');
    return;
  }
  
  // Step 4: Process document
  const taskId = await processDocument(documentId);
  if (!taskId) {
    log('Document processing failed, cannot proceed with testing');
    return;
  }
  
  // Step 5: Poll for processing status
  const result = await pollProcessingStatus(taskId);
  if (!result) {
    log('Document processing did not complete successfully');
    return;
  }
  
  // Step 6: Analyze results
  const accuracy = analyzeResults(result);
  log(`Overall processing accuracy: ${accuracy.overallAccuracy.toFixed(2)}%`);
  
  log('Document processing tests completed!');
}

// Run the tests
runTests().catch(error => {
  log(`Error running tests: ${error.message}`);
});
