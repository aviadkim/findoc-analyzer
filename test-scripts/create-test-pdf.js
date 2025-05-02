/**
 * Create Test PDF
 * 
 * This script creates a simple test PDF for testing the FinDoc Analyzer application.
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Configuration
const config = {
  outputDir: path.join(__dirname, 'test-files'),
  fileName: 'simple-financial-statement.pdf'
};

// Create output directory if it doesn't exist
fs.mkdirSync(config.outputDir, { recursive: true });

/**
 * Create a simple financial statement PDF
 */
async function createSimpleFinancialStatementPDF() {
  console.log('Creating simple financial statement PDF...');
  
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
  const pdfBytes = await pdfDoc.save();
  
  // Write to file
  const outputPath = path.join(config.outputDir, config.fileName);
  fs.writeFileSync(outputPath, pdfBytes);
  
  console.log(`PDF created at: ${outputPath}`);
  
  return outputPath;
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

// Create the PDF if this script is executed directly
if (require.main === module) {
  createSimpleFinancialStatementPDF().catch(console.error);
}

module.exports = createSimpleFinancialStatementPDF;
