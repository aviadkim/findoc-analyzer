/**
 * Mock Data Service
 * 
 * This service provides mock data for testing the PDF processing functionality
 * until the Google Authentication and other components are fully implemented.
 */

// Sample portfolio data
const samplePortfolios = [
  {
    id: 'portfolio-1',
    name: 'Investment Portfolio Statement',
    type: 'financial_statement',
    status: 'processed',
    uploaded_at: '2025-02-28T10:00:00Z',
    processed_at: '2025-02-28T10:05:00Z',
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
        },
        {
          title: "Sector Allocation",
          headers: ["Sector", "Percentage"],
          rows: [
            ["Technology", "22.56%"],
            ["Consumer", "7.6%"],
            ["Government", "15.84%"],
            ["Financial", "11.76%"],
            ["Other", "42.24%"]
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
  },
  {
    id: 'portfolio-2',
    name: 'Retirement Account Statement',
    type: 'financial_statement',
    status: 'processed',
    uploaded_at: '2025-03-15T14:30:00Z',
    processed_at: '2025-03-15T14:35:00Z',
    content: {
      text: "RETIREMENT ACCOUNT STATEMENT\n\nDate: 15.03.2025\nAccount Number: 87654321\nClient: Jane Smith\n\nACCOUNT SUMMARY\nTotal Value: USD 750,000.00\nCurrency: USD\nValuation Date: 15.03.2025\n\nASSET ALLOCATION\nEquity: 60%\nFixed Income: 25%\nCash: 10%\nAlternative: 5%\n\nINVESTMENT HOLDINGS\nVANGUARD TOTAL STOCK MARKET ETF (US9229087690) - ETF - 1,000 - USD 250.00 - USD 250,000.00 - 33.33%\nVANGUARD TOTAL BOND MARKET ETF (US9219378356) - ETF - 1,500 - USD 80.00 - USD 120,000.00 - 16.00%\nJPMORGAN CHASE & CO (US46625H1005) - Equity - 500 - USD 160.00 - USD 80,000.00 - 10.67%\nJOHNSON & JOHNSON (US4781601046) - Equity - 300 - USD 170.00 - USD 51,000.00 - 6.80%\nBERKSHIRE HATHAWAY INC (US0846707026) - Equity - 50 - USD 400.00 - USD 20,000.00 - 2.67%\n\nSECTOR ALLOCATION\nFinancial Services: 35%\nHealthcare: 15%\nTechnology: 25%\nConsumer Goods: 15%\nOther: 10%\n\nNOTES\nThis statement is for informational purposes only. Please review your investment objectives regularly and consult with your financial advisor about any changes to your retirement strategy.",
      tables: [
        {
          title: "Asset Allocation",
          headers: ["Asset Class", "Percentage"],
          rows: [
            ["Equity", "60%"],
            ["Fixed Income", "25%"],
            ["Cash", "10%"],
            ["Alternative", "5%"]
          ]
        },
        {
          title: "Investment Holdings",
          headers: ["Security", "ISIN", "Type", "Quantity", "Price", "Value", "Weight"],
          rows: [
            ["VANGUARD TOTAL STOCK MARKET ETF", "US9229087690", "ETF", "1,000", "USD 250.00", "USD 250,000.00", "33.33%"],
            ["VANGUARD TOTAL BOND MARKET ETF", "US9219378356", "ETF", "1,500", "USD 80.00", "USD 120,000.00", "16.00%"],
            ["JPMORGAN CHASE & CO", "US46625H1005", "Equity", "500", "USD 160.00", "USD 80,000.00", "10.67%"],
            ["JOHNSON & JOHNSON", "US4781601046", "Equity", "300", "USD 170.00", "USD 51,000.00", "6.80%"],
            ["BERKSHIRE HATHAWAY INC", "US0846707026", "Equity", "50", "USD 400.00", "USD 20,000.00", "2.67%"]
          ]
        }
      ]
    },
    metadata: {
      title: "Retirement Account Statement",
      author: "Financial Institution",
      creationDate: "2025-03-15",
      securities: [
        {
          name: "VANGUARD TOTAL STOCK MARKET ETF",
          isin: "US9229087690",
          type: "ETF",
          quantity: 1000,
          price: 250.00,
          value: 250000.00,
          currency: "USD",
          weight: 0.3333
        },
        {
          name: "VANGUARD TOTAL BOND MARKET ETF",
          isin: "US9219378356",
          type: "ETF",
          quantity: 1500,
          price: 80.00,
          value: 120000.00,
          currency: "USD",
          weight: 0.16
        },
        {
          name: "JPMORGAN CHASE & CO",
          isin: "US46625H1005",
          type: "Equity",
          quantity: 500,
          price: 160.00,
          value: 80000.00,
          currency: "USD",
          weight: 0.1067
        },
        {
          name: "JOHNSON & JOHNSON",
          isin: "US4781601046",
          type: "Equity",
          quantity: 300,
          price: 170.00,
          value: 51000.00,
          currency: "USD",
          weight: 0.068
        },
        {
          name: "BERKSHIRE HATHAWAY INC",
          isin: "US0846707026",
          type: "Equity",
          quantity: 50,
          price: 400.00,
          value: 20000.00,
          currency: "USD",
          weight: 0.0267
        }
      ],
      portfolio: {
        totalValue: 750000.00,
        currency: "USD",
        valuationDate: "2025-03-15",
        assetAllocation: {
          equity: 0.60,
          fixedIncome: 0.25,
          cash: 0.10,
          alternative: 0.05
        },
        sectorAllocation: {
          financialServices: 0.35,
          healthcare: 0.15,
          technology: 0.25,
          consumerGoods: 0.15,
          other: 0.10
        }
      }
    }
  }
];

// In-memory storage for uploaded documents
const documents = [...samplePortfolios];

/**
 * Get all documents
 * @returns {Array} Array of documents
 */
const getAllDocuments = () => {
  return documents;
};

/**
 * Get document by ID
 * @param {string} id - Document ID
 * @returns {Object|null} Document or null if not found
 */
const getDocumentById = (id) => {
  return documents.find(doc => doc.id === id) || null;
};

/**
 * Create a new document
 * @param {Object} document - Document object
 * @returns {Object} Created document
 */
const createDocument = (document) => {
  const newDocument = {
    id: document.id || `doc-${Date.now()}`,
    name: document.name,
    type: document.type,
    status: 'pending',
    uploaded_at: new Date().toISOString(),
    content: {},
    metadata: {}
  };
  
  documents.push(newDocument);
  return newDocument;
};

/**
 * Process a document
 * @param {string} id - Document ID
 * @param {Object} options - Processing options
 * @returns {Object} Processed document
 */
const processDocument = (id, options = {}) => {
  const document = getDocumentById(id);
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Simulate processing delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Update document with processed data
      document.status = 'processed';
      document.processed_at = new Date().toISOString();
      
      // Add mock content and metadata based on document type
      if (document.type === 'financial_statement') {
        // Use sample data from the first portfolio
        const sampleData = samplePortfolios[0];
        document.content = sampleData.content;
        document.metadata = sampleData.metadata;
      } else {
        // Generic mock data
        document.content = {
          text: `Sample content for ${document.name}`,
          tables: []
        };
        document.metadata = {
          title: document.name,
          author: 'System',
          creationDate: new Date().toISOString()
        };
      }
      
      resolve(document);
    }, 2000); // Simulate 2-second processing time
  });
};

/**
 * Answer a question about a document
 * @param {string} id - Document ID
 * @param {string} question - Question to answer
 * @returns {Object} Answer object
 */
const answerQuestion = (id, question) => {
  const document = getDocumentById(id);
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  if (document.status !== 'processed') {
    throw new Error('Document has not been processed yet');
  }
  
  // Mock answers based on question and document content
  const q = question.toLowerCase();
  let answer = '';
  
  if (q.includes('total value') || q.includes('portfolio value')) {
    answer = `The total value of the portfolio is ${document.metadata.portfolio.currency} ${document.metadata.portfolio.totalValue.toFixed(2)}.`;
  } else if (q.includes('how many securities') || q.includes('number of securities')) {
    answer = `There are ${document.metadata.securities.length} securities in the portfolio.`;
  } else if (q.includes('isin') && q.includes('apple')) {
    const apple = document.metadata.securities.find(s => s.name.toLowerCase().includes('apple'));
    answer = apple ? `The ISIN of Apple Inc is ${apple.isin}.` : 'Apple Inc was not found in the portfolio.';
  } else if (q.includes('weight') && q.includes('microsoft')) {
    const microsoft = document.metadata.securities.find(s => s.name.toLowerCase().includes('microsoft'));
    answer = microsoft ? `The weight of Microsoft Corp in the portfolio is ${(microsoft.weight * 100).toFixed(2)}%.` : 'Microsoft Corp was not found in the portfolio.';
  } else if (q.includes('asset allocation')) {
    const allocation = document.metadata.portfolio.assetAllocation;
    answer = `The asset allocation of the portfolio is: Equity ${(allocation.equity * 100).toFixed(0)}%, Fixed Income ${(allocation.fixedIncome * 100).toFixed(0)}%, Cash ${(allocation.cash * 100).toFixed(0)}%, and Alternative ${(allocation.alternative * 100).toFixed(0)}%.`;
  } else if (q.includes('summarize') || q.includes('summary')) {
    answer = `This is a ${document.type} for ${document.name} with a total value of ${document.metadata.portfolio.currency} ${document.metadata.portfolio.totalValue.toFixed(2)}. It contains ${document.metadata.securities.length} securities across various asset classes and sectors.`;
  } else {
    answer = 'I don\'t have enough information to answer this question.';
  }
  
  return {
    question,
    answer,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  processDocument,
  answerQuestion
};
