/**
 * API endpoint for handling operations on a specific security
 */
export default async function handler(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      res.status(400).json({ success: false, message: 'Security ID is required' });
      return;
    }
    
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // GET method - fetch a specific security
    if (req.method === 'GET') {
      const security = await getSecurityById(id);
      
      if (!security) {
        res.status(404).json({ success: false, message: 'Security not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: security });
      return;
    }
    
    // PUT method - update a specific security
    if (req.method === 'PUT') {
      // Validate request body
      if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({ success: false, message: 'Request body is required' });
        return;
      }
      
      const updatedSecurity = await updateSecurity(id, req.body);
      
      res.status(200).json({ 
        success: true, 
        message: 'Security updated successfully',
        data: updatedSecurity 
      });
      return;
    }
    
    // DELETE method - delete a specific security
    if (req.method === 'DELETE') {
      await deleteSecurity(id);
      
      res.status(200).json({ 
        success: true, 
        message: 'Security deleted successfully' 
      });
      return;
    }
    
    // Method not allowed
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
    
  } catch (error) {
    console.error('Security API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Mock data and helper functions
// In a real application, these would be replaced with database calls

// Get a security by ID
async function getSecurityById(id) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock securities
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
    }
  ];
  
  return mockSecurities.find(security => security.id === id);
}

// Update a security
async function updateSecurity(id, data) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real application, you would update the database
  
  // Return the updated security
  return {
    id,
    ...data,
    updatedAt: new Date().toISOString()
  };
}

// Delete a security
async function deleteSecurity(id) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // In a real application, you would delete from the database
  // For this mock implementation, we'll just return
  return;
}