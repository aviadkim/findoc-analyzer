/**
 * Export Service for FinDoc Analyzer
 * 
 * This module provides functionality for exporting data in various formats,
 * including CSV, Excel, PDF, and JSON.
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');

// Export directory
const EXPORT_DIR = path.join(__dirname, 'public', 'exports');

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

/**
 * Export data to CSV
 * @param {Object} data - Data to export
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Export result
 */
async function exportToCsv(data, options = {}) {
  try {
    const { fileName = `export-${Date.now()}.csv`, headers = [] } = options;
    
    // Generate file path
    const filePath = path.join(EXPORT_DIR, fileName);
    
    // Generate CSV content
    let csvContent = '';
    
    // Add headers
    if (headers.length > 0) {
      csvContent += headers.join(',') + '\n';
    } else if (data.length > 0) {
      csvContent += Object.keys(data[0]).join(',') + '\n';
    }
    
    // Add data rows
    for (const row of data) {
      const values = headers.length > 0
        ? headers.map(header => {
            const value = row[header] || '';
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value;
          })
        : Object.values(row).map(value => {
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value;
          });
      
      csvContent += values.join(',') + '\n';
    }
    
    // Write to file
    fs.writeFileSync(filePath, csvContent);
    
    return {
      success: true,
      filePath,
      fileName,
      fileUrl: `/exports/${fileName}`,
      fileType: 'text/csv',
      fileSize: fs.statSync(filePath).size
    };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Export data to Excel
 * @param {Object} data - Data to export
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Export result
 */
async function exportToExcel(data, options = {}) {
  try {
    const {
      fileName = `export-${Date.now()}.xlsx`,
      sheetName = 'Sheet1',
      headers = []
    } = options;
    
    // Generate file path
    const filePath = path.join(EXPORT_DIR, fileName);
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    
    // Add headers
    if (headers.length > 0) {
      worksheet.columns = headers.map(header => ({
        header,
        key: header,
        width: 20
      }));
    } else if (data.length > 0) {
      worksheet.columns = Object.keys(data[0]).map(key => ({
        header: key,
        key,
        width: 20
      }));
    }
    
    // Add data rows
    if (headers.length > 0) {
      // Add rows with specific headers
      worksheet.addRows(data.map(row => {
        const rowData = {};
        
        for (const header of headers) {
          rowData[header] = row[header];
        }
        
        return rowData;
      }));
    } else {
      // Add all data
      worksheet.addRows(data);
    }
    
    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Write to file
    await workbook.xlsx.writeFile(filePath);
    
    return {
      success: true,
      filePath,
      fileName,
      fileUrl: `/exports/${fileName}`,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSize: fs.statSync(filePath).size
    };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Export data to PDF
 * @param {Object} data - Data to export
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Export result
 */
async function exportToPdf(data, options = {}) {
  try {
    const {
      fileName = `export-${Date.now()}.pdf`,
      title = 'Export',
      headers = []
    } = options;
    
    // Generate file path
    const filePath = path.join(EXPORT_DIR, fileName);
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    // Get fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Set margins
    const margin = 50;
    const contentWidth = width - 2 * margin;
    
    // Add title
    page.drawText(title, {
      x: margin,
      y: height - margin,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    
    // Add date
    const dateText = new Date().toLocaleDateString();
    page.drawText(dateText, {
      x: width - margin - font.widthOfTextAtSize(dateText, 10),
      y: height - margin,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Determine headers
    const tableHeaders = headers.length > 0
      ? headers
      : data.length > 0
        ? Object.keys(data[0])
        : [];
    
    // Calculate column widths
    const columnCount = tableHeaders.length;
    const columnWidth = contentWidth / columnCount;
    
    // Draw table headers
    const headerY = height - margin - 40;
    
    for (let i = 0; i < tableHeaders.length; i++) {
      const header = tableHeaders[i];
      const x = margin + i * columnWidth;
      
      page.drawText(header, {
        x,
        y: headerY,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
    }
    
    // Draw horizontal line
    page.drawLine({
      start: { x: margin, y: headerY - 10 },
      end: { x: width - margin, y: headerY - 10 },
      thickness: 1,
      color: rgb(0, 0, 0)
    });
    
    // Draw data rows
    let y = headerY - 30;
    const rowHeight = 20;
    
    for (const row of data) {
      // Check if we need a new page
      if (y < margin + rowHeight) {
        // Add new page
        const newPage = pdfDoc.addPage();
        y = height - margin;
        
        // Draw headers on new page
        for (let i = 0; i < tableHeaders.length; i++) {
          const header = tableHeaders[i];
          const x = margin + i * columnWidth;
          
          newPage.drawText(header, {
            x,
            y: y - 20,
            size: 12,
            font: boldFont,
            color: rgb(0, 0, 0)
          });
        }
        
        // Draw horizontal line
        newPage.drawLine({
          start: { x: margin, y: y - 30 },
          end: { x: width - margin, y: y - 30 },
          thickness: 1,
          color: rgb(0, 0, 0)
        });
        
        y = y - 50;
      }
      
      // Draw row data
      for (let i = 0; i < tableHeaders.length; i++) {
        const header = tableHeaders[i];
        const x = margin + i * columnWidth;
        const value = row[header] || '';
        const text = value.toString().substring(0, 30); // Limit text length
        
        page.drawText(text, {
          x,
          y,
          size: 10,
          font,
          color: rgb(0, 0, 0)
        });
      }
      
      y -= rowHeight;
    }
    
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);
    
    return {
      success: true,
      filePath,
      fileName,
      fileUrl: `/exports/${fileName}`,
      fileType: 'application/pdf',
      fileSize: fs.statSync(filePath).size
    };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Export data to JSON
 * @param {Object} data - Data to export
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Export result
 */
async function exportToJson(data, options = {}) {
  try {
    const {
      fileName = `export-${Date.now()}.json`,
      pretty = true
    } = options;
    
    // Generate file path
    const filePath = path.join(EXPORT_DIR, fileName);
    
    // Generate JSON content
    const jsonContent = pretty
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);
    
    // Write to file
    fs.writeFileSync(filePath, jsonContent);
    
    return {
      success: true,
      filePath,
      fileName,
      fileUrl: `/exports/${fileName}`,
      fileType: 'application/json',
      fileSize: fs.statSync(filePath).size
    };
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Export table data
 * @param {Object} tableData - Table data to export
 * @param {string} format - Export format (csv, excel, pdf, json)
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Export result
 */
async function exportTable(tableData, format, options = {}) {
  try {
    const { headers, rows } = tableData;
    
    // Convert table data to array of objects
    const data = rows.map(row => {
      const obj = {};
      
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = row[i];
      }
      
      return obj;
    });
    
    // Set default file name
    const defaultFileName = `table-export-${Date.now()}`;
    
    // Export based on format
    switch (format.toLowerCase()) {
      case 'csv':
        return exportToCsv(data, {
          ...options,
          fileName: options.fileName || `${defaultFileName}.csv`,
          headers
        });
      
      case 'excel':
        return exportToExcel(data, {
          ...options,
          fileName: options.fileName || `${defaultFileName}.xlsx`,
          headers
        });
      
      case 'pdf':
        return exportToPdf(data, {
          ...options,
          fileName: options.fileName || `${defaultFileName}.pdf`,
          headers
        });
      
      case 'json':
        return exportToJson(data, {
          ...options,
          fileName: options.fileName || `${defaultFileName}.json`
        });
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting table:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Export document data
 * @param {Object} document - Document data to export
 * @param {string} format - Export format (csv, excel, pdf, json)
 * @param {Object} options - Export options
 * @returns {Promise<Object>} - Export result
 */
async function exportDocument(document, format, options = {}) {
  try {
    // Set default file name
    const defaultFileName = `document-export-${document.id || Date.now()}`;
    
    // Prepare document data
    const documentData = {
      id: document.id,
      name: document.name,
      fileName: document.fileName,
      documentType: document.documentType,
      uploadDate: document.uploadDate,
      processed: document.processed,
      status: document.status
    };
    
    // Add tables if available
    if (document.content && document.content.tables) {
      documentData.tables = document.content.tables.map(table => ({
        id: table.id,
        name: table.name,
        headers: table.headers,
        rowCount: table.rows.length
      }));
    }
    
    // Add securities if available
    if (document.content && document.content.securities) {
      documentData.securities = document.content.securities.map(security => ({
        id: security.id,
        isin: security.isin,
        name: security.name,
        quantity: security.quantity,
        price: security.price
      }));
    }
    
    // Export based on format
    switch (format.toLowerCase()) {
      case 'csv':
        return exportToCsv([documentData], {
          ...options,
          fileName: options.fileName || `${defaultFileName}.csv`
        });
      
      case 'excel':
        return exportToExcel([documentData], {
          ...options,
          fileName: options.fileName || `${defaultFileName}.xlsx`
        });
      
      case 'pdf':
        return exportToPdf([documentData], {
          ...options,
          fileName: options.fileName || `${defaultFileName}.pdf`,
          title: `Document Export: ${document.name}`
        });
      
      case 'json':
        return exportToJson(document, {
          ...options,
          fileName: options.fileName || `${defaultFileName}.json`
        });
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting document:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  exportToCsv,
  exportToExcel,
  exportToPdf,
  exportToJson,
  exportTable,
  exportDocument
};
