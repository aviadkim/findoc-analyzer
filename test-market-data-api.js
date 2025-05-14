/**
 * Market Data API Test Script
 * Tests the market data API endpoints
 */
const express = require('express');
const app = express();
const port = 8081; // Use a different port to avoid conflicts

// Configure middleware
app.use(express.json());

// Import and use the market data routes
const marketDataRoutes = require('./routes/market-data-routes');
app.use('/api/market-data', marketDataRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Market Data API Test Server running on port ${port}`);
  console.log('Test endpoints:');
  console.log(`- GET http://localhost:${port}/api/market-data/price/US0378331005 - Test price endpoint`);
  console.log(`- GET http://localhost:${port}/api/market-data/historical/US0378331005 - Test historical data endpoint`);
  console.log(`- PUT http://localhost:${port}/api/market-data/update-securities - Test updating securities`);
  console.log('Press Ctrl+C to stop the server');
});