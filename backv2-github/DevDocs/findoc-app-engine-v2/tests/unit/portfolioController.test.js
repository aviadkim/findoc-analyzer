/**
 * Unit tests for portfolio controller
 */

const {
  getPortfolio,
  getPortfolioSummary,
  getPortfolioAllocation,
  getPortfolioPerformance
} = require('../../src/api/controllers/portfolioController');

describe('Portfolio Controller', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request and response
    req = {};
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  describe('getPortfolio', () => {
    test('should get portfolio successfully', async () => {
      await getPortfolio(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          totalValue: expect.any(Number),
          currency: expect.any(String),
          assets: expect.any(Array),
          securities: expect.any(Array)
        })
      }));
    });
  });
  
  describe('getPortfolioSummary', () => {
    test('should get portfolio summary successfully', async () => {
      await getPortfolioSummary(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          totalValue: expect.any(Number),
          currency: expect.any(String),
          assetAllocation: expect.any(Array),
          topHoldings: expect.any(Array),
          metrics: expect.any(Object)
        })
      }));
    });
  });
  
  describe('getPortfolioAllocation', () => {
    test('should get portfolio allocation successfully', async () => {
      await getPortfolioAllocation(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          assetClasses: expect.any(Array),
          sectors: expect.any(Array),
          geography: expect.any(Array),
          currencies: expect.any(Array)
        })
      }));
    });
  });
  
  describe('getPortfolioPerformance', () => {
    test('should get portfolio performance successfully', async () => {
      await getPortfolioPerformance(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          totalReturn: expect.any(Number),
          timeWeightedReturn: expect.any(Number),
          benchmarkReturn: expect.any(Number),
          periods: expect.any(Array),
          monthlyReturns: expect.any(Array)
        })
      }));
    });
  });
});
