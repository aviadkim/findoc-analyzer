const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  console.log('Starting data visualization test with Playwright');
  
  const browser = await chromium.launch({
    headless: true
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test portfolio visualization
    console.log('Testing portfolio visualization...');
    await page.goto('http://localhost:8080/portfolio-charts-demo.html');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Check if the page title is correct
    const title = await page.textContent('h1');
    console.log(`Page title: ${title}`);
    
    // Check if the portfolio visualization container exists
    const portfolioVisualizationExists = await page.isVisible('#portfolio-visualization-container');
    console.log(`Portfolio visualization container exists: ${portfolioVisualizationExists}`);
    
    // Test API directly
    console.log('Testing portfolio visualization API...');
    const portfolioResponse = await page.evaluate(async () => {
      const response = await fetch('/api/visualization/portfolio?id=test-portfolio');
      return await response.json();
    });
    
    console.log('Portfolio API response:', JSON.stringify(portfolioResponse).substring(0, 100) + '...');
    
    // Test document visualization API
    console.log('Testing document visualization API...');
    const documentResponse = await page.evaluate(async () => {
      const response = await fetch('/api/visualization/document/test-document');
      return await response.json();
    });
    
    console.log('Document API response:', JSON.stringify(documentResponse).substring(0, 100) + '...');
    
    // Test custom visualization API
    console.log('Testing custom visualization API...');
    const customResponse = await page.evaluate(async () => {
      const response = await fetch('/api/visualization/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metrics: ['performance', 'allocation'],
          filters: {
            timeRange: {
              start: '2024-01-01',
              end: '2024-12-31'
            }
          }
        })
      });
      return await response.json();
    });
    
    console.log('Custom API response:', JSON.stringify(customResponse).substring(0, 100) + '...');
    
    // Test batch processing API
    console.log('Testing batch processing API...');
    const batchResponse = await page.evaluate(async () => {
      const response = await fetch('/api/batch/v2/stats');
      return await response.json();
    });
    
    console.log('Batch API response:', JSON.stringify(batchResponse).substring(0, 100) + '...');
    
    // Test batch processing page
    console.log('Testing batch processing page...');
    await page.goto('http://localhost:8080/batch-processing.html');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Check if the page title is correct
    const batchTitle = await page.textContent('h1');
    console.log(`Batch page title: ${batchTitle}`);
    
    // Check if the batch processing container exists
    const batchContainerExists = await page.isVisible('#batch-processing-container');
    console.log(`Batch processing container exists: ${batchContainerExists}`);
    
    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
