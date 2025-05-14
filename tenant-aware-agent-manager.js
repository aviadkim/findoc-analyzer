/**
 * Tenant-Aware Agent Manager
 *
 * This module manages the AI agents used by the application with tenant awareness.
 * It provides functions for starting, stopping, and coordinating agents for specific tenants.
 */

const fs = require('fs');
const path = require('path');
const tenantManager = require('./tenant-manager');

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
  COORDINATOR: 'coordinator',
  PORTFOLIO_PERFORMANCE: 'portfolio-performance',
  BLOOMBERG: 'bloomberg'
};

// Agent provider mapping
const AGENT_PROVIDERS = {
  [AGENT_TYPES.DOCUMENT_ANALYZER]: 'google',
  [AGENT_TYPES.TABLE_UNDERSTANDING]: 'google',
  [AGENT_TYPES.SECURITIES_EXTRACTOR]: 'openrouter',
  [AGENT_TYPES.FINANCIAL_REASONER]: 'openrouter',
  [AGENT_TYPES.COORDINATOR]: 'google',
  [AGENT_TYPES.PORTFOLIO_PERFORMANCE]: 'openrouter',
  [AGENT_TYPES.BLOOMBERG]: 'openrouter'
};

// Tenant agent status cache
const tenantAgentStatus = new Map();

// System stats
const systemStats = {
  documentsProcessed: 0,
  activeAgents: 0,
  averageProcessingTime: 0,
  apiCallsToday: 0
};

/**
 * Get or create tenant agent status
 * @param {string} tenantId - Tenant ID
 * @returns {Object} Tenant agent status
 */
function getTenantAgentStatus(tenantId) {
  if (!tenantAgentStatus.has(tenantId)) {
    // Create new tenant agent status
    tenantAgentStatus.set(tenantId, {
      agents: {
        [AGENT_TYPES.DOCUMENT_ANALYZER]: {
          name: 'Document Analyzer',
          description: 'Analyzes document structure, identifies document type, and extracts metadata.',
          status: AGENT_STATUS.ACTIVE,
          provider: AGENT_PROVIDERS[AGENT_TYPES.DOCUMENT_ANALYZER],
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
          status: AGENT_STATUS.ACTIVE,
          provider: AGENT_PROVIDERS[AGENT_TYPES.TABLE_UNDERSTANDING],
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
          status: AGENT_STATUS.ACTIVE,
          provider: AGENT_PROVIDERS[AGENT_TYPES.SECURITIES_EXTRACTOR],
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
          status: AGENT_STATUS.ACTIVE,
          provider: AGENT_PROVIDERS[AGENT_TYPES.FINANCIAL_REASONER],
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
          status: AGENT_STATUS.ACTIVE,
          provider: AGENT_PROVIDERS[AGENT_TYPES.COORDINATOR],
          logs: [],
          stats: {
            jobsCoordinated: 0,
            successRate: 0,
            averageCoordinationTime: 0
          }
        },
        [AGENT_TYPES.PORTFOLIO_PERFORMANCE]: {
          name: 'Portfolio Performance',
          description: 'Analyzes portfolio performance over time, calculates key performance metrics, and identifies trends.',
          status: AGENT_STATUS.ACTIVE,
          provider: AGENT_PROVIDERS[AGENT_TYPES.PORTFOLIO_PERFORMANCE],
          logs: [],
          stats: {
            portfoliosAnalyzed: 0,
            metricsCalculated: 0,
            reportsGenerated: 0,
            averageProcessingTime: 0
          }
        },
        [AGENT_TYPES.BLOOMBERG]: {
          name: 'Bloomberg',
          description: 'Fetches financial data from the web, including stock prices, historical data, and charts.',
          status: AGENT_STATUS.ACTIVE,
          provider: AGENT_PROVIDERS[AGENT_TYPES.BLOOMBERG],
          logs: [],
          stats: {
            queriesProcessed: 0,
            stocksAnalyzed: 0,
            chartsGenerated: 0,
            questionsAnswered: 0,
            averageProcessingTime: 0
          }
        }
      },
      stats: {
        documentsProcessed: 0,
        activeAgents: 0,
        averageProcessingTime: 0,
        apiCallsToday: 0
      }
    });
  }

  return tenantAgentStatus.get(tenantId);
}

/**
 * Initialize the agent manager for a tenant
 * @param {string} tenantId - Tenant ID
 */
async function initializeTenant(tenantId) {
  try {
    // Get tenant agent status
    const tenantStatus = getTenantAgentStatus(tenantId);

    // Log initialization
    log(tenantId, AGENT_TYPES.COORDINATOR, 'INFO', 'Initializing agent manager for tenant');

    // Verify API keys
    const apiKeyResults = await tenantManager.verifyApiKeys(tenantId);

    // Start agents based on API key availability
    for (const [agentType, agent] of Object.entries(tenantStatus.agents)) {
      const provider = agent.provider;

      if (apiKeyResults[provider] && apiKeyResults[provider].valid) {
        // Start agent
        await startAgent(tenantId, agentType);
      } else {
        log(tenantId, agentType, 'WARNING', `API key for provider ${provider} is not valid, agent will not start`);
        agent.status = AGENT_STATUS.ERROR;
      }
    }

    // Update system stats
    updateTenantSystemStats(tenantId);

    return {
      success: true,
      activeAgents: tenantStatus.stats.activeAgents,
      totalAgents: Object.keys(tenantStatus.agents).length
    };
  } catch (error) {
    console.error(`Error initializing tenant ${tenantId}:`, error);

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Start an agent for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} agentType - Agent type
 * @returns {Promise<boolean>} Success
 */
async function startAgent(tenantId, agentType) {
  try {
    // Get tenant agent status
    const tenantStatus = getTenantAgentStatus(tenantId);

    if (!tenantStatus.agents[agentType]) {
      console.error(`Agent type ${agentType} not found for tenant ${tenantId}`);
      return false;
    }

    const agent = tenantStatus.agents[agentType];

    // Check if API key is available
    try {
      // This will throw an error if the API key is not available or valid
      await tenantManager.getApiKey(tenantId, agent.provider);
    } catch (error) {
      log(tenantId, agentType, 'ERROR', `API key for provider ${agent.provider} not available: ${error.message}`);
      agent.status = AGENT_STATUS.ERROR;
      return false;
    }

    // Update agent status
    agent.status = AGENT_STATUS.LOADING;
    log(tenantId, agentType, 'INFO', 'Starting agent');

    // Simulate agent startup
    await new Promise(resolve => setTimeout(resolve, 1000));

    agent.status = AGENT_STATUS.ACTIVE;
    log(tenantId, agentType, 'INFO', 'Agent started successfully');

    // Update system stats
    updateTenantSystemStats(tenantId);

    return true;
  } catch (error) {
    console.error(`Error starting agent ${agentType} for tenant ${tenantId}:`, error);
    return false;
  }
}

/**
 * Stop an agent for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} agentType - Agent type
 * @returns {Promise<boolean>} Success
 */
async function stopAgent(tenantId, agentType) {
  try {
    // Get tenant agent status
    const tenantStatus = getTenantAgentStatus(tenantId);

    if (!tenantStatus.agents[agentType]) {
      console.error(`Agent type ${agentType} not found for tenant ${tenantId}`);
      return false;
    }

    const agent = tenantStatus.agents[agentType];

    // Update agent status
    agent.status = AGENT_STATUS.LOADING;
    log(tenantId, agentType, 'INFO', 'Stopping agent');

    // Simulate agent shutdown
    await new Promise(resolve => setTimeout(resolve, 1000));

    agent.status = AGENT_STATUS.INACTIVE;
    log(tenantId, agentType, 'INFO', 'Agent stopped successfully');

    // Update system stats
    updateTenantSystemStats(tenantId);

    return true;
  } catch (error) {
    console.error(`Error stopping agent ${agentType} for tenant ${tenantId}:`, error);
    return false;
  }
}

/**
 * Test an agent for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} agentType - Agent type
 * @returns {Promise<boolean>} Success
 */
async function testAgent(tenantId, agentType) {
  try {
    // Get tenant agent status
    const tenantStatus = getTenantAgentStatus(tenantId);

    if (!tenantStatus.agents[agentType]) {
      console.error(`Agent type ${agentType} not found for tenant ${tenantId}`);
      return false;
    }

    const agent = tenantStatus.agents[agentType];

    // Check if API key is available
    try {
      // This will throw an error if the API key is not available or valid
      await tenantManager.getApiKey(tenantId, agent.provider);
    } catch (error) {
      log(tenantId, agentType, 'ERROR', `API key for provider ${agent.provider} not available: ${error.message}`);
      return false;
    }

    // Update agent status
    const previousStatus = agent.status;
    agent.status = AGENT_STATUS.LOADING;
    log(tenantId, agentType, 'INFO', 'Testing agent');

    // Simulate agent test
    await new Promise(resolve => setTimeout(resolve, 1500));

    agent.status = previousStatus;
    log(tenantId, agentType, 'INFO', 'Agent test completed successfully');

    // Update system stats
    updateTenantSystemStats(tenantId);

    return true;
  } catch (error) {
    console.error(`Error testing agent ${agentType} for tenant ${tenantId}:`, error);
    return false;
  }
}

/**
 * Process a document with all agents for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {Object} document - Document to process
 * @returns {Promise<Object>} Processing result
 */
async function processDocument(tenantId, document) {
  try {
    // Get tenant agent status
    const tenantStatus = getTenantAgentStatus(tenantId);

    // Check if agents are active
    const activeAgents = Object.values(tenantStatus.agents).filter(agent => agent.status === AGENT_STATUS.ACTIVE);

    if (activeAgents.length === 0) {
      console.error(`No active agents found for tenant ${tenantId}`);
      return {
        success: false,
        error: 'No active agents found'
      };
    }

    // Update system stats
    tenantStatus.stats.documentsProcessed++;
    systemStats.documentsProcessed++;

    // Log document processing
    log(tenantId, AGENT_TYPES.COORDINATOR, 'INFO', `Processing document ${document.fileName}`);

    // Start processing timer
    const startTime = Date.now();

    try {
      // Process with Document Analyzer
      if (tenantStatus.agents[AGENT_TYPES.DOCUMENT_ANALYZER].status === AGENT_STATUS.ACTIVE) {
        log(tenantId, AGENT_TYPES.DOCUMENT_ANALYZER, 'INFO', `Analyzing document ${document.fileName}`);

        // Get API key
        const apiKey = await tenantManager.getApiKey(tenantId, tenantStatus.agents[AGENT_TYPES.DOCUMENT_ANALYZER].provider);

        // Simulate document analysis
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update agent stats
        tenantStatus.agents[AGENT_TYPES.DOCUMENT_ANALYZER].stats.documentsAnalyzed++;

        log(tenantId, AGENT_TYPES.DOCUMENT_ANALYZER, 'INFO', `Document ${document.fileName} analyzed successfully`);
      }

      // Process with Table Understanding
      if (tenantStatus.agents[AGENT_TYPES.TABLE_UNDERSTANDING].status === AGENT_STATUS.ACTIVE) {
        log(tenantId, AGENT_TYPES.TABLE_UNDERSTANDING, 'INFO', `Extracting tables from ${document.fileName}`);

        // Get API key
        const apiKey = await tenantManager.getApiKey(tenantId, tenantStatus.agents[AGENT_TYPES.TABLE_UNDERSTANDING].provider);

        // Simulate table extraction
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update agent stats
        tenantStatus.agents[AGENT_TYPES.TABLE_UNDERSTANDING].stats.tablesExtracted += 2; // Assuming 2 tables extracted

        log(tenantId, AGENT_TYPES.TABLE_UNDERSTANDING, 'INFO', `Tables extracted from ${document.fileName} successfully`);
      }

      // Process with Securities Extractor
      if (tenantStatus.agents[AGENT_TYPES.SECURITIES_EXTRACTOR].status === AGENT_STATUS.ACTIVE) {
        log(tenantId, AGENT_TYPES.SECURITIES_EXTRACTOR, 'INFO', `Extracting securities from ${document.fileName}`);

        // Get API key
        const apiKey = await tenantManager.getApiKey(tenantId, tenantStatus.agents[AGENT_TYPES.SECURITIES_EXTRACTOR].provider);

        // Simulate securities extraction
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Update agent stats
        tenantStatus.agents[AGENT_TYPES.SECURITIES_EXTRACTOR].stats.securitiesExtracted += 5; // Assuming 5 securities extracted

        log(tenantId, AGENT_TYPES.SECURITIES_EXTRACTOR, 'INFO', `Securities extracted from ${document.fileName} successfully`);
      }

      // Process with Financial Reasoner
      if (tenantStatus.agents[AGENT_TYPES.FINANCIAL_REASONER].status === AGENT_STATUS.ACTIVE) {
        log(tenantId, AGENT_TYPES.FINANCIAL_REASONER, 'INFO', `Analyzing financial data in ${document.fileName}`);

        // Get API key
        const apiKey = await tenantManager.getApiKey(tenantId, tenantStatus.agents[AGENT_TYPES.FINANCIAL_REASONER].provider);

        // Simulate financial analysis
        await new Promise(resolve => setTimeout(resolve, 800));

        // Update agent stats
        tenantStatus.agents[AGENT_TYPES.FINANCIAL_REASONER].stats.documentsAnalyzed++;
        tenantStatus.agents[AGENT_TYPES.FINANCIAL_REASONER].stats.insightsGenerated += 3; // Assuming 3 insights generated

        log(tenantId, AGENT_TYPES.FINANCIAL_REASONER, 'INFO', `Financial data in ${document.fileName} analyzed successfully`);
      }

      // End processing timer
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;

      // Update system stats
      tenantStatus.stats.averageProcessingTime = (tenantStatus.stats.averageProcessingTime * (tenantStatus.stats.documentsProcessed - 1) + processingTime) / tenantStatus.stats.documentsProcessed;
      systemStats.averageProcessingTime = (systemStats.averageProcessingTime * (systemStats.documentsProcessed - 1) + processingTime) / systemStats.documentsProcessed;

      // Log processing completion
      log(tenantId, AGENT_TYPES.COORDINATOR, 'INFO', `Document ${document.fileName} processed successfully in ${processingTime.toFixed(2)}s`);

      // Update agent stats
      tenantStatus.agents[AGENT_TYPES.COORDINATOR].stats.jobsCoordinated++;

      // Return processing result
      return {
        success: true,
        processingTime,
        document
      };
    } catch (error) {
      console.error(`Error processing document for tenant ${tenantId}:`, error);

      // Log processing error
      log(tenantId, AGENT_TYPES.COORDINATOR, 'ERROR', `Error processing document ${document.fileName}: ${error.message}`);

      // Return error result
      return {
        success: false,
        error: error.message
      };
    }
  } catch (error) {
    console.error(`Error processing document for tenant ${tenantId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Ask a question about a document for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} documentId - Document ID
 * @param {string} question - Question to ask
 * @returns {Promise<Object>} Answer
 */
async function askQuestion(tenantId, documentId, question) {
  try {
    // Get tenant agent status
    const tenantStatus = getTenantAgentStatus(tenantId);

    // Check if Financial Reasoner is active
    if (tenantStatus.agents[AGENT_TYPES.FINANCIAL_REASONER].status !== AGENT_STATUS.ACTIVE) {
      console.error(`Financial Reasoner agent is not active for tenant ${tenantId}`);
      return {
        success: false,
        error: 'Financial Reasoner agent is not active'
      };
    }

    // Log question
    log(tenantId, AGENT_TYPES.FINANCIAL_REASONER, 'INFO', `Answering question about document ${documentId}: ${question}`);

    // Get API key
    const apiKey = await tenantManager.getApiKey(tenantId, tenantStatus.agents[AGENT_TYPES.FINANCIAL_REASONER].provider);

    // Start processing timer
    const startTime = Date.now();

    try {
      // Simulate question answering
      await new Promise(resolve => setTimeout(resolve, 2000));

      // End processing timer
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;

      // Log answer
      log(tenantId, AGENT_TYPES.FINANCIAL_REASONER, 'INFO', `Question answered in ${processingTime.toFixed(2)}s`);

      // Update system stats
      tenantStatus.stats.apiCallsToday++;
      systemStats.apiCallsToday++;

      // Return answer
      return {
        success: true,
        answer: `This is a simulated answer to your question: "${question}"`,
        processingTime
      };
    } catch (error) {
      console.error(`Error answering question for tenant ${tenantId}:`, error);

      // Log error
      log(tenantId, AGENT_TYPES.FINANCIAL_REASONER, 'ERROR', `Error answering question: ${error.message}`);

      // Return error result
      return {
        success: false,
        error: error.message
      };
    }
  } catch (error) {
    console.error(`Error answering question for tenant ${tenantId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Log a message for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} agentType - Agent type
 * @param {string} level - Log level (INFO, WARNING, ERROR)
 * @param {string} message - Log message
 */
function log(tenantId, agentType, level, message) {
  try {
    // Get tenant agent status
    const tenantStatus = getTenantAgentStatus(tenantId);

    if (!tenantStatus.agents[agentType]) {
      console.error(`Agent type ${agentType} not found for tenant ${tenantId}`);
      return;
    }

    const timestamp = new Date().toISOString();

    // Add log to agent logs
    tenantStatus.agents[agentType].logs.push({
      timestamp,
      level,
      message
    });

    // Limit logs to 100 entries
    if (tenantStatus.agents[agentType].logs.length > 100) {
      tenantStatus.agents[agentType].logs.shift();
    }

    // Log to console
    console.log(`[${timestamp}] [Tenant: ${tenantId}] [${tenantStatus.agents[agentType].name}] [${level}] ${message}`);
  } catch (error) {
    console.error(`Error logging message for tenant ${tenantId}:`, error);
  }
}

/**
 * Update system stats for a tenant
 * @param {string} tenantId - Tenant ID
 */
function updateTenantSystemStats(tenantId) {
  try {
    // Get tenant agent status
    const tenantStatus = getTenantAgentStatus(tenantId);

    // Count active agents
    tenantStatus.stats.activeAgents = Object.values(tenantStatus.agents).filter(agent => agent.status === AGENT_STATUS.ACTIVE).length;

    // Update global system stats
    updateSystemStats();
  } catch (error) {
    console.error(`Error updating system stats for tenant ${tenantId}:`, error);
  }
}

/**
 * Update global system stats
 */
function updateSystemStats() {
  try {
    // Count active agents across all tenants
    let totalActiveAgents = 0;

    for (const [tenantId, tenantStatus] of tenantAgentStatus.entries()) {
      totalActiveAgents += tenantStatus.stats.activeAgents;
    }

    systemStats.activeAgents = totalActiveAgents;
  } catch (error) {
    console.error('Error updating global system stats:', error);
  }
}

/**
 * Get agent status for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} agentType - Agent type
 * @returns {Object} Agent status
 */
function getAgentStatus(tenantId, agentType) {
  try {
    // Get tenant agent status
    const tenantStatus = getTenantAgentStatus(tenantId);

    if (!tenantStatus.agents[agentType]) {
      console.error(`Agent type ${agentType} not found for tenant ${tenantId}`);
      return null;
    }

    return {
      name: tenantStatus.agents[agentType].name,
      description: tenantStatus.agents[agentType].description,
      status: tenantStatus.agents[agentType].status,
      provider: tenantStatus.agents[agentType].provider,
      logs: tenantStatus.agents[agentType].logs.slice(-10), // Return last 10 logs
      stats: tenantStatus.agents[agentType].stats
    };
  } catch (error) {
    console.error(`Error getting agent status for tenant ${tenantId}:`, error);
    return null;
  }
}

/**
 * Get all agent statuses for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Object} All agent statuses
 */
function getAllAgentStatuses(tenantId) {
  try {
    // Get tenant agent status
    const tenantStatus = getTenantAgentStatus(tenantId);

    const statuses = {};

    Object.keys(tenantStatus.agents).forEach(agentType => {
      statuses[agentType] = getAgentStatus(tenantId, agentType);
    });

    return statuses;
  } catch (error) {
    console.error(`Error getting all agent statuses for tenant ${tenantId}:`, error);
    return {};
  }
}

/**
 * Get system stats for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Object} System stats
 */
function getTenantSystemStats(tenantId) {
  try {
    // Get tenant agent status
    const tenantStatus = getTenantAgentStatus(tenantId);

    return { ...tenantStatus.stats };
  } catch (error) {
    console.error(`Error getting system stats for tenant ${tenantId}:`, error);
    return {};
  }
}

/**
 * Get global system stats
 * @returns {Object} System stats
 */
function getGlobalSystemStats() {
  return { ...systemStats };
}

module.exports = {
  initializeTenant,
  startAgent,
  stopAgent,
  testAgent,
  processDocument,
  askQuestion,
  getAgentStatus,
  getAllAgentStatuses,
  getTenantSystemStats,
  getGlobalSystemStats,
  AGENT_TYPES,
  AGENT_STATUS
};
