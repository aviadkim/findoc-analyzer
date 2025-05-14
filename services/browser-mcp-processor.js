/**
 * Browser-based MCP Document Processor
 * 
 * Uses browser automation with Puppeteer to enhance document processing
 * with advanced entity extraction and visualization capabilities.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');

// Debug mode
const DEBUG = process.env.DEBUG === 'true';

/**
 * Process a spreadsheet document with browser-based MCPs
 * @param {string} filePath - Path to the document file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processing result with enhanced entities
 */
async function processSpreadsheetWithBrowser(filePath, options = {}) {
  let browser = null;
  
  try {
    if (DEBUG) console.log(`Processing spreadsheet with browser MCP: ${filePath}`);
    
    // Basic validation
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Get file extension
    const fileExt = path.extname(filePath).toLowerCase().slice(1);
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      throw new Error(`Unsupported file type: ${fileExt}. Expected xlsx or xls.`);
    }
    
    // Extract basic data from file
    const { sheetData, metadata } = extractSpreadsheetData(filePath);
    
    // Launch browser for enhanced processing
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Extract entities using browser-based AI
    const entities = await extractEntitiesWithBrowser(browser, sheetData, options);
    
    // Generate visualizations if requested
    let visualizations = [];
    if (options.generateVisualizations) {
      visualizations = await generateVisualizationsWithBrowser(browser, sheetData, options);
    }
    
    return {
      documentId: uuidv4(),
      fileName: path.basename(filePath),
      metadata,
      entities,
      visualizations,
      processingDate: new Date().toISOString(),
      processedWithBrowserMcp: true
    };
  } catch (error) {
    console.error(`Error in browser-based MCP processing: ${error.message}`);
    throw error;
  } finally {
    // Clean up browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extract basic data from a spreadsheet file
 * @param {string} filePath - Path to the spreadsheet file
 * @returns {Object} - Extracted sheet data and metadata
 */
function extractSpreadsheetData(filePath) {
  try {
    // Read the workbook
    const workbook = XLSX.readFile(filePath);
    
    // Get file stats
    const stats = fs.statSync(filePath);
    
    // Create metadata
    const metadata = {
      fileName: path.basename(filePath),
      fileType: path.extname(filePath).toLowerCase().slice(1),
      fileSize: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      sheetNames: workbook.SheetNames,
      sheetCount: workbook.SheetNames.length
    };
    
    // Extract sheet data
    const sheetData = {};
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      sheetData[sheetName] = jsonData;
    });
    
    return { sheetData, metadata };
  } catch (error) {
    console.error(`Error extracting spreadsheet data: ${error.message}`);
    throw error;
  }
}

/**
 * Extract entities using browser-based AI
 * @param {Object} browser - Puppeteer browser instance
 * @param {Object} sheetData - Extracted sheet data
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} - Extracted entities
 */
async function extractEntitiesWithBrowser(browser, sheetData, options = {}) {
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Load a simple HTML template for entity extraction
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Financial Entity Extraction</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          pre { background-color: #f5f5f5; padding: 10px; overflow: auto; }
          .result { margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Financial Entity Extraction</h1>
        <div id="input"></div>
        <div class="result">
          <h2>Extracted Entities</h2>
          <pre id="entities"></pre>
        </div>
        <script>
          // Function to extract entities from financial data
          async function extractFinancialEntities(data) {
            // In a real implementation, this would use a client-side AI model
            // or make an API call to an extraction service
            
            // For now, we'll simulate entity extraction with rules
            const entities = [];
            
            // Process portfolio holdings if available
            const portfolioSheet = data['Portfolio Holdings'] || [];
            if (portfolioSheet.length > 0) {
              portfolioSheet.forEach(row => {
                // Extract security entities
                if (row.ISIN && row['Security Name']) {
                  entities.push({
                    type: 'security',
                    name: row['Security Name'],
                    isin: row.ISIN,
                    ticker: row.Ticker || null,
                    quantity: row.Quantity || null,
                    price: row.Price || null,
                    marketValue: row['Market Value'] || null,
                    assetClass: row['Asset Class'] || null,
                    portfolioWeight: row['% of Portfolio'] || null,
                    confidence: 0.95
                  });
                  
                  // Also add as company
                  entities.push({
                    type: 'company',
                    name: row['Security Name'],
                    isin: row.ISIN,
                    ticker: row.Ticker || null,
                    confidence: 0.90
                  });
                }
              });
            }
            
            // Process asset allocation if available
            const allocationSheet = data['Asset Allocation'] || [];
            if (allocationSheet.length > 0) {
              allocationSheet.forEach(row => {
                if (row['Asset Class'] && row['Asset Class'] !== 'Total') {
                  entities.push({
                    type: 'assetClass',
                    name: row['Asset Class'],
                    marketValue: row['Market Value'] || null,
                    allocation: row['% of Portfolio'] || null,
                    confidence: 0.95
                  });
                }
              });
              
              // Extract total portfolio value
              const totalRow = allocationSheet.find(row => row['Asset Class'] === 'Total');
              if (totalRow && totalRow['Market Value']) {
                entities.push({
                  type: 'financialMetric',
                  name: 'Total Portfolio Value',
                  value: totalRow['Market Value'],
                  confidence: 0.98
                });
              }
            }
            
            // Process performance if available
            const performanceSheet = data['Performance'] || [];
            if (performanceSheet.length > 0) {
              performanceSheet.forEach(row => {
                if (row.Period && row.Return) {
                  entities.push({
                    type: 'financialMetric',
                    name: \`\${row.Period} Return\`,
                    value: row.Return,
                    benchmark: row['Benchmark Return'] || null,
                    outperformance: row['Relative Performance'] || null,
                    confidence: 0.95
                  });
                }
              });
            }
            
            // Process account information if available
            const accountSheet = data['Account Information'] || [];
            if (accountSheet.length > 0) {
              const accountInfo = {};
              accountSheet.forEach(row => {
                if (row.Key && row.Value) {
                  accountInfo[row.Key] = row.Value;
                }
              });
              
              if (Object.keys(accountInfo).length > 0) {
                entities.push({
                  type: 'account',
                  ...accountInfo,
                  confidence: 0.98
                });
              }
            }
            
            return entities;
          }
          
          // Initialize
          document.addEventListener('DOMContentLoaded', () => {
            // Parse input data
            const inputData = JSON.parse(document.getElementById('input').getAttribute('data-json'));
            
            // Extract entities
            extractFinancialEntities(inputData).then(entities => {
              document.getElementById('entities').textContent = JSON.stringify(entities, null, 2);
            });
          });
        </script>
      </body>
      </html>
    `);
    
    // Set input data
    await page.evaluate((jsonData) => {
      document.getElementById('input').setAttribute('data-json', JSON.stringify(jsonData));
    }, sheetData);
    
    // Wait for processing to complete
    await page.waitForFunction(() => {
      const entitiesEl = document.getElementById('entities');
      return entitiesEl && entitiesEl.textContent && entitiesEl.textContent.includes('type');
    }, { timeout: 5000 });
    
    // Extract the entities
    const entities = await page.evaluate(() => {
      const entitiesJson = document.getElementById('entities').textContent;
      return JSON.parse(entitiesJson);
    });
    
    return entities;
  } catch (error) {
    console.error(`Error extracting entities with browser: ${error.message}`);
    
    // Return example entities as fallback
    return generateFallbackEntities(sheetData);
  }
}

/**
 * Generate visualizations using browser capabilities
 * @param {Object} browser - Puppeteer browser instance
 * @param {Object} sheetData - Extracted sheet data
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} - Generated visualizations
 */
async function generateVisualizationsWithBrowser(browser, sheetData, options = {}) {
  try {
    const page = await browser.newPage();
    
    // Load a template with Chart.js
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Financial Visualizations</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .chart-container { width: 800px; height: 400px; margin: 20px; }
        </style>
      </head>
      <body>
        <div class="chart-container">
          <canvas id="portfolioChart"></canvas>
        </div>
        <div class="chart-container">
          <canvas id="performanceChart"></canvas>
        </div>
        <script>
          // Initialize with data
          const sheetData = JSON.parse(document.body.getAttribute('data-json'));
          
          // Create portfolio allocation chart
          function createPortfolioChart() {
            const portfolioSheet = sheetData['Portfolio Holdings'] || [];
            if (portfolioSheet.length === 0) return;
            
            const ctx = document.getElementById('portfolioChart');
            
            const companies = portfolioSheet.map(row => row['Security Name']);
            const values = portfolioSheet.map(row => row['Market Value']);
            
            new Chart(ctx, {
              type: 'pie',
              data: {
                labels: companies,
                datasets: [{
                  label: 'Portfolio Allocation',
                  data: values,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)',
                    'rgba(83, 102, 255, 0.7)',
                    'rgba(40, 159, 64, 0.7)',
                    'rgba(210, 199, 199, 0.7)'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Portfolio Allocation by Company'
                  }
                }
              }
            });
          }
          
          // Create performance chart
          function createPerformanceChart() {
            const performanceSheet = sheetData['Performance'] || [];
            if (performanceSheet.length === 0) return;
            
            const ctx = document.getElementById('performanceChart');
            
            const periods = performanceSheet.map(row => row['Period']);
            const returns = performanceSheet.map(row => row['Return']);
            const benchmarks = performanceSheet.map(row => row['Benchmark Return']);
            
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: periods,
                datasets: [
                  {
                    label: 'Portfolio Return',
                    data: returns,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                  },
                  {
                    label: 'Benchmark Return',
                    data: benchmarks,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                  }
                ]
              },
              options: {
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Performance Comparison'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Return (%)'
                    }
                  }
                }
              }
            });
          }
          
          // Initialize charts
          createPortfolioChart();
          createPerformanceChart();
        </script>
      </body>
      </html>
    `);
    
    // Set data and generate charts
    await page.evaluate((jsonData) => {
      document.body.setAttribute('data-json', JSON.stringify(jsonData));
    }, sheetData);
    
    // Wait for charts to render
    await page.waitForFunction(() => {
      return document.getElementById('portfolioChart') && 
             document.getElementById('performanceChart');
    }, { timeout: 5000 });
    
    // Take screenshots of each chart
    const portfolioChartScreenshot = await page.evaluate(() => {
      const canvas = document.getElementById('portfolioChart');
      return canvas ? canvas.toDataURL('image/png') : null;
    });
    
    const performanceChartScreenshot = await page.evaluate(() => {
      const canvas = document.getElementById('performanceChart');
      return canvas ? canvas.toDataURL('image/png') : null;
    });
    
    // Organize visualization results
    const visualizations = [];
    
    if (portfolioChartScreenshot) {
      visualizations.push({
        type: 'chart',
        chartType: 'pie',
        title: 'Portfolio Allocation',
        dataUrl: portfolioChartScreenshot
      });
    }
    
    if (performanceChartScreenshot) {
      visualizations.push({
        type: 'chart',
        chartType: 'bar',
        title: 'Performance Comparison',
        dataUrl: performanceChartScreenshot
      });
    }
    
    return visualizations;
  } catch (error) {
    console.error(`Error generating visualizations: ${error.message}`);
    return [];
  }
}

/**
 * Generate fallback entities when browser-based extraction fails
 * @param {Object} sheetData - Extracted sheet data
 * @returns {Array} - Fallback entities
 */
function generateFallbackEntities(sheetData) {
  try {
    const entities = [];
    
    // Extract from Portfolio Holdings if available
    const portfolioSheet = sheetData['Portfolio Holdings'] || [];
    if (portfolioSheet.length > 0) {
      portfolioSheet.forEach(row => {
        if (row.ISIN && row['Security Name']) {
          entities.push({
            type: 'security',
            name: row['Security Name'],
            isin: row.ISIN,
            ticker: row.Ticker || null,
            confidence: 0.9
          });
        }
      });
    }
    
    return entities;
  } catch (error) {
    console.error(`Error generating fallback entities: ${error.message}`);
    return [];
  }
}

module.exports = {
  processSpreadsheetWithBrowser
};