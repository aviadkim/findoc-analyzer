/**
 * Coordinator Agent
 * 
 * This agent orchestrates the multi-agent system and manages the workflow.
 */

/**
 * Coordinator Agent
 */
class CoordinatorAgent {
  /**
   * Constructor
   * @param {object} options - Agent options
   */
  constructor(options = {}) {
    this.name = 'Coordinator Agent';
    this.description = 'Orchestrates the multi-agent system and manages the workflow';
    this.options = options;
    this.agents = options.agents || [];
    this.state = {
      processing: false,
      completed: false
    };
  }
  
  /**
   * Process document
   * @param {string} documentPath - Path to the document
   * @param {object} options - Processing options
   * @returns {Promise<object>} Processing result
   */
  async processDocument(documentPath, options = {}) {
    try {
      console.log(`Coordinator processing document: ${documentPath}`);
      
      // Update state
      this.state = {
        processing: true,
        completed: false
      };
      
      // Get agents
      const documentAnalyzer = this.getAgent('Document Analyzer Agent');
      const tableUnderstanding = this.getAgent('Table Understanding Agent');
      const securitiesExtractor = this.getAgent('Securities Extractor Agent');
      const financialReasoner = this.getAgent('Financial Reasoner Agent');
      
      if (!documentAnalyzer || !tableUnderstanding || !securitiesExtractor || !financialReasoner) {
        throw new Error('Missing required agents');
      }
      
      // Step 1: Document Analysis
      console.log('Step 1: Document Analysis');
      const documentAnalysis = await documentAnalyzer.processDocument(documentPath);
      
      // Step 2: Table Understanding
      console.log('Step 2: Table Understanding');
      const processedTables = await tableUnderstanding.processTables(documentAnalysis.tables || []);
      
      // Step 3: Securities Extraction
      console.log('Step 3: Securities Extraction');
      const securitiesResult = await securitiesExtractor.processDocument(documentAnalysis, processedTables);
      
      // Step 4: Financial Reasoning
      console.log('Step 4: Financial Reasoning');
      const financialResult = await financialReasoner.processSecurities(securitiesResult);
      
      // Create final result
      const result = {
        documentPath,
        documentType: documentAnalysis.documentType,
        metadata: documentAnalysis.metadata,
        securities: financialResult.securities,
        securitiesCount: financialResult.securitiesCount,
        totalValue: financialResult.totalValue,
        currency: financialResult.currency,
        portfolioMetrics: financialResult.portfolioMetrics,
        insights: financialResult.insights,
        processingTimestamp: new Date().toISOString()
      };
      
      // Update state
      this.state = {
        processing: false,
        completed: true
      };
      
      return result;
    } catch (error) {
      console.error('Error in Coordinator:', error);
      
      // Update state
      this.state = {
        processing: false,
        completed: false,
        error: error.message
      };
      
      throw error;
    }
  }
  
  /**
   * Get agent by name
   * @param {string} name - Agent name
   * @returns {object|null} Agent
   */
  getAgent(name) {
    return this.agents.find(agent => agent.name === name);
  }
  
  /**
   * Get agent status
   * @returns {Promise<object>} Agent status
   */
  async getStatus() {
    // Get status of each agent
    const agentStatuses = await Promise.all(
      this.agents.map(async agent => ({
        name: agent.name,
        state: agent.state
      }))
    );
    
    return {
      name: this.name,
      description: this.description,
      state: this.state,
      agents: agentStatuses
    };
  }
}

module.exports = {
  CoordinatorAgent
};
