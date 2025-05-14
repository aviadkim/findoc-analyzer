/**
 * Unit tests for SecuritiesExportService
 */

const fs = require('fs');
const path = require('path');
const SecuritiesExportService = require('../../services/securities-export-service');

// Create temp directory for test exports
const testDir = path.join(__dirname, '../../temp-test-exports');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Sample data
const sampleSecurities = [
  {
    id: 'sec-1',
    isin: 'US0378331005',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    type: 'Stock',
    quantity: 100,
    price: 150.50,
    value: 15050,
    marketPrice: 155.25,
    marketValue: 15525,
    priceChange: 4.75,
    priceChangePercent: 3.15,
    currency: 'USD',
    sector: 'Technology',
    country: 'US'
  },
  {
    id: 'sec-2',
    isin: 'US5949181045',
    name: 'Microsoft Corp.',
    symbol: 'MSFT',
    type: 'Stock',
    quantity: 50,
    price: 350.20,
    value: 17510,
    marketPrice: 360.15,
    marketValue: 18007.5,
    priceChange: 9.95,
    priceChangePercent: 2.84,
    currency: 'USD',
    sector: 'Technology',
    country: 'US'
  }
];

const documentInfo = {
  id: 'doc-123',
  name: 'Test Document.pdf',
  type: 'Financial Report',
  uploadDate: '2023-01-01T00:00:00.000Z',
  processingDate: '2023-01-01T01:00:00.000Z',
  extractionMethod: 'Enhanced Securities Extractor'
};

// Portfolio data for comparison testing
const samplePortfolios = [
  {
    id: 'portfolio-1',
    name: 'Portfolio 1',
    date: '2023-01-01',
    totalValue: 32560,
    securities: sampleSecurities
  },
  {
    id: 'portfolio-2',
    name: 'Portfolio 2',
    date: '2023-01-15',
    totalValue: 41200,
    securities: [
      {
        id: 'sec-1',
        isin: 'US0378331005',
        name: 'Apple Inc.',
        symbol: 'AAPL',
        type: 'Stock',
        quantity: 120,
        price: 155.50,
        value: 18660,
        currency: 'USD'
      },
      {
        id: 'sec-3',
        isin: 'US88160R1014',
        name: 'Tesla Inc.',
        symbol: 'TSLA',
        type: 'Stock',
        quantity: 45,
        price: 500.00,
        value: 22500,
        currency: 'USD'
      }
    ]
  }
];

// Initialize the service for testing
const exportService = new SecuritiesExportService({
  resultsDir: testDir,
  fallbackToCSV: true,
  fallbackToJSON: true,
  fallbackToSimpleExport: true
});

describe('SecuritiesExportService', () => {
  // Clean up test directory before tests
  beforeAll(() => {
    // Clear test directory before tests
    const files = fs.readdirSync(testDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(testDir, file));
    });
  });

  // Test prepareSecuritiesForExport method
  test('prepareSecuritiesForExport correctly processes securities', () => {
    const result = exportService.prepareSecuritiesForExport(sampleSecurities);
    
    expect(result).toHaveLength(2);
    expect(result[0].isin).toBe('US0378331005');
    expect(result[0].name).toBe('Apple Inc.');
    expect(result[1].isin).toBe('US5949181045');
    expect(result[1].name).toBe('Microsoft Corp.');
  });

  // Test getMetadata method
  test('getMetadata correctly generates metadata', () => {
    const metadata = exportService.getMetadata(documentInfo);
    
    expect(metadata.documentId).toBe('doc-123');
    expect(metadata.documentName).toBe('Test Document.pdf');
    expect(metadata.documentType).toBe('Financial Report');
    expect(metadata.extractionMethod).toBe('Enhanced Securities Extractor');
    expect(metadata.generatedBy).toBe('Securities Export Service');
  });

  // Test generateComparisonData method
  test('generateComparisonData correctly generates comparison data', () => {
    const comparisonData = exportService.generateComparisonData(samplePortfolios);
    
    expect(comparisonData).toHaveLength(3); // 3 unique securities across both portfolios
    
    // Find Apple in the comparison data
    const apple = comparisonData.find(sec => sec.isin === 'US0378331005');
    expect(apple).toBeDefined();
    expect(apple.name).toBe('Apple Inc.');
    expect(apple.portfolios).toHaveProperty('portfolio-1');
    expect(apple.portfolios).toHaveProperty('portfolio-2');
    expect(apple.portfolios['portfolio-1'].quantity).toBe(100);
    expect(apple.portfolios['portfolio-2'].quantity).toBe(120);
    
    // Find Tesla in the comparison data (only in portfolio 2)
    const tesla = comparisonData.find(sec => sec.isin === 'US88160R1014');
    expect(tesla).toBeDefined();
    expect(tesla.name).toBe('Tesla Inc.');
    expect(tesla.portfolios).toHaveProperty('portfolio-2');
    expect(tesla.portfolios).not.toHaveProperty('portfolio-1');
  });

  // Test generatePortfolioSummary method
  test('generatePortfolioSummary creates correct summary', () => {
    const summary = exportService.generatePortfolioSummary(samplePortfolios);
    
    expect(summary.totalPortfolios).toBe(2);
    expect(summary.largestPortfolio.name).toBe('Portfolio 2');
    expect(summary.largestPortfolio.value).toBe(41200);
    expect(summary.smallestPortfolio.name).toBe('Portfolio 1');
    expect(summary.smallestPortfolio.value).toBe(32560);
    expect(summary.averagePortfolioValue).toBe(36880);
    expect(summary.dateRange.oldest).toBe('2023-01-01');
    expect(summary.dateRange.newest).toBe('2023-01-15');
  });

  // Test calculateNextExecution method
  test('calculateNextExecution correctly calculates next execution time', () => {
    const now = new Date();
    
    // Test daily frequency
    const dailySchedule = { frequency: 'daily', time: '08:00' };
    const dailyResult = exportService.calculateNextExecution(dailySchedule);
    const dailyExpected = new Date();
    dailyExpected.setDate(now.getDate() + 1);
    dailyExpected.setHours(8, 0, 0, 0);
    expect(new Date(dailyResult).getDate()).toBe(dailyExpected.getDate());
    expect(new Date(dailyResult).getHours()).toBe(8);
    
    // Test weekly frequency
    const weeklySchedule = { frequency: 'weekly', time: '10:30' };
    const weeklyResult = exportService.calculateNextExecution(weeklySchedule);
    const weeklyExpected = new Date();
    weeklyExpected.setDate(now.getDate() + 7);
    weeklyExpected.setHours(10, 30, 0, 0);
    expect(new Date(weeklyResult).getDate()).toBe(weeklyExpected.getDate());
    expect(new Date(weeklyResult).getHours()).toBe(10);
    expect(new Date(weeklyResult).getMinutes()).toBe(30);
  });

  // Test JSON export
  test('exportSecuritiesToJson creates a valid JSON file', async () => {
    const options = {
      fileName: 'test-securities-export.json',
      includeMetadata: true,
      documentInfo
    };
    
    const result = await exportService.exportSecuritiesToJson(sampleSecurities, options);
    
    expect(result.success).toBe(true);
    expect(result.exportPath).toContain('test-securities-export.json');
    expect(fs.existsSync(result.exportPath)).toBe(true);
    
    // Verify file contents
    const fileContent = fs.readFileSync(result.exportPath, 'utf8');
    const exportData = JSON.parse(fileContent);
    
    expect(exportData.securities).toHaveLength(2);
    expect(exportData.metadata).toBeDefined();
    expect(exportData.metadata.documentId).toBe('doc-123');
  });

  // Test CSV fallback
  test('createSimpleCsvExport creates a valid CSV file', async () => {
    const options = {
      fileName: 'test-securities-fallback.csv',
      includeMetadata: true,
      documentInfo
    };
    
    const result = await exportService.createSimpleCsvExport(sampleSecurities, options);
    
    expect(result.success).toBe(true);
    expect(result.exportPath).toContain('test-securities-fallback.csv');
    expect(fs.existsSync(result.exportPath)).toBe(true);
    
    // Verify file contents
    const fileContent = fs.readFileSync(result.exportPath, 'utf8');
    expect(fileContent).toContain('Symbol,Name,ISIN,Type,Quantity,Price,Value,Currency,Market Price,Market Value,Price Change,Price Change %');
    expect(fileContent).toContain('AAPL,Apple Inc.,US0378331005,Stock,100,150.5,15050,USD,155.25,15525,4.75,3.15');
  });

  // Test portfolio comparison export
  test('exportPortfolioComparison creates a valid JSON comparison file', async () => {
    const options = {
      fileName: 'test-portfolio-comparison.json',
      includeMetadata: true
    };
    
    const result = await exportService.exportPortfolioComparison(samplePortfolios, 'json', options);
    
    expect(result.success).toBe(true);
    expect(result.exportPath).toContain('test-portfolio-comparison.json');
    expect(fs.existsSync(result.exportPath)).toBe(true);
    
    // Verify file contents
    const fileContent = fs.readFileSync(result.exportPath, 'utf8');
    const exportData = JSON.parse(fileContent);
    
    expect(exportData.portfolios).toHaveLength(2);
    expect(exportData.comparison).toHaveLength(3); // 3 unique securities across portfolios
    expect(exportData.summary).toBeDefined();
    expect(exportData.summary.totalPortfolios).toBe(2);
  });

  // Test escapeCSV method
  test('escapeCSV correctly escapes special characters', () => {
    expect(exportService.escapeCSV('Regular Text')).toBe('Regular Text');
    expect(exportService.escapeCSV('Text with, comma')).toBe('"Text with, comma"\'');
    expect(exportService.escapeCSV('Text with "quotes"')).toBe('"Text with ""quotes"""\'');
    expect(exportService.escapeCSV(null)).toBe('');
    expect(exportService.escapeCSV(undefined)).toBe('');
    expect(exportService.escapeCSV(123)).toBe('123');
  });
  
  // Clean up test files after all tests
  afterAll(() => {
    // Uncomment to clean up all test files
    // const files = fs.readdirSync(testDir);
    // files.forEach(file => {
    //   fs.unlinkSync(path.join(testDir, file));
    // });
    // fs.rmdirSync(testDir);
  });
});