/**
 * Tests for the Mock PDF Controller
 */

const mockPdfController = require('../src/api/controllers/mockPdfController');

// Mock Express request and response
const mockRequest = (data = {}) => {
  return {
    body: data.body || {},
    params: data.params || {},
    file: data.file || null,
    files: data.files || null
  };
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Mock PDF Controller', () => {
  describe('uploadDocument', () => {
    it('should return 400 if no file is uploaded', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      mockPdfController.uploadDocument(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'No file uploaded'
      });
    });
    
    it('should return 400 if name or type is missing', () => {
      const req = mockRequest({
        file: {
          originalname: 'test.pdf',
          mimetype: 'application/pdf',
          size: 1024
        }
      });
      const res = mockResponse();
      
      mockPdfController.uploadDocument(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Name and type are required'
      });
    });
    
    it('should create a document successfully', () => {
      const req = mockRequest({
        file: {
          originalname: 'test.pdf',
          mimetype: 'application/pdf',
          size: 1024
        },
        body: {
          name: 'Test Document',
          type: 'financial_statement'
        }
      });
      const res = mockResponse();
      
      mockPdfController.uploadDocument(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          name: 'Test Document',
          type: 'financial_statement',
          status: 'pending'
        })
      }));
    });
  });
  
  describe('processDocument', () => {
    it('should return 404 if document is not found', () => {
      const req = mockRequest({
        params: {
          id: 'non-existent-id'
        }
      });
      const res = mockResponse();
      
      mockPdfController.processDocument(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Document not found'
      });
    });
    
    it('should process document successfully', () => {
      const req = mockRequest({
        params: {
          id: 'doc-123456'
        }
      });
      const res = mockResponse();
      
      mockPdfController.processDocument(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 'doc-123456',
          status: 'processing'
        })
      });
    });
  });
  
  describe('getDocument', () => {
    it('should return 404 if document is not found', () => {
      const req = mockRequest({
        params: {
          id: 'non-existent-id'
        }
      });
      const res = mockResponse();
      
      mockPdfController.getDocument(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Document not found'
      });
    });
    
    it('should return document successfully', () => {
      const req = mockRequest({
        params: {
          id: 'doc-123456'
        }
      });
      const res = mockResponse();
      
      mockPdfController.getDocument(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 'doc-123456',
          name: 'Test Portfolio Statement',
          type: 'financial_statement',
          status: 'processed'
        })
      });
    });
  });
  
  describe('answerQuestion', () => {
    it('should return 404 if document is not found', () => {
      const req = mockRequest({
        params: {
          id: 'non-existent-id'
        },
        body: {
          question: 'What is the total value of the portfolio?'
        }
      });
      const res = mockResponse();
      
      mockPdfController.answerQuestion(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Document not found'
      });
    });
    
    it('should return 400 if question is missing', () => {
      const req = mockRequest({
        params: {
          id: 'doc-123456'
        },
        body: {}
      });
      const res = mockResponse();
      
      mockPdfController.answerQuestion(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Question is required'
      });
    });
    
    it('should answer question about total value', () => {
      const req = mockRequest({
        params: {
          id: 'doc-123456'
        },
        body: {
          question: 'What is the total value of the portfolio?'
        }
      });
      const res = mockResponse();
      
      mockPdfController.answerQuestion(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          question: 'What is the total value of the portfolio?',
          answer: expect.stringContaining('1,250,000')
        })
      });
    });
    
    it('should answer question about securities count', () => {
      const req = mockRequest({
        params: {
          id: 'doc-123456'
        },
        body: {
          question: 'How many securities are in the portfolio?'
        }
      });
      const res = mockResponse();
      
      mockPdfController.answerQuestion(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          question: 'How many securities are in the portfolio?',
          answer: expect.stringContaining('5 securities')
        })
      });
    });
  });
});
