/**
 * Create a test Excel file
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Portfolio holdings data
const portfolioData = [
  ['Security Name', 'ISIN', 'Ticker', 'Quantity', 'Price', 'Market Value', 'Asset Class', '% of Portfolio'],
  ['Apple Inc.', 'US0378331005', 'AAPL', 100, 187.51, 18751.00, 'Equity', 15.5],
  ['Microsoft Corporation', 'US5949181045', 'MSFT', 75, 319.76, 23982.00, 'Equity', 19.8],
  ['Amazon.com Inc.', 'US0231351067', 'AMZN', 50, 173.97, 8698.50, 'Equity', 7.2],
  ['Alphabet Inc.', 'US02079K1079', 'GOOGL', 35, 172.51, 6037.85, 'Equity', 5.0],
  ['Meta Platforms Inc.', 'US30303M1027', 'META', 40, 478.22, 19128.80, 'Equity', 15.8],
  ['Tesla Inc.', 'US88160R1014', 'TSLA', 60, 175.30, 10518.00, 'Equity', 8.7],
  ['NVIDIA Corporation', 'US67066G1040', 'NVDA', 25, 925.61, 23140.25, 'Equity', 19.1],
  ['Johnson & Johnson', 'US4781601046', 'JNJ', 30, 155.87, 4676.10, 'Equity', 3.9],
  ['Visa Inc.', 'US92826C8394', 'V', 20, 279.95, 5599.00, 'Equity', 4.6],
  ['JPMorgan Chase & Co.', 'US46625H1005', 'JPM', 15, 198.53, 2977.95, 'Equity', 2.5]
];

// Create a worksheet
const worksheetPortfolio = XLSX.utils.aoa_to_sheet(portfolioData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheetPortfolio, 'Portfolio Holdings');

// Asset allocation data
const allocationData = [
  ['Asset Class', 'Market Value', '% of Portfolio'],
  ['Equities', 121509.45, 85.5],
  ['Fixed Income', 12500.00, 8.8],
  ['Cash', 5000.00, 3.5],
  ['Alternative Investments', 3100.00, 2.2],
  ['Total', 142109.45, 100.0]
];

// Create a worksheet
const worksheetAllocation = XLSX.utils.aoa_to_sheet(allocationData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheetAllocation, 'Asset Allocation');

// Performance data
const performanceData = [
  ['Time Period', 'Return %', 'Benchmark Return %', 'Difference %'],
  ['1 Month', 2.5, 2.1, 0.4],
  ['3 Months', 5.7, 4.9, 0.8],
  ['YTD', 8.3, 7.6, 0.7],
  ['1 Year', 18.2, 15.8, 2.4],
  ['3 Years', 45.7, 38.2, 7.5],
  ['5 Years', 87.3, 76.5, 10.8],
  ['Since Inception', 132.5, 118.7, 13.8]
];

// Create a worksheet
const worksheetPerformance = XLSX.utils.aoa_to_sheet(performanceData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheetPerformance, 'Performance');

// Account information data
const accountData = [
  ['Account Information', ''],
  ['Account Number', '123456789'],
  ['Account Name', 'Investment Portfolio'],
  ['Account Type', 'Individual'],
  ['Currency', 'USD'],
  ['Statement Date', '2025-05-12'],
  ['Period', 'Q2 2025'],
  ['Account Manager', 'Jane Smith'],
  ['Contact Email', 'jane.smith@example.com'],
  ['Contact Phone', '+1 (555) 123-4567']
];

// Create a worksheet
const worksheetAccount = XLSX.utils.aoa_to_sheet(accountData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheetAccount, 'Account Information');

// Add some metadata
workbook.Props = {
  Title: "Investment Portfolio Statement",
  Subject: "Q2 2025 Portfolio Statement",
  Author: "FinDoc Analyzer",
  CreatedDate: new Date()
};

// Define the output file path
const outputFile = path.join(__dirname, 'sample_portfolio.xlsx');

// Write the workbook to file
XLSX.writeFile(workbook, outputFile);

console.log(`Created test Excel file: ${outputFile}`);