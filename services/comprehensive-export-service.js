/**
 * Comprehensive Export Service
 * 
 * A unified service for exporting data in various formats,
 * with support for multiple export types, error handling,
 * and scheduling capabilities.
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');
const { promisify } = require('util');

// Promisify fs functions
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

// Constants
const EXPORT_DIR = path.join(process.cwd(), 'exports');
const EXPORT_HISTORY_FILE = path.join(EXPORT_DIR, 'export-history.json');
const EXPORT_EXPIRY_DAYS = 7; // Number of days before exports expire

/**
 * ComprehensiveExportService Class
 * Unified service for all export types and formats
 */
class ComprehensiveExportService {
  constructor(options = {}) {
    // Default options
    this.options = {
      useMockData: false,
      exportDir: EXPORT_DIR,
      historyFile: EXPORT_HISTORY_FILE,
      expiryDays: EXPORT_EXPIRY_DAYS,
      ...options
    };

    // Ensure export directories exist
    this.ensureDirectoriesExist();
    
    // Initialize export history
    this.initializeExportHistory();
  }

  /**
   * Ensure export directories exist
   * @private
   */
  async ensureDirectoriesExist() {
    try {
      if (!fs.existsSync(this.options.exportDir)) {
        await mkdir(this.options.exportDir, { recursive: true });
      }
      
      // Create subdirectories for different export types
      const subdirs = ['documents', 'portfolios', 'analytics', 'securities', 'scheduled'];
      for (const dir of subdirs) {
        const subdir = path.join(this.options.exportDir, dir);
        if (!fs.existsSync(subdir)) {
          await mkdir(subdir, { recursive: true });
        }
      }
    } catch (error) {
      console.error('Error creating export directories:', error);
    }
  }

  /**
   * Initialize export history
   * @private
   */
  async initializeExportHistory() {
    try {
      if (!fs.existsSync(this.options.historyFile)) {
        // Create empty export history file
        await writeFile(this.options.historyFile, JSON.stringify({
          exports: [],
          lastUpdated: new Date().toISOString()
        }), 'utf8');
      }
    } catch (error) {
      console.error('Error initializing export history:', error);
    }
  }

  /**
   * Get export history
   * @returns {Promise<Array>} - Export history records
   */
  async getExportHistory() {
    try {
      // Read history file
      const historyData = await readFile(this.options.historyFile, 'utf8');
      const history = JSON.parse(historyData);
      
      // Return export records
      return history.exports || [];
    } catch (error) {
      console.error('Error reading export history:', error);
      return [];
    }
  }

  /**
   * Add export to history
   * @param {Object} exportRecord - Export record to add
   * @private
   */
  async addExportToHistory(exportRecord) {
    try {
      // Read existing history
      let history;
      try {
        const historyData = await readFile(this.options.historyFile, 'utf8');
        history = JSON.parse(historyData);
      } catch (error) {
        // Initialize if doesn't exist or is invalid
        history = { exports: [], lastUpdated: new Date().toISOString() };
      }
      
      // Add new record
      history.exports.push({
        ...exportRecord,
        id: exportRecord.id || uuidv4(),
        createdAt: exportRecord.createdAt || new Date().toISOString()
      });
      
      // Update last updated timestamp
      history.lastUpdated = new Date().toISOString();
      
      // Write updated history
      await writeFile(this.options.historyFile, JSON.stringify(history, null, 2), 'utf8');
      
      return true;
    } catch (error) {
      console.error('Error adding export to history:', error);
      return false;
    }
  }

  /**
   * Clean up expired exports
   * @returns {Promise<number>} - Number of files cleaned up
   */
  async cleanupExpiredExports() {
    try {
      // Read export history
      const history = await this.getExportHistory();
      
      // Find expired exports
      const now = new Date();
      const expiredExports = history.exports.filter(record => {
        if (!record.expiresAt) return false;
        
        const expiryDate = new Date(record.expiresAt);
        return expiryDate < now;
      });
      
      // Delete expired files and update history
      let deletedCount = 0;
      const updatedHistory = history.filter(record => {
        if (!record.expiresAt) return true;
        
        const expiryDate = new Date(record.expiresAt);
        if (expiryDate < now) {
          // Try to delete the file
          try {
            if (record.filePath && fs.existsSync(record.filePath)) {
              fs.unlinkSync(record.filePath);
              deletedCount++;
            }
          } catch (error) {
            console.warn(`Error deleting expired export file: ${error.message}`);
          }
          
          // Mark as expired but keep record
          record.expired = true;
          return true;
        }
        
        return true;
      });
      
      // Write updated history
      await writeFile(this.options.historyFile, JSON.stringify({
        exports: updatedHistory,
        lastUpdated: new Date().toISOString()
      }, null, 2), 'utf8');
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired exports:', error);
      return 0;
    }
  }

  /**
   * Export data to CSV format
   * @param {Array|Object} data - Data to export (array of objects)
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export result
   */
  async exportToCsv(data, options = {}) {
    try {
      // Generate unique ID for this export
      const exportId = options.exportId || uuidv4();
      
      // Normalize data to array if it's an object
      const dataArray = Array.isArray(data) ? data : [data];
      
      // Determine file name and path
      const fileName = options.fileName || `export-${exportId}.csv`;
      const exportType = options.exportType || 'documents';
      const exportSubdir = path.join(this.options.exportDir, exportType);
      const filePath = path.join(exportSubdir, fileName);
      
      // Determine headers
      let headers = [];
      if (options.headers && Array.isArray(options.headers) && options.headers.length > 0) {
        headers = options.headers;
      } else if (dataArray.length > 0) {
        // Extract headers from first object's keys
        headers = Object.keys(dataArray[0]);
      }
      
      // Generate CSV content
      let csvContent = '';
      
      // Add headers
      if (headers.length > 0) {
        csvContent += headers.join(',') + '\n';
      }
      
      // Add data rows
      for (const item of dataArray) {
        if (typeof item !== 'object' || item === null) continue;
        
        const values = headers.map(header => {
          const value = item[header] !== undefined ? item[header] : '';
          
          // Handle special values
          if (value === null) return '';
          if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
          
          // Convert to string and escape commas with quotes
          const stringValue = String(value);
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        });
        
        csvContent += values.join(',') + '\n';
      }
      
      // Write to file
      await writeFile(filePath, csvContent, 'utf8');
      
      // Generate export record
      const exportRecord = {
        id: exportId,
        type: exportType,
        format: 'csv',
        fileName,
        filePath,
        fileUrl: `/api/exports/download/${fileName}`,
        contentType: 'text/csv',
        fileSize: (await stat(filePath)).size,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.options.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Add to history
      await this.addExportToHistory(exportRecord);
      
      return {
        success: true,
        ...exportRecord
      };
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      
      return {
        success: false,
        error: error.message,
        errorDetails: error.stack
      };
    }
  }

  /**
   * Export data to Excel format
   * @param {Array|Object} data - Data to export (array of objects)
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export result
   */
  async exportToExcel(data, options = {}) {
    try {
      // Generate unique ID for this export
      const exportId = options.exportId || uuidv4();
      
      // Normalize data to array if it's an object
      const dataArray = Array.isArray(data) ? data : [data];
      
      // Determine file name and path
      const fileName = options.fileName || `export-${exportId}.xlsx`;
      const exportType = options.exportType || 'documents';
      const exportSubdir = path.join(this.options.exportDir, exportType);
      const filePath = path.join(exportSubdir, fileName);
      
      // Create workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'FinDoc Analyzer';
      workbook.created = new Date();
      
      // Handle multiple sheets if data is structured that way
      if (options.sheets && Array.isArray(options.sheets)) {
        // Multi-sheet export
        for (const sheetConfig of options.sheets) {
          const { name, data: sheetData, headers } = sheetConfig;
          
          if (!sheetData || !Array.isArray(sheetData)) continue;
          
          // Create sheet
          const worksheet = workbook.addWorksheet(name || `Sheet${workbook.worksheets.length + 1}`);
          
          // Determine headers
          let sheetHeaders = headers;
          if (!sheetHeaders && sheetData.length > 0) {
            sheetHeaders = Object.keys(sheetData[0]);
          }
          
          // Add headers
          if (sheetHeaders && sheetHeaders.length > 0) {
            worksheet.columns = sheetHeaders.map(header => ({
              header,
              key: header,
              width: 20
            }));
            
            // Style headers
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true };
            headerRow.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE0E0E0' }
            };
          }
          
          // Add data
          worksheet.addRows(sheetData);
          
          // Add auto-filter to header row
          if (sheetHeaders && sheetHeaders.length > 0 && sheetData.length > 0) {
            worksheet.autoFilter = {
              from: { row: 1, column: 1 },
              to: { row: 1, column: sheetHeaders.length }
            };
          }
        }
      } else {
        // Single sheet export
        const worksheet = workbook.addWorksheet(options.sheetName || 'Data');
        
        // Determine headers
        let headers = options.headers;
        if (!headers && dataArray.length > 0) {
          headers = Object.keys(dataArray[0]);
        }
        
        // Add headers
        if (headers && headers.length > 0) {
          worksheet.columns = headers.map(header => ({
            header,
            key: header,
            width: 20
          }));
          
          // Style headers
          const headerRow = worksheet.getRow(1);
          headerRow.font = { bold: true };
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          };
        }
        
        // Add data
        worksheet.addRows(dataArray);
        
        // Add auto-filter to header row
        if (headers && headers.length > 0 && dataArray.length > 0) {
          worksheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: headers.length }
          };
        }
      }
      
      // Write to file
      await workbook.xlsx.writeFile(filePath);
      
      // Generate export record
      const exportRecord = {
        id: exportId,
        type: exportType,
        format: 'excel',
        fileName,
        filePath,
        fileUrl: `/api/exports/download/${fileName}`,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileSize: (await stat(filePath)).size,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.options.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Add to history
      await this.addExportToHistory(exportRecord);
      
      return {
        success: true,
        ...exportRecord
      };
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      
      return {
        success: false,
        error: error.message,
        errorDetails: error.stack
      };
    }
  }

  /**
   * Export data to PDF format
   * @param {Array|Object} data - Data to export
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export result
   */
  async exportToPdf(data, options = {}) {
    try {
      // Generate unique ID for this export
      const exportId = options.exportId || uuidv4();
      
      // Determine file name and path
      const fileName = options.fileName || `export-${exportId}.pdf`;
      const exportType = options.exportType || 'documents';
      const exportSubdir = path.join(this.options.exportDir, exportType);
      const filePath = path.join(exportSubdir, fileName);
      
      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Add metadata
      pdfDoc.setTitle(options.title || 'Data Export');
      pdfDoc.setAuthor('FinDoc Analyzer');
      pdfDoc.setCreator('FinDoc Analyzer Comprehensive Export Service');
      pdfDoc.setProducer('FinDoc Analyzer');
      pdfDoc.setCreationDate(new Date());
      
      // Add first page
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      // Get fonts
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Set margins
      const margin = 50;
      const contentWidth = width - 2 * margin;
      
      // Add title
      const title = options.title || 'Data Export';
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
      
      // Export logic based on data type
      if (Array.isArray(data)) {
        // Export array of objects as table
        await this.addTableToPdf(pdfDoc, page, data, {
          title: options.tableTitle || 'Data Table',
          startY: height - margin - 40,
          margin,
          font,
          boldFont,
          contentWidth
        });
      } else if (typeof data === 'object' && data !== null) {
        // Export object properties
        await this.addObjectToPdf(pdfDoc, page, data, {
          startY: height - margin - 40,
          margin,
          font,
          boldFont,
          contentWidth
        });
      }
      
      // Save PDF
      const pdfBytes = await pdfDoc.save();
      await writeFile(filePath, pdfBytes);
      
      // Generate export record
      const exportRecord = {
        id: exportId,
        type: exportType,
        format: 'pdf',
        fileName,
        filePath,
        fileUrl: `/api/exports/download/${fileName}`,
        contentType: 'application/pdf',
        fileSize: (await stat(filePath)).size,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.options.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Add to history
      await this.addExportToHistory(exportRecord);
      
      return {
        success: true,
        ...exportRecord
      };
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      
      return {
        success: false,
        error: error.message,
        errorDetails: error.stack
      };
    }
  }

  /**
   * Add table to PDF document
   * @param {PDFDocument} pdfDoc - PDF document
   * @param {PDFPage} page - PDF page
   * @param {Array} data - Table data (array of objects)
   * @param {Object} options - Rendering options
   * @private
   */
  async addTableToPdf(pdfDoc, page, data, options) {
    const { startY, margin, font, boldFont, contentWidth } = options;
    const { width, height } = page.getSize();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      // No data to render
      page.drawText('No data available', {
        x: margin,
        y: startY,
        size: 12,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });
      return;
    }
    
    // Determine headers (from first object keys)
    const headers = Object.keys(data[0]);
    if (headers.length === 0) return;
    
    // Calculate column widths
    const columnCount = headers.length;
    const columnWidth = contentWidth / columnCount;
    
    // Draw table headers
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const x = margin + i * columnWidth;
      
      page.drawText(header, {
        x,
        y: startY,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
    }
    
    // Draw horizontal line
    page.drawLine({
      start: { x: margin, y: startY - 10 },
      end: { x: width - margin, y: startY - 10 },
      thickness: 1,
      color: rgb(0, 0, 0)
    });
    
    // Draw data rows
    let y = startY - 30;
    const rowHeight = 20;
    
    for (const row of data) {
      // Check if we need a new page
      if (y < margin + rowHeight) {
        // Add new page
        page = pdfDoc.addPage();
        y = height - margin;
        
        // Draw headers on new page
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i];
          const x = margin + i * columnWidth;
          
          page.drawText(header, {
            x,
            y: y - 20,
            size: 12,
            font: boldFont,
            color: rgb(0, 0, 0)
          });
        }
        
        // Draw horizontal line
        page.drawLine({
          start: { x: margin, y: y - 30 },
          end: { x: width - margin, y: y - 30 },
          thickness: 1,
          color: rgb(0, 0, 0)
        });
        
        y = y - 50;
      }
      
      // Draw row data
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const x = margin + i * columnWidth;
        let value = row[header];
        
        // Convert value to string, handle special cases
        let text;
        if (value === null || value === undefined) {
          text = '';
        } else if (typeof value === 'object') {
          text = JSON.stringify(value).substring(0, 30);
          if (text.length === 30) text += '...';
        } else {
          text = value.toString().substring(0, 30);
          if (text.length === 30) text += '...';
        }
        
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
  }

  /**
   * Add object to PDF document
   * @param {PDFDocument} pdfDoc - PDF document
   * @param {PDFPage} page - PDF page
   * @param {Object} data - Object data
   * @param {Object} options - Rendering options
   * @private
   */
  async addObjectToPdf(pdfDoc, page, data, options) {
    const { startY, margin, font, boldFont, contentWidth } = options;
    const { height } = page.getSize();
    
    if (!data || typeof data !== 'object' || data === null) {
      // No data to render
      page.drawText('No data available', {
        x: margin,
        y: startY,
        size: 12,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });
      return;
    }
    
    // Get entries
    const entries = Object.entries(data);
    if (entries.length === 0) return;
    
    // Draw properties
    let y = startY;
    const rowHeight = 20;
    
    for (const [key, value] of entries) {
      // Check if we need a new page
      if (y < margin + rowHeight) {
        // Add new page
        page = pdfDoc.addPage();
        y = height - margin;
      }
      
      // Draw key
      page.drawText(`${key}:`, {
        x: margin,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0)
      });
      
      // Convert value to string, handle special cases
      let valueText;
      if (value === null || value === undefined) {
        valueText = '';
      } else if (typeof value === 'object') {
        valueText = JSON.stringify(value).substring(0, 50);
        if (valueText.length === 50) valueText += '...';
      } else {
        valueText = value.toString().substring(0, 50);
        if (valueText.length === 50) valueText += '...';
      }
      
      // Draw value
      page.drawText(valueText, {
        x: margin + 150,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0)
      });
      
      y -= rowHeight;
    }
  }

  /**
   * Export data to JSON format
   * @param {Object} data - Data to export
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export result
   */
  async exportToJson(data, options = {}) {
    try {
      // Generate unique ID for this export
      const exportId = options.exportId || uuidv4();
      
      // Determine file name and path
      const fileName = options.fileName || `export-${exportId}.json`;
      const exportType = options.exportType || 'documents';
      const exportSubdir = path.join(this.options.exportDir, exportType);
      const filePath = path.join(exportSubdir, fileName);
      
      // Format JSON content
      const jsonContent = options.pretty !== false 
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
      
      // Write to file
      await writeFile(filePath, jsonContent, 'utf8');
      
      // Generate export record
      const exportRecord = {
        id: exportId,
        type: exportType,
        format: 'json',
        fileName,
        filePath,
        fileUrl: `/api/exports/download/${fileName}`,
        contentType: 'application/json',
        fileSize: (await stat(filePath)).size,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.options.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Add to history
      await this.addExportToHistory(exportRecord);
      
      return {
        success: true,
        ...exportRecord
      };
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      
      return {
        success: false,
        error: error.message,
        errorDetails: error.stack
      };
    }
  }

  /**
   * Export data to HTML format
   * @param {Object} data - Data to export
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export result
   */
  async exportToHtml(data, options = {}) {
    try {
      // Generate unique ID for this export
      const exportId = options.exportId || uuidv4();
      
      // Determine file name and path
      const fileName = options.fileName || `export-${exportId}.html`;
      const exportType = options.exportType || 'documents';
      const exportSubdir = path.join(this.options.exportDir, exportType);
      const filePath = path.join(exportSubdir, fileName);
      
      // Generate HTML content
      const title = options.title || 'Data Export';
      let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
      color: #2c3e50;
    }
    .date {
      color: #7f8c8d;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px 15px;
      border-bottom: 1px solid #ddd;
      text-align: left;
    }
    th {
      background-color: #f8f9fa;
      font-weight: bold;
    }
    tr:hover {
      background-color: #f1f1f1;
    }
    .object-view {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .property {
      margin-bottom: 10px;
    }
    .property-name {
      font-weight: bold;
      margin-right: 10px;
    }
    .property-value {
      word-break: break-word;
    }
    .footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      color: #7f8c8d;
      font-size: 12px;
    }
    @media print {
      body {
        padding: 0;
      }
      header, .footer {
        display: block !important;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>${title}</h1>
    <div class="date">Generated: ${new Date().toLocaleString()}</div>
  </header>
  <main>
`;

      // Generate content based on data type
      if (Array.isArray(data)) {
        // Generate table for array of objects
        if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
          const headers = Object.keys(data[0]);
          
          htmlContent += `
    <table>
      <thead>
        <tr>
${headers.map(header => `          <th>${header}</th>`).join('\n')}
        </tr>
      </thead>
      <tbody>
`;

          // Add rows
          for (const item of data) {
            htmlContent += '        <tr>\n';
            
            for (const header of headers) {
              let value = item[header];
              let displayValue;
              
              if (value === null || value === undefined) {
                displayValue = '';
              } else if (typeof value === 'object') {
                displayValue = JSON.stringify(value);
              } else {
                displayValue = String(value);
              }
              
              htmlContent += `          <td>${displayValue}</td>\n`;
            }
            
            htmlContent += '        </tr>\n';
          }
          
          htmlContent += `
      </tbody>
    </table>
`;
        } else {
          // Simple array
          htmlContent += `
    <div class="object-view">
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </div>
`;
        }
      } else if (typeof data === 'object' && data !== null) {
        // Generate property list for object
        htmlContent += `
    <div class="object-view">
`;
        
        for (const [key, value] of Object.entries(data)) {
          let displayValue;
          
          if (value === null || value === undefined) {
            displayValue = '';
          } else if (typeof value === 'object') {
            displayValue = JSON.stringify(value, null, 2);
          } else {
            displayValue = String(value);
          }
          
          htmlContent += `
      <div class="property">
        <span class="property-name">${key}:</span>
        <span class="property-value">${displayValue}</span>
      </div>
`;
        }
        
        htmlContent += `
    </div>
`;
      } else {
        // Simple value
        htmlContent += `
    <div class="object-view">
      <pre>${data}</pre>
    </div>
`;
      }
      
      // Add footer and close HTML
      htmlContent += `
  </main>
  <div class="footer">
    <p>This report was generated by FinDoc Analyzer</p>
  </div>
</body>
</html>
`;
      
      // Write to file
      await writeFile(filePath, htmlContent, 'utf8');
      
      // Generate export record
      const exportRecord = {
        id: exportId,
        type: exportType,
        format: 'html',
        fileName,
        filePath,
        fileUrl: `/api/exports/download/${fileName}`,
        contentType: 'text/html',
        fileSize: (await stat(filePath)).size,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.options.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Add to history
      await this.addExportToHistory(exportRecord);
      
      return {
        success: true,
        ...exportRecord
      };
    } catch (error) {
      console.error('Error exporting to HTML:', error);
      
      return {
        success: false,
        error: error.message,
        errorDetails: error.stack
      };
    }
  }

  /**
   * Export data based on format
   * @param {Object} data - Data to export
   * @param {string} format - Export format (csv, excel, pdf, json, html)
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export result
   */
  async exportData(data, format, options = {}) {
    try {
      // Validate format
      const validFormats = ['csv', 'excel', 'xlsx', 'pdf', 'json', 'html'];
      const normalizedFormat = format.toLowerCase();
      
      if (!validFormats.includes(normalizedFormat)) {
        throw new Error(`Unsupported export format: ${format}. Supported formats: ${validFormats.join(', ')}`);
      }
      
      // Export based on format
      switch (normalizedFormat) {
        case 'csv':
          return await this.exportToCsv(data, options);
        
        case 'excel':
        case 'xlsx':
          return await this.exportToExcel(data, options);
        
        case 'pdf':
          return await this.exportToPdf(data, options);
        
        case 'json':
          return await this.exportToJson(data, options);
        
        case 'html':
          return await this.exportToHtml(data, options);
        
        default:
          // Should never reach here due to validation above
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      
      // Always return a result object, even on error
      return {
        success: false,
        error: error.message,
        errorDetails: error.stack,
        format,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Export document
   * @param {Object} document - Document data
   * @param {string} format - Export format
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export result
   */
  async exportDocument(document, format, options = {}) {
    try {
      // Validate document data
      if (!document || typeof document !== 'object') {
        throw new Error('Invalid document data provided for export');
      }
      
      // Prepare export options
      const exportOptions = {
        ...options,
        exportType: 'documents',
        fileName: options.fileName || `document-export-${document.id || Date.now()}.${format}`,
        title: options.title || `Document Export: ${document.title || document.name || 'Untitled'}`
      };
      
      // Handle specific format pre-processing
      if (format === 'csv' || format === 'excel' || format === 'xlsx') {
        // For tabular formats, we need to flatten the document data
        const flattenedData = this.flattenDocumentData(document, options);
        return await this.exportData(flattenedData, format, exportOptions);
      }
      
      // For other formats, export the full document data
      return await this.exportData(document, format, exportOptions);
    } catch (error) {
      console.error('Error exporting document:', error);
      
      // Attempt to export as JSON as fallback
      try {
        console.log('Attempting fallback export as JSON');
        
        const fallbackOptions = {
          ...options,
          exportType: 'documents',
          fileName: options.fileName || `document-export-${document.id || Date.now()}-fallback.json`,
          title: options.title || `Document Export (Fallback): ${document.title || document.name || 'Untitled'}`
        };
        
        return await this.exportToJson(document, fallbackOptions);
      } catch (fallbackError) {
        console.error('Fallback export failed:', fallbackError);
        
        return {
          success: false,
          error: error.message,
          fallbackError: fallbackError.message,
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  /**
   * Flatten document data for tabular export formats
   * @param {Object} document - Document data
   * @param {Object} options - Export options
   * @returns {Array} - Flattened document data
   * @private
   */
  flattenDocumentData(document, options = {}) {
    // Create a flattened representation of the document
    const result = [];
    
    // Add main document information
    const mainData = {
      id: document.id,
      title: document.title || document.name || '',
      type: document.type || document.documentType || '',
      createdAt: document.createdAt || document.uploadDate || '',
      status: document.status || '',
    };
    
    // Add metadata if requested
    if (options.includeMetadata !== false && document.metadata) {
      for (const [key, value] of Object.entries(document.metadata)) {
        // Avoid overwriting existing fields
        if (!(key in mainData)) {
          mainData[`metadata_${key}`] = value;
        }
      }
    }
    
    // Add summary if available
    if (document.summary) {
      mainData.summary = document.summary;
    }
    
    // Add main document data
    result.push(mainData);
    
    // Add securities if available and requested
    if (options.includeSecurities !== false && document.securities && Array.isArray(document.securities) && document.securities.length > 0) {
      document.securities.forEach((security, index) => {
        result.push({
          ...mainData,
          dataType: 'security',
          securityIndex: index + 1,
          securityId: security.id,
          securityName: security.name,
          securityISIN: security.isin,
          securityTicker: security.ticker,
          securityQuantity: security.quantity || security.shares || security.amount,
          securityPrice: security.price,
          securityValue: security.value
        });
      });
    }
    
    // Add tables if available and requested
    if (options.includeTables !== false && document.tables && Array.isArray(document.tables) && document.tables.length > 0) {
      document.tables.forEach((table, tableIndex) => {
        // Add table header information
        result.push({
          ...mainData,
          dataType: 'table',
          tableIndex: tableIndex + 1,
          tableName: table.title || table.name || `Table ${tableIndex + 1}`,
          tableRowCount: table.rows ? table.rows.length : 0
        });
        
        // Add table rows if available
        if (table.rows && Array.isArray(table.rows) && table.rows.length > 0) {
          // Get headers
          const headers = table.headers || [];
          
          // Add rows
          table.rows.forEach((row, rowIndex) => {
            const rowData = {
              ...mainData,
              dataType: 'tableRow',
              tableIndex: tableIndex + 1,
              tableName: table.title || table.name || `Table ${tableIndex + 1}`,
              rowIndex: rowIndex + 1
            };
            
            // Add cell values
            if (Array.isArray(row)) {
              // Row is an array
              row.forEach((cell, cellIndex) => {
                const headerName = headers[cellIndex] || `Column ${cellIndex + 1}`;
                rowData[`cell_${headerName}`] = cell;
              });
            } else if (typeof row === 'object' && row !== null) {
              // Row is an object
              for (const [key, value] of Object.entries(row)) {
                rowData[`cell_${key}`] = value;
              }
            }
            
            result.push(rowData);
          });
        }
      });
    }
    
    return result;
  }

  /**
   * Export analytics data
   * @param {Object} analyticsData - Analytics data
   * @param {string} format - Export format
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export result
   */
  async exportAnalytics(analyticsData, format, options = {}) {
    try {
      // Validate analytics data
      if (!analyticsData || typeof analyticsData !== 'object') {
        throw new Error('Invalid analytics data provided for export');
      }
      
      // Prepare export options
      const exportOptions = {
        ...options,
        exportType: 'analytics',
        fileName: options.fileName || `analytics-export-${Date.now()}.${format}`,
        title: options.title || `Analytics Export (${new Date().toLocaleDateString()})`
      };
      
      // Handle specific format pre-processing
      if (format === 'csv' || format === 'excel' || format === 'xlsx') {
        // For tabular formats, we need to flatten the analytics data
        const flattenedData = this.flattenAnalyticsData(analyticsData, options);
        return await this.exportData(flattenedData, format, exportOptions);
      }
      
      // For other formats, export the full analytics data
      return await this.exportData(analyticsData, format, exportOptions);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      
      // Attempt to export as JSON as fallback
      try {
        console.log('Attempting fallback export as JSON');
        
        const fallbackOptions = {
          ...options,
          exportType: 'analytics',
          fileName: options.fileName || `analytics-export-${Date.now()}-fallback.json`,
          title: options.title || `Analytics Export (Fallback) (${new Date().toLocaleDateString()})`
        };
        
        return await this.exportToJson(analyticsData, fallbackOptions);
      } catch (fallbackError) {
        console.error('Fallback export failed:', fallbackError);
        
        return {
          success: false,
          error: error.message,
          fallbackError: fallbackError.message,
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  /**
   * Flatten analytics data for tabular export formats
   * @param {Object} analyticsData - Analytics data
   * @param {Object} options - Export options
   * @returns {Array} - Flattened analytics data
   * @private
   */
  flattenAnalyticsData(analyticsData, options = {}) {
    const result = [];
    
    // Process time series data (most common in analytics)
    for (const [metricName, metricData] of Object.entries(analyticsData)) {
      // Skip if not a valid metric object
      if (!metricData || typeof metricData !== 'object' || !metricData.data) continue;
      
      // Process time series data
      if (Array.isArray(metricData.data)) {
        metricData.data.forEach(dataPoint => {
          result.push({
            metric: metricName,
            date: dataPoint.date,
            value: dataPoint.value,
            ...dataPoint // Include any additional properties
          });
        });
      }
      
      // Process allocation data
      if (metricName.includes('allocation') && metricData.current && Array.isArray(metricData.current)) {
        metricData.current.forEach(allocation => {
          result.push({
            metric: metricName,
            category: 'current',
            name: allocation.name,
            value: allocation.value,
            ...allocation // Include any additional properties
          });
        });
      }
      
      // Process trend data
      if (metricData.trend && Array.isArray(metricData.trend)) {
        metricData.trend.forEach(trend => {
          result.push({
            metric: metricName,
            category: 'trend',
            date: trend.date,
            ...trend // Include all trend properties
          });
        });
      }
    }
    
    // If no time series data found, use a simple representation
    if (result.length === 0) {
      // Flatten object structure
      const flattenObject = (obj, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Recurse for nested objects
            flattenObject(value, `${prefix}${key}_`);
          } else if (Array.isArray(value)) {
            // Skip arrays - too complex to represent in a flat structure
            result.push({
              key: `${prefix}${key}`,
              value: `Array with ${value.length} items`
            });
          } else {
            // Add simple value
            result.push({
              key: `${prefix}${key}`,
              value
            });
          }
        }
      };
      
      flattenObject(analyticsData);
    }
    
    return result;
  }

  /**
   * Export portfolio data
   * @param {Object} portfolioData - Portfolio data
   * @param {string} format - Export format
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export result
   */
  async exportPortfolio(portfolioData, format, options = {}) {
    try {
      // Validate portfolio data
      if (!portfolioData || typeof portfolioData !== 'object') {
        throw new Error('Invalid portfolio data provided for export');
      }
      
      // Prepare export options
      const exportOptions = {
        ...options,
        exportType: 'portfolios',
        fileName: options.fileName || `portfolio-export-${portfolioData.id || Date.now()}.${format}`,
        title: options.title || `Portfolio Export: ${portfolioData.name || portfolioData.id || 'Untitled'}`
      };
      
      // For Excel format, create multiple sheets
      if (format === 'excel' || format === 'xlsx') {
        const sheets = [];
        
        // Summary sheet
        if (portfolioData.summary) {
          sheets.push({
            name: 'Summary',
            data: [this.flattenObject(portfolioData.summary)]
          });
        }
        
        // Holdings sheet
        if (portfolioData.holdings && Array.isArray(portfolioData.holdings)) {
          sheets.push({
            name: 'Holdings',
            data: portfolioData.holdings
          });
        }
        
        // Performance sheet
        if (portfolioData.performance && portfolioData.performance.history) {
          sheets.push({
            name: 'Performance',
            data: portfolioData.performance.history
          });
        }
        
        // Allocation sheet
        if (portfolioData.allocation) {
          const allocationData = [];
          
          // Asset allocation
          if (portfolioData.allocation.assetAllocation) {
            portfolioData.allocation.assetAllocation.forEach(item => {
              allocationData.push({
                type: 'Asset',
                ...item
              });
            });
          }
          
          // Sector allocation
          if (portfolioData.allocation.sectorAllocation) {
            portfolioData.allocation.sectorAllocation.forEach(item => {
              allocationData.push({
                type: 'Sector',
                ...item
              });
            });
          }
          
          // Geographic distribution
          if (portfolioData.allocation.geographicDistribution) {
            portfolioData.allocation.geographicDistribution.forEach(item => {
              allocationData.push({
                type: 'Geographic',
                ...item
              });
            });
          }
          
          if (allocationData.length > 0) {
            sheets.push({
              name: 'Allocation',
              data: allocationData
            });
          }
        }
        
        // Update export options with sheets
        exportOptions.sheets = sheets;
        
        return await this.exportToExcel(portfolioData, exportOptions);
      }
      
      // Handle specific format pre-processing for CSV
      if (format === 'csv') {
        // For CSV format, we need to flatten the portfolio data
        const flattenedData = this.flattenPortfolioData(portfolioData, options);
        return await this.exportData(flattenedData, format, exportOptions);
      }
      
      // For other formats, export the full portfolio data
      return await this.exportData(portfolioData, format, exportOptions);
    } catch (error) {
      console.error('Error exporting portfolio:', error);
      
      // Attempt to export as JSON as fallback
      try {
        console.log('Attempting fallback export as JSON');
        
        const fallbackOptions = {
          ...options,
          exportType: 'portfolios',
          fileName: options.fileName || `portfolio-export-${portfolioData.id || Date.now()}-fallback.json`,
          title: options.title || `Portfolio Export (Fallback): ${portfolioData.name || portfolioData.id || 'Untitled'}`
        };
        
        return await this.exportToJson(portfolioData, fallbackOptions);
      } catch (fallbackError) {
        console.error('Fallback export failed:', fallbackError);
        
        return {
          success: false,
          error: error.message,
          fallbackError: fallbackError.message,
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  /**
   * Flatten portfolio data for tabular export formats
   * @param {Object} portfolioData - Portfolio data
   * @param {Object} options - Export options
   * @returns {Array} - Flattened portfolio data
   * @private
   */
  flattenPortfolioData(portfolioData, options = {}) {
    const result = [];
    
    // Basic portfolio information
    const baseInfo = {
      id: portfolioData.id,
      name: portfolioData.name,
      currency: portfolioData.currency,
      createdAt: portfolioData.createdAt,
      updatedAt: portfolioData.updatedAt
    };
    
    // Add summary data if available
    if (portfolioData.summary) {
      result.push({
        ...baseInfo,
        dataType: 'summary',
        totalValue: portfolioData.summary.totalValue,
        cashValue: portfolioData.summary.cashValue,
        investedValue: portfolioData.summary.investedValue,
        ytdReturn: portfolioData.summary.yearToDateReturn,
        oneYearReturn: portfolioData.summary.oneYearReturn,
        threeYearReturn: portfolioData.summary.threeYearReturn,
        fiveYearReturn: portfolioData.summary.fiveYearReturn,
        riskLevel: portfolioData.summary.riskLevel,
        riskScore: portfolioData.summary.riskScore
      });
    }
    
    // Add holdings if available
    if (portfolioData.holdings && Array.isArray(portfolioData.holdings)) {
      portfolioData.holdings.forEach((holding, index) => {
        result.push({
          ...baseInfo,
          dataType: 'holding',
          holdingIndex: index + 1,
          securityName: holding.name,
          ticker: holding.ticker,
          isin: holding.isin,
          assetClass: holding.assetClass,
          sector: holding.sector,
          region: holding.region,
          shares: holding.shares,
          price: holding.price,
          value: holding.value,
          weight: holding.weight,
          costBasis: holding.costBasis,
          totalCost: holding.totalCost,
          unrealizedGain: holding.unrealizedGain,
          unrealizedGainPercent: holding.unrealizedGainPercent,
          yield: holding.yield
        });
      });
    }
    
    // Add performance history if available
    if (portfolioData.performance && portfolioData.performance.history && Array.isArray(portfolioData.performance.history)) {
      portfolioData.performance.history.forEach((dataPoint, index) => {
        result.push({
          ...baseInfo,
          dataType: 'performance',
          date: dataPoint.date,
          value: dataPoint.value
        });
      });
    }
    
    // Add allocation data if available
    if (portfolioData.allocation) {
      // Asset allocation
      if (portfolioData.allocation.assetAllocation && Array.isArray(portfolioData.allocation.assetAllocation)) {
        portfolioData.allocation.assetAllocation.forEach((allocation, index) => {
          result.push({
            ...baseInfo,
            dataType: 'allocation',
            allocationType: 'asset',
            name: allocation.name,
            value: allocation.value,
            color: allocation.color
          });
        });
      }
      
      // Sector allocation
      if (portfolioData.allocation.sectorAllocation && Array.isArray(portfolioData.allocation.sectorAllocation)) {
        portfolioData.allocation.sectorAllocation.forEach((allocation, index) => {
          result.push({
            ...baseInfo,
            dataType: 'allocation',
            allocationType: 'sector',
            name: allocation.name,
            value: allocation.value,
            color: allocation.color
          });
        });
      }
      
      // Geographic distribution
      if (portfolioData.allocation.geographicDistribution && Array.isArray(portfolioData.allocation.geographicDistribution)) {
        portfolioData.allocation.geographicDistribution.forEach((allocation, index) => {
          result.push({
            ...baseInfo,
            dataType: 'allocation',
            allocationType: 'geographic',
            name: allocation.name,
            value: allocation.value,
            color: allocation.color
          });
        });
      }
    }
    
    return result;
  }

  /**
   * Flatten object (utility function)
   * @param {Object} obj - Object to flatten
   * @param {string} prefix - Prefix for nested keys
   * @returns {Object} - Flattened object
   * @private
   */
  flattenObject(obj, prefix = '') {
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recurse for nested objects
        const nestedObj = this.flattenObject(value, `${prefix}${key}_`);
        Object.assign(result, nestedObj);
      } else {
        // Add simple value
        result[`${prefix}${key}`] = value;
      }
    }
    
    return result;
  }

  /**
   * Schedule an export
   * @param {Object} exportConfig - Export configuration
   * @param {string} exportConfig.type - Export type (document, analytics, portfolio)
   * @param {string} exportConfig.id - ID of the item to export
   * @param {string} exportConfig.format - Export format
   * @param {Object} exportConfig.options - Export options
   * @param {string} exportConfig.schedule - Schedule type (daily, weekly, monthly)
   * @returns {Promise<Object>} - Schedule result
   */
  async scheduleExport(exportConfig) {
    try {
      // Validate configuration
      if (!exportConfig || !exportConfig.type || !exportConfig.format) {
        throw new Error('Invalid export configuration');
      }
      
      // Generate schedule ID
      const scheduleId = uuidv4();
      
      // Determine next execution time
      let nextExecution;
      const now = new Date();
      
      switch (exportConfig.schedule) {
        case 'daily':
          // Schedule for tomorrow, same time
          nextExecution = new Date(now);
          nextExecution.setDate(nextExecution.getDate() + 1);
          break;
          
        case 'weekly':
          // Schedule for next week, same day and time
          nextExecution = new Date(now);
          nextExecution.setDate(nextExecution.getDate() + 7);
          break;
          
        case 'monthly':
          // Schedule for next month, same day and time
          nextExecution = new Date(now);
          nextExecution.setMonth(nextExecution.getMonth() + 1);
          break;
          
        default:
          // Default to tomorrow
          nextExecution = new Date(now);
          nextExecution.setDate(nextExecution.getDate() + 1);
      }
      
      // Create schedule record
      const scheduleRecord = {
        id: scheduleId,
        type: 'schedule',
        exportConfig: {
          ...exportConfig,
          id: exportConfig.id || 'default'
        },
        nextExecution: nextExecution.toISOString(),
        status: 'scheduled',
        createdAt: now.toISOString()
      };
      
      // Add to export history
      await this.addExportToHistory(scheduleRecord);
      
      return {
        success: true,
        schedule: scheduleRecord
      };
    } catch (error) {
      console.error('Error scheduling export:', error);
      
      return {
        success: false,
        error: error.message,
        errorDetails: error.stack
      };
    }
  }

  /**
   * Get scheduled exports
   * @returns {Promise<Array>} - Scheduled exports
   */
  async getScheduledExports() {
    try {
      // Get export history
      const history = await this.getExportHistory();
      
      // Filter scheduled exports
      return history.filter(record => record.type === 'schedule' && record.status === 'scheduled');
    } catch (error) {
      console.error('Error getting scheduled exports:', error);
      return [];
    }
  }

  /**
   * Execute scheduled exports
   * @returns {Promise<Object>} - Execution results
   */
  async executeScheduledExports() {
    try {
      // Get scheduled exports
      const scheduledExports = await this.getScheduledExports();
      
      // Find exports due for execution
      const now = new Date();
      const dueExports = scheduledExports.filter(record => {
        if (!record.nextExecution) return false;
        
        const executionTime = new Date(record.nextExecution);
        return executionTime <= now;
      });
      
      // Execute each due export
      const results = {
        success: true,
        executed: [],
        failed: [],
        next: []
      };
      
      for (const scheduleRecord of dueExports) {
        try {
          // Extract export configuration
          const { exportConfig } = scheduleRecord;
          
          // Execute export based on type
          let exportResult;
          switch (exportConfig.type) {
            case 'document':
              // Get document data (would need implementation)
              // const document = await documentService.getDocument(exportConfig.id);
              // exportResult = await this.exportDocument(document, exportConfig.format, exportConfig.options);
              exportResult = { success: false, error: 'Document export not implemented for scheduled exports' };
              break;
              
            case 'analytics':
              // Generate analytics data (would need implementation)
              // const analyticsData = await analyticsService.generateData(exportConfig.metrics, exportConfig.timeRange);
              // exportResult = await this.exportAnalytics(analyticsData, exportConfig.format, exportConfig.options);
              exportResult = { success: false, error: 'Analytics export not implemented for scheduled exports' };
              break;
              
            case 'portfolio':
              // Get portfolio data (would need implementation)
              // const portfolioData = await portfolioService.getPortfolio(exportConfig.id);
              // exportResult = await this.exportPortfolio(portfolioData, exportConfig.format, exportConfig.options);
              exportResult = { success: false, error: 'Portfolio export not implemented for scheduled exports' };
              break;
              
            default:
              exportResult = { success: false, error: `Unknown export type: ${exportConfig.type}` };
          }
          
          // Update schedule record
          const updatedRecord = { ...scheduleRecord };
          
          if (exportResult.success) {
            // Update schedule for next execution
            const nextExecution = new Date();
            switch (exportConfig.schedule) {
              case 'daily':
                nextExecution.setDate(nextExecution.getDate() + 1);
                break;
              case 'weekly':
                nextExecution.setDate(nextExecution.getDate() + 7);
                break;
              case 'monthly':
                nextExecution.setMonth(nextExecution.getMonth() + 1);
                break;
            }
            
            updatedRecord.lastExecution = now.toISOString();
            updatedRecord.nextExecution = nextExecution.toISOString();
            updatedRecord.lastResult = {
              success: true,
              exportId: exportResult.id,
              fileName: exportResult.fileName,
              fileUrl: exportResult.fileUrl
            };
            
            results.executed.push(updatedRecord);
          } else {
            // Update with error
            updatedRecord.lastExecution = now.toISOString();
            updatedRecord.lastResult = {
              success: false,
              error: exportResult.error
            };
            
            results.failed.push(updatedRecord);
          }
          
          // Update history
          await this.addExportToHistory(updatedRecord);
        } catch (error) {
          console.error(`Error executing scheduled export ${scheduleRecord.id}:`, error);
          results.failed.push({
            ...scheduleRecord,
            error: error.message
          });
        }
      }
      
      // Find next scheduled exports
      const nextScheduled = scheduledExports
        .filter(record => !dueExports.includes(record))
        .sort((a, b) => new Date(a.nextExecution) - new Date(b.nextExecution))
        .slice(0, 5); // Get top 5
      
      results.next = nextScheduled;
      
      return results;
    } catch (error) {
      console.error('Error executing scheduled exports:', error);
      
      return {
        success: false,
        error: error.message,
        errorDetails: error.stack
      };
    }
  }
}

module.exports = ComprehensiveExportService;