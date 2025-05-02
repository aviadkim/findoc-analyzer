/**
 * Unit tests for document controller
 */

const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  processDocument
} = require('../../src/api/controllers/documentController');

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-123')
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  unlinkSync: jest.fn(),
  mkdirSync: jest.fn(),
  createReadStream: jest.fn().mockReturnValue({
    pipe: jest.fn()
  }),
  writeFileSync: jest.fn()
}));

// Mock agent system
jest.mock('../../src/agent_system', () => ({
  processDocumentWithAgents: jest.fn().mockResolvedValue({
    processingId: 'test-processing-id',
    documentType: 'portfolio_statement',
    securitiesCount: 10,
    totalValue: 100000,
    currency: 'USD'
  })
}));

describe('Document Controller', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response
    req = {
      file: {
        originalname: 'test-file.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: '/tmp/uploads/test-file.pdf'
      },
      user: {
        id: '1'
      },
      params: {
        id: 'test-uuid-123'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  describe('uploadDocument', () => {
    test('should upload a document successfully', async () => {
      await uploadDocument(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          id: 'test-uuid-123',
          name: 'test-file.pdf'
        })
      }));
    });
    
    test('should return error if no file is uploaded', async () => {
      req.file = undefined;
      
      await uploadDocument(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'No file uploaded'
      }));
    });
  });
  
  describe('getDocuments', () => {
    test('should return all documents', async () => {
      await getDocuments(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        count: expect.any(Number),
        data: expect.any(Array)
      }));
    });
  });
});
