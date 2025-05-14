/**
 * Create Test PDF
 *
 * This script creates a test PDF file for testing the scan1 integration.
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Configuration
const config = {
  outputPath: path.join(__dirname, 'test-files', 'test.pdf')
};

// Create directories if they don't exist
fs.mkdirSync(path.dirname(config.outputPath), { recursive: true });

// Create a new PDF document
const doc = new PDFDocument();

// Pipe the PDF to a file
const stream = fs.createWriteStream(config.outputPath);
doc.pipe(stream);

// Add content to the PDF
doc.fontSize(18).text('Portfolio Statement', { align: 'center' });
doc.moveDown();

doc.fontSize(12).text('Valuation Date: 31.12.2023');
doc.moveDown();
doc.text('Currency: USD');
doc.moveDown();
doc.text('Total Value: 1,250,000');
doc.moveDown(2);

// Add securities section
doc.fontSize(14).text('Securities:');
doc.moveDown();

// Add securities in simple text format
doc.fontSize(10);
doc.text('Apple Inc. (ISIN: US0378331005)');
doc.text('Quantity: 1,000');
doc.text('Price: 175.00');
doc.text('Value: 175,000');
doc.text('% of Assets: 7.0%');
doc.moveDown();

doc.text('Microsoft (ISIN: US5949181045)');
doc.text('Quantity: 800');
doc.text('Price: 300.00');
doc.text('Value: 240,000');
doc.text('% of Assets: 9.6%');
doc.moveDown();

doc.text('Amazon (ISIN: US0231351067)');
doc.text('Quantity: 500');
doc.text('Price: 140.00');
doc.text('Value: 70,000');
doc.text('% of Assets: 2.8%');
doc.moveDown(2);

// Add asset allocation
doc.fontSize(14).text('Asset Allocation:');
doc.moveDown();

doc.fontSize(10);
doc.text('Equity: 60%');
doc.text('Fixed Income: 30%');
doc.text('Cash: 10%');

// Finalize the PDF
doc.end();

console.log(`Test PDF created at ${config.outputPath}`);
