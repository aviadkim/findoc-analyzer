const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create test-pdfs directory if it doesn't exist
const testPdfsDir = path.join(__dirname, 'test-pdfs');
if (!fs.existsSync(testPdfsDir)) {
  fs.mkdirSync(testPdfsDir, { recursive: true });
}

// Generate a sample portfolio PDF
function generateSamplePortfolioPdf() {
  const outputPath = path.join(testPdfsDir, 'sample_portfolio.pdf');
  const doc = new PDFDocument({ margin: 50 });
  
  // Pipe the PDF to a file
  doc.pipe(fs.createWriteStream(outputPath));
  
  // Add title
  doc.fontSize(25).text('Investment Portfolio Statement', { align: 'center' });
  doc.moveDown();
  
  // Add date and client information
  doc.fontSize(12);
  doc.text('Date: June 30, 2023', { align: 'right' });
  doc.moveDown();
  doc.text('Client: John Smith');
  doc.text('Account Number: 12345-678');
  doc.moveDown(2);
  
  // Add portfolio summary
  doc.fontSize(16).text('Portfolio Summary');
  doc.moveDown();
  
  // Create a table for portfolio summary
  const summaryData = [
    ['Total Value', '$1,250,000.00'],
    ['Cash Balance', '$125,000.00'],
    ['Invested Amount', '$1,125,000.00'],
    ['Unrealized Gain/Loss', '+$75,000.00 (+7.14%)']
  ];
  
  createTable(doc, ['Description', 'Amount'], summaryData);
  doc.moveDown(2);
  
  // Add asset allocation
  doc.fontSize(16).text('Asset Allocation');
  doc.moveDown();
  
  // Create a table for asset allocation
  const allocationData = [
    ['Equities', '60%', '$750,000.00'],
    ['Fixed Income', '30%', '$375,000.00'],
    ['Cash', '10%', '$125,000.00']
  ];
  
  createTable(doc, ['Asset Class', 'Allocation', 'Value'], allocationData);
  doc.moveDown(2);
  
  // Add securities holdings
  doc.fontSize(16).text('Securities Holdings');
  doc.moveDown();
  
  // Create a table for securities holdings
  const securitiesData = [
    ['US0378331005', 'Apple Inc.', '100', '$180.00', '$18,000.00', '1.44%'],
    ['US5949181045', 'Microsoft Corp.', '150', '$340.00', '$51,000.00', '4.08%'],
    ['US0231351067', 'Amazon.com Inc.', '50', '$130.00', '$6,500.00', '0.52%'],
    ['US88160R1014', 'Tesla Inc.', '75', '$250.00', '$18,750.00', '1.50%'],
    ['US30303M1027', 'Meta Platforms Inc.', '80', '$290.00', '$23,200.00', '1.86%'],
    ['US02079K1079', 'Alphabet Inc.', '60', '$120.00', '$7,200.00', '0.58%'],
    ['US67066G1040', 'NVIDIA Corp.', '40', '$430.00', '$17,200.00', '1.38%'],
    ['US0846707026', 'Berkshire Hathaway Inc.', '25', '$350.00', '$8,750.00', '0.70%'],
    ['US46625H1005', 'JPMorgan Chase & Co.', '120', '$145.00', '$17,400.00', '1.39%'],
    ['US9497461015', 'Wells Fargo & Co.', '200', '$42.00', '$8,400.00', '0.67%']
  ];
  
  createTable(doc, ['ISIN', 'Security Name', 'Quantity', 'Price', 'Value', '% of Portfolio'], securitiesData);
  doc.moveDown(2);
  
  // Add fixed income holdings
  doc.fontSize(16).text('Fixed Income Holdings');
  doc.moveDown();
  
  // Create a table for fixed income holdings
  const fixedIncomeData = [
    ['US912828ZT04', 'US Treasury 1.125% 02/15/2031', '$100,000', '98.75', '$98,750.00', '7.90%'],
    ['US912810SU88', 'US Treasury 2.375% 05/15/2051', '$75,000', '97.50', '$73,125.00', '5.85%'],
    ['US037833DT06', 'Apple Inc. 2.400% 08/20/2030', '$50,000', '96.80', '$48,400.00', '3.87%'],
    ['US594918BW69', 'Microsoft Corp. 2.921% 03/17/2052', '$50,000', '94.25', '$47,125.00', '3.77%'],
    ['US931142EK37', 'Walmart Inc. 3.050% 07/08/2026', '$25,000', '99.50', '$24,875.00', '1.99%']
  ];
  
  createTable(doc, ['ISIN', 'Security Name', 'Face Value', 'Price', 'Value', '% of Portfolio'], fixedIncomeData);
  doc.moveDown(2);
  
  // Add transaction history
  doc.fontSize(16).text('Recent Transactions');
  doc.moveDown();
  
  // Create a table for transaction history
  const transactionData = [
    ['06/15/2023', 'Buy', 'US0378331005', 'Apple Inc.', '25', '$175.00', '$4,375.00'],
    ['06/10/2023', 'Sell', 'US5949181045', 'Microsoft Corp.', '10', '$335.00', '$3,350.00'],
    ['06/05/2023', 'Buy', 'US67066G1040', 'NVIDIA Corp.', '15', '$420.00', '$6,300.00'],
    ['05/28/2023', 'Dividend', 'US46625H1005', 'JPMorgan Chase & Co.', '-', '-', '$120.00'],
    ['05/20/2023', 'Interest', 'US912828ZT04', 'US Treasury 1.125% 02/15/2031', '-', '-', '$562.50']
  ];
  
  createTable(doc, ['Date', 'Type', 'ISIN', 'Security Name', 'Quantity', 'Price', 'Amount'], transactionData);
  
  // Add disclaimer
  doc.moveDown(2);
  doc.fontSize(10).text('Disclaimer: This is a sample portfolio statement generated for testing purposes. The securities, prices, and values shown are fictional and do not represent actual investments.', { align: 'justify' });
  
  // Finalize the PDF
  doc.end();
  
  console.log(`Sample portfolio PDF generated at: ${outputPath}`);
  return outputPath;
}

// Helper function to create a table
function createTable(doc, headers, data) {
  const tableTop = doc.y;
  const tableLeft = 50;
  const cellPadding = 5;
  const columnWidths = calculateColumnWidths(doc, headers, data);
  const rowHeight = 20;
  
  // Draw headers
  doc.font('Helvetica-Bold');
  let currentLeft = tableLeft;
  
  headers.forEach((header, i) => {
    doc.text(header, currentLeft + cellPadding, tableTop + cellPadding, {
      width: columnWidths[i] - (2 * cellPadding),
      align: 'left'
    });
    currentLeft += columnWidths[i];
  });
  
  // Draw header line
  doc.moveTo(tableLeft, tableTop + rowHeight)
     .lineTo(tableLeft + columnWidths.reduce((a, b) => a + b, 0), tableTop + rowHeight)
     .stroke();
  
  // Draw data rows
  doc.font('Helvetica');
  let currentTop = tableTop + rowHeight;
  
  data.forEach(row => {
    currentLeft = tableLeft;
    
    row.forEach((cell, i) => {
      doc.text(cell, currentLeft + cellPadding, currentTop + cellPadding, {
        width: columnWidths[i] - (2 * cellPadding),
        align: i === 0 ? 'left' : (isNumeric(cell) ? 'right' : 'left')
      });
      currentLeft += columnWidths[i];
    });
    
    currentTop += rowHeight;
  });
  
  // Update the y position
  doc.y = currentTop + cellPadding;
}

// Helper function to calculate column widths
function calculateColumnWidths(doc, headers, data) {
  const pageWidth = doc.page.width - (2 * 50); // Subtract margins
  const columnCount = headers.length;
  
  // Calculate the maximum content length for each column
  const maxLengths = headers.map((header, i) => {
    const headerLength = doc.widthOfString(header);
    const maxDataLength = data.reduce((max, row) => {
      const cellLength = doc.widthOfString(row[i] || '');
      return Math.max(max, cellLength);
    }, 0);
    
    return Math.max(headerLength, maxDataLength) + 10; // Add some padding
  });
  
  // Calculate the total width needed
  const totalNeeded = maxLengths.reduce((sum, length) => sum + length, 0);
  
  // If the total needed is less than the page width, adjust proportionally
  if (totalNeeded < pageWidth) {
    const ratio = pageWidth / totalNeeded;
    return maxLengths.map(length => length * ratio);
  }
  
  // If the total needed is more than the page width, distribute evenly
  return maxLengths.map(() => pageWidth / columnCount);
}

// Helper function to check if a string is numeric
function isNumeric(str) {
  return /^[$€£¥]?[0-9,.]+%?$/.test(str);
}

// Generate the sample portfolio PDF
generateSamplePortfolioPdf();
