/**
 * API endpoint for handling securities data
 * GET: retrieves all securities or securities for a specific document
 * PUT: updates a specific security
 */
export default async function handler(req, res) {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // GET method - retrieve all securities or filtered by document ID
    if (req.method === 'GET') {
      // You might have a query param for specific document
      const { documentId } = req.query;
      
      // Here you would typically query your database
      // For demo, we'll use in-memory mock data
      const securities = await getSecurities(documentId);
      
      res.status(200).json({ 
        success: true, 
        securities 
      });
      return;
    }
    
    // PUT method - update an existing security
    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        res.status(400).json({ success: false, message: 'Security ID is required' });
        return;
      }
      
      // Update security in the database
      const updatedSecurity = await updateSecurity(id, req.body);
      
      res.status(200).json({
        success: true,
        data: updatedSecurity
      });
      return;
    }
    
    // POST method - create a new security
    if (req.method === 'POST') {
      // Create new security in the database
      const newSecurity = await createSecurity(req.body);
      
      res.status(201).json({
        success: true,
        data: newSecurity
      });
      return;
    }
    
    // DELETE method - delete a security
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        res.status(400).json({ success: false, message: 'Security ID is required' });
        return;
      }
      
      // Delete security from the database
      await deleteSecurity(id);
      
      res.status(200).json({
        success: true,
        message: 'Security deleted successfully'
      });
      return;
    }
    
    // Method not allowed
    res.setHeader('Allow', ['GET', 'PUT', 'POST', 'DELETE']);
    res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
    
  } catch (error) {
    console.error('Securities API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Mock data and helper functions
// In a real application, these would be replaced with database calls

// Mock securities data
const mockSecurities = [
  {
    id: '1',
    isin: 'US0378331005',
    name: 'Apple Inc.',
    type: 'stock',
    quantity: 100,
    price: 150.25,
    value: 15025,
    currency: 'USD',
    description: 'Technology company that designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.'
  },
  {
    id: '2',
    isin: 'US88160R1014',
    name: 'Tesla, Inc.',
    type: 'stock',
    quantity: 50,
    price: 275.33,
    value: 13766.5,
    currency: 'USD',
    description: 'American electric vehicle and clean energy company.'
  },
  {
    id: '3',
    isin: 'US68389X1054',
    name: 'Oracle Corporation',
    type: 'stock',
    quantity: 120,
    price: 105.65,
    value: 12678,
    currency: 'USD',
    description: 'Computer technology corporation that sells database software and technology, cloud engineered systems, and enterprise software products.'
  },
  {
    id: '4',
    isin: 'US037833AR12',
    name: 'Apple Inc. Bond 2.4% 2023',
    type: 'bond',
    quantity: 25000,
    price: 99.5,
    value: 24875,
    currency: 'USD',
    description: 'Corporate bond issued by Apple Inc. with 2.4% coupon rate, maturing in 2023.'
  },
  {
    id: '5',
    isin: 'IE00B4L5Y983',
    name: 'iShares Core MSCI World UCITS ETF',
    type: 'etf',
    quantity: 200,
    price: 75.8,
    value: 15160,
    currency: 'EUR',
    description: 'Exchange-traded fund that tracks the performance of the MSCI World Index.'
  },
  {
    id: '6',
    isin: 'GB00B03MLX29',
    name: 'Royal Dutch Shell Plc',
    type: 'stock',
    quantity: 300,
    price: 23.15,
    value: 6945,
    currency: 'GBP',
    description: 'British-Dutch multinational oil and gas company.'
  },
  {
    id: '7',
    isin: 'DE0005557508',
    name: 'Deutsche Telekom AG',
    type: 'stock',
    quantity: 175,
    price: 19.5,
    value: 3412.5,
    currency: 'EUR',
    description: 'German telecommunications company.'
  }
];

// Get all securities or filtered by document
async function getSecurities(documentId) {
  // Here you would typically query your database
  // For demo purposes, we'll just return mock data
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (documentId) {
    // In a real app, you would filter by document ID
    // For demo, we'll just return the first 3 items to simulate filtering
    return mockSecurities.slice(0, 3);
  }
  
  return mockSecurities;
}

// Update a security
async function updateSecurity(id, data) {
  // Here you would update the record in your database
  // For demo purposes, we'll just return the updated data
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { id, ...data };
}

// Create a security
async function createSecurity(data) {
  // Here you would insert the record into your database
  // For demo purposes, we'll just return the data with a new ID
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newId = Math.random().toString(36).substring(2, 11);
  return { id: newId, ...data };
}

// Delete a security
async function deleteSecurity(id) {
  // Here you would delete the record from your database
  // For demo purposes, we'll just simulate success
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Nothing to return for delete
  return;
}