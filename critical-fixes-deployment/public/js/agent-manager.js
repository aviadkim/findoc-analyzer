/**
 * Agent Manager for FinDoc Analyzer
 * 
 * This script manages the AI agents used in the application.
 */

// Agent types
const AGENT_TYPES = {
  DOCUMENT_ANALYZER: 'document-analyzer',
  TABLE_UNDERSTANDING: 'table-understanding',
  SECURITIES_EXTRACTOR: 'securities-extractor',
  FINANCIAL_REASONER: 'financial-reasoner',
  BLOOMBERG_AGENT: 'bloomberg-agent'
};

// Agent status
const AGENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error'
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
    description: 'Extracts securities information from documents, including ISIN, quantity, and valuation.',
    status: AGENT_STATUS.INACTIVE,
    apiKey: 'gemini',
    logs: [],
    stats: {
      securitiesExtracted: 0,
      successRate: 0,
      averageProcessingTime: 0
    }
  },
  [AGENT_TYPES.FINANCIAL_REASONER]: {
    name: 'Financial Reasoner',
    description: 'Provides financial reasoning and insights based on extracted data.',
    status: AGENT_STATUS.INACTIVE,
    apiKey: 'gemini',
    logs: [],
    stats: {
      questionsAnswered: 0,
      successRate: 0,
      averageResponseTime: 0
    }
  },
  [AGENT_TYPES.BLOOMBERG_AGENT]: {
    name: 'Bloomberg Agent',
    description: 'Retrieves real-time financial data and market information for securities.',
    status: AGENT_STATUS.INACTIVE,
    apiKey: 'gemini',
    logs: [],
    stats: {
      queriesExecuted: 0,
      successRate: 0,
      averageResponseTime: 0
    }
  }
};

/**
 * Initialize agent manager
 */
function initAgentManager() {
  console.log('Initializing agent manager');

  // Get agent status
  getAgentStatus();

  // Add event listeners
  setupAgentListeners();
}

/**
 * Get agent status
 */
async function getAgentStatus() {
  try {
    const response = await fetch('/api/agents', {
      headers: window.auth ? window.auth.getAuthHeaders() : {}
    });

    if (!response.ok) {
      throw new Error('Failed to get agent status');
    }

    const data = await response.json();
    
    // Update agent status
    data.agents.forEach(agent => {
      const agentType = Object.keys(AGENT_TYPES).find(key => 
        AGENT_TYPES[key] === agent.id || 
        AGENT_TYPES[key].replace('-', '_') === agent.id
      );
      
      if (agentType && agents[AGENT_TYPES[agentType]]) {
        agents[AGENT_TYPES[agentType]].status = agent.status;
      }
    });

    // Update UI
    updateAgentUI();
  } catch (error) {
    console.error('Error getting agent status:', error);
  }
}

/**
 * Update agent UI
 */
function updateAgentUI() {
  // Get agent elements
  const agentCards = document.querySelectorAll('.agent-card');
  
  if (agentCards.length === 0) {
    return;
  }
  
  // Update agent cards
  Object.keys(agents).forEach(agentType => {
    const agent = agents[agentType];
    const agentCard = document.querySelector(`.agent-card[data-agent="${agentType}"]`);
    
    if (agentCard) {
      // Update status
      const statusIndicator = agentCard.querySelector('.status-indicator');
      if (statusIndicator) {
        statusIndicator.className = `status-indicator ${agent.status}`;
        statusIndicator.textContent = agent.status;
      }
      
      // Update stats
      const statsElements = agentCard.querySelectorAll('.stat-value');
      if (statsElements.length > 0) {
        const stats = Object.values(agent.stats);
        statsElements.forEach((element, index) => {
          if (index < stats.length) {
            element.textContent = stats[index];
          }
        });
      }
    }
  });
}

/**
 * Setup agent listeners
 */
function setupAgentListeners() {
  // Agent action buttons
  const actionButtons = document.querySelectorAll('.agent-action');
  
  actionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const agentType = this.getAttribute('data-agent');
      const action = this.getAttribute('data-action');
      
      if (agentType && action) {
        handleAgentAction(agentType, action);
      }
    });
  });
}

/**
 * Handle agent action
 * @param {string} agentType - Agent type
 * @param {string} action - Action to perform
 */
async function handleAgentAction(agentType, action) {
  try {
    // Get agent
    const agent = agents[agentType];
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentType}`);
    }
    
    // Perform action
    switch (action) {
      case 'start':
        await startAgent(agentType);
        break;
      case 'stop':
        await stopAgent(agentType);
        break;
      case 'test':
        await testAgent(agentType);
        break;
      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error(`Error handling agent action: ${error}`);
    showAgentError(error.message);
  }
}

/**
 * Start agent
 * @param {string} agentType - Agent type
 */
async function startAgent(agentType) {
  try {
    const response = await fetch(`/api/agents/${agentType}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.auth ? window.auth.getAuthHeaders() : {})
      }
    });

    if (!response.ok) {
      throw new Error('Failed to start agent');
    }

    const data = await response.json();
    
    // Update agent status
    agents[agentType].status = AGENT_STATUS.ACTIVE;
    
    // Update UI
    updateAgentUI();
    
    // Show success message
    showAgentSuccess(`${agents[agentType].name} started successfully`);
  } catch (error) {
    console.error(`Error starting agent: ${error}`);
    showAgentError(`Failed to start ${agents[agentType].name}: ${error.message}`);
  }
}

/**
 * Stop agent
 * @param {string} agentType - Agent type
 */
async function stopAgent(agentType) {
  try {
    const response = await fetch(`/api/agents/${agentType}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.auth ? window.auth.getAuthHeaders() : {})
      }
    });

    if (!response.ok) {
      throw new Error('Failed to stop agent');
    }

    const data = await response.json();
    
    // Update agent status
    agents[agentType].status = AGENT_STATUS.INACTIVE;
    
    // Update UI
    updateAgentUI();
    
    // Show success message
    showAgentSuccess(`${agents[agentType].name} stopped successfully`);
  } catch (error) {
    console.error(`Error stopping agent: ${error}`);
    showAgentError(`Failed to stop ${agents[agentType].name}: ${error.message}`);
  }
}

/**
 * Test agent
 * @param {string} agentType - Agent type
 */
async function testAgent(agentType) {
  try {
    const response = await fetch(`/api/agents/${agentType}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(window.auth ? window.auth.getAuthHeaders() : {})
      }
    });

    if (!response.ok) {
      throw new Error('Failed to test agent');
    }

    const data = await response.json();
    
    // Show success message
    showAgentSuccess(`${agents[agentType].name} test completed successfully`);
  } catch (error) {
    console.error(`Error testing agent: ${error}`);
    showAgentError(`Failed to test ${agents[agentType].name}: ${error.message}`);
  }
}

/**
 * Show agent success message
 * @param {string} message - Success message
 */
function showAgentSuccess(message) {
  const agentNotification = document.getElementById('agent-notification');
  
  if (agentNotification) {
    agentNotification.textContent = message;
    agentNotification.className = 'notification success';
    agentNotification.style.display = 'block';
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      agentNotification.style.display = 'none';
    }, 3000);
  } else {
    console.log(message);
  }
}

/**
 * Show agent error message
 * @param {string} message - Error message
 */
function showAgentError(message) {
  const agentNotification = document.getElementById('agent-notification');
  
  if (agentNotification) {
    agentNotification.textContent = message;
    agentNotification.className = 'notification error';
    agentNotification.style.display = 'block';
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      agentNotification.style.display = 'none';
    }, 3000);
  } else {
    console.error(message);
  }
}

/**
 * Get all agents
 * @returns {Object} - All agents
 */
function getAgents() {
  return agents;
}

/**
 * Get agent by type
 * @param {string} agentType - Agent type
 * @returns {Object} - Agent
 */
function getAgent(agentType) {
  return agents[agentType];
}

// Initialize agent manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', initAgentManager);

// Export agent manager functions
window.agentManager = {
  AGENT_TYPES,
  AGENT_STATUS,
  getAgents,
  getAgent,
  startAgent,
  stopAgent,
  testAgent
};
