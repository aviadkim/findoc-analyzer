/**
 * Unit tests for agent controller
 */

const {
  queryDocument,
  getAgentStatus,
  runAgentSystem
} = require('../../src/api/controllers/agentController');

// Mock dependencies
jest.mock('../../src/agent_system', () => ({
  processDocumentWithAgents: jest.fn(),
  queryDocumentWithAgents: jest.fn().mockResolvedValue({
    query: 'test query',
    answer: 'test answer',
    timestamp: '2023-01-01T00:00:00.000Z'
  }),
  getAgentSystemStatus: jest.fn().mockResolvedValue({
    documentAnalyzer: { name: 'Document Analyzer Agent', state: { completed: true } },
    tableUnderstanding: { name: 'Table Understanding Agent', state: { completed: true } },
    securitiesExtractor: { name: 'Securities Extractor Agent', state: { completed: true } },
    financialReasoner: { name: 'Financial Reasoner Agent', state: { completed: true } },
    apiKeyConfigured: true
  }),
  runAgentSystem: jest.fn().mockResolvedValue({
    processingId: 'test-processing-id',
    documentType: 'portfolio_statement',
    securitiesCount: 10,
    totalValue: 100000,
    currency: 'USD'
  })
}));

describe('Agent Controller', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response
    req = {
      body: {
        documentId: 'test-document-id',
        query: 'test query'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  describe('queryDocument', () => {
    test('should query document successfully', async () => {
      await queryDocument(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          query: 'test query',
          answer: 'test answer'
        })
      }));
    });
    
    test('should return error if document ID is missing', async () => {
      req.body.documentId = undefined;
      
      await queryDocument(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Document ID is required'
      }));
    });
    
    test('should return error if query is missing', async () => {
      req.body.query = undefined;
      
      await queryDocument(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Query is required'
      }));
    });
  });
  
  describe('getAgentStatus', () => {
    test('should get agent status successfully', async () => {
      await getAgentStatus(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          documentAnalyzer: expect.any(Object),
          tableUnderstanding: expect.any(Object),
          securitiesExtractor: expect.any(Object),
          financialReasoner: expect.any(Object)
        })
      }));
    });
  });
  
  describe('runAgentSystem', () => {
    test('should run agent system successfully', async () => {
      await runAgentSystem(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          processingId: 'test-processing-id',
          documentType: 'portfolio_statement'
        })
      }));
    });
    
    test('should return error if document ID is missing', async () => {
      req.body.documentId = undefined;
      
      await runAgentSystem(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Document ID is required'
      }));
    });
  });
});
