/**
 * Generate Test PDFs
 * 
 * This script generates test PDF files for testing the PDF processing functionality.
 * It uses the PDF-Lib library to create PDFs programmatically.
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Configuration
const config = {
  outputDir: 'test_pdfs'
};

/**
 * Create a financial statement PDF
 * @returns {Promise<Uint8Array>} PDF bytes
 */
async function createFinancialStatementPDF() {
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
  page.drawText('Date: 28.02.2025', {
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
  
  page.drawText('Client: John Doe', {
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
  
  page.drawText('Total Value: USD 1,250,000.00', {
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
  
  page.drawText('Valuation Date: 28.02.2025', {
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
    ['Equity', '45%'],
    ['Fixed Income', '30%'],
    ['Cash', '15%'],
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
    ['APPLE INC', 'US0378331005', 'Equity', '500', 'USD 170.00', 'USD 85,000.00', '6.8%'],
    ['MICROSOFT CORP', 'US5949181045', 'Equity', '300', 'USD 340.00', 'USD 102,000.00', '8.16%'],
    ['AMAZON.COM INC', 'US0231351067', 'Equity', '100', 'USD 950.00', 'USD 95,000.00', '7.6%'],
    ['US TREASURY 2.5% 15/02/2045', 'US912810RK35', 'Bond', '200,000', 'USD 0.99', 'USD 198,000.00', '15.84%'],
    ['GOLDMAN SACHS 0% NOTES 23-07.11.29', 'XS2692298537', 'Bond', '150,000', 'USD 0.98', 'USD 147,000.00', '11.76%']
  ];
  
  drawTable(page, securitiesData, 50, height - 400, 70, 20, font, boldFont);
  
  // Serialize the PDF to bytes
  return await pdfDoc.save();
}

/**
 * Create a text-only PDF
 * @returns {Promise<Uint8Array>} PDF bytes
 */
async function createTextOnlyPDF() {
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
  page.drawText('TEXT-ONLY DOCUMENT', {
    x: 50,
    y: height - 50,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Add paragraphs
  const paragraphs = [
    'This is paragraph 1 of the text-only document. This document contains no tables or images, only text content for testing text extraction functionality.',
    'This is paragraph 2 of the text-only document. The purpose of this document is to test how well the system can extract and process plain text without any structured data.',
    'This is paragraph 3 of the text-only document. Text extraction is a fundamental capability of any document processing system, especially for financial documents.',
    'This is paragraph 4 of the text-only document. Even in text-only documents, important financial information can be present, such as account numbers, dates, and monetary values.',
    'This is paragraph 5 of the text-only document. For example, this document mentions that the total portfolio value is USD 1,250,000.00 as of February 28, 2025.',
    'This is paragraph 6 of the text-only document. It also mentions securities like Apple Inc (ISIN: US0378331005) and Microsoft Corp (ISIN: US5949181045).',
    'This is paragraph 7 of the text-only document. The asset allocation is approximately 45% equity, 30% fixed income, 15% cash, and 10% alternative investments.',
    'This is paragraph 8 of the text-only document. This information should be extractable even without structured tables or formatted data.',
    'This is paragraph 9 of the text-only document. The system should be able to identify key financial metrics and entities from plain text.',
    'This is paragraph 10 of the text-only document. This tests the system\'s natural language processing capabilities rather than its table extraction abilities.'
  ];
  
  paragraphs.forEach((paragraph, index) => {
    page.drawText(paragraph, {
      x: 50,
      y: height - 80 - (index * 40),
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
      maxWidth: width - 100,
      lineHeight: 12
    });
  });
  
  // Serialize the PDF to bytes
  return await pdfDoc.save();
}

/**
 * Create a tables-only PDF
 * @returns {Promise<Uint8Array>} PDF bytes
 */
async function createTablesOnlyPDF() {
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
  page.drawText('TABLES-ONLY DOCUMENT', {
    x: 50,
    y: height - 50,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Add table 1
  page.drawText('Table 1: Asset Allocation', {
    x: 50,
    y: height - 80,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  const assetAllocationData = [
    ['Asset Class', 'Percentage'],
    ['Equity', '45%'],
    ['Fixed Income', '30%'],
    ['Cash', '15%'],
    ['Alternative', '10%']
  ];
  
  drawTable(page, assetAllocationData, 50, height - 100, 200, 20, font, boldFont);
  
  // Add table 2
  page.drawText('Table 2: Securities Holdings', {
    x: 50,
    y: height - 230,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  const securitiesData = [
    ['Security', 'ISIN', 'Type', 'Quantity', 'Price', 'Value', 'Weight'],
    ['APPLE INC', 'US0378331005', 'Equity', '500', 'USD 170.00', 'USD 85,000.00', '6.8%'],
    ['MICROSOFT CORP', 'US5949181045', 'Equity', '300', 'USD 340.00', 'USD 102,000.00', '8.16%'],
    ['AMAZON.COM INC', 'US0231351067', 'Equity', '100', 'USD 950.00', 'USD 95,000.00', '7.6%'],
    ['US TREASURY 2.5% 15/02/2045', 'US912810RK35', 'Bond', '200,000', 'USD 0.99', 'USD 198,000.00', '15.84%'],
    ['GOLDMAN SACHS 0% NOTES 23-07.11.29', 'XS2692298537', 'Bond', '150,000', 'USD 0.98', 'USD 147,000.00', '11.76%']
  ];
  
  drawTable(page, securitiesData, 50, height - 250, 70, 20, font, boldFont);
  
  // Add table 3
  page.drawText('Table 3: Sector Allocation', {
    x: 50,
    y: height - 400,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  const sectorAllocationData = [
    ['Sector', 'Percentage'],
    ['Technology', '22.56%'],
    ['Consumer', '7.6%'],
    ['Government', '15.84%'],
    ['Financial', '11.76%'],
    ['Other', '42.24%']
  ];
  
  drawTable(page, sectorAllocationData, 50, height - 420, 200, 20, font, boldFont);
  
  // Serialize the PDF to bytes
  return await pdfDoc.save();
}

/**
 * Create a small PDF
 * @returns {Promise<Uint8Array>} PDF bytes
 */
async function createSmallPDF() {
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
  page.drawText('SMALL TEST DOCUMENT', {
    x: 50,
    y: height - 50,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Add content
  page.drawText('This is a small test document for testing small file processing.', {
    x: 50,
    y: height - 80,
    size: 10,
    font: font,
    color: rgb(0, 0, 0)
  });
  
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
  console.log('Generating test PDFs...');
  
  // Create output directory
  fs.mkdirSync(config.outputDir, { recursive: true });
  
  // Generate financial statement PDF
  const financialStatementPDF = await createFinancialStatementPDF();
  fs.writeFileSync(path.join(config.outputDir, 'financial_statement.pdf'), financialStatementPDF);
  console.log('Financial statement PDF created');
  
  // Generate text-only PDF
  const textOnlyPDF = await createTextOnlyPDF();
  fs.writeFileSync(path.join(config.outputDir, 'text_only.pdf'), textOnlyPDF);
  console.log('Text-only PDF created');
  
  // Generate tables-only PDF
  const tablesOnlyPDF = await createTablesOnlyPDF();
  fs.writeFileSync(path.join(config.outputDir, 'tables_only.pdf'), tablesOnlyPDF);
  console.log('Tables-only PDF created');
  
  // Generate small PDF
  const smallPDF = await createSmallPDF();
  fs.writeFileSync(path.join(config.outputDir, 'small_file.pdf'), smallPDF);
  console.log('Small PDF created');
  
  console.log('All test PDFs created successfully!');
}

// Generate test PDFs
generateTestPDFs()
  .catch(error => {
    console.error('Error generating test PDFs:', error);
  });
