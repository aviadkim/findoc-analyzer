const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a sample financial document for testing
 */
function generateSamplePortfolioPDF() {
  const outputPath = path.join(__dirname, 'sample_portfolio.pdf');
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4'
  });
  
  // Pipe output to a file
  doc.pipe(fs.createWriteStream(outputPath));
  
  // Document title
  doc.fontSize(24).text('Portfolio Statement', {
    align: 'center'
  });
  doc.moveDown();
  
  // Account information
  doc.fontSize(12);
  doc.text('Account: 12345678', { continued: true });
  doc.text('Date: June 15, 2025', { align: 'right' });
  doc.moveDown(2);
  
  // Holdings summary title
  doc.fontSize(16).text('Holdings Summary:');
  doc.moveDown();
  
  // Table header
  doc.fontSize(10);
  const tableTop = doc.y;
  const tableLeft = 50;
  
  // Table columns
  const columns = [
    { id: 'security', header: 'Security', width: 120 },
    { id: 'isin', header: 'ISIN', width: 100 },
    { id: 'quantity', header: 'Quantity', width: 60, align: 'right' },
    { id: 'price', header: 'Price', width: 80, align: 'right' },
    { id: 'value', header: 'Value', width: 80, align: 'right' },
    { id: 'weight', header: 'Weight', width: 60, align: 'right' }
  ];
  
  // Header row
  let x = tableLeft;
  columns.forEach(column => {
    doc.text(column.header, x, tableTop, {
      width: column.width,
      align: column.align || 'left'
    });
    x += column.width;
  });
  
  // Draw header separator
  doc.moveDown();
  doc.moveTo(tableLeft, doc.y)
     .lineTo(tableLeft + columns.reduce((sum, col) => sum + col.width, 0), doc.y)
     .stroke();
  doc.moveDown(0.5);
  
  // Table data
  const data = [
    { security: 'Apple Inc.', isin: 'US0378331005', quantity: 50, price: '$205.45', value: '$10,272.50', weight: '12.5%' },
    { security: 'Microsoft Corp', isin: 'US5949181045', quantity: 75, price: '$410.20', value: '$30,765.00', weight: '37.4%' },
    { security: 'Tesla Inc.', isin: 'US88160R1014', quantity: 40, price: '$315.80', value: '$12,632.00', weight: '15.3%' },
    { security: 'Alphabet Inc.', isin: 'US02079K1079', quantity: 25, price: '$180.65', value: '$4,516.25', weight: '5.5%' },
    { security: 'Amazon.com Inc.', isin: 'US0231351067', quantity: 20, price: '$175.30', value: '$3,506.00', weight: '4.3%' },
    { security: 'JP Morgan Chase & Co.', isin: 'US46625H1005', quantity: 100, price: '$152.40', value: '$15,240.00', weight: '18.5%' },
    { security: 'Vanguard S&P 500 ETF', isin: 'US9229083632', quantity: 30, price: '$179.25', value: '$5,377.50', weight: '6.5%' }
  ];
  
  // Data rows
  data.forEach(row => {
    let x = tableLeft;
    let y = doc.y;
    
    columns.forEach(column => {
      doc.text(row[column.id].toString(), x, y, {
        width: column.width,
        align: column.align || 'left'
      });
      x += column.width;
    });
    
    doc.moveDown();
  });
  
  // Draw footer separator
  doc.moveTo(tableLeft, doc.y)
     .lineTo(tableLeft + columns.reduce((sum, col) => sum + col.width, 0), doc.y)
     .stroke();
  doc.moveDown();
  
  // Total portfolio value
  doc.fontSize(12).text('Total Portfolio Value: $82,309.25', { align: 'right' });
  doc.moveDown(2);
  
  // Disclaimer
  doc.fontSize(8).text('This document is for testing purposes only. Not a real financial statement.', {
    align: 'center',
    color: 'gray'
  });
  
  // Finalize the PDF
  doc.end();
  
  console.log(`Sample portfolio PDF created at: ${outputPath}`);
  return outputPath;
}

// Generate the PDF when this script is run directly
if (require.main === module) {
  generateSamplePortfolioPDF();
}

module.exports = {
  generateSamplePortfolioPDF
};
