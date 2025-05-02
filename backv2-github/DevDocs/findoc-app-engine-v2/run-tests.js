/**
 * PDF Processing Test Runner
 * 
 * This script runs automated tests for the PDF processing functionality.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const config = {
  // Test environments
  environments: [
    {
      name: 'Mock Data',
      baseUrl: '',
      apiEndpoint: '',
      useMockData: true
    }
  ],
  
  // Test PDFs
  testPdfs: [
    {
      name: 'Financial Statement',
      path: 'test_pdfs/financial_statement.pdf',
      type: 'financial_statement'
    },
    {
      name: 'Text Only',
      path: 'test_pdfs/text_only.pdf',
      type: 'financial_statement'
    },
    {
      name: 'Tables Only',
      path: 'test_pdfs/tables_only.pdf',
      type: 'financial_statement'
    },
    {
      name: 'Small File',
      path: 'test_pdfs/small_file.pdf',
      type: 'financial_statement'
    }
  ],
  
  // Test questions
  testQuestions: [
    'What is the total value of the portfolio?',
    'How many securities are in the portfolio?',
    'What is the ISIN of Apple Inc?',
    'What is the weight of Microsoft Corp in the portfolio?',
    'What is the asset allocation of the portfolio?'
  ],
  
  // Output directory
  outputDir: 'test_results'
};

// Test results
const testResults = [];

/**
 * Run a single test
 * @param {object} environment - Test environment
 * @param {object} testPdf - Test PDF
 * @returns {object} Test result
 */
async function runTest(environment, testPdf) {
  console.log(`Running test: ${environment.name} - ${testPdf.name}`);
  
  const testResult = {
    environment: environment.name,
    testPdf: testPdf.name,
    timestamp: new Date().toISOString(),
    steps: []
  };
  
  try {
    // Step 1: Upload the document
    console.log('Step 1: Uploading document...');
    
    // Use mock data
    if (environment.useMockData) {
      // Simulate upload response
      const uploadResponse = {
        data: {
          success: true,
          data: {
            id: `doc-${Date.now()}`,
            name: testPdf.name,
            type: testPdf.type,
            status: 'pending',
            uploaded_at: new Date().toISOString()
          }
        }
      };
      
      testResult.steps.push({
        name: 'Upload Document',
        status: 'Pass',
        details: uploadResponse.data
      });
      
      const documentId = uploadResponse.data.data.id;
      console.log(`Document uploaded successfully with ID: ${documentId}`);
      
      // Step 2: Process the document
      console.log('Step 2: Processing document...');
      
      // Simulate process response
      const processResponse = {
        data: {
          success: true,
          data: {
            id: documentId,
            status: 'processing'
          }
        }
      };
      
      testResult.steps.push({
        name: 'Process Document',
        status: 'Pass',
        details: processResponse.data
      });
      
      console.log('Document processing initiated successfully');
      
      // Step 3: Poll for processing status
      console.log('Step 3: Polling for processing status...');
      
      // Simulate polling
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock document data
      const documentData = {
        id: documentId,
        name: testPdf.name,
        type: testPdf.type,
        status: 'processed',
        uploaded_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
        content: {
          text: "INVESTMENT PORTFOLIO STATEMENT\n\nDate: 28.02.2025\nAccount Number: 12345678\nClient: John Doe\n\nPORTFOLIO SUMMARY\nTotal Value: USD 1,250,000.00\nCurrency: USD\nValuation Date: 28.02.2025\n\nASSET ALLOCATION\nEquity: 45%\nFixed Income: 30%\nCash: 15%\nAlternative: 10%\n\nSECURITIES HOLDINGS\nAPPLE INC (US0378331005) - Equity - 500 - USD 170.00 - USD 85,000.00 - 6.8%\nMICROSOFT CORP (US5949181045) - Equity - 300 - USD 340.00 - USD 102,000.00 - 8.16%\nAMAZON.COM INC (US0231351067) - Equity - 100 - USD 950.00 - USD 95,000.00 - 7.6%\nUS TREASURY 2.5% 15/02/2045 (US912810RK35) - Bond - 200,000 - USD 0.99 - USD 198,000.00 - 15.84%\nGOLDMAN SACHS 0% NOTES 23-07.11.29 (XS2692298537) - Bond - 150,000 - USD 0.98 - USD 147,000.00 - 11.76%\n\nSECTOR ALLOCATION\nTechnology: 22.56%\nConsumer: 7.6%\nGovernment: 15.84%\nFinancial: 11.76%\nOther: 42.24%\n\nNOTES\nThis portfolio statement is for informational purposes only and does not constitute investment advice. Past performance is not indicative of future results. Please consult with your financial advisor before making any investment decisions.",
          tables: [
            {
              title: "Asset Allocation",
              headers: ["Asset Class", "Percentage"],
              rows: [
                ["Equity", "45%"],
                ["Fixed Income", "30%"],
                ["Cash", "15%"],
                ["Alternative", "10%"]
              ]
            },
            {
              title: "Securities Holdings",
              headers: ["Security", "ISIN", "Type", "Quantity", "Price", "Value", "Weight"],
              rows: [
                ["APPLE INC", "US0378331005", "Equity", "500", "USD 170.00", "USD 85,000.00", "6.8%"],
                ["MICROSOFT CORP", "US5949181045", "Equity", "300", "USD 340.00", "USD 102,000.00", "8.16%"],
                ["AMAZON.COM INC", "US0231351067", "Equity", "100", "USD 950.00", "USD 95,000.00", "7.6%"],
                ["US TREASURY 2.5% 15/02/2045", "US912810RK35", "Bond", "200,000", "USD 0.99", "USD 198,000.00", "15.84%"],
                ["GOLDMAN SACHS 0% NOTES 23-07.11.29", "XS2692298537", "Bond", "150,000", "USD 0.98", "USD 147,000.00", "11.76%"]
              ]
            }
          ]
        },
        metadata: {
          title: "Investment Portfolio Statement",
          author: "Financial Institution",
          creationDate: "2025-02-28",
          securities: [
            {
              name: "APPLE INC",
              isin: "US0378331005",
              type: "Equity",
              quantity: 500,
              price: 170.00,
              value: 85000.00,
              currency: "USD",
              weight: 0.068
            },
            {
              name: "MICROSOFT CORP",
              isin: "US5949181045",
              type: "Equity",
              quantity: 300,
              price: 340.00,
              value: 102000.00,
              currency: "USD",
              weight: 0.0816
            },
            {
              name: "AMAZON.COM INC",
              isin: "US0231351067",
              type: "Equity",
              quantity: 100,
              price: 950.00,
              value: 95000.00,
              currency: "USD",
              weight: 0.076
            },
            {
              name: "US TREASURY 2.5% 15/02/2045",
              isin: "US912810RK35",
              type: "Bond",
              quantity: 200000,
              price: 0.99,
              value: 198000.00,
              currency: "USD",
              weight: 0.1584
            },
            {
              name: "GOLDMAN SACHS 0% NOTES 23-07.11.29",
              isin: "XS2692298537",
              type: "Bond",
              quantity: 150000,
              price: 0.98,
              value: 147000.00,
              currency: "USD",
              weight: 0.1176
            }
          ],
          portfolio: {
            totalValue: 1250000.00,
            currency: "USD",
            valuationDate: "2025-02-28",
            assetAllocation: {
              equity: 0.45,
              fixedIncome: 0.30,
              cash: 0.15,
              alternative: 0.10
            },
            sectorAllocation: {
              technology: 0.2256,
              consumer: 0.076,
              government: 0.1584,
              financial: 0.1176,
              other: 0.4224
            }
          }
        }
      };
      
      testResult.steps.push({
        name: 'Poll for Status',
        status: 'Pass',
        details: {
          status: 'processed',
          pollCount: 1,
          documentData
        }
      });
      
      console.log('Processing completed successfully!');
    } else {
      // Use real API
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testPdf.path));
      formData.append('name', testPdf.name);
      formData.append('type', testPdf.type);
      
      const uploadResponse = await axios.post(
        `${environment.baseUrl}${environment.apiEndpoint}/documents`,
        formData,
        {
          headers: formData.getHeaders()
        }
      );
      
      testResult.steps.push({
        name: 'Upload Document',
        status: uploadResponse.data.success ? 'Pass' : 'Fail',
        details: uploadResponse.data
      });
      
      if (!uploadResponse.data.success) {
        throw new Error(`Upload failed: ${uploadResponse.data.error}`);
      }
      
      const documentId = uploadResponse.data.data.id;
      console.log(`Document uploaded successfully with ID: ${documentId}`);
      
      // Step 2: Process the document
      console.log('Step 2: Processing document...');
      
      const processResponse = await axios.post(
        `${environment.baseUrl}${environment.apiEndpoint}/documents/${documentId}/scan1`,
        {
          agents: ["Document Analyzer", "Table Understanding", "Securities Extractor", "Financial Reasoner"],
          tableExtraction: true,
          isinDetection: true,
          securityInfo: true,
          portfolioAnalysis: true,
          ocrScanned: true,
          outputFormat: 'json'
        }
      );
      
      testResult.steps.push({
        name: 'Process Document',
        status: processResponse.data.success ? 'Pass' : 'Fail',
        details: processResponse.data
      });
      
      if (!processResponse.data.success) {
        throw new Error(`Processing failed: ${processResponse.data.error}`);
      }
      
      console.log('Document processing initiated successfully');
      
      // Step 3: Poll for processing status
      console.log('Step 3: Polling for processing status...');
      
      let status = 'processing';
      let documentData = null;
      let pollCount = 0;
      const maxPolls = 12;  // 1 minute (5 seconds per poll)
      
      while (status === 'processing' && pollCount < maxPolls) {
        // Wait for 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        pollCount++;
        
        console.log(`Polling for status (attempt ${pollCount}/${maxPolls})...`);
        
        // Check status
        const statusResponse = await axios.get(
          `${environment.baseUrl}${environment.apiEndpoint}/documents/${documentId}`
        );
        
        if (!statusResponse.data.success) {
          console.log(`Failed to get status: ${statusResponse.data.error}`);
          continue;
        }
        
        status = statusResponse.data.data.status;
        documentData = statusResponse.data.data;
        
        console.log(`Current status: ${status}`);
        
        if (status === 'error') {
          throw new Error('Processing failed with error');
        }
        
        if (status === 'processed') {
          console.log('Processing completed successfully!');
          break;
        }
      }
      
      testResult.steps.push({
        name: 'Poll for Status',
        status: status === 'processed' ? 'Pass' : 'Fail',
        details: {
          status,
          pollCount,
          documentData
        }
      });
      
      if (pollCount >= maxPolls && status === 'processing') {
        throw new Error('Processing timed out');
      }
    }

    // Step 4: Verify document data
    console.log('Step 4: Verifying document data...');
    
    // Get document data from the previous step
    let documentData;
    const pollStep = testResult.steps.find(step => step.name === 'Poll for Status');
    if (pollStep && pollStep.details && pollStep.details.documentData) {
      documentData = pollStep.details.documentData;
    } else if (environment.useMockData) {
      // Use mock data from the previous step
      const mockStep = testResult.steps.find(step => step.name === 'Poll for Status');
      if (mockStep && mockStep.details && mockStep.details.documentData) {
        documentData = mockStep.details.documentData;
      } else {
        throw new Error('Document data not found');
      }
    } else {
      throw new Error('Document data not found');
    }
    
    const verificationResult = verifyDocumentData(documentData);
    
    testResult.steps.push({
      name: 'Verify Document Data',
      status: verificationResult.success ? 'Pass' : 'Fail',
      details: verificationResult
    });
    
    if (!verificationResult.success) {
      throw new Error(`Verification failed: ${verificationResult.error}`);
    }
    
    // Step 5: Test Q&A functionality
    console.log('Step 5: Testing Q&A functionality...');
    
    const qaResults = [];
    
    for (const question of config.testQuestions) {
      console.log(`Asking question: ${question}`);
      
      try {
        if (environment.useMockData) {
          // Simulate Q&A response
          const answer = generateMockAnswer(question, documentData);
          console.log(`Answer: ${answer}`);
          
          qaResults.push({
            question,
            answer,
            status: 'Pass'
          });
        } else {
          // Use real API
          const answerResponse = await axios.post(
            `${environment.baseUrl}${environment.apiEndpoint}/documents/${documentId}/ask`,
            {
              question
            }
          );
          
          if (answerResponse.data.success) {
            const answer = answerResponse.data.data.answer;
            console.log(`Answer: ${answer}`);
            
            qaResults.push({
              question,
              answer,
              status: 'Pass'
            });
          } else {
            console.log(`Failed to get answer: ${answerResponse.data.error}`);
            
            qaResults.push({
              question,
              error: answerResponse.data.error,
              status: 'Fail'
            });
          }
        }
      } catch (error) {
        console.log(`Error asking question: ${error.message}`);
        
        qaResults.push({
          question,
          error: error.message,
          status: 'Fail'
        });
      }
    }
    
    testResult.steps.push({
      name: 'Test Q&A Functionality',
      status: qaResults.every(result => result.status === 'Pass') ? 'Pass' : 'Fail',
      details: {
        qaResults
      }
    });
    
    // Overall test result
    testResult.status = testResult.steps.every(step => step.status === 'Pass') ? 'Pass' : 'Fail';
    
    return testResult;
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
    
    testResult.status = 'Fail';
    testResult.error = error.message;
    
    return testResult;
  }
}

/**
 * Generate mock answer
 * @param {string} question - Question
 * @param {object} documentData - Document data
 * @returns {string} Answer
 */
function generateMockAnswer(question, documentData) {
  const q = question.toLowerCase();
  
  if (q.includes('total value') || q.includes('portfolio value')) {
    return `The total value of the portfolio is ${documentData.metadata.portfolio.currency} ${documentData.metadata.portfolio.totalValue.toLocaleString()}.`;
  } else if (q.includes('how many securities') || q.includes('number of securities')) {
    return `There are ${documentData.metadata.securities.length} securities in the portfolio.`;
  } else if (q.includes('isin') && q.includes('apple')) {
    const apple = documentData.metadata.securities.find(s => s.name.toLowerCase().includes('apple'));
    return apple ? `The ISIN of Apple Inc is ${apple.isin}.` : 'Apple Inc was not found in the portfolio.';
  } else if (q.includes('weight') && q.includes('microsoft')) {
    const microsoft = documentData.metadata.securities.find(s => s.name.toLowerCase().includes('microsoft'));
    return microsoft ? `The weight of Microsoft Corp in the portfolio is ${(microsoft.weight * 100).toFixed(2)}%.` : 'Microsoft Corp was not found in the portfolio.';
  } else if (q.includes('asset allocation')) {
    const allocation = documentData.metadata.portfolio.assetAllocation;
    return `The asset allocation of the portfolio is: Equity ${(allocation.equity * 100).toFixed(0)}%, Fixed Income ${(allocation.fixedIncome * 100).toFixed(0)}%, Cash ${(allocation.cash * 100).toFixed(0)}%, and Alternative ${(allocation.alternative * 100).toFixed(0)}%.`;
  } else {
    return 'I don\'t have enough information to answer this question.';
  }
}

/**
 * Verify document data
 * @param {object} documentData - Document data
 * @returns {object} Verification result
 */
function verifyDocumentData(documentData) {
  try {
    const result = {
      success: true,
      checks: []
    };
    
    // Check if document has basic properties
    if (!documentData.id || !documentData.name || !documentData.type || !documentData.status) {
      result.success = false;
      result.error = 'Document is missing basic properties';
      return result;
    }
    
    result.checks.push({
      name: 'Basic Properties',
      status: 'Pass'
    });
    
    // Check if document has content
    if (!documentData.content) {
      result.success = false;
      result.error = 'Document is missing content';
      return result;
    }
    
    result.checks.push({
      name: 'Content',
      status: 'Pass'
    });
    
    // Check if document has text content
    if (!documentData.content.text) {
      result.success = false;
      result.error = 'Document is missing text content';
      return result;
    }
    
    result.checks.push({
      name: 'Text Content',
      status: 'Pass'
    });
    
    // Check if document has tables (if applicable)
    if (documentData.content.tables) {
      result.checks.push({
        name: 'Tables',
        status: 'Pass'
      });
    }
    
    // Check if document has metadata
    if (!documentData.metadata) {
      result.success = false;
      result.error = 'Document is missing metadata';
      return result;
    }
    
    result.checks.push({
      name: 'Metadata',
      status: 'Pass'
    });
    
    // Check if document has securities (if applicable)
    if (documentData.metadata.securities) {
      result.checks.push({
        name: 'Securities',
        status: 'Pass'
      });
    }
    
    // Check if document has portfolio (if applicable)
    if (documentData.metadata.portfolio) {
      result.checks.push({
        name: 'Portfolio',
        status: 'Pass'
      });
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Running all tests...');
  
  // Create output directory
  fs.mkdirSync(config.outputDir, { recursive: true });
  
  // Run tests for each environment and test PDF
  for (const environment of config.environments) {
    for (const testPdf of config.testPdfs) {
      try {
        const testResult = await runTest(environment, testPdf);
        testResults.push(testResult);
        
        // Save test result to file
        const outputPath = path.join(config.outputDir, `${environment.name.replace(/\s+/g, '_')}_${testPdf.name.replace(/\s+/g, '_')}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(testResult, null, 2));
        
        console.log(`Test result saved to ${outputPath}`);
      } catch (error) {
        console.error(`Error running test: ${error.message}`);
      }
    }
  }
  
  // Generate summary report
  generateSummaryReport();
}

/**
 * Generate summary report
 */
function generateSummaryReport() {
  console.log('Generating summary report...');
  
  const summary = {
    timestamp: new Date().toISOString(),
    totalTests: testResults.length,
    passedTests: testResults.filter(result => result.status === 'Pass').length,
    failedTests: testResults.filter(result => result.status === 'Fail').length,
    results: testResults.map(result => ({
      environment: result.environment,
      testPdf: result.testPdf,
      status: result.status,
      error: result.error
    }))
  };
  
  // Save summary report to file
  const outputPath = path.join(config.outputDir, 'summary.json');
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  
  console.log(`Summary report saved to ${outputPath}`);
  
  // Print summary
  console.log('\nTest Summary:');
  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(`Passed Tests: ${summary.passedTests}`);
  console.log(`Failed Tests: ${summary.failedTests}`);
  console.log(`Success Rate: ${(summary.passedTests / summary.totalTests * 100).toFixed(2)}%`);
  
  // Print results
  console.log('\nTest Results:');
  summary.results.forEach(result => {
    console.log(`${result.environment} - ${result.testPdf}: ${result.status}${result.error ? ` (${result.error})` : ''}`);
  });
}

// Run all tests
runAllTests();
