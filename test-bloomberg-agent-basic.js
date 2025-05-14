/**
 * Basic Bloomberg Agent Test
 * 
 * This script tests the basic functionality of the Bloomberg Agent.
 */

const BloombergAgent = require('./bloomberg-agent');
const assert = require('assert');

// Create a Bloomberg agent
const agent = new BloombergAgent({ openrouter: 'mock-api-key' });

// Test function
async function runTest() {
  try {
    console.log('Starting Bloomberg Agent test...');
    
    // Initialize the agent
    console.log('Initializing agent...');
    await agent.start();
    console.log('Agent initialized successfully.');
    
    // Test getStockPrice
    console.log('\nTesting getStockPrice...');
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
    
    for (const symbol of symbols) {
      console.log(`Fetching price for ${symbol}...`);
      const result = await agent.getStockPrice(symbol);
      
      assert(result.success, `Failed to get price for ${symbol}`);
      assert(result.symbol === symbol, `Symbol mismatch: expected ${symbol}, got ${result.symbol}`);
      assert(typeof result.price === 'string', `Price should be a string, got ${typeof result.price}`);
      assert(typeof result.change === 'string', `Change should be a string, got ${typeof result.change}`);
      assert(typeof result.changePercent === 'string', `Change percent should be a string, got ${typeof result.changePercent}`);
      
      console.log(`${symbol}: $${result.price} (${result.change > 0 ? '+' : ''}${result.change}, ${result.changePercent}%)`);
    }
    
    // Print agent stats
    console.log('\nAgent stats:');
    console.log(`Queries processed: ${agent.stats.queriesProcessed}`);
    console.log(`Stocks analyzed: ${agent.stats.stocksAnalyzed}`);
    
    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();
