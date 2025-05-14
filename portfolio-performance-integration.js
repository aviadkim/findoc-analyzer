/**
 * Portfolio Performance Integration
 * 
 * This module integrates the Portfolio Performance Agent with the tenant-aware system.
 */

const PortfolioPerformanceAgent = require('./portfolio-performance-agent');
const tenantManager = require('./tenant-manager');
const agentManager = require('./tenant-aware-agent-manager');

// Cache of Portfolio Performance agents by tenant ID
const portfolioPerformanceAgents = new Map();

/**
 * Get or create a Portfolio Performance agent for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<PortfolioPerformanceAgent>} Portfolio Performance agent
 */
async function getPortfolioPerformanceAgent(tenantId) {
  try {
    // Check if agent already exists
    if (portfolioPerformanceAgents.has(tenantId)) {
      return portfolioPerformanceAgents.get(tenantId);
    }
    
    // Get API key for OpenRouter
    const apiKey = await tenantManager.getApiKey(tenantId, 'openrouter');
    
    // Create new agent
    const agent = new PortfolioPerformanceAgent({ openrouter: apiKey });
    
    // Start agent
    await agent.start();
    
    // Cache agent
    portfolioPerformanceAgents.set(tenantId, agent);
    
    return agent;
  } catch (error) {
    console.error(`Error getting Portfolio Performance agent for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Analyze portfolio performance for a document
 * @param {string} tenantId - Tenant ID
 * @param {Object} document - Document to analyze
 * @returns {Promise<Object>} Analysis result
 */
async function analyzePortfolioPerformance(tenantId, document) {
  try {
    // Get agent
    const agent = await getPortfolioPerformanceAgent(tenantId);
    
    // Log analysis
    console.log(`[Tenant: ${tenantId}] Analyzing portfolio performance for document ${document.fileName}`);
    
    // Process document
    const result = await agent.processDocument(document);
    
    // Update agent status in tenant-aware agent manager
    const agentStatus = agentManager.getAgentStatus(tenantId, agentManager.AGENT_TYPES.PORTFOLIO_PERFORMANCE);
    
    if (agentStatus) {
      agentStatus.stats.portfoliosAnalyzed = agent.stats.portfoliosAnalyzed;
      agentStatus.stats.metricsCalculated = agent.stats.metricsCalculated;
      agentStatus.stats.reportsGenerated = agent.stats.reportsGenerated;
      agentStatus.stats.averageProcessingTime = agent.stats.averageProcessingTime;
    }
    
    return result;
  } catch (error) {
    console.error(`Error analyzing portfolio performance for tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Generate a portfolio performance report
 * @param {string} tenantId - Tenant ID
 * @param {Object} portfolioData - Portfolio data
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Generated report
 */
async function generatePerformanceReport(tenantId, portfolioData, options = {}) {
  try {
    // Get agent
    const agent = await getPortfolioPerformanceAgent(tenantId);
    
    // Log report generation
    console.log(`[Tenant: ${tenantId}] Generating portfolio performance report`);
    
    // Calculate metrics
    const metrics = await agent.calculatePerformanceMetrics(portfolioData);
    
    // Analyze asset performance
    const performanceAnalysis = agent.analyzeAssetPerformance(portfolioData, metrics);
    
    // Compare against benchmarks if available
    let benchmarkComparison = null;
    if (portfolioData.benchmarks && portfolioData.benchmarks.length > 0) {
      benchmarkComparison = await agent.compareToBenchmarks(portfolioData, metrics);
    }
    
    // Generate report
    const report = await agent.generatePerformanceReport(portfolioData, metrics, performanceAnalysis, benchmarkComparison);
    
    // Update agent status in tenant-aware agent manager
    const agentStatus = agentManager.getAgentStatus(tenantId, agentManager.AGENT_TYPES.PORTFOLIO_PERFORMANCE);
    
    if (agentStatus) {
      agentStatus.stats.reportsGenerated++;
    }
    
    return {
      success: true,
      report,
      metrics,
      performanceAnalysis,
      benchmarkComparison
    };
  } catch (error) {
    console.error(`Error generating portfolio performance report for tenant ${tenantId}:`, error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  getPortfolioPerformanceAgent,
  analyzePortfolioPerformance,
  generatePerformanceReport
};
