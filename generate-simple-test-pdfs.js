/**
 * Generate Simple Test PDFs
 * 
 * This script generates simple financial PDFs for testing the FinDoc Analyzer application.
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Configuration
const config = {
  outputDir: 'test_pdfs/simple',
  pdfTypes: [
    'investment_portfolio',
    'bank_statement',
    'account_statement'
  ]
};

/**
 * Create an investment portfolio PDF
 * @returns {Promise<Uint8Array>} PDF bytes
 */
async function createInvestmentPortfolioPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page
  const page = pdfDoc.addPage();
  
  // Get the standard font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Set page dimensions
  const { width, height } = page.getSize();
  
  // Add title
  page.drawText('INVESTMENT PORTFOLIO STATEMENT', {
    x: 50,
    y: height - 50,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Add header information
  page.drawText('Date: 31.03.2024', {
    x: 50,
    y: height - 80,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Account Number: 87654321', {
    x: 50,
    y: height - 100,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Client: Jane Smith', {
    x: 50,
    y: height - 120,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  // Add portfolio summary
  page.drawText('PORTFOLIO SUMMARY', {
    x: 50,
    y: height - 150,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Total Value: USD 875,000.00', {
    x: 50,
    y: height - 170,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Currency: USD', {
    x: 50,
    y: height - 190,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Valuation Date: 31.03.2024', {
    x: 50,
    y: height - 210,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  // Add asset allocation
  page.drawText('ASSET ALLOCATION', {
    x: 50,
    y: height - 240,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Draw asset allocation table
  const assetAllocationData = [
    ['Asset Class', 'Percentage'],
    ['Equity', '55%'],
    ['Fixed Income', '25%'],
    ['Cash', '10%'],
    ['Alternative', '10%']
  ];
  
  drawTable(page, assetAllocationData, 50, height - 260, 200, 20, font, boldFont);
  
  // Add securities holdings
  page.drawText('SECURITIES HOLDINGS', {
    x: 50,
    y: height - 380,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Draw securities table
  const securitiesData = [
    ['Security', 'ISIN', 'Type', 'Quantity', 'Price', 'Value', 'Weight'],
    ['APPLE INC', 'US0378331005', 'Equity', '200', 'USD 175.50', 'USD 35,100.00', '4.01%'],
    ['MICROSOFT CORP', 'US5949181045', 'Equity', '150', 'USD 420.00', 'USD 63,000.00', '7.20%'],
    ['AMAZON.COM INC', 'US0231351067', 'Equity', '75', 'USD 180.25', 'USD 13,518.75', '1.55%'],
    ['NVIDIA CORP', 'US67066G1040', 'Equity', '100', 'USD 950.00', 'USD 95,000.00', '10.86%'],
    ['US TREASURY 2.0% 15/02/2050', 'US912810SQ26', 'Bond', '150,000', 'USD 0.92', 'USD 138,000.00', '15.77%']
  ];
  
  drawTable(page, securitiesData, 50, height - 400, 70, 20, font, boldFont);
  
  // Serialize the PDF to bytes
  return await pdfDoc.save();
}

/**
 * Create a bank statement PDF
 * @returns {Promise<Uint8Array>} PDF bytes
 */
async function createBankStatementPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page
  const page = pdfDoc.addPage();
  
  // Get the standard font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Set page dimensions
  const { width, height } = page.getSize();
  
  // Add title
  page.drawText('BANK STATEMENT', {
    x: 50,
    y: height - 50,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Add header information
  page.drawText('Statement Period: 01.03.2024 - 31.03.2024', {
    x: 50,
    y: height - 80,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Account Number: 12345678', {
    x: 50,
    y: height - 100,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Account Holder: John Doe', {
    x: 50,
    y: height - 120,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  // Add account summary
  page.drawText('ACCOUNT SUMMARY', {
    x: 50,
    y: height - 150,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Opening Balance: USD 5,250.75', {
    x: 50,
    y: height - 170,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Total Deposits: USD 3,500.00', {
    x: 50,
    y: height - 190,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Total Withdrawals: USD 2,175.50', {
    x: 50,
    y: height - 210,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Closing Balance: USD 6,575.25', {
    x: 50,
    y: height - 230,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  // Add transaction history
  page.drawText('TRANSACTION HISTORY', {
    x: 50,
    y: height - 260,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Draw transaction table
  const transactionData = [
    ['Date', 'Description', 'Amount', 'Balance'],
    ['03/01/2024', 'Salary Deposit', '+$3,000.00', '$8,250.75'],
    ['03/05/2024', 'Grocery Store', '-$125.50', '$8,125.25'],
    ['03/10/2024', 'Electric Bill', '-$95.00', '$8,030.25'],
    ['03/15/2024', 'ATM Withdrawal', '-$200.00', '$7,830.25'],
    ['03/20/2024', 'Restaurant', '-$85.00', '$7,745.25'],
    ['03/25/2024', 'Mobile Phone Bill', '-$70.00', '$7,675.25'],
    ['03/28/2024', 'Online Purchase', '-$600.00', '$7,075.25'],
    ['03/30/2024', 'Interest Earned', '+$500.00', '$7,575.25'],
    ['03/31/2024', 'Monthly Fee', '-$1,000.00', '$6,575.25']
  ];
  
  drawTable(page, transactionData, 50, height - 280, 120, 20, font, boldFont);
  
  // Serialize the PDF to bytes
  return await pdfDoc.save();
}

/**
 * Create an account statement PDF
 * @returns {Promise<Uint8Array>} PDF bytes
 */
async function createAccountStatementPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page
  const page = pdfDoc.addPage();
  
  // Get the standard font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Set page dimensions
  const { width, height } = page.getSize();
  
  // Add title
  page.drawText('BROKERAGE ACCOUNT STATEMENT', {
    x: 50,
    y: height - 50,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Add header information
  page.drawText('Statement Period: 01.03.2024 - 31.03.2024', {
    x: 50,
    y: height - 80,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Account Number: 98765432', {
    x: 50,
    y: height - 100,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Account Holder: Sarah Johnson', {
    x: 50,
    y: height - 120,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  // Add account summary
  page.drawText('ACCOUNT SUMMARY', {
    x: 50,
    y: height - 150,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Opening Value: USD 425,750.25', {
    x: 50,
    y: height - 170,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Deposits/Withdrawals: USD 15,000.00', {
    x: 50,
    y: height - 190,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Change in Investment Value: USD 22,500.75', {
    x: 50,
    y: height - 210,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('Closing Value: USD 463,251.00', {
    x: 50,
    y: height - 230,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  // Add asset allocation
  page.drawText('ASSET ALLOCATION', {
    x: 50,
    y: height - 260,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Draw asset allocation table
  const assetAllocationData = [
    ['Asset Class', 'Value', 'Percentage'],
    ['Equity', '$278,000.00', '60%'],
    ['Fixed Income', '$92,650.20', '20%'],
    ['Cash', '$46,325.10', '10%'],
    ['Alternative', '$46,325.10', '10%']
  ];
  
  drawTable(page, assetAllocationData, 50, height - 280, 150, 20, font, boldFont);
  
  // Add holdings
  page.drawText('ACCOUNT HOLDINGS', {
    x: 50,
    y: height - 380,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Draw holdings table
  const holdingsData = [
    ['Security', 'Symbol', 'Quantity', 'Price', 'Value', 'Weight'],
    ['APPLE INC', 'AAPL', '300', '$175.50', '$52,650.00', '11.37%'],
    ['MICROSOFT CORP', 'MSFT', '200', '$420.00', '$84,000.00', '18.13%'],
    ['AMAZON.COM INC', 'AMZN', '150', '$180.25', '$27,037.50', '5.84%'],
    ['NVIDIA CORP', 'NVDA', '120', '$950.00', '$114,000.00', '24.61%'],
    ['VANGUARD TOTAL BOND', 'BND', '500', '$72.50', '$36,250.00', '7.83%'],
    ['ISHARES CORE S&P 500', 'IVV', '100', '$475.25', '$47,525.00', '10.26%'],
    ['CASH', '', '', '', '$46,325.10', '10.00%']
  ];
  
  drawTable(page, holdingsData, 50, height - 400, 80, 20, font, boldFont);
  
  // Add transaction history
  const page2 = pdfDoc.addPage();
  
  // Add title to second page
  page2.drawText('TRANSACTION HISTORY', {
    x: 50,
    y: height - 50,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Draw transaction table
  const transactionData = [
    ['Date', 'Description', 'Quantity', 'Price', 'Amount'],
    ['03/05/2024', 'Buy AAPL', '50', '$170.25', '-$8,512.50'],
    ['03/10/2024', 'Sell MSFT', '25', '$415.00', '+$10,375.00'],
    ['03/15/2024', 'Dividend MSFT', '', '', '+$125.00'],
    ['03/20/2024', 'Buy NVDA', '20', '$925.00', '-$18,500.00'],
    ['03/25/2024', 'Deposit', '', '', '+$15,000.00'],
    ['03/28/2024', 'Dividend AAPL', '', '', '+$150.00']
  ];
  
  drawTable(page2, transactionData, 50, height - 70, 100, 20, font, boldFont);
  
  // Serialize the PDF to bytes
  return await pdfDoc.save();
}

/**
 * Draw a table on a PDF page
 * @param {PDFPage} page - PDF page
 * @param {Array<Array<string>>} data - Table data
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} cellWidth - Cell width
 * @param {number} cellHeight - Cell height
 * @param {PDFFont} font - Regular font
 * @param {PDFFont} headerFont - Header font
 */
function drawTable(page, data, x, y, cellWidth, cellHeight, font, headerFont) {
  const numColumns = data[0].length;
  const numRows = data.length;
  
  // Draw table grid
  for (let i = 0; i <= numRows; i++) {
    page.drawLine({
      start: { x, y: y - i * cellHeight },
      end: { x: x + numColumns * cellWidth, y: y - i * cellHeight },
      thickness: 1,
      color: rgb(0, 0, 0)
    });
  }
  
  for (let i = 0; i <= numColumns; i++) {
    page.drawLine({
      start: { x: x + i * cellWidth, y },
      end: { x: x + i * cellWidth, y: y - numRows * cellHeight },
      thickness: 1,
      color: rgb(0, 0, 0)
    });
  }
  
  // Draw table content
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numColumns; j++) {
      const cellFont = i === 0 ? headerFont : font;
      
      page.drawText(data[i][j], {
        x: x + j * cellWidth + 5,
        y: y - i * cellHeight - 15,
        size: 8,
        font: cellFont,
        color: rgb(0, 0, 0)
      });
    }
  }
}

/**
 * Generate test PDFs
 */
async function generateTestPDFs() {
  console.log('Generating simple test PDFs...');
  
  // Create output directory
  fs.mkdirSync(config.outputDir, { recursive: true });
  
  // Generate investment portfolio PDF
  const investmentPortfolioPDF = await createInvestmentPortfolioPDF();
  fs.writeFileSync(path.join(config.outputDir, 'investment_portfolio.pdf'), investmentPortfolioPDF);
  console.log('Investment portfolio PDF created');
  
  // Generate bank statement PDF
  const bankStatementPDF = await createBankStatementPDF();
  fs.writeFileSync(path.join(config.outputDir, 'bank_statement.pdf'), bankStatementPDF);
  console.log('Bank statement PDF created');
  
  // Generate account statement PDF
  const accountStatementPDF = await createAccountStatementPDF();
  fs.writeFileSync(path.join(config.outputDir, 'account_statement.pdf'), accountStatementPDF);
  console.log('Account statement PDF created');
  
  console.log('All simple test PDFs created successfully!');
}

// Generate test PDFs
generateTestPDFs()
  .catch(error => {
    console.error('Error generating test PDFs:', error);
  });
