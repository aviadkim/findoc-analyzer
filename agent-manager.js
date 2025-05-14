/**
 * Agent Manager
 * 
 * This module manages the AI agents used by the application.
 * It provides functions for starting, stopping, and coordinating agents.
 */

const fs = require('fs');
const path = require('path');
const apiKeyManager = require('./api-key-manager');

// Agent status
const AGENT_STATUS = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  ERROR: 'error',
  LOADING: 'loading'
};

// Agent types
const AGENT_TYPES = {
  DOCUMENT_ANALYZER: 'document-analyzer',
  TABLE_UNDERSTANDING: 'table-understanding',
  SECURITIES_EXTRACTOR: 'securities-extractor',
  FINANCIAL_REASONER: 'financial-reasoner',
  COORDINATOR: 'coordinator'
};

// Agent configuration
const agents = {
  [AGENT_TYPES.DOCUMENT_ANALYZER]: {
    name: 'Document Analyzer',
    description: 'Analyzes document structure, identifies document type, and extracts metadata.',
    status: AGENT_STATUS.INACTIVE,
    apiKey: 'gemini',
    logs: [],
    stats: {
      documentsAnalyzed: 0,
      successRate: 0,
      averageProcessingTime: 0
    }
  },
  [AGENT_TYPES.TABLE_UNDERSTANDING]: {
    name: 'Table Understanding',
    description: 'Identifies tables in documents, extracts table structure and data.',
    status: AGENT_STATUS.INACTIVE,
    apiKey: 'gemini',
    logs: [],
    stats: {
      tablesExtracted: 0,
      successRate: 0,
      averageProcessingTime: 0
    }
  },
  [AGENT_TYPES.SECURITIES_EXTRACTOR]: {
    name: 'Securities Extractor',
    description: 'Identifies securities mentioned in documents and extracts their details.',
    status: AGENT_STATUS.INACTIVE,
    apiKey: 'openrouter',
    logs: [],
    stats: {
      securitiesExtracted: 0,
      successRate: 0,
      averageProcessingTime: 0
    }
  },
  [AGENT_TYPES.FINANCIAL_REASONER]: {
    name: 'Financial Reasoner',
    description: 'Analyzes financial data, calculates metrics, and identifies trends.',
    status: AGENT_STATUS.INACTIVE,
    apiKey: 'openrouter',
    logs: [],
    stats: {
      documentsAnalyzed: 0,
      insightsGenerated: 0,
      averageProcessingTime: 0
    }
  },
  [AGENT_TYPES.COORDINATOR]: {
    name: 'Coordinator',
    description: 'Coordinates the work of other agents and ensures consistent results.',
    status: AGENT_STATUS.INACTIVE,
    apiKey: 'gemini',
    logs: [],
    stats: {
      jobsCoordinated: 0,
      successRate: 0,
      averageCoordinationTime: 0
    }
  }
};

// System stats
const systemStats = {
  documentsProcessed: 0,
  activeAgents: 0,
  averageProcessingTime: 0,
  apiCallsToday: 0
};

/**
 * Initialize the agent manager
 */
function initialize() {
  // Check if API keys are available
  const openrouterKey = apiKeyManager.getApiKey('openrouter');
  const geminiKey = apiKeyManager.getApiKey('gemini');
  
  // Log initialization
  log(AGENT_TYPES.COORDINATOR, 'INFO', 'Initializing agent manager');
  
  // Start agents if API keys are available
  if (openrouterKey && geminiKey) {
    log(AGENT_TYPES.COORDINATOR, 'INFO', 'API keys found, starting agents');
    
    // Start all agents
    startAgent(AGENT_TYPES.DOCUMENT_ANALYZER);
    startAgent(AGENT_TYPES.TABLE_UNDERSTANDING);
    startAgent(AGENT_TYPES.SECURITIES_EXTRACTOR);
    startAgent(AGENT_TYPES.FINANCIAL_REASONER);
    startAgent(AGENT_TYPES.COORDINATOR);
  } else {
    log(AGENT_TYPES.COORDINATOR, 'WARNING', 'API keys not found, agents will not start');
    
    if (!openrouterKey) {
      log(AGENT_TYPES.COORDINATOR, 'WARNING', 'OpenRouter API key not found');
    }
    
    if (!geminiKey) {
      log(AGENT_TYPES.COORDINATOR, 'WARNING', 'Gemini API key not found');
    }
  }
  
  // Update system stats
  updateSystemStats();
}

/**
 * Start an agent
 * @param {string} agentType - Agent type
 * @returns {boolean} Success
 */
function startAgent(agentType) {
  if (!agents[agentType]) {
    console.error(`Agent type ${agentType} not found`);
    return false;
  }
  
  const agent = agents[agentType];
  
  // Check if API key is available
  const apiKey = apiKeyManager.getApiKey(agent.apiKey);
  
  if (!apiKey) {
    log(agentType, 'ERROR', `API key ${agent.apiKey} not found`);
    agent.status = AGENT_STATUS.ERROR;
    return false;
  }
  
  // Update agent status
  agent.status = AGENT_STATUS.LOADING;
  log(agentType, 'INFO', 'Starting agent');
  
  // Simulate agent startup
  setTimeout(() => {
    agent.status = AGENT_STATUS.ACTIVE;
    log(agentType, 'INFO', 'Agent started successfully');
    
    // Update system stats
    updateSystemStats();
  }, 1000);
  
  return true;
}

/**
 * Stop an agent
 * @param {string} agentType - Agent type
 * @returns {boolean} Success
 */
function stopAgent(agentType) {
  if (!agents[agentType]) {
    console.error(`Agent type ${agentType} not found`);
    return false;
  }
  
  const agent = agents[agentType];
  
  // Update agent status
  agent.status = AGENT_STATUS.LOADING;
  log(agentType, 'INFO', 'Stopping agent');
  
  // Simulate agent shutdown
  setTimeout(() => {
    agent.status = AGENT_STATUS.INACTIVE;
    log(agentType, 'INFO', 'Agent stopped successfully');
    
    // Update system stats
    updateSystemStats();
  }, 1000);
  
  return true;
}

/**
 * Test an agent
 * @param {string} agentType - Agent type
 * @returns {boolean} Success
 */
function testAgent(agentType) {
  if (!agents[agentType]) {
    console.error(`Agent type ${agentType} not found`);
    return false;
  }
  
  const agent = agents[agentType];
  
  // Check if API key is available
  const apiKey = apiKeyManager.getApiKey(agent.apiKey);
  
  if (!apiKey) {
    log(agentType, 'ERROR', `API key ${agent.apiKey} not found`);
    return false;
  }
  
  // Update agent status
  const previousStatus = agent.status;
  agent.status = AGENT_STATUS.LOADING;
  log(agentType, 'INFO', 'Testing agent');
  
  // Simulate agent test
  setTimeout(() => {
    agent.status = previousStatus;
    log(agentType, 'INFO', 'Agent test completed successfully');
    
    // Update system stats
    updateSystemStats();
  }, 1500);
  
  return true;
}

/**
 * Process a document with all agents
 * @param {Object} document - Document to process
 * @returns {Promise<Object>} Processing result
 */
async function processDocument(document) {
  // Check if agents are active
  const activeAgents = Object.values(agents).filter(agent => agent.status === AGENT_STATUS.ACTIVE);
  
  if (activeAgents.length === 0) {
    console.error('No active agents found');
    return {
      success: false,
      error: 'No active agents found'
    };
  }
  
  // Update system stats
  systemStats.documentsProcessed++;
  
  // Log document processing
  log(AGENT_TYPES.COORDINATOR, 'INFO', `Processing document ${document.fileName}`);
  
  // Start processing timer
  const startTime = Date.now();
  
  try {
    // Process with Document Analyzer
    if (agents[AGENT_TYPES.DOCUMENT_ANALYZER].status === AGENT_STATUS.ACTIVE) {
      log(AGENT_TYPES.DOCUMENT_ANALYZER, 'INFO', `Analyzing document ${document.fileName}`);
      
      // Simulate document analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update agent stats
      agents[AGENT_TYPES.DOCUMENT_ANALYZER].stats.documentsAnalyzed++;
      
      log(AGENT_TYPES.DOCUMENT_ANALYZER, 'INFO', `Document ${document.fileName} analyzed successfully`);
    }
    
    // Process with Table Understanding
    if (agents[AGENT_TYPES.TABLE_UNDERSTANDING].status === AGENT_STATUS.ACTIVE) {
      log(AGENT_TYPES.TABLE_UNDERSTANDING, 'INFO', `Extracting tables from ${document.fileName}`);
      
      // Simulate table extraction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update agent stats
      agents[AGENT_TYPES.TABLE_UNDERSTANDING].stats.tablesExtracted += 2; // Assuming 2 tables extracted
      
      log(AGENT_TYPES.TABLE_UNDERSTANDING, 'INFO', `Tables extracted from ${document.fileName} successfully`);
    }
    
    // Process with Securities Extractor
    if (agents[AGENT_TYPES.SECURITIES_EXTRACTOR].status === AGENT_STATUS.ACTIVE) {
      log(AGENT_TYPES.SECURITIES_EXTRACTOR, 'INFO', `Extracting securities from ${document.fileName}`);
      
      // Simulate securities extraction
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Update agent stats
      agents[AGENT_TYPES.SECURITIES_EXTRACTOR].stats.securitiesExtracted += 5; // Assuming 5 securities extracted
      
      log(AGENT_TYPES.SECURITIES_EXTRACTOR, 'INFO', `Securities extracted from ${document.fileName} successfully`);
    }
    
    // Process with Financial Reasoner
    if (agents[AGENT_TYPES.FINANCIAL_REASONER].status === AGENT_STATUS.ACTIVE) {
      log(AGENT_TYPES.FINANCIAL_REASONER, 'INFO', `Analyzing financial data in ${document.fileName}`);
      
      // Simulate financial analysis
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update agent stats
      agents[AGENT_TYPES.FINANCIAL_REASONER].stats.documentsAnalyzed++;
      agents[AGENT_TYPES.FINANCIAL_REASONER].stats.insightsGenerated += 3; // Assuming 3 insights generated
      
      log(AGENT_TYPES.FINANCIAL_REASONER, 'INFO', `Financial data in ${document.fileName} analyzed successfully`);
    }
    
    // End processing timer
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    
    // Update system stats
    systemStats.averageProcessingTime = (systemStats.averageProcessingTime * (systemStats.documentsProcessed - 1) + processingTime) / systemStats.documentsProcessed;
    
    // Log processing completion
    log(AGENT_TYPES.COORDINATOR, 'INFO', `Document ${document.fileName} processed successfully in ${processingTime.toFixed(2)}s`);
    
    // Update agent stats
    agents[AGENT_TYPES.COORDINATOR].stats.jobsCoordinated++;
    
    // Return processing result
    return {
      success: true,
      processingTime,
      document
    };
  } catch (error) {
    console.error('Error processing document:', error);
    
    // Log processing error
    log(AGENT_TYPES.COORDINATOR, 'ERROR', `Error processing document ${document.fileName}: ${error.message}`);
    
    // Return error result
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Ask a question about a document
 * @param {string} documentId - Document ID
 * @param {string} question - Question to ask
 * @returns {Promise<Object>} Answer
 */
async function askQuestion(documentId, question) {
  // Check if Financial Reasoner is active
  if (agents[AGENT_TYPES.FINANCIAL_REASONER].status !== AGENT_STATUS.ACTIVE) {
    console.error('Financial Reasoner agent is not active');
    return {
      success: false,
      error: 'Financial Reasoner agent is not active'
    };
  }
  
  // Log question
  log(AGENT_TYPES.FINANCIAL_REASONER, 'INFO', `Answering question about document ${documentId}: ${question}`);
  
  // Start processing timer
  const startTime = Date.now();
  
  try {
    // Simulate question answering
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // End processing timer
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    
    // Log answer
    log(AGENT_TYPES.FINANCIAL_REASONER, 'INFO', `Question answered in ${processingTime.toFixed(2)}s`);
    
    // Update system stats
    systemStats.apiCallsToday++;
    
    // Return answer
    return {
      success: true,
      answer: `This is a simulated answer to your question: "${question}"`,
      processingTime
    };
  } catch (error) {
    console.error('Error answering question:', error);
    
    // Log error
    log(AGENT_TYPES.FINANCIAL_REASONER, 'ERROR', `Error answering question: ${error.message}`);
    
    // Return error result
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Log a message
 * @param {string} agentType - Agent type
 * @param {string} level - Log level (INFO, WARNING, ERROR)
 * @param {string} message - Log message
 */
function log(agentType, level, message) {
  if (!agents[agentType]) {
    console.error(`Agent type ${agentType} not found`);
    return;
  }
  
  const timestamp = new Date().toISOString();
  
  // Add log to agent logs
  agents[agentType].logs.push({
    timestamp,
    level,
    message
  });
  
  // Limit logs to 100 entries
  if (agents[agentType].logs.length > 100) {
    agents[agentType].logs.shift();
  }
  
  // Log to console
  console.log(`[${timestamp}] [${agents[agentType].name}] [${level}] ${message}`);
}

/**
 * Update system stats
 */
function updateSystemStats() {
  // Count active agents
  systemStats.activeAgents = Object.values(agents).filter(agent => agent.status === AGENT_STATUS.ACTIVE).length;
}

/**
 * Get agent status
 * @param {string} agentType - Agent type
 * @returns {Object} Agent status
 */
function getAgentStatus(agentType) {
  if (!agents[agentType]) {
    console.error(`Agent type ${agentType} not found`);
    return null;
  }
  
  return {
    name: agents[agentType].name,
    description: agents[agentType].description,
    status: agents[agentType].status,
    logs: agents[agentType].logs.slice(-10), // Return last 10 logs
    stats: agents[agentType].stats
  };
}

/**
 * Get all agent statuses
 * @returns {Object} All agent statuses
 */
function getAllAgentStatuses() {
  const statuses = {};
  
  Object.keys(agents).forEach(agentType => {
    statuses[agentType] = getAgentStatus(agentType);
  });
  
  return statuses;
}

/**
 * Get system stats
 * @returns {Object} System stats
 */
function getSystemStats() {
  return { ...systemStats };
}

module.exports = {
  initialize,
  startAgent,
  stopAgent,
  testAgent,
  processDocument,
  askQuestion,
  getAgentStatus,
  getAllAgentStatuses,
  getSystemStats,
  AGENT_TYPES,
  AGENT_STATUS
};
