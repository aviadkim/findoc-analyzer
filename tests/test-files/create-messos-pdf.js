/**
 * Create Messos PDF
 * 
 * This script creates a simplified version of the Messos portfolio statement for testing.
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function createMessosPDF(outputPath) {
  console.log('Creating Messos PDF for testing...');
  
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  
  // Get the font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Set font size
  const titleFontSize = 16;
  const headerFontSize = 12;
  const sectionFontSize = 14;
  const tableFontSize = 10;
  
  // Add title and header
  page.drawText('MESSOS ENTERPRISES LTD.', {
    x: 150,
    y: 800,
    size: titleFontSize,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Valuation as of 28.02.2025', {
    x: 200,
    y: 780,
    size: headerFontSize,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Client Number: 366223', {
    x: 220,
    y: 760,
    size: headerFontSize,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Add section title
  page.drawText('Bonds', {
    x: 50,
    y: 720,
    size: sectionFontSize,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Add table headers
  const tableHeaders = ['CCY', 'Nominal', 'Description', 'Cost Price', 'Price', 'Accrued Int.', 'Perf. YTD', 'Value', 'Weight'];
  const tableHeaderX = [50, 80, 130, 280, 330, 380, 430, 480, 530];
  const tableHeaderY = 690;
  
  for (let i = 0; i < tableHeaders.length; i++) {
    page.drawText(tableHeaders[i], {
      x: tableHeaderX[i],
      y: tableHeaderY,
      size: tableFontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
  }
  
  // Add table rows
  const tableRows = [
    ['USD', '100\'000', 'US TREASURY 2.5% 31.01.2030\nISIN: US91282CJL54', '99.8750', '98.2500', '0.21%', '-1.63%', '98\'460', '5.00%'],
    ['EUR', '100\'000', 'GERMANY 2.3% 15.02.2033\nISIN: DE0001102580', '99.7500', '98.5000', '0.15%', '-1.25%', '98\'650', '5.00%'],
    ['USD', '100\'000', 'LUMINIS (4.2 % MIN/5,5 % MAX) NOTES 2024-17.01.30\nISIN: XS2754416961', '100.2000', '97.6600', '1.70%', '-2.53%', '98\'271', '0.50%']
  ];
  
  let tableRowY = 670;
  
  for (const row of tableRows) {
    for (let i = 0; i < row.length; i++) {
      // Handle multi-line description
      if (i === 2) {
        const lines = row[i].split('\\n');
        for (let j = 0; j < lines.length; j++) {
          page.drawText(lines[j], {
            x: tableHeaderX[i],
            y: tableRowY - (j * 15),
            size: tableFontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }
      } else {
        page.drawText(row[i], {
          x: tableHeaderX[i],
          y: tableRowY,
          size: tableFontSize,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      }
    }
    
    tableRowY -= 40;
  }
  
  // Add section title
  page.drawText('Equities', {
    x: 50,
    y: 550,
    size: sectionFontSize,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Add table headers
  for (let i = 0; i < tableHeaders.length; i++) {
    page.drawText(tableHeaders[i], {
      x: tableHeaderX[i],
      y: 520,
      size: tableFontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
  }
  
  // Add table rows
  const equityRows = [
    ['USD', '100', 'APPLE INC.\nISIN: US0378331005', '190.50', '190.50', '0.00%', '12.35%', '19\'050', '1.00%'],
    ['USD', '50', 'MICROSOFT CORP\nISIN: US5949181045', '420.25', '420.25', '0.00%', '15.75%', '21\'013', '1.10%'],
    ['USD', '200', 'TESLA INC\nISIN: US88160R1014', '175.30', '175.30', '0.00%', '-18.25%', '35\'060', '1.80%'],
    ['USD', '300', 'AMAZON.COM INC\nISIN: US0231351067', '178.75', '178.75', '0.00%', '20.15%', '53\'625', '2.70%'],
    ['USD', '150', 'ALPHABET INC-CL A\nISIN: US02079K3059', '143.96', '143.96', '0.00%', '22.45%', '21\'594', '1.10%']
  ];
  
  tableRowY = 500;
  
  for (const row of equityRows) {
    for (let i = 0; i < row.length; i++) {
      // Handle multi-line description
      if (i === 2) {
        const lines = row[i].split('\\n');
        for (let j = 0; j < lines.length; j++) {
          page.drawText(lines[j], {
            x: tableHeaderX[i],
            y: tableRowY - (j * 15),
            size: tableFontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }
      } else {
        page.drawText(row[i], {
          x: tableHeaderX[i],
          y: tableRowY,
          size: tableFontSize,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      }
    }
    
    tableRowY -= 40;
  }
  
  // Add asset allocation section
  page.drawText('Asset Allocation', {
    x: 50,
    y: 300,
    size: sectionFontSize,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Add asset allocation table
  const allocationHeaders = ['Asset Class', 'Allocation', 'Value'];
  const allocationHeaderX = [50, 150, 250];
  const allocationHeaderY = 270;
  
  for (let i = 0; i < allocationHeaders.length; i++) {
    page.drawText(allocationHeaders[i], {
      x: allocationHeaderX[i],
      y: allocationHeaderY,
      size: tableFontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
  }
  
  // Add asset allocation rows
  const allocationRows = [
    ['Stocks', '60%', '750,000.00'],
    ['Bonds', '30%', '375,000.00'],
    ['Cash', '10%', '125,000.00'],
    ['Total', '100%', '1,250,000.00']
  ];
  
  let allocationRowY = 250;
  
  for (const row of allocationRows) {
    for (let i = 0; i < row.length; i++) {
      page.drawText(row[i], {
        x: allocationHeaderX[i],
        y: allocationRowY,
        size: tableFontSize,
        font: i === 3 ? helveticaBold : helveticaFont,
        color: rgb(0, 0, 0),
      });
    }
    
    allocationRowY -= 20;
  }
  
  // Add summary section
  page.drawText('Portfolio Summary', {
    x: 50,
    y: 170,
    size: sectionFontSize,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  // Add summary table
  const summaryHeaders = ['Property', 'Value'];
  const summaryHeaderX = [50, 250];
  const summaryHeaderY = 140;
  
  for (let i = 0; i < summaryHeaders.length; i++) {
    page.drawText(summaryHeaders[i], {
      x: summaryHeaderX[i],
      y: summaryHeaderY,
      size: tableFontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
  }
  
  // Add summary rows
  const summaryRows = [
    ['Total Value', 'USD 1,250,000.00'],
    ['Number of Securities', '41'],
    ['Risk Profile', 'Balanced'],
    ['Performance YTD', '+3.75%']
  ];
  
  let summaryRowY = 120;
  
  for (const row of summaryRows) {
    for (let i = 0; i < row.length; i++) {
      page.drawText(row[i], {
        x: summaryHeaderX[i],
        y: summaryRowY,
        size: tableFontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }
    
    summaryRowY -= 20;
  }
  
  // Add footer
  page.drawText('MESSOS ENTERPRISES LTD. - CONFIDENTIAL', {
    x: 150,
    y: 50,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Page 1 of 1', {
    x: 270,
    y: 30,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  
  // Ensure the directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write the PDF to file
  fs.writeFileSync(outputPath, pdfBytes);
  
  console.log(`Messos PDF created: ${outputPath}`);
  return outputPath;
}

// Main function
async function main() {
  const outputPath = path.join(__dirname, 'messos-portfolio.pdf');
  await createMessosPDF(outputPath);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createMessosPDF };
