/**
 * Generate Test PDF
 * 
 * This script generates a sample financial document PDF for testing.
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Configuration
const outputPath = path.join(__dirname, 'test_pdfs', 'sample.pdf');

// Ensure the output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create a PDF document
const generateSampleFinancialPdf = () => {
  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream(outputPath);
  
  doc.pipe(writeStream);
  
  // Add title
  doc.fontSize(20).text('Portfolio Valuation Statement', { align: 'center' });
  doc.moveDown();
  
  // Add valuation date and account details
  doc.fontSize(12).text('Valuation Date: 01.05.2025');
  doc.text('Account Number: 12345678');
  doc.text('Currency: USD');
  doc.moveDown();
  
  // Add portfolio summary
  doc.fontSize(14).text('Portfolio Summary', { underline: true });
  doc.fontSize(12).text('Total Value: 1,235,500.00 USD');
  doc.moveDown();
  
  // Add asset allocation
  doc.fontSize(14).text('Asset Allocation', { underline: true });
  doc.fontSize(12).text('Equity: 45%');
  doc.text('Fixed Income: 35%');
  doc.text('Cash: 10%');
  doc.text('Alternative: 10%');
  doc.moveDown();
  
  // Add securities
  doc.fontSize(14).text('Securities', { underline: true });
  doc.moveDown();
  
  // Create a table-like structure for securities
  const securities = [
    { name: 'APPLE INC', isin: 'US0378331005', quantity: 1000, price: 180.50, value: 180500 },
    { name: 'MICROSOFT CORP', isin: 'US5949181045', quantity: 500, price: 320.75, value: 160375 },
    { name: 'AMAZON.COM INC', isin: 'US0231351067', quantity: 300, price: 145.25, value: 43575 },
    { name: 'ALPHABET INC-CL A', isin: 'US02079K3059', quantity: 200, price: 170.40, value: 34080 },
    { name: 'NVIDIA CORP', isin: 'US67066G1040', quantity: 400, price: 215.80, value: 86320 },
    { name: 'GOLDMAN SACHS 0% NOTES 23-07.11.29 SERIES P', isin: 'XS2692298537', quantity: 690000, price: 106.57, value: 735333 },
    { name: 'TORONTO DOMINION BANK NOTES 23-23.02.27 REG-S VRN', isin: 'XS2530507273', quantity: 200000, price: 99.3080, value: 198745 }
  ];
  
  // Define table columns
  const tableHeaders = ['Security Name', 'ISIN', 'Quantity', 'Price', 'Value (USD)'];
  const colWidths = [250, 120, 60, 70, 100];
  const startX = 50;
  let currentY = doc.y;
  
  // Draw table headers
  let currentX = startX;
  doc.font('Helvetica-Bold');
  
  tableHeaders.forEach((header, i) => {
    doc.text(header, currentX, currentY, { width: colWidths[i], align: 'left' });
    currentX += colWidths[i];
  });
  
  doc.font('Helvetica');
  currentY += 20;
  
  // Draw table rows
  securities.forEach((security, rowIndex) => {
    currentX = startX;
    
    // Format values
    const formattedQuantity = security.quantity.toLocaleString();
    const formattedPrice = security.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    const formattedValue = security.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Add cell values
    doc.text(security.name, currentX, currentY, { width: colWidths[0], align: 'left' });
    currentX += colWidths[0];
    
    doc.text(security.isin, currentX, currentY, { width: colWidths[1], align: 'left' });
    currentX += colWidths[1];
    
    doc.text(formattedQuantity, currentX, currentY, { width: colWidths[2], align: 'right' });
    currentX += colWidths[2];
    
    doc.text(formattedPrice, currentX, currentY, { width: colWidths[3], align: 'right' });
    currentX += colWidths[3];
    
    doc.text(formattedValue, currentX, currentY, { width: colWidths[4], align: 'right' });
    
    // Move to next row
    currentY += 20;
    
    // Add a line between rows
    if (rowIndex < securities.length - 1) {
      doc.moveTo(startX, currentY - 10)
         .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY - 10)
         .stroke();
    }
  });
  
  // Add a note about currency exposures
  doc.moveDown(2);
  doc.fontSize(14).text('Currency Exposure', { underline: true });
  doc.fontSize(12).text('USD: 90%');
  doc.text('EUR: 7%');
  doc.text('GBP: 3%');
  
  // Add disclaimer
  doc.moveDown(2);
  doc.fontSize(10).text('DISCLAIMER: This is a sample document generated for testing purposes only. It does not represent real financial data or investment advice.', { align: 'center' });
  
  // Finalize the PDF
  doc.end();
  
  // Return a promise that resolves when the PDF is written
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log(`Sample financial PDF created at: ${outputPath}`);
      resolve(outputPath);
    });
    
    writeStream.on('error', (error) => {
      console.error('Error creating PDF:', error);
      reject(error);
    });
  });
};

// Generate the PDF
generateSampleFinancialPdf().catch(console.error);
