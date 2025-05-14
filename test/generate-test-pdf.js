/**
 * Generate Test PDF
 *
 * This script generates a test PDF file for testing the FinDoc Analyzer application.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create a new PDF document
const doc = new PDFDocument();

// Output file path
const outputPath = path.join(__dirname, 'test-files', 'test-portfolio.pdf');

// Pipe the PDF to a file
doc.pipe(fs.createWriteStream(outputPath));

// Add content to the PDF
doc.fontSize(25).text('Portfolio Statement', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('Client: John Doe');
doc.text('Account: 123456');
doc.text('Date: 2023-12-31');
doc.moveDown();

// Add securities table
doc.fontSize(14).text('Securities', { underline: true });
doc.moveDown();
doc.fontSize(10);

// Table headers
const headers = ['ISIN', 'Name', 'Quantity', 'Price', 'Value', 'Currency'];
const rowData = [
  ['US0378331005', 'Apple Inc.', '100', '190.50', '19,050.00', 'USD'],
  ['US5949181045', 'Microsoft Corp.', '50', '380.20', '19,010.00', 'USD'],
  ['US88160R1014', 'Tesla Inc.', '25', '248.48', '6,212.00', 'USD']
];

// Calculate column widths
const pageWidth = doc.page.width - 100;
const colWidths = [
  pageWidth * 0.2,  // ISIN
  pageWidth * 0.3,  // Name
  pageWidth * 0.1,  // Quantity
  pageWidth * 0.1,  // Price
  pageWidth * 0.2,  // Value
  pageWidth * 0.1   // Currency
];

// Draw table headers
let xPos = 50;
headers.forEach((header, i) => {
  doc.text(header, xPos, doc.y, { width: colWidths[i], align: 'left' });
  xPos += colWidths[i];
});

doc.moveDown();

// Draw table rows
rowData.forEach(row => {
  xPos = 50;
  row.forEach((cell, i) => {
    doc.text(cell, xPos, doc.y, { width: colWidths[i], align: 'left' });
    xPos += colWidths[i];
  });
  doc.moveDown();
});

doc.moveDown();

// Add asset allocation table
doc.addPage();
doc.fontSize(14).text('Asset Allocation', { underline: true });
doc.moveDown();
doc.fontSize(10);

// Table headers
const allocHeaders = ['Asset Class', 'Allocation', 'Value'];
const allocData = [
  ['Stocks', '60%', '750,000.00'],
  ['Bonds', '30%', '375,000.00'],
  ['Cash', '10%', '125,000.00']
];

// Calculate column widths
const allocColWidths = [
  pageWidth * 0.4,  // Asset Class
  pageWidth * 0.3,  // Allocation
  pageWidth * 0.3   // Value
];

// Draw table headers
xPos = 50;
allocHeaders.forEach((header, i) => {
  doc.text(header, xPos, doc.y, { width: allocColWidths[i], align: 'left' });
  xPos += allocColWidths[i];
});

doc.moveDown();

// Draw table rows
allocData.forEach(row => {
  xPos = 50;
  row.forEach((cell, i) => {
    doc.text(cell, xPos, doc.y, { width: allocColWidths[i], align: 'left' });
    xPos += allocColWidths[i];
  });
  doc.moveDown();
});

// Finalize the PDF
doc.end();

console.log(`Test PDF generated: ${outputPath}`);
