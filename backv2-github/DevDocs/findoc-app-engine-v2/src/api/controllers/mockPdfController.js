/**
 * Mock PDF Controller
 * 
 * This controller provides mock PDF processing functionality for testing.
 */

const mockData = {
  document: {
    id: 'doc-123456',
    name: 'Test Portfolio Statement',
    type: 'financial_statement',
    status: 'processed',
    uploaded_at: new Date().toISOString(),
    processed_at: new Date().toISOString(),
    content: {
      text: "INVESTMENT PORTFOLIO STATEMENT\n\nDate: 28.02.2025\nAccount Number: 12345678\nClient: John Doe\n\nPORTFOLIO SUMMARY\nTotal Value: USD 1,250,000.00\nCurrency: USD\nValuation Date: 28.02.2025\n\nASSET ALLOCATION\nEquity: 45%\nFixed Income: 30%\nCash: 15%\nAlternative: 10%\n\nSECURITIES HOLDINGS\nAPPLE INC (US0378331005) - Equity - 500 - USD 170.00 - USD 85,000.00 - 6.8%\nMICROSOFT CORP (US5949181045) - Equity - 300 - USD 340.00 - USD 102,000.00 - 8.16%\nAMAZON.COM INC (US0231351067) - Equity - 100 - USD 950.00 - USD 95,000.00 - 7.6%\nUS TREASURY 2.5% 15/02/2045 (US912810RK35) - Bond - 200,000 - USD 0.99 - USD 198,000.00 - 15.84%\nGOLDMAN SACHS 0% NOTES 23-07.11.29 (XS2692298537) - Bond - 150,000 - USD 0.98 - USD 147,000.00 - 11.76%\n\nSECTOR ALLOCATION\nTechnology: 22.56%\nConsumer: 7.6%\nGovernment: 15.84%\nFinancial: 11.76%\nOther: 42.24%\n\nNOTES\nThis portfolio statement is for informational purposes only and does not constitute investment advice. Past performance is not indicative of future results. Please consult with your financial advisor before making any investment decisions.",
      tables: [
        {
          title: "Asset Allocation",
          headers: ["Asset Class", "Percentage"],
          rows: [
            ["Equity", "45%"],
            ["Fixed Income", "30%"],
            ["Cash", "15%"],
            ["Alternative", "10%"]
          ]
        },
        {
          title: "Securities Holdings",
          headers: ["Security", "ISIN", "Type", "Quantity", "Price", "Value", "Weight"],
          rows: [
            ["APPLE INC", "US0378331005", "Equity", "500", "USD 170.00", "USD 85,000.00", "6.8%"],
            ["MICROSOFT CORP", "US5949181045", "Equity", "300", "USD 340.00", "USD 102,000.00", "8.16%"],
            ["AMAZON.COM INC", "US0231351067", "Equity", "100", "USD 950.00", "USD 95,000.00", "7.6%"],
            ["US TREASURY 2.5% 15/02/2045", "US912810RK35", "Bond", "200,000", "USD 0.99", "USD 198,000.00", "15.84%"],
            ["GOLDMAN SACHS 0% NOTES 23-07.11.29", "XS2692298537", "Bond", "150,000", "USD 0.98", "USD 147,000.00", "11.76%"]
          ]
        }
      ]
    },
    metadata: {
      title: "Investment Portfolio Statement",
      author: "Financial Institution",
      creationDate: "2025-02-28",
      securities: [
        {
          name: "APPLE INC",
          isin: "US0378331005",
          type: "Equity",
          quantity: 500,
          price: 170.00,
          value: 85000.00,
          currency: "USD",
          weight: 0.068
        },
        {
          name: "MICROSOFT CORP",
          isin: "US5949181045",
          type: "Equity",
          quantity: 300,
          price: 340.00,
          value: 102000.00,
          currency: "USD",
          weight: 0.0816
        },
        {
          name: "AMAZON.COM INC",
          isin: "US0231351067",
          type: "Equity",
          quantity: 100,
          price: 950.00,
          value: 95000.00,
          currency: "USD",
          weight: 0.076
        },
        {
          name: "US TREASURY 2.5% 15/02/2045",
          isin: "US912810RK35",
          type: "Bond",
          quantity: 200000,
          price: 0.99,
          value: 198000.00,
          currency: "USD",
          weight: 0.1584
        },
        {
          name: "GOLDMAN SACHS 0% NOTES 23-07.11.29",
          isin: "XS2692298537",
          type: "Bond",
          quantity: 150000,
          price: 0.98,
          value: 147000.00,
          currency: "USD",
          weight: 0.1176
        }
      ],
      portfolio: {
        totalValue: 1250000.00,
        currency: "USD",
        valuationDate: "2025-02-28",
        assetAllocation: {
          equity: 0.45,
          fixedIncome: 0.30,
          cash: 0.15,
          alternative: 0.10
        },
        sectorAllocation: {
          technology: 0.2256,
          consumer: 0.076,
          government: 0.1584,
          financial: 0.1176,
          other: 0.4224
        }
      }
    }
  }
};

// In-memory storage for uploaded documents
const documents = {};

/**
 * Upload a document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const uploadDocument = (req, res) => {
  try {
    // Check if file is in request
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // Get file details
    const file = req.file || req.files[0];
    const fileName = file.originalname || file.name;
    const fileType = file.mimetype;
    
    // Validate input
    if (!req.body.name || !req.body.type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required'
      });
    }
    
    // Create document
    const documentId = `doc-${Date.now()}`;
    const document = {
      id: documentId,
      name: req.body.name,
      type: req.body.type,
      status: 'pending',
      uploaded_at: new Date().toISOString(),
      file: {
        name: fileName,
        type: fileType,
        size: file.size
      }
    };
    
    // Store document
    documents[documentId] = document;
    
    return res.status(201).json({
      success: true,
      data: {
        id: documentId,
        name: document.name,
        type: document.type,
        status: document.status,
        uploaded_at: document.uploaded_at
      }
    });
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Process a document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const processDocument = (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if document exists
    if (!documents[id] && id !== 'doc-123456') {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Return success response
    return res.json({
      success: true,
      data: {
        id: id,
        status: 'processing'
      }
    });
  } catch (error) {
    console.error('Error in processDocument:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get document by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getDocument = (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if document exists
    if (!documents[id] && id !== 'doc-123456') {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Return mock data for testing
    return res.json({
      success: true,
      data: mockData.document
    });
  } catch (error) {
    console.error('Error in getDocument:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Answer a question about a document
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const answerQuestion = (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;
    
    // Check if document exists
    if (!documents[id] && id !== 'doc-123456') {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Check if question is provided
    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }
    
    // Generate answer based on question
    let answer = '';
    const q = question.toLowerCase();
    
    if (q.includes('total value') || q.includes('portfolio value')) {
      answer = `The total value of the portfolio is ${mockData.document.metadata.portfolio.currency} ${mockData.document.metadata.portfolio.totalValue.toLocaleString()}.`;
    } else if (q.includes('how many securities') || q.includes('number of securities')) {
      answer = `There are ${mockData.document.metadata.securities.length} securities in the portfolio.`;
    } else if (q.includes('isin') && q.includes('apple')) {
      const apple = mockData.document.metadata.securities.find(s => s.name.toLowerCase().includes('apple'));
      answer = apple ? `The ISIN of Apple Inc is ${apple.isin}.` : 'Apple Inc was not found in the portfolio.';
    } else if (q.includes('weight') && q.includes('microsoft')) {
      const microsoft = mockData.document.metadata.securities.find(s => s.name.toLowerCase().includes('microsoft'));
      answer = microsoft ? `The weight of Microsoft Corp in the portfolio is ${(microsoft.weight * 100).toFixed(2)}%.` : 'Microsoft Corp was not found in the portfolio.';
    } else if (q.includes('asset allocation')) {
      const allocation = mockData.document.metadata.portfolio.assetAllocation;
      answer = `The asset allocation of the portfolio is: Equity ${(allocation.equity * 100).toFixed(0)}%, Fixed Income ${(allocation.fixedIncome * 100).toFixed(0)}%, Cash ${(allocation.cash * 100).toFixed(0)}%, and Alternative ${(allocation.alternative * 100).toFixed(0)}%.`;
    } else {
      answer = 'I don\'t have enough information to answer this question.';
    }
    
    return res.json({
      success: true,
      data: {
        question,
        answer,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in answerQuestion:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  uploadDocument,
  processDocument,
  getDocument,
  answerQuestion
};
