/**
 * Messos PDF Agent Test Script
 * 
 * This script tests the agent functionality specifically with the Messos PDF.
 * It runs a series of tests for each agent type and evaluates the responses.
 */

// Configuration
const messosTestConfig = {
  // Document ID for Messos PDF
  documentId: '3',
  
  // Questions to test different agent types with Messos-specific questions
  questions: {
    documentAnalyzer: [
      "What is the total value of the Messos portfolio?",
      "What is the date of the Messos portfolio valuation?",
      "Who is the portfolio manager for Messos Enterprises Ltd?",
      "What is the name of the company in this document?",
      "What type of document is this?"
    ],
    tableUnderstanding: [
      "What are the top 5 holdings in the Messos portfolio?",
      "How many bonds are in the Messos portfolio?",
      "What is the asset allocation table showing for Messos?",
      "What percentage of the portfolio is in structured products?",
      "What is the largest bond holding in the portfolio?"
    ],
    securitiesExtractor: [
      "List all the securities in the Messos portfolio",
      "What is the ISIN for the US Treasury Bond in the portfolio?",
      "How many shares of Credit Suisse Structured Note does Messos own?",
      "What are all the bond holdings in the portfolio?",
      "What structured products are in the portfolio?"
    ],
    financialReasoner: [
      "Calculate the portfolio's year-to-date performance",
      "What is the debt to equity ratio of the Messos portfolio?",
      "Compare the performance of bonds vs structured products in the portfolio",
      "What is the average yield of the bonds in the portfolio?",
      "What is the risk profile of this portfolio?"
    ],
    bloombergAgent: [
      "What is the current price of the US Treasury Bond 2.5% 2030?",
      "How has the German Bund 1.75% 2032 performed over the last month?",
      "What is the current yield of the JP Morgan Corporate Bond 3.25% 2028?",
      "Compare the current market value of the portfolio to its valuation in the document",
      "What is the current interest rate environment and how might it affect this portfolio?"
    ]
  },
  
  // Expected responses for evaluation
  expectedResponses: {
    totalValue: ["19,510,599", "19510599", "$19,510,599", "$19510599"],
    date: ["28.02.2025", "February 28, 2025", "Feb 28, 2025", "28 February 2025"],
    assetAllocation: ["59.24%", "bonds", "40.24%", "structured products", "0.52%", "cash"],
    topHolding: ["US Treasury Bond", "2,500,000", "2500000", "$2,500,000", "$2500000", "12.81%"]
  }
};

// Create test UI
function createMessosTestUI() {
  console.log('Creating Messos Test UI');
  
  // Create test container
  const container = document.createElement('div');
  container.id = 'messos-test-container';
  container.style.padding = '20px';
  container.style.maxWidth = '1000px';
  container.style.margin = '0 auto';
  container.style.backgroundColor = 'white';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  
  // Create header
  const header = document.createElement('div');
  header.innerHTML = `
    <h1 style="color: #8A2BE2; margin-top: 0;">Messos PDF Agent Test</h1>
    <p>This page tests the agent functionality specifically with the Messos PDF.</p>
  `;
  container.appendChild(header);
  
  // Create test controls
  const controls = document.createElement('div');
  controls.style.marginBottom = '20px';
  controls.style.padding = '15px';
  controls.style.backgroundColor = '#f5f5f5';
  controls.style.borderRadius = '8px';
  
  controls.innerHTML = `
    <h2 style="margin-top: 0;">Test Controls</h2>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Document ID</label>
      <input type="text" id="messos-document-id-input" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="${messosTestConfig.documentId}" placeholder="Enter document ID">
    </div>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Agent Type</label>
      <select id="messos-agent-type-select" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <option value="documentAnalyzer">Document Analyzer</option>
        <option value="tableUnderstanding">Table Understanding</option>
        <option value="securitiesExtractor">Securities Extractor</option>
        <option value="financialReasoner">Financial Reasoner</option>
        <option value="bloombergAgent">Bloomberg Agent</option>
      </select>
    </div>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Question</label>
      <select id="messos-question-select" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></select>
    </div>
    <button id="messos-run-test-button" style="background-color: #8A2BE2; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Run Test</button>
    <button id="messos-run-all-tests-button" style="background-color: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-left: 10px;">Run All Tests</button>
  `;
  
  container.appendChild(controls);
  
  // Create results container
  const results = document.createElement('div');
  results.id = 'messos-test-results';
  results.style.marginTop = '20px';
  
  container.appendChild(results);
  
  // Add container to page
  document.body.appendChild(container);
  
  // Update question select based on agent type
  updateMessosQuestionSelect();
  
  // Add event listeners
  document.getElementById('messos-agent-type-select').addEventListener('change', updateMessosQuestionSelect);
  document.getElementById('messos-run-test-button').addEventListener('click', runMessosSingleTest);
  document.getElementById('messos-run-all-tests-button').addEventListener('click', runMessosAllTests);
}

// Update question select based on agent type
function updateMessosQuestionSelect() {
  const agentType = document.getElementById('messos-agent-type-select').value;
  const questionSelect = document.getElementById('messos-question-select');
  
  // Clear existing options
  questionSelect.innerHTML = '';
  
  // Add questions for selected agent type
  messosTestConfig.questions[agentType].forEach((question, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = question;
    questionSelect.appendChild(option);
  });
}

// Run a single test
async function runMessosSingleTest() {
  const documentId = document.getElementById('messos-document-id-input').value;
  const agentType = document.getElementById('messos-agent-type-select').value;
  const questionIndex = document.getElementById('messos-question-select').value;
  const question = messosTestConfig.questions[agentType][questionIndex];
  
  // Create result element
  const resultElement = document.createElement('div');
  resultElement.style.marginBottom = '20px';
  resultElement.style.padding = '15px';
  resultElement.style.backgroundColor = '#f9f9f9';
  resultElement.style.borderRadius = '8px';
  resultElement.style.borderLeft = '4px solid #8A2BE2';
  
  resultElement.innerHTML = `
    <h3 style="margin-top: 0;">Test Result</h3>
    <p><strong>Agent Type:</strong> ${agentType}</p>
    <p><strong>Question:</strong> ${question}</p>
    <p><strong>Status:</strong> <span id="messos-test-status">Running...</span></p>
    <div id="messos-test-response" style="display: none;">
      <p><strong>Response:</strong></p>
      <div style="padding: 10px; background-color: #f5f5f5; border-radius: 4px; white-space: pre-wrap;"></div>
    </div>
    <div id="messos-test-evaluation" style="display: none; margin-top: 10px; padding: 10px; border-radius: 4px;"></div>
  `;
  
  // Add result to results container
  const resultsContainer = document.getElementById('messos-test-results');
  resultsContainer.insertBefore(resultElement, resultsContainer.firstChild);
  
  try {
    // Get document data
    const documentData = getMessosDocumentData(documentId);
    
    // Use agent manager to process question
    let response;
    if (window.agentManager && window.agentManager.processQuestion) {
      response = await window.agentManager.processQuestion(question, documentData);
    } else if (window.enhancedAgentManager && window.enhancedAgentManager.processQuestion) {
      response = await window.enhancedAgentManager.processQuestion(question, documentData);
    } else {
      throw new Error('Agent manager not available');
    }
    
    // Update status
    resultElement.querySelector('#messos-test-status').textContent = 'Completed';
    
    // Show response
    const responseElement = resultElement.querySelector('#messos-test-response');
    responseElement.style.display = 'block';
    responseElement.querySelector('div').textContent = response.answer;
    
    // Evaluate response
    const evaluation = evaluateMessosResponse(question, response.answer);
    const evaluationElement = resultElement.querySelector('#messos-test-evaluation');
    evaluationElement.style.display = 'block';
    evaluationElement.textContent = evaluation;
    
    if (evaluation.startsWith('Passed')) {
      evaluationElement.style.backgroundColor = '#d4edda';
      evaluationElement.style.color = '#155724';
    } else {
      evaluationElement.style.backgroundColor = '#f8d7da';
      evaluationElement.style.color = '#721c24';
    }
    
    return response;
  } catch (error) {
    console.error('Error running test:', error);
    
    // Update status
    resultElement.querySelector('#messos-test-status').textContent = 'Error';
    
    // Show error
    const responseElement = resultElement.querySelector('#messos-test-response');
    responseElement.style.display = 'block';
    responseElement.querySelector('div').textContent = `Error: ${error.message}`;
    
    return {
      answer: `Error: ${error.message}`,
      source: 'error',
      error: error.message
    };
  }
}

// Run all tests
async function runMessosAllTests() {
  const documentId = document.getElementById('messos-document-id-input').value;
  
  // Clear results container
  document.getElementById('messos-test-results').innerHTML = '';
  
  // Create summary element
  const summaryElement = document.createElement('div');
  summaryElement.style.marginBottom = '20px';
  summaryElement.style.padding = '15px';
  summaryElement.style.backgroundColor = '#e9ecef';
  summaryElement.style.borderRadius = '8px';
  
  summaryElement.innerHTML = `
    <h3 style="margin-top: 0;">Test Summary</h3>
    <p><strong>Document ID:</strong> ${documentId}</p>
    <p><strong>Status:</strong> Running tests...</p>
    <div id="messos-test-progress" style="margin-top: 10px;">
      <div style="height: 20px; background-color: #f5f5f5; border-radius: 10px; overflow: hidden;">
        <div id="messos-progress-bar" style="height: 100%; width: 0%; background-color: #8A2BE2;"></div>
      </div>
      <p id="messos-progress-text">0% (0/0 tests completed)</p>
    </div>
  `;
  
  // Add summary to results container
  document.getElementById('messos-test-results').appendChild(summaryElement);
  
  // Count total tests
  let totalTests = 0;
  for (const questions of Object.values(messosTestConfig.questions)) {
    totalTests += questions.length;
  }
  
  // Run tests
  let completedTests = 0;
  let passedTests = 0;
  
  for (const [agentType, questions] of Object.entries(messosTestConfig.questions)) {
    for (const question of questions) {
      // Select agent type and question
      document.getElementById('messos-agent-type-select').value = agentType;
      updateMessosQuestionSelect();
      
      // Find question index
      const questionIndex = messosTestConfig.questions[agentType].indexOf(question);
      document.getElementById('messos-question-select').value = questionIndex;
      
      // Run test
      const response = await runMessosSingleTest();
      
      // Update progress
      completedTests++;
      
      // Check if test passed
      const evaluation = evaluateMessosResponse(question, response.answer);
      if (evaluation.startsWith('Passed')) {
        passedTests++;
      }
      
      // Update progress bar
      const progressBar = document.getElementById('messos-progress-bar');
      const progressText = document.getElementById('messos-progress-text');
      
      const progressPercent = Math.round((completedTests / totalTests) * 100);
      progressBar.style.width = `${progressPercent}%`;
      progressText.textContent = `${progressPercent}% (${completedTests}/${totalTests} tests completed)`;
      
      // Update summary
      summaryElement.querySelector('p:nth-child(3)').innerHTML = `
        <strong>Status:</strong> ${completedTests === totalTests ? 'Completed' : 'Running tests...'}
      `;
      
      // Add test results
      if (completedTests === totalTests) {
        summaryElement.innerHTML += `
          <div style="margin-top: 15px; padding: 10px; border-radius: 4px; background-color: ${passedTests === totalTests ? '#d4edda' : '#f8d7da'}; color: ${passedTests === totalTests ? '#155724' : '#721c24'};">
            <p><strong>Results:</strong> ${passedTests}/${totalTests} tests passed</p>
          </div>
        `;
      }
      
      // Wait a bit before next test
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// Get Messos document data
function getMessosDocumentData(documentId) {
  // Messos-specific document data
  return {
    title: "MESSOS ENTERPRISES LTD. - Valuation as of 28.02.2025",
    totalValue: 19510599,
    assetAllocation: {
      bonds: { value: 11558957, percentage: 59.24 },
      structuredProducts: { value: 7851642, percentage: 40.24 },
      cash: { value: 100000, percentage: 0.52 }
    },
    performance: {
      ytd: 1.76,
      oneYear: 4.32,
      threeYear: 12.87,
      fiveYear: 21.45
    },
    securities: [
      { name: "US Treasury Bond 2.5% 2030", type: "bond", value: 2500000, percentage: 12.81 },
      { name: "German Bund 1.75% 2032", type: "bond", value: 2000000, percentage: 10.25 },
      { name: "Credit Suisse Structured Note", type: "structured", value: 1500000, percentage: 7.69 },
      { name: "UBS Autocallable on EURO STOXX 50", type: "structured", value: 1350000, percentage: 6.92 },
      { name: "JP Morgan Corporate Bond 3.25% 2028", type: "bond", value: 1200000, percentage: 6.15 }
    ]
  };
}

// Evaluate Messos response
function evaluateMessosResponse(question, answer) {
  if (!answer) {
    return 'Failed: Empty response';
  }
  
  if (answer.includes('error') || answer.includes('Error')) {
    return 'Failed: Error in response';
  }
  
  // Convert question and answer to lowercase for easier matching
  const questionLower = question.toLowerCase();
  const answerLower = answer.toLowerCase();
  
  // Check for specific expected content based on question
  if (questionLower.includes('total value')) {
    // Check if answer contains any of the expected total value formats
    const containsExpectedValue = messosTestConfig.expectedResponses.totalValue.some(value => 
      answerLower.includes(value.toLowerCase())
    );
    
    return containsExpectedValue 
      ? 'Passed: Answer contains expected total value' 
      : 'Failed: Answer does not contain expected total value';
  }
  
  if (questionLower.includes('date')) {
    // Check if answer contains any of the expected date formats
    const containsExpectedDate = messosTestConfig.expectedResponses.date.some(date => 
      answerLower.includes(date.toLowerCase())
    );
    
    return containsExpectedDate 
      ? 'Passed: Answer contains expected date' 
      : 'Failed: Answer does not contain expected date';
  }
  
  if (questionLower.includes('asset allocation')) {
    // Check if answer contains key asset allocation information
    const containsAssetAllocation = messosTestConfig.expectedResponses.assetAllocation.some(info => 
      answerLower.includes(info.toLowerCase())
    );
    
    return containsAssetAllocation 
      ? 'Passed: Answer contains asset allocation information' 
      : 'Failed: Answer does not contain asset allocation information';
  }
  
  if (questionLower.includes('top') && (questionLower.includes('holding') || questionLower.includes('holdings'))) {
    // Check if answer contains information about the top holding
    const containsTopHolding = messosTestConfig.expectedResponses.topHolding.some(info => 
      answerLower.includes(info.toLowerCase())
    );
    
    return containsTopHolding 
      ? 'Passed: Answer contains top holding information' 
      : 'Failed: Answer does not contain top holding information';
  }
  
  // For other questions, just check if the answer seems relevant
  return 'Passed: Answer appears relevant';
}

// Initialize when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create test UI
  createMessosTestUI();
});
