/**
 * API endpoint for handling securities data for a specific document
 */
export default async function handler(req, res) {
  try {
    const { id } = req.query; // Document ID from the path
    
    if (!id) {
      res.status(400).json({ success: false, message: 'Document ID is required' });
      return;
    }
    
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // GET method - retrieve securities for a specific document
    if (req.method === 'GET') {
      // Here you would typically query your database for securities related to this document
      const securities = await getSecuritiesForDocument(id);
      
      res.status(200).json({ 
        success: true, 
        documentId: id,
        securities 
      });
      return;
    }
    
    // Method not allowed
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
    
  } catch (error) {
    console.error('Document Securities API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Mock data and helper functions
// In a real application, these would be replaced with database calls

// Get securities for a specific document
async function getSecuritiesForDocument(documentId) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data for different documents
  const mockDocumentSecurities = {
    'doc1': [
      {
        id: '101',
        isin: 'US0378331005',
        name: 'Apple Inc.',
        type: 'stock',
        quantity: 150,
        price: 152.37,
        value: 22855.5,
        currency: 'USD',
        description: 'Technology company'
      },
      {
        id: '102',
        isin: 'US5949181045',
        name: 'Microsoft Corporation',
        type: 'stock',
        quantity: 75,
        price: 305.42,
        value: 22906.5,
        currency: 'USD',
        description: 'Technology company specializing in software'
      },
      {
        id: '103',
        isin: 'US0231351067',
        name: 'Amazon.com Inc.',
        type: 'stock',
        quantity: 20,
        price: 128.25,
        value: 2565,
        currency: 'USD',
        description: 'E-commerce and cloud computing company'
      }
    ],
    'doc2': [
      {
        id: '201',
        isin: 'US4642872422',
        name: 'iShares S&P 500 Growth ETF',
        type: 'etf',
        quantity: 100,
        price: 62.75,
        value: 6275,
        currency: 'USD',
        description: 'Exchange-traded fund tracking S&P 500 Growth Index'
      },
      {
        id: '202',
        isin: 'US912810SL35',
        name: 'US Treasury Bond 2.375% 2049',
        type: 'bond',
        quantity: 50000,
        price: 98.25,
        value: 49125,
        currency: 'USD',
        description: 'Long-term government debt security'
      },
      {
        id: '203',
        isin: 'Cash_USD',
        name: 'Cash Holdings',
        type: 'cash',
        quantity: 1,
        price: 12500,
        value: 12500,
        currency: 'USD',
        description: 'Cash holdings in USD'
      }
    ],
    'doc3': [
      {
        id: '301',
        isin: 'GB00B03MLX29',
        name: 'Royal Dutch Shell Plc',
        type: 'stock',
        quantity: 300,
        price: 23.15,
        value: 6945,
        currency: 'GBP',
        description: 'British-Dutch multinational oil and gas company'
      },
      {
        id: '302',
        isin: 'DE0005557508',
        name: 'Deutsche Telekom AG',
        type: 'stock',
        quantity: 400,
        price: 19.5,
        value: 7800,
        currency: 'EUR',
        description: 'German telecommunications company'
      },
      {
        id: '303',
        isin: 'FR0000131104',
        name: 'BNP Paribas',
        type: 'stock',
        quantity: 120,
        price: 55.8,
        value: 6696,
        currency: 'EUR',
        description: 'French international banking group'
      },
      {
        id: '304',
        isin: 'EU0009658145',
        name: 'Euro Stoxx 50 ETF',
        type: 'etf',
        quantity: 85,
        price: 45.2,
        value: 3842,
        currency: 'EUR',
        description: 'ETF tracking the Euro Stoxx 50 Index'
      }
    ]
  };
  
  // Return mock data for the specified document or an empty array if not found
  return mockDocumentSecurities[documentId] || [];
}