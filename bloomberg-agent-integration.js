/**
 * Bloomberg Agent Integration
 * 
 * This module integrates the Bloomberg Agent with the tenant-aware system.
 */

const BloombergAgent = require('./bloomberg-agent');
const tenantManager = require('./tenant-manager');
const agentManager = require('./tenant-aware-agent-manager');

// Cache of Bloomberg agents by tenant ID
const bloombergAgents = new Map();

/**
 * Get or create a Bloomberg agent for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<BloombergAgent>} Bloomberg agent
 */
async function getBloombergAgent(tenantId) {
  try {
    // Check if agent already exists
    if (bloombergAgents.has(tenantId)) {
      return bloombergAgents.get(tenantId);
    }
    
    // Get API key for OpenRouter
    const apiKey = await tenantManager.getApiKey(tenantId, 'openrouter');
    
    // Create new agent
    const agent = new BloombergAgent({ openrouter: apiKey });
    
    // Start agent
    await agent.start();
    
    // Cache agent
    bloombergAgents.set(tenantId, agent);
    
    return agent;
  } catch (error) {
    console.error(`Error getting Bloomberg agent for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Get stock price
 * @param {string} tenantId - Tenant ID
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Stock price data
 */
async function getStockPrice(tenantId, symbol) {
  try {
    // Get agent
    const agent = await getBloombergAgent(tenantId);
    
    // Log request
    console.log(`[Tenant: ${tenantId}] Getting stock price for ${symbol}`);
    
    // Get stock price
    const result = await agent.getStockPrice(symbol);
    
    // Update agent status in tenant-aware agent manager
    updateAgentStats(tenantId, agent);
    
    return result;
  } catch (error) {
    console.error(`Error getting stock price for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Get historical stock data
 * @param {string} tenantId - Tenant ID
 * @param {string} symbol - Stock symbol
 * @param {string} interval - Data interval
 * @param {string} range - Data range
 * @returns {Promise<Object>} Historical stock data
 */
async function getHistoricalData(tenantId, symbol, interval, range) {
  try {
    // Get agent
    const agent = await getBloombergAgent(tenantId);
    
    // Log request
    console.log(`[Tenant: ${tenantId}] Getting historical data for ${symbol} (${interval}, ${range})`);
    
    // Get historical data
    const result = await agent.getHistoricalData(symbol, interval, range);
    
    // Update agent status in tenant-aware agent manager
    updateAgentStats(tenantId, agent);
    
    return result;
  } catch (error) {
    console.error(`Error getting historical data for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Generate chart
 * @param {string} tenantId - Tenant ID
 * @param {string} symbol - Stock symbol
 * @param {string} chartType - Chart type
 * @param {string} interval - Data interval
 * @param {string} range - Data range
 * @param {Object} options - Chart options
 * @returns {Promise<Object>} Chart data
 */
async function generateChart(tenantId, symbol, chartType, interval, range, options) {
  try {
    // Get agent
    const agent = await getBloombergAgent(tenantId);
    
    // Log request
    console.log(`[Tenant: ${tenantId}] Generating ${chartType} chart for ${symbol} (${interval}, ${range})`);
    
    // Generate chart
    const result = await agent.generateChart(symbol, chartType, interval, range, options);
    
    // Update agent status in tenant-aware agent manager
    updateAgentStats(tenantId, agent);
    
    return result;
  } catch (error) {
    console.error(`Error generating chart for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Answer financial question
 * @param {string} tenantId - Tenant ID
 * @param {string} question - Question to answer
 * @param {Object} options - Options for answering the question
 * @returns {Promise<Object>} Answer
 */
async function answerQuestion(tenantId, question, options) {
  try {
    // Get agent
    const agent = await getBloombergAgent(tenantId);
    
    // Log request
    console.log(`[Tenant: ${tenantId}] Answering question: ${question}`);
    
    // Answer question
    const result = await agent.answerQuestion(question, options);
    
    // Update agent status in tenant-aware agent manager
    updateAgentStats(tenantId, agent);
    
    return result;
  } catch (error) {
    console.error(`Error answering question for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Update agent stats in tenant-aware agent manager
 * @param {string} tenantId - Tenant ID
 * @param {BloombergAgent} agent - Bloomberg agent
 */
function updateAgentStats(tenantId, agent) {
  try {
    // Get agent status from tenant-aware agent manager
    const agentStatus = agentManager.getAgentStatus(tenantId, agentManager.AGENT_TYPES.BLOOMBERG);
    
    if (agentStatus) {
      // Update stats
      agentStatus.stats.queriesProcessed = agent.stats.queriesProcessed;
      agentStatus.stats.stocksAnalyzed = agent.stats.stocksAnalyzed;
      agentStatus.stats.chartsGenerated = agent.stats.chartsGenerated;
      agentStatus.stats.questionsAnswered = agent.stats.questionsAnswered;
      agentStatus.stats.averageProcessingTime = agent.stats.averageProcessingTime;
    }
  } catch (error) {
    console.error(`Error updating agent stats for tenant ${tenantId}:`, error);
  }
}

module.exports = {
  getBloombergAgent,
  getStockPrice,
  getHistoricalData,
  generateChart,
  answerQuestion
};
