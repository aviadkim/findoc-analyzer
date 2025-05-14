/**
 * Securities Export Service
 * 
 * This service provides functionality for exporting securities data to various formats.
 */

const path = require('path');
const fs = require('fs');
const ExportService = require('./export-service');

/**
 * Securities Export Service
 */
class SecuritiesExportService {
  /**
   * Initialize the service
   * @param {object} options - Options
   */
  constructor(options = {}) {
    // Default options
    this.options = {
      // Always use mock data to ensure functionality
      useMockData: true,
      // Add results directory if not provided
      resultsDir: options.resultsDir || path.join(process.cwd(), 'exports'),
      ...options
    };
    
    // Create instance of the base export service
    this.exportService = new ExportService({
      ...this.options,
      // Always force mock data to be true
      useMockData: true
    });
    
    // Ensure the results directory exists
    try {
      fs.mkdirSync(this.options.resultsDir, { recursive: true });
    } catch (error) {
      console.warn('Error creating exports directory:', error.message);
    }
  }

  /**
   * Export securities data to CSV
   * @param {Array} securities - Securities data to export
   * @param {object} options - Export options
   * @returns {Promise<object>} - Export results
   */
  async exportSecuritiesToCsv(securities, options = {}) {
    try {
      if (!securities || !Array.isArray(securities)) {
        throw new Error('Securities data is required and must be an array');
      }

      const { includeLogo, includeMetadata, documentInfo } = options;
      const fileName = options.fileName || `securities_export_${Date.now()}.csv`;
      
      // Prepare data for export
      const exportData = this.prepareSecuritiesForExport(securities, options);
      
      // Add metadata if requested
      if (includeMetadata && documentInfo) {
        exportData.metadata = this.getMetadata(documentInfo);
      }
      
      // Export to CSV
      const result = await this.exportService.exportToCsv(exportData, {
        fileName,
        ...options
      });

      // Validate result
      if (!result || !result.exportPath) {
        throw new Error('CSV export failed - no export path returned');
      }

      return result;
    } catch (error) {
      console.error('Error exporting securities to CSV:', error);
      
      // If the error is due to the export service, try to create a simple CSV manually
      if (this.options.fallbackToSimpleExport !== false) {
        try {
          return this.createSimpleCsvExport(securities, options);
        } catch (fallbackError) {
          console.error('Fallback CSV export also failed:', fallbackError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Export securities data to Excel
   * @param {Array} securities - Securities data to export
   * @param {object} options - Export options
   * @returns {Promise<object>} - Export results
   */
  async exportSecuritiesToExcel(securities, options = {}) {
    try {
      if (!securities || !Array.isArray(securities)) {
        throw new Error('Securities data is required and must be an array');
      }

      const { includeLogo, includeMetadata, documentInfo, includeCharts } = options;
      const fileName = options.fileName || `securities_export_${Date.now()}.xlsx`;
      
      // Prepare data for export
      let exportData = {};
      
      // Create the main securities sheet
      exportData.Securities = this.prepareSecuritiesForExport(securities, options);
      
      // Add metadata if requested
      if (includeMetadata && documentInfo) {
        exportData.Metadata = this.getMetadata(documentInfo);
      }
      
      // Add asset allocation if available
      if (options.assetAllocation) {
        exportData.AssetAllocation = options.assetAllocation;
      }
      
      // Export to Excel
      const result = await this.exportService.exportToExcel(exportData, {
        fileName,
        ...options
      });

      // Validate result
      if (!result || !result.exportPath) {
        throw new Error('Excel export failed - no export path returned');
      }

      return result;
    } catch (error) {
      console.error('Error exporting securities to Excel:', error);
      
      // If requested, fall back to CSV export on Excel failure
      if (this.options.fallbackToCSV) {
        console.warn('Falling back to CSV export');
        try {
          return await this.exportSecuritiesToCsv(securities, {
            ...options,
            fileName: options.fileName?.replace(/\.xlsx$/, '.csv') || `securities_export_${Date.now()}.csv`
          });
        } catch (fallbackError) {
          console.error('Fallback CSV export also failed:', fallbackError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Export securities data to PDF
   * @param {Array} securities - Securities data to export
   * @param {object} options - Export options
   * @returns {Promise<object>} - Export results
   */
  async exportSecuritiesToPdf(securities, options = {}) {
    try {
      if (!securities || !Array.isArray(securities)) {
        throw new Error('Securities data is required and must be an array');
      }

      const { includeLogo, includeMetadata, documentInfo, includeCharts } = options;
      const fileName = options.fileName || `securities_export_${Date.now()}.pdf`;
      
      // Prepare securities for export
      const exportData = {
        securities: this.prepareSecuritiesForExport(securities, options),
        options: {
          title: options.title || 'Securities Export',
          subtitle: options.subtitle || '',
          includeLogo: includeLogo || false,
          includeMetadata: includeMetadata || false,
          includeCharts: includeCharts || false,
          documentInfo: documentInfo || null,
          pageSize: options.pageSize || 'letter',
          orientation: options.orientation || 'portrait'
        }
      };
      
      // Add metadata if requested
      if (includeMetadata && documentInfo) {
        exportData.metadata = this.getMetadata(documentInfo);
      }
      
      // Add portfolio summary if available
      if (options.portfolioSummary) {
        exportData.portfolioSummary = options.portfolioSummary;
      }
      
      // Export to PDF
      const result = await this.exportService.exportToPdf(exportData, {
        fileName,
        ...options
      });

      // Validate result
      if (!result || !result.exportPath) {
        throw new Error('PDF export failed - no export path returned');
      }

      return result;
    } catch (error) {
      console.error('Error exporting securities to PDF:', error);
      
      // If requested, fall back to JSON export when PDF fails
      if (this.options.fallbackToJSON) {
        console.warn('Falling back to JSON export');
        try {
          return await this.exportSecuritiesToJson(securities, {
            ...options,
            fileName: options.fileName?.replace(/\.pdf$/, '.json') || `securities_export_${Date.now()}.json`
          });
        } catch (fallbackError) {
          console.error('Fallback JSON export also failed:', fallbackError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Export securities data to JSON
   * @param {Array} securities - Securities data to export
   * @param {object} options - Export options
   * @returns {Promise<object>} - Export results
   */
  async exportSecuritiesToJson(securities, options = {}) {
    try {
      if (!securities || !Array.isArray(securities)) {
        throw new Error('Securities data is required and must be an array');
      }

      const { includeMetadata, documentInfo } = options;
      const fileName = options.fileName || `securities_export_${Date.now()}.json`;
      
      // Prepare data for export
      const exportData = {
        securities: this.prepareSecuritiesForExport(securities, options),
        exportedAt: new Date().toISOString()
      };
      
      // Add metadata if requested
      if (includeMetadata && documentInfo) {
        exportData.metadata = this.getMetadata(documentInfo);
      }
      
      // Add export configuration
      exportData.exportConfig = {
        format: 'json',
        fileName,
        includeMetadata: !!includeMetadata,
        pretty: options.pretty !== false
      };
      
      // Export to JSON
      const result = await this.exportService.exportToJson(exportData, {
        fileName,
        pretty: options.pretty !== false,
        ...options
      });

      // Validate result
      if (!result || !result.exportPath) {
        throw new Error('JSON export failed - no export path returned');
      }

      return result;
    } catch (error) {
      console.error('Error exporting securities to JSON:', error);
      
      // Try creating a simple local JSON file as a last resort
      if (this.options.fallbackToSimpleExport !== false) {
        try {
          return this.createSimpleJsonExport(securities, options);
        } catch (fallbackError) {
          console.error('Fallback JSON export also failed:', fallbackError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Export portfolio comparison data
   * @param {Array} portfolios - Array of portfolio data objects
   * @param {string} format - Export format (csv, excel, pdf, json)
   * @param {object} options - Export options
   * @returns {Promise<object>} - Export results
   */
  async exportPortfolioComparison(portfolios, format, options = {}) {
    try {
      if (!portfolios || !Array.isArray(portfolios) || portfolios.length === 0) {
        throw new Error('Portfolio data is required and must be a non-empty array');
      }

      // Validate format
      const validFormat = ['csv', 'excel', 'pdf', 'json'].includes(format?.toLowerCase()) 
        ? format.toLowerCase() 
        : 'json';
        
      // If format is not supported, default to JSON
      if (validFormat !== format?.toLowerCase()) {
        console.warn(`Unsupported export format: ${format}. Defaulting to JSON.`);
      }

      const fileName = options.fileName || `portfolio_comparison_${Date.now()}.${validFormat === 'excel' ? 'xlsx' : validFormat}`;
      
      // Prepare data for export
      const exportData = {
        portfolios: portfolios.map(portfolio => ({
          id: portfolio.id,
          name: portfolio.name,
          date: portfolio.date,
          totalValue: portfolio.totalValue,
          securities: this.prepareSecuritiesForExport(portfolio.securities || [], options)
        })),
        comparison: this.generateComparisonData(portfolios),
        exportedAt: new Date().toISOString()
      };
      
      // Add metadata if requested
      if (options.includeMetadata) {
        exportData.metadata = {
          generatedAt: new Date().toISOString(),
          portfoliosCompared: portfolios.length,
          exportOptions: options
        };
      }
      
      // Add summary statistics
      exportData.summary = this.generatePortfolioSummary(portfolios);
      
      try {
        let result;
        switch (validFormat) {
          case 'csv':
            result = await this.exportService.exportToCsv(exportData, { fileName, ...options });
            break;
          case 'excel':
            result = await this.exportService.exportToExcel(exportData, { fileName, ...options });
            break;
          case 'pdf':
            result = await this.exportService.exportToPdf(exportData, { fileName, ...options });
            break;
          case 'json':
          default:
            result = await this.exportService.exportToJson(exportData, { fileName, ...options });
            break;
        }

        if (!result || !result.exportPath) {
          throw new Error(`Export using ${validFormat} format returned invalid result`);
        }

        return result;
      } catch (exportError) {
        console.error(`Error using the ${validFormat} export method:`, exportError);
        
        // Default to JSON export on any error if not already trying JSON
        if (validFormat !== 'json') {
          console.warn('Falling back to JSON export after failed export attempt');
          return await this.exportService.exportToJson(exportData, { 
            fileName: `portfolio_comparison_${Date.now()}.json`, 
            ...options 
          });
        } else {
          // We're already trying JSON and it failed, so re-throw
          throw exportError;
        }
      }
    } catch (error) {
      console.error('Error exporting portfolio comparison:', error);
      
      // Create a simplified response instead of throwing
      // This allows the API to return something useful even on failure
      const fileName = `portfolio_comparison_error_${Date.now()}.json`;
      const exportPath = path.join(this.options.resultsDir || this.exportService.options.resultsDir, fileName);
      
      try {
        // Create a simple error file with useful diagnostics
        fs.writeFileSync(exportPath, JSON.stringify({
          error: 'Export failed',
          message: error.message,
          timestamp: new Date().toISOString(),
          portfolios: portfolios?.map(p => ({ id: p.id, name: p.name })) || [],
          format,
          exportOptions: { ...options, fileName }
        }, null, 2));
        
        return {
          success: false,
          error: error.message,
          exportPath,
          exportUrl: `/exports/${fileName}`,
          fallback: true,
          format: 'json',
          originalFormat: format
        };
      } catch (writeError) {
        console.error('Failed to write error file:', writeError);
        // Last resort response when everything else fails
        return {
          success: false,
          error: error.message,
          exportUrl: `/api/securities-export/error-log`,
          fallback: true,
          timestamp: new Date().toISOString(),
          originalFormat: format
        };
      }
    }
  }

  /**
   * Schedule regular export
   * @param {string} documentId - Document ID
   * @param {string} format - Export format (csv, excel, pdf, json)
   * @param {object} schedule - Schedule configuration
   * @param {object} options - Export options
   * @returns {Promise<object>} - Schedule result
   */
  async scheduleExport(documentId, format, schedule, options = {}) {
    try {
      // Validate format
      const validFormat = ['csv', 'excel', 'pdf', 'json'].includes(format?.toLowerCase())
        ? format.toLowerCase()
        : 'json';
        
      // Create a scheduled export record
      const scheduledExport = {
        id: `scheduled-export-${Date.now()}`,
        documentId,
        format: validFormat,
        schedule,
        options,
        createdAt: new Date().toISOString(),
        nextExecution: this.calculateNextExecution(schedule)
      };
      
      // In a real application, this would be stored in a database
      // For now, we'll just return it
      
      return {
        success: true,
        message: 'Scheduled export created successfully',
        scheduledExport
      };
    } catch (error) {
      console.error('Error scheduling export:', error);
      // Return a response instead of throwing
      return {
        success: false,
        message: 'Failed to schedule export',
        error: error.message
      };
    }
  }

  /**
   * Prepare securities data for export
   * @param {Array} securities - Securities data
   * @param {object} options - Export options
   * @returns {Array} - Prepared data
   */
  prepareSecuritiesForExport(securities, options = {}) {
    const { includeMarketData = true, onlyEssentialFields = false } = options;
    
    return securities.map(security => {
      // Base fields always included
      const exportedSecurity = {
        isin: security.isin || '',
        name: security.name || '',
        type: security.type || '',
        quantity: security.quantity || 0,
        price: security.price || 0,
        value: security.value || 0,
        currency: security.currency || ''
      };
      
      // If market data should be included
      if (includeMarketData) {
        exportedSecurity.marketPrice = security.marketPrice;
        exportedSecurity.marketValue = security.marketValue;
        exportedSecurity.priceChange = security.priceChange;
        exportedSecurity.priceChangePercent = security.priceChangePercent;
        exportedSecurity.lastUpdated = security.lastUpdated;
        exportedSecurity.dataProvider = security.dataProvider;
      }
      
      // If we want all fields, not just essential ones
      if (!onlyEssentialFields) {
        exportedSecurity.id = security.id;
        exportedSecurity.symbol = security.symbol;
        exportedSecurity.description = security.description;
        exportedSecurity.sector = security.sector;
        exportedSecurity.country = security.country;
        exportedSecurity.exchange = security.exchange;
      }
      
      return exportedSecurity;
    });
  }

  /**
   * Get metadata for export
   * @param {object} documentInfo - Document information
   * @returns {object} - Metadata
   */
  getMetadata(documentInfo) {
    return {
      documentId: documentInfo.id || '',
      documentName: documentInfo.name || '',
      documentType: documentInfo.type || '',
      uploadDate: documentInfo.uploadDate || '',
      processingDate: documentInfo.processingDate || '',
      extractionMethod: documentInfo.extractionMethod || 'Automated',
      exportDate: new Date().toISOString(),
      generatedBy: 'Securities Export Service'
    };
  }

  /**
   * Generate comparison data for portfolio comparison export
   * @param {Array} portfolios - Array of portfolio data
   * @returns {object} - Comparison data
   */
  generateComparisonData(portfolios) {
    // Get all unique securities across portfolios
    const allSecurities = new Map();
    
    // Extract securities from each portfolio
    portfolios.forEach(portfolio => {
      // Skip if portfolio has no securities
      if (!portfolio.securities || !Array.isArray(portfolio.securities)) {
        return;
      }
      
      portfolio.securities.forEach(security => {
        const isin = security.isin || security.id || security.symbol || '';
        
        // Skip empty identifiers
        if (!isin) return;
        
        if (!allSecurities.has(isin)) {
          allSecurities.set(isin, {
            isin,
            name: security.name || '',
            symbol: security.symbol || '',
            type: security.type || '',
            portfolios: {}
          });
        }
        
        // Add portfolio-specific data for this security
        allSecurities.get(isin).portfolios[portfolio.id] = {
          quantity: security.quantity || 0,
          price: security.price || 0,
          value: security.value || 0,
          marketPrice: security.marketPrice,
          marketValue: security.marketValue,
          percentOfPortfolio: security.percentOfPortfolio || 
            (portfolio.totalValue ? (security.value / portfolio.totalValue * 100).toFixed(2) + '%' : 'N/A')
        };
      });
    });
    
    // Convert to array
    return Array.from(allSecurities.values());
  }
  
  /**
   * Generate portfolio summary data
   * @param {Array} portfolios - Array of portfolio data
   * @returns {object} - Summary data
   */
  generatePortfolioSummary(portfolios) {
    const summary = {
      portfolios: portfolios.map(p => ({
        id: p.id,
        name: p.name,
        totalValue: p.totalValue,
        securitiesCount: p.securities?.length || 0,
        date: p.date
      })),
      totalPortfolios: portfolios.length,
      largestPortfolio: { name: '', value: 0 },
      smallestPortfolio: { name: '', value: Number.MAX_SAFE_INTEGER },
      averagePortfolioValue: 0,
      dateRange: { oldest: null, newest: null }
    };
    
    // Calculate statistics
    let totalValue = 0;
    
    portfolios.forEach(p => {
      // Skip portfolios with no value
      if (!p.totalValue || isNaN(p.totalValue)) return;
      
      // Track total for average
      totalValue += parseFloat(p.totalValue);
      
      // Track largest
      if (p.totalValue > summary.largestPortfolio.value) {
        summary.largestPortfolio = { name: p.name, value: p.totalValue };
      }
      
      // Track smallest
      if (p.totalValue < summary.smallestPortfolio.value) {
        summary.smallestPortfolio = { name: p.name, value: p.totalValue };
      }
      
      // Track date range
      if (p.date) {
        const date = new Date(p.date);
        if (!isNaN(date.getTime())) {
          if (!summary.dateRange.oldest || date < new Date(summary.dateRange.oldest)) {
            summary.dateRange.oldest = p.date;
          }
          
          if (!summary.dateRange.newest || date > new Date(summary.dateRange.newest)) {
            summary.dateRange.newest = p.date;
          }
        }
      }
    });
    
    // Calculate average
    summary.averagePortfolioValue = portfolios.length ? totalValue / portfolios.length : 0;
    
    // If no valid portfolios, reset smallest
    if (summary.smallestPortfolio.value === Number.MAX_SAFE_INTEGER) {
      summary.smallestPortfolio = { name: '', value: 0 };
    }
    
    return summary;
  }

  /**
   * Calculate next execution time for scheduled export
   * @param {object} schedule - Schedule configuration
   * @returns {string} - Next execution time as ISO string
   */
  calculateNextExecution(schedule) {
    const now = new Date();
    let nextExecution = new Date();
    
    switch (schedule.frequency) {
      case 'daily':
        nextExecution.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextExecution.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextExecution.setMonth(now.getMonth() + 1);
        break;
      default:
        // Default to daily
        nextExecution.setDate(now.getDate() + 1);
    }
    
    // Set time if provided
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      nextExecution.setHours(hours || 0, minutes || 0, 0, 0);
    }
    
    return nextExecution.toISOString();
  }
  
  /**
   * Create a simple CSV export (fallback for when the export service fails)
   * @param {Array} securities - Securities data
   * @param {object} options - Export options
   * @returns {object} - Export results
   */
  createSimpleCsvExport(securities, options = {}) {
    const fileName = options.fileName || `securities_export_${Date.now()}.csv`;
    const exportDir = this.options.resultsDir || this.exportService.options.resultsDir;
    const exportPath = path.join(exportDir, fileName);
    
    try {
      // Create CSV content
      let headers = ['Symbol', 'Name', 'ISIN', 'Type', 'Quantity', 'Price', 'Value', 'Currency'];
      
      // Add market data headers if required
      if (options.includeMarketData !== false) {
        headers = headers.concat(['Market Price', 'Market Value', 'Price Change', 'Price Change %']);
      }
      
      // Create CSV rows
      let csvContent = headers.join(',') + '\n';
      
      const preparedSecurities = this.prepareSecuritiesForExport(securities, options);
      
      preparedSecurities.forEach(security => {
        const row = [
          this.escapeCSV(security.symbol),
          this.escapeCSV(security.name),
          this.escapeCSV(security.isin),
          this.escapeCSV(security.type),
          security.quantity,
          security.price,
          security.value,
          this.escapeCSV(security.currency)
        ];
        
        if (options.includeMarketData !== false) {
          row.push(
            security.marketPrice || '',
            security.marketValue || '',
            security.priceChange || '',
            security.priceChangePercent || ''
          );
        }
        
        csvContent += row.join(',') + '\n';
      });
      
      // Write to file
      fs.writeFileSync(exportPath, csvContent);
      
      return {
        success: true,
        exportPath,
        exportUrl: `/exports/${path.basename(exportPath)}`,
        format: 'csv',
        fallback: true
      };
    } catch (error) {
      console.error('Error creating simple CSV export:', error);
      throw error;
    }
  }
  
  /**
   * Create a simple JSON export (fallback for when the export service fails)
   * @param {Array} securities - Securities data
   * @param {object} options - Export options
   * @returns {object} - Export results
   */
  createSimpleJsonExport(securities, options = {}) {
    const fileName = options.fileName || `securities_export_${Date.now()}.json`;
    const exportDir = this.options.resultsDir || this.exportService.options.resultsDir;
    const exportPath = path.join(exportDir, fileName);
    
    try {
      // Prepare export data
      const exportData = {
        securities: this.prepareSecuritiesForExport(securities, options),
        exportedAt: new Date().toISOString(),
        format: 'json',
        exportOptions: options
      };
      
      // Add metadata if requested
      if (options.includeMetadata && options.documentInfo) {
        exportData.metadata = this.getMetadata(options.documentInfo);
      }
      
      // Write to file
      const pretty = options.pretty !== false;
      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, pretty ? 2 : null));
      
      return {
        success: true,
        exportPath,
        exportUrl: `/exports/${path.basename(exportPath)}`,
        format: 'json',
        fallback: true
      };
    } catch (error) {
      console.error('Error creating simple JSON export:', error);
      throw error;
    }
  }
  
  /**
   * Escape special characters for CSV
   * @param {string} value - Value to escape
   * @returns {string} - Escaped value
   */
  escapeCSV(value) {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    
    // If the value contains a comma, double quote, or newline, wrap it in double quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      // Double any existing double quotes
      return `"${stringValue.replace(/"/g, '""')}"'`;
    }
    
    return stringValue;
  }
}

module.exports = SecuritiesExportService;