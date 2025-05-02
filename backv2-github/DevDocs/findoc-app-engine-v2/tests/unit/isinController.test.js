/**
 * Unit tests for ISIN controller
 */

const {
  getIsins,
  getIsinById,
  getIsinDetails
} = require('../../src/api/controllers/isinController');

describe('ISIN Controller', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response
    req = {
      params: {
        id: 'US0378331005'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  describe('getIsins', () => {
    test('should get all ISINs successfully', async () => {
      await getIsins(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        count: expect.any(Number),
        data: expect.any(Array)
      }));
    });
  });
  
  describe('getIsinById', () => {
    test('should get ISIN by ID successfully', async () => {
      await getIsinById(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          isin: 'US0378331005',
          name: expect.any(String),
          quantity: expect.any(Number),
          price: expect.any(Number),
          value: expect.any(Number),
          currency: expect.any(String),
          weight: expect.any(Number)
        })
      }));
    });
    
    test('should return error if ISIN is not found', async () => {
      req.params.id = 'INVALID_ISIN';
      
      await getIsinById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'ISIN not found'
      }));
    });
  });
  
  describe('getIsinDetails', () => {
    test('should get ISIN details successfully', async () => {
      await getIsinDetails(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          isin: 'US0378331005',
          name: expect.any(String),
          ticker: expect.any(String),
          exchange: expect.any(String),
          currency: expect.any(String),
          country: expect.any(String),
          sector: expect.any(String),
          industry: expect.any(String),
          description: expect.any(String)
        })
      }));
    });
    
    test('should return error if ISIN details are not found', async () => {
      req.params.id = 'INVALID_ISIN';
      
      await getIsinDetails(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'ISIN details not found'
      }));
    });
  });
});
